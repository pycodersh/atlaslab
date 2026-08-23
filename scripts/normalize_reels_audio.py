#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
릴스 오디오 라우드니스 정규화 (API 재호출 없음)

OpenAI TTS 원본은 -35 LUFS 안팎으로 매우 작다. 소셜 영상 표준인 -16 LUFS로 맞춘다.
원본은 각 폴더의 _raw/ 로 옮겨 보존한다 (이미 있으면 그 원본을 다시 쓴다).

사용:
  python scripts/normalize_reels_audio.py                    # reels-audio/ 전체
  python scripts/normalize_reels_audio.py --dir reels-audio/gago-sipeoyo
  python scripts/normalize_reels_audio.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    except Exception:
        pass

TARGET_I, TARGET_TP, TARGET_LRA = -16.0, -1.5, 11.0
BITRATE = "192k"


def measure(path: Path) -> dict | None:
    out = subprocess.run(
        ["ffmpeg", "-v", "info", "-i", str(path),
         "-af", f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json",
         "-f", "null", "-"],
        capture_output=True, text=True, errors="replace",
    ).stderr
    m = re.search(r"\{[^{}]*input_i[^{}]*\}", out, re.S)
    return json.loads(m.group(0)) if m else None


def normalize(src: Path, dst: Path, m: dict) -> None:
    """
    2-pass loudnorm. 1-pass(dynamic)는 짧은 클립에서 목표를 2~3dB 빗나간다.
    1차 측정값을 넘겨 linear 보정하면 정확히 맞는다.
    """
    flt = (
        f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}"
        f":measured_I={m['input_i']}:measured_TP={m['input_tp']}"
        f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}"
        f":offset={m['target_offset']}:linear=true:print_format=summary"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(src), "-af", flt,
         "-codec:a", "libmp3lame", "-b:a", BITRATE, "-ar", "44100", str(dst)],
        check=True,
    )


def main() -> None:
    ap = argparse.ArgumentParser(description="릴스 오디오 라우드니스 정규화")
    ap.add_argument("--dir", default="reels-audio", help="대상 폴더")
    ap.add_argument("--dry-run", action="store_true", help="측정만 하고 바꾸지 않음")
    args = ap.parse_args()

    root = Path(args.dir)
    if not root.exists():
        raise SystemExit(f"폴더 없음: {root}")

    files = sorted(p for p in root.rglob("*.mp3") if "_raw" not in p.parts)
    if not files:
        raise SystemExit(f"{root} 에 mp3 가 없습니다")

    print(f"대상 {len(files)}파일  ·  목표 I={TARGET_I} LUFS / TP={TARGET_TP} dBTP\n")
    print(f"{'파일':<44} {'변경전(LUFS)':>13} {'피크':>9}   {'변경후':>9}")

    changed = 0
    for f in files:
        raw_dir = f.parent / "_raw"
        raw = raw_dir / f.name
        src = raw if raw.exists() else f          # 이미 보존된 원본이 있으면 그걸 쓴다

        before = measure(src)
        if before is None:
            print(f"{str(f.relative_to(root)):<44}  측정 실패 — 건너뜀")
            continue

        label = str(f.relative_to(root))
        if args.dry_run:
            print(f"{label:<44} {before['input_i']:>13} {before['input_tp']:>9}   (dry-run)")
            continue

        if not raw.exists():
            raw_dir.mkdir(parents=True, exist_ok=True)
            raw.write_bytes(f.read_bytes())

        tmp = f.with_suffix(".norm.mp3")
        normalize(src, tmp, before)
        tmp.replace(f)
        after = measure(f)
        changed += 1
        print(f"{label:<44} {before['input_i']:>13} {before['input_tp']:>9}   "
              f"{after['input_i'] if after else '?':>9}")

    if not args.dry_run:
        print(f"\n정규화 {changed}파일 · 원본은 각 폴더 _raw/ 에 보존")


if __name__ == "__main__":
    main()
