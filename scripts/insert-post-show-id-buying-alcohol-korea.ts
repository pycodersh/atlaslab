/**
 * blog_posts 단건 INSERT — 'show-id-buying-alcohol-korea' (여행 회화 22번)
 *
 * app / locale / category / tags 형식은 기존 편의점 글 두 편
 * (need-a-bag-korean-checkout, cup-ramen-convenience-store-korea,
 *  one-plus-one-convenience-store-korea)을 조회해 그대로 따른다.
 *   app='k-patto', locale='en', category='Real-Life Korean'
 *   tags = [장소, 주제, "travel", "korean phrases"] — 소문자 4개
 * blog_posts 에는 썸네일 컬럼이 없다. 카드·상단 썸네일은 본문 <YouTube /> 에서 뽑힌다.
 * 영상 N7zAyflTwGg 는 oEmbed 로 사전 확인했다
 * ("When the cashier asks for your ID and makes your whole week", K-PATTO 채널).
 *
 * published_at 은 오늘 00:00 UTC 가 이미 지났으면 그 값, 아니면 어제 00:00 UTC.
 * 21번(2026-09-17T00:00Z)보다 뒤여야 목록 순서가 유지된다 — 아래에서 검사한다.
 * (미래 시각이면 목록·사이트맵의 lte(now) 조건에서 빠진다)
 *
 * 실행: npx tsx scripts/insert-post-show-id-buying-alcohol-korea.ts
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
const MD_PATH = path.resolve(process.cwd(), 'scripts', '_post-show-id-buying-alcohol-korea.md')

function pastMidnightUtc(): string {
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (d.getTime() >= now.getTime()) d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().replace('.000Z', '+00:00')
}

const POST = {
  slug:         'show-id-buying-alcohol-korea',
  locale:       'en',
  app:          'k-patto',
  category:     'Real-Life Korean',
  tags:         ['convenience store', 'alcohol', 'travel', 'korean phrases'],
  title:        'Why the staff asks for your ID when you buy beer',
  description:  'What Korean store staff ask before selling alcohol, which documents work, and how to answer in Korean.',
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: pastMidnightUtc(),
  is_paused:    false,
}

async function main() {
  console.log(`원고: ${POST.content.length} chars`)
  console.log(`YouTube 태그: ${POST.content.match(/<YouTube[^>]*\/>/g)?.join(', ')}`)
  console.log(`섹션 판정: ${topicSectionKey(POST.app, POST.category)}`)
  console.log(`published_at: ${POST.published_at}  (현재 ${new Date().toISOString()})`)

  const PREV = '2026-09-17T00:00:00+00:00'   // 21번 one-plus-one
  if (new Date(POST.published_at).getTime() <= new Date(PREV).getTime()) {
    console.error(`⛔ published_at 이 21번(${PREV})보다 앞 — 중단`); process.exit(1)
  }
  if (new Date(POST.published_at).getTime() > Date.now()) {
    console.error('⛔ published_at 이 미래 — 중단'); process.exit(1)
  }

  // 슬러그 충돌 — 비공개 글까지 포함해서 본다. 있으면 멈춘다(임의 변경 금지).
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

  // ── 확인 1~6 ──
  const url = `${PROD}/blog/${POST.locale}/${POST.app}/${POST.slug}`
  const res = await fetch(url)
  const html = await res.text()
  console.log(`\n1. ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}  ${url}`)
  console.log(`2. ${html.includes('youtube.com/embed/N7zAyflTwGg') ? '✅' : '❌'} YouTube 임베드`)
  const tables = (html.match(/<table/g) ?? []).length
  const cells = (html.match(/<td/g) ?? []).length
  console.log(`3. ${tables === 2 && cells === 30 ? '✅' : '❌'} 표 ${tables}개 / 셀 ${cells}개 (기대 2 / 30)`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const hits = (xml.match(new RegExp(POST.slug, 'g')) ?? []).length
  console.log(`4. ${hits === 1 ? '✅' : '❌'} 사이트맵 등재 ${hits}건`)

  const list = await fetch(`${PROD}/blog?tab=phrases`).then(r => r.text())
  console.log(`5. ${list.includes(POST.slug) ? '✅' : '❌'} Korean phrases 탭 노출`)

  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`6. ${count === (before.count ?? 0) + 1 ? '✅' : '❌'} 공개 글 ${before.count} → ${count}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
