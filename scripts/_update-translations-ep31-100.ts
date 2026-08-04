/**
 * EP31-100 kp_bubbles.translations 업데이트
 * data/kpatto/source/ep31-100-translations.json → DB
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
  const raw = fs.readFileSync(
    path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', 'data/kpatto/source/ep31-100-translations.json'),
    'utf-8'
  )
  const items = JSON.parse(raw) as { id: number; en: string }[]

  console.log(`번역 항목: ${items.length}개`)

  // Batch update — 100 at a time
  const BATCH = 100
  let updated = 0
  let errors = 0

  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH)

    // Update each bubble individually (Supabase doesn't support bulk upsert by id easily)
    const results = await Promise.all(
      batch.map(item =>
        sb.from('kp_bubbles')
          .update({ translations: { en: item.en } })
          .eq('id', item.id)
      )
    )

    for (const r of results) {
      if (r.error) {
        console.error('  ERROR:', r.error.message)
        errors++
      } else {
        updated++
      }
    }

    console.log(`  진행: ${Math.min(i + BATCH, items.length)}/${items.length} (성공: ${updated}, 오류: ${errors})`)
  }

  console.log(`\n완료: ${updated}개 업데이트, ${errors}개 오류`)

  // Verify a few
  console.log('\nEP31 검증:')
  const ep31Ids = [1924, 1925, 1926, 1927, 1928]
  const { data: check } = await sb
    .from('kp_bubbles')
    .select('id,korean,translations')
    .in('id', ep31Ids)
  check?.forEach(b => {
    console.log(`  id=${b.id}: "${b.korean}" → "${b.translations?.en}"`)
  })
}

main().catch(e => { console.error(e); process.exit(1) })
