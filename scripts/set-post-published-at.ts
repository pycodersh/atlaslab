/**
 * blog_posts 의 published_at 만 변경한다. 다른 컬럼은 건드리지 않는다.
 *
 * 실행: npx tsx scripts/set-post-published-at.ts <slug> <ISO시각>
 * 예:   npx tsx scripts/set-post-published-at.ts \
 *         korean-restaurant-call-bell 2026-09-03T00:00:00+00:00
 *
 * slug 가 0건이거나 2건 이상이면 중단한다.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const [slug, publishedAt] = process.argv.slice(2)
if (!slug || !publishedAt) {
  console.error('사용법: npx tsx scripts/set-post-published-at.ts <slug> <ISO시각>')
  process.exit(1)
}

if (Number.isNaN(Date.parse(publishedAt))) {
  console.error(`⛔ 시각 파싱 실패: ${publishedAt}`)
  process.exit(1)
}

async function main() {
  const { data: rows, error: selErr } = await sb
    .from('blog_posts')
    .select('id, slug, app, locale, is_paused, published_at')
    .eq('slug', slug)
  if (selErr) throw new Error(`조회 실패: ${selErr.message}`)

  if (!rows || rows.length === 0) {
    console.error(`⛔ slug '${slug}' 없음 — 중단`)
    process.exit(1)
  }
  if (rows.length > 1) {
    console.error(`⛔ slug '${slug}' 가 ${rows.length}건 — 모호해서 중단`)
    process.exit(1)
  }

  const row = rows[0]
  console.log(`대상: ${row.app}/${row.locale}/${row.slug}  (id=${row.id})`)
  console.log(`  before: ${row.published_at}`)
  console.log(`  after : ${publishedAt}`)
  console.log(`  is_paused: ${row.is_paused}`)

  const { error: updErr } = await sb
    .from('blog_posts')
    .update({ published_at: publishedAt })
    .eq('id', row.id)
  if (updErr) throw new Error(`UPDATE 실패: ${updErr.message}`)

  // 반영 확인 — published_at 외 컬럼이 그대로인지도 같이 본다
  const { data: after, error: verErr } = await sb
    .from('blog_posts')
    .select('id, slug, app, locale, category, tags, title, is_paused, published_at')
    .eq('id', row.id)
    .single()
  if (verErr) throw new Error(`검증 조회 실패: ${verErr.message}`)

  console.log('\n✅ UPDATE 완료')
  console.log(JSON.stringify(after, null, 2))

  const now = new Date().toISOString()
  const live = new Date(after!.published_at).toISOString() <= now && after!.is_paused === false
  console.log(`\n현재 시각: ${now}`)
  console.log(live ? '✅ 공개 조건 충족 (published_at <= now, is_paused=false)' : '⚠️ 아직 공개 조건 미충족')

  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', now)
  console.log(`공개 글 총합: ${count}편`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
