"""
Basics 한국어 음성 — Typecast ssfm-v30 (2026-11-21, Edge-TTS SunHi 에서 교체).

generate-basics-voiceover.py(영상 메인 트랙의 ko 조각)와 generate-basics-lines.py(상황극 대사 · 본문 예문)가 같이 쓴다.
  키     shortform-studio/.env 의 TYPECAST_API_KEY (값은 출력하지 않는다, 끝 4자리만)
  목소리 상황극 대사(캐릭터 A, 여성) = Eunkyung, 그 밖의 한국어(메인 트랙 · 예문) = Hyunmin. 템포 0.9
  캐시   out/remotion/tc-cache/<sha1>.mp3 — 같은 문장 · 목소리 · 템포는 다시 청하지 않는다(크레딧을 두 번 쓰지 않게)
1자 ≈ 1크레딧. 남은 크레딧이 모자라면 시작하지 않는다(credits()).
"""
import hashlib
import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = 'https://api.typecast.ai'
MODEL = 'ssfm-v30'
TEMPO = 0.9
VOICES = {
    'Hyunmin': 'tc_627ae61ffdf53ef0bb6902cd',   # 남성 — 메인 트랙 · 예문 (K-PATTO 예문과 같은 목소리)
    'Eunkyung': 'tc_6a7446c19f2d7dfed990a900',  # 여성 — 상황극 캐릭터 A
}
CACHE = ROOT / 'out' / 'remotion' / 'tc-cache'


def key() -> str:
    env = ROOT.parent / 'shortform-studio' / '.env'
    for line in env.read_text(encoding='utf-8-sig').splitlines():
        m = re.match(r'''^\s*TYPECAST_API_KEY\s*=\s*["']?([^"'\s]+)''', line)
        if m:
            return m.group(1)
    raise SystemExit('TYPECAST_API_KEY 없음 (shortform-studio/.env)')


def _req(path: str, body: dict | None = None) -> bytes:
    req = urllib.request.Request(API + path, method='POST' if body else 'GET',
                                 data=json.dumps(body).encode() if body else None,
                                 headers={'X-API-KEY': key(), 'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read()


def credits() -> dict:
    d = json.loads(_req('/v1/users/me/subscription'))
    return {'plan': d['plan'], 'used': d['credits']['used_credits'], 'total': d['credits']['plan_credits']}


def cached(text: str, voice: str, tempo: float = TEMPO) -> Path:
    h = hashlib.sha1(f'{MODEL}|{VOICES[voice]}|{tempo}|{text}'.encode()).hexdigest()
    return CACHE / f'{h}.mp3'


def synth(text: str, voice: str, out: Path, tempo: float = TEMPO) -> bool:
    """mp3 를 out 에 쓴다. 캐시에 있으면 API 를 부르지 않는다. 새로 청했으면 True"""
    c = cached(text, voice, tempo)
    if not c.exists():
        body = {'voice_id': VOICES[voice], 'text': text, 'model': MODEL, 'language': 'kor',
                'prompt': {'emotion_type': 'preset', 'emotion_preset': 'normal', 'emotion_intensity': 1.0},
                'output': {'audio_format': 'mp3', 'audio_tempo': tempo}}
        last = ''
        for n in range(5):
            try:
                buf = _req('/v1/text-to-speech', body)
                if len(buf) > 1000:
                    CACHE.mkdir(parents=True, exist_ok=True)
                    c.write_bytes(buf)
                    break
                last = 'too small'
            except urllib.error.HTTPError as e:
                last = f'{e.code} {e.read()[:120]!r}'
                if e.code not in (429, 500, 502, 503):
                    raise SystemExit(f'Typecast 실패: {last} — {text}')
            except (urllib.error.URLError, TimeoutError) as e:
                last = str(e)
            time.sleep(3 * (n + 1))
        else:
            raise SystemExit(f'Typecast 실패: {last} — {text}')
        fresh = True
    else:
        fresh = False
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(c.read_bytes())
    return fresh
