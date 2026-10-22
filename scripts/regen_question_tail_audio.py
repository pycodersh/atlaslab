"""
의문문 음성 최종 방식: '?' 로 끝나는 어절만 prosody(pitch +20%, rate -4%)로 감싼다.
문장 전체에 pitch 를 주면 톤만 올라가고 억양은 평서문 그대로라서 바꿨다.

  혹시 카카오톡 <prosody pitch="+20%" rate="-4%">해요?</prosody> 아이디 알려주세요.

대상 (kp_expressions 현재 DB 기준)
  - 예문(examples[].ko) 중 '?' 가 들어 있는 모든 예문 → ex1~3.mp3   (문장 끝이든 중간이든)
  - 패턴명(korean)이 '?' 로 끝나는 패턴 → pattern.mp3
  - 슬롯 표제어가 바뀐 867·863·877 → pattern.mp3 ("해요?"·"해요?"·"있어요?")
  평서문(?)이 없는 예문·패턴은 건드리지 않는다.

edge-tts 는 텍스트 전체를 prosody 로 감싸므로 mkssml 을 잠시 교체해서 위 SSML 을 그대로 보낸다
(prosody 중첩·rate 만 있는 prosody·contour 는 서버가 거부한다).

실행: python scripts/regen_question_tail_audio.py [--dry] [--limit N]
이어 하기: scripts/edge-tts-progress-t.json
"""
import asyncio
import json
import os
import sys
import tempfile
import urllib.parse
from xml.sax.saxutils import escape

import aiohttp
import edge_tts
from edge_tts import communicate as _c

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_all_edge_tts import load_env, BUCKET, SLEEP, ROOT  # noqa: E402
from regen_question_audio import SPOKEN_PATTERN, pattern_text  # noqa: E402

sys.stdout.reconfigure(encoding='utf-8')
VOICE = 'ko-KR-SunHiNeural'
PITCH, RATE = '+20%', '-4%'
PROGRESS = os.path.join(ROOT, 'scripts', 'edge-tts-progress-t.json')
PATTERN_OVERRIDE = {867: '해요?', 863: '해요?', 877: '있어요?'}   # 표제어에 기능 설명 괄호가 붙은 패턴


def tail_ssml_inner(text: str) -> str:
    """'?' 로 끝나는 어절만 prosody 로 감싼 <voice> 안쪽 마크업."""
    return ' '.join(
        f'<prosody pitch="{PITCH}" rate="{RATE}">{escape(w)}</prosody>' if w.endswith('?') else escape(w)
        for w in text.split(' ')
    )


async def synth(text: str, path: str, tries: int = 4):
    inner = tail_ssml_inner(text)
    last = None
    for n in range(tries):
        orig = _c.mkssml
        _c.mkssml = lambda tc, escaped, inner=inner: (
            "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ko-KR'>"
            f"<voice name='{tc.voice}'>{inner}</voice></speak>")
        try:
            await edge_tts.Communicate('x', VOICE).save(path)   # 'x' 는 자리표시자
            if os.path.getsize(path) > 1000:
                return
            last = RuntimeError('too small')
        except Exception as e:
            last = e
        finally:
            _c.mkssml = orig
        await asyncio.sleep(1.5 * (n + 1))
    raise last


async def main():
    dry = '--dry' in sys.argv
    limit = int(sys.argv[sys.argv.index('--limit') + 1]) if '--limit' in sys.argv else None
    env = load_env()
    base = env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
    key = env['SUPABASE_SERVICE_ROLE_KEY']
    auth = {'Authorization': f'Bearer {key}', 'apikey': key}
    async with aiohttp.ClientSession() as http:
        async with http.get(f'{base}/rest/v1/kp_expressions?select=id,slug,korean,examples&order=id&limit=1000', headers=auth) as r:
            rows = await r.json()

        jobs = []
        for row in rows:
            pt = PATTERN_OVERRIDE.get(row['id'])
            if pt is None and row['korean'].strip().endswith('?'):
                pt = pattern_text(row)
            if pt:
                jobs.append((row['slug'], 'pattern', pt, 'P'))
            for i, ex in enumerate(row['examples'][:3], 1):
                if '?' in ex['ko']:
                    jobs.append((row['slug'], f'ex{i}', ex['ko'], 'E'))
        no_word = [j for j in jobs if not any(w.endswith('?') for w in j[2].split(' '))]
        if limit:
            jobs = jobs[:limit]
        print(f'엔진 edge-tts | {VOICE} | ? 어절만 pitch {PITCH} rate {RATE} | 대상 {len(jobs)}개 '
              f'(패턴 {sum(1 for j in jobs if j[3] == "P")} · 예문 {sum(1 for j in jobs if j[3] == "E")})')
        print('? 로 끝나는 어절이 없어 억양이 안 걸리는 문장:', [(j[0], j[1], j[2]) for j in no_word])
        if dry:
            for j in jobs[:6]:
                print('  ', j[0], j[1], tail_ssml_inner(j[2]))
            return

        done = set(json.load(open(PROGRESS, encoding='utf-8'))) if os.path.exists(PROGRESS) else set()
        tmp = tempfile.mkdtemp(prefix='edge_t_')
        failed = []
        for n, (slug, name, text, kind) in enumerate(jobs, 1):
            tag = f'{slug}/{name}'
            if tag in done:
                continue
            obj = f'expressions/{urllib.parse.quote(slug)}/{name}.mp3'
            try:
                local = os.path.join(tmp, f'{slug}__{name}.mp3')
                await synth(text, local)
                data = open(local, 'rb').read()
                headers = {**auth, 'Content-Type': 'audio/mpeg', 'x-upsert': 'true', 'cache-control': 'max-age=3600'}
                async with http.post(f'{base}/storage/v1/object/{BUCKET}/{obj}', data=data, headers=headers) as r:
                    if r.status not in (200, 201):
                        raise RuntimeError(f'upload {r.status}: {(await r.text())[:100]}')
                os.remove(local)
                done.add(tag)
                json.dump(sorted(done), open(PROGRESS, 'w', encoding='utf-8'))
                print(f'[{n}/{len(jobs)}] {kind} {tag} {text}', flush=True)
            except Exception as e:
                failed.append((tag, str(e)[:100]))
                print(f'  ✗ {tag}: {str(e)[:100]}', flush=True)
            await asyncio.sleep(SLEEP)
        try:
            os.rmdir(tmp)
        except OSError:
            pass
        print(f'\n완료. 실패 {len(failed)}건')
        for t, e in failed:
            print('  -', t, e)


if __name__ == '__main__':
    asyncio.run(main())
