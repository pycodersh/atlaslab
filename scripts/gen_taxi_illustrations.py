"""한국 택시 가이드 일러스트 3장 (Light Editorial, 300 DPI).

출력:
  public/images/articles/korea-taxi-survival-guide.jpg  표지 — 빛나는 '빈차' 표시등 하나
  public/images/posts/taxi-roof-sign-states.png         본문 — 표시등 4가지 상태
  public/images/posts/taxi-types-by-color.png           본문 — 택시 종류 4가지(색·차형)

인천공항 다이어그램(gen_icn_diagrams.py)과 같은 규칙:
  - 축을 그림 전체에 깐다(1 단위 = 1 인치). 기본 축은 그림의 77% 라 글자 폭 계산이 어긋난다.
  - 글자 폭을 인치로 미리 재서 상자를 넘으면 그림을 만들지 않고 멈춘다.
  - bbox_inches 를 쓰지 않는다(축 밖 글자만큼 그림이 넓어져 구도가 밀린다).
한글은 DejaVu 에 없어서 맑은 고딕을 따로 등록해 쓴다.

실행: python scripts/gen_taxi_illustrations.py
"""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.patches import Circle, FancyBboxPatch, Polygon
import matplotlib.patheffects as pe

POSTS = Path("public/images/posts")
ARTICLES = Path("public/images/articles")
DPI = 300

BG = "#F8FAFC"
INK = "#0F172A"
INK_SOFT = "#1E293B"
MUTED = "#64748B"
RED = "#EF4444"
BLUE = "#3B82F6"
AMBER = "#F59E0B"
GREEN = "#16A34A"
TAXI_ORANGE = "#E4852F"   # 서울 택시 해치 오렌지 계열
DELUXE = "#1F2937"
ROOF_YELLOW = "#F5C518"
VAN = "#374151"

F_TITLE = 26
F_BOX_TITLE = 21
F_BODY = 16.5
F_SMALL = 14.5

CHAR_W = 0.60
CHAR_W_BOLD = 0.70

# 맑은 고딕 등록 — 한글 표시등 문구에만 쓴다
for f in ("C:/Windows/Fonts/malgun.ttf", "C:/Windows/Fonts/malgunbd.ttf"):
    font_manager.fontManager.addfont(f)
KO = "Malgun Gothic"

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
    """LED 번짐 — 굵은 반투명 외곽선을 겹쳐 빛나는 느낌을 낸다."""
    import matplotlib.colors as mc
    r, g, b = mc.to_rgb(color)
    layers = [(22, 0.10), (13, 0.20), (6, 0.45)] if strong else [(10, 0.10)]
    return [pe.withStroke(linewidth=lw, foreground=(r, g, b, a)) for lw, a in layers] + [pe.Normal()]


def led_sign(ax, cx, cy, w, h, text, color, lit=True, size=34):
    """앞유리 모서리의 표시등 — 검은 판 위에 빛나는 한글."""
    ax.add_patch(FancyBboxPatch(
        (cx - w / 2, cy - h / 2), w, h,
        boxstyle="round,pad=0.02,rounding_size=0.10",
        linewidth=2.2, edgecolor="#0B0F19", facecolor="#111827", zorder=3,
    ))
    if lit:
        ax.text(cx, cy - 0.02, text, ha="center", va="center", fontsize=size,
                fontfamily=KO, fontweight="bold", color=color, zorder=4,
                path_effects=glow(color))
    else:
        # 꺼진 상태 — 판만 있고 글자는 거의 안 보인다
        ax.text(cx, cy - 0.02, text, ha="center", va="center", fontsize=size,
                fontfamily=KO, fontweight="bold", color="#1F2937", zorder=4)


