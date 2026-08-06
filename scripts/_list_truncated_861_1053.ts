/**
 * id 861–1053 구간 절단된 english 목록 추출
 * 출력: id / pattern_ko / 현재english / description 앞100자 / examples[0].ko·en / slug 유무
 * 정렬: slug 있는 것 우선, 그다음 id 순
 * npx tsx scripts/_list_truncated_861_1053.ts
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
  // ── 1. kp_expressions: id 861~1053 ──────────────────────────────────────────
  const { data: exprs, error: e1 } = await sb
    .from('kp_expressions')
    .select('id, korean, english, slug, description')
    .gte('id', 861)
    .lte('id', 1053)
    .order('id')

  if (e1) { console.error(e1.message); process.exit(1) }

  // 절단 기준: 구두점 없이 끝나는 것
  const endings = new Set(['.', '!', '?', ')', '"', '’', '”', '…', '~', "'", ';'])
  const truncated = (exprs ?? []).filter(r => {
    const e = (r.english ?? '').trim()
    return e.length > 0 && !endings.has(e.slice(-1))
  })

  console.log(`\nid 861–1053 절단 건수: ${truncated.length}건 (전체 ${(exprs ?? []).length}건 중)\n`)

  // ── 2. kp_bubbles: examples[0] (expression_id 연결된 첫 번째 버블) ───────────
  const ids = truncated.map(r => r.id)
  const { data: bubblesRaw, error: e2 } = await sb
    .from('kp_bubbles')
    .select('expression_id, korean, translations, id')
    .in('expression_id', ids)
    .order('id')

  if (e2) { console.error(e2.message); process.exit(1) }

  // expression_id → 첫 번째 버블 (id 오름차순 → 첫 번째가 맥락상 첫 예문)
  const firstEx = new Map<number, { ko: string; en: string }>()
  for (const b of bubblesRaw ?? []) {
    if (!firstEx.has(b.expression_id)) {
      const en = (b.translations as { en?: string } | null)?.en ?? ''
      firstEx.set(b.expression_id, { ko: b.korean ?? '', en })
    }
  }

  // ── 3. 정렬: slug 있는 것 우선 ────────────────────────────────────────────────
  const sorted = [...truncated].sort((a, b) => {
    const aHasSlug = a.slug ? 1 : 0
    const bHasSlug = b.slug ? 1 : 0
    if (bHasSlug !== aHasSlug) return bHasSlug - aHasSlug   // slug 있는 것 먼저
    return a.id - b.id
  })

  // ── 4. 30건씩 3묶음으로 출력 ──────────────────────────────────────────────────
  const CHUNK = 30
  for (let chunk = 0; chunk < 3; chunk++) {
    const slice = sorted.slice(chunk * CHUNK, (chunk + 1) * CHUNK)
    if (!slice.length) break

    console.log(`\n${'═'.repeat(80)}`)
    console.log(`  묶음 ${chunk + 1}  (${chunk * CHUNK + 1}–${Math.min((chunk + 1) * CHUNK, sorted.length)}번째)`)
    console.log(`${'═'.repeat(80)}\n`)

    for (const r of slice) {
      const ex     = firstEx.get(r.id)
      const desc   = (r.description ?? '').slice(0, 100)
      const hasSlug = r.slug ? '✅' : '❌'

      console.log(`─── id=${r.id}  slug ${hasSlug} ───────────────`)
      console.log(`  korean     : ${r.korean}`)
      console.log(`  english    : ${r.english}`)
      console.log(`  description: ${desc || '(없음)'}`)
      if (ex) {
        console.log(`  ex.ko      : ${ex.ko}`)
        console.log(`  ex.en      : ${ex.en}`)
      } else {
        console.log(`  ex         : (없음)`)
      }
      console.log()
    }
  }

  // ── 5. 요약 ────────────────────────────────────────────────────────────────────
  const withSlug    = sorted.filter(r => r.slug).length
  const withoutSlug = sorted.filter(r => !r.slug).length
  const withEx      = sorted.filter(r => firstEx.has(r.id)).length

  console.log(`\n${'═'.repeat(80)}`)
  console.log(`  요약`)
  console.log(`  slug 있음: ${withSlug}건  /  없음: ${withoutSlug}건`)
  console.log(`  예문 있음: ${withEx}건   /  없음: ${sorted.length - withEx}건`)
  console.log(`${'═'.repeat(80)}\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
