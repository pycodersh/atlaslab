#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한국어 학습용 발음 MP3 생성 — 10단어 × 3초 슬롯 = 정확히 30초

각 3초 슬롯 안에서 같은 단어를 두 번 발음한다.
슬롯 길이는 pydub 으로 확정한다 — 짧으면 뒤에 무음을 채우고, 넘치면 배속을 올린다.

TTS: Edge-TTS (ko-KR-SunHiNeural) — API 키·과금 없음
필요: python 3.10+, edge-tts, pydub, ffmpeg(PATH)

사용:
  python scripts/korean_vocab_30s.py
  python scripts/korean_vocab_30s.py --voice ko-KR-InJoonNeural
  python scripts/korean_vocab_30s.py --force        # 캐시 무시하고 재생성
"""
from __future__ import annotations

import argparse
import asyncio
import shutil
import sys
from pathlib import Path

from pydub import AudioSegment

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    except Exception:
        pass

WORD_SETS: dict[str, list[str]] = {
    "restaurant": ["식당", "메뉴", "주문", "반찬", "공기밥",
                   "숟가락", "젓가락", "물수건", "맛있다", "매워요"],
    "subway":     ["지하철", "역", "출구", "환승", "교통카드",
                   "급행", "방면", "내리다", "타다", "자리"],
    "taxi":       ["택시", "기사님", "어디", "여기", "세워주세요",
                   "직진", "좌회전", "우회전", "요금", "잔돈"],
    "banchan":    ["반찬", "김치", "더", "주세요", "저기요",
                   "물", "셀프", "무료", "그릇", "리필"],
}

SLOT_MS = 3000          # 슬롯 길이 — 반드시 이 값으로 맞춘다
GAP_MS = 500            # 같은 슬롯 안 두 발음 사이 간격
LEAD_MS = 150           # 슬롯 시작 여백
DEFAULT_VOICE = "ko-KR-SunHiNeural"


async def synth(text: str, voice: str, dst: Path) -> None:
    import edge_tts
    dst.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text, voice).save(str(dst))


def trim_silence(seg: AudioSegment, silence_db: float = -45.0) -> AudioSegment:
    """앞뒤 무음 제거. TTS 결과 앞에 붙는 여백 때문에 발음 시작이 밀리는 걸 막는다."""
    from pydub.silence import detect_nonsilent
    spans = detect_nonsilent(seg, min_silence_len=30, silence_thresh=silence_db)
    if not spans:
        return seg
    start = max(0, spans[0][0] - 20)
    end = min(len(seg), spans[-1][1] + 40)
    return seg[start:end]


def speed_up(seg: AudioSegment, factor: float) -> AudioSegment:
    """음높이는 유지하지 않는 단순 배속 (pydub 표준 방식). 1.0 이하면 그대로."""
    if factor <= 1.0:
        return seg
    out = seg._spawn(seg.raw_data, overrides={"frame_rate": int(seg.frame_rate * factor)})
    return out.set_frame_rate(seg.frame_rate)


def main() -> None:
    ap = argparse.ArgumentParser(description="한국어 10단어 30초 발음 MP3 생성")
    ap.add_argument("--voice", default=DEFAULT_VOICE,
                    help="ko-KR-SunHiNeural(여성) 또는 ko-KR-InJoonNeural(남성)")
    ap.add_argument("--out", default="out/audio", help="출력 폴더")
    ap.add_argument("--name", default="korean_vocab_30s.mp3", help="최종 파일명")
    ap.add_argument("--set", default="restaurant", choices=sorted(WORD_SETS), help="단어 세트")
    ap.add_argument("--force", action="store_true", help="캐시 무시하고 TTS 재생성")
    args = ap.parse_args()

    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg 을 PATH에서 찾을 수 없습니다.")

    WORDS = WORD_SETS[args.set]
    out_dir = Path(args.out)
    words_dir = out_dir / f"words-{args.set}-edge"
    words_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n=== 한국어 10단어 30초 트랙 ===")
    print(f"TTS: Edge-TTS  |  보이스: {args.voice}  (API 키 불필요)")
    print(f"슬롯: {SLOT_MS}ms × {len(WORDS)}개 = {SLOT_MS*len(WORDS)/1000:.1f}초")
    print(f"출력: {out_dir / args.name}\n")

    # ── 1. 단어별 TTS ────────────────────────────────────────────────────────
    print("[1] 단어별 음성 생성")
    files: list[Path] = []
    for i, w in enumerate(WORDS, start=1):
        dst = words_dir / f"{i:02d}_{w}.mp3"
        if dst.exists() and not args.force:
            print(f"    [{i:02d}] {w:<5} 캐시 사용")
        else:
            asyncio.run(synth(w, args.voice, dst))
            if dst.stat().st_size == 0:
                raise SystemExit(f"TTS 응답 0바이트: {dst}")
            print(f"    [{i:02d}] {w:<5} 생성 ({dst.stat().st_size/1024:.1f}KB)")
        files.append(dst)

    # ── 2. 슬롯 구성 ─────────────────────────────────────────────────────────
    print(f"\n[2] 슬롯 구성 (단어 2회, 사이 {GAP_MS}ms, 슬롯 {SLOT_MS}ms 고정)")
    print("no  단어      원본(ms)  사용(ms)  배속    2회차 시작  슬롯(ms)")
    track = AudioSegment.empty()
    report: list[dict] = []

    TARGET_DBFS = -20.0   # 단어별 레벨 통일 — Edge-TTS 출력은 단어마다 최대 9dB 차이가 난다

    for i, (w, f) in enumerate(zip(WORDS, files), start=1):
        seg = trim_silence(AudioSegment.from_file(f))
        seg = seg.apply_gain(TARGET_DBFS - seg.dBFS)
        orig = len(seg)

        # 슬롯 예산: 여백 + 단어 + 간격 + 단어 <= 3000ms
        budget = SLOT_MS - LEAD_MS - GAP_MS
        factor = 1.0
        if orig * 2 > budget:
            factor = (orig * 2) / budget
            seg = speed_up(seg, factor)

        d = len(seg)
        # 무음도 단어와 같은 샘플레이트로 만든다.
        # AudioSegment.silent() 기본값은 11025Hz라, 그대로 붙이면 레이트가 섞여
        # 길이가 밀린다(30.000 → 29.996초).
        def sil(ms: int) -> AudioSegment:
            return AudioSegment.silent(duration=ms, frame_rate=seg.frame_rate) \
                               .set_channels(seg.channels).set_sample_width(seg.sample_width)

        slot = sil(LEAD_MS) + seg + sil(GAP_MS) + seg

        if len(slot) < SLOT_MS:
            slot += sil(SLOT_MS - len(slot))                            # 뒤를 무음으로 패딩
        elif len(slot) > SLOT_MS:
            slot = slot[:SLOT_MS]                                       # 이론상 발생하지 않음

        assert len(slot) == SLOT_MS, f"{w}: 슬롯 {len(slot)}ms"
        track += slot

        second_at = (LEAD_MS + d + GAP_MS) / 1000
        report.append({"no": i, "word": w, "orig": orig, "used": d,
                       "factor": factor, "second_at": second_at, "slot": len(slot)})
        print(f"{i:02d}  {w:<8} {orig:8d}  {d:8d}  {factor:5.3f}  "
              f"{second_at:10.2f}  {len(slot):8d}")

    # ── 3. 내보내기 ──────────────────────────────────────────────────────────
    final = out_dir / args.name
    raw_mp3 = out_dir / f"_raw_{args.name}"
    track.export(raw_mp3, format="mp3", bitrate="192k")

    # 전체 라우드니스를 영상용 표준(-16 LUFS)으로 맞춘다
    import json as _json, re as _re, subprocess as _sp
    probe = _sp.run(["ffmpeg", "-v", "info", "-i", str(raw_mp3),
                     "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
                     "-f", "null", "-"], capture_output=True, text=True, errors="replace").stderr
    m = _re.search(r"\{[^{}]*input_i[^{}]*\}", probe, _re.S)
    flt = "loudnorm=I=-16:TP=-1.5:LRA=11"
    if m:
        j = _json.loads(m.group(0))
        flt += (f":measured_I={j['input_i']}:measured_TP={j['input_tp']}"
                f":measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}"
                f":offset={j['target_offset']}:linear=true")
        print(f"\n[정규화] {j['input_i']} LUFS → -16 LUFS")
    _sp.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw_mp3), "-af", flt,
             "-t", f"{SLOT_MS*len(WORDS)/1000}", "-codec:a", "libmp3lame",
             "-b:a", "192k", str(final)], check=True, timeout=120)
    raw_mp3.unlink()

    check = AudioSegment.from_file(final)
    print(f"\n{'=' * 62}")
    print(f"최종: {final}  ({final.stat().st_size/1024:.1f}KB)")
    print(f"길이: {len(track)/1000:.3f}초 (조립) / {len(check)/1000:.3f}초 (파일 재확인)")
    print(f"\n[슬롯 시작 시각]")
    for r in report:
        print(f"  {(r['no']-1)*3:>2}.0s ~ {(r['no'])*3:>2}.0s   {r['word']}, {r['word']}"
              f"   (1회차 {LEAD_MS/1000:.2f}s · 2회차 {r['second_at']:.2f}s)")
    sped = [r for r in report if r["factor"] > 1.0]
    if sped:
        print(f"\n[배속 조정 {len(sped)}건]")
        for r in sped:
            print(f"  {r['word']}: {r['orig']}ms → {r['used']}ms (×{r['factor']:.3f})")
    else:
        print("\n배속 조정: 없음 (전부 원본 속도)")


if __name__ == "__main__":
    main()
