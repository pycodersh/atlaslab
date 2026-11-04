"""
Basics 쇼트의 보이스오버 — remotion/KoreanBasic/videos.json 을 읽어 각 항목의 audio 경로(public/ 아래)에 만든다.
항목 모양에 따라 두 갈래다.

1) voice (이중 보이스판, 2026-11-04~)
   장면 3개 × [언어, 문장] 조각. 영어 해설은 en-US-ChristopherNeural(+2%, 보통 대화 속도),
   한국어는 ko-KR-SunHiNeural(-5%, 또박또박한 표준 발음)로 조각마다 따로 만든 뒤 앞뒤 무음을 걷고 이어 붙인다.
   장면 길이는 정하지 않는다 — 말이 끝나는 대로 다음 장면이 시작되고(최소 4초), 마지막에 여운을 둔다.
   그렇게 나온 장면별 [시작, 끝] 초와 전체 길이를 videos.json 의 그 항목 "timing" 에 써 넣는다.
   TemplateVideo 가 그 값으로 장면을 넘긴다(전체 14~18초 안팎).

2) narration (영어 한 목소리 12초판, 처음 33편)
   en-US-AndrewNeural +15%. 한 줄씩 [시작 초] 자리에 얹어 12초로 합친다. 한 줄이 다음 줄 시작 전에 끝나지 않으면 쓰지 않는다.
   한국어 단어를 영어 목소리가 발음대로 읽어(Dahng-sheen · Nuh) 어색하다 — 새 글은 1) 로 만든다.

엔진: Edge-TTS(무료, 키 없음). 합치기는 정식 ffmpeg 빌드로 한다. Remotion 에 딸린 ffmpeg 는 silenceremove 가 빠진 축소판이다.

실행: python scripts/generate-basics-voiceover.py            # 파일이 아직 없는 항목만
      python scripts/generate-basics-voiceover.py <slug> ...  # 지정한 항목을 다시 만든다
"""
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import aiohttp
import edge_tts

# 1) 이중 보이스판
VOICES = {
    'en': ('en-US-ChristopherNeural', '+2%'),
    'ko': ('ko-KR-SunHiNeural', '-5%'),
}
LEAD = 0.35         # 장면이 열리고(페이드 10프레임) 말이 시작되기까지
GAP_SAME = 0.18     # 같은 언어 조각 사이
GAP_SWITCH = 0.30   # 언어가 바뀌는 조각 사이 — 한국어 단어를 귀에 따로 세운다
SCENE_TAIL = 0.55   # 장면 말이 끝나고 다음 장면으로 넘어가기까지
END_TAIL = 1.4      # 마지막 장면 말이 끝나고 영상이 끝나기까지
MIN_SCENE = 4.0     # TemplateVideo 의 장면 안 연출이 4초 기준이다

# 2) 영어 한 목소리 12초판
LEGACY_VOICE = ('en-US-AndrewNeural', '+15%')
LEGACY_TOTAL = 12.0

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'remotion' / 'KoreanBasic' / 'videos.json'
WORK = ROOT / 'out' / 'remotion' / 'vo'
TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'


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


async def tts(text: str, path: Path, voice: tuple[str, str]) -> None:
    # Edge-TTS 는 가끔 빈 응답(NoAudioReceived)이나 소켓 타임아웃을 준다 — 잠깐 쉬고 다시 청한다
    # 연달아 청하면 막히는 일이 잦아 요청 사이에 1.5초를 둔다
    for attempt in range(6):
        await asyncio.sleep(1.5)
        try:
            await edge_tts.Communicate(text, voice[0], rate=voice[1]).save(str(path))
            return
        except (edge_tts.exceptions.NoAudioReceived, aiohttp.ClientError, asyncio.TimeoutError):
            if attempt == 5:
                raise
            await asyncio.sleep(5 * (attempt + 1))


async def clip(text: str, voice: tuple[str, str], stem: Path) -> tuple[Path, float]:
    """한 조각을 만들고 앞뒤 무음을 걷어 낸다 — 정한 자리에 말이 바로 시작되도록"""
    raw, wav = stem.with_suffix('.mp3'), stem.with_suffix('.wav')
    await tts(text, raw, voice)
    ffmpeg('-y', '-i', str(raw), '-af', TRIM, '-ar', '24000', '-ac', '1', str(wav))
    return wav, duration(wav)


