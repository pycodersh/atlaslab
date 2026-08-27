#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
"못 먹어요" 패턴 나레이션 MP3 생성 — OpenAI TTS

영어 설명 + 한국어 핵심 표현을 구간별로 합성하고 무음을 끼워 이어 붙인다.

제약: tts-1-hd 는 instructions 파라미터를 지원하지 않는다(gpt-4o-mini-tts 전용).
      그래서 한국어 발음을 지시로 유도할 수 없다. --ko-model gpt-4o-mini-tts 를 주면
      한국어 구간만 그 모델로 만들어 아나운서 톤 지시를 적용한다.

필요: python 3.10+, openai, pydub, ffmpeg
키:   환경변수 OPENAI_API_KEY (없으면 patto/.env.local)

사용:
  python scripts/korean_food_patterns.py
  python scripts/korean_food_patterns.py --voice nova
  python scripts/korean_food_patterns.py --ko-model gpt-4o-mini-tts   # 한국어만 지시 적용
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

from pydub import AudioSegment

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    except Exception:
        pass

TARGET_DBFS = -20.0

KO_INSTRUCTIONS = (
    "Speak like a female Korean announcer. Clear and articulate, slightly bright tone. "
    "Speak slowly, enunciating each syllable distinctly, as a pronunciation model for a learner."
)

# (구간, 언어, 대사, 뒤 무음 ms)
# 무음은 학습자가 따라 말할 여유를 준다. 한국어 표현 뒤를 특히 길게 둔다.
SEGMENTS: list[tuple[str, str, str, int]] = [
    ("S1", "en", 'How do you say "I can\'t eat this" in Korean? You can say:', 550),
    ("S1", "ko", "못 먹어요.", 1000),

    ("S2", "en", "Let's learn a few examples!", 800),

    ("S3", "en", "When you can't eat spicy food, you say:", 500),
    ("S3", "ko", "매운 거 못 먹어요.", 900),

    ("S4", "en", "If you can't eat seafood, you say:", 500),
    ("S4", "ko", "해산물 못 먹어요.", 900),

    ("S5", "en", "And lastly, if you can't eat pork, you can say:", 500),
    ("S5", "ko", "돼지고기 못 먹어요.", 0),
]


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


def trim(seg: AudioSegment) -> AudioSegment:
    from pydub.silence import detect_nonsilent
    sp = detect_nonsilent(seg, min_silence_len=30, silence_thresh=-45.0)
    if not sp:
        return seg
    return seg[max(0, sp[0][0] - 20): min(len(seg), sp[-1][1] + 40)]


