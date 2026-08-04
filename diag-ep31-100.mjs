/**
 * Diagnostic: EP31~100 section structure check
 *
 * For each episode, simulates the fetch-episode.ts EP31+ section builder
 * and verifies:
 *   1. gap count == panel count (one gap per cut)
 *   2. each gap's bubbles belong to the panel immediately before it (panel_id match)
 *   3. no gap has bubbles from multiple panels
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env.local
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY'] ?? env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'],
)

// Replicate fetch-episode.ts row-grouping + section-builder logic
function buildSections(panelList, byPanel) {
  // Group into rows (same logic as fetch-episode.ts)
  const rows = []
  let cur = [], wSum = 0
  for (const p of panelList) {
    const lay = p.layout ?? 'wide'
    if (lay === 'wide') {
      if (cur.length) { rows.push(cur); cur = []; wSum = 0 }
      rows.push([p])
    } else if (lay.startsWith('split:')) {
      cur.push(p); wSum += parseFloat(lay.slice(6))
      if (wSum >= 99) { rows.push(cur); cur = []; wSum = 0 }
    } else if (lay.startsWith('stack-t:')) {
      cur.push(p); wSum += parseFloat(lay.slice(8))
    } else if (lay === 'stack-b') {
      cur.push(p); rows.push(cur); cur = []; wSum = 0
    }
  }
  if (cur.length) rows.push(cur)

  const sections = []
  sections.push({ type: 'gap', id: 'gap-0', bubbles: [], ownerPanelId: null })

  let gapCount = 1, panelCount = 0
  for (const row of rows) {
    for (const rp of row) {
      panelCount++
      sections.push({ type: 'panel', id: `cut-${panelCount}`, panelId: rp.id, layout: rp.layout ?? 'wide' })
      const panelBubbles = byPanel.get(rp.id) ?? []
      const gapId = `gap-${gapCount++}`
      sections.push({ type: 'gap', id: gapId, bubbles: panelBubbles, ownerPanelId: rp.id })
    }
  }

  return sections
}

async function main() {
  // Fetch all episodes EP31-100
  const { data: episodes, error: epErr } = await supabase
    .from('kp_episodes')
    .select('id, episode_num')
    .gte('episode_num', 31)
    .lte('episode_num', 100)
    .order('episode_num')

  if (epErr || !episodes) { console.error('Episode fetch error:', epErr); process.exit(1) }
  console.log(`Episodes found: EP${episodes[0]?.episode_num} ~ EP${episodes.at(-1)?.episode_num} (${episodes.length} total)\n`)

  const ok = [], bad = []

  for (const ep of episodes) {
    const { data: panels } = await supabase
      .from('kp_panels')
      .select('id, order_num, type, layout')
      .eq('episode_id', ep.id)
      .eq('type', 'panel')        // EP31+ has no gap rows — only image panels
      .order('order_num')

    const { data: bubbles } = await supabase
      .from('kp_bubbles')
      .select('panel_id, order_num')
      .eq('episode_id', ep.id)
      .order('order_num')

    const panelList = panels ?? []
    const bubbleList = bubbles ?? []

    // Build byPanel map
    const byPanel = new Map()
    for (const b of bubbleList) {
      if (!byPanel.has(b.panel_id)) byPanel.set(b.panel_id, [])
      byPanel.get(b.panel_id).push(b)
    }

    const sections = buildSections(panelList, byPanel)
    const panelSections = sections.filter(s => s.type === 'panel')
    const gapSections = sections.filter(s => s.type === 'gap')
    // Exclude the leading gap-0 (no owner)
    const contentGaps = gapSections.filter(s => s.ownerPanelId !== null)

    const issues = []

    // Check 1: gap count == panel count
    if (contentGaps.length !== panelSections.length) {
      issues.push(`gap/panel mismatch: ${contentGaps.length} gaps vs ${panelSections.length} panels`)
    }

    // Check 2: each gap's bubbles are the panel immediately before it
    for (const gap of contentGaps) {
      if (gap.bubbles.length > 0) {
        const wrongBubbles = gap.bubbles.filter(b => b.panel_id !== gap.ownerPanelId)
        if (wrongBubbles.length > 0) {
          issues.push(`gap ${gap.id}: has bubbles from wrong panels (${[...new Set(wrongBubbles.map(b => b.panel_id))].join(',')})`)
        }
      }
    }

    // Check 3: panels with bubbles that are NOT assigned to any content gap
    const assignedBubblePanelIds = new Set(contentGaps.map(g => g.ownerPanelId))
    const panelIdsWithBubbles = new Set([...byPanel.keys()].filter(id => byPanel.get(id).length > 0))
    for (const pid of panelIdsWithBubbles) {
      if (!assignedBubblePanelIds.has(pid)) {
        issues.push(`panel ${pid} has bubbles but no gap assigned`)
      }
    }

    // Summary line
    const totalBubbles = bubbleList.length
    const bubblesInGaps = contentGaps.reduce((s, g) => s + g.bubbles.length, 0)
    const unassigned = totalBubbles - bubblesInGaps

    if (issues.length === 0) {
      ok.push(ep.episode_num)
    } else {
      bad.push({ ep: ep.episode_num, issues, panels: panelSections.length, gaps: contentGaps.length, bubbles: totalBubbles, unassigned })
    }
  }

  console.log(`=== RESULT ===`)
  console.log(`정상: ${ok.length}화   비정상: ${bad.length}화\n`)

  if (ok.length > 0) {
    const okStr = ok.map(n => `EP${String(n).padStart(2,'0')}`).join(' ')
    console.log(`정상 EP: ${okStr}\n`)
  }

  if (bad.length > 0) {
    console.log('비정상 EP 상세:')
    for (const b of bad) {
      console.log(`  EP${String(b.ep).padStart(2,'0')} — panels:${b.panels} gaps:${b.gaps} bubbles:${b.bubbles} unassigned:${b.unassigned}`)
      for (const iss of b.issues) console.log(`    ✗ ${iss}`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
