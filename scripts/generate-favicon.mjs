/**
 * Atlas Lab 파비콘 생성 — public/favicon.ico, favicon.png(32), apple-touch-icon.png(180)
 *
 * 원본은 네비 로고(public/atlaslab_nav_logo.png) 하나뿐이다. 그 안에서 AL 모노그램만
 * 잘라 쓴다(아래 ATLASLAB 워드마크는 16px 에서 뭉개져 읽히지 않는다).
 *   - 모노그램 bbox: x 32..125, y 5..86  (워드마크는 y 100 부터라 사이가 비어 있다)
 *   - 로고는 흰색 + 투명 배경이라 알파 채널을 그대로 마스크로 쓴다.
 *
 * 작은 크기에서 세리프 헤어라인이 사라지므로, 마스크를 크게 키운 뒤 살짝 두껍게
 * 만들고(blur + threshold) 내려서 16px 에서도 획이 남게 한다.
 *
 * 실행: node scripts/generate-favicon.mjs
 *       (sharp 는 이미 의존성에 있다)
 */
import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

const SRC = 'public/atlaslab_nav_logo.png'
const OUT = 'public'

/** 시그니처 딥 버건디 — globals.css 의 --brand-red-dark 와 같은 값 */
const BG = { r: 0xA3, g: 0x0D, b: 0x25, alpha: 1 }

/** 로고 안에서 AL 모노그램만 (워드마크 제외) */
const MARK = { left: 32, top: 5, width: 94, height: 82 }

/** 작업 해상도 — 여기서 두껍게 만든 뒤 각 크기로 줄인다 */
const WORK = 1024

/**
 * 흰 모노그램을 버건디 정사각형 위에 올린 PNG 버퍼.
 * @param size    출력 한 변(px)
 * @param margin  정사각형 대비 여백 비율 (0.08 = 8%)
 * @param bold    획 두껍게 하는 정도(px, 작업 해상도 기준). 0 이면 그대로.
 */
async function icon(size, margin, bold) {
  // 1) 모노그램 알파를 흑백 마스크로 (흰 글자 = 흰 마스크)
  let mask = sharp(SRC)
    .extract(MARK)
    .ensureAlpha()
    .extractChannel('alpha')
    .resize({
      width: Math.round(WORK * (MARK.width / MARK.height)),
      height: WORK,
      kernel: 'lanczos3',
      fit: 'fill',
    })

  // 2) 살짝 번지게 한 뒤 낮은 값에서 자르면 획이 사방으로 굵어진다
  if (bold > 0) {
    mask = sharp(await mask.blur(bold).toBuffer()).threshold(70)
  }

  const maskBuf = await mask.png().toBuffer()
  const m = await sharp(maskBuf).metadata()

  // 3) 여백을 뺀 안쪽에 비율을 지켜 채운다
  const inner = Math.round(size * (1 - margin * 2))
  const scale = Math.min(inner / m.width, inner / m.height)
  const w = Math.max(1, Math.round(m.width * scale))
  const h = Math.max(1, Math.round(m.height * scale))

  const scaled = await sharp(maskBuf)
    .resize(w, h, { kernel: 'lanczos3', fit: 'fill' })
    .toBuffer()

  // 4) 마스크를 흰색의 알파로 써서 버건디 위에 합성
  const white = await sharp({
    create: { width: w, height: h, channels: 3, background: '#FFFFFF' },
  })
    .joinChannel(scaled)
    .png()
    .toBuffer()

  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: white, left: Math.round((size - w) / 2), top: Math.round((size - h) / 2) }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/** PNG 를 그대로 담는 ICO (모든 최신 브라우저가 읽는다) */
function ico(pngs) {
  const head = Buffer.alloc(6)
  head.writeUInt16LE(0, 0)          // reserved
  head.writeUInt16LE(1, 2)          // type: icon
  head.writeUInt16LE(pngs.length, 4)

  const dir = []
  let offset = 6 + pngs.length * 16
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)  // width  (0 = 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1)  // height
    e.writeUInt8(0, 2)                       // palette
    e.writeUInt8(0, 3)                       // reserved
    e.writeUInt16LE(1, 4)                    // color planes
    e.writeUInt16LE(32, 6)                   // bits per pixel
    e.writeUInt32LE(buf.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += buf.length
    dir.push(e)
  }
  return Buffer.concat([head, ...dir, ...pngs.map(p => p.buf)])
}

async function main() {
  // 작은 크기일수록 획을 두껍게, 여백은 좁게 — 16px 에서 형태가 남아야 한다
  const png16 = await icon(16, 0.06, 26)
  const png32 = await icon(32, 0.07, 18)
  const png48 = await icon(48, 0.08, 12)
  const png180 = await icon(180, 0.14, 0)   // iOS 가 모서리를 깎으므로 여백을 더 준다

  fs.writeFileSync(path.join(OUT, 'favicon.png'), png32)
  fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), png180)
  fs.writeFileSync(
    path.join(OUT, 'favicon.ico'),
    ico([{ size: 16, buf: png16 }, { size: 32, buf: png32 }, { size: 48, buf: png48 }]),
  )

  for (const f of ['favicon.ico', 'favicon.png', 'apple-touch-icon.png']) {
    console.log(`  ${f}  ${fs.statSync(path.join(OUT, f)).size} bytes`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
