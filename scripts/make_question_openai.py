#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
의문문 3문장 재생성 — OpenAI gpt-4o-mini-tts

Edge-TTS 는 문장 끝 억양을 지정할 수단이 없어 평서형으로 끝났다.
gpt-4o-mini-tts 는 instructions 로 억양을 지시할 수 있고, 앱 표현 음성에서
같은 지시문으로 의문 억양이 실제로 반영된 전례가 있다.

주의: 이 3문장만 OpenAI 로 만들면 나머지 구간(Edge-TTS SunHi)과 화자가 달라진다.

필요: python 3.10+, openai, pydub, ffmpeg
키:   환경변수 OPENAI_API_KEY (없으면 patto/.env.local)

사용: python scripts/make_question_openai.py
"""
from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path

from pydub import AudioSegment

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    except Exception:
        pass

MODEL = "gpt-4o-mini-tts"
VOICE = "sage"
TARGET_DBFS = -20.0
OUT = Path("out/audio/question-openai")

INSTRUCTIONS = (
    "Speak like a female Korean announcer. Clear and articulate, slightly bright tone. "
    "Speak very slowly, enunciating each syllable distinctly, as if teaching a beginner. "
    "This is a question — raise the pitch clearly at the end."
)

SENTENCES = [
    (5, "버스 어디서 타요?"),
    (7, "지하철 어디서 타요?"),
    (9, "택시 어디서 타요?"),
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
    from openai import OpenAI
    client = OpenAI(api_key=load_api_key())
    OUT.mkdir(parents=True, exist_ok=True)

    print(f"\n=== 의문문 3문장 재생성 (OpenAI) ===")
    print(f"엔진: OpenAI  |  모델: {MODEL}  |  목소리: {VOICE}")
    print(f"키: OPENAI_API_KEY(…{load_api_key()[-4:]})")
    print(f"instructions: …raise the pitch clearly at the end.")
    print(f"출력: {OUT}\n")

    for no, text in SENTENCES:
        dst = OUT / f"{no:02d}_{text.replace(' ', '_').replace('?', '')}.mp3"
        with client.audio.speech.with_streaming_response.create(
            model=MODEL, voice=VOICE, input=text,
            instructions=INSTRUCTIONS, response_format="mp3",
        ) as r:
            r.stream_to_file(str(dst))
        if dst.stat().st_size == 0:
            raise SystemExit(f"TTS 응답 0바이트: {dst}")

        seg = trim(AudioSegment.from_file(dst))
        seg = seg.apply_gain(TARGET_DBFS - seg.dBFS)
        seg.export(dst, format="mp3", bitrate="192k")
        print(f"  [{no}] {text:<16} {len(seg)/1000:.2f}s  {dst.stat().st_size/1024:.1f}KB  → {dst.name}")

    print(f"\nAPI 호출 3회  ·  {OUT}")


if __name__ == "__main__":
    main()
