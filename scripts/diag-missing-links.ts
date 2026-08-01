import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const CHECKS = [
  { epNum: 3,  keywords: ['있어요', '먹'] },
  { epNum: 33, keywords: ['사귀', '친구', '사귀고'] },
  { epNum: 54, keywords: ['가르쳐', '가르쳐줄', '가르쳐 줄', '쳐 줄'] },
  { epNum: 61, keywords: ['그렇게', '생각해', '저도'] },
]

async function main() {
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num')
    .in('episode_num', CHECKS.map(c => c.epNum))
  const epMap = new Map((eps ?? []).map((e: any) => [e.episode_num as number, e.id as number]))

  for (const { epNum, keywords } of CHECKS) {
    const epId = epMap.get(epNum)
    if (!epId) { console.log(`EP${epNum}: id 없음`); continue }
    const { data: rows } = await sb.from('kp_dialogues')
      .select('id, text_ko')
      .eq('episode_id', epId)
      .order('id')
    const all = (rows ?? []) as Array<{ id: number; text_ko: string }>
    console.log(`\n=== EP${epNum} (총 ${all.length}개 대사) ===`)
    for (const kw of keywords) {
      const hits = all.filter(r => r.text_ko?.includes(kw))
      if (hits.length === 0) continue
      console.log(`  '${kw}' 포함: ${hits.length}건`)
      hits.slice(0, 5).forEach(r => console.log(`    id=${r.id}  ${r.text_ko}`))
    }
    if (keywords.every(kw => all.filter(r => r.text_ko?.includes(kw)).length === 0)) {
      console.log(`  ※ 대사 없음 — 전체 목록 (앞 10개):`)
      all.slice(0, 10).forEach(r => console.log(`    id=${r.id}  ${r.text_ko}`))
    }
  }
}

main().catch(console.error)
