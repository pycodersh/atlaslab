"""
황소·곰 경제 쇼츠 대사 음성 — Typecast ssfm-v30, 템포 1.0 (쇼츠라 Basics 의 0.9 보다 빠르게)

  대본   remotion/BullBear/lines.json 의 say(발음용, 없으면 text)
  목소리 황소 = Hyunmin(남), 곰 = Eunkyung(여) — Sera 는 등록된 목소리 ID 가 없어 Eunkyung 으로
  출력   public/audio/bull-bear/NN.mp3 + remotion/BullBear/audio.generated.json (길이 · 앞뒤 무음 경계)
  캐시   out/remotion/tc-cache — 다시 돌려도 크레딧을 두 번 쓰지 않는다
"""
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import basics_typecast as tc  # noqa: E402

ROOT = tc.ROOT
# 도윤 — shortform-studio voices.ts 의 「신뢰/정보형 나레이션」 남성. Hyunmin 보다 차분한 해설 톤
tc.VOICES.setdefault('Doyun', 'tc_6a3350f8e5a50a4abe948fa8')

# python generate-voice.py [bullbear|pro|pro-light]
#   pro       = ProAnalystBriefing (다크, Hyunmin, 템포 1.0, 씬당 1클립)
#   pro-light = ProAnalystLight    (에디토리얼, 도윤, 템포 0.93, 문장마다 1클립 — 문장 사이 숨은 컴포지션이 0.35초 넣는다)
SETS = {
    'bullbear': ('BullBear/lines.json', 'bull-bear', 'BullBear/audio.generated.json', {'bull': 'Hyunmin', 'bear': 'Eunkyung'}, 1.0),
    'pro': ('ProAnalyst/lines.json', 'pro-analyst', 'ProAnalyst/audio.generated.json', {'analyst': 'Hyunmin'}, 1.0),
    'pro-light': ('ProAnalyst/lines-light.json', 'pro-analyst-light', 'ProAnalyst/audio-light.generated.json', {'analyst': 'Doyun'}, 0.93),
    'ipo': ('Ipo/lines.json', 'ipo-liquidity', 'Ipo/audio.generated.json', {'analyst': 'Doyun'}, 0.93),
}
_lines, _audio, _meta, VOICE, TEMPO = SETS[sys.argv[1] if len(sys.argv) > 1 else 'bullbear']
LINES = ROOT / 'remotion' / _lines
OUT_DIR = ROOT / 'public' / 'audio' / _audio
META = ROOT / 'remotion' / _meta


def probe(path: Path) -> tuple[float, float, float]:
    """(전체 길이, 소리 시작, 소리 끝) — silencedetect 로 앞뒤 무음을 잰다"""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(path), '-af', 'silencedetect=n=-40dB:d=0.08', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    log = r.stderr
    total = 0.0
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', log)
    if m:
        total = int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    begin = ends[0] if starts and starts[0] < 0.02 and ends else 0.0
    end = starts[-1] if starts and (not ends or starts[-1] > ends[-1]) else total
    return round(total, 3), round(begin, 3), round(end, 3)


def main() -> None:
    lines = json.loads(LINES.read_text(encoding='utf-8'))
    # 씬 안에 sentences 가 있으면 문장마다 클립 하나 — meta 순서는 씬 → 문장 순으로 평평하게
    if lines and 'sentences' in lines[0]:
        lines = [{**s, 'who': l.get('who', 'analyst')} for l in lines for s in l['sentences']]
    need = sum(len(l.get('say') or l['text']) for l in lines if not tc.cached(l.get('say') or l['text'], VOICE[l.get('who', 'analyst')], TEMPO).exists())
    c = tc.credits()
    print(f"엔진 Typecast {tc.MODEL} 템포 {TEMPO} · {' '.join(f'{k}={v}' for k, v in VOICE.items())} · {len(lines)}줄 · 새로 쓸 크레딧 ≈{need} (남은 {c['total'] - c['used']})")
    if need > c['total'] - c['used']:
        raise SystemExit('크레딧 부족')
    meta = []
    for i, l in enumerate(lines, 1):
        out = OUT_DIR / f'{i:02d}.mp3'
        fresh = tc.synth(l.get('say') or l['text'], VOICE[l.get('who', 'analyst')], out, TEMPO)
        total, start, end = probe(out)
        meta.append({'file': f'audio/{_audio}/{i:02d}.mp3', 'total': total, 'start': start, 'end': end})
        print(f"{i:02d} {l.get('who', 'analyst'):7} {'new ' if fresh else 'cache'} {total:5.2f}s  [{start:.2f}–{end:.2f}]")
    META.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
    print('합계', round(sum(m['end'] - m['start'] for m in meta), 2), '초(무음 제외)')


if __name__ == '__main__':
    main()
