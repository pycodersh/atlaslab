/**
 * seed-ep31-100.ts — HTML-aware dynamic seeder for EP31-100
 *
 * Scene assignment:
 *   - Cuts are numbered 0-based globally per episode: c0, c1, c2, c3, c4, c5...
 *   - c0→s1, c1→s2, c2→s3, c3→s4, c4→s5  (first 5 cuts only)
 *   - c5+ → no dialogue (silent / trailing cuts)
 *   - Each gap shows dialogue for ALL cuts directly above it (between prev gap and this gap)
 *   - 1 cut above → 2 bubbles, h=0.88
 *   - 2 cuts above → 4 bubbles, h=1.76
 *   - 3 cuts above → 6 bubbles, h=2.64
 *   - 0 cuts (or only c5+) → no bubbles, h=0.55
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
 * Compute bubble position for scene si (0-based) of n total scenes in a gap, line li (0 or 1).
 * Generalizes NORMAL_POS (n=1) and DOUBLE_POS (n=2) to arbitrary n.
 *   n=1: s0l0→yPct=6,  s0l1→yPct=56
 *   n=2: s0l0→yPct=3,  s0l1→yPct=28, s1l0→yPct=53, s1l1→yPct=78
 *   n=3: s0l0→yPct=2,  s0l1→yPct=19, s1l0→yPct=35, s1l1→yPct=52, s2l0→yPct=69, s2l1→yPct=85
 */
function scenePos(n: number, si: number, li: number) {
  const yBase = (si / n) * 100
  if (li === 0) {
    return { xPct: 20, yPct: Math.round(yBase + 6 / n),  widthPct: 68, bubbleKey: 'bubble-oval', lines: 1 as const, tail: TAIL_R }
  }
  return   { xPct: 4,  yPct: Math.round(yBase + 56 / n), widthPct: 76, bubbleKey: 'bubble-oval', lines: 1 as const, tail: TAIL_LTOP }
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function log(msg: string) { process.stdout.write(`[seed] ${msg}\n`) }

// ── HTML file finder ──────────────────────────────────────────────────────────
function findHtml(epNum: number): string | null {
  const pad  = String(epNum).padStart(3, '0')
  const name = `episode-${pad}-layout.html`
  for (const dir of HTML_DIRS) {
    const p = path.join(dir, name)
    if (fs.existsSync(p)) return p
  }
  return null
}

// ── HTML parser ───────────────────────────────────────────────────────────────
type PanelImg = { src: string; layout: string }
type HtmlGap  = { kind: 'gap'; cls: string }
type HtmlPanel = { kind: 'panel'; images: PanelImg[] }
type HtmlSec  = HtmlGap | HtmlPanel

function parseHtml(html: string): HtmlSec[] {
  const lines  = html.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const result: HtmlSec[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Gap
    const gapM = line.match(/^<div class="(gap-\w+)"/)
    if (gapM) { result.push({ kind: 'gap', cls: gapM[1] }); i++; continue }

    // Wide panel (single or multi-line)
    if (line.startsWith('<div class="panel">')) {
      const imgs: PanelImg[] = []
      const inlineM = line.match(/src="([^"]+)"/)
      if (inlineM) {
        imgs.push({ src: inlineM[1], layout: 'wide' })
      } else {
        i++
        while (i < lines.length && !lines[i].startsWith('</div>')) {
          const m = lines[i].match(/src="([^"]+)"/)
          if (m) imgs.push({ src: m[1], layout: 'wide' })
          i++
        }
      }
      if (imgs.length) result.push({ kind: 'panel', images: imgs })
      i++; continue
    }

    // Split panel (may contain direct imgs and/or a stack div)
    if (line.startsWith('<div class="panel-split">')) {
      const imgs: PanelImg[] = []
      i++

      while (i < lines.length && lines[i] !== '</div>') {
        const l2 = lines[i]

        if (l2.startsWith('<img')) {
          const srcM = l2.match(/src="([^"]+)"/)
          const wM   = l2.match(/width:\s*([\d.]+)%/)
          if (srcM) imgs.push({ src: srcM[1], layout: `split:${wM ? parseFloat(wM[1]) : 50}` })
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
              if (srcM) imgs.push({ src: srcM[1], layout: first ? `stack-t:${sw}` : 'stack-b' })
              first = false
            }
            i++
          }
          i++; continue // skip stack </div>
        }

        i++
      }

      if (imgs.length) result.push({ kind: 'panel', images: imgs })
      i++; continue // skip panel-split </div>
    }

    i++
  }

  return result
}

