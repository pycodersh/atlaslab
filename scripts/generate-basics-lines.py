"""
Basics 문장 음성 — remotion/KoreanBasic/lines.json 의 항목을 public/audio/korean-basic/lines/<slug>/<id>.mp3 로 만든다.

  src: 'typecast'  Typecast ssfm-v30 템포 0.9 로 만든다(say 가 있으면 그 글자를 읽는다) — 상황극 대사 Eunkyung, 예문 Hyunmin.
                  2026-11-21 Edge-TTS SunHi 에서 바꿨다. scripts/basics_typecast.py 캐시 덕에 다시 돌려도 크레딧을 두 번 쓰지 않는다.
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


sys.path.insert(0, str(Path(__file__).resolve().parent))
import basics_typecast as tc  # noqa: E402

# 2026-11-21 Typecast ssfm-v30 템포 0.9 — 상황극 대사(캐릭터 A, 여성)는 Eunkyung, 예문은 Hyunmin
VOICE_OF = {'scene': 'Eunkyung', 'example': 'Hyunmin'}
LINES = ROOT / 'remotion' / 'KoreanBasic' / 'lines.json'
MANIFEST = ROOT / 'remotion' / 'KoreanBasic' / 'line-audio.generated.json'
PROGRESS = ROOT / 'render-progress.json'

# 상황극 대사 앞에 붙이는 무음 — 영상이 그만큼 일찍 튼다(TemplateVideoV2 OPENING.preroll 6프레임과 같다).
# 브라우저가 오디오를 시작하며 앞을 먹어도 무음이 먹히고 첫 음절은 남는다
PREROLL = 0.2

def to_mp3(src: Path, out: Path, pad: float = 0) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    af = vo.TRIM + (f',adelay={int(pad * 1000)}:all=1' if pad else '')
    vo.ffmpeg('-y', '-i', str(src), '-af', af, '-ar', '24000', '-ac', '1', '-b:a', '96k', str(out))

async def make(text: str, out: Path, kind: str) -> None:
    raw = out.with_suffix('.raw.mp3')
    tc.synth(text, VOICE_OF[kind], raw)
    to_mp3(raw, out, pad=PREROLL if kind == 'scene' else 0); raw.unlink()

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
        c = tc.credits()
        print(f"엔진: Typecast {tc.MODEL} · 템포 {tc.TEMPO} · 목소리 {VOICE_OF} · 키 …{tc.key()[-4:]} · {c['plan']} {c['used']:,}/{c['total']:,}")
        print(f"범위: 글 {len(lines)}편 · Typecast {len(by('typecast'))}개({sum(len(l.get('say', l['ko'])) for l in by('typecast'))}자) · 숨김 {len(by('skip'))}개")
        print('매핑 전체: docs/basics-audio-mapping.md'); return

    if '--sample' in args:
        picks = [('korean-because-aseo-vs-euni-kka', 's2-2-ko', '늦어서 죄송해요.', 'because'),
                 ('korean-requests-a-eo-juseyo', 's2-2-ko', '여기 세워 주세요.', 'requests'),
                 ('korean-prices-money-eolmayeyo', 's3-2-ko', '이거 얼마예요?', 'prices')]
        d = ROOT / 'out' / 'remotion' / 'line-sample'
        for slug, seg, text, name in picks:
            to_mp3(ROOT / 'out' / 'remotion' / 'vo' / slug / f'{seg}.wav', d / f'{name}--existing.mp3')
            await make(text, d / f'{name}--new.mp3', 'example')
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
            await make(j.get('say', j['ko']), out, j['kind'])
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
