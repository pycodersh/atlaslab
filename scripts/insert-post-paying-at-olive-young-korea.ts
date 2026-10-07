/**
 * blog_posts 단건 INSERT — 'paying-at-olive-young-korea' (여행 회화 20번)
 *
 * app / locale / category / tags 형식은 19번 asking-recommendations-olive-young-korea 를
 * 조회해 그대로 따른다: app='k-patto', locale='en', category='Real-Life Korean'
 * (Korean phrases 탭 — 새 category 를 만들지 않는다).
 * blog_posts 에는 썸네일 컬럼이 없고 요청서에도 이미지 지정이 없어 추가하지 않는다.
 *
 * published_at 은 직전 Korean phrases 글(최신)을 DB 에서 조회해 그보다 뒤인지 검사한다.
 *
 * 실행: npx tsx scripts/insert-post-paying-at-olive-young-korea.ts
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
const MD_PATH = path.resolve(process.cwd(), 'scripts', '_post-paying-at-olive-young-korea.md')

const POST = {
  slug:         'paying-at-olive-young-korea',
  locale:       'en',
  app:          'k-patto',
  category:     'Real-Life Korean',
  tags:         ['Olive Young', 'K-beauty', 'payment', 'shopping', 'travel Korean'],
  title:        'Paying at Olive Young',
  description:  'What staff ask at the Olive Young register, how to answer the bag and payment questions, and the one word that handles almost everything.',
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: new Date(Date.now() - 2 * 60_000).toISOString().replace('.000Z', '+00:00'),
  is_paused:    false,
}

async function main() {
  console.log(`원고: ${POST.content.length} chars`)
  console.log(`YouTube 태그: ${POST.content.match(/<YouTube[^>]*\/>/g)?.join(', ')}`)
  const section = topicSectionKey(POST.app, POST.category)
  console.log(`섹션 판정: ${section}`)
  if (section !== 'phrases') { console.error('⛔ Korean phrases 탭이 아니다 — 중단'); process.exit(1) }
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
  console.log(`2. ${html.includes('youtube.com/embed/uYKDHNaA-3c') ? '✅' : '❌'} YouTube 임베드`)

  const tables = (html.match(/<table/g) ?? []).length
  const cells = (html.match(/<td/g) ?? []).length
  // 원고의 표는 'Words to know'(6x3=18) = 1개 / 18셀.
  // 원고의 표는 Words to know 하나(6x3=18).
  console.log(`3. ${tables === 1 && cells === 18 ? '✅' : '❌'} 표 ${tables}개 / 셀 ${cells}개 (원고 실측: 1개 / 18셀)`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const hits = (xml.match(new RegExp(POST.slug, 'g')) ?? []).length
  console.log(`4. ${hits === 1 ? '✅' : '❌'} 사이트맵 등재 ${hits}건`)

  const list = await fetch(`${PROD}/blog?tab=phrases`).then(r => r.text())
  console.log(`5. ${list.includes(POST.slug) && list.includes('asking-recommendations-olive-young-korea') ? '✅' : '❌'} Korean phrases 탭에 19번 글과 함께 노출`)

  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`6. ${count === (before.count ?? 0) + 1 ? '✅' : '❌'} 공개 글 ${before.count} → ${count}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