// ── Image URL / existence check ───────────────────────────────────────────────
function imgUrl(epNum: number, src: string): string {
  return `/kpatto/ep-${String(epNum).padStart(3, '0')}/${src}`
}

function checkImg(epNum: number, src: string): boolean {
  return fs.existsSync(path.join(PUBLIC_DIR, `ep-${String(epNum).padStart(3, '0')}`, src))
}

// ── Dialogue fetcher ──────────────────────────────────────────────────────────
type DlgRow = { id: number; scene_id: number; text_ko: string; speaker: string | null }

async function fetchDialogues(episodeId: number): Promise<DlgRow[]> {
  const { data, error } = await supabase
    .from('kp_dialogues')
    .select('id, scene_id, text_ko, speaker')
    .eq('episode_id', episodeId)
    .order('scene_id').order('id')
  if (!error) return (data ?? []) as DlgRow[]

  // Fallback: without speaker column
  const { data: d2, error: e2 } = await supabase
    .from('kp_dialogues')
    .select('id, scene_id, text_ko')
    .eq('episode_id', episodeId)
    .order('scene_id').order('id')
  if (e2) throw new Error(`kp_dialogues ep${episodeId}: ${JSON.stringify(e2)}`)
  return (d2 ?? []).map(r => ({ ...r, speaker: null })) as DlgRow[]
}

// ── Cleaner ───────────────────────────────────────────────────────────────────
async function cleanEpisodes(ids: number[]) {
  if (!ids.length) return
  const { error: be } = await supabase.from('kp_bubbles').delete().in('episode_id', ids)
  if (be) throw new Error(`clean kp_bubbles: ${JSON.stringify(be)}`)
  const { error: pe } = await supabase.from('kp_panels').delete().in('episode_id', ids)
  if (pe) throw new Error(`clean kp_panels: ${JSON.stringify(pe)}`)
}

