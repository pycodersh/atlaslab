"""
3D 곰·황소 이미지(assets/characters/bull-bear-3d.png, 1672×941)에서 두 캐릭터를 따로 오려 낸다.

원본 알파가 지저분하다(빨강·초록 화살표 글로우가 알파 ~210 으로 남아 있다) → 알파는 버리고
크림색 위에 합성한 RGB 로 OpenCV GrabCut 을 돌려 캐릭터만 남긴다.
  출력  public/images/characters/bear.png, bull.png
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'assets' / 'characters' / 'bull-bear-3d.png'
OUT = ROOT / 'public' / 'images' / 'characters'

# (이름, x0, y0, x1, y1) — 캐릭터를 감싸는 사각형(느낌표 장식·화살표는 밖으로)
BOXES = [('bear', 288, 188, 752, 842), ('bull', 852, 150, 1418, 842)]


def main() -> None:
    # cv2.imread/imwrite 는 한글 경로를 못 연다 → 입출력은 PIL, 처리는 RGB 그대로
    rgba = np.asarray(Image.open(SRC).convert('RGBA'))
    a = rgba[..., 3:4].astype(np.float32) / 255
    cream = np.array([247, 245, 242], np.float32)  # RGB #F7F5F2
    bgr = (rgba[..., :3] * a + cream * (1 - a)).astype(np.uint8)
    OUT.mkdir(parents=True, exist_ok=True)
    for name, x0, y0, x1, y1 in BOXES:
        mask = np.zeros(bgr.shape[:2], np.uint8)
        bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
        cv2.grabCut(bgr, mask, (x0, y0, x1 - x0, y1 - y0), bgd, fgd, 8, cv2.GC_INIT_WITH_RECT)
        fg = (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)
        # 황소 귀 뒤로 초록 상승 화살표가 딸려 들어온다 — 초록이 도드라진 픽셀은 캐릭터가 아니다
        r, g, b = (bgr[..., i].astype(np.int16) for i in range(3))
        fg &= ~((g > r + 12) & (g > b + 12))
        fg = ndimage.binary_opening(fg, iterations=3)
        lab, n = ndimage.label(fg)
        if n > 1:
            sizes = ndimage.sum(fg, lab, range(1, n + 1))
            fg = lab == 1 + int(np.argmax(sizes))
        fg = ndimage.binary_fill_holes(fg)
        alpha = cv2.GaussianBlur((fg * 255).astype(np.uint8), (5, 5), 1.2)
        piece = np.dstack([bgr, alpha])[y0:y1, x0:x1]
        ys, xs = np.where(piece[..., 3] > 8)
        piece = piece[max(ys.min() - 10, 0):ys.max() + 10, max(xs.min() - 10, 0):xs.max() + 10]
        Image.fromarray(piece, 'RGBA').save(OUT / f'{name}.png', optimize=True)
        print(name, piece.shape[1::-1], file=sys.stderr)


if __name__ == '__main__':
    main()
