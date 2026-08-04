import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

// EP03 에피소드 ID 찾기
const { data: ep } = await sb.from('kp_episodes').select('id, episode_num, title').eq('episode_num', 3).single()
console.log('EP03:', ep)

// kp_panels에서 EP03 패널 목록
const { data: panels } = await sb.from('kp_panels').select('*').eq('episode_id', ep.id).order('order_num')
console.log(`\nkp_panels (${panels?.length}개):`)
for (const p of panels ?? []) {
  console.log(`  order_num=${p.order_num}  image_url=${p.image_url}  layout=${p.layout}  id=${p.id}`)
}

// kp_bubbles에서 EP03 버블 목록 (panel_id로 그루핑)
const { data: bubbles } = await sb.from('kp_bubbles').select('id, panel_id, korean, order_num').eq('episode_id', ep.id).order('order_num')
console.log(`\nkp_bubbles (${bubbles?.length}개):`)
for (const b of bubbles ?? []) {
  console.log(`  panel_id=${b.panel_id}  order=${b.order_num}  ko="${b.korean?.slice(0,20)}"`)
}

// kp_sections (있으면)
const { data: sections, error: secErr } = await sb.from('kp_sections').select('*').eq('episode_id', ep.id).order('order_num')
if (!secErr && sections) {
  console.log(`\nkp_sections (${sections.length}개):`)
  for (const s of sections) console.log(`  order=${s.order_num}  type=${s.type}  panel_id=${s.panel_id}  height_ratio=${s.height_ratio}`)
}
