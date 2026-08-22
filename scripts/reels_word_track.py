#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한국어 단어 릴스 음성 트랙 생성기

한국어 단어 10개를 OpenAI TTS로 읽어, 각 단어를 3초 슬롯 안에서 두 번씩 들려주는
오디오 트랙 하나를 만든다. 캔바에서 페이지 길이 3초로 맞춰 얹을 수 있도록,
각 단어의 시작 시각은 3초의 정확한 배수가 된다.

핵심 전제 — 타이밍은 TTS에게 맡기지 않는다.
  OpenAI TTS는 SSML도, 무음 길이 지정 수단도 없다. 마침표로 생기는 쉼은
  0.3~0.8초로 불규칙해 누적 오차가 커진다. 그래서 역할을 나눈다.
    · TTS는 발음만 담당
    · 타이밍은 코드가 잡는다 — 무음 기준으로 잘라내고 3초 격자에 다시 배치

필요: python 3.10+, openai, numpy, ffmpeg(PATH)
키:   환경변수 OPENAI_API_KEY (없으면 patto/.env.local 에서 읽는다)

사용:
  python scripts/reels_word_track.py
  python scripts/reels_word_track.py --voice shimmer --pitch 2 --slot 3.5
  python scripts/reels_word_track.py --force            # 캐시 무시하고 재호출
