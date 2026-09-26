/**
 * blog_posts 단건 INSERT — 'galbijjim-vs-western-beef-stew' (Korean food)
 *
 * app / locale / category / tags 형식은 기존 편의점 글 두 편
 * (need-a-bag-korean-checkout, cup-ramen-convenience-store-korea,
 *  one-plus-one-convenience-store-korea)을 조회해 그대로 따른다.
 *   app='k-patto', locale='en', category='Real-Life Korean'
 *   tags = [장소, 주제, "travel", "korean phrases"] — 소문자 4개
 * blog_posts 에는 썸네일 컬럼이 없다. 카드·상단 썸네일은 본문 <YouTube /> 에서 뽑힌다.
 * Korean food 탭 글 30편이 모두 app=k-pantry / locale=en 이고, category 는
 * 'Cooking Basics'(먹는 법·조리·지역 음식) / 'Ingredients & Pantry'(재료 설명)
 * 둘뿐이다. 서양식 스튜와 비교하고 만드는 3단계가 들어 있는 조리 글이라 Cooking Basics(송편·쌈·BBQ 볶음밥 글과 같음).
 * 원고의 category:"culture" 는 쓰지 않는다.
 * 표지는 COVER_BY_SLUG, 본문 이미지 2장(비프스튜·상차림)은 public/images/posts 에 있다(Gemini 생성).
 * 이미지가 배포된 뒤에 실행해야 본문에 깨진 이미지가 뜨지 않는다.
 *
 * published_at 은 오늘 00:00 UTC 가 이미 지났으면 그 값, 아니면 어제 00:00 UTC.
 * 21번(2026-09-17T00:00Z)보다 뒤여야 목록 순서가 유지된다 — 아래에서 검사한다.
 * (미래 시각이면 목록·사이트맵의 lte(now) 조건에서 빠진다)
 *
 * 실행: npx tsx scripts/insert-post-galbijjim-vs-western-beef-stew.ts
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
const MD_PATH = path.resolve(process.cwd(), 'scripts', '_post-galbijjim-vs-western-beef-stew.md')

function pastMidnightUtc(): string {
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (d.getTime() >= now.getTime()) d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().replace('.000Z', '+00:00')
}

const POST = {
  slug:         'galbijjim-vs-western-beef-stew',
  locale:       'en',
  app:          'k-pantry',
  category:     'Cooking Basics',
  tags:         ['Galbijjim', 'Korean Braised Ribs', 'Beef Stew Comparison', 'Food Science'],
  title:        "Galbi-jjim vs Western Beef Stew: The Secret to Korea's Holiday Braised Ribs",
  description:  'Analyze the enzymatic tenderizing science, sweet-savory flavor mechanics, and root vegetable carving techniques separating Korean braised ribs from Western stews.',
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  // 삽입 2분 전 — 과거이면서 직전 Korean food 글(송편 09-26 04:04)보다 뒤
  published_at: new Date(Date.now() - 2 * 60_000).toISOString().replace('.000Z', '+00:00'),
  is_paused:    false,
}

async function main() {
  console.log(`원고: ${POST.content.length} chars`)
  console.log(`YouTube 태그: ${POST.content.match(/<YouTube[^>]*\/>/g)?.join(', ')}`)
  const section = topicSectionKey(POST.app, POST.category)
  console.log(`섹션 판정: ${section}`)
  if (section !== 'food') { console.error('⛔ Korean food 탭이 아니다 — 중단'); process.exit(1) }
  console.log(`published_at: ${POST.published_at}  (현재 ${new Date().toISOString()})`)

  const PREV = '2026-09-26T04:04:58+00:00'   // 직전 Korean food 글 korean-songpyeon-pine-needles-science
  if (new Date(POST.published_at).getTime() <= new Date(PREV).getTime()) {
    console.error(`⛔ published_at 이 직전 글(${PREV})보다 앞 — 중단`); process.exit(1)
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
  const imgs = ['western-beef-stew.jpg', 'galbijjim-with-banchan.jpg']
  const imgOk = await Promise.all(imgs.map(async f => (await fetch(`${PROD}/images/posts/${f}`)).status === 200))
  console.log(`2. ${imgs.every(f => html.includes(f)) && imgOk.every(Boolean) ? '✅' : '❌'} 본문 이미지 2장 (참조 + 파일 200)`)
  const tables = (html.match(/<table/g) ?? []).length
  const cells = (html.match(/<td/g) ?? []).length
  console.log(`3. ${tables === 1 && cells === 18 ? '✅' : '❌'} 표 ${tables}개 / 셀 ${cells}개 (기대 1 / 18)`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const hits = (xml.match(new RegExp(POST.slug, 'g')) ?? []).length
  console.log(`4. ${hits === 1 ? '✅' : '❌'} 사이트맵 등재 ${hits}건`)

  const list = await fetch(`${PROD}/blog?tab=food`).then(r => r.text())
  console.log(`5. ${list.includes(POST.slug) ? '✅' : '❌'} Korean food 탭 노출`)

  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`6. ${count === (before.count ?? 0) + 1 ? '✅' : '❌'} 공개 글 ${before.count} → ${count}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
