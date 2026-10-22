"""
후속 음성 재생성 (Edge-TTS ko-KR-SunHiNeural, 의문 억양은 prosody pitch +14%)

  A. 어색한 예문 6개를 새 문장으로 바꾼 ex mp3 (877 ex3, 883 ex2·ex3, 938 ex1, 914 ex3, 873 ex1)
  B. 슬롯 표제어가 바뀐 6개 패턴의 pattern.mp3 — 괄호(기능 설명)를 뺀 핵심 어구를 읽는다
       867 "해요?"·863 "해요?"·877 "있어요?" (pitch +14%) / 878 "더 해요"·879 "같이 해요"·934 "로 할게요" (rate -4%)
  C. 문장 '끝'이 아니라 '중간'에 ? 가 있는 예문 전부 (예: "혹시 카카오톡 해요? 아이디 알려주세요.") — pitch +14%

실행: python scripts/regen_followup_audio.py [--dry]
이어 하기: scripts/edge-tts-progress-f.json. 덮어쓰기 전 현재 mp3 는 audio-backup/expressions-pre-followup/ 에 받아 둔다.
"""
import asyncio
import json
import os
import sys
import tempfile
import urllib.parse

import aiohttp

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_all_edge_tts import load_env, VOICE, RATE, BUCKET, SLEEP, ROOT  # noqa: E402
from regen_question_audio import synth, is_question, PITCH_Q  # noqa: E402

sys.stdout.reconfigure(encoding='utf-8')
PROGRESS = os.path.join(ROOT, 'scripts', 'edge-tts-progress-f.json')
BACKUP = os.path.join(ROOT, 'audio-backup', 'expressions-pre-followup')

A_EXAMPLES = {(877, 3), (883, 2), (883, 3), (938, 1), (914, 3), (873, 1)}   # (id, ex 번호 1-based)
B_PATTERNS = {  # id → (읽을 글, 의문 억양 여부)
    867: ('해요?', True),
    863: ('해요?', True),
    877: ('있어요?', True),
    878: ('더 해요', False),
    879: ('같이 해요', False),
    934: ('로 할게요', False),
}


def has_mid_question(text: str) -> bool:
    t = (text or '').strip()
    return '?' in t and not is_question(t)


async def main():
    dry = '--dry' in sys.argv
    env = load_env()
    base = env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
    key = env['SUPABASE_SERVICE_ROLE_KEY']
    auth = {'Authorization': f'Bearer {key}', 'apikey': key}
    async with aiohttp.ClientSession() as http:
        async with http.get(f'{base}/rest/v1/kp_expressions?select=id,slug,korean,examples&order=id&limit=1000', headers=auth) as r:
            rows = await r.json()

        jobs, seen = [], set()
        def add(slug, name, text, q, grp):
            if (slug, name) in seen:
                return
            seen.add((slug, name))
            jobs.append((slug, name, text, q, grp))

        for row in rows:
            for i, ex in enumerate(row['examples'][:3], 1):
                if (row['id'], i) in A_EXAMPLES:
                    add(row['slug'], f'ex{i}', ex['ko'], True, 'A')
            if row['id'] in B_PATTERNS:
                text, q = B_PATTERNS[row['id']]
                add(row['slug'], 'pattern', text, q, 'B')
        for row in rows:
            for i, ex in enumerate(row['examples'][:3], 1):
                if has_mid_question(ex['ko']):
                    add(row['slug'], f'ex{i}', ex['ko'], True, 'C')

        nq = sum(1 for j in jobs if j[3])
        print(f'엔진 edge-tts | {VOICE} | rate {RATE} | 의문 pitch {PITCH_Q} | 대상 {len(jobs)}개 (의문 {nq} / 평서 {len(jobs) - nq})')
        print('  A %d · B %d · C %d' % tuple(sum(1 for j in jobs if j[4] == g) for g in 'ABC'))
        if dry:
            for j in jobs:
                print('  ', j[4], j[0], j[1], '(?)' if j[3] else '    ', j[2])
            print('DRY RUN')
            return

        done = set(json.load(open(PROGRESS, encoding='utf-8'))) if os.path.exists(PROGRESS) else set()
        tmp = tempfile.mkdtemp(prefix='edge_f_')
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
