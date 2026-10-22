"""
의문문 음성 재생성 — Edge-TTS ko-KR-SunHiNeural, 문장 끝이 '?' 인 것은 prosody pitch +14% 로 올려 합성한다.

대상 (kp_expressions 현재 DB 기준)
  A. SLOT13 패턴(867·863·877·883·884·909·934·873·878·879·818·914·938)의 예문 ex1~3 (텍스트가 바뀜) — 39개
  B. 패턴명(korean)이 '?' 로 끝나는 모든 패턴의 pattern.mp3
  C. 예문(examples[].ko)이 '?' 로 끝나는 모든 예문의 ex1~3.mp3
  평서문('.', '!')은 기존 오디오가 정상이면 건드리지 않는다(A 에 속한 것만 새 텍스트라 다시 만든다).

합성 규칙
  '?' 로 끝남  →  <prosody pitch="+14%" rate="-4%">  (edge-tts 의 pitch 검증은 Hz 만 받아서 검증 뒤 값을 직접 넣는다)
  그 외        →  <prosody rate="-4%">

실행: python scripts/regen_question_audio.py [--dry] [--limit N]
이어 하기: scripts/edge-tts-progress-q.json. 덮어쓰기 전 현재 mp3 는 audio-backup/expressions-pre-pitch/ 에 받아 둔다.
"""
import asyncio
import json
import os
import re
import sys
import tempfile
import urllib.parse

import aiohttp
import edge_tts

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_all_edge_tts import load_env, speakable_pattern, VOICE, RATE, BUCKET, SLEEP, ROOT  # noqa: E402

sys.stdout.reconfigure(encoding='utf-8')
PITCH_Q = '+14%'
SLOT13 = {867, 863, 877, 883, 884, 909, 934, 873, 878, 879, 818, 914, 938}
PROGRESS = os.path.join(ROOT, 'scripts', 'edge-tts-progress-q.json')
BACKUP = os.path.join(ROOT, 'audio-backup', 'expressions-pre-pitch')

# 슬롯 표기가 소리 나는 글자가 아니거나(ㄹ래요·(으)ㄴ·이/가) 어색해지는 패턴명의 읽는 형태
SPOKEN_PATTERN = {
    804: '같이 할래요?',
    818: '뭐예요?',
    883: '거 있어요?',
    938: '어디가 아파요?',
}


def is_question(text: str) -> bool:
    return bool(re.search(r'\?[\s"\'”’)]*$', (text or '').strip()))


def pattern_text(row) -> str:
    return SPOKEN_PATTERN.get(row['id']) or speakable_pattern(row['korean'])


async def synth(text, path, question, tries=4):
    last = None
    for n in range(tries):
        try:
            c = edge_tts.Communicate(text, VOICE, rate=RATE)
            if question:
                object.__setattr__(c.tts_config, 'pitch', PITCH_Q)
            await c.save(path)
            if os.path.getsize(path) > 1000:
                return
            last = RuntimeError('too small')
        except Exception as e:
            last = e
        await asyncio.sleep(1.5 * (n + 1))
    raise last


async def main():
    args = sys.argv[1:]
    dry = '--dry' in args
    limit = int(args[args.index('--limit') + 1]) if '--limit' in args else None
    env = load_env()
    base = env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
    key = env['SUPABASE_SERVICE_ROLE_KEY']
    auth = {'Authorization': f'Bearer {key}', 'apikey': key}

    async with aiohttp.ClientSession() as http:
        async with http.get(f'{base}/rest/v1/kp_expressions?select=id,slug,korean,examples&order=id&limit=1000', headers=auth) as r:
            rows = await r.json()

        jobs = []  # (slug, name, text, question, group)
        for row in rows:
            slug = row['slug']
            if is_question(row['korean']):
                jobs.append((slug, 'pattern', pattern_text(row), True, 'B'))
            for i, ex in enumerate(row['examples'][:3], 1):
                q = is_question(ex['ko'])
                if q or row['id'] in SLOT13:
                    jobs.append((slug, f'ex{i}', ex['ko'], q, 'A' if row['id'] in SLOT13 else 'C'))
        if limit:
            jobs = jobs[:limit]
        nq = sum(1 for j in jobs if j[3])
        print(f'엔진 edge-tts | {VOICE} | rate {RATE} | 의문문 pitch {PITCH_Q} | 대상 {len(jobs)}개 (의문 {nq} / 평서 {len(jobs) - nq})')
        print('  그룹 A(슬롯13 예문) %d · B(패턴명 ?) %d · C(예문 ?) %d' % tuple(sum(1 for j in jobs if j[4] == g) for g in 'ABC'))
        if dry:
            for j in jobs[:12]:
                print('  ', j[0], j[1], j[2], '(?)' if j[3] else '')
            print('DRY RUN')
            return

        done = set(json.load(open(PROGRESS, encoding='utf-8'))) if os.path.exists(PROGRESS) else set()
        tmp = tempfile.mkdtemp(prefix='edge_q_')
        failed = []
        for n, (slug, name, text, q, grp) in enumerate(jobs, 1):
            tag = f'{slug}/{name}'
            if tag in done:
                continue
            obj = f'expressions/{urllib.parse.quote(slug)}/{name}.mp3'
            public = f'{base}/storage/v1/object/public/{BUCKET}/{obj}'
            try:
                dst = os.path.join(BACKUP, slug, f'{name}.mp3')
                if not os.path.exists(dst):
                    async with http.get(public) as r:
                        if r.status == 200:
                            os.makedirs(os.path.dirname(dst), exist_ok=True)
                            open(dst, 'wb').write(await r.read())
                local = os.path.join(tmp, f'{slug}__{name}.mp3')
                await synth(text, local, q)
                data = open(local, 'rb').read()
                headers = {**auth, 'Content-Type': 'audio/mpeg', 'x-upsert': 'true', 'cache-control': 'max-age=3600'}
                async with http.post(f'{base}/storage/v1/object/{BUCKET}/{obj}', data=data, headers=headers) as r:
                    if r.status not in (200, 201):
                        raise RuntimeError(f'upload {r.status}: {(await r.text())[:100]}')
                os.remove(local)
                done.add(tag)
                json.dump(sorted(done), open(PROGRESS, 'w', encoding='utf-8'))
                print(f'[{n}/{len(jobs)}] {grp} {tag} {"(?) " if q else ""}{text}', flush=True)
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
