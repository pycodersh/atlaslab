#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한국어 학습 안내 나레이션 MP3 생성 — "어디서 타요?" 편

구간별로 따로 합성한 뒤 지정된 무음을 끼워 이어 붙인다.
무음 길이를 TTS 문장부호에 맡기지 않는 이유는 명확하다 —
모델이 만드는 쉼은 0.3~0.8초로 불규칙해서 지정한 호흡이 나오지 않는다.

TTS: Edge-TTS (ko-KR-SunHiNeural / ko-KR-InJoonNeural) — API 키·과금 없음
필요: python 3.10+, edge-tts, pydub, ffmpeg(PATH)

사용:
  python scripts/korean_transit_intro.py
  python scripts/korean_transit_intro.py --voice ko-KR-InJoonNeural --rate +0%
  python scripts/korean_transit_intro.py --force
"""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from pydub import AudioSegment

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    except Exception:
        pass

DEFAULT_VOICE = "ko-KR-SunHiNeural"
DEFAULT_RATE = "-5%"          # 또박또박한 튜터 톤
TARGET_DBFS = -20.0           # 구간별 레벨 통일 (Edge-TTS 는 구간마다 편차가 있다)

# (라벨, 대사, 뒤에 붙일 무음 ms)
SEGMENTS: list[tuple[str, str, int]] = [
    ("1 도입질문+패턴", "대중교통을 어디서 타는지 물어볼 때 한국말로 어떻게 할까요? 어디서 타요?", 600),
    ("2 연습유도",      "자, 이 표현으로 몇 가지 더 연습해 볼까요?", 500),
    ("3 예문-버스",     "버스 정류장을 물어볼 땐, 버스 어디서 타요? 라고 하고,", 400),
    ("4 예문-지하철",   "지하철 역을 찾으면, 지하철 어디서 타요?", 400),
    ("5 예문-택시",     "그리고 택시를 타고 싶을 땐, 택시 어디서 타요? 라고 말합니다.", 700),
    ("6 클로징",        "이렇게 핵심 표현 삼백 개와 필수 단어 천 개를 익히면, "
                        "기초 한국어를 자유롭게 말할 수 있어요.", 0),
]


async def synth(text: str, voice: str, rate: str, dst: Path) -> None:
    import edge_tts
    dst.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text, voice, rate=rate).save(str(dst))


def trim_silence(seg: AudioSegment, silence_db: float = -45.0) -> AudioSegment:
    """앞뒤 무음 제거 — 지정한 구간 무음이 정확히 그 길이가 되도록."""
    from pydub.silence import detect_nonsilent
    spans = detect_nonsilent(seg, min_silence_len=30, silence_thresh=silence_db)
    if not spans:
        return seg
    return seg[max(0, spans[0][0] - 20): min(len(seg), spans[-1][1] + 40)]


def main() -> None:
    ap = argparse.ArgumentParser(description="한국어 안내 나레이션 MP3 생성")
    ap.add_argument("--voice", default=DEFAULT_VOICE,
                    help="ko-KR-SunHiNeural(여성) 또는 ko-KR-InJoonNeural(남성)")
    ap.add_argument("--rate", default=DEFAULT_RATE, help="Edge-TTS 속도 (예: -5%%, +0%%)")
    ap.add_argument("--out", default="out/audio", help="출력 폴더")
    ap.add_argument("--name", default="korean_transit_intro.mp3")
    ap.add_argument("--force", action="store_true", help="캐시 무시하고 재생성")
    args = ap.parse_args()

    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg 을 PATH에서 찾을 수 없습니다.")

    out_dir = Path(args.out)
    parts_dir = out_dir / "parts-transit"
    parts_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n=== 한국어 안내 나레이션 ===")
    print(f"TTS: Edge-TTS  |  보이스: {args.voice}  |  속도: {args.rate}  (API 키 불필요)")
    print(f"구간: {len(SEGMENTS)}개  |  출력: {out_dir / args.name}\n")

    # ── 1. 구간별 합성 ───────────────────────────────────────────────────────
    print("[1] 구간별 음성 생성")
    files: list[Path] = []
    for i, (label, text, _) in enumerate(SEGMENTS, start=1):
        dst = parts_dir / f"{i:02d}.mp3"
        if dst.exists() and not args.force:
            print(f"    [{i}] {label:<14} 캐시 사용")
        else:
            asyncio.run(synth(text, args.voice, args.rate, dst))
            if dst.stat().st_size == 0:
                raise SystemExit(f"TTS 응답 0바이트: {dst}")
            print(f"    [{i}] {label:<14} 생성 ({dst.stat().st_size/1024:.1f}KB)")
        files.append(dst)

    # ── 2. 무음 삽입하며 이어 붙이기 ─────────────────────────────────────────
    print(f"\n[2] 조립 (구간 사이 무음 삽입)")
    print("구간              길이(s)  뒤 무음(s)  시작(s)")
    track = AudioSegment.empty()
    cues: list[str] = []
    t = 0.0

    for i, ((label, text, gap_ms), f) in enumerate(zip(SEGMENTS, files), start=1):
        seg = trim_silence(AudioSegment.from_file(f))
        seg = seg.apply_gain(TARGET_DBFS - seg.dBFS)          # 구간 레벨 통일
        d = len(seg) / 1000

        print(f"{label:<16} {d:7.2f}  {gap_ms/1000:9.2f}  {t:7.2f}")
        cues.append(f"{t:6.2f}  {label:<16} {d:5.2f}s  {text}")

        track += seg
        t += d
        if gap_ms > 0:
            # 무음도 본문과 같은 레이트/채널로 만든다 (기본 11025Hz 로 만들면 길이가 밀린다)
            track += AudioSegment.silent(duration=gap_ms, frame_rate=seg.frame_rate) \
                                 .set_channels(seg.channels).set_sample_width(seg.sample_width)
            t += gap_ms / 1000

    # ── 3. 라우드니스 정규화 후 내보내기 ─────────────────────────────────────
    raw_mp3 = out_dir / f"_raw_{args.name}"
    track.export(raw_mp3, format="mp3", bitrate="192k")

    probe = subprocess.run(
        ["ffmpeg", "-v", "info", "-i", str(raw_mp3),
         "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, errors="replace").stderr
    m = re.search(r"\{[^{}]*input_i[^{}]*\}", probe, re.S)
    flt = "loudnorm=I=-16:TP=-1.5:LRA=11"
    if m:
        j = json.loads(m.group(0))
        flt += (f":measured_I={j['input_i']}:measured_TP={j['input_tp']}"
                f":measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}"
                f":offset={j['target_offset']}:linear=true")
        print(f"\n[정규화] {j['input_i']} LUFS → -16 LUFS")

    final = out_dir / args.name
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw_mp3), "-af", flt,
                    "-codec:a", "libmp3lame", "-b:a", "192k", str(final)],
                   check=True, timeout=120)
    raw_mp3.unlink()

    cues_path = out_dir / f"{Path(args.name).stem}_cues.txt"
    with open(cues_path, "w", encoding="utf-8") as fh:
        fh.write("시작(s)  구간              길이     대사\n")
        fh.write("\n".join(cues) + "\n")

    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(final)],
        capture_output=True, text=True, check=True).stdout.strip())

    print(f"\n{'=' * 64}")
    print(f"최종: {final}  ({final.stat().st_size/1024:.1f}KB)")
    print(f"길이: {dur:.2f}초  ·  무음 합계 {sum(g for _, _, g in SEGMENTS)/1000:.1f}초")
    print(f"큐 시트 → {cues_path}")
    print(f"\n[구간 시작 시각]")
    for c in cues:
        print("  " + c)


if __name__ == "__main__":
    main()
