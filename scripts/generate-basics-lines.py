"""
Basics 문장 음성 — remotion/KoreanBasic/lines.json 의 항목을 public/audio/korean-basic/lines/<slug>/<id>.mp3 로 만든다.

  src: 'edge'   Edge-TTS ko-KR-SunHiNeural -5% 로 새로 만든다(say 가 있으면 그 글자를 읽는다).
                기존 이중 보이스 조각(scripts/generate-basics-voiceover.py)과 같은 목소리 · 속도 · 무음 제거다.
  src: 'reuse'  기존 조각(out/remotion/vo 의 무음 제거본 .wav)을 mp3 로 옮긴다 — 새로 만들지 않는다
  src: 'skip'   파일 없음 → 본문 재생 버튼이 숨는다
진행은 render-progress.json 의 audio 칸에 항목별 pending / done / failed — 다시 돌리면 done 이 아닌 것만 한다.
끝나면 실제로 있는 파일만 remotion/KoreanBasic/line-audio.generated.json(문장 → 경로 · 길이)에 쓴다. 재생 버튼 · 영상이 이 파일을 읽는다.

실행: python scripts/generate-basics-lines.py --plan      # 엔진 · 범위만 출력
      python scripts/generate-basics-lines.py --sample    # 기존 조각과 같은 문장 3개를 out/remotion/line-sample/ 에 새로 만들어 비교
      python scripts/generate-basics-lines.py [slug ...]  # 생성(지정하면 그 글만)
"""
import asyncio, json, os, shutil, subprocess, sys
from pathlib import Path

import aiohttp
import edge_tts

ROOT = Path(__file__).resolve().parent.parent
# 아래 도구들은 scripts/generate-basics-voiceover.py 와 같다(그 파일은 불러오면 바로 실행돼서 옮겨 적었다)
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



class vo:
    TRIM = TRIM
    ffmpeg = staticmethod(ffmpeg)
    duration = staticmethod(duration)
    tts = staticmethod(tts)


VOICE = ('ko-KR-SunHiNeural', '-5%')  # 이중 보이스판 VOICES['ko'] 와 같다
LINES = ROOT / 'remotion' / 'KoreanBasic' / 'lines.json'
MANIFEST = ROOT / 'remotion' / 'KoreanBasic' / 'line-audio.generated.json'
PROGRESS = ROOT / 'render-progress.json'

def to_mp3(src: Path, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    vo.ffmpeg('-y', '-i', str(src), '-af', vo.TRIM, '-ar', '24000', '-ac', '1', '-b:a', '96k', str(out))

async def make(text: str, out: Path) -> None:
    raw = out.with_suffix('.raw.mp3')
    out.parent.mkdir(parents=True, exist_ok=True)
    await vo.tts(text, raw, VOICE)
    to_mp3(raw, out); raw.unlink()

def load_progress():
    return json.loads(PROGRESS.read_text('utf-8')) if PROGRESS.exists() else {}

def save_progress(p):
    PROGRESS.write_text(json.dumps(p, ensure_ascii=False, indent=1) + '\n', 'utf-8')

async def main():
    args = sys.argv[1:]
    lines = json.loads(LINES.read_text('utf-8'))
    items = [{'slug': s, **l} for s, L in lines.items() for l in L]

    if '--plan' in args:
        by = lambda k: [l for l in items if l['src'] == k]
        print(f"엔진: Edge-TTS · {VOICE[0]} · rate {VOICE[1]} · 24kHz mono mp3 96k · 앞뒤 무음 제거(-50dB)")
        print(f"범위: 글 {len(lines)}편 · 새로 {len(by('edge'))}개({sum(len(l.get('say', l['ko'])) for l in by('edge'))}자) · 재사용 {len(by('reuse'))}개 · 숨김 {len(by('skip'))}개")
        print('매핑 전체: docs/basics-audio-mapping.md'); return

    if '--sample' in args:
        picks = [('korean-because-aseo-vs-euni-kka', 's2-2-ko', '늦어서 죄송해요.', 'because'),
                 ('korean-requests-a-eo-juseyo', 's2-2-ko', '여기 세워 주세요.', 'requests'),
                 ('korean-prices-money-eolmayeyo', 's3-2-ko', '이거 얼마예요?', 'prices')]
        d = ROOT / 'out' / 'remotion' / 'line-sample'
        for slug, seg, text, name in picks:
            to_mp3(ROOT / 'out' / 'remotion' / 'vo' / slug / f'{seg}.wav', d / f'{name}--existing.mp3')
            await make(text, d / f'{name}--new.mp3')
            print(f"{text}  기존 {vo.duration(d / f'{name}--existing.mp3'):.2f}s · 새로 {vo.duration(d / f'{name}--new.mp3'):.2f}s")
        return

    wanted = [a for a in args if not a.startswith('--')]
    jobs = [l for l in items if l['src'] != 'skip' and (not wanted or l['slug'] in wanted)]
    prog = load_progress(); prog.setdefault('audio', {})
    for j in jobs: prog['audio'].setdefault(f"{j['slug']}/{j['id']}", 'pending')
    save_progress(prog)
    failed = []
    for j in jobs:
        k = f"{j['slug']}/{j['id']}"; out = ROOT / 'public' / j['file']
        if prog['audio'][k] == 'done' and out.exists(): continue
        try:
            if j['src'] == 'reuse': to_mp3(ROOT / j['from'], out)
            else: await make(j.get('say', j['ko']), out)
            prog['audio'][k] = 'done'
        except BaseException as e:
            prog['audio'][k] = 'failed'; failed.append(f'{k}: {e}')
        save_progress(prog)
        print(prog['audio'][k], k)

    man = {}
    for l in items:
        p = ROOT / 'public' / l['file'] if l.get('file') else None
        if p and p.exists():
            man.setdefault(l['slug'], {})[l['id']] = {'ko': l['ko'], 'src': l['file'], 'dur': round(vo.duration(p), 2)}
    MANIFEST.write_text(json.dumps(man, ensure_ascii=False, indent=1) + '\n', 'utf-8')
    print(f"완료 · 실패 {len(failed)}"); [print('  ✗', f) for f in failed]

asyncio.run(main())
