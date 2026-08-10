import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const now = new Date().toISOString()

  // 전체 수 (발행 상태 무관)
  const { data: all } = await sb
    .from('blog_posts')
    .select('id, locale, app, published_at')

  if (!all) { console.error('조회 실패'); process.exit(1) }

  const total = all.length
  const published = all.filter(r => r.published_at && r.published_at <= now).length
  const unpublished = total - published

  console.log(`\n=== blog_posts 전체 집계 ===`)
  console.log(`총 레코드: ${total}개  (발행: ${published}  미발행/예약: ${unpublished})`)

  // 앱별
  const byApp: Record<string, { total: number; published: number }> = {}
  for (const r of all) {
    if (!byApp[r.app]) byApp[r.app] = { total: 0, published: 0 }
    byApp[r.app].total++
    if (r.published_at && r.published_at <= now) byApp[r.app].published++
  }
  console.log(`\n--- 앱별 ---`)
  for (const [app, s] of Object.entries(byApp).sort((a, b) => b[1].total - a[1].total)) {
    console.log(`  ${app.padEnd(15)} 전체 ${s.total.toString().padStart(5)}  발행 ${s.published.toString().padStart(5)}`)
  }

  // 언어별 (발행 기준)
  const byLocale: Record<string, number> = {}
  for (const r of all.filter(r => r.published_at && r.published_at <= now)) {
    byLocale[r.locale] = (byLocale[r.locale] ?? 0) + 1
  }
  console.log(`\n--- 언어별 (발행 기준) ---`)
  for (const [locale, cnt] of Object.entries(byLocale).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${locale.padEnd(6)} ${cnt}`)
  }

  // 앱 × 언어 크로스탭 (발행 기준)
  const cross: Record<string, Record<string, number>> = {}
  for (const r of all.filter(r => r.published_at && r.published_at <= now)) {
    if (!cross[r.app]) cross[r.app] = {}
    cross[r.app][r.locale] = (cross[r.app][r.locale] ?? 0) + 1
  }
  const locales = [...new Set(all.map(r => r.locale))].sort()
  console.log(`\n--- 앱 × 언어 (발행 기준) ---`)
  console.log(`${''.padEnd(16)}${locales.map(l => l.padStart(6)).join('')}   합계`)
  for (const [app, lmap] of Object.entries(cross).sort((a, b) =>
    Object.values(b[1]).reduce((s, v) => s + v, 0) - Object.values(a[1]).reduce((s, v) => s + v, 0)
  )) {
    const counts = locales.map(l => (lmap[l] ?? 0).toString().padStart(6))
    const rowTotal = Object.values(lmap).reduce((s, v) => s + v, 0)
    console.log(`  ${app.padEnd(14)} ${counts.join('')}   ${rowTotal}`)
  }

  // 최근 발행 5건
  const recent = all
    .filter(r => r.published_at && r.published_at <= now)
    .sort((a, b) => b.published_at.localeCompare(a.published_at))
    .slice(0, 5)
  console.log(`\n--- 최근 발행 5건 ---`)
  for (const r of recent) {
    console.log(`  [${r.locale}] ${r.app.padEnd(14)} ${r.published_at.slice(0,10)}  id=${r.id}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
