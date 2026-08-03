import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 31).single()
const { data: rows } = await supabase.from('kp_panels')
  .select('id, order_num, type, layout').eq('episode_id', ep.id).order('order_num').limit(40)

console.log('EP31 raw rows (first 40, sorted by order_num):')
for (const r of rows) {
  console.log(`  order=${String(r.order_num).padStart(3)} type=${r.type.padEnd(5)} layout=${r.layout ?? 'wide'}`)
}

// Show what row-grouping would produce
const panelList = rows
const imgPanels = panelList.filter(p => p.type === 'panel')
const sortedGaps = [...panelList.filter(p => p.type === 'gap')].sort((a, b) => a.order_num - b.order_num)

console.log('\nGaps sorted by order_num:')
for (const g of sortedGaps.slice(0, 15)) {
  console.log(`  gap order=${g.order_num}`)
}

// Build rows
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

console.log('\nRow summary (first 10 rows):')
for (const row of rowsL.slice(0, 10)) {
  const orders = row.map(p => p.order_num)
  const lastOrd = orders[orders.length - 1]
  const firstOrd = orders[0]
  const exactMatch = sortedGaps.find(g => g.order_num === lastOrd)
  const gteMatch = sortedGaps.find(g => g.order_num >= lastOrd)
  console.log(`  row orders=[${orders.join(',')}] lastOrd=${lastOrd} === match:${exactMatch ? exactMatch.order_num : 'NONE'} >= match:${gteMatch ? gteMatch.order_num : 'NONE'}`)
}
