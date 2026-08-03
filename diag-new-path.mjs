/**
 * diag-new-path.mjs
 * NEW hasOrderConflict 경로 시뮬레이션 진단 (EP31-100)
 *
 * 올바른 "정상" 기준:
 * 1. 첫 섹션이 gap (gap→panel 순서, 첫 섹션이 panel이면 오류) [hasOrderConflict 에피소드만]
 * 2. 모든 말풍선이 배정됨 (assignedBubbles = totalBubbles)
 *
 * 참고: gap이 없는 row는 정상 (trailing gap이 에피소드 하단에 별도 배치)
 * 로직: gap.order_num >= lastOrd (첫 번째 매칭), gap은 row 앞에 배치
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

console.log(`Checking EP${episodes[0].episode_num}~EP${episodes.at(-1).episode_num} (${episodes.length}화)\n`)

const results = []

for (const ep of episodes) {
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
  const totalBubbles = (bubbles ?? []).length

  const gapOrderSet = new Set(panelList.filter(p => p.type === 'gap').map(p => p.order_num))
  const hasOrderConflict = panelList.some(p => p.type === 'panel' && gapOrderSet.has(p.order_num))

  const sections = []
  let rowCount = 0

  if (!hasGaps || !hasOrderConflict) {
    for (const p of panelList) {
      if (p.type === 'gap') {
        sections.push({ type: 'gap', dbId: p.id, bubbleCount: (byPanel.get(p.id) ?? []).length })
      } else if (p.type === 'panel') {
        sections.push({ type: 'panel' })
      }
    }
  } else {
    const imgPanels = panelList.filter(p => p.type === 'panel')
    const sortedGapRows = [...panelList.filter(p => p.type === 'gap')].sort((a, b) => a.order_num - b.order_num)

    const rowsL = []
    let curL = [], wSumL = 0
    for (const p of imgPanels) {
      const lay = (p.layout ?? 'wide')
      if (lay === 'wide') {
        if (curL.length) { rowsL.push(curL); curL = []; wSumL = 0 }
        rowsL.push([p])
      } else if (lay.startsWith('split:')) {
        curL.push(p); wSumL += parseFloat(lay.slice(6))
        if (wSumL >= 99) { rowsL.push(curL); curL = []; wSumL = 0 }
      } else if (lay.startsWith('stack-t:')) {
        curL.push(p); wSumL += parseFloat(lay.slice(8))
      } else if (lay === 'stack-b') {
        curL.push(p); rowsL.push(curL); curL = []; wSumL = 0
      }
    }
    if (curL.length) rowsL.push(curL)

    rowCount = rowsL.length
    const gapQ = [...sortedGapRows]

    for (const row of rowsL) {
      const lastOrd = row[row.length - 1].order_num
      // gap.order_num >= lastOrd 중 첫 번째 매칭 (분리된 wide 패널도 커버)
      const gi = gapQ.findIndex(g => g.order_num >= lastOrd)
      if (gi >= 0) {
        const [gRow] = gapQ.splice(gi, 1)
        // gap이 row 앞에 배치 (대화→장면 순서)
        sections.push({ type: 'gap', dbId: gRow.id, bubbleCount: (byPanel.get(gRow.id) ?? []).length })
      }
      // gap 없는 row는 정상 (trailing gap이 에피소드 끝에 별도 배치)
      for (const rp of row) {
        sections.push({ type: 'panel' })
      }
    }

    for (const gRow of gapQ) {
      sections.push({ type: 'gap', dbId: gRow.id, bubbleCount: (byPanel.get(gRow.id) ?? []).length, trailing: true })
    }
  }

  const panelCount = sections.filter(s => s.type === 'panel').length
  const assignedBubbles = sections.filter(s => s.type === 'gap').reduce((s, g) => s + g.bubbleCount, 0)
  const trailingCount = sections.filter(s => s.type === 'gap' && s.trailing).length
  const firstType = sections[0]?.type

  const issues = []
  if (hasOrderConflict && firstType === 'panel') issues.push(`첫 섹션이 panel (gap이어야 함)`)
  if (assignedBubbles !== totalBubbles) issues.push(`말풍선 배정 ${assignedBubbles}/${totalBubbles}`)

  results.push({
    ep: ep.episode_num,
    hasOrderConflict,
    panels: panelCount,
    rows: rowCount,
    trailing: trailingCount,
    bubbles: totalBubbles,
    assignedBubbles,
    issues,
  })
}

// === Summary ===
const ok = results.filter(r => r.issues.length === 0)
const bad = results.filter(r => r.issues.length > 0)

console.log(`=== NEW PATH 진단 결과 ===`)
console.log(`정상 ${ok.length}화 / 비정상 ${bad.length}화\n`)

if (bad.length > 0) {
  const patterns = new Map()
  for (const r of bad) {
    const key = r.issues.join(' | ')
    if (!patterns.has(key)) patterns.set(key, [])
    patterns.get(key).push(r.ep)
  }
  console.log('비정상 유형:')
  for (const [pattern, eps] of patterns) {
    console.log(`  [${pattern}]`)
    console.log(`    EP: ${eps.map(n => String(n).padStart(2,'0')).join(' ')}`)
  }
} else {
  console.log('전체 정상!')
}

const totalTrailing = results.reduce((s, r) => s + r.trailing, 0)
const withTrailing = results.filter(r => r.trailing > 0).length
const withConflict = results.filter(r => r.hasOrderConflict).length
console.log(`\n[참고] hasOrderConflict 경로: ${withConflict}화`)
console.log(`[참고] trailing gap: ${withTrailing}화에서 ${totalTrailing}개 (하단 보존)`)
