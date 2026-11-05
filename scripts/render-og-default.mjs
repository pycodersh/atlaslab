/**
 * 사이트 기본 공유 이미지(public/og-default.png, 1200×630)를 만든다.
 * 표지(썸네일)가 없는 페이지 · 홈 · 목록이 이 이미지를 og:image / twitter:image 로 쓴다(lib/seo/site.ts).
 * 글자는 SVG 로 그려 sharp 로 PNG 로 굽는다 — 다시 만들 때: node scripts/render-og-default.mjs
 */
import sharp from 'sharp'
import path from 'node:path'

const W = 1200
const H = 630
const root = process.cwd()
const out = path.join(root, 'public', 'og-default.png')

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#111111"/>
  <rect x="0" y="0" width="${W}" height="10" fill="#C8102E"/>
  <rect x="80" y="236" width="56" height="3" fill="#C8102E"/>
  <text x="80" y="210" font-family="Georgia, 'Times New Roman', serif" font-size="30" letter-spacing="6" fill="#B8B4AE">${esc('ATLAS LAB · K-PATTO')}</text>
  <text x="80" y="320" font-family="Georgia, 'Times New Roman', serif" font-size="66" font-weight="700" fill="#FFFFFF">${esc('Speak, travel and live')}</text>
  <text x="80" y="400" font-family="Georgia, 'Times New Roman', serif" font-size="66" font-weight="700" fill="#FFFFFF">${esc('like a local in Korea')}</text>
  <text x="80" y="470" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#D6D2CC">${esc('Real-life Korean phrases · Korean basics · Korea travel guides')}</text>
  <text x="80" y="560" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#8C8780">atlaslabstudios.com</text>
</svg>`

const logo = await sharp(path.join(root, 'public', 'atlaslab_nav_logo.png')).resize({ height: 96 }).toBuffer()
await sharp(Buffer.from(svg))
  .composite([{ input: logo, top: 470, left: W - 80 - 123 }])
  .png({ compressionLevel: 9 })
  .toFile(out)
console.log('wrote', path.relative(root, out))
