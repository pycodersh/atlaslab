/**
 * blog_posts 단건 INSERT — 'where-are-trash-cans-in-seoul' (Life in Korea)
 *
 * Life in Korea 5편 배치의 4번째 글. app / locale / category 형식은 직전 Life 글을
 * 그대로 따른다. thumbnail 은 "이미지는 한꺼번에 작업하자"고 했으므로
 * COVER_BY_SLUG 에 등록하지 않는다.
 *
 * 실행: npx tsx scripts/insert-post-where-are-trash-cans-in-seoul.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { topicSectionKey } from '../lib/blog/sections'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const PROD = 'https://www.atlaslabstudios.com'
const MD_PATH = path.resolve(process.cwd(), 'scripts', '_post-where-are-trash-cans-in-seoul.md')

const POST = {
  slug:         'where-are-trash-cans-in-seoul',
  locale:       'en',
  app:          'k-patto',
  category:     'Korean Culture',
  tags:         ['Seoul Travel', 'Street Litter', 'Recycling Korea', 'Travel Etiquette'],
  title:        'Where Are the Trash Cans? How Tourists Deal with Street Litter in Seoul',
  description:  'Learn why public trash cans are absent on Seoul streets and how to legally dispose of trash using subways, convenience stores, and cafes.',
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: new Date(Date.now() - 2 * 60_000).toISOString().replace('.000Z', '+00:00'),
  is_paused:    false,
}

async function main() {
  console.log(`원고: ${POST.content.length} chars`)
  const section = topicSectionKey(POST.app, POST.category)
  console.log(`섹션 판정: ${section}`)
  if (section !== 'life') { console.error('⛔ Life in Korea 탭이 아니다 — 중단'); process.exit(1) }
  console.log(`published_at: ${POST.published_at}  (현재 ${new Date().toISOString()})`)

  const { data: prevData, error: prevErr } = await sb
    .from('blog_posts')
    .select('slug, published_at')
    .eq('app', 'k-patto').eq('category', 'Korean Culture')
    .order('published_at', { ascending: false }).limit(1)
  if (prevErr) throw prevErr
  const PREV = prevData![0].published_at as string
  if (new Date(POST.published_at).getTime() <= new Date(PREV).getTime()) {
    console.error(`⛔ published_at 이 직전 Life 글(${prevData![0].slug} ${PREV})보다 앞 — 중단`); process.exit(1)
  }
  if (new Date(POST.published_at).getTime() > Date.now()) {
    console.error('⛔ published_at 이 미래 — 중단'); process.exit(1)
  }

  const { data: existing, error: chkErr } = await sb
    .from('blog_posts')
    .select('slug, app, locale, is_paused')
    .eq('slug', POST.slug)
  if (chkErr) throw new Error(`충돌 확인 실패: ${chkErr.message}`)
  if (existing && existing.length) {
    console.error('⛔ slug 충돌 — 중단', JSON.stringify(existing)); process.exit(1)
  }
  console.log('✅ slug 충돌 없음')

  const before = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())

  const { data: row, error: insErr } = await sb
    .from('blog_posts')
    .insert(POST)
    .select('id, slug, app, locale, category, tags, published_at, is_paused')
    .single()
  if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)
  console.log('\n✅ INSERT 완료\n' + JSON.stringify(row, null, 2))

  // ── 확인 ──
  const url = `${PROD}/blog/${POST.locale}/${POST.app}/${POST.slug}`
  const res = await fetch(url)
  const html = await res.text()
  console.log(`\n1. ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}  ${url}`)

  const tables = (html.match(/<table/g) ?? []).length
  const cells = (html.match(/<td/g) ?? []).length
  console.log(`2. ${tables === 1 && cells === 12 ? '✅' : '❌'} 표 ${tables}개 / 셀 ${cells}개 (기대 1 / 12)`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const hits = (xml.match(new RegExp(POST.slug, 'g')) ?? []).length
  console.log(`3. ${hits === 1 ? '✅' : '❌'} 사이트맵 등재 ${hits}건`)

  const list = await fetch(`${PROD}/blog?tab=life`).then(r => r.text())
  console.log(`4. ${list.includes(POST.slug) ? '✅' : '❌'} Life in Korea 탭 노출`)

  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`5. ${count === (before.count ?? 0) + 1 ? '✅' : '❌'} 공개 글 ${before.count} → ${count}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
