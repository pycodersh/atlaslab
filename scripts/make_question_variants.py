#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
의문문 말끝 올림 후보 생성

Edge-TTS 는 문장 끝 억양을 직접 지정할 수 없다(SSML contour 미지원).
한국어 보이스도 3개뿐이라 보이스 교체로 풀 수 없다.
그래서 네 가지 접근을 각각 만들어 놓고 귀로 고르게 한다.

  A 원본        현재 파일과 같은 설정 (비교 기준)
  B 전체피치     Edge-TTS pitch 를 올림 — 문장 전체가 높아진다
  C 조사추가     "버스는 어디서 타요?" — 조사를 넣으면 질문 억양이 붙는 경우가 많다
  D 말끝올림     원본 뒤쪽 구간만 rubberband 로 피치를 올린다(길이 유지).
                실제 종결 상승에 가장 가깝다.

필요: python 3.10+, edge-tts, pydub, ffmpeg(rubberband 포함)

사용: python scripts/make_question_variants.py
"""
from __future__ import annotations

import asyncio
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

VOICE = "ko-KR-SunHiNeural"
RATE = "-5%"
TARGET_DBFS = -20.0
OUT = Path("out/audio/question-variants")

# (번호, 원문, 조사 추가판)
SENTENCES = [
    (5, "버스 어디서 타요?",   "버스는 어디서 타요?"),
    (7, "지하철 어디서 타요?", "지하철은 어디서 타요?"),
    (9, "택시 어디서 타요?",   "택시는 어디서 타요?"),
]

TAIL_MS = 420        # 말끝 올림을 적용할 뒤쪽 구간
TAIL_SEMITONES = 2.5 # 그 구간을 올릴 반음 수


async def synth(text: str, dst: Path, pitch: str = "+0Hz") -> None:
    import edge_tts
    dst.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text, VOICE, rate=RATE, pitch=pitch).save(str(dst))


def trim(seg: AudioSegment) -> AudioSegment:
    from pydub.silence import detect_nonsilent
    sp = detect_nonsilent(seg, min_silence_len=30, silence_thresh=-45.0)
    if not sp:
        return seg
    return seg[max(0, sp[0][0] - 20): min(len(seg), sp[-1][1] + 40)]


def level(seg: AudioSegment) -> AudioSegment:
    return seg.apply_gain(TARGET_DBFS - seg.dBFS)


def rise_tail(src: Path, dst: Path, tail_ms: int, semitones: float) -> None:
    """
    뒤쪽 tail_ms 구간만 피치를 올린다. 계단처럼 튀지 않도록 3등분해 점점 올리고,
    이어 붙일 때 짧은 크로스페이드를 준다. rubberband 라 길이는 그대로다.
    """
    seg = level(trim(AudioSegment.from_file(src)))
    tail_ms = min(tail_ms, max(0, len(seg) - 120))
    head = seg[:len(seg) - tail_ms]
    tail = seg[len(seg) - tail_ms:]

    tmp = dst.parent / ".vtmp"
    tmp.mkdir(exist_ok=True)
    n = 3
    step = len(tail) // n
    pieces: list[AudioSegment] = []
    for k in range(n):
        piece = tail[k * step: (k + 1) * step if k < n - 1 else len(tail)]
        pw = tmp / f"p{k}.wav"
        piece.export(pw, format="wav")
        out = tmp / f"p{k}_up.wav"
        semi = semitones * (k + 1) / n          # 0 → semitones 로 점증
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", str(pw),
             "-af", f"rubberband=pitch={2 ** (semi / 12):.5f}", str(out)],
            check=True, timeout=60,
        )
        pieces.append(AudioSegment.from_file(out))

    result = head
    for p in pieces:
        result = result.append(p, crossfade=8)
    result = level(result)
    result.export(dst, format="mp3", bitrate="192k")

    for f in tmp.glob("*"):
        f.unlink()
    tmp.rmdir()


def main() -> None:
    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg 을 PATH에서 찾을 수 없습니다.")
    OUT.mkdir(parents=True, exist_ok=True)

    print(f"\n=== 의문문 말끝 올림 후보 생성 ===")
    print(f"보이스: {VOICE}  |  속도: {RATE}  (Edge-TTS, API 키 불필요)\n")

    rows: list[tuple[str, str, float]] = []

    for no, text, text_josa in SENTENCES:
        print(f"[{no}] {text}")

        # A 원본
        a = OUT / f"{no:02d}_A_원본.mp3"
        asyncio.run(synth(text, a))
        seg = level(trim(AudioSegment.from_file(a)))
        seg.export(a, format="mp3", bitrate="192k")
        rows.append((a.name, text, len(seg) / 1000))
        print(f"    A 원본        {len(seg)/1000:.2f}s")

        # B 전체 피치 상승
        b = OUT / f"{no:02d}_B_전체피치.mp3"
        asyncio.run(synth(text, b, pitch="+30Hz"))
        seg = level(trim(AudioSegment.from_file(b)))
        seg.export(b, format="mp3", bitrate="192k")
        rows.append((b.name, text + "  (pitch +30Hz)", len(seg) / 1000))
        print(f"    B 전체피치     {len(seg)/1000:.2f}s   pitch +30Hz")

        # C 조사 추가
        c = OUT / f"{no:02d}_C_조사추가.mp3"
        asyncio.run(synth(text_josa, c))
        seg = level(trim(AudioSegment.from_file(c)))
        seg.export(c, format="mp3", bitrate="192k")
        rows.append((c.name, text_josa, len(seg) / 1000))
        print(f"    C 조사추가     {len(seg)/1000:.2f}s   \"{text_josa}\"")

        # D 말끝만 올림 (A 를 후처리)
        d = OUT / f"{no:02d}_D_말끝올림.mp3"
        rise_tail(a, d, TAIL_MS, TAIL_SEMITONES)
        dur = len(AudioSegment.from_file(d)) / 1000
        rows.append((d.name, text + f"  (뒤 {TAIL_MS}ms 를 +{TAIL_SEMITONES}반음까지 점증)", dur))
        print(f"    D 말끝올림     {dur:.2f}s   뒤 {TAIL_MS}ms → +{TAIL_SEMITONES}반음\n")

    print("=" * 62)
    print(f"후보 {len(rows)}개 → {OUT}")
    print("\n파일                       길이     내용")
    for name, txt, dur in rows:
        print(f"{name:<26} {dur:5.2f}s   {txt}")
    print("\n들어보고 어느 방식(A/B/C/D)이 좋은지 알려주시면 본 트랙에 반영합니다.")


if __name__ == "__main__":
    main()
