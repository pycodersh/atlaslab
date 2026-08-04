/**
 * Correct diagnostic: EP31-100 LEGACY path analysis
 *
 * hasGaps=true for all EP31-100 → legacy path is used, NOT the EP31+ new path.
 * Fix 3 only modified the EP31+ new path → zero effect on EP31-100.
 *
 * This script checks the LEGACY path behavior:
 * 1. Simulates the legacy panelList.map() with actual order_num sorting
 * 2. Detects duplicate order_nums (gap + panel sharing same order → non-deterministic)
 * 3. Counts trailing gaps (gaps with no panel after them → bubbles pile at bottom)
 * 4. Detects "stuck panels" (2+ consecutive panel sections without a gap between)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const { data: episodes } = await supabase
  .from('kp_episodes').select('id, episode_num')
  .gte('episode_num', 31).lte('episode_num', 100).order('episode_num')

console.log(`Checking EP${episodes[0].episode_num}~EP${episodes.at(-1).episode_num} (${episodes.length} total)\n`)

const results = []

for (const ep of episodes) {
  // Fetch ALL panel rows (both type='panel' and type='gap') — same as fetch-episode.ts
  const { data: allPanels } = await supabase
    .from('kp_panels').select('id, order_num, type, layout')
    .eq('episode_id', ep.id).order('order_num')

  const panelList = allPanels ?? []
  const hasGaps = panelList.some(p => p.type === 'gap')

  const { data: bubbles } = await supabase
    .from('kp_bubbles').select('panel_id, order_num')
    .eq('episode_id', ep.id).order('order_num')

  const byPanel = new Map()
  for (const b of (bubbles ?? [])) {
    if (!byPanel.has(b.panel_id)) byPanel.set(b.panel_id, [])
    byPanel.get(b.panel_id).push(b)
  }

  // Build sections as legacy path does (map in order_num order, as returned by DB)
  const sections = []
  let gapCount = 0, panelCount = 0
  for (const p of panelList) {
    if (p.type === 'gap') {
      const bs = byPanel.get(p.id) ?? []
      sections.push({ type: 'gap', id: `gap-${gapCount++}`, dbId: p.id, orderNum: p.order_num, bubbleCount: bs.length })
    } else if (p.type === 'panel') {
      panelCount++
      sections.push({ type: 'panel', id: `cut-${panelCount}`, dbId: p.id, orderNum: p.order_num, layout: p.layout })
    }
  }

  // Check 1: duplicate order_nums between gaps and panels
  const orderToTypes = new Map()
  for (const p of panelList) {
    if (!orderToTypes.has(p.order_num)) orderToTypes.set(p.order_num, [])
    orderToTypes.get(p.order_num).push(p.type)
  }
  const dupOrders = [...orderToTypes.entries()]
    .filter(([, types]) => types.length > 1 && types.includes('gap') && types.includes('panel'))
    .map(([ord]) => ord)

  // Check 2: consecutive panels without a gap between them ("stuck panels")
  let stuckCount = 0
  for (let i = 0; i < sections.length - 1; i++) {
    if (sections[i].type === 'panel' && sections[i + 1].type === 'panel') {
      stuckCount++
    }
  }

  // Check 3: trailing gaps — gaps at end with no panel after them (bubbles pile up)
  let trailingGaps = 0
  let i = sections.length - 1
  while (i >= 0 && sections[i].type === 'gap') { trailingGaps++; i-- }

  // Check 4: gap-bubble misalignment — gap has bubbles but no panel before it
  let orphanGaps = 0
  for (let j = 0; j < sections.length; j++) {
    if (sections[j].type === 'gap' && sections[j].bubbleCount > 0) {
      // the panel before this gap (if any)
      const prevPanel = sections.slice(0, j).reverse().find(s => s.type === 'panel')
      if (!prevPanel) orphanGaps++
    }
  }

  const totalBubbles = (bubbles ?? []).length
  const bubblesAssigned = sections.filter(s => s.type === 'gap').reduce((s, g) => s + g.bubbleCount, 0)
  const issues = []
  if (dupOrders.length > 0) issues.push(`dup order_nums: [${dupOrders.join(',')}]`)
  if (stuckCount > 0) issues.push(`${stuckCount} stuck panel-panel pairs`)
  if (trailingGaps > 0) issues.push(`${trailingGaps} trailing gap(s) with no panel after`)
  if (orphanGaps > 0) issues.push(`${orphanGaps} gap(s) with bubble but no preceding panel`)

  results.push({
    ep: ep.episode_num,
    hasGaps,
    panelRows: panelList.filter(p => p.type === 'panel').length,
    gapRows: panelList.filter(p => p.type === 'gap').length,
    bubbles: totalBubbles,
    bubblesAssigned,
    dupOrders: dupOrders.length,
    stuck: stuckCount,
    trailing: trailingGaps,
    issues,
  })
}

// Summary
const ok = results.filter(r => r.issues.length === 0)
const bad = results.filter(r => r.issues.length > 0)
console.log(`=== LEGACY PATH DIAGNOSTIC ===`)
console.log(`정상: ${ok.length}화   비정상: ${bad.length}화\n`)

// Group by issue pattern
const patterns = new Map()
for (const r of bad) {
  const key = r.issues.join(' | ')
  if (!patterns.has(key)) patterns.set(key, [])
  patterns.get(key).push(r.ep)
}

console.log('비정상 유형별:')
for (const [pattern, eps] of patterns) {
  console.log(`  [${pattern}]`)
  console.log(`    EP: ${eps.map(n => String(n).padStart(2,'0')).join(' ')}`)
}

if (ok.length > 0) {
  console.log(`\n정상 EP: ${ok.map(r => String(r.ep).padStart(2,'0')).join(' ')}`)
}

// Detail for a sample bad episode
const sample = bad[0]
if (sample) {
  console.log(`\n--- EP${sample.ep} 섹션 순서 (실제 DB 반환 순) ---`)
  const { data: sp } = await supabase
    .from('kp_panels').select('id, order_num, type, layout')
    .eq('episode_id', episodes.find(e => e.episode_num === sample.ep).id).order('order_num')
  for (const p of (sp ?? [])) {
    console.log(`  order=${p.order_num} type=${p.type} id=${p.id} layout=${p.layout}`)
  }
}