"""
from __future__ import annotations

import argparse
import io
import os
import re
import shutil
import struct
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

# 윈도우 콘솔 기본 코덱(cp949)은 한글·em dash를 못 찍는다 — 출력 스트림을 UTF-8로 바꾼다
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    except Exception:
        pass

SR = 44100

# ── 단어 목록 (순서 고정, 번호는 파일명에 쓴다) ──────────────────────────────
WORDS: list[tuple[str, str]] = [
    ("사과", "sagwa"),
    ("물", "mul"),
    ("밥", "bap"),
    ("학교", "hakgyo"),
    ("친구", "chingu"),
    ("빵", "ppang"),
    ("우유", "uyu"),
    ("커피", "keopi"),
    ("차", "cha"),
    ("고기", "gogi"),
]

TTS_INPUT = "\n".join(f"{ko}." for ko, _ in WORDS)

INSTRUCTIONS = """You are a female Korean news announcer with a bright, high-pitched voice.
Read each Korean word clearly and crisply in standard Seoul Korean.
Pitch: high and light. Tone: clean, professional, friendly.
Enunciate every syllable distinctly and hold the vowels fully — this is a
pronunciation model for language learners.
Pause fully between words. Leave a long, silent gap after each word before
starting the next one.
Read only the words given. Do not add greetings, numbers, or any other words.
Keep the pitch, volume, and pace identical for every word."""

# 폴백(단어별 호출)에서는 쉼 관련 두 줄을 뺀다
INSTRUCTIONS_SINGLE = "\n".join(
    line for line in INSTRUCTIONS.splitlines()
    if not line.startswith("Pause fully") and not line.startswith("Leave a long")
)

AI_DISCLOSURE = "이 영상의 음성은 AI로 생성되었습니다. / Voice generated with AI (OpenAI TTS)."


# ── 오디오 입출력 ────────────────────────────────────────────────────────────
def read_wav_mono(path: Path) -> np.ndarray:
    """wav를 44.1kHz 모노 float32 [-1,1]로 읽는다. 필요하면 ffmpeg로 변환."""
    try:
        with wave.open(str(path), "rb") as w:
            ch, width, rate, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
            raw = w.readframes(n)
        if width == 2:
            data = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
        elif width == 4:
            data = np.frombuffer(raw, dtype="<i4").astype(np.float32) / 2147483648.0
        elif width == 1:
            data = (np.frombuffer(raw, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
        else:
            raise ValueError(f"지원하지 않는 샘플 폭: {width}")
        if ch > 1:
            data = data.reshape(-1, ch).mean(axis=1)
        if rate != SR:
            data = resample_ffmpeg(data, rate, SR)
        return data.astype(np.float32)
    except (wave.Error, ValueError):
        # 표준 wave 모듈이 못 읽는 형식(예: WAVE_FORMAT_EXTENSIBLE) → ffmpeg 경유
        return decode_via_ffmpeg(path)


def decode_via_ffmpeg(path: Path) -> np.ndarray:
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR),
         "-f", "f32le", "-"],
        capture_output=True, check=True,
    )
    return np.frombuffer(out.stdout, dtype="<f4").astype(np.float32)


def resample_ffmpeg(data: np.ndarray, src_rate: int, dst_rate: int) -> np.ndarray:
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(src_rate), "-ac", "1", "-i", "-",
         "-ar", str(dst_rate), "-ac", "1", "-f", "f32le", "-"],
        input=data.astype("<f4").tobytes(), capture_output=True, check=True,
    )
    return np.frombuffer(p.stdout, dtype="<f4").astype(np.float32)


def write_wav(path: Path, data: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(data, -1.0, 1.0) * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def wav_to_mp3(src: Path, dst: Path, bitrate: str = "192k") -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(src), "-codec:a", "libmp3lame",
         "-b:a", bitrate, str(dst)],
        check=True,
    )


def shift_pitch(data: np.ndarray, semitones: float) -> np.ndarray:
    """음높이만 올리고 길이는 유지한다."""
    if abs(semitones) < 1e-9:
        return data
    r = 2 ** (semitones / 12.0)
    flt = f"asetrate={SR}*{r},aresample={SR},atempo={1/r}"
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-af", flt, "-f", "f32le", "-ar", str(SR), "-ac", "1", "-"],
        input=data.astype("<f4").tobytes(), capture_output=True, check=True,
    )
    return np.frombuffer(p.stdout, dtype="<f4").astype(np.float32)


# ── 무음 기준 분할 ───────────────────────────────────────────────────────────
def rms_envelope(data: np.ndarray, win_ms: float = 20.0) -> tuple[np.ndarray, int]:
    hop = max(1, int(SR * win_ms / 1000.0))
    n = len(data) // hop
    if n == 0:
        return np.zeros(1, dtype=np.float32), hop
    trimmed = data[: n * hop].reshape(n, hop)
    return np.sqrt((trimmed.astype(np.float64) ** 2).mean(axis=1)).astype(np.float32), hop


def split_on_silence(
    data: np.ndarray,
    thresh_ratio: float = 0.025,
    merge_gap_s: float = 0.35,
    min_len_s: float = 0.12,
) -> list[tuple[int, int]]:
    env, hop = rms_envelope(data)
    peak = float(env.max()) if env.size else 0.0
    if peak <= 0:
        return []
    voiced = env > (peak * thresh_ratio)

    spans: list[list[int]] = []
    start = None
    for i, v in enumerate(voiced):
        if v and start is None:
            start = i
        elif not v and start is not None:
            spans.append([start, i])
            start = None
    if start is not None:
        spans.append([start, len(voiced)])

    # 간격이 짧으면 같은 덩이로 병합 (한 단어 안의 짧은 끊김 흡수)
    merge_hops = merge_gap_s * SR / hop
    merged: list[list[int]] = []
    for s in spans:
        if merged and (s[0] - merged[-1][1]) < merge_hops:
            merged[-1][1] = s[1]
        else:
            merged.append(s)

    min_hops = min_len_s * SR / hop
    out: list[tuple[int, int]] = []
    for s, e in merged:
        if (e - s) >= min_hops:
            out.append((s * hop, min(len(data), e * hop)))
    return out


# ── 클립 다듬기 ──────────────────────────────────────────────────────────────
def trim_edges(clip: np.ndarray, thresh_ratio: float = 0.02, pad_s: float = 0.04) -> np.ndarray:
    env, hop = rms_envelope(clip)
    peak = float(env.max()) if env.size else 0.0
    if peak <= 0:
        return clip
    voiced = np.where(env > peak * thresh_ratio)[0]
    if voiced.size == 0:
        return clip
    pad = int(pad_s * SR)
    s = max(0, voiced[0] * hop - pad)
    e = min(len(clip), (voiced[-1] + 1) * hop + pad)
    return clip[s:e]


def normalize_peak(clip: np.ndarray, target: float = 0.89) -> np.ndarray:
    peak = float(np.abs(clip).max()) if clip.size else 0.0
    return clip if peak <= 0 else (clip * (target / peak)).astype(np.float32)


def apply_fades(clip: np.ndarray, fade_ms: float = 12.0) -> np.ndarray:
    n = min(int(SR * fade_ms / 1000.0), len(clip) // 2)
    if n <= 0:
        return clip
    out = clip.copy()
    ramp = np.linspace(0.0, 1.0, n, dtype=np.float32)
    out[:n] *= ramp
    out[-n:] *= ramp[::-1]
    return out


def polish(clip: np.ndarray) -> np.ndarray:
    return apply_fades(normalize_peak(trim_edges(clip)))


# ── TTS ──────────────────────────────────────────────────────────────────────
def load_api_key() -> str:
    key = os.environ.get("OPENAI_API_KEY")
    if key:
        return key
    # 이 저장소는 키를 patto/.env.local 에 둔다 — 환경변수가 없으면 거기서 읽는다
    for candidate in (Path.cwd() / ".env.local", Path(__file__).resolve().parent.parent / ".env.local"):
        if candidate.exists():
            for line in candidate.read_text(encoding="utf-8").splitlines():
                m = re.match(r"^\s*OPENAI_API_KEY\s*=\s*(.+?)\s*$", line)
                if m:
                    return m.group(1).strip().strip('"').strip("'")
    raise SystemExit("OPENAI_API_KEY 를 찾을 수 없습니다 (환경변수 또는 .env.local)")


def tts_to_file(client, model: str, voice: str, text: str, instructions: str, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    with client.audio.speech.with_streaming_response.create(
        model=model, voice=voice, input=text,
        instructions=instructions, response_format="wav",
    ) as resp:
        resp.stream_to_file(str(dst))
    if dst.stat().st_size == 0:
        raise SystemExit(f"TTS 응답 0바이트: {dst}")


# ── 메인 ─────────────────────────────────────────────────────────────────────
def main() -> None:
    ap = argparse.ArgumentParser(description="한국어 단어 릴스 음성 트랙 생성")
    ap.add_argument("--voice", default="nova", help="기본 nova. 대안: shimmer, coral, sage, marin")
    ap.add_argument("--model", default="gpt-4o-mini-tts")
    ap.add_argument("--pitch", type=float, default=0.0, help="반음 단위 피치 상승")
    ap.add_argument("--slot", type=float, default=3.0, help="단어당 초")
    ap.add_argument("--gap", type=float, default=0.0, help="두 번 읽는 사이 간격. 0이면 자동")
    ap.add_argument("--lead", type=float, default=0.15, help="슬롯 시작 여백")
    ap.add_argument("--offset", type=float, default=0.0, help="앞 타이틀 화면 길이")
    ap.add_argument("--tail", type=float, default=0.0, help="뒤 마무리 화면 길이")
    ap.add_argument("--out", default="out", help="출력 폴더")
    ap.add_argument("--force", action="store_true", help="캐시를 무시하고 TTS 재호출")
    args = ap.parse_args()

    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg 을 PATH에서 찾을 수 없습니다.")

    out_dir = Path(args.out)
    words_dir = out_dir / "words"
    raw_dir = out_dir / "raw"
    source = out_dir / "source.wav"
    out_dir.mkdir(parents=True, exist_ok=True)
    words_dir.mkdir(parents=True, exist_ok=True)

    api_calls = 0
    warnings: list[str] = []
    client = None

    def get_client():
        nonlocal client
        if client is None:
            from openai import OpenAI
            client = OpenAI(api_key=load_api_key())
        return client

    # ── 1단계 — TTS 호출 (source.wav 가 있으면 건너뛴다) ─────────────────────
    if source.exists() and not args.force:
        print(f"[1] 캐시 사용: {source} (API 호출 0회)")
    else:
        print(f"[1] TTS 호출 — {args.model} / {args.voice} / 1회")
        tts_to_file(get_client(), args.model, args.voice, TTS_INPUT, INSTRUCTIONS, source)
        api_calls += 1
        print(f"    → {source} ({source.stat().st_size/1024:.1f}KB)")

    # ── 2단계 — 무음 기준 분할 ───────────────────────────────────────────────
    audio = read_wav_mono(source)
    print(f"[2] source 길이 {len(audio)/SR:.2f}초 — 무음 기준 분할")
    spans = split_on_silence(audio)
    print(f"    감지된 덩이: {len(spans)}개")

    clips: list[np.ndarray] = []
    fallback_used = False

    if len(spans) == len(WORDS):
        clips = [audio[s:e] for s, e in spans]
    else:
        # ── 3단계 — 폴백 (단어별 호출) ───────────────────────────────────────
        print(f"    감지된 덩이: {len(spans)}개 — 단어별 재생성으로 전환합니다")
        raw_dir.mkdir(parents=True, exist_ok=True)
        fallback_used = True
        # 폴백 원본은 raw/ 에 둔다. words/ 에 바로 쓰면 4단계의 "기존 파일 덮어쓰지 않음"
        # 규칙에 걸려 다듬기를 건너뛰고 앞뒤 무음이 그대로 남는다.
        for i, (ko, ro) in enumerate(WORDS, start=1):
            raw = raw_dir / f"{i:02d}_{ko}.wav"
            final = words_dir / f"{i:02d}_{ko}.wav"
            if final.exists() and not args.force:
                print(f"    [{i:02d}] {ko} — words/ 에 기존 파일 있음, 호출 생략")
                continue
            if raw.exists() and not args.force:
                print(f"    [{i:02d}] {ko} — raw/ 캐시 사용")
                continue
            tts_to_file(get_client(), args.model, args.voice, ko, INSTRUCTIONS_SINGLE, raw)
            api_calls += 1
            print(f"    [{i:02d}] {ko} — 생성 ({raw.stat().st_size/1024:.1f}KB)")
        warnings.append("폴백(단어별 호출) 경로를 탔습니다 — 단어마다 톤이 조금씩 다를 수 있습니다.")

    # ── 4단계 — 클립 다듬기 (기존 파일은 덮어쓰지 않는다) ────────────────────
    print("[4] 클립 다듬기 (앞뒤 무음 제거 → 피크 정규화 0.89 → 페이드 12ms)")
    finals: list[np.ndarray] = []
    for i, (ko, ro) in enumerate(WORDS, start=1):
        dst = words_dir / f"{i:02d}_{ko}.wav"
        raw = raw_dir / f"{i:02d}_{ko}.wav"
        if dst.exists():
            # 사용자가 직접 녹음해 넣은 파일이 있으면 그대로 쓴다 (덮어쓰지 않는다)
            clip = read_wav_mono(dst)
            print(f"    [{i:02d}] {ko:<4} 기존 파일 사용  {len(clip)/SR:.2f}초")
        else:
            src_clip = read_wav_mono(raw) if fallback_used else clips[i - 1]
            before = len(src_clip) / SR
            clip = polish(src_clip)
            write_wav(dst, clip)
            print(f"    [{i:02d}] {ko:<4} 생성  {before:.2f}초 → {len(clip)/SR:.2f}초")
        finals.append(clip)

    # ── 피치 (길이 불변) ─────────────────────────────────────────────────────
    if abs(args.pitch) > 1e-9:
        print(f"[4b] 피치 +{args.pitch} 반음 (길이 유지)")
        finals = [shift_pitch(c, args.pitch) for c in finals]

    # ── 5단계 — 3초 격자 배치 ────────────────────────────────────────────────
    SLOT, LEAD = args.slot, args.lead
    total_s = args.offset + SLOT * len(WORDS) + args.tail
    track = np.zeros(int(round(total_s * SR)), dtype=np.float32)

    print(f"[5] 격자 배치 — 슬롯 {SLOT}s, lead {LEAD}s, offset {args.offset}s, tail {args.tail}s")
    cues: list[str] = []
    for i, ((ko, ro), clip) in enumerate(zip(WORDS, finals)):
        d = len(clip) / SR
        if args.gap > 0:
            gap = args.gap
        else:
            gap = min(1.0, max(0.25, SLOT - LEAD - 2 * d - 0.30))

        if LEAD + 2 * d + gap > SLOT:
            warnings.append(
                f"{ko}: 슬롯을 넘칩니다 (lead {LEAD} + 2×{d:.2f} + gap {gap:.2f} = "
                f"{LEAD + 2*d + gap:.2f}s > {SLOT}s) — --slot 을 늘리세요"
            )

        # 슬롯 시작은 gap 계산과 무관하게 언제나 offset + i*SLOT
        slot_start = args.offset + i * SLOT
        for k, rel in enumerate((LEAD, LEAD + d + gap)):
            at = int(round((slot_start + rel) * SR))
            end = min(len(track), at + len(clip))
            if end > at:
                track[at:end] += clip[: end - at]

        cues.append(f"{slot_start:7.3f}  {ko:<4} {ro:<8} 1회 {d:.2f}s  gap {gap:.2f}s")

    # ── 6단계 — 출력 ─────────────────────────────────────────────────────────
    track_wav = out_dir / "track.wav"
    track_mp3 = out_dir / "track.mp3"
    write_wav(track_wav, np.clip(track, -1.0, 1.0))
    wav_to_mp3(track_wav, track_mp3)

    cues_path = out_dir / "cues.txt"
    with open(cues_path, "w", encoding="utf-8") as f:
        f.write("시작(s)  한글  로마자   1회 길이   gap\n")
        f.write("\n".join(cues) + "\n")

    readme = out_dir / "README.md"
    if not readme.exists():
        with open(readme, "w", encoding="utf-8") as f:
            f.write("# 한국어 단어 릴스 트랙\n\n")
            f.write("## AI 음성 표기 (릴스 캡션에 넣을 문구)\n\n")
            f.write(f"> {AI_DISCLOSURE}\n\n")
            f.write("OpenAI 이용정책상 AI로 생성한 음성임을 청자에게 알려야 합니다.\n\n")
            f.write("## 특정 단어만 직접 녹음해 교체하기\n\n")
            f.write("`out/words/NN_단어.wav` 를 같은 이름으로 덮어쓰면 그 파일이 그대로 쓰입니다.\n")
            f.write("(된소리 `빵`이나 종성이 흐릴 때 유용합니다.)\n")

    print("\n" + "=" * 60)
    print(f"총 길이: {len(track)/SR:.3f}초  (기대 {total_s:.3f}초)")
    print(f"API 호출: {api_calls}회")
    print(f"  {track_wav}")
    print(f"  {track_mp3}")
    print(f"  {cues_path}")
    print("\n[cues]")
    print("시작(s)  한글  로마자   1회 길이   gap")
    for c in cues:
        print(c)

    if warnings:
        print("\n[경고]")
        for w in warnings:
            print(f"  ⚠️ {w}")
    if fallback_used:
        print("\n  ※ 폴백 경로였으므로 단어별 톤 차이를 한 번 들어보세요.")

    print(f"\n[AI 음성 표기] {AI_DISCLOSURE}")


if __name__ == "__main__":
    main()
