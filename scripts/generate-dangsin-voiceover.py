"""
'너 vs 당신' 12초 쇼트의 영어 보이스오버 — public/audio/korean-basic/dangsin-guide.mp3 (2026-11-04)

엔진: Edge-TTS en-US-AndrewNeural (무료, 키 없음). 세 줄을 따로 만든 뒤 0 / 3.5 / 7.5초 자리에 얹어 12초 한 파일로 합친다.
한국어 단어는 영어 목소리가 한국어에 가깝게 읽도록 발음대로 적는다(Dahng-sheen · Nuh · Shee).
한 줄이 다음 줄 시작 전에 끝나지 않으면 멈춘다 — 그때는 RATE 를 올리거나 문장을 줄인다.
합치기는 Remotion 에 딸린 ffmpeg(npx remotion ffmpeg)를 쓴다.

실행: python scripts/generate-dangsin-voiceover.py
"""
import asyncio
import json
import os
import shutil
import subprocess
from pathlib import Path

import edge_tts

VOICE = 'en-US-AndrewNeural'
RATE = '+15%'
TOTAL = 12.0
LINES = [
    (0.0, "Think twice before saying Dahng-sheen, or Nuh, in Korea."),
    (3.5, "It can sound rude or like picking a fight! Instead use their title or Name plus Shee."),
    (8.0, "Or even better? Just drop the word YOU, entirely!"),
]

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / 'out' / 'remotion' / 'vo'
OUT = ROOT / 'public' / 'audio' / 'korean-basic' / 'dangsin-guide.mp3'


def find_ffmpeg_dir() -> Path:
    # Remotion 에 딸린 ffmpeg 는 silenceremove 가 빠진 축소판이라 쓸 수 없다 — PATH 또는 winget(Gyan.FFmpeg) 정식 빌드를 찾는다
    hit = shutil.which('ffmpeg')
    if hit:
        return Path(hit).parent
    pkgs = Path(os.environ.get('LOCALAPPDATA', '')) / 'Microsoft' / 'WinGet' / 'Packages'
    for exe in pkgs.glob('Gyan.FFmpeg*/*/bin/ffmpeg.exe'):
        return exe.parent
    raise SystemExit('정식 ffmpeg 가 없다 — winget install Gyan.FFmpeg')


FFDIR = find_ffmpeg_dir()


def run(tool: str, *args: str) -> subprocess.CompletedProcess:
    r = subprocess.run([str(FFDIR / tool), *args], capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0:
        raise SystemExit(r.stderr[-2000:])
    return r


def ffmpeg(*args: str) -> None:
    run('ffmpeg', '-hide_banner', '-loglevel', 'error', *args)


def duration(p: Path) -> float:
    r = run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(p))
    return float(json.loads(r.stdout)['format']['duration'])


async def main() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    clips = []
    for i, (start, text) in enumerate(LINES):
        raw = WORK / f'line{i + 1}-raw.mp3'
        p = WORK / f'line{i + 1}.wav'
        await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(raw))
        # Edge-TTS 가 앞뒤에 붙이는 무음을 걷어 낸다 — 자리(0 / 3.5 / 8초)에 말이 바로 시작되도록
        trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
        ffmpeg('-y', '-i', str(raw), '-af', trim, str(p))
        d = duration(p)
        end = LINES[i + 1][0] if i + 1 < len(LINES) else TOTAL
        print(f'line{i + 1}: {start:.1f}s + {d:.2f}s = {start + d:.2f}s (window ends {end:.1f}s)')
        if start + d > end:
            raise SystemExit(f'line{i + 1} 이 {end}s 를 넘는다 — RATE 를 올리거나 문장을 줄일 것')
        clips.append((start, p))

    inputs = [a for _, p in clips for a in ('-i', str(p))]
    delays = ';'.join(f'[{i}:a]adelay={int(s * 1000)}:all=1[a{i}]' for i, (s, _) in enumerate(clips))
    mix = ''.join(f'[a{i}]' for i in range(len(clips)))
    graph = f'{delays};{mix}amix=inputs={len(clips)}:normalize=0,apad=whole_dur={TOTAL}[out]'
    ffmpeg('-y', *inputs, '-filter_complex', graph, '-map', '[out]', '-t', str(TOTAL),
           '-ar', '44100', '-ac', '2', '-b:a', '128k', str(OUT))
    print(f'✅ {OUT.relative_to(ROOT)} ({duration(OUT):.2f}s)')


asyncio.run(main())