# ── 1) 표시등 4가지 상태 ─────────────────────────────────────────
def diagram_sign_states(path):
    # 높이 = 머리 1.55 + 패널 2.9×2 + 간격 0.3 + 아래 여백 0.35
    W, H = 11.0, 8.0
    fig, ax = new_canvas(W, H)

    title = "Korean taxi signs: red means VACANT"
    sub = "Red 빈차 = empty. Read the word, not just the color."
    check_fits(title, F_TITLE, W - 0.8, "제목", bold=True)
    check_fits(sub, F_BODY, W - 0.8, "부제")
    ax.text(W / 2, H - 0.30, title, ha="center", va="top",
            fontsize=F_TITLE, fontweight="bold", color=INK)
    ax.text(W / 2, H - 0.95, sub, ha="center", va="top", fontsize=F_BODY, color=MUTED,
            fontfamily=[KO, "DejaVu Sans"])

    states = [
        # (한글, 색, 켜짐, 제목, 설명1, 설명2, 행동색, 행동)
        # 휴무는 원고대로 '빨간 표시 또는 꺼짐' — 빈차와 같은 빨강이라 글자로 가려야 한다
        ("빈차", RED, True, "VACANT", "Empty, free to hail", "from the street", GREEN, "WAVE IT DOWN"),
        ("예약", BLUE, True, "RESERVED", "Booked through an app", "(Kakao T, UT)", MUTED, "WON'T STOP"),
        ("휴무", RED, True, "OFF DUTY", "Shift over, heading", "back to the garage", MUTED, "WON'T STOP"),
        ("빈차", RED, False, "OCCUPIED", "Sign goes dark while", "the meter is running", MUTED, "ALREADY TAKEN"),
    ]
    pw, ph = 5.0, 2.9
    gx, gy = 0.35, 0.30
    x0 = (W - (pw * 2 + gx)) / 2
    y_top = H - 1.55
    for i, (ko, col, lit, name, d1, d2, act_col, act) in enumerate(states):
        cx = x0 + (i % 2) * (pw + gx)
        cy = y_top - (i // 2) * (ph + gy) - ph
        ax.add_patch(FancyBboxPatch(
            (cx, cy), pw, ph, boxstyle="round,pad=0.02,rounding_size=0.08",
            linewidth=2.0, edgecolor="#CBD5E1", facecolor="#FFFFFF", zorder=1,
        ))
        # 왼쪽: 표시등, 오른쪽: 설명 (표시등을 줄여 설명 칸을 2.7in 확보)
        led_sign(ax, cx + 1.1, cy + ph / 2 + 0.05, 1.75, 0.95, ko, col, lit=lit, size=27)
        tx = cx + 2.15
        inner = pw - 2.3
        for t, s, b in ((name, F_BOX_TITLE, True), (d1, F_SMALL, False), (d2, F_SMALL, False), (act, F_SMALL, True)):
            check_fits(t, s, inner, f"{name} 패널", bold=b)
        ax.text(tx, cy + ph - 0.42, name, ha="left", va="top", fontsize=F_BOX_TITLE,
                fontweight="bold", color=INK)
        ax.text(tx, cy + ph - 1.08, d1, ha="left", va="top", fontsize=F_SMALL, color=INK_SOFT)
        ax.text(tx, cy + ph - 1.45, d2, ha="left", va="top", fontsize=F_SMALL, color=INK_SOFT)
        ax.text(tx, cy + 0.45, act, ha="left", va="bottom", fontsize=F_SMALL,
                fontweight="bold", color=act_col)

    fig.savefig(path, dpi=DPI)
    plt.close(fig)


# ── 2) 택시 종류 4가지 ──────────────────────────────────────────
def car(ax, x, y, body, *, van=False, roof=None, stripe=None, decal=None):
    """옆모습 자동차 — 폭 3.2, 높이 1.5 안팎. (x, y) 는 왼쪽 아래 바퀴선."""
    L = 3.2
    if van:
        cabin = Polygon([(x + 0.25, y + 0.62), (x + 0.45, y + 1.55), (x + 2.95, y + 1.55),
                         (x + 3.1, y + 0.62)], closed=True, facecolor=body,
                        edgecolor="#0B0F19", linewidth=1.6, zorder=2)
        win = [(x + 0.62, y + 0.95, 0.95, 0.46), (x + 1.66, y + 0.95, 0.62, 0.46),
               (x + 2.36, y + 0.95, 0.55, 0.46)]
    else:
        cabin = Polygon([(x + 0.55, y + 0.62), (x + 0.95, y + 1.22), (x + 2.25, y + 1.22),
                         (x + 2.75, y + 0.62)], closed=True, facecolor=body,
                        edgecolor="#0B0F19", linewidth=1.6, zorder=2)
        win = [(x + 1.02, y + 0.72, 0.58, 0.40), (x + 1.68, y + 0.72, 0.62, 0.40)]
    ax.add_patch(cabin)
    ax.add_patch(FancyBboxPatch((x, y + 0.2), L, 0.55, boxstyle="round,pad=0.02,rounding_size=0.18",
                                facecolor=body, edgecolor="#0B0F19", linewidth=1.6, zorder=3))
    for wx, wy, ww, wh in win:
        ax.add_patch(FancyBboxPatch((wx, wy), ww, wh, boxstyle="round,pad=0.01,rounding_size=0.05",
                                    facecolor="#BFD7EA", edgecolor="#0B0F19", linewidth=1.0, zorder=4))
    if stripe:
        ax.add_patch(FancyBboxPatch((x + 0.25, y + 0.42), L - 0.5, 0.07, boxstyle="square,pad=0",
                                    facecolor=stripe, edgecolor="none", zorder=4))
    if roof:
        top = y + (1.55 if van else 1.22)
        ax.add_patch(FancyBboxPatch((x + 1.25, top), 0.7, 0.2, boxstyle="round,pad=0.01,rounding_size=0.05",
                                    facecolor=roof, edgecolor="#0B0F19", linewidth=1.0, zorder=4))
    if decal:
        ax.text(x + L / 2, y + 0.47, decal, ha="center", va="center", fontsize=8.5,
                fontweight="bold", color="#FFFFFF", zorder=5)
    for wx in (x + 0.72, x + L - 0.72):
        ax.add_patch(Circle((wx, y + 0.2), 0.27, facecolor="#111827", edgecolor="#0B0F19", zorder=5))
        ax.add_patch(Circle((wx, y + 0.2), 0.11, facecolor="#9CA3AF", zorder=6))


def diagram_taxi_types(path):
    W, H = 11.0, 9.0
    fig, ax = new_canvas(W, H)

    title = "Four kinds of Seoul taxi"
    ax.text(W / 2, H - 0.30, title, ha="center", va="top",
            fontsize=F_TITLE, fontweight="bold", color=INK)
    ax.text(W / 2, H - 0.95, "The color and shape tell you the price tier before you get in.",
            ha="center", va="top", fontsize=F_BODY, color=MUTED)

    types = [
        dict(name="Standard", body=TAXI_ORANGE, kw=dict(roof="#F3F4F6"),
             l1="Orange, silver or white sedan", l2="Base fare · night surcharge", l3="Street, taxi stands, apps"),
        dict(name="Deluxe (Mobeom)", body=DELUXE, kw=dict(roof=ROOF_YELLOW, stripe="#C9A227"),
             l1="Black sedan, yellow roof cap", l2="About 40% higher base fare", l3="Hotels, hubs, reservation"),
        dict(name="Jumbo / Van", body=VAN, kw=dict(van=True),
             l1="Large van (Staria, Carnival)", l2="Dynamic pricing by demand", l3="App dispatch only"),
        dict(name="International", body="#111827", kw=dict(decal="INTERNATIONAL"),
             l1="Orange or black, door decal", l2="Flat airport rates", l3="Airport desks, advance booking"),
    ]
    pw, ph = 5.0, 3.55
    gx, gy = 0.35, 0.28
    x0 = (W - (pw * 2 + gx)) / 2
    y_top = H - 1.5
    for i, t in enumerate(types):
        cx = x0 + (i % 2) * (pw + gx)
        cy = y_top - (i // 2) * (ph + gy) - ph
        ax.add_patch(FancyBboxPatch(
            (cx, cy), pw, ph, boxstyle="round,pad=0.02,rounding_size=0.08",
            linewidth=2.0, edgecolor="#CBD5E1", facecolor="#FFFFFF", zorder=1,
        ))
        car(ax, cx + (pw - 3.2) / 2, cy + 1.62, t["body"], **t["kw"])
        inner = pw - 0.4
        check_fits(t["name"], F_BOX_TITLE, inner, t["name"], bold=True)
        for k in ("l1", "l2", "l3"):
            check_fits(t[k], F_SMALL, inner, f'{t["name"]} {k}')
        ax.text(cx + pw / 2, cy + 1.40, t["name"], ha="center", va="top", fontsize=F_BOX_TITLE,
                fontweight="bold", color=INK)
        ax.text(cx + pw / 2, cy + 0.92, t["l1"], ha="center", va="top", fontsize=F_SMALL, color=INK_SOFT)
        ax.text(cx + pw / 2, cy + 0.60, t["l2"], ha="center", va="top", fontsize=F_SMALL, color=INK_SOFT)
        ax.text(cx + pw / 2, cy + 0.28, t["l3"], ha="center", va="top", fontsize=F_SMALL, color=MUTED)

    fig.savefig(path, dpi=DPI)
    plt.close(fig)


# ── 3) 표지 — 빛나는 '빈차' 하나 ─────────────────────────────────
def cover(path):
    """3:2. 밤 앞유리 느낌의 짙은 바탕에 빨간 '빈차'만 크게 — 카드에서 한눈에 읽힌다."""
    W, H = 9.0, 6.0
    fig, ax = new_canvas(W, H, bg="#0F172A")
    # 앞유리에 비친 도시 불빛 — 흐린 원 몇 개
    for (x, y, r, c, a) in [(1.4, 4.7, 0.9, "#F59E0B", 0.10), (7.6, 5.0, 1.1, "#3B82F6", 0.10),
                            (6.8, 1.2, 0.8, "#F59E0B", 0.08), (2.2, 1.0, 1.2, "#EF4444", 0.06)]:
        ax.add_patch(Circle((x, y), r, facecolor=c, alpha=a, edgecolor="none", zorder=0))
    ax.add_patch(FancyBboxPatch(
        (W / 2 - 2.4, H / 2 - 1.15), 4.8, 2.3,
        boxstyle="round,pad=0.02,rounding_size=0.18",
        linewidth=3, edgecolor="#020617", facecolor="#0B1120", zorder=2,
    ))
    ax.text(W / 2, H / 2 - 0.05, "빈차", ha="center", va="center", fontsize=96,
            fontfamily=KO, fontweight="bold", color=RED, zorder=3, path_effects=glow(RED))
    # 표지는 1350px 이면 충분하다. facecolor 를 명시하지 않으면 rcParams 의
    # savefig.facecolor(밝은 BG)가 이겨서 밤 배경이 사라진다 — 실제로 그렇게 나왔다.
    fig.savefig(path, dpi=DPI // 2, facecolor=fig.get_facecolor())
    plt.close(fig)


def main():
    POSTS.mkdir(parents=True, exist_ok=True)
    ARTICLES.mkdir(parents=True, exist_ok=True)
    diagram_sign_states(POSTS / "taxi-roof-sign-states.png")
    diagram_taxi_types(POSTS / "taxi-types-by-color.png")
    tmp = ARTICLES / "_korea-taxi-cover.png"
    cover(tmp)
    # 표지는 사진 표지들과 같게 jpg 로
    from PIL import Image
    Image.open(tmp).convert("RGB").save(ARTICLES / "korea-taxi-survival-guide.jpg", quality=88, optimize=True, progressive=True)
    tmp.unlink()
    for p in (POSTS / "taxi-roof-sign-states.png", POSTS / "taxi-types-by-color.png",
              ARTICLES / "korea-taxi-survival-guide.jpg"):
        from PIL import Image as I
        w, h = I.open(p).size
        print(f"  {p}  {w}x{h}  {p.stat().st_size / 1024:,.0f} KB")


if __name__ == "__main__":
    main()
