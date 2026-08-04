import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
const { data: bs } = await sb.from('kp_bubbles')
  .select('id, order_num, korean, position, expression_id, dialogue_id')
  .eq('episode_id', ep.id).order('order_num')

for (const b of (bs ?? [])) {
  const pos = b.position ? `x=${b.position.xPct},y=${b.position.yPct}` : 'null'
  const ko = (b.korean ?? '').slice(0, 25)
  console.log(`id=${b.id} dlg=${b.dialogue_id} expr=${b.expression_id} pos=${pos} txt="${ko}"`)
}

// dialogue_expressions 확인
const dlgIds = (bs ?? []).filter(b => b.dialogue_id).map(b => b.dialogue_id)
if (dlgIds.length > 0) {
  const { data: des } = await sb.from('kp_dialogue_expressions')
    .select('dialogue_id, expression_id, matched_text, role')
    .in('dialogue_id', dlgIds)
  console.log('\nkp_dialogue_expressions:')
  for (const de of (des ?? [])) {
    console.log(`  dlg=${de.dialogue_id} expr=${de.expression_id} role=${de.role} match="${de.matched_text}"`)
  }
}
