/**
 * analyze-ep31-100.ts — EP31-100 scene 수 vs 컷묶음 수 비교표 출력
 * INSERT 없음. 분석 전용.
 *
 * Run: npx tsx scripts/analyze-ep31-100.ts
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

const HTML_DIRS = [
  path.join('C:', 'Users', 'msj15', 'Downloads', 'kpatto_new'),
  path.join('C:', 'Users', 'msj15', 'Downloads', 'kpatto_new71'),
  path.join('C:', 'Users', 'msj15', 'Downloads', 'kpatto_new91'),
]

function findHtml(epNum: number): string | null {
  const pad  = String(epNum).padStart(3, '0')
  const name = `episode-${pad}-layout.html`
  for (const dir of HTML_DIRS) {
    const p = path.join(dir, name)
    if (fs.existsSync(p)) return p
  }
  return null
}

/** HTML에서 panel 묶음 수 + 컷(img) 수 + gap 수 반환 */
function parseHtmlCounts(html: string): { panelGroups: number; imgCount: number; gapCount: number; gapClasses: string[] } {
  const lines = html.split('\n').map(l => l.trim()).filter(Boolean)
  let panelGroups = 0
  let imgCount    = 0
  let gapCount    = 0
  const gapClasses: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Gap
    const gapM = line.match(/^<div class="(gap-\w+)"/)
    if (gapM) {
      gapCount++
      gapClasses.push(gapM[1])
      continue
    }

    // Wide panel (div.panel)
    if (line.startsWith('<div class="panel">')) {
      panelGroups++
      // Count imgs — may be inline or on next lines
      const inlineImgs = (line.match(/<img/g) ?? []).length
      if (inlineImgs > 0) {
        imgCount += inlineImgs
      } else {
        let j = i + 1
        while (j < lines.length && !lines[j].startsWith('</div>')) {
          if (lines[j].startsWith('<img')) imgCount++
          j++
        }
      }
      continue
    }

    // Split panel (div.panel-split) — count all <img> inside recursively
    if (line.startsWith('<div class="panel-split">')) {
      panelGroups++
      let depth = 1
      let j = i + 1
      while (j < lines.length && depth > 0) {
        if (lines[j].startsWith('<div')) depth++
        if (lines[j].startsWith('</div>')) depth--
        if (depth > 0 && lines[j].startsWith('<img')) imgCount++
        j++
      }
      continue
    }
  }

  return { panelGroups, imgCount, gapCount, gapClasses }
}

async function main() {
  const EPS = Array.from({ length: 70 }, (_, i) => i + 31)

  // Fetch episode IDs
  const { data: epRows, error: epErr } = await supabase
    .from('kp_episodes').select('id, episode_num').in('episode_num', EPS)
  if (epErr) { console.error('fetch episodes:', epErr); process.exit(1) }

  const epMap = new Map<number, number>()
  for (const r of epRows ?? []) epMap.set(r.episode_num, r.id)

  // Fetch scene counts from kp_scenes
  const episodeIds = [...epMap.values()]
  const { data: sceneRows, error: scErr } = await supabase
    .from('kp_scenes')
    .select('episode_id')
    .in('episode_id', episodeIds)
  if (scErr) {
    console.error('fetch kp_scenes failed:', scErr)
    console.log('→ kp_scenes 테이블이 없거나 컬럼명 다름. kp_dialogues에서 scene_id로 집계합니다.')
    await mainFallback(EPS, epMap)
    return
  }

  const sceneCountMap = new Map<number, number>()
  for (const r of sceneRows ?? []) {
    sceneCountMap.set(r.episode_id, (sceneCountMap.get(r.episode_id) ?? 0) + 1)
  }

  printTable(EPS, epMap, sceneCountMap)
}

async function mainFallback(EPS: number[], epMap: Map<number, number>) {
  // Fallback: count distinct scene_id from kp_dialogues
  const episodeIds = [...epMap.values()]
  const { data: dlgRows, error } = await supabase
    .from('kp_dialogues')
    .select('episode_id, scene_id')
    .in('episode_id', episodeIds)
  if (error) { console.error('fetch kp_dialogues:', error); process.exit(1) }

  const sceneCountMap = new Map<number, number>()
  for (const r of (dlgRows ?? [])) {
    const key = `${r.episode_id}:${r.scene_id}`
    if (!sceneCountMap.has(r.episode_id)) sceneCountMap.set(r.episode_id, 0)
    // Count distinct scene_ids per episode
  }
  // Count distinct scene_ids
  const seen = new Set<string>()
  for (const r of (dlgRows ?? [])) {
    const key = `${r.episode_id}:${r.scene_id}`
    if (!seen.has(key)) {
      seen.add(key)
      sceneCountMap.set(r.episode_id, (sceneCountMap.get(r.episode_id) ?? 0) + 1)
    }
  }

  printTable(EPS, epMap, sceneCountMap)
}

function printTable(EPS: number[], epMap: Map<number, number>, sceneCountMap: Map<number, number>) {
  console.log('\n| EP  | scene 수 | 컷묶음 수 | 컷 수 | gap 수 | gap classes | mismatch |')
  console.log('|-----|---------|---------|------|-------|-------------|----------|')

  const mismatches: number[] = []

  for (const epNum of EPS) {
    const episodeId  = epMap.get(epNum)
    const sceneCount = episodeId ? (sceneCountMap.get(episodeId) ?? '?') : '?'

    const htmlPath = findHtml(epNum)
    if (!htmlPath) {
      console.log(`| ${String(epNum).padStart(3)} | ${sceneCount}       | HTML없음  |  -   |   -   | -           | ⚠        |`)
      continue
    }

    const html = fs.readFileSync(htmlPath, 'utf-8')
    const { panelGroups, imgCount, gapCount, gapClasses } = parseHtmlCounts(html)

    const sc      = typeof sceneCount === 'number' ? sceneCount : 0
    const flag    = typeof sceneCount === 'number' && sceneCount !== panelGroups ? '⚠ 불일치' : '✓'
    const gcStr   = gapClasses.join(',').replace(/gap-/g, '')

    if (flag !== '✓') mismatches.push(epNum)

    console.log(
      `| EP${String(epNum).padStart(3, '0')} | ${String(sceneCount).padStart(7)} | ${String(panelGroups).padStart(8)} | ${String(imgCount).padStart(4)} | ${String(gapCount).padStart(5)} | ${gcStr.padEnd(35).slice(0,35)} | ${flag} |`
    )
  }

  console.log(`\n불일치 EP: ${mismatches.length > 0 ? mismatches.map(n => `EP${n}`).join(', ') : '없음'}`)
}

main().catch(console.error)
