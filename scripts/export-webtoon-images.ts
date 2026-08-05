/**
 * export-webtoon-images.ts — Webtoon canvas image bake script
 *
 * Usage:
 *   npx playwright install chromium   (once)
 *   npx tsx scripts/export-webtoon-images.ts --ep 1
 *
 * Requirements:
 *   - Dev server running on http://localhost:3001
 *   - sharp and playwright installed (npm install --save-dev playwright sharp)
 *
 * Outputs to: data/kpatto/exports/webtoon/ep{NNN}/
 *   _full.png      Full-page screenshot (not uploaded)
 *   001.png, 002.png, ...  Canvas slices
 *   meta.json      Slice metadata
 */

import { chromium } from 'playwright'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

// ── Config ───────────────────────────────────────────────────────────────────
const DEV_SERVER = 'http://localhost:3001'
const VIEWPORT_W = 430      // CSS px — matches app max-width
const DPR        = 3        // device pixel ratio → capture width = 430 × 3 = 1290 px
const OUTPUT_W   = 800      // output image width after resize
const MAX_H_OUT  = 1280     // max slice height in output px (canvas limit)
const MIN_LAST_H = 200      // if final slice < this, merge with previous
const MAX_TOTAL_H = 16_000  // warning threshold (output px)
const MAX_SLICES  = 100     // hard limit

// ── CLI args ─────────────────────────────────────────────────────────────────
const epArg = process.argv.indexOf('--ep')
if (epArg === -1 || !process.argv[epArg + 1]) {
  console.error('Usage: npx tsx scripts/export-webtoon-images.ts --ep <number>')
  process.exit(1)
}
const EP_NUM  = parseInt(process.argv[epArg + 1])
const EP_ID   = `kp-ep-${String(EP_NUM).padStart(3, '0')}`
const EPISODE_URL = `${DEV_SERVER}/kpatto/story/${EP_ID}/export`
const EPISODE_PAD = String(EP_NUM).padStart(3, '0')
const OUT_DIR = path.resolve(`data/kpatto/exports/webtoon/ep${EPISODE_PAD}`)

// ── Scale: CSS px → output px ────────────────────────────────────────────────
const CSS_TO_OUT = OUTPUT_W / VIEWPORT_W   // 800 / 430 ≈ 1.860

// Max slice height in CSS px
const MAX_H_CSS = MAX_H_OUT / CSS_TO_OUT   // ≈ 688 CSS px

