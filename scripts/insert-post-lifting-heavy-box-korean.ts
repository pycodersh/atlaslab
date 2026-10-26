/**
 * blog_posts 단건 INSERT — 'lifting-heavy-box-korean' (엄마-아이 일상 표현, 29번)
 *
 * 요청서의 'Korean Phrases' 카테고리는 DB 에 그 이름으로 없다. Korean phrases 탭을 채우는 값은
 * 'Real-Life Korean'(28번 hotel-airport-shuttle-korea 등 45편)이라 그대로 쓴다 — 새 category 를 만들지 않는다.
 * ('Korean Phrases' 를 넣으면 lib/blog/sections 의 분류에서 Basics 탭으로 떨어진다.)
 * app / locale / tags 형식 / thumbnail(null — 유튜브 썸네일이 대신 쓰인다)도 28번을 따른다.
 *
 * published_at 은 직전 Korean phrases 글(최신)보다 뒤이고 현재보다 과거인지 검사한다.
 * 공개 글 수는 head:true count 가 조용히 null 을 줄 수 있어 null 이면 실패로 본다.
 *
 * 실행: npx tsx scripts/insert-post-lifting-heavy-box-korean.ts
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

const PROJECT_REF = 'eecvvgkihtcgfikaimao'
const PROD = 'https://www.atlaslabstudios.com'
const MD_PATH = path.resolve(process.cwd(), 'scripts', '_post-lifting-heavy-box-korean.md')

const POST = {
  slug:         'lifting-heavy-box-korean',
  locale:       'en',
  app:          'k-patto',
  category:     'Real-Life Korean',
  tags:         ['Korean phrases', 'parenting Korean', 'everyday Korean', 'children', 'mimetic words'],
  title:        '"Let me try!" — Praising your child\'s strength in Korean',
  description:  "How to express surprise at something heavy, volunteer to help, and praise a child's strength in natural Korean — with a look at vivid mimetic words.",
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: new Date(Date.now() - 2 * 60_000).toISOString().replace('.000Z', '+00:00'),
  is_paused:    false,
}

async function publicCount(): Promise<number> {
  const { count, error } = await sb
    .from('blog_posts')
    .select('id', { count: 'exact' })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
    .range(0, 0)
  if (error) throw new Error(`공개 글 수 조회 실패: ${error.message}`)
  if (count == null) throw new Error('공개 글 수가 null — 조회가 조용히 실패했다')
  return count
}

async function main() {
  const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]
  if (ref !== PROJECT_REF) { console.error(`⛔ Supabase 프로젝트가 ${ref} — patto(${PROJECT_REF})가 아니다, 중단`); process.exit(1) }

  console.log(`원고: ${POST.content.length} chars`)
  console.log(`YouTube 태그: ${POST.content.match(/<YouTube[^>]*\/>/g)?.join(', ')}`)
  const section = topicSectionKey(POST.app, POST.category)
  console.log(`섹션 판정: ${section}`)
  if (section !== 'phrases') { console.error('⛔ Korean phrases 탭이 아니다 — 중단'); process.exit(1) }

  // 이 category 값이 DB 에 이미 있는지(새 값을 만들지 않는다)
  const { data: catRows, error: catErr } = await sb
    .from('blog_posts').select('id').eq('app', POST.app).eq('category', POST.category).limit(1)
  if (catErr) throw catErr
  if (!catRows?.length) { console.error(`⛔ category '${POST.category}' 가 DB 에 없다 — 중단`); process.exit(1) }

  console.log(`published_at: ${POST.published_at}  (현재 ${new Date().toISOString()})`)
  const { data: prevData, error: prevErr } = await sb
    .from('blog_posts')
    .select('slug, published_at')
    .eq('app', 'k-patto').eq('category', 'Real-Life Korean')
    .order('published_at', { ascending: false }).limit(1)
  if (prevErr) throw prevErr
  const PREV = prevData![0].published_at as string
  if (new Date(POST.published_at).getTime() <= new Date(PREV).getTime()) {
    console.error(`⛔ published_at 이 직전 글(${prevData![0].slug} ${PREV})보다 앞 — 중단`); process.exit(1)
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

  const before = await publicCount()

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
  console.log(`2. ${html.includes('youtube.com/embed/iEVH80e5RIc') ? '✅' : '❌'} YouTube 임베드 (iEVH80e5RIc)`)

  const tables = (html.match(/<table/g) ?? []).length
  const cells = (html.match(/<td/g) ?? []).length
  // 원고의 표는 'Words to know' 하나(7행 x 3열 = 21셀).
  console.log(`3. ${tables === 1 && cells === 21 ? '✅' : '❌'} 표 ${tables}개 / 셀 ${cells}개 (원고 실측: 1개 / 21셀)`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const hits = (xml.match(new RegExp(POST.slug, 'g')) ?? []).length
  console.log(`4. ${hits === 1 ? '✅' : '❌'} 사이트맵 등재 ${hits}건`)

  const list = await fetch(`${PROD}/blog?tab=phrases`).then(r => r.text())
  console.log(`5. ${list.includes(POST.slug) ? '✅' : '❌'} Korean phrases 탭(/blog?tab=phrases)에 노출`)

  console.log(`6. (홈은 ISR 3600초 — 최대 1시간 지연, 판정에서 제외)`)

  const after = await publicCount()
  console.log(`7. ${after === before + 1 ? '✅' : '❌'} 공개 글 ${before} → ${after}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
