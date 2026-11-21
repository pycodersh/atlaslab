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
LINES = ROOT / 'remotion' / 'BullBear' / 'lines.json'
OUT_DIR = ROOT / 'public' / 'audio' / 'bull-bear'
META = ROOT / 'remotion' / 'BullBear' / 'audio.generated.json'
VOICE = {'bull': 'Hyunmin', 'bear': 'Eunkyung'}
TEMPO = 1.0


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
    need = sum(len(l.get('say') or l['text']) for l in lines if not tc.cached(l.get('say') or l['text'], VOICE[l['who']], TEMPO).exists())
    c = tc.credits()
    print(f"엔진 Typecast {tc.MODEL} 템포 {TEMPO} · 황소=Hyunmin 곰=Eunkyung · {len(lines)}줄 · 새로 쓸 크레딧 ≈{need} (남은 {c['total'] - c['used']})")
    if need > c['total'] - c['used']:
        raise SystemExit('크레딧 부족')
    meta = []
    for i, l in enumerate(lines, 1):
        out = OUT_DIR / f'{i:02d}.mp3'
        fresh = tc.synth(l.get('say') or l['text'], VOICE[l['who']], out, TEMPO)
        total, start, end = probe(out)
        meta.append({'file': f'audio/bull-bear/{i:02d}.mp3', 'total': total, 'start': start, 'end': end})
        print(f"{i:02d} {l['who']:4} {'new ' if fresh else 'cache'} {total:5.2f}s  [{start:.2f}–{end:.2f}]")
    META.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
    print('합계', round(sum(m['end'] - m['start'] for m in meta), 2), '초(무음 제외)')


if __name__ == '__main__':
    main()