// ── Helpers ───────────────────────────────────────────────────────────────────
function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nExporting EP${String(EP_NUM).padStart(2, '0')} → ${OUT_DIR}`)
  ensureDir(OUT_DIR)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_W, height: 900 },
    deviceScaleFactor: DPR,
  })
  const page = await context.newPage()

  // ── 1. Navigate and wait for full render ─────────────────────────────────
  console.log(`  → ${EPISODE_URL}`)
  await page.goto(EPISODE_URL, { waitUntil: 'networkidle', timeout: 60_000 })

  // Wait for fonts
  await page.evaluate(() => document.fonts.ready)

  // Wait for all images to load
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'))
    await Promise.all(
      imgs.map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>(res => {
              img.addEventListener('load',  () => res(), { once: true })
              img.addEventListener('error', () => res(), { once: true })
            }),
      ),
    )
  })

  // Inject: disable animations + hide tab bar
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        animation-delay: 0s !important;
      }
    `,
  })

  // Brief pause to let any repaints settle
  await page.waitForTimeout(400)

  // ── 2. Check source image resolutions ────────────────────────────────────
  // Target capture px per panel: 430 × 0.73 × DPR ≈ 942 device px for vertical cuts
  const MIN_NATURAL_PX = Math.round(VIEWPORT_W * 0.73 * DPR)
  const smallImages = await page.evaluate((min) => {
    return Array.from(document.querySelectorAll('img[src]')).flatMap(img => {
      if (img.naturalWidth > 0 && img.naturalWidth < min) {
        return [{ src: (img as HTMLImageElement).src.split('/').pop(), w: img.naturalWidth }]
      }
      return []
    })
  }, MIN_NATURAL_PX)

  if (smallImages.length > 0) {
    console.warn(`  ⚠ Low-res source images (< ${MIN_NATURAL_PX} px wide):`)
    smallImages.forEach(img => console.warn(`    ${img.src} → ${img.w}px`))
  } else {
    console.log(`  ✓ All images ≥ ${MIN_NATURAL_PX}px`)
  }

  // ── 3. Collect gap and bubble bounding rects ──────────────────────────────
  type Rect = { top: number; bottom: number; height: number }

  const gapRects: (Rect & { ratio: number; fixed: number | null })[] = await page.evaluate(() => {
    const gaps = document.querySelectorAll('[data-gap="true"]')
    const scrollY = window.scrollY
    return Array.from(gaps).map(el => {
      const r = el.getBoundingClientRect()
      return {
        top:    r.top    + scrollY,
        bottom: r.bottom + scrollY,
        height: r.height,
        ratio:  parseFloat((el as HTMLElement).dataset.gapRatio ?? '0'),
        fixed:  (el as HTMLElement).dataset.gapFixed ? parseFloat((el as HTMLElement).dataset.gapFixed!) : null,
      }
    })
  })

  const bubbleRects: Rect[] = await page.evaluate(() => {
    const bubbles = document.querySelectorAll('[data-bubble="true"]')
    const scrollY = window.scrollY
    return Array.from(bubbles).map(el => {
      const r = el.getBoundingClientRect()
      // Add vertical padding so we don't cut too close to a bubble edge
      return {
        top:    r.top    + scrollY - 10,
        bottom: r.bottom + scrollY + 10,
        height: r.height + 20,
      }
    })
  })

  const totalHeightCss: number = await page.evaluate(() => document.body.scrollHeight)
  const totalHeightOut = Math.round(totalHeightCss * CSS_TO_OUT)
  console.log(`  Total height: ${totalHeightCss} CSS px → ${totalHeightOut} output px`)

  if (totalHeightOut > MAX_TOTAL_H) {
    console.warn(`  ⚠ Total height ${totalHeightOut}px exceeds ${MAX_TOTAL_H}px`)
  }

  // ── 4. Build cut-point candidates (CSS px) ────────────────────────────────
  //
  // For each gap, find the sub-range that doesn't overlap any bubble.
  // Use the midpoint of that safe zone as the cut candidate.

  const cutCandidatesCss: number[] = []

  for (const gap of gapRects) {
    // Collect all bubble overlaps with this gap
    const overlaps = bubbleRects
      .filter(b => b.bottom > gap.top && b.top < gap.bottom)
      .map(b => ({ lo: Math.max(b.top, gap.top), hi: Math.min(b.bottom, gap.bottom) }))
      .sort((a, b) => a.lo - b.lo)

    // Compute safe sub-ranges
    let cursor = gap.top
    const safeRanges: { lo: number; hi: number }[] = []

    for (const ov of overlaps) {
      if (ov.lo > cursor) safeRanges.push({ lo: cursor, hi: ov.lo })
      cursor = Math.max(cursor, ov.hi)
    }
    if (cursor < gap.bottom) safeRanges.push({ lo: cursor, hi: gap.bottom })

    // Midpoint of widest safe range
    const widest = safeRanges.reduce<{ lo: number; hi: number } | null>(
      (best, r) => (best == null || r.hi - r.lo > best.hi - best.lo ? r : best),
      null,
    )

    if (widest) {
      cutCandidatesCss.push((widest.lo + widest.hi) / 2)
    }
  }

  cutCandidatesCss.sort((a, b) => a - b)
  console.log(`  ${cutCandidatesCss.length} cut candidates from ${gapRects.length} gaps`)

  // ── 5. Full-page screenshot ───────────────────────────────────────────────
  const fullPngPath = path.join(OUT_DIR, '_full.png')
  const rawBuffer   = await page.screenshot({ fullPage: true })
  await browser.close()

  // Resize to OUTPUT_W
  await sharp(rawBuffer)
    .resize(OUTPUT_W, null, { kernel: 'lanczos3' })
    .png()
    .toFile(fullPngPath)

  const fullMeta = await sharp(fullPngPath).metadata()
  const fullH    = fullMeta.height!
  console.log(`  _full.png: ${OUTPUT_W} × ${fullH} px`)

  // ── 6. Convert cut candidates to output px ────────────────────────────────
  const cutCandidatesOut = cutCandidatesCss.map(y => Math.round(y * CSS_TO_OUT))

  // ── 7. Slice ─────────────────────────────────────────────────────────────
  type Slice = { y: number; height: number; forced: boolean }

  const slices: Slice[] = []
  let pos = 0

  while (pos < fullH) {
    const remaining = fullH - pos
    if (remaining <= 0) break

    // Find the lowest cut candidate within MAX_H_OUT from current pos
    const windowEnd = pos + MAX_H_OUT
    const candidates = cutCandidatesOut.filter(c => c > pos && c <= windowEnd)

    let cutAt: number
    let forced: boolean

    if (candidates.length > 0) {
      cutAt  = candidates[candidates.length - 1]   // lowest = last in sorted list within window
      forced = false
    } else {
      cutAt  = Math.min(pos + MAX_H_OUT, fullH)
      forced = true
      if (cutAt < fullH) {
        console.warn(`  ⚠ Forced cut at output y=${cutAt} (no safe gap within ${MAX_H_OUT}px window)`)
      }
    }

    const h = Math.min(cutAt - pos, fullH - pos)
    slices.push({ y: pos, height: h, forced })
    pos = cutAt
  }

  // Merge tiny last slice
  if (slices.length >= 2) {
    const last = slices[slices.length - 1]
    if (last.height < MIN_LAST_H) {
      const prev = slices[slices.length - 2]
      prev.height += last.height
      slices.pop()
      console.log(`  Merged short last slice (${last.height}px) with previous`)
    }
  }

  if (slices.length > MAX_SLICES) {
    throw new Error(`Too many slices (${slices.length} > ${MAX_SLICES})`)
  }

  // ── 8. Write slice PNGs ───────────────────────────────────────────────────
  const warnings: string[] = []
  const sliceMeta: object[] = []
  const MB = 1024 * 1024

  for (let i = 0; i < slices.length; i++) {
    const s   = slices[i]
    const num = String(i + 1).padStart(3, '0')
    const out = path.join(OUT_DIR, `${num}.png`)

    await sharp(fullPngPath)
      .extract({ left: 0, top: s.y, width: OUTPUT_W, height: s.height })
      .png()
      .toFile(out)

    const stat = fs.statSync(out)
    const sizeMb = stat.size / MB

    if (sizeMb > 20) warnings.push(`${num}.png is ${sizeMb.toFixed(1)} MB (>20 MB)`)

    console.log(`  ${num}.png  y=${s.y}–${s.y + s.height}  h=${s.height}  ${sizeMb.toFixed(1)} MB${s.forced ? '  [FORCED]' : ''}`)

    sliceMeta.push({
      file:   `${num}.png`,
      y:      s.y,
      height: s.height,
      forced: s.forced,
    })

    if (s.forced && i < slices.length - 1) {
      warnings.push(`Forced cut at y=${s.y} — check ${num}.png for mid-element split`)
    }
  }

  // ── 9. Write meta.json ───────────────────────────────────────────────────
  const meta = {
    episode:      EP_NUM,
    capturedAt:   new Date().toISOString(),
    sourceWidth:  VIEWPORT_W * DPR,
    outputWidth:  OUTPUT_W,
    totalHeight:  fullH,
    slices:       sliceMeta,
    warnings,
  }

  fs.writeFileSync(path.join(OUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2))

  // ── 10. Final report ──────────────────────────────────────────────────────
  console.log(`\n─────────────────────────────────────────────`)
  console.log(`EP${String(EP_NUM).padStart(2, '0')} export complete`)
  console.log(`  Slices : ${slices.length}`)
  console.log(`  Heights: ${slices.map(s => s.height).join(', ')} px`)
  console.log(`  Forced : ${slices.filter(s => s.forced).length}`)
  console.log(`  Total  : ${fullH} px`)
  console.log(`  Output : ${OUT_DIR}/`)
  if (warnings.length > 0) {
    console.warn(`  Warnings (${warnings.length}):`)
    warnings.forEach(w => console.warn(`    ⚠ ${w}`))
  }
}

main().catch(err => { console.error(err); process.exit(1) })
