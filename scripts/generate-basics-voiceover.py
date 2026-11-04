"""
Basics 12초 쇼트의 영어 보이스오버 — remotion/KoreanBasic/videos.json 의 narration 을 읽어 각 항목의 audio 경로(public/ 아래)에 만든다.

엔진: Edge-TTS en-US-AndrewNeural (무료, 키 없음), rate +15%. 한 줄씩 따로 만든 뒤 [시작 초] 자리에 얹어 12초 한 파일로 합친다.
한국어 단어는 영어 목소리가 한국어에 가깝게 읽도록 발음대로 적는다(Dahng-sheen · Nuh · Shee).
한 줄이 다음 줄 시작(마지막 줄은 12초) 전에 끝나지 않으면 그 영상은 쓰지 않고 넘어간다 — 문장을 줄여 다시 돌린다.
합치기는 정식 ffmpeg 빌드로 한다. Remotion 에 딸린 ffmpeg 는 silenceremove 가 빠진 축소판이다.

실행: python scripts/generate-basics-voiceover.py            # 파일이 아직 없는 항목만
      python scripts/generate-basics-voiceover.py <slug> ...  # 지정한 항목을 다시 만든다
"""
import asyncio
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import aiohttp
import edge_tts

VOICE = 'en-US-AndrewNeural'
RATE = '+15%'
TOTAL = 12.0

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'remotion' / 'KoreanBasic' / 'videos.json'
WORK = ROOT / 'out' / 'remotion' / 'vo'


def find_ffmpeg_dir() -> Path:
    # PATH 또는 winget(Gyan.FFmpeg) 정식 빌드를 찾는다
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


async def tts(text: str, path: Path) -> None:
    # Edge-TTS 는 가끔 빈 응답(NoAudioReceived)이나 소켓 타임아웃을 준다 — 잠깐 쉬고 다시 청한다
    # 연달아 청하면 막히는 일이 잦아 요청 사이에 1.5초를 둔다
    for attempt in range(6):
        await asyncio.sleep(1.5)
        try:
            await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(path))
            return
        except (edge_tts.exceptions.NoAudioReceived, aiohttp.ClientError, asyncio.TimeoutError):
            if attempt == 5:
                raise
            await asyncio.sleep(5 * (attempt + 1))


async def build(slug: str, entry: dict) -> bool:
    lines = entry['narration']
    out = ROOT / 'public' / entry['audio']
    work = WORK / slug
    work.mkdir(parents=True, exist_ok=True)
    clips, ok = [], True
    for i, (start, text) in enumerate(lines):
        raw = work / f'line{i + 1}-raw.mp3'
        p = work / f'line{i + 1}.wav'
        await tts(text, raw)
        # Edge-TTS 가 앞뒤에 붙이는 무음을 걷어 낸다 — 정한 자리에 말이 바로 시작되도록
        trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
        ffmpeg('-y', '-i', str(raw), '-af', trim, str(p))
        d = duration(p)
        end = lines[i + 1][0] if i + 1 < len(lines) else TOTAL
        fits = start + d <= end
        ok &= fits
        print(f'  line{i + 1}: {start:.1f}s + {d:.2f}s = {start + d:.2f}s (window ends {end:.1f}s){"" if fits else "  ← 넘침"}')
        clips.append((start, p))
    if not ok:
        print(f'✗ {slug}: 넘치는 줄이 있어 쓰지 않았다')
        return False

    out.parent.mkdir(parents=True, exist_ok=True)
    inputs = [a for _, p in clips for a in ('-i', str(p))]
    delays = ';'.join(f'[{i}:a]adelay={int(s * 1000)}:all=1[a{i}]' for i, (s, _) in enumerate(clips))
    mix = ''.join(f'[a{i}]' for i in range(len(clips)))
    graph = f'{delays};{mix}amix=inputs={len(clips)}:normalize=0,apad=whole_dur={TOTAL}[out]'
    ffmpeg('-y', *inputs, '-filter_complex', graph, '-map', '[out]', '-t', str(TOTAL),
           '-ar', '44100', '-ac', '2', '-b:a', '128k', str(out))
    print(f'✅ {out.relative_to(ROOT)} ({duration(out):.2f}s)')
    return True


async def main() -> None:
    data = json.loads(DATA.read_text(encoding='utf-8'))
    wanted = sys.argv[1:]
    unknown = [s for s in wanted if s not in data]
    if unknown:
        raise SystemExit(f'videos.json 에 없는 slug: {unknown}')
    slugs = wanted or [s for s, e in data.items() if not (ROOT / 'public' / e['audio']).exists()]
    print(f'{VOICE} {RATE} — {len(slugs)}편: {", ".join(slugs) or "(없음)"}')
    failed = [s for s in slugs if not await build(s, data[s])]
    if failed:
        raise SystemExit(f'넘친 항목 {len(failed)}편: {failed}')


asyncio.run(main())
