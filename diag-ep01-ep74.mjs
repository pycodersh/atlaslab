import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

// EP01: kp_bubbles.expression_id 직접 사용 (dialogue_id=null)
const { data: ep01 } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
const { data: ep01Bubs } = await sb.from('kp_bubbles')
  .select('expression_id, korean, highlight_text')
  .eq('episode_id', ep01.id)
  .not('expression_id', 'is', null)

const ep01ExprIds = [...new Set((ep01Bubs ?? []).map(b => b.expression_id))]
const { data: ep01Exprs } = await sb.from('kp_expressions').select('id, pattern').in('id', ep01ExprIds)

console.log('=== EP01 focus 표현 (kp_bubbles.expression_id 기준) ===')
for (const b of (ep01Bubs ?? [])) {
  const expr = (ep01Exprs ?? []).find(e => e.id === b.expression_id)
  console.log(`  expr_id=${b.expression_id}: pattern="${expr?.pattern}" matched="${b.highlight_text}" ko="${b.korean}"`)
}

// EP74: kp_dialogue_expressions 경유 (dialogue_id 기반)
const { data: ep74 } = await sb.from('kp_episodes').select('id').eq('episode_num', 74).single()
// dialogue들 가져오기
const { data: ep74Dlgs } = await sb.from('kp_dialogues').select('id').eq('episode_id', ep74.id)
const ep74DlgIds = (ep74Dlgs ?? []).map(d => d.id)

const { data: ep74Des } = await sb.from('kp_dialogue_expressions')
  .select('dialogue_id, expression_id, matched_text')
  .in('dialogue_id', ep74DlgIds)
  .eq('role', 'focus')

const ep74ExprIds = (ep74Des ?? []).map(d => d.expression_id)
const { data: ep74Exprs } = await sb.from('kp_expressions').select('id, pattern').in('id', ep74ExprIds)

console.log('\n=== EP74 focus 표현 (kp_dialogue_expressions 기준, 3개) ===')
for (const de of (ep74Des ?? [])) {
  const expr = (ep74Exprs ?? []).find(e => e.id === de.expression_id)
  console.log(`  expr_id=${de.expression_id}: pattern="${expr?.pattern}" matched="${de.matched_text}"`)
}
