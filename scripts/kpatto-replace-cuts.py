"""
K-PATTO 컷 이미지 교체 — 다시 만든 한 장짜리 만화를 컷으로 잘라 기존 컷 파일을 덮어쓴다.

  1) 오른쪽 아래 Gemini 반짝이 워터마크를 지운다.
     반짝이는 흰색을 일정 비율로 섞은 것이라, 어두운 배경 위의 반짝이(ALPHA_REFS)에서 픽셀마다 섞인 비율
     (알파 맵)을 재고 그 비율을 거꾸로 풀어 원래 색을 되살린다. 같은 크기의 기준이 없으면 cv2.inpaint 로 메운다.
     워터마크가 없는 이미지(밝기 차이가 없으면)는 건드리지 않는다.
  3%를 넘게 늘어나야 맞는 원본(비율이 다른 그림)은 덮어쓰지 않고 건너뛴다.
  2) 칸 사이 흰 여백(가로·세로)을 찾아 그 한가운데에서 자른다 — 기존 컷도 여백 가운데에서 잘려 있다.
  3) 줄마다 컷 수(와이드 1 · 분할 2)가 기존 컷 파일과 같은지 확인하고,
     각 컷을 기존 파일과 같은 크기 · 같은 이름(.png)으로 저장한다(LANCZOS 리사이즈).
  덮어쓰기 전에 기존 컷을 --backup 폴더에 복사해 둔다.

실행: python scripts/kpatto-replace-cuts.py --src <원본 폴더> --backup <백업 폴더> [--dry-run]
원본 파일 이름은 ep26.png · ep42.jpg 처럼 화 번호로 한다.
"""
import argparse
import glob
import os
import re
import shutil

import cv2
import numpy as np
from PIL import Image

PUBLIC = os.path.join(os.path.dirname(__file__), '..', 'public', 'kpatto')

# 반짝이 위치 · 크기(실측) — Gemini 는 이미지 크기에 따라 두 가지로 찍는다.
#   폭 1000px 이상: 모서리에서 (113, 113) 안쪽이 중심, 꼭짓점까지 58px (1312x3280 · 1184x3584, ep43 에 맞춘 값)
#   그보다 작으면:  (75, 75) 안쪽, 꼭짓점까지 약 15px (410x1024 · 338x1024)
WM_LARGE = (113, 58)
WM_SMALL = (75, 15)
MAX_STRETCH = 0.03
# 원본 비율이 기존 컷과 달라 늘리는 대신 위아래를 잘라 맞출 화 — 줄마다 잘라낼 높이 중 위쪽에서 덜어낼 몫.
# ep42: 새 그림이 0.33 비율(기존 0.40). 머리 · 손 · 컵이 남도록 줄마다 위치를 정했다.
CROP_FIT = {42: [0.47, 0.30, 0.35, 0.75]}
# 알파 맵을 잴 이미지: 반짝이가 어두운 단색 배경 위에 있는 것
ALPHA_REFS = ('ep43',)


def load(path):
    return cv2.imdecode(np.fromfile(path, np.uint8), cv2.IMREAD_COLOR)


def star_mask(size, radius, grow=0):
    """오목한 네 꼭짓점 별 — |x|^p + |y|^p <= r^p (p<1 이면 오목)."""
    c = size // 2
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    x, y = np.abs(xx - c), np.abs(yy - c)
    p = 0.6
    m = ((x / (radius + grow)) ** p + (y / (radius + grow)) ** p) <= 1.0
    return m.astype(np.uint8)


def wm_params(img):
    return WM_LARGE if img.shape[1] >= 1000 else WM_SMALL


def wm_box(img):
    h, w = img.shape[:2]
    offset, radius = wm_params(img)
    r = int(radius * 1.6)
    return w - offset - r, h - offset - r, 2 * r + 1


