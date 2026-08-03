import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

// EP01 and EP31 비교
for (const epNum of [1, 31]) {
  const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', epNum).single()
  const { data: panels } = await supabase.from('kp_panels')
    .select('id, order_num, type, layout, height_ratio').eq('episode_id', ep.id).order('order_num')
  const { data: bubbles } = await supabase.from('kp_bubbles')
    .select('panel_id, order_num, y_pct, text').eq('episode_id', ep.id).order('order_num')

  console.log(`\n=== EP${String(epNum).padStart(2,'0')} ===`)
  const gapPanels = (panels ?? []).filter(p => p.type === 'gap')
  console.log(`Gap 수: ${gapPanels.length}`)
  for (const g of gapPanels) {
    const bs = (bubbles ?? []).filter(b => b.panel_id === g.id)
    console.log(`  gap order=${g.order_num} height_ratio=${g.height_ratio} bubbles=${bs.length}`)
    for (const b of bs) {
      console.log(`    yPct=${b.y_pct?.toFixed(1)} text="${(b.text ?? '').slice(0,15)}"`)
    }
  }
}
