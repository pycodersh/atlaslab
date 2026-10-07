"""
korean-road-name-address-vs-lot-number-guide 글에 넣는 설명 도식 3장.

규칙(이전 도식 작업에서 얻은 것):
- axes 가 figure 전체를 덮게 한다(기본 axes 는 77% 라 글자가 넘친다)
- bbox_inches='tight' 를 쓰지 않는다(레이아웃이 밀린다)
- savefig 에 facecolor 를 명시한다
- 글자가 칸·캔버스를 넘는지 그릴 때마다 실측해서 문제를 모아 출력한다

실행: python scripts/gen_address_diagrams.py <출력 폴더>
"""
import os
import sys

import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from matplotlib.patches import FancyBboxPatch, Rectangle, FancyArrowPatch

for f in ('malgun.ttf', 'malgunbd.ttf'):
    p = os.path.join('C:/Windows/Fonts', f)
    if os.path.exists(p):
        fm.fontManager.addfont(p)
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

BG, INK, RED, GREY, LINE, WHITE = '#F9F8F6', '#1E293B', '#C8102E', '#64748B', '#CBD5E1', '#FFFFFF'
ROAD, SOFT = '#475569', '#EEF2F6'
DPI = 100
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
problems = []


def canvas(w, h):
    fig = plt.figure(figsize=(w / DPI, h / DPI), dpi=DPI, facecolor=BG)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, w)
    ax.set_ylim(h, 0)
    ax.axis('off')
    return fig, ax


def text(fig, ax, x, y, s, size, color=INK, weight='normal', ha='center', va='center', maxw=None, **kw):
    t = ax.text(x, y, s, fontsize=size, color=color, fontweight=weight, ha=ha, va=va, **kw)
    fig.canvas.draw()
    bb = t.get_window_extent(fig.canvas.get_renderer())
    w = fig.get_figwidth() * DPI
    if maxw and bb.width > maxw:
        problems.append(f'칸 초과 {s!r}: {bb.width:.0f}px > {maxw}px')
    if bb.x0 < 6 or bb.x1 > w - 6:
        problems.append(f'캔버스 밖 {s!r}: {bb.x0:.0f}~{bb.x1:.0f} / {w:.0f}')
    return t


def box(ax, x, y, w, h, fc, ec=LINE, lw=2.5, r=14, z=1):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=f'round,pad=0,rounding_size={r}', fc=fc, ec=ec, lw=lw, zorder=z))


def save(fig, name):
    fig.savefig(os.path.join(OUT, name), dpi=DPI, facecolor=fig.get_facecolor())
    plt.close(fig)
    print('saved', name)


# ───────────────────────── 1. 주소 해부도 ─────────────────────────
W, H = 1360, 600
fig, ax = canvas(W, H)
text(fig, ax, W / 2, 52, 'Anatomy of a road-name address', 27, INK, 'bold')
parts = [
    ('서울특별시', WHITE, INK, LINE, 270, 'City', 'Seoul'),
    ('중구', WHITE, INK, LINE, 170, 'District', 'Jung-gu'),
    ('세종대로', RED, WHITE, RED, 260, 'Road name', '-daero / -ro / -gil'),
    ('110', RED, WHITE, RED, 200, 'Building number', 'rises along the road'),
    ('(태평로1가)', SOFT, GREY, LINE, 260, 'Neighborhood', 'ignore when searching'),
]
gap = 28
x = (W - (sum(p[4] for p in parts) + gap * 4)) / 2
for kor, fc, tc, ec, w, l1, l2 in parts:
    box(ax, x, 125, w, 120, fc, ec)
    text(fig, ax, x + w / 2, 185, kor, 26, tc, 'bold', maxw=w - 24)
    text(fig, ax, x + w / 2, 285, l1, 17, INK, 'bold', maxw=w + gap - 4)
    text(fig, ax, x + w / 2, 315, l2, 14, GREY, maxw=w + gap - 4)
    x += w + gap
box(ax, 150, 385, W - 300, 150, WHITE, INK, 2.5)
text(fig, ax, W / 2, 420, 'Paste the whole line into Naver Map or Kakao Map', 18, GREY, maxw=W - 340)
text(fig, ax, W / 2, 478, '서울특별시 중구 세종대로 110', 33, INK, 'bold', maxw=W - 340)
text(fig, ax, W / 2, 570, 'Example: Seoul City Hall  (110 Sejong-daero, Jung-gu, Seoul)', 15, GREY, maxw=W - 80)
save(fig, 'addr-anatomy.png')

