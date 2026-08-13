/**
 * capture-cards.ts
 * kpatto-carousel.html의 [data-card] 요소 18장을 1080×1080 PNG로 캡처.
 *
 * 실행: npx tsx scripts/carousel/capture-cards.ts
 *
 * 출력: carousel-out/{data-card}.png
 * 전제: Playwright Chromium 설치 완료 (npx playwright install chromium)
 */
import { chromium } from 'playwright'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const HTML_PATH = path.resolve(__dirname, 'kpatto-carousel.html')
const OUT_DIR   = path.resolve(__dirname, '..', '..', 'carousel-out')

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    // 뷰포트는 넉넉하게 — 카드 자체가 1080×1080이므로 element.screenshot()으로 정확히 자름
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  // 로컬 파일 열기
  await page.goto(`file://${HTML_PATH.replace(/\\/g, '/')}`)

  // 웹폰트 완전 로드 대기
  await page.waitForFunction(() => document.fonts.ready.then(() => true), undefined, { timeout: 30_000 })

  // 추가 안정화: 폰트 로드 후 200ms 여유
  await page.waitForTimeout(200)

  // 모든 [data-card] 수집
  const cards = await page.locator('[data-card]').all()
  console.log(`캡처 대상: ${cards.length}장\n`)

  const results: { slug: string; ok: boolean; size?: { w: number; h: number }; err?: string }[] = []

  for (const card of cards) {
    const slug = await card.getAttribute('data-card')
    if (!slug) continue

    const outPath = path.join(OUT_DIR, `${slug}.png`)

    try {
      // 요소 기준 스크린샷 (요소 크기 그대로 — CSS 1080×1080)
      await card.screenshot({
        path: outPath,
        type: 'png',
        omitBackground: false,
      })

      // 실제 크기 검증 (sizeOf 없이 PNG 헤더에서 직접 읽기)
      const buf = fs.readFileSync(outPath)
      const w = buf.readUInt32BE(16)
      const h = buf.readUInt32BE(20)

      results.push({ slug, ok: true, size: { w, h } })
      const sizeOk = w === 1080 && h === 1080
      console.log(`  ${sizeOk ? '✅' : '⚠️ '} ${slug}.png  ${w}×${h}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      results.push({ slug, ok: false, err: msg })
      console.log(`  ❌ ${slug}  ${msg}`)
    }
  }

  await browser.close()

  // ── 최종 보고 ─────────────────────────────────────────────────────────────
  const ok    = results.filter(r => r.ok)
  const fail  = results.filter(r => !r.ok)
  const wrong = ok.filter(r => r.size?.w !== 1080 || r.size?.h !== 1080)

  console.log('\n──────────────────────────────────────')
  console.log(`생성 완료: ${ok.length}장 / 전체 ${results.length}장`)
  if (fail.length)  console.log(`실패: ${fail.map(r => r.slug).join(', ')}`)
  if (wrong.length) console.log(`크기 불일치: ${wrong.map(r => `${r.slug} ${r.size?.w}×${r.size?.h}`).join(', ')}`)
  if (!fail.length && !wrong.length) console.log('✅ 전체 1080×1080, 오류 없음')
  console.log(`출력 폴더: ${OUT_DIR}`)
}

main().catch(e => { console.error(e); process.exit(1) })