// ── Episode seeder ────────────────────────────────────────────────────────────
async function seedEpisode(epNum: number, episodeId: number): Promise<{ panels: number; bubbles: number }> {
  const htmlPath = findHtml(epNum)
  if (!htmlPath) throw new Error('HTML not found')
  const sections = parseHtml(fs.readFileSync(htmlPath, 'utf-8'))

  const dlgs = await fetchDialogues(episodeId)
  if (!dlgs.length) throw new Error('no dialogues')

  // Group dialogues by scene_id (ordered by scene_id then id)
  const sceneMap = new Map<number, DlgRow[]>()
  for (const d of dlgs) {
    if (!sceneMap.has(d.scene_id)) sceneMap.set(d.scene_id, [])
    sceneMap.get(d.scene_id)!.push(d)
  }
  const scenes = [...sceneMap.values()]  // scenes[0]=s1, scenes[1]=s2, ..., scenes[4]=s5

  // ── Assign scenes to gaps ─────────────────────────────────────────────────
  // Cuts are counted globally: c0→s1, c1→s2, ..., c4→s5, c5+→no dialogue.
  // A gap shows dialogue for all cuts directly above it (between prev gap and this gap).
  type GapMeta = { sceneGroups: DlgRow[][]; heightRatio: number; orderNum: number }
  const gapMetas: GapMeta[] = []
  let cutsSince: number[] = []
  let globalCutIdx = 0

  for (const sec of sections) {
    if (sec.kind === 'panel') {
      for (let j = 0; j < sec.images.length; j++) cutsSince.push(globalCutIdx++)
    } else {
      const sceneGroups = cutsSince.filter(ci => ci < 5).map(ci => scenes[ci] ?? [])
      const n = sceneGroups.length
      gapMetas.push({ sceneGroups, heightRatio: n === 0 ? 0.55 : 0.88 * n, orderNum: 0 })
      cutsSince = []
    }
  }

  // ── Build kp_panels rows (one row per gap, one row per image) ─────────────
  let orderN = 1
  let gapIdx = 0
  const panelRows: object[] = []

  for (const sec of sections) {
    if (sec.kind === 'gap') {
      const gm = gapMetas[gapIdx++]
      gm.orderNum = orderN
      panelRows.push({ episode_id: episodeId, order_num: orderN++, type: 'gap', image_url: null, layout: null, height_ratio: gm.heightRatio })
    } else {
      for (const img of sec.images) {
        if (!checkImg(epNum, img.src)) log(`  ⚠ EP${epNum}: missing image: ${img.src}`)
        panelRows.push({ episode_id: episodeId, order_num: orderN++, type: 'panel', image_url: imgUrl(epNum, img.src), layout: img.layout, height_ratio: null })
      }
    }
  }

  // ── INSERT kp_panels ──────────────────────────────────────────────────────
  const { data: insertedPanels, error: pErr } = await supabase
    .from('kp_panels').insert(panelRows).select('id, order_num, type')
  if (pErr) throw new Error(`kp_panels: ${JSON.stringify(pErr)}`)

  const gapIdByOrder = new Map<number, number>()
  for (const p of insertedPanels ?? []) {
    if (p.type === 'gap') gapIdByOrder.set(p.order_num, p.id)
  }

  // ── Build kp_bubbles rows ─────────────────────────────────────────────────
  const DEFAULT_SPKRS = ['jisu', 'emma']
  const bubbleRows: object[] = []

  for (const gm of gapMetas) {
    if (!gm.sceneGroups.length) continue
    const panelId = gapIdByOrder.get(gm.orderNum)
    if (!panelId) continue
    const n = gm.sceneGroups.length
    let bubbleOrder = 1

    for (let si = 0; si < n; si++) {
      const dlgsForScene = gm.sceneGroups[si]
      for (let li = 0; li < Math.min(dlgsForScene.length, 2); li++) {
        const d   = dlgsForScene[li]
        const pos = scenePos(n, si, li)
        bubbleRows.push({
          panel_id:     panelId,
          episode_id:   episodeId,
          order_num:    bubbleOrder++,
          speaker:      d.speaker ?? DEFAULT_SPKRS[li] ?? 'jisu',
          korean:       d.text_ko,
          translations: {},
          position:     { xPct: pos.xPct, yPct: pos.yPct, widthPct: pos.widthPct, bubbleKey: pos.bubbleKey, lines: pos.lines },
          tail:         pos.tail,
          dialogue_id:  d.id,
          audio_url:    null,
        })
      }
    }
  }

  // ── INSERT kp_bubbles ─────────────────────────────────────────────────────
  if (bubbleRows.length) {
    const { error: bErr } = await supabase.from('kp_bubbles').insert(bubbleRows)
    if (bErr) throw new Error(`kp_bubbles: ${JSON.stringify(bErr)}`)
  }

  return { panels: panelRows.length, bubbles: bubbleRows.length }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  log('=== EP31-100 Dynamic Seed ===\n')
  const EPS = Array.from({ length: 70 }, (_, i) => i + 31)

  const { data: epRows, error } = await supabase
    .from('kp_episodes').select('id, episode_num').in('episode_num', EPS)
  if (error) { process.stderr.write(`fatal: fetch kp_episodes: ${JSON.stringify(error)}\n`); process.exit(1) }

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

  // ── Summary ───────────────────────────────────────────────────────────────
  log('\n| EP   | panels | bubbles |')
  log('|------|--------|---------|')
  for (const r of results) {
    log(`| EP${String(r.epNum).padStart(3, '0')} | ${String(r.panels).padStart(6)} | ${String(r.bubbles).padStart(7)} |`)
  }

  const totalPanels  = results.reduce((s, r) => s + r.panels, 0)
  const totalBubbles = results.reduce((s, r) => s + r.bubbles, 0)
  log(`\nTotal: ${totalPanels} panels, ${totalBubbles} bubbles`)

  if (errors.length) {
    log(`\n❌ Errors (${errors.length}):`)
    errors.forEach(e => log(`  ${e}`))
  } else {
    log('\n✓ 에러 없음')
  }
  log('\n=== 완료 ===')
}

main().catch(e => { process.stderr.write(`fatal: ${e}\n`); process.exit(1) })
