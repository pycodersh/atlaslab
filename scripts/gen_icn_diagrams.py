"""인천공항 가이드 다이어그램 2장 생성 (Light Editorial, 300 DPI PNG).

출력:
  public/images/posts/icn-terminal-layout.png   터미널 3구역 + 셔틀버스 / IAT 편도 경고
  public/images/posts/t1-arrivals-to-arex.png   1F 도착장 → B1 교통센터 → AREX 두 게이트

디자인 기준:
  - 배경 #F8FAFC, 글자·테두리 #0F172A / #1E293B (고대비)
  - 포인트색: 파랑=T1/일반, 보라=탑승동, 주황=T2/직통, 레드=경고
  - 글자는 본문 대비 1.5배 이상. 그림 폭이 11인치(=xlim 11)라 19pt 한 줄이
    이미지 폭의 약 4%로, 모바일에서 672px 로 줄어들어도 27px 상당으로 읽힌다.

★ 상자 밖으로 글자가 넘치지 않게 CHAR_W 로 폭을 미리 재고, 넘치면 그림을
  만들지 않고 멈춘다. 눈으로 확인하기 전에 숫자로 먼저 걸러내기 위함이다.
★ bbox_inches 는 쓰지 않는다. tight 로 자르면 축 밖으로 나간 글자만큼
  그림이 넓어져 구도가 밀린다(처음 판에서 실제로 밀렸다).

실행: python scripts/gen_icn_diagrams.py
"""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

OUT_DIR = Path("public/images/posts")
DPI = 300

BG = "#F8FAFC"
INK = "#0F172A"
INK_SOFT = "#1E293B"
BLUE = "#1D4ED8"
PURPLE = "#7C3AED"
ORANGE = "#EA580C"
RED = "#DC2626"

F_TITLE = 28
F_BOX_TITLE = 25
F_LEAD = 21
F_BODY = 19

# DejaVu Sans 평균 글자 폭(em 비율). 볼드가 더 넓어서 따로 잡는다.
CHAR_W = 0.60
CHAR_W_BOLD = 0.70

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "figure.facecolor": BG,
    "savefig.facecolor": BG,
    "text.color": INK,
})


def width_in(text: str, size: float, bold: bool = False) -> float:
    """해당 글자 크기로 그렸을 때의 대략적인 가로 폭(인치)."""
    return len(text) * (CHAR_W_BOLD if bold else CHAR_W) * size / 72.0


def check_fits(text: str, size: float, limit: float, where: str, bold: bool = False) -> None:
    w = width_in(text, size, bold)
    if w > limit:
        raise SystemExit(
            f"[중단] 글자가 상자를 넘는다 — {where}\n"
            f"        \"{text}\"  {w:.2f}in > {limit:.2f}in"
        )


def new_canvas(w: float, h: float):
    """축을 그림 전체에 깐다.

    ★ plt.subplots() 의 기본 축은 그림의 77% 만 차지한다. 그러면 xlim 1 단위가
      1 인치가 아니게 되고(11인치 그림에서 0.775인치), 인치로 계산한 글자 폭이
      전부 어긋나 상자를 넘친다. 실제로 첫 판에서 그렇게 넘쳤다.
    """
    fig = plt.figure(figsize=(w, h))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    ax.axis("off")
    return fig, ax


def box(ax, x, y, w, h, color, title, lines, fill="#FFFFFF"):
    """색 테두리 + 흰 바탕 카드. 제목은 색, 본문은 잉크색."""
    inner = w - 0.30
    check_fits(title, F_BOX_TITLE, inner, f"{title} (제목)", bold=True)
    for line in lines:
        check_fits(line, F_BODY, inner, f"{title} 안의 '{line}'")

    ax.add_patch(FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0.02,rounding_size=0.05",
        linewidth=3.2, edgecolor=color, facecolor=fill, zorder=2,
    ))
    ax.text(x + w / 2, y + h - 0.30, title, ha="center", va="top",
            fontsize=F_BOX_TITLE, fontweight="bold", color=color, zorder=3)
    for i, line in enumerate(lines):
        ax.text(x + w / 2, y + h - 0.85 - i * 0.40, line, ha="center", va="top",
                fontsize=F_BODY, color=INK_SOFT, zorder=3)


def arrow(ax, p1, p2, color, style="-|>", lw=5.0):
    ax.add_patch(FancyArrowPatch(
        p1, p2, arrowstyle=style, mutation_scale=32,
        linewidth=lw, color=color, zorder=4, shrinkA=0, shrinkB=0,
    ))


