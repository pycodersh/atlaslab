import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = Object.fromEntries(
  readFileSync('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

// Check EP31 panel layouts to see if split panels exist
const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 31).single()
const { data: panels } = await supabase.from('kp_panels').select('id,order_num,type,layout').eq('episode_id', ep.id).order('order_num')
console.log('EP31 all panels:')
for (const p of panels) {
  console.log(`  order=${p.order_num} type=${p.type} layout=${p.layout}`)
}

// Also check layout distribution across EP31-100
const { data: episodes } = await supabase.from('kp_episodes').select('id,episode_num').gte('episode_num', 31).lte('episode_num', 100)
const layoutCounts = new Map()
for (const ep of episodes) {
  const { data: ps } = await supabase.from('kp_panels').select('layout,type').eq('episode_id', ep.id).eq('type', 'panel')
  for (const p of (ps ?? [])) {
    const lay = p.layout ?? 'null'
    layoutCounts.set(lay, (layoutCounts.get(lay) ?? 0) + 1)
  }
}
console.log('\nLayout distribution across EP31-100 (image panels only):')
for (const [layout, count] of [...layoutCounts.entries()].sort((a,b) => b[1]-a[1])) {
  console.log(`  ${layout}: ${count}`)
}
