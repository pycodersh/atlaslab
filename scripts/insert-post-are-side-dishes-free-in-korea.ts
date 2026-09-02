/**
 * blog_posts 단건 INSERT — 'are-side-dishes-free-in-korea'
 * locale='en', app='k-patto', is_paused=false
 *
 * content 는 원고 훼손을 막기 위해 별도 .md 파일에서 그대로 읽는다.
 * 실행: npx tsx scripts/insert-post-are-side-dishes-free-in-korea.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const PROD = 'https://www.atlaslabstudios.com'

const MD_PATH = path.resolve(
  process.cwd(),
  'scripts',
  '_post-are-side-dishes-free-in-korea.md'
)

const POST = {
  slug:         'are-side-dishes-free-in-korea',
  locale:       'en',
  app:          'k-patto',
  category:     'Real-Life Korean',
  tags:         ['banchan', 'restaurant', 'korean food', 'travel'],
  title:        'Are Side Dishes Free in Korea? (And How to Ask for More)',
  description:  "The small plates that arrive before your meal are free, and so are the refills. Here's how the system works and the one phrase you need to get more.",
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: '2026-09-02T00:00:00+00:00',
  is_paused:    false,
}

async function main() {
  console.log(`원고 로드: ${MD_PATH}`)
  console.log(`  ${POST.content.length} chars, ${POST.content.split('\n').length} lines`)

  // 1. slug 충돌 확인
  const { data: existing, error: chkErr } = await sb
    .from('blog_posts')
    .select('slug, app, locale, is_paused')
    .eq('slug', POST.slug)
  if (chkErr) throw new Error(`충돌 확인 실패: ${chkErr.message}`)

  if (existing && existing.length > 0) {
    console.error('\n⛔ slug 충돌 — 중단 (덮어쓰지 않음)')
    for (const e of existing) {
      console.error(`  slug=${e.slug} app=${e.app} locale=${e.locale} is_paused=${e.is_paused}`)
    }
    process.exit(1)
  }
  console.log('✅ slug 충돌 없음')

  // 2. INSERT
  const { data: inserted, error: insErr } = await sb
    .from('blog_posts')
    .insert(POST)
    .select('id, slug, app, locale, category, published_at, is_paused')
    .single()
  if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)

  console.log('\n✅ INSERT 완료')
  console.log(JSON.stringify(inserted, null, 2))

  // 3. HTTP 200 검증
  const url = `${PROD}/blog/${POST.locale}/${POST.app}/${POST.slug}`
  const res = await fetch(url)
  console.log(`\n── 페이지 검증 ──`)
  console.log(`  ${res.status === 200 ? '✅' : '❌'} ${res.status}  ${url}`)

  // 4. 사이트맵 등재 확인
  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  console.log(`  ${xml.includes(POST.slug) ? '✅' : '❌'} sitemap 등재`)

  // 5. 공개 글 총합
  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`\n공개 글 총합: ${count}편 (직전 86편 → 87편 예상)`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
