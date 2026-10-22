"""
kp_expressions 의 pattern / ex1~3 음성을 Edge-TTS 로 일괄 생성해 Supabase Storage 에 교체 업로드한다.

  엔진   edge-tts  (Voice ko-KR-SunHiNeural, Rate -4%)
  대상   exports/kpatto/kpatto_patterns_fixed.json 의 325개 패턴 × (pattern, ex1, ex2, ex3) = 1,300개
  경로   Storage 'audio' 버킷 expressions/{slug}/{name}.mp3  (기존 파일을 덮어쓴다)

실행: python scripts/generate_all_edge_tts.py [--limit N] [--only slug] [--no-backup]
  --limit N    앞에서 N개 패턴만(시험용)
  --only slug  그 패턴 하나만
이어 하기: scripts/edge-tts-progress.json 에 끝낸 파일을 적어 두고, 다시 돌리면 건너뛴다.

덮어쓰기 전에 기존 mp3 를 audio-backup/expressions-pre-edge/ 로 받아 둔다(되돌릴 수 있게).
업로드한 뒤에는 임시 mp3 를 지운다. 시크릿은 .env.local 에서 읽기만 하고 출력하지 않는다.
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

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = 'ko-KR-SunHiNeural'
RATE = '-4%'
BUCKET = 'audio'
SLEEP = 0.08
SRC = os.path.join(ROOT, 'exports', 'kpatto', 'kpatto_patterns_fixed.json')
PROGRESS = os.path.join(ROOT, 'scripts', 'edge-tts-progress.json')
BACKUP = os.path.join(ROOT, 'audio-backup', 'expressions-pre-edge')
NAMES = ['pattern', 'ex1', 'ex2', 'ex3']


def load_env():
    env = {}
    with open(os.path.join(ROOT, '.env.local'), encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'").lstrip('﻿')
    return env


def speakable_pattern(korean: str) -> str:
    """패턴 표기(~, -, /)는 읽는 글자가 아니므로 소리 나는 형태로 바꾼다. 예) ~이에요/예요 → 이에요, 예요"""
    t = korean.replace('/', ', ')
    t = re.sub(r'[~\-]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip(' ,')


def tts_text(row, name):
    if name == 'pattern':
        return speakable_pattern(row['korean'])
    i = int(name[2:]) - 1
    return row['examples'][i]['ko']


async def synth(text, path, tries=4):
    last = None
    for n in range(tries):
        try:
            await edge_tts.Communicate(text, VOICE, rate=RATE).save(path)
            if os.path.getsize(path) > 1000:
                return
            last = RuntimeError('too small')
        except Exception as e:  # 네트워크·403 일시 오류
            last = e
        await asyncio.sleep(1.5 * (n + 1))
    raise last


async def main():
    args = sys.argv[1:]
    limit = int(args[args.index('--limit') + 1]) if '--limit' in args else None
    only = args[args.index('--only') + 1] if '--only' in args else None
    backup = '--no-backup' not in args

    env = load_env()
    base = env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
    key = env['SUPABASE_SERVICE_ROLE_KEY']
    auth = {'Authorization': f'Bearer {key}', 'apikey': key}

    rows = json.load(open(SRC, encoding='utf-8'))
    if only:
        rows = [r for r in rows if r['slug'] == only]
    if limit:
        rows = rows[:limit]
    done = set(json.load(open(PROGRESS, encoding='utf-8'))) if os.path.exists(PROGRESS) else set()

    print(f'엔진 edge-tts | voice {VOICE} | rate {RATE} | 패턴 {len(rows)}개 × 4 = {len(rows) * 4}개 | 버킷 {BUCKET}/expressions/{{slug}}/')
    print(f'키 SUPABASE_SERVICE_ROLE_KEY …{key[-4:]} | 이미 끝낸 파일 {len(done)}개는 건너뜀 | 백업 {"켬" if backup else "끔"}\n')

    tmp = tempfile.mkdtemp(prefix='edge_tts_')
    failed, mismatched = [], []
    async with aiohttp.ClientSession() as http:
        for idx, row in enumerate(rows, 1):
            slug = row['slug']
            uploaded = 0
            for name in NAMES:
                tag = f'{slug}/{name}'
                if tag in done:
                    continue
                obj = f'expressions/{urllib.parse.quote(slug)}/{name}.mp3'
                public = f'{base}/storage/v1/object/public/{BUCKET}/{obj}'
                try:
                    if backup:
                        dst = os.path.join(BACKUP, slug, f'{name}.mp3')
                        if not os.path.exists(dst):
                            async with http.get(public) as r:
                                if r.status == 200:
                                    os.makedirs(os.path.dirname(dst), exist_ok=True)
                                    open(dst, 'wb').write(await r.read())
                    local = os.path.join(tmp, f'{slug}__{name}.mp3')
                    await synth(tts_text(row, name), local)
                    data = open(local, 'rb').read()
                    headers = {**auth, 'Content-Type': 'audio/mpeg', 'x-upsert': 'true', 'cache-control': 'max-age=3600'}
                    async with http.post(f'{base}/storage/v1/object/{BUCKET}/{obj}', data=data, headers=headers) as r:
                        if r.status not in (200, 201):
                            raise RuntimeError(f'upload {r.status}: {(await r.text())[:120]}')
                    os.remove(local)  # 업로드 끝난 임시 파일 삭제
                    done.add(tag)
                    uploaded += 1
                    json.dump(sorted(done), open(PROGRESS, 'w', encoding='utf-8'))
                except Exception as e:
                    failed.append((tag, str(e)[:120]))
                    print(f'  ✗ {tag}: {str(e)[:120]}')
                await asyncio.sleep(SLEEP)

            # DB 의 audio_urls 가 공개 URL 과 정확히 같은지 확인, 다르면 갱신
            want = {n: f'{base}/storage/v1/object/public/{BUCKET}/expressions/{urllib.parse.quote(slug)}/{n}.mp3' for n in NAMES}
            if row.get('audio_urls') != want:
                mismatched.append(slug)
            print(f'[{idx}/{len(rows)}] {slug} ({uploaded} files uploaded)', flush=True)

    # audio_urls 갱신(일치하지 않는 행만)
    if mismatched:
        async with aiohttp.ClientSession() as http:
            for slug in mismatched:
                want = {n: f'{base}/storage/v1/object/public/{BUCKET}/expressions/{urllib.parse.quote(slug)}/{n}.mp3' for n in NAMES}
                async with http.patch(f'{base}/rest/v1/kp_expressions?slug=eq.{urllib.parse.quote(slug)}',
                                      json={'audio_urls': want}, headers={**auth, 'Prefer': 'return=minimal'}) as r:
                    if r.status not in (200, 204):
                        print(f'  ✗ audio_urls 갱신 실패 {slug}: {r.status}')
    try:
        os.rmdir(tmp)
    except OSError:
        pass
    print(f'\n완료. 실패 {len(failed)}건 | audio_urls 불일치로 갱신한 행 {len(mismatched)}개')
    for t, e in failed:
        print('  -', t, e)


if __name__ == '__main__':
    asyncio.run(main())