def main() -> None:
    ap = argparse.ArgumentParser(description='"못 먹어요" 패턴 나레이션 생성')
    ap.add_argument("--model", default="tts-1-hd", help="영어 구간 모델")
    ap.add_argument("--ko-model", default="", help="한국어 구간 모델 (기본: --model 과 동일)")
    ap.add_argument("--voice", default="nova", help="alloy / nova / shimmer (오른쪽일수록 높고 밝음)")
    ap.add_argument("--out", default="out/audio")
    ap.add_argument("--name", default="korean_food_patterns.mp3")
    ap.add_argument("--also", default="output.mp3", help="같은 내용을 이 이름으로도 저장")
    ap.add_argument("--pause-scale", type=float, default=1.0,
                    help="문장 사이 무음 배율 (1.5 면 1.5배 길게)")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg 을 PATH에서 찾을 수 없습니다.")

    ko_model = args.ko_model or args.model
    out_dir = Path(args.out)
    parts = out_dir / "parts-food"
    parts.mkdir(parents=True, exist_ok=True)

    from openai import OpenAI
    client = OpenAI(api_key=load_api_key())

    print(f"\n=== \"못 먹어요\" 패턴 나레이션 ===")
    print(f"엔진: OpenAI  |  보이스: {args.voice}")
    print(f"  영어  : {args.model}")
    print(f"  한국어: {ko_model}" +
          ("  (instructions 적용)" if ko_model == "gpt-4o-mini-tts" else "  (instructions 미지원 모델)"))
    print(f"키: OPENAI_API_KEY(…{load_api_key()[-4:]})")
    print(f"구간 {len(SEGMENTS)}개  |  출력: {out_dir / args.name}\n")

    calls = 0
    print("[1] 구간별 생성")
    files: list[Path] = []
    for i, (sec, lang, text, _) in enumerate(SEGMENTS, start=1):
        dst = parts / f"{i:02d}_{lang}.mp3"
        model = args.model if lang == "en" else ko_model
        if dst.exists() and not args.force:
            print(f"    [{i:02d}] {sec} {lang.upper()}  캐시 사용")
        else:
            kw: dict = dict(model=model, voice=args.voice, input=text, response_format="mp3")
            # instructions 는 gpt-4o-mini-tts 계열에서만 유효하다
            if lang == "ko" and model.startswith("gpt-4o"):
                kw["instructions"] = KO_INSTRUCTIONS
            with client.audio.speech.with_streaming_response.create(**kw) as r:
                r.stream_to_file(str(dst))
            calls += 1
            if dst.stat().st_size == 0:
                raise SystemExit(f"TTS 응답 0바이트: {dst}")
            print(f"    [{i:02d}] {sec} {lang.upper()}  생성  \"{text[:44]}\"")
        files.append(dst)

    print(f"\n[2] 조립")
    print("no  구간 언어  길이(s)  뒤무음(s)  시작(s)  대사")
    track = AudioSegment.empty()
    cues: list[str] = []
    t = 0.0
    for i, ((sec, lang, text, gap), f) in enumerate(zip(SEGMENTS, files), start=1):
        seg = trim(AudioSegment.from_file(f))
        seg = seg.apply_gain(TARGET_DBFS - seg.dBFS)
        d = len(seg) / 1000
        print(f"{i:02d}  {sec}  {lang.upper()}  {d:7.2f}  {int(round(gap*args.pause_scale))/1000:8.2f}  {t:7.2f}  {text[:42]}")
        cues.append(f"{t:6.2f}  {sec} {lang.upper():<2} {d:5.2f}s  {text}")
        track += seg
        t += d
        gap = int(round(gap * args.pause_scale))
        if gap > 0:
            track += AudioSegment.silent(duration=gap, frame_rate=seg.frame_rate) \
                                 .set_channels(seg.channels).set_sample_width(seg.sample_width)
            t += gap / 1000

    raw = out_dir / f"_raw_{args.name}"
    track.export(raw, format="mp3", bitrate="192k")

    probe = subprocess.run(
        ["ffmpeg", "-v", "info", "-i", str(raw),
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
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", flt,
                    "-codec:a", "libmp3lame", "-b:a", "192k", str(final)], check=True, timeout=120)
    raw.unlink()

    # 지시서에 파일명이 두 가지로 적혀 있어 같은 내용을 두 이름으로 남긴다
    if args.also:
        (out_dir / args.also).write_bytes(final.read_bytes())

    cues_path = out_dir / f"{Path(args.name).stem}_cues.txt"
    with open(cues_path, "w", encoding="utf-8") as fh:
        fh.write("시작(s)  구간 언어  길이     대사\n")
        fh.write("\n".join(cues) + "\n")

    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(final)],
        capture_output=True, text=True, check=True).stdout.strip())

    print(f"\n{'=' * 64}")
    print(f"최종: {final}  ({final.stat().st_size/1024:.1f}KB)")
    if args.also:
        print(f"사본: {out_dir / args.also}")
    print(f"길이: {dur:.2f}초  ·  API 호출 {calls}회")
    print(f"큐 시트 → {cues_path}")
    print(f"\n[구간 시작 시각]")
    for c in cues:
        print("  " + c)


if __name__ == "__main__":
    main()