def mix(clips: list[tuple[float, Path]], total: float, out: Path) -> None:
    """조각들을 각자의 시작 초에 얹어 total 초 한 파일로"""
    out.parent.mkdir(parents=True, exist_ok=True)
    inputs = [a for _, p in clips for a in ('-i', str(p))]
    delays = ';'.join(f'[{i}:a]adelay={int(s * 1000)}:all=1[a{i}]' for i, (s, _) in enumerate(clips))
    pads = ''.join(f'[a{i}]' for i in range(len(clips)))
    graph = f'{delays};{pads}amix=inputs={len(clips)}:normalize=0,apad=whole_dur={total}[out]'
    ffmpeg('-y', *inputs, '-filter_complex', graph, '-map', '[out]', '-t', f'{total:.3f}',
           '-ar', '44100', '-ac', '2', '-b:a', '128k', str(out))


def write_timing(slug: str, audio: str, timing: dict) -> None:
    """videos.json 의 그 항목 audio 줄 바로 아래에 "timing" 한 줄을 넣거나 바꾼다 — 나머지 서식은 건드리지 않는다"""
    text = DATA.read_text(encoding='utf-8')
    pat = re.compile(r'(\n(\s*)"audio": "' + re.escape(audio) + r'",\n)(\s*"timing": \{[^\n]*\},\n)?')
    m = pat.search(text)
    if not m:
        raise SystemExit(f'{slug}: videos.json 에서 audio 줄을 못 찾았다')
    line = f'{m.group(2)}"timing": {json.dumps(timing, separators=(", ", ": "))},\n'
    DATA.write_text(text[:m.start()] + m.group(1) + line + text[m.end():], encoding='utf-8')


async def build_bilingual(slug: str, entry: dict) -> bool:
    work = WORK / slug
    work.mkdir(parents=True, exist_ok=True)
    clips: list[tuple[float, Path]] = []
    scenes: list[list[float]] = []
    t = 0.0
    for si, parts in enumerate(entry['voice']):
        start = t
        cursor = start + LEAD
        prev = None
        for pi, (lang, text) in enumerate(parts):
            if prev is not None:
                cursor += GAP_SWITCH if lang != prev else GAP_SAME
            wav, d = await clip(text, VOICES[lang], work / f's{si + 1}-{pi + 1}-{lang}')
            clips.append((cursor, wav))
            print(f'  scene{si + 1} {lang} {cursor:5.2f}s +{d:.2f}s  {text}')
            cursor += d
            prev = lang
        last = si == len(entry['voice']) - 1
        end = max(start + MIN_SCENE, cursor + (END_TAIL if last else SCENE_TAIL))
        scenes.append([round(start, 2), round(end, 2)])
        t = end
    total = round(t, 2)
    mix(clips, total, ROOT / 'public' / entry['audio'])
    write_timing(slug, entry['audio'], {'scenes': scenes, 'total': total})
    print(f'✅ {entry["audio"]} ({total:.2f}s) scenes {scenes}')
    return True


async def build_legacy(slug: str, entry: dict) -> bool:
    lines = entry['narration']
    work = WORK / slug
    work.mkdir(parents=True, exist_ok=True)
    clips, ok = [], True
    for i, (start, text) in enumerate(lines):
        wav, d = await clip(text, LEGACY_VOICE, work / f'line{i + 1}')
        end = lines[i + 1][0] if i + 1 < len(lines) else LEGACY_TOTAL
        fits = start + d <= end
        ok &= fits
        print(f'  line{i + 1}: {start:.1f}s + {d:.2f}s = {start + d:.2f}s (window ends {end:.1f}s){"" if fits else "  ← 넘침"}')
        clips.append((start, wav))
    if not ok:
        print(f'✗ {slug}: 넘치는 줄이 있어 쓰지 않았다')
        return False
    mix(clips, LEGACY_TOTAL, ROOT / 'public' / entry['audio'])
    print(f'✅ {entry["audio"]} ({LEGACY_TOTAL:.2f}s)')
    return True


async def main() -> None:
    data = json.loads(DATA.read_text(encoding='utf-8'))
    wanted = sys.argv[1:]
    unknown = [s for s in wanted if s not in data]
    if unknown:
        raise SystemExit(f'videos.json 에 없는 slug: {unknown}')
    slugs = wanted or [s for s, e in data.items() if not (ROOT / 'public' / e['audio']).exists()]
    print(f'이중 보이스 {VOICES} · 12초판 {LEGACY_VOICE} — {len(slugs)}편: {", ".join(slugs) or "(없음)"}')
    failed = []
    for s in slugs:
        entry = data[s]
        ok = await (build_bilingual(s, entry) if 'voice' in entry else build_legacy(s, entry))
        if not ok:
            failed.append(s)
    if failed:
        raise SystemExit(f'넘친 항목 {len(failed)}편: {failed}')


asyncio.run(main())