def diagram_terminals(path: Path):
    W, H = 12.0, 7.6
    fig, ax = new_canvas(W, H)

    ax.text(W / 2, H - 0.30, "Incheon Airport (ICN) — Terminal Layout",
            ha="center", va="top", fontsize=F_TITLE, fontweight="bold", color=INK)

    # 랜드사이드 무료 셔틀버스 — T1 ↔ T2 양방향
    ax.text(W / 2, H - 1.15, "Free Shuttle Bus · Landside · 15–20 min",
            ha="center", va="top", fontsize=F_LEAD, fontweight="bold", color=INK_SOFT)
    arrow(ax, (2.2, H - 1.75), (W - 2.2, H - 1.75), INK_SOFT, style="<|-|>", lw=3.6)

    bw, gap = 3.5, 0.3
    y, h = 2.95, 2.55
    x0 = (W - (bw * 3 + gap * 2)) / 2
    box(ax, x0, y, bw, h, BLUE, "Terminal 1",
        ["Gates 1 – 50", "Star Alliance", "AREX hub (B1)"])
    box(ax, x0 + bw + gap, y, bw, h, PURPLE, "Concourse A",
        ["Gates 101 – 132", "Low-cost carriers", "Duty-free (3F)"])
    box(ax, x0 + (bw + gap) * 2, y, bw, h, ORANGE, "Terminal 2",
        ["Gates 230 – 270", "Korean Air", "SkyTeam (B1 hub)"])

    # 에어사이드 IAT 셔틀트레인 — T1 → 탑승동 편도.
    # 라벨은 화살표 위(상자 사이 빈 줄)에 두어 아래 경고 상자와 겹치지 않게 한다.
    ax.text(W / 2, 2.82, "IAT Shuttle Train · Airside", ha="center", va="top",
            fontsize=F_LEAD, fontweight="bold", color=RED)
    arrow(ax, (x0 + 1.0, 2.30), (x0 + bw + gap + 1.8, 2.30), RED, lw=5.5)

    warn_title = "STRICTLY ONE-WAY:  T1 → Concourse A"
    warn_body = "Once you board, you cannot return to Terminal 1."
    check_fits(warn_title, F_BOX_TITLE, W - 1.4, "경고 상자 제목", bold=True)
    check_fits(warn_body, F_BODY, W - 1.4, "경고 상자 본문")
    ax.add_patch(FancyBboxPatch(
        (0.5, 0.35), W - 1.0, 1.50,
        boxstyle="round,pad=0.02,rounding_size=0.05",
        linewidth=3.2, edgecolor=RED, facecolor="#FEF2F2", zorder=2,
    ))
    ax.text(W / 2, 1.60, warn_title, ha="center", va="top",
            fontsize=F_BOX_TITLE, fontweight="bold", color=RED, zorder=3)
    ax.text(W / 2, 1.00, warn_body, ha="center", va="top",
            fontsize=F_BODY, color=INK, zorder=3)

    fig.savefig(path, dpi=DPI)
    plt.close(fig)


def diagram_arex(path: Path):
    W, H = 11.5, 8.15
    fig, ax = new_canvas(W, H)

    ax.text(W / 2, H - 0.30, "Terminal 1: Arrivals → AREX",
            ha="center", va="top", fontsize=F_TITLE, fontweight="bold", color=INK)

    # 1F 도착층
    ax.add_patch(FancyBboxPatch(
        (0.5, 5.30), W - 1.0, 1.95,
        boxstyle="round,pad=0.02,rounding_size=0.05",
        linewidth=3.2, edgecolor=INK, facecolor="#FFFFFF", zorder=2,
    ))
    ax.text(W / 2, 7.03, "1F  ARRIVALS HALL", ha="center", va="top",
            fontsize=F_BOX_TITLE, fontweight="bold", color=INK, zorder=3)
    ax.text(W / 2, 6.43, "Central Exits 4 – 9", ha="center", va="top",
            fontsize=F_LEAD, fontweight="bold", color=ORANGE, zorder=3)
    ax.text(W / 2, 5.91, "Limousine Bus · International Taxi", ha="center", va="top",
            fontsize=F_BODY, color=INK_SOFT, zorder=3)

    # 1F → B1 (굵은 하향 화살표 + 오른쪽 두 줄 캡션)
    cap1, cap2 = "Take the central escalator", "or elevator down to B1"
    check_fits(cap1, F_BODY, W - 4.3, "B1 안내 1줄", bold=True)
    check_fits(cap2, F_BODY, W - 4.3, "B1 안내 2줄", bold=True)
    arrow(ax, (3.3, 5.15), (3.3, 4.10), INK, lw=7.0)
    ax.text(3.85, 4.92, cap1, ha="left", va="top",
            fontsize=F_BODY, fontweight="bold", color=INK)
    ax.text(3.85, 4.48, cap2, ha="left", va="top",
            fontsize=F_BODY, fontweight="bold", color=INK)

    b1 = "B1  TRANSPORTATION CENTER · AREX"
    check_fits(b1, F_BOX_TITLE, W - 0.6, "B1 제목", bold=True)
    ax.text(W / 2, 3.87, b1, ha="center", va="top",
            fontsize=F_BOX_TITLE, fontweight="bold", color=INK)

    bw, gap = 5.15, 0.5
    y, h = 0.55, 2.75
    x0 = (W - (bw * 2 + gap)) / 2
    box(ax, x0, y, bw, h, ORANGE, "ORANGE GATE",
        ["Express Train", "Seoul Station · non-stop", "43 min from T1", "₩11,000 · reserved seat"])
    box(ax, x0 + bw + gap, y, bw, h, BLUE, "BLUE GATE",
        ["All-Stop Train", "Hongdae · Sinchon · more", "all 14 stations", "from ₩4,150 · no booking"])

    fig.savefig(path, dpi=DPI)
    plt.close(fig)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for path, fn in [
        (OUT_DIR / "icn-terminal-layout.png", diagram_terminals),
        (OUT_DIR / "t1-arrivals-to-arex.png", diagram_arex),
    ]:
        fn(path)
        kb = path.stat().st_size / 1024
        print(f"  {path}  {kb:,.0f} KB")


if __name__ == "__main__":
    main()
