/**
 * kp_expressions.english 절단 확인 스크립트
 * npx tsx scripts/_check_english_truncation.ts
 */
import * as dotenv from 'dotenv'
import * as path   from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function main() {
  // 1) "완전 대세예요" 정확한 DB 값 확인
  const { data: match } = await sb
    .from('kp_expressions')
    .select('id, korean, english')
    .eq('korean', '완전 대세예요')
    .single()
  console.log('\n[1] 완전 대세예요 DB 값:')
  console.log('  korean :', match?.korean)
  console.log('  english:', match?.english)

  // 2) 구두점 없이 끝나는 항목 (절단 의심)
  const { data: all } = await sb
    .from('kp_expressions')
    .select('id, korean, english')
    .order('id')

  const endings = new Set(['.', '!', '?', ')', '"', '’', '”', '…', '~', "'", ';'])
  const truncated = (all ?? []).filter(r => {
    const e = (r.english ?? '').trim()
    return e.length > 0 && !endings.has(e.slice(-1))
  })

  console.log(`\n[2] 구두점 없이 끝나는 항목: ${truncated.length} / ${(all ?? []).length}`)
  console.log('\n샘플 15개:')
  truncated.slice(0, 15).forEach(r => {
    console.log(`  id=${r.id}  ko="${r.korean}"  en="${r.english}"`)
  })

  // 3) "This style is totally the" 검색
  const target = (all ?? []).filter(r => (r.english ?? '').includes('This style is totally the'))
  console.log(`\n[3] "This style is totally the" 포함 행: ${target.length}건`)
  target.forEach(r => console.log(`  id=${r.id}  ko="${r.korean}"  en="${r.english}"`))
}

main().catch(e => { console.error(e); process.exit(1) })
