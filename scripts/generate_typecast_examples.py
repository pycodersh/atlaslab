"""
Typecast 로 표현 예문 음성 생성 (패턴 자체 음성은 만들지 않는다). 로컬 저장 전용 — Storage·DB 는 건드리지 않는다.

  엔진   Typecast ssfm-v30 · 보이스 서현(tc_69f2e455ea79fd197aa0476f) · language kor · emotion normal · tempo 1.0
  대상   exports/kpatto/updated_expressions.json 의 is_active=true 를 학습 순서(first_episode, id)로 세운 앞 N개 패턴의 예문 3개씩
  저장   audio/expressions/{slug}/ex1.mp3, ex2.mp3, ex3.mp3

실행: python scripts/generate_typecast_examples.py [--first 10]
키는 shortform-studio/.env 의 TYPECAST_API_KEY (끝 4자리만 출력). 무료 플랜 동시 요청 2개 한도라 순차로 호출한다.
"""
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = os.path.join(os.path.dirname(ROOT), 'shortform-studio', '.env')
SRC = os.path.join(ROOT, 'exports', 'kpatto', 'updated_expressions.json')
OUT = os.path.join(ROOT, 'audio', 'expressions')
VOICE_ID, VOICE_NAME, MODEL = 'tc_69f2e455ea79fd197aa0476f', '서현', 'ssfm-v30'
API = 'https://api.typecast.ai'


def load_key():
    for line in open(ENV, encoding='utf-8-sig'):
        if line.strip().startswith('TYPECAST_API_KEY'):
            return line.split('=', 1)[1].strip().strip('"\'')
    raise SystemExit('TYPECAST_API_KEY 없음')


KEY = load_key()
H = {'X-API-KEY': KEY, 'User-Agent': 'Mozilla/5.0'}


def used_credits():
    req = urllib.request.Request(API + '/v1/users/me/subscription', headers=H)
    d = json.loads(urllib.request.urlopen(req, timeout=20).read().decode())['credits']
    return d['used_credits'], d['plan_credits']


def synth(text, tries=4):
    body = {'voice_id': VOICE_ID, 'text': text, 'model': MODEL, 'language': 'kor',
            'prompt': {'emotion_type': 'preset', 'emotion_preset': 'normal', 'emotion_intensity': 1.0},
            'output': {'audio_format': 'mp3', 'audio_tempo': 1.0}}
    last = None
    for n in range(tries):
        req = urllib.request.Request(API + '/v1/text-to-speech', data=json.dumps(body).encode('utf-8'),
                                     headers={**H, 'Content-Type': 'application/json'}, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
                if len(data) > 1000:
                    return data
                last = RuntimeError('too small')
        except urllib.error.HTTPError as e:
            last = RuntimeError(f'{e.code} {e.read().decode("utf-8", "replace")[:120]}')
            if e.code not in (429, 500, 502, 503):
                break
        except Exception as e:
            last = e
        time.sleep(2 * (n + 1))
    raise last


def duration(path):
    try:
        out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                             capture_output=True, text=True, timeout=20).stdout.strip()
        return float(out)
    except Exception:
        return None


def main():
    n_first = int(sys.argv[sys.argv.index('--first') + 1]) if '--first' in sys.argv else 10
    rows = json.load(open(SRC, encoding='utf-8'))
    pats = sorted([r for r in rows if r['is_active']],
                  key=lambda r: (r['first_episode'] if r['first_episode'] is not None else 10**9, r['id']))[:n_first]
    jobs = [(p['slug'], i, e['ko']) for p in pats for i, e in enumerate(p['examples'][:3], 1)]
    chars = sum(len(t) for _, _, t in jobs)
    print(f'엔진 Typecast {MODEL} | 보이스 {VOICE_NAME} {VOICE_ID} | 키 …{KEY[-4:]}')
    print(f'범위 학습 순서 앞 {len(pats)}개 패턴 × 예문 3 = {len(jobs)}문장, {chars}자(공백 포함) | 저장 {OUT}\\{{slug}}\\exN.mp3')
    u0, plan = used_credits()
    print(f'크레딧 사용 {u0} / {plan} (예상 차감 약 {chars})\n')

    ok, fail = 0, []
    for n, (slug, i, text) in enumerate(jobs, 1):
        path = os.path.join(OUT, slug, f'ex{i}.mp3')
        try:
            data = synth(text)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            open(path, 'wb').write(data)
            ok += 1
            dur = duration(path)
            print(f'[{n}/{len(jobs)}] {slug}/ex{i}.mp3  {len(data):>6}B  {dur:.2f}s  "{text}"' if dur else
                  f'[{n}/{len(jobs)}] {slug}/ex{i}.mp3  {len(data):>6}B  "{text}"', flush=True)
        except Exception as e:
            fail.append((slug, i, str(e)[:100]))
            print(f'[{n}/{len(jobs)}] ✗ {slug}/ex{i}: {str(e)[:100]}', flush=True)

    print(f'\n완료: 성공 {ok}/{len(jobs)}, 실패 {len(fail)}')
    for f in fail:
        print('  -', f)
    # 크레딧 반영은 20~30초 늦으므로 잠시 기다렸다가 읽는다
    u1 = u0
    for _ in range(8):
        time.sleep(10)
        u1, _ = used_credits()
        if u1 != u0:
            time.sleep(10)
            u1, _ = used_credits()
            break
    print(f'크레딧 사용 {u0} → {u1} (차감 {u1 - u0}, 글자 {chars}) | 잔여 {plan - u1}')


if __name__ == '__main__':
    main()
