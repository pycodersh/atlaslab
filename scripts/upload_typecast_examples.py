"""
로컬 audio/expressions/{slug}/ex1~3.mp3 (Typecast 서현)를 Supabase Storage 로 올리고 DB·JSON 의 audio_urls 를 맞춘다.

  1) 덮어쓰기 전에 지금 Storage 의 mp3 를 audio-backup/expressions-pre-typecast/ 에 받아 둔다(되돌릴 수 있게)
  2) audio 버킷 expressions/{slug}/exN.mp3 로 upsert 업로드, 올린 뒤 공개 URL 을 다시 받아 크기가 같은지 확인
  3) kp_expressions.audio_urls 의 ex1~ex3 가 공개 URL 과 정확히 같은지 확인하고 다르면 갱신 (pattern 키는 그대로 둔다)
  4) exports/kpatto/updated_expressions.json 의 audio_urls 도 같은 값으로 맞춘다

실행: python scripts/upload_typecast_examples.py [--dry]
대상: updated_expressions.json 에서 is_active 인 패턴 전부. 로컬에 exN.mp3 가 없으면 그 파일은 실패로 기록한다.
"""
import asyncio
import json
import os
import sys
import urllib.parse

import aiohttp

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_all_edge_tts import load_env  # noqa: E402

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'exports', 'kpatto', 'updated_expressions.json')
LOCAL = os.path.join(ROOT, 'audio', 'expressions')
BACKUP = os.path.join(ROOT, 'audio-backup', 'expressions-pre-typecast')
BUCKET = 'audio'
CONC = 6


async def main():
    dry = '--dry' in sys.argv
    env = load_env()
    base = env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
    key = env['SUPABASE_SERVICE_ROLE_KEY']
    auth = {'Authorization': f'Bearer {key}', 'apikey': key}
    rows = json.load(open(SRC, encoding='utf-8'))
    pats = sorted([r for r in rows if r['is_active']],
                  key=lambda r: (r['first_episode'] if r['first_episode'] is not None else 10**9, r['id']))
    jobs = [(p['slug'], i) for p in pats for i in (1, 2, 3)]
    missing = [j for j in jobs if not os.path.exists(os.path.join(LOCAL, j[0], f'ex{j[1]}.mp3'))]
    print(f'대상 {len(pats)}패턴 × 3 = {len(jobs)}파일 | 로컬에 없는 파일 {len(missing)}개 | 키 …{key[-4:]}')
    if dry:
        print('DRY RUN', missing[:5])
        return

    sem = asyncio.Semaphore(CONC)
    ok, fail, backed = [], [], 0

    def pub(slug, n):
        return f'{base}/storage/v1/object/public/{BUCKET}/expressions/{urllib.parse.quote(slug)}/ex{n}.mp3'

    async with aiohttp.ClientSession() as http:
        async def one(slug, n):
            nonlocal backed
            local = os.path.join(LOCAL, slug, f'ex{n}.mp3')
            if not os.path.exists(local):
                fail.append((slug, n, '로컬 파일 없음')); return
            data = open(local, 'rb').read()
            obj = f'expressions/{urllib.parse.quote(slug)}/ex{n}.mp3'
            async with sem:
                try:
                    dst = os.path.join(BACKUP, slug, f'ex{n}.mp3')
                    if not os.path.exists(dst):
                        async with http.get(pub(slug, n) + '?bk=1') as r:
                            if r.status == 200:
                                os.makedirs(os.path.dirname(dst), exist_ok=True)
                                open(dst, 'wb').write(await r.read()); backed += 1
                    async with http.post(f'{base}/storage/v1/object/{BUCKET}/{obj}', data=data,
                                         headers={**auth, 'Content-Type': 'audio/mpeg', 'x-upsert': 'true',
                                                  'cache-control': 'max-age=3600'}) as r:
                        if r.status not in (200, 201):
                            raise RuntimeError(f'upload {r.status}: {(await r.text())[:100]}')
                    async with http.get(pub(slug, n) + '?v=verify') as r:
                        body = await r.read()
                        if r.status != 200 or len(body) != len(data):
                            raise RuntimeError(f'verify {r.status} {len(body)}≠{len(data)}')
                    ok.append((slug, n))
                except Exception as e:
                    fail.append((slug, n, str(e)[:100]))
            done = len(ok) + len(fail)
            if done % 50 == 0 or done == len(jobs):
                print(f'── 업로드 {done}/{len(jobs)} | 성공 {len(ok)} 실패 {len(fail)} | 기존 파일 백업 {backed}', flush=True)

        await asyncio.gather(*[one(s, n) for s, n in jobs])

        # audio_urls 점검·갱신 (업로드에 성공한 패턴만)
        okset = set(ok)
        changed_db, changed_json = 0, 0
        for r in rows:
            if not r['is_active']:
                continue
            slug = r['slug']
            if not all((slug, n) in okset for n in (1, 2, 3)):
                continue
            want = dict(r.get('audio_urls') or {})
            for n in (1, 2, 3):
                want[f'ex{n}'] = pub(slug, n)
            if r.get('audio_urls') != want:
                async with http.patch(f'{base}/rest/v1/kp_expressions?id=eq.{r["id"]}', json={'audio_urls': want},
                                      headers={**auth, 'Prefer': 'return=minimal'}) as resp:
                    if resp.status in (200, 204):
                        changed_db += 1
                    else:
                        fail.append((slug, 0, f'DB audio_urls {resp.status}'))
                r['audio_urls'] = want
                changed_json += 1
        if changed_json:
            json.dump(rows, open(SRC, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

    print(f'\n업로드 성공 {len(ok)}/{len(jobs)}, 실패 {len(fail)} | DB audio_urls 갱신 {changed_db}행, JSON 갱신 {changed_json}행 '
          f'(공개 URL 이 기존과 같으면 갱신 0 — 경로가 같아 덮어쓰기만 일어난다)')
    for f in fail[:30]:
        print('  ✗', f)


if __name__ == '__main__':
    asyncio.run(main())
