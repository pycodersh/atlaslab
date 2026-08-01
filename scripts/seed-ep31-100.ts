/**
 * seed-ep31-100.ts — EP31-100 image-panel seeder
 *
 * kp_panels : <img> 태그 하나당 레코드 하나 (gap row 없음). 전체 405개.
 * kp_bubbles: kp_dialogues 1건당 bubble 1개 (702건 목표).
 *             panel_id = 해당 컷의 image panel ID.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const PUBLIC_DIR = path.resolve(process.cwd(), 'public', 'kpatto')

const HTML_DIRS = [
  path.join('C:', 'Users', 'msj15', 'Downloads', 'kpatto_new'),
  path.join('C:', 'Users', 'msj15', 'Downloads', 'kpatto_new71'),
  path.join('C:', 'Users', 'msj15', 'Downloads', 'kpatto_new91'),
]

const TAIL_R    = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const TAIL_LTOP = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }

/**
 * Bubble position for the si-th scene (0-based) among n total scenes in a gap, line li (0 or 1).
 * n=1 → NORMAL_POS, n=2 → DOUBLE_POS, n=3 → TRIPLE_POS, all from the same formula.
 */
function scenePos(n: number, si: number, li: number) {
  const yBase = (si / n) * 100
  if (li === 0) return { xPct: 20, yPct: Math.round(yBase + 6  / n), widthPct: 68, bubbleKey: 'bubble-oval', lines: 1 as const, tail: TAIL_R }
  return             { xPct: 4,  yPct: Math.round(yBase + 56 / n), widthPct: 76, bubbleKey: 'bubble-oval', lines: 1 as const, tail: TAIL_LTOP }
}

function log(msg: string) { process.stdout.write(`[seed] ${msg}\n`) }

function findHtml(epNum: number): string | null {
  const pad  = String(epNum).padStart(3, '0')
  const name = `episode-${pad}-layout.html`
  for (const dir of HTML_DIRS) {
    const p = path.join(dir, name)
    if (fs.existsSync(p)) return p
  }
  return null
}

// ── HTML → flat ordered image list ───────────────────────────────────────────
type ImgEntry = { src: string; layout: string }

function extractImages(html: string): ImgEntry[] {
  const lines  = html.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const result: ImgEntry[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Wide panel
    if (line.startsWith('<div class="panel">')) {
      const inlineM = line.match(/src="([^"]+)"/)
      if (inlineM) {
        result.push({ src: inlineM[1], layout: 'wide' })
      } else {
        i++
        while (i < lines.length && !lines[i].startsWith('</div>')) {
          const m = lines[i].match(/src="([^"]+)"/)
          if (m) result.push({ src: m[1], layout: 'wide' })
          i++
        }
      }
      i++; continue
    }

    // Split panel (direct imgs + optional stack)
    if (line.startsWith('<div class="panel-split">')) {
      i++
      while (i < lines.length && lines[i] !== '</div>') {
        const l2 = lines[i]

        if (l2.startsWith('<img')) {
          const srcM = l2.match(/src="([^"]+)"/)
          const wM   = l2.match(/width:\s*([\d.]+)%/)
          if (srcM) result.push({ src: srcM[1], layout: `split:${wM ? parseFloat(wM[1]) : 50}` })
          i++; continue
        }

        if (l2.startsWith('<div class="stack"')) {
          const swM = l2.match(/width:\s*([\d.]+)%/)
          const sw  = swM ? parseFloat(swM[1]) : 50
          i++
          let first = true
          while (i < lines.length && lines[i] !== '</div>') {
            if (lines[i].startsWith('<img')) {
              const srcM = lines[i].match(/src="([^"]+)"/)
              if (srcM) result.push({ src: srcM[1], layout: first ? `stack-t:${sw}` : 'stack-b' })
              first = false
            }
            i++
          }
          i++; continue // skip stack </div>
        }
        i++
      }
      i++; continue // skip panel-split </div>
    }

    i++
  }

  return result
}

/**
 * Group flat image list into visual rows using layout-width accumulation.
 *   wide       → 1-image row (starts and ends immediately)
 *   split:X    → accumulate; end row when sum ≥ 99 %
 *   stack-t:X  → accumulate; don't end (stack-b follows)
 *   stack-b    → end row
 */
