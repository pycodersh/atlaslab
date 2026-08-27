#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
지하철 10단어 30초 마스터 오디오 — OpenAI TTS

전달받은 스크립트 구조 그대로: 단어당 "단어. 단어." 한 번 호출,
3초보다 짧으면 뒤를 무음으로 채우고 길면 3초로 자른다.

앞선 작업에서 이미 요청받은 두 가지만 보정한다.
  · 앞 무음 제거  — OpenAI TTS 는 앞에 최대 0.5초 무음을 붙여 보낸다.
                    안 자르면 첫 발음이 슬롯 시작보다 늦어 화면과 어긋난다.
  · 라우드니스    — 원본은 -30 LUFS 대라 영상에 얹으면 안 들린다. -16 LUFS 로 맞춘다.

필요: python 3.10+, openai, pydub, ffmpeg
키:   환경변수 OPENAI_API_KEY (없으면 patto/.env.local)

사용:
  python scripts/subway_vocab_30s.py
  python scripts/subway_vocab_30s.py --voice shimmer --speed 1.0 --force
"""
from __future__ import annotations

import argparse
import io
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

WORDS = ["지하철", "역", "출구", "환승", "교통카드",
         "급행", "방면", "내리다", "타다", "자리"]

SLOT_MS = 3000
TARGET_DBFS = -20.0


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


def trim_lead(seg: AudioSegment) -> AudioSegment:
    """앞쪽 무음만 제거 (뒤는 슬롯 패딩으로 어차피 채워진다)."""
    from pydub.silence import detect_nonsilent
    sp = detect_nonsilent(seg, min_silence_len=30, silence_thresh=-45.0)
    if not sp:
        return seg
    return seg[max(0, sp[0][0] - 20):]


def main() -> None:
    ap = argparse.ArgumentParser(description="지하철 10단어 30초 오디오")
    ap.add_argument("--model", default="tts-1")
    ap.add_argument("--voice", default="nova", help="alloy / nova / shimmer")
    ap.add_argument("--speed", type=float, default=1.05)
    ap.add_argument("--out", default="out/audio")
    ap.add_argument("--name", default="subway_vocab_30s.mp3")
    ap.add_argument("--repeat-mode", choices=["place-twice", "single-call"], default="place-twice",
                    help="place-twice: 단어를 1회 생성해 슬롯에 두 번 배치(기본). "
                         "single-call: '단어. 단어.' 를 한 번에 요청 — 짧은 단어에서 반복이 삼켜진다")
    ap.add_argument("--first", type=float, default=0.15, help="1회차 시작(초)")
    ap.add_argument("--second", type=float, default=1.50, help="2회차 시작(초)")
    ap.add_argument("--force", action="store_true", help="캐시 무시하고 재호출")
    args = ap.parse_args()

    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg 을 PATH에서 찾을 수 없습니다.")

    out_dir = Path(args.out)
    raw_dir = out_dir / "words-subway"
    raw_dir.mkdir(parents=True, exist_ok=True)

    from openai import OpenAI
    client = OpenAI(api_key=load_api_key())

    print(f"\n=== 지하철 10단어 30초 트랙 ===")
    print(f"엔진: OpenAI  |  모델: {args.model}  |  보이스: {args.voice}  |  speed: {args.speed}")
    print(f"키: OPENAI_API_KEY(…{load_api_key()[-4:]})")
    print(f"슬롯 {SLOT_MS}ms × {len(WORDS)} = {SLOT_MS*len(WORDS)/1000:.0f}초")
    print(f"출력: {out_dir / args.name}\n")

    combined = AudioSegment.empty()
    calls = 0
    rows: list[dict] = []

    mode_tag = "single" if args.repeat_mode == "single-call" else "once"
    print("no  단어        원본(ms)  앞무음컷  발화(ms)  1회차(s)  2회차(s)  슬롯(ms)")
    for i, word in enumerate(WORDS, start=1):
        cache = raw_dir / f"{i:02d}_{word}_{mode_tag}.mp3"
        if cache.exists() and not args.force:
            seg_raw = AudioSegment.from_file(cache)
        else:
            # place-twice 에서는 단어를 한 번만 읽게 한다.
            # "단어. 단어." 를 한 번에 요청하면 짧은 단어에서 모델이 반복을 삼킨다
            # (역·출구·환승·방면·자리 가 실제로 1회만 읽혔다).
            text = f"{word}. {word}." if args.repeat_mode == "single-call" else f"{word}."
            resp = client.audio.speech.create(
                model=args.model, voice=args.voice, input=text, speed=args.speed,
            )
            cache.write_bytes(resp.content)
            calls += 1
            seg_raw = AudioSegment.from_file(io.BytesIO(resp.content), format="mp3")

        orig = len(seg_raw)
        word_seg = trim_lead(seg_raw)                          # 보정 ①
        lead_cut = orig - len(word_seg)
        word_seg = word_seg.apply_gain(TARGET_DBFS - word_seg.dBFS)

        def sil(ms: int) -> AudioSegment:
            return AudioSegment.silent(duration=max(0, ms), frame_rate=word_seg.frame_rate) \
                               .set_channels(word_seg.channels).set_sample_width(word_seg.sample_width)

        if args.repeat_mode == "single-call":
            slot = sil(int(args.first * 1000)) + word_seg
            first_s, second_s = args.first, -1.0
        else:
            d = len(word_seg)
            second_ms = int(args.second * 1000)
            if int(args.first * 1000) + d > second_ms:          # 첫 발음이 길면 2회차를 뒤로
                second_ms = int(args.first * 1000) + d + 150
            slot = sil(int(args.first * 1000)) + word_seg + \
                   sil(second_ms - int(args.first * 1000) - d) + word_seg
            first_s, second_s = args.first, second_ms / 1000

        if len(slot) < SLOT_MS:
            slot = slot + sil(SLOT_MS - len(slot))
        else:
            slot = slot[:SLOT_MS]

        assert len(slot) == SLOT_MS
        combined += slot
        rows.append({"word": word, "orig": orig, "lead": lead_cut,
                     "speech": len(word_seg), "first": first_s, "second": second_s})
        print(f"{i:02d}  {word:<10} {orig:8d}  {lead_cut:8d}  {len(word_seg):8d}  "
              f"{first_s:8.2f}  {second_s:8.2f}  {len(slot):8d}")

    # ── 내보내기 + 라우드니스 보정 ② ─────────────────────────────────────────
    raw_mp3 = out_dir / f"_raw_{args.name}"
    combined.export(raw_mp3, format="mp3", bitrate="192k")

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
                    "-t", f"{SLOT_MS*len(WORDS)/1000}", "-codec:a", "libmp3lame",
                    "-b:a", "192k", str(final)], check=True, timeout=120)
    raw_mp3.unlink()

    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(final)],
        capture_output=True, text=True, check=True).stdout.strip())

    print(f"\n{'=' * 66}")
    print(f"✅ 생성 완료: {final}  ({final.stat().st_size/1024:.1f}KB)")
    print(f"길이: {dur:.3f}초  ·  API 호출 {calls}회")
    print(f"\n[슬롯 시작 시각]")
    for i, r in enumerate(rows):
        gap = f"{r['second']}ms" if r["second"] > 0 else "미검출"
        print(f"  {i*3:>2}.0s ~ {(i+1)*3:>2}.0s   {r['word']:<8} 2회차 시작 {gap}")


if __name__ == "__main__":
    main()
