#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
단어 플래시카드 쇼츠 영상 생성 (9:16, 1080x1920)

JSON 명세를 읽어 카드 10장을 PNG로 렌더링하고, 항목당 3초씩 이어 붙여
오디오 트랙과 합쳐 mp4로 낸다.

중앙 이미지는 items[].image 파일을 4:5 프레임에 넣는다. 파일이 없으면
플레이스홀더 프레임(파일명 표시)으로 렌더링해 파이프라인은 그대로 완성된다.
나중에 PNG를 images/ 에 넣고 다시 돌리면 최종본이 나온다.

필요: python 3.10+, Pillow, ffmpeg(PATH)

사용:
  python scripts/make_flashcard_video.py --spec data/cvs10.json --audio out/audio/10-convenience-store.mp3
  python scripts/make_flashcard_video.py --spec data/cvs10.json --cards-only
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    except Exception:
        pass

W, H = 1080, 1920
FONT_BOLD = r"C:\Windows\Fonts\malgunbd.ttf"
FONT_REG = r"C:\Windows\Fonts\malgun.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def text_w(d: ImageDraw.ImageDraw, s: str, f: ImageFont.FreeTypeFont) -> int:
    return int(d.textlength(s, font=f))


def fit_font(d: ImageDraw.ImageDraw, s: str, path: str, start: int, max_w: int) -> ImageFont.FreeTypeFont:
    """최대 폭에 맞을 때까지 폰트 크기를 줄인다."""
    size = start
    while size > 20:
        f = font(path, size)
        if text_w(d, s, f) <= max_w:
            return f
        size -= 4
    return font(path, 20)


