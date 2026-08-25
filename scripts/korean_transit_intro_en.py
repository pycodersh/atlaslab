#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
영한 혼합 숏폼 나레이션 MP3 생성 — "어디서 타요?" 편 (글로벌용)

영어 내레이션과 한국어 예문을 각각 다른 보이스로 합성하고,
지정된 무음을 끼워 이어 붙인다.

한국어는 반드시 한국어 보이스로 만든다. 영어 보이스에 한글을 넣으면
영어식 발음이 나오고, 로마자를 넣으면 더 나빠진다.

TTS: Edge-TTS (en-US-JennyNeural + ko-KR-SunHiNeural) — API 키·과금 없음
필요: python 3.10+, edge-tts, pydub, ffmpeg(PATH)

사용:
  python scripts/korean_transit_intro_en.py
  python scripts/korean_transit_intro_en.py --en-voice en-US-GuyNeural --ko-voice ko-KR-InJoonNeural
  python scripts/korean_transit_intro_en.py --force
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

EN_VOICE = "en-US-JennyNeural"
KO_VOICE = "ko-KR-SunHiNeural"
EN_RATE = "+0%"
KO_RATE = "-5%"          # 학습 대상 문장이라 조금 느리게
TARGET_DBFS = -20.0      # 보이스가 둘이라 구간 레벨을 반드시 맞춰야 한다

# (섹션, 언어, 대사, 뒤 무음 ms)
SEGMENTS: list[tuple[str, str, str, int]] = [
    ("S1", "en", "How do you ask where to take public transportation in Korean?", 300),
    ("S1", "ko", "어디서 타요?", 500),

    ("S2", "en", "Let's practice this pattern with a few examples.", 400),

    ("S3", "en", "When looking for the bus stop, say:", 200),
    ("S3", "ko", "버스 어디서 타요?", 500),

    ("S4", "en", "Finding the subway station?", 200),
    ("S4", "ko", "지하철 어디서 타요?", 500),

    ("S5", "en", "And when you need a taxi:", 200),
    ("S5", "ko", "택시 어디서 타요?", 600),

    # 숫자는 풀어 쓴다 — 쉼표가 들어간 1,000 을 TTS 가 어정쩡하게 읽는다
    ("S6", "en", "Master just three hundred core patterns and one thousand essential words, "
                 "and you'll speak basic Korean with confidence.", 0),
]


async def synth(text: str, voice: str, rate: str, dst: Path) -> None:
    import edge_tts
    dst.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text, voice, rate=rate).save(str(dst))


def trim_silence(seg: AudioSegment, silence_db: float = -45.0) -> AudioSegment:
    """앞뒤 무음 제거 — 지정한 간격이 정확히 그 길이가 되도록."""
    from pydub.silence import detect_nonsilent
    spans = detect_nonsilent(seg, min_silence_len=30, silence_thresh=silence_db)
    if not spans:
        return seg
    return seg[max(0, spans[0][0] - 20): min(len(seg), spans[-1][1] + 40)]


def main() -> None:
    ap = argparse.ArgumentParser(description="영한 혼합 숏폼 나레이션 생성")
    ap.add_argument("--en-voice", default=EN_VOICE, help="en-US-JennyNeural / en-US-GuyNeural")
    ap.add_argument("--ko-voice", default=KO_VOICE, help="ko-KR-SunHiNeural / ko-KR-InJoonNeural")
    ap.add_argument("--en-rate", default=EN_RATE)
    ap.add_argument("--ko-rate", default=KO_RATE)
    ap.add_argument("--out", default="out/audio")
    ap.add_argument("--name", default="korean_transit_intro_en.mp3")
    ap.add_argument("--force", action="store_true", help="캐시 무시하고 재생성")
    args = ap.parse_args()

    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg 을 PATH에서 찾을 수 없습니다.")

    out_dir = Path(args.out)
    parts_dir = out_dir / "parts-transit-en"
    parts_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n=== 영한 혼합 나레이션 ===")
    print(f"TTS: Edge-TTS (API 키 불필요)")
    print(f"  영어  : {args.en_voice}  {args.en_rate}")
    print(f"  한국어: {args.ko_voice}  {args.ko_rate}")
    print(f"발화 {len(SEGMENTS)}개  |  출력: {out_dir / args.name}\n")

    # ── 1. 구간별 합성 ───────────────────────────────────────────────────────
    print("[1] 구간별 음성 생성")
    files: list[Path] = []
    for i, (sec, lang, text, _) in enumerate(SEGMENTS, start=1):
        dst = parts_dir / f"{i:02d}_{lang}.mp3"
        voice = args.en_voice if lang == "en" else args.ko_voice
        rate = args.en_rate if lang == "en" else args.ko_rate
        if dst.exists() and not args.force:
            print(f"    [{i:02d}] {sec} {lang.upper()}  캐시 사용")
        else:
            asyncio.run(synth(text, voice, rate, dst))
            if dst.stat().st_size == 0:
                raise SystemExit(f"TTS 응답 0바이트: {dst}")
            print(f"    [{i:02d}] {sec} {lang.upper()}  생성 ({dst.stat().st_size/1024:.1f}KB)  \"{text[:40]}\"")
        files.append(dst)

    # ── 2. 조립 ──────────────────────────────────────────────────────────────
    print(f"\n[2] 조립 (지정 무음 삽입)")
    print("no  섹션 언어  길이(s)  뒤무음(s)  시작(s)  대사")
    track = AudioSegment.empty()
    cues: list[str] = []
    t = 0.0

    for i, ((sec, lang, text, gap_ms), f) in enumerate(zip(SEGMENTS, files), start=1):
        seg = trim_silence(AudioSegment.from_file(f))
        seg = seg.apply_gain(TARGET_DBFS - seg.dBFS)      # 두 보이스의 레벨 차이를 여기서 흡수
        d = len(seg) / 1000

        print(f"{i:02d}  {sec}  {lang.upper()}  {d:7.2f}  {gap_ms/1000:8.2f}  {t:7.2f}  {text[:44]}")
        cues.append(f"{t:6.2f}  {sec} {lang.upper():<2} {d:5.2f}s  {text}")

        track += seg
        t += d
        if gap_ms > 0:
            # 무음도 본문과 같은 레이트/채널로 (기본 11025Hz 로 만들면 길이가 밀린다)
            track += AudioSegment.silent(duration=gap_ms, frame_rate=seg.frame_rate) \
                                 .set_channels(seg.channels).set_sample_width(seg.sample_width)
            t += gap_ms / 1000

    # ── 3. 정규화 후 내보내기 ────────────────────────────────────────────────
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
        fh.write("시작(s)  섹션 언어  길이     대사\n")
        fh.write("\n".join(cues) + "\n")

    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(final)],
        capture_output=True, text=True, check=True).stdout.strip())

    print(f"\n{'=' * 66}")
    print(f"최종: {final}  ({final.stat().st_size/1024:.1f}KB)")
    print(f"길이: {dur:.2f}초  ·  무음 합계 {sum(g for *_, g in SEGMENTS)/1000:.1f}초")
    print(f"큐 시트 → {cues_path}")
    print(f"\n[구간 시작 시각]")
    for c in cues:
        print("  " + c)


if __name__ == "__main__":
    main()
