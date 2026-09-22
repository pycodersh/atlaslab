"""서울 지하철 환승/교통카드 가이드 일러스트 3장 (Light Editorial, 300 DPI).

출력:
  public/images/articles/seoul-subway-transfer-transit-card-guide.jpg  표지 — 카드 태그 + 초록 체크
  public/images/posts/subway-transfer-30min-window.png                본문 — 30분 무료 환승 흐름
  public/images/posts/subway-wrong-gate-fix.png                        본문 — 반대 방향 게이트 무료 정정

인천공항/택시 가이드와 같은 규칙:
  - 축을 그림 전체에 깐다(1 단위 = 1 인치).
  - 글자 폭을 인치로 미리 재서 상자를 넘치면 생성을 멈춘다.
  - bbox_inches 를 쓰지 않는다.

실행: python scripts/gen_subway_illustrations.py
"""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyArrowPatch, FancyBboxPatch, Wedge
import matplotlib.patheffects as pe

POSTS = Path("public/images/posts")
ARTICLES = Path("public/images/articles")
DPI = 300

BG = "#F8FAFC"
INK = "#0F172A"
INK_SOFT = "#1E293B"
MUTED = "#64748B"
RED = "#C8102E"
GREEN = "#16A34A"
BLUE = "#3B82F6"
AMBER = "#F59E0B"

F_TITLE = 26
F_BOX_TITLE = 20
F_BODY = 16.5
F_SMALL = 14.5

CHAR_W = 0.60
CHAR_W_BOLD = 0.70

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "figure.facecolor": BG,
    "savefig.facecolor": BG,
    "text.color": INK,
})


def width_in(text, size, bold=False):
    return len(text) * (CHAR_W_BOLD if bold else CHAR_W) * size / 72.0


def check_fits(text, size, limit, where, bold=False):
    w = width_in(text, size, bold)
    if w > limit:
        raise SystemExit(f'[중단] 글자가 넘친다 — {where}: "{text}" {w:.2f}in > {limit:.2f}in')


def new_canvas(w, h, bg=BG):
    fig = plt.figure(figsize=(w, h), facecolor=bg)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    ax.axis("off")
    ax.set_facecolor(bg)
    return fig, ax


def glow(color, strong=True):
    import matplotlib.colors as mc
    r, g, b = mc.to_rgb(color)
    layers = [(20, 0.10), (12, 0.18), (5, 0.40)] if strong else [(8, 0.12)]
    return [pe.withStroke(linewidth=lw, foreground=(r, g, b, a)) for lw, a in layers] + [pe.Normal()]


def arrow(ax, p1, p2, color, lw=4.5, style="-|>"):
    ax.add_patch(FancyArrowPatch(p1, p2, arrowstyle=style, mutation_scale=26,
                                 linewidth=lw, color=color, zorder=4, shrinkA=0, shrinkB=0))


def icon_circle(ax, cx, cy, r, face, edge, text, tsize, tcolor="#FFFFFF", tbold=True):
    ax.add_patch(Circle((cx, cy), r, facecolor=face, edgecolor=edge, linewidth=2.2, zorder=3))
    ax.text(cx, cy, text, ha="center", va="center", fontsize=tsize,
            fontweight="bold" if tbold else "normal", color=tcolor, zorder=4)


def clock_face(ax, cx, cy, r, hand_deg=300, face="#FFFFFF", edge=INK_SOFT, hand_color=RED):
    """시계 아이콘 — hand_deg 는 12시 방향(90도)에서 시계 방향으로 줄어드는 정도."""
    ax.add_patch(Circle((cx, cy), r, facecolor=face, edgecolor=edge, linewidth=2.2, zorder=3))
    # 남은 시간을 파이 쐐기로 표시(12시부터 시계 방향으로 hand_deg 만큼)
    ax.add_patch(Wedge((cx, cy), r * 0.82, 90 - hand_deg, 90, facecolor=hand_color,
                       edgecolor="none", alpha=0.85, zorder=4))
    for a in range(0, 360, 90):
        import math
        x = cx + r * 0.9 * math.cos(math.radians(a))
        y = cy + r * 0.9 * math.sin(math.radians(a))


