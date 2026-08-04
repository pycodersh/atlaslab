/**
 * [1-1] position=null 전수 진단 + 좌표 중복 버블 집계
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
const { data: allBubbles } = await sb.from('kp_bubbles').select('id, episode_id, panel_id, order_num, position')

const bubByEp = new Map()
for (const b of (allBubbles ?? [])) {
  if (!bubByEp.has(b.episode_id)) bubByEp.set(b.episode_id, [])
  bubByEp.get(b.episode_id).push(b)
}

const rows = []
for (const ep of (eps ?? [])) {
  const bs = bubByEp.get(ep.id) ?? []
  const nullPos = bs.filter(b => b.position === null).length

  // 같은 panel_id 안에서 (xPct, yPct) 좌표가 동일한 버블 찾기
  const byPanel = new Map()
  for (const b of bs) {
    const key = b.panel_id
    if (!byPanel.has(key)) byPanel.set(key, [])
    byPanel.get(key).push(b)
  }
  let dupCount = 0
  for (const [, panelBubs] of byPanel) {
    const coords = panelBubs.map(b => {
      const x = b.position?.xPct ?? 0
      const y = b.position?.yPct ?? 0
      return `${x},${y}`
    })
    const seen = new Set()
    for (const c of coords) {
      if (seen.has(c)) dupCount++
      seen.add(c)
    }
  }

  if (nullPos > 0 || dupCount > 0) {
    rows.push({ ep: ep.episode_num, total: bs.length, nullPos, dupCount })
  }
}

if (rows.length === 0) {
  console.log('전체 정상 — position null 및 좌표 중복 없음')
} else {
  console.log('EP  | 전체 버블 | position null | 좌표 중복')
  console.log('----+-----------+--------------+-----------')
  for (const r of rows) {
    console.log(`EP${String(r.ep).padStart(2,'0')} | ${String(r.total).padStart(9)} | ${String(r.nullPos).padStart(12)} | ${r.dupCount}`)
  }
}

// EP01 현재 상태 상세
const { data: ep01 } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
if (ep01) {
  const { data: dlgs } = await sb.from('kp_dialogues').select('id, text_ko, order_num').eq('episode_id', ep01.id).order('order_num')
  const { data: panels } = await sb.from('kp_panels').select('id, order_num, type').eq('episode_id', ep01.id).order('order_num')
  const { data: bubs } = await sb.from('kp_bubbles').select('id, panel_id, order_num, position').eq('episode_id', ep01.id).order('order_num')
  console.log(`\n=== EP01 현재 상태 ===`)
  console.log(`kp_dialogues: ${dlgs?.length}건`)
  console.log(`kp_panels: ${panels?.length}건 (gap=${panels?.filter(p=>p.type==='gap').length})`)
  console.log(`kp_bubbles: ${bubs?.length}건`)
  console.log(`  - position null: ${bubs?.filter(b=>b.position===null).length}건`)
  const gapNums = panels?.filter(p=>p.type==='gap').map(p=>p.order_num).join(',')
  console.log(`  - gap order_nums: ${gapNums}`)
  console.log(`\n대사 목록:`)
  for (const d of dlgs??[]) {
    console.log(`  [${d.order_num}] ${d.text_ko}`)
  }
}
