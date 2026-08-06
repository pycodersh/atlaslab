/**
 * kp_episodes title_en / slug 전수 확인
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data, error } = await sb
    .from('kp_episodes')
    .select('episode_num, title, title_en')
    .order('episode_num')

  if (error) { console.error(error); process.exit(1) }
  const rows = data ?? []
  console.log(`총 ${rows.length}행\n`)

  const noTitleEn: number[] = []
  const suspicious: { ep: number; field: string; val: string }[] = []

  for (const r of rows) {
    const ep = r.episode_num as number

    // title_en
    if (!r.title_en || String(r.title_en).trim() === '') {
      noTitleEn.push(ep)
    } else if (String(r.title_en).trim() === String(r.title).trim()) {
      suspicious.push({ ep, field: 'title_en', val: r.title_en })
    }


  }

  // 비어 있는 목록
  if (noTitleEn.length === 0) {
    console.log('✓ title_en: 전 화 채워짐')
  } else {
    console.log(`⚠ title_en 없음 (${noTitleEn.length}화): EP${noTitleEn.join(', EP')}`)
  }


  if (suspicious.length > 0) {
    console.log(`\n⚠ 의심 값:`)
    for (const s of suspicious) console.log(`  EP${String(s.ep).padStart(2,'0')} [${s.field}] = "${s.val}"`)
  }

  // EP01~30 샘플 출력
  console.log('\n── EP01~30 샘플 ──')
  for (const r of rows.filter(r => (r.episode_num as number) <= 30)) {
    const ep = String(r.episode_num).padStart(2, '0')
    const te = r.title_en ? `"${r.title_en}"` : '(없음)'
    console.log(`  EP${ep}  title="${r.title}"  title_en=${te}`)
  }
}
main().catch(e => { console.error(e); process.exit(1) })