# ───────────────────────── 2. 건물번호 규칙 ─────────────────────────
W, H = 1360, 660
fig, ax = canvas(W, H)
text(fig, ax, W / 2, 50, 'How building numbers run along a road', 27, INK, 'bold')
ax.add_patch(Rectangle((90, 290), 1180, 70, fc=ROAD, ec=ROAD, zorder=1))
ax.add_patch(FancyArrowPatch((130, 325), (1240, 325), arrowstyle='-|>', mutation_scale=30, color=LINE, lw=5, zorder=2))
text(fig, ax, 700, 325, 'numbers get bigger', 18, WHITE, 'bold', bbox=dict(fc=ROAD, ec=ROAD, pad=8), zorder=3)
for i, cx in enumerate([230, 450, 670, 890, 1110]):
    odd, even = 2 * i + 1, 2 * i + 2
    box(ax, cx - 80, 150, 160, 105, WHITE, LINE)          # 위쪽(왼쪽, 홀수)
    box(ax, cx - 38, 205, 76, 40, INK, INK, r=8, z=3)
    text(fig, ax, cx, 225, str(odd), 22, WHITE, 'bold', zorder=4)
    box(ax, cx - 80, 395, 160, 105, WHITE, LINE)          # 아래쪽(오른쪽, 짝수)
    box(ax, cx - 38, 405, 76, 40, RED, RED, r=8, z=3)
    text(fig, ax, cx, 425, str(even), 22, WHITE, 'bold', zorder=4)
ax.add_patch(Rectangle((82, 282), 10, 86, fc=RED, ec=RED, zorder=4))
text(fig, ax, 90, 540, 'Road starts here', 17, RED, 'bold', ha='left', maxw=260)
text(fig, ax, 1270, 112, 'LEFT side:  odd numbers', 20, INK, 'bold', ha='right', maxw=520)
text(fig, ax, 1270, 540, 'RIGHT side:  even numbers', 20, RED, 'bold', ha='right', maxw=520)
text(fig, ax, W / 2, 615, 'Face the direction the numbers rise: odd numbers on your left, even numbers on your right.', 16, GREY, maxw=W - 100)
save(fig, 'addr-numbers.png')

# ───────────────────────── 3. 층·호 표기 ─────────────────────────
W, H = 1360, 660
fig, ax = canvas(W, H)
text(fig, ax, W / 2, 50, 'The map stops at the building: add the floor and unit', 27, INK, 'bold', maxw=W - 80)
floors = [('3층 · 3F', 130, WHITE), ('2층 · 2F', 230, WHITE), ('1층 · 1F', 330, WHITE)]
for label, y, fc in floors:
    box(ax, 360, y, 300, 100, fc, INK, 2.5, r=6)
    text(fig, ax, 340, y + 50, label, 20, INK, 'bold', ha='right', maxw=220)
    for wx in (400, 480, 560):
        ax.add_patch(Rectangle((wx, y + 28), 44, 44, fc=SOFT, ec=LINE, lw=2, zorder=2))
box(ax, 360, 430, 300, 100, '#E2E8F0', INK, 2.5, r=6)
text(fig, ax, 340, 480, '지하 1층 · B1', 20, INK, 'bold', ha='right', maxw=220)
ax.plot([300, 700], [430, 430], color=INK, lw=4, zorder=5)
text(fig, ax, 288, 430, 'street level', 15, GREY, ha='right', maxw=190)
# 3층 평면도
text(fig, ax, 1020, 130, 'Floor plan of the 3rd floor', 20, INK, 'bold', maxw=520)
rooms = [('301호', RED, WHITE), ('302호', WHITE, INK), ('303호', WHITE, INK), ('304호', WHITE, INK)]
rx = 760
for name, fc, tc in rooms:
    box(ax, rx, 165, 120, 125, fc, INK if fc == WHITE else RED, 2.5, r=6)
    text(fig, ax, rx + 60, 227, name, 21, tc, 'bold', maxw=108)
    rx += 130
box(ax, 760, 300, 510, 40, SOFT, LINE, 2, r=6)
text(fig, ax, 1015, 320, 'hallway', 15, GREY)
text(fig, ax, 760, 385, '층 (cheung) = floor', 20, INK, 'bold', ha='left', maxw=520)
text(fig, ax, 760, 425, '호 (ho) = unit / room', 20, INK, 'bold', ha='left', maxw=520)
text(fig, ax, 760, 468, '301호 is usually on the 3rd floor, unit 1', 16, GREY, ha='left', maxw=520)
box(ax, 150, 565, W - 300, 70, WHITE, INK, 2.5)
text(fig, ax, W / 2, 600, '세종대로 110   +   3층 301호', 27, INK, 'bold', maxw=W - 340)
save(fig, 'addr-floors.png')

print('\n문제 없음' if not problems else '\n문제:\n' + '\n'.join(problems))
