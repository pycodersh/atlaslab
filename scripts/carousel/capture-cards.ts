/**
 * K-PATTO 캐러셀 카드 PNG 캡처
 *
 * 실행: npx tsx scripts/carousel/capture-cards.ts [--from N] [--to M]
 *   기본값: --from 1 --to 5 (5세트 30장)
 *   출력: scripts/carousel/captures/<slug>-<1~6>.png  (1080×1080)
 *
 * 순서:
 *   1. kpatto-carousel.html을 Puppeteer로 열기
 *   2. 배경 이미지 + 폰트 로딩 완료 대기
 *   3. .card[data-card] 요소마다 개별 screenshot → PNG
 */

import * as path from 'path'
import * as fs   from 'fs'
import puppeteer from 'puppeteer'

// ── 인자 파싱 ──────────────────────────────────────────────────────────────────
function parseArgs(): { from: number; to: number } {
  const argv = process.argv.slice(2)
  const get  = (flag: string) => {
    const i = argv.indexOf(flag)
    return i >= 0 ? parseInt(argv[i + 1], 10) : NaN
  }
  const from = get('--from')
  const to   = get('--to')
  if (isNaN(from) || isNaN(to) || from < 1 || to < from) {
    // 기본값 허용
    return { from: isNaN(from) ? 1 : from, to: isNaN(to) ? 5 : to }
  }
  return { from, to }
}

// ── 메인 ──────────────────────────────────────────────────────────────────────
async function main() {
  const { from, to } = parseArgs()
  const CAROUSEL_HTML = path.resolve(process.cwd(), 'scripts/carousel/kpatto-carousel.html')
  const OUT_DIR       = path.resolve(process.cwd(), 'scripts/carousel/captures')

  if (!fs.existsSync(CAROUSEL_HTML)) {
    console.error(`HTML 없음: ${CAROUSEL_HTML}`)
    console.error('먼저 generate-carousel.ts를 실행하세요.')
    process.exit(1)
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })

  console.log(`K-PATTO 캡처: 세트 ${from}~${to}`)
  console.log(`HTML: ${CAROUSEL_HTML}`)
  console.log(`출력: ${OUT_DIR}\n`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
  })

  try {
    const page = await browser.newPage()

    // 1080×1080 카드가 여러 개 가로로 나열되므로 뷰포트를 충분히 넓게
    await page.setViewport({ width: 7200, height: 2000, deviceScaleFactor: 1 })

    // file:// URL로 로드
    const fileUrl = 'file:///' + CAROUSEL_HTML.replace(/\\/g, '/')
    console.log(`페이지 로드: ${fileUrl}`)
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 })

    // ── 배경 이미지 로딩 완료 대기 ──────────────────────────────────────────
    console.log('배경 이미지 + 폰트 로딩 대기...')
    await page.evaluate(async () => {
      // 폰트 로딩
      if (document.fonts?.ready) await document.fonts.ready

      // 배경 이미지: naturalWidth로 확인
      await Promise.all(
        Array.from(document.querySelectorAll<HTMLElement>('.card')).map(card => {
          const style = getComputedStyle(card)
          const match = style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)
          if (!match) return Promise.resolve()
          const src = match[1]
          return new Promise<void>(resolve => {
            const img = new Image()
            img.onload  = () => resolve()
            img.onerror = () => resolve() // 실패해도 계속
            img.src = src
          })
        })
      )

      // JS 폰트 피팅 함수 재실행 (폰트 로드 후 크기가 바뀔 수 있음)
      if (typeof (window as any).fitOneLine === 'function') (window as any).fitOneLine()
      if (typeof (window as any).fitHook    === 'function') (window as any).fitHook()

      // 추가 안정화 대기
      await new Promise(r => setTimeout(r, 800))
    })
    console.log('로딩 완료\n')

    // ── 카드 목록 수집 ──────────────────────────────────────────────────────
    const cardIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('.card[data-card]'))
           .map(el => el.dataset.card!)
    )

    console.log(`발견된 카드: ${cardIds.length}장`)

    // HTML에 포함된 카드를 전부 캡처 (generate-carousel --from/--to와 동일 범위)
    const targetCards = cardIds
    console.log(`캡처 대상: ${targetCards.length}장\n`)

    // ── 카드별 캡처 ──────────────────────────────────────────────────────────
    let count = 0
    for (const cardId of targetCards) {
      const el = await page.$(`[data-card="${cardId}"]`)
      if (!el) {
        console.warn(`  SKIP (element not found): ${cardId}`)
        continue
      }

      const outPath = path.join(OUT_DIR, `${cardId}.png`)
      await el.screenshot({ path: outPath, type: 'png' })

      const sizeKB = Math.round(fs.statSync(outPath).size / 1024)
      console.log(`  ✓ ${cardId}.png  (${sizeKB} KB)`)
      count++
    }

    console.log(`\n── 완료 ──────────────────────────────────────────`)
    console.log(`캡처: ${count}장`)
    console.log(`출력: ${OUT_DIR}`)

  } finally {
    await browser.close()
  }
}

main().catch(e => { console.error('\n[오류]', e); process.exit(1) })
