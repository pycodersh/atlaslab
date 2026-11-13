/**
 * K-Pantry PWA 아이콘 4종 생성 — public/icons/kpantry/
 * 그림은 홈 'Our Apps' 카드의 K-Pantry 아이콘(app/page.tsx APP_ICONS, 밥그릇 + 김)과 같다. 바탕은 브랜드 레드.
 *   icon-*.png          둥근 사각 타일(바깥 투명) — purpose: any
 *   icon-maskable-*.png 꽉 찬 바탕, 그림은 가운데 안전 영역(지름 80%) 안 — purpose: maskable
 * 실행: node scripts/make-kpantry-icons.mjs
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const OUT = 'public/icons/kpantry'
const RED = '#C8102E'
const GLYPH = `
  <path d="M4 12h16c0 4.42-3.58 8-8 8s-8-3.58-8-8z"/>
  <line x1="3" y1="12" x2="21" y2="12"/>
  <path d="M9 11V8M12 11V7M15 11V8"/>`

/** 24×24 그림을 size 캔버스 가운데에 — 그림의 실제 높이는 y 7~20 이라 1.5 단위 올려 시각 중심을 맞춘다 */
function svg(size, { maskable }) {
  const glyph = size * (maskable ? 0.6 : 0.66)
  const off = (size - glyph) / 2
  const s = glyph / 24
  const bg = maskable
    ? `<rect width="${size}" height="${size}" fill="${RED}"/>`
    : `<rect x="${size * 0.04}" y="${size * 0.04}" width="${size * 0.92}" height="${size * 0.92}" rx="${size * 0.22}" fill="${RED}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${bg}
    <g transform="translate(${off} ${off - glyph * 1.5 / 24}) scale(${s})" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${GLYPH}</g>
  </svg>`
}

mkdirSync(OUT, { recursive: true })
for (const size of [192, 512]) {
  await sharp(Buffer.from(svg(size, { maskable: false }))).png().toFile(`${OUT}/icon-${size}.png`)
  await sharp(Buffer.from(svg(size, { maskable: true }))).png().toFile(`${OUT}/icon-maskable-${size}.png`)
}
console.log('done:', OUT)
