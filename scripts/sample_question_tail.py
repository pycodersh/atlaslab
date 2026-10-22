"""
의문문 억양 시험(샘플만, Storage·DB 는 건드리지 않는다): 문장 전체가 아니라 '?' 가 붙은 어절만 prosody 로 감싼다.

  front <prosody pitch="+20%" rate="-4%">last_word?</prosody> rest

edge-tts 는 텍스트를 통째로 prosody 로 감싸므로 mkssml 을 바꿔 끼워 원하는 SSML 을 그대로 보낸다.
출력: test_audio_pitch/ (로컬 폴더)
"""
import asyncio
import os
import re
import sys

import edge_tts
from edge_tts import communicate as _c

sys.stdout.reconfigure(encoding='utf-8')
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'test_audio_pitch')
VOICE = 'ko-KR-SunHiNeural'
SEP = '§§'          # 이스케이프를 통과하는 구분자(앞·뒤 경계)


def build_ssml(text: str, pitch: str = '+20%', rate: str = '-4%', front_rate: str | None = None) -> str:
    """'?' 로 끝나는 어절(문장 끝이든 중간이든)만 prosody 로 감싼다.
    front_rate 를 주면 그 밖의 어절 묶음에도 속도만 따로 준다(prosody 중첩은 서버가 거부해서 겹치지 않게 나눈다)."""
    parts, plain = [], []

    def flush():
        if plain:
            chunk = ' '.join(plain)
            parts.append(f'<prosody pitch="+0%" rate="{front_rate}">{chunk}</prosody>' if front_rate else chunk)
            plain.clear()

    for w in text.split(' '):
        if w.endswith('?'):
            flush()
            parts.append(f'<prosody pitch="{pitch}" rate="{rate}">{w}</prosody>')
        else:
            plain.append(w)
    flush()
    body = ' '.join(parts)
    return ('<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ko-KR">'
            f'<voice name="{VOICE}">{body}</voice></speak>')


async def synth_raw(ssml_body_inner: str, path: str):
    """ssml_body_inner: <voice> 안쪽 마크업. edge-tts 의 mkssml 을 잠시 교체해서 그대로 보낸다."""
    orig = _c.mkssml
    _c.mkssml = lambda tc, escaped: (
        '<speak version=\'1.0\' xmlns=\'http://www.w3.org/2001/10/synthesis\' xml:lang=\'ko-KR\'>'
        f'<voice name=\'{tc.voice}\'>{ssml_body_inner}</voice></speak>')
    try:
        await edge_tts.Communicate('x', VOICE).save(path)   # 'x' 는 자리표시자(교체된 mkssml 이 무시한다)
    finally:
        _c.mkssml = orig


def inner(text: str, pitch='+20%', rate='-4%', front_rate=None) -> str:
    s = build_ssml(text, pitch, rate, front_rate)
    return re.search(r'<voice[^>]*>(.*)</voice>', s).group(1)


async def whole(text, path, pitch=None):
    c = edge_tts.Communicate(text, VOICE, rate='-4%')
    if pitch:
        object.__setattr__(c.tts_config, 'pitch', pitch)
    await c.save(path)


async def main():
    os.makedirs(OUT, exist_ok=True)
    jobs = {
        '863_ex1': '혹시 카카오톡 해요? 아이디 알려주세요.',
        '867_ex2': '한국에서는 친구들끼리 더치페이 해요?',
    }
    for name, text in jobs.items():
        await whole(text, os.path.join(OUT, f'{name}_A_baseline.mp3'))                       # 기존: pitch 없음
        await whole(text, os.path.join(OUT, f'{name}_B_whole14.mp3'), '+14%')                # 지금 올라가 있는 것: 문장 전체 +14%
        await synth_raw(inner(text), os.path.join(OUT, f'{name}_C_tail20.mp3'))              # 요청안: ?어절만 +20% (앞부분은 기본 속도)
        print(name, 'ok')
    for n in sorted(os.listdir(OUT)):
        print(' ', n, os.path.getsize(os.path.join(OUT, n)))


if __name__ == '__main__':
    asyncio.run(main())
