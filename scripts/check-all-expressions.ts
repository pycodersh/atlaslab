import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // 전체 expressions 덤프
  const { data, error } = await sb
    .from('kp_expressions')
    .select('id, korean, english, category, first_episode, structure')
    .order('id')

  if (error) { console.error(error); return }
  console.log(`총 ${data?.length}개`)

  // ~ 포함 여부
  const withTilde = data?.filter((r: any) => r.korean?.includes('~')) ?? []
  const noTilde = data?.filter((r: any) => !r.korean?.includes('~')) ?? []
  console.log(`~ 포함: ${withTilde.length}, ~ 없음: ${noTilde.length}`)

  // english이 korean과 다른 것
  const hasGloss = data?.filter((r: any) => r.english && r.english !== r.korean) ?? []
  console.log(`english ≠ korean (기존 gloss): ${hasGloss.length}`)
  hasGloss.forEach((r: any) => console.log(`  id=${r.id} | ${r.korean} → ${r.english}`))

  // structure 있는 것
  const hasStructure = data?.filter((r: any) => r.structure) ?? []
  console.log(`\nstructure 있음: ${hasStructure.length}`)
  hasStructure.slice(0, 10).forEach((r: any) => console.log(`  id=${r.id} | ${r.korean} | struct=${r.structure}`))

  // kp_bubbles의 expression_id 목록
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('expression_id, highlight_text, kp_episodes(episode_num)')
    .not('expression_id', 'is', null)
    .order('expression_id')
  console.log(`\nkp_bubbles expression 연결: ${bubbles?.length}개`)
  bubbles?.forEach((b: any) =>
    console.log(`  exp_id=${b.expression_id} ep=${b.kp_episodes?.episode_num} hl=${b.highlight_text}`)
  )

  // 전체 저장
  fs.writeFileSync('scripts/all-expressions.json', JSON.stringify(data, null, 2), 'utf-8')
  console.log('\n✅ all-expressions.json 저장')
}
main().catch(console.error)