def render_card(item: dict, theme: dict, header: str, category: str, footer: str,
                images_dir: Path, dst: Path) -> bool:
    bg = theme.get("backgroundColor", "#F4F4F6")
    fg = theme.get("textColor", "#111111")
    accent = theme.get("accentColor", "#C8102E")

    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)

    margin = 90
    inner_w = W - margin * 2

    # ── 상단 헤더 ────────────────────────────────────────────────────────────
    f_header = font(FONT_REG, 40)
    d.text((W // 2, 120), header, font=f_header, fill=fg, anchor="mm")

    # ── 카테고리 · 인덱스 ────────────────────────────────────────────────────
    f_cat = font(FONT_BOLD, 44)
    cat_line = f"{category}  ·  {item['index']}"
    d.text((W // 2, 200), cat_line, font=f_cat, fill=accent, anchor="mm")

    # ── 중앙 이미지 프레임 (4:5) ─────────────────────────────────────────────
    frame_w = inner_w
    frame_h = int(frame_w * 5 / 4)
    fx, fy = margin, 300
    d.rounded_rectangle([fx, fy, fx + frame_w, fy + frame_h], radius=36,
                        fill="#FFFFFF", outline="#E2E2E6", width=3)

    src = images_dir / item["image"]
    has_image = src.exists()
    if has_image:
        with Image.open(src) as im:
            im = im.convert("RGB")
            # 프레임을 채우고 넘치는 부분은 잘라낸다 (cover)
            scale = max(frame_w / im.width, frame_h / im.height)
            nw, nh = int(im.width * scale), int(im.height * scale)
            im = im.resize((nw, nh), Image.LANCZOS)
            left, top = (nw - frame_w) // 2, (nh - frame_h) // 2
            im = im.crop((left, top, left + frame_w, top + frame_h))
            mask = Image.new("L", (frame_w, frame_h), 0)
            ImageDraw.Draw(mask).rounded_rectangle([0, 0, frame_w, frame_h], radius=36, fill=255)
            img.paste(im, (fx, fy), mask)
    else:
        f_ph = font(FONT_REG, 38)
        d.text((fx + frame_w // 2, fy + frame_h // 2 - 30), "이미지 없음",
               font=font(FONT_BOLD, 48), fill="#B9B9C0", anchor="mm")
        d.text((fx + frame_w // 2, fy + frame_h // 2 + 40), item["image"],
               font=f_ph, fill="#C9C9D0", anchor="mm")

    # ── 한국어 단어 (크게, 굵게) ─────────────────────────────────────────────
    ko_y = fy + frame_h + 150
    f_ko = fit_font(d, item["korean"], FONT_BOLD, 150, inner_w)
    d.text((W // 2, ko_y), item["korean"], font=f_ko, fill=fg, anchor="mm")

    # ── 로마자 · 영어 뜻 ─────────────────────────────────────────────────────
    sub = f"[{item['romanization']}]  ·  {item['english']}"
    f_sub = fit_font(d, sub, FONT_REG, 52, inner_w)
    d.text((W // 2, ko_y + 130), sub, font=f_sub, fill="#5A5A63", anchor="mm")

    # ── 푸터 ─────────────────────────────────────────────────────────────────
    d.text((W // 2, H - 90), footer, font=font(FONT_REG, 36), fill="#8A8A93", anchor="mm")

    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst)
    return has_image


def main() -> None:
    ap = argparse.ArgumentParser(description="단어 플래시카드 쇼츠 영상 생성")
    ap.add_argument("--spec", required=True, help="항목 JSON 경로")
    ap.add_argument("--audio", default="", help="오디오 mp3 (없으면 무음 영상)")
    ap.add_argument("--images", default="", help="이미지 폴더 (기본: <spec 폴더>/images)")
    ap.add_argument("--out", default="out/video", help="출력 폴더")
    ap.add_argument("--header", default="Let's learn Korean")
    ap.add_argument("--category", default="CONVENIENCE STORE")
    ap.add_argument("--footer", default="www.atlaslabstudios.com")
    ap.add_argument("--cards-only", action="store_true", help="카드 PNG만 만들고 종료")
    args = ap.parse_args()

    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg 을 PATH에서 찾을 수 없습니다.")

    spec_path = Path(args.spec)
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    items = spec["items"]
    per = float(spec.get("durationPerItemSec", 3.0))
    fps = int(spec.get("fps", 30))
    theme = spec.get("layout", {}).get("theme", {})

    images_dir = Path(args.images) if args.images else spec_path.parent / "images"
    out_dir = Path(args.out)
    cards_dir = out_dir / "cards"
    cards_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n=== 플래시카드 영상 생성 ===")
    print(f"명세: {spec_path}  |  항목 {len(items)}개 × {per}초 = {per*len(items):.1f}초")
    print(f"해상도: {W}x{H} ({spec.get('layout',{}).get('aspectRatio','9:16')})  |  {fps}fps")
    print(f"이미지 폴더: {images_dir}\n")

    missing: list[str] = []
    for i, it in enumerate(items, start=1):
        dst = cards_dir / f"card_{i:02d}.png"
        ok = render_card(it, theme, args.header, args.category, args.footer, images_dir, dst)
        if not ok:
            missing.append(it["image"])
        print(f"  [{it['index']}] {it['korean']:<6} {it['english']:<20} "
              f"{'이미지 O' if ok else '이미지 X (플레이스홀더)'}  → {dst.name}")

    if missing:
        print(f"\n⚠️ 이미지 {len(missing)}개 없음 — 플레이스홀더로 렌더링했습니다:")
        for m in missing:
            print(f"    {images_dir / m}")

    if args.cards_only:
        print(f"\n--cards-only: 카드 {len(items)}장만 만들고 종료")
        return

    # ── 영상 조립 ────────────────────────────────────────────────────────────
    tmp = out_dir / ".tmp"
    tmp.mkdir(exist_ok=True)
    listfile = tmp / "cards.txt"
    with open(listfile, "w", encoding="utf-8") as f:
        for i in range(1, len(items) + 1):
            p = (cards_dir / f"card_{i:02d}.png").resolve().as_posix()
            f.write(f"file '{p}'\nduration {per}\n")
        # concat demuxer 는 마지막 항목을 한 번 더 적어야 길이가 맞는다
        f.write(f"file '{(cards_dir / f'card_{len(items):02d}.png').resolve().as_posix()}'\n")

    final = out_dir / f"{spec_path.stem}.mp4"
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(listfile)]
    if args.audio and Path(args.audio).exists():
        cmd += ["-i", str(args.audio)]
    cmd += ["-vf", f"fps={fps},format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "20"]
    if args.audio and Path(args.audio).exists():
        cmd += ["-c:a", "aac", "-b:a", "192k", "-shortest"]
    cmd += ["-t", f"{per*len(items)}", str(final)]
    subprocess.run(cmd, check=True)

    for p in tmp.glob("*"):
        p.unlink()
    tmp.rmdir()

    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration,size",
         "-show_entries", "stream=codec_type,width,height,r_frame_rate",
         "-of", "default=noprint_wrappers=1", str(final)],
        capture_output=True, text=True, check=True).stdout

    print(f"\n{'=' * 60}")
    print(f"최종: {final}")
    print(probe.strip())
    if missing:
        print(f"\n※ 이미지 {len(missing)}개가 플레이스홀더입니다. "
              f"{images_dir} 에 넣고 다시 실행하면 최종본이 나옵니다.")


if __name__ == "__main__":
    main()
