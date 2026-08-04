import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num',1).single()
  const { data: panels } = await sb.from('kp_panels').select('id,order_num,layout').eq('episode_id', ep!.id).order('order_num')
  const { data: bubbles } = await sb.from('kp_bubbles').select('id,order_num,korean,english,dialogue_id').eq('episode_id', ep!.id).order('order_num')

  // 스키마 확인: kp_bubbles 샘플 (다른 EP에서)
  const { data: bubbleSample } = await sb.from('kp_bubbles').select('*').limit(1)
  const { data: challengeSample } = await sb.from('kp_challenges').select('*').limit(1)
  const { data: panelSample } = await sb.from('kp_panels').select('*').limit(1)

  console.log('=== kp_bubbles 컬럼 ===', Object.keys(bubbleSample?.[0]??{}))
  console.log('=== kp_challenges 컬럼 ===', Object.keys(challengeSample?.[0]??{}))
  console.log('=== kp_panels 컬럼 ===', Object.keys(panelSample?.[0]??{}))

  console.log('\n=== kp_panels EP01 ===')
  for (const p of panels??[]) console.log(`  [${(p as any).order_num}] layout=${JSON.stringify((p as any).layout)}`)

  console.log('\n=== kp_bubbles EP01 ===')
  if (!bubbles?.length) console.log('  (없음)')
  for (const b of bubbles??[]) console.log(`  [${(b as any).order_num}] dlg=${(b as any).dialogue_id} panel=${(b as any).panel_id} "${(b as any).korean}"`)

  // 다른 EP의 kp_bubbles 샘플 (구조 파악)
  const { data: bubbleOther } = await sb.from('kp_bubbles').select('*').not('episode_id', 'eq', ep!.id).limit(3)
  console.log('\n=== 다른 EP kp_bubbles 샘플 ===')
  for (const b of bubbleOther??[]) console.log(' ', JSON.stringify(b))

  // kp_challenges 샘플 (다른 EP)
  const { data: chalOther } = await sb.from('kp_challenges').select('*').not('episode_id', 'eq', ep!.id).limit(2)
  console.log('\n=== 다른 EP kp_challenges 샘플 ===')
  for (const c of chalOther??[]) console.log(' ', JSON.stringify(c))
}
main().catch(console.error)