def estimate_alpha(paths):
    """어두운 단색 배경 위 반짝이에서 픽셀마다 섞인 흰색 비율(알파)을 잰다 — 반짝이 크기별로 따로.
    별 모양을 수식으로 맞추면 가장자리 · 꼭짓점에 테두리가 남아서, 실제 반짝이를 그대로 본뜬다(몸통 약 0.5)."""
    maps = {}
    for p in paths:
        img = load(p)
        params = wm_params(img)
        x0, y0, s = wm_box(img)
        patch = img[y0:y0 + s, x0:x0 + s]
        grow = max(2, params[1] // 10)
        hole = cv2.dilate(star_mask(s, params[1]), np.ones((2 * grow + 1, 2 * grow + 1), np.uint8))
        bg = cv2.inpaint(patch, hole, 9, cv2.INPAINT_TELEA).astype(np.float32)
        a = np.clip(((patch.astype(np.float32) - bg) / np.maximum(255.0 - bg, 1.0)).mean(axis=2), 0, 0.6) * hole
        a[a < 0.02] = 0
        maps.setdefault(params, []).append(a)
    return {k: np.mean(v, axis=0) for k, v in maps.items()}


def has_watermark(img):
    x0, y0, s = wm_box(img)
    radius = wm_params(img)[1]
    k = radius / 15
    g = cv2.cvtColor(img[y0:y0 + s, x0:x0 + s], cv2.COLOR_BGR2GRAY).astype(np.float32)
    inner = star_mask(s, radius - 5 * k).astype(bool)
    ring = (star_mask(s, radius + 7 * k) - star_mask(s, radius + 2 * k)).astype(bool)
    return float(g[inner].mean() - g[ring].mean())


def remove_watermark(img, alphas):
    params = wm_params(img)
    x0, y0, s = wm_box(img)
    out = img.copy()
    alpha = alphas.get(params)
    if alpha is not None:
        patch = img[y0:y0 + s, x0:x0 + s].astype(np.float32)
        a = alpha[..., None]
        restored = (patch - 255.0 * a) / np.maximum(1.0 - a, 0.05)
        out[y0:y0 + s, x0:x0 + s] = np.clip(restored, 0, 255).astype(np.uint8)
        return out
    # 같은 크기의 기준 이미지가 없으면 별 전체를 inpaint 로 메운다
    full = np.zeros(img.shape[:2], np.uint8)
    full[y0:y0 + s, x0:x0 + s] = star_mask(s, params[1], max(2, params[1] // 6))
    return cv2.inpaint(out, full, 3, cv2.INPAINT_TELEA)


def runs(mask):
    out, start = [], None
    for i, v in enumerate(mask):
        if v and start is None:
            start = i
        if not v and start is not None:
            out.append((start, i - 1))
            start = None
    if start is not None:
        out.append((start, len(mask) - 1))
    return out


def gutters(gray, axis):
    """흰 여백 줄(97% 이상이 밝은 행/열) 구간."""
    return runs(((gray > 225).mean(axis=axis) > 0.97).tolist())


def cut_boxes(img):
    """[(x0, y0, x1, y1), ...] 행 순서 → 왼쪽부터. 경계는 여백 한가운데, 바깥 테두리는 이미지 끝."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    hg = gutters(gray, 1)
    inner = [g for g in hg if 0.05 * h < g[0] and g[1] < 0.95 * h]   # 바깥 테두리 여백은 경계가 아니다
    ys = [0] + [(a + b + 1) // 2 for a, b in inner] + [h]
    # 세로 여백은 그림 부분만 보고 찾는다 — 가로 여백 줄이 섞이면 밝은 그림 열이 여백으로 잡힌다
    art = [(a[1] + 1, b[0]) for a, b in zip([(-1, -1)] + hg, hg + [(h, h)]) if b[0] - a[1] > 20]
    rows = []
    for (y0, y1), (a0, a1) in zip(zip(ys, ys[1:]), art):
        band = gray[a0:a1]
        vin = [g for g in gutters(band, 0) if 0.05 * w < g[0] and g[1] < 0.95 * w]
        xs = [0] + [(a + b + 1) // 2 for a, b in vin] + [w]
        rows.append([(x0, y0, x1, y1) for x0, x1 in zip(xs, xs[1:])])
    return rows


def existing_rows(ep):
    """기존 컷 파일을 줄 단위로 묶는다 — 전체 폭이면 한 줄에 하나, 아니면 두 장이 한 줄."""
    files = sorted(glob.glob(os.path.join(PUBLIC, f'ep-{ep:03d}', f'ep{ep}_c*.png')),
                   key=lambda p: int(re.search(r'_c(\d+)\.png$', p).group(1)))
    sizes = [(p, Image.open(p).size) for p in files]
    full = max(s[0] for _, s in sizes)
    rows, i = [], 0
    while i < len(sizes):
        if sizes[i][1][0] >= full - 2:
            rows.append([sizes[i]]); i += 1
        else:
            rows.append(sizes[i:i + 2]); i += 2
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True)
    ap.add_argument('--backup', required=True)
    ap.add_argument('--preview', help='워터마크 지운 원본 전체를 저장할 폴더(확인용)')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--only', help='이 화만 처리 (쉼표로 구분, 예: 28 또는 28,42)')
    args = ap.parse_args()

    sources = {int(re.match(r'ep(\d+)', os.path.basename(p)).group(1)): p
               for p in glob.glob(os.path.join(args.src, 'ep*.*'))}
    alphas = estimate_alpha([sources[int(n[2:])] for n in ALPHA_REFS if int(n[2:]) in sources])
    only = {int(x) for x in args.only.split(',')} if args.only else set(sources)

    for ep in sorted(only & set(sources)):
        img = load(sources[ep])
        h, w = img.shape[:2]
        score = has_watermark(img)
        if score > 12:
            img = remove_watermark(img, alphas)
        wm = f'watermark removed (contrast {score:.0f})' if score > 12 else f'no watermark (contrast {score:.0f})'
        if args.preview:
            os.makedirs(args.preview, exist_ok=True)
            cv2.imwrite(os.path.join(args.preview, f'ep{ep}_clean.png'), img)

        rows, old = cut_boxes(img), existing_rows(ep)
        layout_new = [len(r) for r in rows]
        layout_old = [len(r) for r in old]
        print(f'ep{ep}: source {w}x{h}, {wm}, rows {layout_new} (existing {layout_old})')
        if layout_new != layout_old:
            print(f'  ✗ layout differs from the existing cuts — skipped')
            continue

        plan = []
        for ri, (new_row, old_row) in enumerate(zip(rows, old)):
            if ep in CROP_FIT:
                # 줄마다 같은 높이로 잘라 분할 컷끼리 배율 · 높이가 맞게 한다. 남는 폭은 양옆에서 똑같이 덜어낸다.
                H = min((x1 - x0) * th / tw for (x0, y0, x1, y1), (_, (tw, th)) in zip(new_row, old_row))
            for (x0, y0, x1, y1), (path, (tw, th)) in zip(new_row, old_row):
                if ep in CROP_FIT:
                    W, cx = H * tw / th, (x0 + x1) / 2
                    top = y0 + ((y1 - y0) - H) * CROP_FIT[ep][ri]
                    box = (round(cx - W / 2), round(top), round(cx + W / 2), round(top + H))
                    print(f'  {os.path.basename(path)}: crop {box[2] - box[0]}x{box[3] - box[1]} '
                          f'(trim top {box[1] - y0} · bottom {y1 - box[3]} · sides {box[0] - x0}) → {tw}x{th}')
                    plan.append((box, path, (tw, th), 0.0))
                    continue
                stretch = (tw / th) / ((x1 - x0) / (y1 - y0)) - 1
                plan.append(((x0, y0, x1, y1), path, (tw, th), stretch))
                print(f'  {os.path.basename(path)}: crop {x1 - x0}x{y1 - y0} → {tw}x{th} (aspect change {stretch:+.1%})')
        # 원본 비율이 기존 컷과 다르면 같은 크기로 맞출 때 그림이 늘어난다 — 덮어쓰지 않는다(CROP_FIT 화는 잘라서 맞춤)
        if max(abs(p[3]) for p in plan) > MAX_STRETCH:
            print(f'  ✗ aspect change over {MAX_STRETCH:.0%} — skipped (the source has a different shape)')
            continue
        if args.dry_run:
            continue

        pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        for box, path, size, _ in plan:
            name = os.path.basename(path)
            os.makedirs(os.path.join(args.backup, f'ep-{ep:03d}'), exist_ok=True)
            bak = os.path.join(args.backup, f'ep-{ep:03d}', name)
            if not os.path.exists(bak):
                shutil.copy2(path, bak)
            pil.crop(box).resize(size, Image.LANCZOS).save(path, 'PNG', optimize=True)
        print(f'  ✓ {len(plan)} cuts written')


if __name__ == '__main__':
    main()
