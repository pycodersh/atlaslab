/**
 * EP31-100 번역 필요 버블 목록 추출
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // EP31-100 episodes
  const { data: eps } = await sb
    .from('kp_episodes')
    .select('id,episode_num,title')
    .gte('episode_num', 31)
    .lte('episode_num', 100)
    .order('episode_num')

  if (!eps) { console.log('no episodes'); return }

  const epIds = eps.map(e => e.id)
  const epMap = new Map(eps.map(e => [e.id as number, e as { id: number; episode_num: number; title: string }]))

  // Fetch all bubbles for EP31-100
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id,episode_id,order_num,speaker,korean,translations,dialogue_id')
    .in('episode_id', epIds)
    .order('episode_id')
    .order('order_num')

  const all = (bubbles ?? []) as {
    id: number; episode_id: number; order_num: number;
    speaker: string | null; korean: string; translations: Record<string,string> | null;
    dialogue_id: number | null
  }[]

  // Also fetch dialogues for reference
  const dlgIds = all.filter(b => b.dialogue_id).map(b => b.dialogue_id!)
  const { data: dlgs } = await sb.from('kp_dialogues').select('id,text_ko').in('id', dlgIds)
  const dlgMap = new Map((dlgs ?? []).map(d => [d.id as number, d.text_ko as string]))

  const needsTranslation = all.filter(b => !b.translations || !b.translations['en'])
  const hasTranslation   = all.filter(b =>  b.translations?.['en'])

  console.log(`EP31-100 버블 총계: ${all.length}`)
  console.log(`translations 없음:  ${needsTranslation.length}`)
  console.log(`translations 있음:  ${hasTranslation.length}`)
  console.log('')

  // Group by episode
  const byEp = new Map<number, typeof needsTranslation>()
  for (const b of needsTranslation) {
    const list = byEp.get(b.episode_id) ?? []
    list.push(b)
    byEp.set(b.episode_id, list)
  }

  // Print episode-by-episode summary
  for (const ep of eps) {
    const list = byEp.get(ep.id) ?? []
    if (list.length > 0) {
      console.log(`EP${String(ep.episode_num).padStart(2,'0')} (ep_id=${ep.id}) "${ep.title}": ${list.length}개`)
    }
  }

  console.log('')

  // Export as JSON for translation work
  const output = needsTranslation.map(b => {
    const ep = epMap.get(b.episode_id)!
    const text = b.dialogue_id ? (dlgMap.get(b.dialogue_id) ?? b.korean) : b.korean
    return {
      id: b.id,
      ep: ep.episode_num,
      order: b.order_num,
      speaker: b.speaker,
      korean: b.korean,
      dialogue_text: text,  // resolved from kp_dialogues if available
      has_dialogue_id: b.dialogue_id != null,
    }
  })

  const outPath = path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', 'data/kpatto/source/ep31-100-needs-translation.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`\n저장: ${outPath} (${output.length}개)`)
}

main().catch(e => { console.error(e); process.exit(1) })
