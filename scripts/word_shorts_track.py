#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
단어 쇼츠용 한국어 음성 트랙 생성

단어 10개 × 3초 슬롯. 슬롯마다 같은 단어를 두 번 읽는다(0.0s / 1.5s).
최종 결과물은 정확히 30.000초 MP3 한 개. 캔바 페이지가 3초씩이므로
파일 하나만 얹으면 타이밍이 그대로 맞는다.

슬롯 길이 3초는 절대 바꾸지 않는다. 단어가 길어 2회차가 슬롯을 넘치면
그 단어만 atempo(최대 1.10)로 살짝 줄이고, 그래도 모자라면 2회차 시작을
앞당겨 3초 안에 넣는다.

필요: python 3.10+, openai, ffmpeg(PATH)
키:   환경변수 OPENAI_API_KEY (없으면 patto/.env.local 에서 읽는다)

사용:
  python scripts/word_shorts_track.py --set cafe
  python scripts/word_shorts_track.py --set cafe --force     # 캐시 무시하고 재호출
"""
from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    except Exception:
        pass

SLOT = 3.0          # 슬롯 길이 — 바꾸지 않는다
SECOND_AT = 1.5     # 2회차 기본 시작 시각
MAX_TEMPO = 1.10    # 속도 보정 상한
MODEL = "gpt-4o-mini-tts"
VOICE = "nova"
BITRATE = "192k"
LOUDNORM = "loudnorm=I=-16:TP=-1.5:LRA=11"

INSTRUCTIONS = """Speak this Korean word clearly and slowly, as a pronunciation
model for a language learner. Natural Korean pronunciation,
neutral tone, no English accent. Do not add any other words."""

# 세트 정의 — 순서가 화면과 맞물리므로 바꾸지 않는다
WORD_SETS: dict[str, list[str]] = {
    "cafe": ["커피", "아메리카노", "라떼", "아이스", "따뜻한",
             "얼음", "빨대", "케이크", "포장", "여기서"],
    "cvs":  ["편의점", "삼각김밥", "컵라면", "봉투", "계산",
             "카드", "현금", "영수증", "물", "음료수"],
}
SET_PREFIX = {"cafe": "01-cafe", "cvs": "10-convenience-store"}


def load_api_key() -> str:
    key = os.environ.get("OPENAI_API_KEY")
    if key:
        return key
    for c in (Path.cwd() / ".env.local", Path(__file__).resolve().parent.parent / ".env.local"):
        if c.exists():
            for line in c.read_text(encoding="utf-8").splitlines():
                m = re.match(r"^\s*OPENAI_API_KEY\s*=\s*(.+?)\s*$", line)
                if m:
                    return m.group(1).strip().strip('"').strip("'")
    raise SystemExit("OPENAI_API_KEY 를 찾을 수 없습니다 (환경변수 또는 .env.local)")


def leading_silence(path: Path, thresh: float = 0.01) -> float:
    """
    파일 앞쪽 무음 길이(초). TTS mp3는 앞에 최대 0.5초까지 무음이 붙어 오는데,
    그대로 두면 1회차 발화가 슬롯 시작보다 늦게 들어가 화면과 어긋난다.
    """
    import numpy as np
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "44100", "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    a = np.frombuffer(raw, dtype="<f4")
    if a.size == 0:
        return 0.0
    idx = np.where(np.abs(a) > thresh)[0]
    if idx.size == 0:
        return 0.0
    return max(0.0, idx[0] / 44100.0 - 0.02)   # 20ms 여유를 남긴다


def ffprobe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def main() -> None:
    ap = argparse.ArgumentParser(description="단어 쇼츠용 한국어 음성 트랙 생성")
    ap.add_argument("--set", default="cafe", choices=sorted(WORD_SETS), help="단어 세트")
    ap.add_argument("--out", default="out/audio", help="출력 폴더")
    ap.add_argument("--voice", default=VOICE)
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--force", action="store_true", help="캐시 무시하고 TTS 재호출")
    ap.add_argument("--first", type=float, default=0.0, help="1회차 시작 시각(슬롯 기준)")
    ap.add_argument("--second", type=float, default=SECOND_AT, help="2회차 시작 시각(슬롯 기준)")
    args = ap.parse_args()

    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        raise SystemExit("ffmpeg / ffprobe 를 PATH에서 찾을 수 없습니다.")

    words = WORD_SETS[args.set]
    prefix = SET_PREFIX[args.set]
    out_dir = Path(args.out)
    words_dir = out_dir / "words"
    words_dir.mkdir(parents=True, exist_ok=True)
    tmp_dir = out_dir / ".tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    client = None
    api_calls = 0

    def get_client():
        nonlocal client
        if client is None:
            from openai import OpenAI
            client = OpenAI(api_key=load_api_key())
        return client

    # ── 1단계 — 단어별 음성 생성 ─────────────────────────────────────────────
    print(f"[1] 단어별 TTS — {args.model} / {args.voice} / mp3")
    word_files: list[Path] = []
    for i, w in enumerate(words, start=1):
        dst = words_dir / f"{prefix}-{i:02d}-{w}.mp3"
        if dst.exists() and not args.force:
            print(f"    [{i:02d}] {w:<6} 캐시 사용  {ffprobe_duration(dst):.2f}초")
        else:
            with get_client().audio.speech.with_streaming_response.create(
                model=args.model, voice=args.voice, input=w,
                instructions=INSTRUCTIONS, response_format="mp3",
            ) as resp:
                resp.stream_to_file(str(dst))
            api_calls += 1
            if dst.stat().st_size == 0:
                raise SystemExit(f"TTS 응답 0바이트: {dst}")
            print(f"    [{i:02d}] {w:<6} 생성      {ffprobe_duration(dst):.2f}초")
        word_files.append(dst)

    # ── 2단계 — 3초 슬롯 구성 ────────────────────────────────────────────────
    print(f"\n[2] 3초 슬롯 구성 (1회차 0.0s / 2회차 {SECOND_AT}s)")
    report: list[dict] = []
    slot_files: list[Path] = []

    for i, (w, src) in enumerate(zip(words, word_files), start=1):
        lead = leading_silence(src)                 # 원본은 건드리지 않고 재생 시작점만 당긴다
        d0 = ffprobe_duration(src) - lead
        tempo = 1.0
        first_at = args.first
        second_at = args.second
        note = f"앞무음 {lead:.2f}s 컷" if lead > 0.005 else "-"

        # 2회차가 슬롯을 넘치는지: second_at + d <= SLOT 이어야 한다
        if second_at + d0 > SLOT:
            # ① 속도 보정 (최대 1.10)
            need = d0 / (SLOT - second_at)
            tempo = min(MAX_TEMPO, max(1.0, need))
            d = d0 / tempo
            note = (note + ", " if note != "-" else "") + f"atempo {tempo:.3f}"
            # ② 그래도 넘치면 2회차 시작을 앞당긴다
            if second_at + d > SLOT:
                second_at = max(d, SLOT - d)   # 1회차와 겹치지 않는 가장 이른 시각
                note += f", 2회차 {second_at:.2f}s로 당김"
            if second_at + d > SLOT:
                note += " ⚠️ 여전히 초과"
        else:
            d = d0

        # 슬롯 구성: [무음][단어][무음][단어][무음] 을 이어 붙인다.
        #
        # adelay + apad + amix 조합은 쓰지 않는다. apad 는 무한 오디오를 만드는데
        # aresample(first_pts=0) 이 DTS 를 음수로 망가뜨리면 -t 가 듣지 않아
        # ffmpeg 가 디스크가 찰 때까지 파일을 쓴다(실제로 9.7GB 를 쓴 적이 있다).
        # 아래처럼 유한한 조각만 만들어 concat 하면 길이가 구조적으로 확정된다.
        slot = tmp_dir / f"slot_{i:02d}.wav"
        ss = ["-ss", f"{lead:.4f}"] if lead > 0.005 else []
        af = f"atempo={tempo}," if tempo != 1.0 else ""

        word_wav = tmp_dir / f"w_{i:02d}.wav"
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-nostdin", *ss, "-i", str(src),
             "-af", f"{af}aresample=44100", "-ac", "1", "-ar", "44100", str(word_wav)],
            check=True, timeout=60,
        )
        d_actual = ffprobe_duration(word_wav)

        pieces: list[Path] = []
        gaps = [first_at, max(0.0, second_at - first_at - d_actual),
                max(0.0, SLOT - second_at - d_actual)]
        for gi, g in enumerate(gaps):
            if g > 0.001:
                sil = tmp_dir / f"s_{i:02d}_{gi}.wav"
                subprocess.run(
                    ["ffmpeg", "-y", "-v", "error", "-nostdin", "-f", "lavfi",
                     "-i", "anullsrc=r=44100:cl=mono", "-t", f"{g:.4f}",
                     "-ar", "44100", "-ac", "1", str(sil)],
                    check=True, timeout=60,
                )
                pieces.append(sil)
            if gi < 2:
                pieces.append(word_wav)

        lst = tmp_dir / f"list_{i:02d}.txt"
        with open(lst, "w", encoding="utf-8") as fh:
            for p in pieces:
                fh.write(f"file '{p.resolve().as_posix()}'\n")
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-nostdin", "-f", "concat", "-safe", "0",
             "-i", str(lst), "-t", f"{SLOT}", "-ar", "44100", "-ac", "1", str(slot)],
            check=True, timeout=60,
        )
        got = ffprobe_duration(slot)
        slot_files.append(slot)
        report.append({
            "no": i, "word": w, "orig": d0, "used": d, "tempo": tempo,
            "second_at": second_at, "note": note, "slot_len": got,
            "fits": second_at + d <= SLOT + 1e-6,
        })
        print(f"    [{i:02d}] {w:<6} 원본 {d0:.2f}s → 사용 {d:.2f}s  2회차 {second_at:.2f}s  "
              f"슬롯 {got:.3f}s  {note}")

    # ── 3단계 — 병합 + 정규화 ────────────────────────────────────────────────
    print("\n[3] 병합 + loudnorm + mp3 192k")
    listfile = tmp_dir / "concat.txt"
    with open(listfile, "w", encoding="utf-8") as f:
        for s in slot_files:
            f.write(f"file '{s.resolve().as_posix()}'\n")

    final = out_dir / f"{prefix}.mp3"
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(listfile),
         "-af", f"{LOUDNORM},atrim=0:{SLOT*len(words)},asetpts=N/SR/TB",
         "-codec:a", "libmp3lame", "-b:a", BITRATE, "-ar", "44100", "-ac", "1", str(final)],
        check=True,
    )

    total = ffprobe_duration(final)

    # ── 검증 ─────────────────────────────────────────────────────────────────
    print("\n" + "=" * 66)
    print(f"최종: {final}  ({final.stat().st_size/1024:.1f}KB)")
    print(f"API 호출: {api_calls}회\n")

    print("no  단어      원본(s)  사용(s)  2회차(s)  슬롯(s)  비고")
    for r in report:
        print(f"{r['no']:02d}  {r['word']:<8} {r['orig']:6.2f}  {r['used']:6.2f}  "
              f"{r['second_at']:7.2f}  {r['slot_len']:6.3f}  {r['note']}")

    expected = SLOT * len(words)
    ok1 = abs(total - expected) <= 0.05
    ok3 = all(r["fits"] for r in report)
    slot_ok = all(abs(r["slot_len"] - SLOT) <= 0.005 for r in report)

    print(f"\n[검증]")
    print(f"  1. 최종 길이 {total:.3f}초 (기대 {expected:.2f} ±0.05) — {'✅' if ok1 else '❌'}")
    print(f"  2. 1회차 시작 시각: " + ", ".join(f"{i*SLOT:.0f}" for i in range(len(words))) +
          f" — 슬롯 길이 전부 {SLOT}초 {'✅' if slot_ok else '❌'}")
    print(f"  3. 슬롯 초과 없음 — {'✅' if ok3 else '❌ ' + ', '.join(r['word'] for r in report if not r['fits'])}")
    print(f"  4. 단어 순서: " + " → ".join(words))
    print(f"  5. 볼륨 정규화: {LOUDNORM} 적용 (귀로 최종 확인 필요)")

    for f in tmp_dir.glob("*"):
        f.unlink()
    tmp_dir.rmdir()


if __name__ == "__main__":
    main()
