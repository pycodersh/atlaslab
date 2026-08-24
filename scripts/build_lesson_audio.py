#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
레슨 오디오 빌더 — 여러 줄을 한 개의 mp3로 합친다.

줄마다 별도로 TTS를 호출하고, 지정한 간격을 두고 이어 붙인 뒤 -16 LUFS로 정규화한다.
줄 사이 간격을 TTS에 맡기지 않는 이유는 단어 트랙과 같다 — 모델이 만드는 쉼은
불규칙해서 자막 타이밍을 잡을 수 없다.

한국어 문장은 한국어 아나운서 톤으로 따로 생성한다. 영어 내레이션 톤으로 한글을
읽으면 발음이 뭉개진다. 목소리(sage)는 동일하게 유지된다.

필요: python 3.10+, openai, ffmpeg(PATH)
키:   환경변수 OPENAI_API_KEY (없으면 patto/.env.local)

사용:
  python scripts/build_lesson_audio.py --lang en
  python scripts/build_lesson_audio.py --lang kr
  python scripts/build_lesson_audio.py --lang en --romanization   # 로마자 줄도 읽기
"""
from __future__ import annotations

import argparse
import json
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

MODEL = "gpt-4o-mini-tts"
VOICE = "sage"
BITRATE = "192k"

# 줄 사이 간격
GAP_AFTER_EN = 0.45     # 영어 문장 → 한국어 문장
GAP_BETWEEN_ITEMS = 0.75
GAP_BEFORE_OUTRO = 0.90
GAP_AFTER_INTRO = 0.70

INSTR_EN = ("Speak with a female voice throughout, from the very first word. "
            "Speak like a friendly, upbeat female language teacher narrating a short "
            "social media reel. Clear and energetic, warm but not shouty. "
            "Keep a steady, easy-to-follow pace.")
INSTR_KO_PHRASE = ("Speak like a female Korean announcer. Clear and articulate, slightly bright tone. "
                   "Speak very slowly, enunciating each syllable distinctly, as if teaching a beginner. "
                   "This is a question — raise the pitch clearly at the end.")
INSTR_KO_NARRATION = ("Speak like a friendly female Korean narrator in standard Seoul Korean. "
                      "Clear, warm and natural, at an easy-to-follow pace. Not robotic.")

DATA = {
    "filename": "02_examples_outro",
    "introMessage": "Let's practice what we just learned!",
    "introMessageKr": "방금 배운 표현을 응용해 볼까요?",
    "items": [
        {"english": "How do I get to the airport?",  "korean": "공항 어떻게 가요?",  "romanization": "Gonghang eotteoke gayo?"},
        {"english": "How do I get to Myeongdong?",   "korean": "명동 어떻게 가요?",  "romanization": "Myeongdong eotteoke gayo?"},
        {"english": "How do I get to Hongdae?",      "korean": "홍대 어떻게 가요?",  "romanization": "Hongdae eotteoke gayo?"},
    ],
    # 숫자 기호를 TTS가 어정쩡하게 읽지 않도록 풀어 쓴다
    "outro": "Master three hundred core patterns and one thousand essential words "
             "to start speaking Korean naturally.",
    "outroKr": "이렇게 삼백 가지 핵심 표현과 천 개의 단어를 차근차근 익히면 "
               "누구나 기초 한국어를 자연스럽게 말할 수 있게 됩니다.",
}


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
    raise SystemExit("OPENAI_API_KEY 를 찾을 수 없습니다")


def duration(p: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", str(p)], capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def measure(p: Path) -> dict | None:
    out = subprocess.run(
        ["ffmpeg", "-v", "info", "-i", str(p),
         "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, errors="replace").stderr
    m = re.search(r"\{[^{}]*input_i[^{}]*\}", out, re.S)
    return json.loads(m.group(0)) if m else None


def main() -> None:
    ap = argparse.ArgumentParser(description="레슨 오디오 빌더")
    ap.add_argument("--lang", choices=["en", "kr"], default="en", help="내레이션 언어")
    ap.add_argument("--romanization", action="store_true", help="로마자 줄도 음성으로 읽는다")
    ap.add_argument("--out", default="reels-audio/eotteoke-gayo", help="출력 폴더")
    ap.add_argument("--voice", default=VOICE)
    ap.add_argument("--force", action="store_true", help="캐시 무시하고 재호출")
    args = ap.parse_args()

    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg 을 PATH에서 찾을 수 없습니다.")

    out_dir = Path(args.out)
    parts_dir = out_dir / (f"parts-{args.lang}" + ("-rom" if args.romanization else ""))
    parts_dir.mkdir(parents=True, exist_ok=True)

    # ── 줄 목록 구성 ─────────────────────────────────────────────────────────
    segs: list[dict] = []
    if args.lang == "en":
        segs.append({"key": "00-intro", "text": DATA["introMessage"], "instr": INSTR_EN, "gap": GAP_AFTER_INTRO})
    else:
        segs.append({"key": "00-intro", "text": DATA["introMessageKr"], "instr": INSTR_KO_NARRATION, "gap": GAP_AFTER_INTRO})

    for i, it in enumerate(DATA["items"], start=1):
        if args.lang == "en":
            segs.append({"key": f"{i:02d}a-en", "text": it["english"], "instr": INSTR_EN, "gap": GAP_AFTER_EN})
        segs.append({"key": f"{i:02d}b-ko", "text": it["korean"], "instr": INSTR_KO_PHRASE,
                     "gap": GAP_AFTER_EN if args.romanization else
                            (GAP_BETWEEN_ITEMS if i < len(DATA["items"]) else GAP_BEFORE_OUTRO)})
        if args.romanization:
            segs.append({"key": f"{i:02d}c-rom", "text": it["romanization"], "instr": INSTR_EN,
                         "gap": GAP_BETWEEN_ITEMS if i < len(DATA["items"]) else GAP_BEFORE_OUTRO})

    segs.append({"key": "99-outro",
                 "text": DATA["outro"] if args.lang == "en" else DATA["outroKr"],
                 "instr": INSTR_EN if args.lang == "en" else INSTR_KO_NARRATION,
                 "gap": 0.0})

    print(f"\n=== 레슨 오디오 빌드 ({args.lang}{', 로마자 포함' if args.romanization else ''}) ===")
    print(f"엔진: OpenAI  |  모델: {MODEL}  |  목소리: {args.voice}")
    print(f"키: OPENAI_API_KEY(…{load_api_key()[-4:]})")
    print(f"줄 수: {len(segs)}  |  출력: {out_dir}\n")

    client = None
    calls = 0

    def get_client():
        nonlocal client
        if client is None:
            from openai import OpenAI
            client = OpenAI(api_key=load_api_key())
        return client

    # ── 줄별 TTS ─────────────────────────────────────────────────────────────
    for s in segs:
        dst = parts_dir / f"{s['key']}.mp3"
        if dst.exists() and not args.force:
            print(f"  {s['key']:<12} 캐시  {duration(dst):5.2f}s  \"{s['text'][:38]}\"")
        else:
            with get_client().audio.speech.with_streaming_response.create(
                model=MODEL, voice=args.voice, input=s["text"],
                instructions=s["instr"], response_format="mp3",
            ) as resp:
                resp.stream_to_file(str(dst))
            calls += 1
            if dst.stat().st_size == 0:
                raise SystemExit(f"TTS 응답 0바이트: {dst}")
            print(f"  {s['key']:<12} 생성  {duration(dst):5.2f}s  \"{s['text'][:38]}\"")
        s["file"] = dst
        s["dur"] = duration(dst)

    # ── 이어 붙이기 (간격은 무음으로 삽입) ────────────────────────────────────
    tmp = out_dir / ".tmp"
    tmp.mkdir(exist_ok=True)
    concat_items: list[Path] = []
    cues: list[str] = []
    t = 0.0
    for s in segs:
        wav = tmp / f"{s['key']}.wav"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(s["file"]),
                        "-ar", "44100", "-ac", "1", str(wav)], check=True)
        concat_items.append(wav)
        cues.append(f"{t:7.2f}  {s['key']:<12} {s['dur']:5.2f}s  {s['text']}")
        t += s["dur"]
        if s["gap"] > 0:
            sil = tmp / f"sil-{s['key']}.wav"
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi",
                            "-i", f"anullsrc=r=44100:cl=mono", "-t", f"{s['gap']}",
                            "-ar", "44100", "-ac", "1", str(sil)], check=True)
            concat_items.append(sil)
            t += s["gap"]

    listfile = tmp / "concat.txt"
    with open(listfile, "w", encoding="utf-8") as f:
        for p in concat_items:
            f.write(f"file '{p.resolve().as_posix()}'\n")

    merged = tmp / "merged.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
                    "-i", str(listfile), "-ar", "44100", "-ac", "1", str(merged)], check=True)

    # ── 정규화 (2-pass) + mp3 ────────────────────────────────────────────────
    suffix = f"_{args.lang}" + ("_rom" if args.romanization else "")
    final = out_dir / f"{DATA['filename']}{suffix}.mp3"
    m = measure(merged)
    flt = "loudnorm=I=-16:TP=-1.5:LRA=11"
    if m:
        flt += (f":measured_I={m['input_i']}:measured_TP={m['input_tp']}"
                f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}"
                f":offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(merged), "-af", flt,
                    "-codec:a", "libmp3lame", "-b:a", BITRATE, "-ar", "44100", str(final)], check=True)

    cues_path = out_dir / f"cues{suffix}.txt"
    with open(cues_path, "w", encoding="utf-8") as f:
        f.write("시작(s)  구간         길이     텍스트\n")
        f.write("\n".join(cues) + "\n")

    total = duration(final)
    after = measure(final)

    for p in tmp.glob("*"):
        p.unlink()
    tmp.rmdir()

    print(f"\n{'=' * 62}")
    print(f"최종: {final}  ({final.stat().st_size/1024:.1f}KB)")
    print(f"총 길이: {total:.2f}초  ·  API 호출 {calls}회")
    print(f"라우드니스: {m['input_i'] if m else '?'} → {after['input_i'] if after else '?'} LUFS")
    print(f"\n[구간]")
    print("시작(s)  구간         길이     텍스트")
    for c in cues:
        print(c)
    print(f"\n큐 시트 → {cues_path}")


if __name__ == "__main__":
    main()
