/**
 * kp_bubbles.translations 상태 확인 (EP01-30 vs EP31-100)
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  // 에피소드 id→num 매핑
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num')
  const epNumById = new Map((eps ?? []).map(e => [e.id as number, e.episode_num as number]))

  // 전체 버블 조회
  const { data: bubbles } = await sb.from('kp_bubbles').select('id, episode_id, korean, translations')
  const list = (bubbles ?? []) as { id: number; episode_id: number; korean: string; translations: Record<string, string> | null }[]

  let ep130_total = 0, ep130_has = 0
  let ep31100_total = 0, ep31100_has = 0

  for (const b of list) {
    const epNum = epNumById.get(b.episode_id) ?? 0
    const hasEn = b.translations != null && typeof b.translations?.en === 'string' && b.translations.en.trim() !== ''
    if (epNum <= 30) {
      ep130_total++
      if (hasEn) ep130_has++
    } else {
      ep31100_total++
      if (hasEn) ep31100_has++
    }
  }

  console.log('\n=== kp_bubbles 번역 상태 ===')
  console.log(`구간      | 전체  | 번역있음 | 번역없음`)
  console.log(`EP01-30   | ${ep130_total.toString().padStart(5)} | ${ep130_has.toString().padStart(8)} | ${(ep130_total - ep130_has).toString().padStart(8)}`)
  console.log(`EP31-100  | ${ep31100_total.toString().padStart(5)} | ${ep31100_has.toString().padStart(8)} | ${(ep31100_total - ep31100_has).toString().padStart(8)}`)

  // EP31-100 샘플 확인 (번역 있는 것)
  const samples31 = list.filter(b => (epNumById.get(b.episode_id) ?? 0) > 30 && b.translations?.en)
  if (samples31.length > 0) {
    console.log(`\nEP31+ 번역 있는 샘플 3개:`)
    for (const b of samples31.slice(0, 3)) {
      console.log(`  ko: "${b.korean?.slice(0,30)}" → en: "${b.translations?.en?.slice(0,40)}"`)
    }
  }

  // kp_dialogues 번역 확인 (EP31-100)
  const { data: dlgs } = await sb.from('kp_dialogues').select('id, episode_id, text_ko, text_en').limit(5)
  const dlgList = (dlgs ?? []) as { id: number; episode_id: number; text_ko: string; text_en: string | null }[]
  const hasTextEn = dlgList.some(d => d.text_en != null)
  console.log(`\nkp_dialogues 컬럼: text_en ${hasTextEn ? '있음' : '없음/null'}`)
  if (dlgList.length > 0) {
    console.log(`  샘플: ${JSON.stringify(dlgList[0])}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
