/**
 * 진단용 — 공개 글의 category 값 분포를 센다.
 * 읽기 전용. 실행: npx tsx scripts/_audit-blog-categories.ts
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

async function main() {
  const now = new Date().toISOString()

  const { data, error } = await sb
    .from('blog_posts')
    .select('category, app, locale, slug, content')
    .eq('is_paused', false)
    .lte('published_at', now)
    .order('published_at', { ascending: false })
  if (error) throw new Error(error.message)

  console.log(`공개 글 총합: ${data!.length}편\n`)

  const byCat = new Map<string, number>()
  for (const p of data!) {
    const k = p.category ?? '(null)'
    byCat.set(k, (byCat.get(k) ?? 0) + 1)
  }

  console.log('=== category 값 전체 ===')
  for (const [k, v] of [...byCat.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(3)}  ${k}`)
  }

  // locale/app 조합도 같이 본다
  const byLocaleApp = new Map<string, number>()
  for (const p of data!) {
    const k = `${p.locale}/${p.app}`
    byLocaleApp.set(k, (byLocaleApp.get(k) ?? 0) + 1)
  }
  console.log('\n=== locale/app ===')
  for (const [k, v] of [...byLocaleApp.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(3)}  ${k}`)
  }

  // <YouTube id="..." /> 를 가진 글 수
  const re = /<YouTube\s+id="([A-Za-z0-9_-]+)"/
  let withVideo = 0
  for (const p of data!) if (re.test(p.content ?? '')) withVideo++
  console.log(`\n=== <YouTube /> 포함 글: ${withVideo}편 / ${data!.length}편 ===`)

  // category 별로 영상 보유 수
  const vidByCat = new Map<string, number>()
  for (const p of data!) {
    if (!re.test(p.content ?? '')) continue
    const k = p.category ?? '(null)'
    vidByCat.set(k, (vidByCat.get(k) ?? 0) + 1)
  }
  for (const [k, v] of [...vidByCat.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(3)}  ${k}`)
  }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