function groupIntoRows(images: ImgEntry[]): ImgEntry[][] {
  const rows: ImgEntry[][] = []
  let cur: ImgEntry[] = []
  let wSum = 0

  for (const img of images) {
    const { layout } = img
    if (layout === 'wide') {
      if (cur.length) { rows.push(cur); cur = []; wSum = 0 }
      rows.push([img])
    } else if (layout.startsWith('split:')) {
      cur.push(img); wSum += parseFloat(layout.slice(6))
      if (wSum >= 99) { rows.push(cur); cur = []; wSum = 0 }
    } else if (layout.startsWith('stack-t:')) {
      cur.push(img); wSum += parseFloat(layout.slice(8))
    } else if (layout === 'stack-b') {
      cur.push(img); rows.push(cur); cur = []; wSum = 0
    }
  }
  if (cur.length) rows.push(cur)
  return rows
}

function imgUrl(epNum: number, src: string): string {
  return `/kpatto/ep-${String(epNum).padStart(3, '0')}/${src}`
}
function checkImg(epNum: number, src: string): boolean {
  return fs.existsSync(path.join(PUBLIC_DIR, `ep-${String(epNum).padStart(3, '0')}`, src))
}

type DlgRow = { id: number; scene_id: number; text_ko: string; speaker: string | null }

async function fetchDialogues(episodeId: number): Promise<DlgRow[]> {
  const { data, error } = await supabase
    .from('kp_dialogues').select('id, scene_id, text_ko, speaker')
    .eq('episode_id', episodeId).order('scene_id').order('id')
  if (!error) return (data ?? []) as DlgRow[]
  // fallback without speaker column
  const { data: d2, error: e2 } = await supabase
    .from('kp_dialogues').select('id, scene_id, text_ko')
    .eq('episode_id', episodeId).order('scene_id').order('id')
  if (e2) throw new Error(`kp_dialogues ep${episodeId}: ${JSON.stringify(e2)}`)
  return (d2 ?? []).map(r => ({ ...r, speaker: null })) as DlgRow[]
}

async function cleanEpisodes(ids: number[]) {
  if (!ids.length) return
  const { error: be } = await supabase.from('kp_bubbles').delete().in('episode_id', ids)
  if (be) throw new Error(`clean kp_bubbles: ${JSON.stringify(be)}`)
  const { error: pe } = await supabase.from('kp_panels').delete().in('episode_id', ids)
  if (pe) throw new Error(`clean kp_panels: ${JSON.stringify(pe)}`)
}

