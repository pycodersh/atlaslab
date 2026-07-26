import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  const { data: focusDlgs } = await sb.from('kp_dialogue_expressions').select('dialogue_id, expression_id').eq('role', 'focus')
  const dlgIds = [...new Set((focusDlgs ?? []).map((r: any) => r.dialogue_id as number))]
  console.log('focus dialogue_ids:', dlgIds.length)

  const { data: dlgs } = await sb.from('kp_dialogues').select('id, episode_id, text_en').in('id', dlgIds)
  const episodeSet = new Set((dlgs ?? []).map((r: any) => r.episode_id as number))
  console.log('episodes with focus:', episodeSet.size)

  const withEn = (dlgs ?? []).filter((d: any) => d.text_en != null).length
  console.log('focus dialogues with text_en:', withEn, '/', dlgs?.length)

  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').in('id', [...episodeSet]).order('episode_num')
  const epCounts: Record<number, number> = {}
  ;(dlgs ?? []).forEach((d: any) => { epCounts[d.episode_id] = (epCounts[d.episode_id]||0)+1 })
  ;(eps ?? []).forEach((ep: any) => console.log(`EP${ep.episode_num} id=${ep.id} focus=${epCounts[ep.id]||0}`))

  const exprIds = [...new Set((focusDlgs ?? []).map((r: any) => r.expression_id as number))]
  console.log('\nunique expression_ids:', exprIds.length)
  const { data: exprs } = await sb.from('kp_expressions').select('id, examples').in('id', exprIds)
  const withEx = (exprs ?? []).filter((e: any) => e.examples && e.examples.length > 0).length
  console.log('expressions with examples:', withEx, '/', exprs?.length)
}
main().catch(console.error)