def box(ax, x, y, w, h, color, title, lines, fill="#FFFFFF"):
    inner = w - 0.30
    check_fits(title, F_BOX_TITLE, inner, f"{title} (제목)", bold=True)
    for line in lines:
        check_fits(line, F_SMALL, inner, f"{title} 안의 '{line}'")
    ax.add_patch(FancyBboxPatch(
        (x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.06",
        linewidth=2.2, edgecolor=color, facecolor=fill, zorder=2,
    ))
    ax.text(x + w / 2, y + h - 0.28, title, ha="center", va="top",
            fontsize=F_BOX_TITLE, fontweight="bold", color=color, zorder=3)
    for i, line in enumerate(lines):
        ax.text(x + w / 2, y + h - 0.72 - i * 0.36, line, ha="center", va="top",
                fontsize=F_SMALL, color=INK_SOFT, zorder=3)


# ── 1) 30분 무료 환승 흐름 ──────────────────────────────────────
def diagram_transfer_window(path):
    W, H = 11.5, 6.6
    fig, ax = new_canvas(W, H)

    title = "The 30-minute free transfer window"
    sub = "Tap out of the bus, and the clock starts — not the calendar day."
    check_fits(title, F_TITLE, W - 0.8, "제목", bold=True)
    check_fits(sub, F_BODY, W - 0.8, "부제")
    ax.text(W / 2, H - 0.30, title, ha="center", va="top", fontsize=F_TITLE,
            fontweight="bold", color=INK)
    ax.text(W / 2, H - 0.90, sub, ha="center", va="top", fontsize=F_BODY, color=MUTED)

    y = H - 2.9
    # 1) 버스 하차 태그
    icon_circle(ax, 1.6, y, 0.85, "#334155", "#0B0F19", "BUS\nOUT", 13)
    ax.text(1.6, y - 1.15, "Tap out\nexiting the bus", ha="center", va="top",
            fontsize=F_SMALL, color=INK_SOFT)

    arrow(ax, (2.55, y), (4.35, y), MUTED, lw=3.5)

    # 2) 타이머
    clock_face(ax, 5.3, y, 0.9, hand_deg=300, hand_color=AMBER)
    ax.text(5.3, y, "30\nmin", ha="center", va="center", fontsize=15, fontweight="bold", color=INK)
    ax.text(5.3, y - 1.15, "60 min between\n21:00 and 07:00", ha="center", va="top",
            fontsize=F_SMALL, color=INK_SOFT)

    arrow(ax, (6.25, y), (8.05, y), MUTED, lw=3.5)

    # 3) 지하철 탑승 태그
    icon_circle(ax, 9.0, y, 0.85, RED, "#7A0B1E", "SUBWAY\nIN", 12)
    ax.text(9.0, y - 1.15, "Tap in\nwithin the window", ha="center", va="top",
            fontsize=F_SMALL, color=INK_SOFT)

    # 결과 배지
    ax.add_patch(FancyBboxPatch((9.85, y - 0.42), 1.35, 0.84, boxstyle="round,pad=0.02,rounding_size=0.10",
                                linewidth=2, edgecolor=GREEN, facecolor="#F0FDF4", zorder=3))
    ax.text(9.85 + 0.675, y, "FREE", ha="center", va="center", fontsize=15,
            fontweight="bold", color=GREEN, zorder=4)

    warn = "Miss the window, and the next tap charges a full new base fare."
    check_fits(warn, F_BODY, W - 1.4, "경고", bold=False)
    ax.add_patch(FancyBboxPatch((0.5, 0.45), W - 1.0, 1.05, boxstyle="round,pad=0.02,rounding_size=0.06",
                                linewidth=2, edgecolor="#E5E1DC", facecolor="#FFFFFF", zorder=2))
    ax.text(W / 2, 0.97, warn, ha="center", va="center", fontsize=F_BODY, color=INK_SOFT, zorder=3)

    fig.savefig(path, dpi=DPI)
    plt.close(fig)


# ── 2) 반대 방향 게이트 무료 정정 ────────────────────────────────
def diagram_wrong_gate(path):
    W, H = 11.5, 7.4
    fig, ax = new_canvas(W, H)

    title = "Tapped the wrong platform? Fix it free"
    sub = "Tap out, then back in on the other side — within 15 minutes, same station."
    check_fits(title, F_TITLE, W - 0.8, "제목", bold=True)
    check_fits(sub, F_BODY, W - 0.8, "부제")
    ax.text(W / 2, H - 0.30, title, ha="center", va="top", fontsize=F_TITLE,
            fontweight="bold", color=INK)
    ax.text(W / 2, H - 0.90, sub, ha="center", va="top", fontsize=F_BODY, color=MUTED)

    steps = [
        ("1", RED, "Tap in", "Wrong-direction gate", "by mistake"),
        ("2", AMBER, "Tap out", "Same station,", "within 15 minutes"),
        ("3", GREEN, "Tap in", "Opposite-direction gate", "— zero extra charge"),
    ]
    pw, ph = 3.35, 3.4
    gx = 0.35
    x0 = (W - (pw * 3 + gx * 2)) / 2
    y0 = H - 2.15 - ph
    for i, (num, col, verb, l1, l2) in enumerate(steps):
        cx = x0 + i * (pw + gx)
        ax.add_patch(FancyBboxPatch((cx, y0), pw, ph, boxstyle="round,pad=0.02,rounding_size=0.08",
                                    linewidth=2.2, edgecolor=col, facecolor="#FFFFFF", zorder=2))
        icon_circle(ax, cx + pw / 2, y0 + ph - 0.75, 0.42, col, "#00000022", num, 20, tcolor="#FFFFFF")
        inner = pw - 0.35
        check_fits(verb, F_BOX_TITLE, inner, f"step{num}", bold=True)
        check_fits(l1, F_SMALL, inner, f"step{num} l1")
        check_fits(l2, F_SMALL, inner, f"step{num} l2")
        ax.text(cx + pw / 2, y0 + ph - 1.35, verb, ha="center", va="top", fontsize=F_BOX_TITLE,
                fontweight="bold", color=INK)
        ax.text(cx + pw / 2, y0 + ph - 1.85, l1, ha="center", va="top", fontsize=F_SMALL, color=INK_SOFT)
        ax.text(cx + pw / 2, y0 + ph - 2.20, l2, ha="center", va="top", fontsize=F_SMALL, color=INK_SOFT)
        if i < 2:
            arrow(ax, (cx + pw + 0.05, y0 + ph / 2), (cx + pw + gx - 0.05, y0 + ph / 2), MUTED, lw=3.5)

    note = "Works once per journey on standard lines — not a repeatable loophole."
    check_fits(note, F_BODY, W - 1.4, "각주")
    ax.text(W / 2, y0 - 0.55, note, ha="center", va="top", fontsize=F_BODY, color=MUTED)

    fig.savefig(path, dpi=DPI)
    plt.close(fig)


# ── 3) 표지 — 카드 태그 + 초록 체크 (3:2, 구성이 프레임을 채우게) ──
def cover(path):
    W, H = 9.0, 6.0
    fig, ax = new_canvas(W, H)

    # 배경 억양 — 브랜드 레드 글로우 하나로 빈 공간에 색을 준다
    ax.add_patch(Circle((1.3, 4.7), 1.5, facecolor=RED, alpha=0.07, edgecolor="none", zorder=0))
    ax.add_patch(Circle((7.7, 1.2), 1.7, facecolor=GREEN, alpha=0.06, edgecolor="none", zorder=0))

    cx = W / 2
    # 리더기 본체를 세로 3.2~5.2 에 두고, 카드를 그 위 4.3~5.9 에 겹쳐
    # 전체 구성이 세로 1.0~5.9 에 걸치게 한다(캔버스 6.0 을 거의 채운다)
    ax.add_patch(FancyBboxPatch((cx - 1.5, 0.85), 3.0, 3.55, boxstyle="round,pad=0.02,rounding_size=0.16",
                                linewidth=3, edgecolor="#0B0F19", facecolor="#1F2937", zorder=2))
    ax.add_patch(FancyBboxPatch((cx - 1.05, 2.85), 2.1, 1.05, boxstyle="round,pad=0.01,rounding_size=0.08",
                                linewidth=0, facecolor="#0B0F19", zorder=3))
    ax.text(cx, 3.37, "✓", ha="center", va="center", fontsize=46, color=GREEN, zorder=4,
            path_effects=glow(GREEN, strong=False))
    ax.add_patch(Circle((cx, 1.75), 0.58, facecolor="#374151", edgecolor="#0B0F19", linewidth=2, zorder=3))
    ax.add_patch(Circle((cx, 1.75), 0.31, facecolor="none", edgecolor=GREEN, linewidth=3, zorder=4))

    # 신호 아크 — 태그 패드에서 카드 쪽으로 퍼진다
    import matplotlib.patches as mpatches
    for r, a in [(0.95, 0.55), (1.25, 0.35), (1.55, 0.18)]:
        ax.add_patch(mpatches.Arc((cx, 1.75), r * 2, r * 2, angle=0, theta1=55, theta2=125,
                                  linewidth=3.5, color=GREEN, alpha=a, zorder=1))

    # 카드 — 리더기 위로 다가오는 모습, 살짝 기울여 태그하는 동작을 준다
    ax.add_patch(FancyBboxPatch((cx - 1.15, 4.25), 2.3, 1.5, boxstyle="round,pad=0.02,rounding_size=0.12",
                                linewidth=2.5, edgecolor="#0B0F19", facecolor=RED, zorder=5))
    ax.text(cx, 5.15, "T-money", ha="center", va="center", fontsize=16, fontweight="bold",
            color="#FFFFFF", zorder=6)
    ax.text(cx, 4.68, "●", ha="center", va="center", fontsize=14, color="#FFFFFF", alpha=0.85, zorder=6)

    fig.savefig(path, dpi=DPI // 2, facecolor=fig.get_facecolor())


def main():
    POSTS.mkdir(parents=True, exist_ok=True)
    ARTICLES.mkdir(parents=True, exist_ok=True)
    diagram_transfer_window(POSTS / "subway-transfer-30min-window.png")
    diagram_wrong_gate(POSTS / "subway-wrong-gate-fix.png")
    cover(ARTICLES / "seoul-subway-transfer-transit-card-guide.jpg")
    from PIL import Image
    for p in (POSTS / "subway-transfer-30min-window.png", POSTS / "subway-wrong-gate-fix.png",
              ARTICLES / "seoul-subway-transfer-transit-card-guide.jpg"):
        w, h = Image.open(p).size
        print(f"  {p}  {w}x{h}  {p.stat().st_size / 1024:,.0f} KB")


if __name__ == "__main__":
    main()