async function seedEpisode(epNum: number, episodeId: number): Promise<{ panels: number; bubbles: number }> {
  const htmlPath = findHtml(epNum)
  if (!htmlPath) throw new Error('HTML not found')

  const images = extractImages(fs.readFileSync(htmlPath, 'utf-8'))
  if (!images.length) throw new Error('no <img> tags found in HTML')

  const dlgs = await fetchDialogues(episodeId)
  if (!dlgs.length) throw new Error('no dialogues in kp_dialogues')

  // Group dialogues by scene_id (already ordered by scene_id, id)
  const sceneMap = new Map<number, DlgRow[]>()
  for (const d of dlgs) {
    if (!sceneMap.has(d.scene_id)) sceneMap.set(d.scene_id, [])
    sceneMap.get(d.scene_id)!.push(d)
  }
  const scenes = [...sceneMap.values()]  // scenes[0]=s1, ..., scenes[4]=s5

  // Group images into visual rows (for computing n = scenes per gap)
  const rows = groupIntoRows(images)

  // ── INSERT kp_panels (image panels only, one per <img>) ───────────────────
  const panelRows = images.map((img, idx) => {
    if (!checkImg(epNum, img.src)) log(`  ⚠ EP${epNum}: missing image: ${img.src}`)
    return {
      episode_id:   episodeId,
      order_num:    idx + 1,        // cut 순서 (1-indexed)
      type:         'panel',
      image_url:    imgUrl(epNum, img.src),
      layout:       img.layout,
      height_ratio: null,
    }
  })

  const { data: insertedPanels, error: pErr } = await supabase
    .from('kp_panels').insert(panelRows).select('id, order_num')
  if (pErr) throw new Error(`kp_panels: ${JSON.stringify(pErr)}`)

  // order_num → DB panel id
  const panelIdByOrder = new Map<number, number>(
    (insertedPanels ?? []).map(p => [p.order_num as number, p.id as number])
  )

  // ── INSERT kp_bubbles (one per kp_dialogues row) ──────────────────────────
  const DEFAULT_SPKRS = ['jisu', 'emma']
  const bubbleRows: object[] = []

  let globalCutIdx = 0
  for (const row of rows) {
    // Which cuts in this row have scenes? (cutIdx 0-4 → scenes[0-4])
    const scenesInRow = row.map((_, ri) => globalCutIdx + ri).filter(ci => ci < scenes.length && ci < 5)
    const n = scenesInRow.length

    for (let si = 0; si < n; si++) {
      const cutIdx  = scenesInRow[si]
      const panelId = panelIdByOrder.get(cutIdx + 1)
      if (!panelId) continue

      const dlgsForScene = scenes[cutIdx] ?? []
      for (let li = 0; li < dlgsForScene.length; li++) {
        const d   = dlgsForScene[li]
        const pos = scenePos(n, si, li < 2 ? li : 1)  // cap position at li=1 for overflow lines
        bubbleRows.push({
          panel_id:     panelId,
          episode_id:   episodeId,
          order_num:    li + 1,
          speaker:      d.speaker ?? DEFAULT_SPKRS[li < 2 ? li : 1] ?? 'jisu',
          korean:       d.text_ko,
          translations: {},
          position:     { xPct: pos.xPct, yPct: pos.yPct, widthPct: pos.widthPct, bubbleKey: pos.bubbleKey, lines: pos.lines },
          tail:         pos.tail,
          dialogue_id:  d.id,
          audio_url:    null,
        })
      }
    }

    globalCutIdx += row.length
  }

  if (bubbleRows.length) {
    const { error: bErr } = await supabase.from('kp_bubbles').insert(bubbleRows)
    if (bErr) throw new Error(`kp_bubbles: ${JSON.stringify(bErr)}`)
  }

  return { panels: panelRows.length, bubbles: bubbleRows.length }
}

async function main() {
  log('=== EP31-100 Seed (image panels only) ===\n')
  const EPS = Array.from({ length: 70 }, (_, i) => i + 31)

  const { data: epRows, error } = await supabase
    .from('kp_episodes').select('id, episode_num').in('episode_num', EPS)
  if (error) { process.stderr.write(`fatal: ${JSON.stringify(error)}\n`); process.exit(1) }

  const epMap = new Map<number, number>()
  for (const r of epRows ?? []) epMap.set(r.episode_num, r.id)
  log(`Found ${epMap.size}/70 episodes in DB\n`)

  log('Cleaning EP31-100 (kp_panels + kp_bubbles)...')
  await cleanEpisodes([...epMap.values()])
  log('  ✓ cleaned\n')

  const errors: string[] = []
  const results: { epNum: number; panels: number; bubbles: number }[] = []

  for (const epNum of EPS) {
    const episodeId = epMap.get(epNum)
    if (!episodeId) { errors.push(`EP${epNum}: not in DB`); continue }
    try {
      const r = await seedEpisode(epNum, episodeId)
      results.push({ epNum, ...r })
    } catch (e) {
      errors.push(`EP${epNum}: ${e instanceof Error ? e.message : JSON.stringify(e)}`)
    }
  }

  log('\n| EP   | panels | bubbles |')
  log('|------|--------|---------|')
  for (const r of results) {
    log(`| EP${String(r.epNum).padStart(3, '0')} | ${String(r.panels).padStart(6)} | ${String(r.bubbles).padStart(7)} |`)
  }

  const totP = results.reduce((s, r) => s + r.panels, 0)
  const totB = results.reduce((s, r) => s + r.bubbles, 0)
  log(`\nTotal: ${totP} panels, ${totB} bubbles`)

  if (errors.length) {
    log(`\n❌ Errors (${errors.length}):`)
    errors.forEach(e => log(`  ${e}`))
  } else {
    log('\n✓ 에러 없음')
  }
  log('\n=== 완료 ===')
}

main().catch(e => { process.stderr.write(`fatal: ${e}\n`); process.exit(1) })
