/**
 * blog_posts 단건 INSERT — 'paradise-city-incheon-ultimate-guide' (Stay in Korea 첫 글)
 *
 * app='k-patto', locale='en', category='Stay in Korea' (lib/blog/sections.ts 의 stay-in-korea 섹션).
 * 요청서 본문에서 두 가지를 뺐다:
 *  - 맨 앞 H1·이탤릭 설명·첫 구분선 — 글 페이지가 title/description 을 따로 그려 중복된다.
 *  - <!-- IMAGE PLACEHOLDER --> 주석 — MDX 는 HTML 주석을 못 읽어 페이지가 깨질 수 있고, 이미지 파일도 아직 없다.
 * 썸네일은 비워 둔다(이미지 미제공).
 *
 * 삽입 전에 같은 옵션(remarkGfm)으로 MDX 컴파일을 먼저 돌려 본다.
 *
 * 실행: npx tsx scripts/insert-post-paradise-city-incheon-ultimate-guide.ts
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
const MD_PATH = path.resolve(process.cwd(), 'scripts', '_post-paradise-city-incheon-ultimate-guide.md')

const POST = {
  slug:         'paradise-city-incheon-ultimate-guide',
  locale:       'en',
  app:          'k-patto',
  category:     'Stay in Korea',
  tags:         ['Paradise City', 'Incheon', 'Incheon Airport', 'luxury hotel', 'spa', 'travel Korea'],
  title:        'Paradise City Incheon: The Ultimate Resort Guide & Free Airport Shuttle',
  description:  "A complete foreign traveler's guide to Korea's premier luxury arttainment resort, 5-minute free airport transfers, Cimer Spa, Wonderbox, and gourmet dining.",
  content:      fs.readFileSync(MD_PATH, 'utf8').trimEnd(),
  published_at: new Date(Date.now() - 2 * 60_000).toISOString().replace('.000Z', '+00:00'),
  is_paused:    false,
}

async function main() {
  console.log(`원고: ${POST.content.length} chars`)
  const section = topicSectionKey(POST.app, POST.category)
  console.log(`섹션 판정: ${section}`)
  if (section !== 'stay-in-korea') { console.error('⛔ Stay in Korea 섹션이 아니다 — 중단'); process.exit(1) }
  if (/<!--/.test(POST.content)) { console.error('⛔ HTML 주석이 남아 있다(MDX 오류 원인) — 중단'); process.exit(1) }

  // 실제 페이지와 같은 컴파일 옵션으로 먼저 시험한다
  // (정적 import 는 tsx 의 CJS 해석에서 estree-walker 가 깨져 동적 import 로 읽는다)
  const { compile } = await import('@mdx-js/mdx')
  const { default: remarkGfm } = await import('remark-gfm')
  await compile(POST.content, { remarkPlugins: [remarkGfm] })
  console.log('✅ MDX 컴파일 통과')

  const { data: existing, error: chkErr } = await sb.from('blog_posts').select('slug, app, locale, is_paused').eq('slug', POST.slug)
  if (chkErr) throw new Error(`충돌 확인 실패: ${chkErr.message}`)
  if (existing && existing.length) { console.error('⛔ slug 충돌 — 중단', JSON.stringify(existing)); process.exit(1) }
  console.log('✅ slug 충돌 없음')

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
  console.log(`2. ${html.includes('Stay in Korea') ? '✅' : '❌'} 페이지에 카테고리 라벨 표시, H2 ${(html.match(/<h2/g) ?? []).length}개`)

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  console.log(`3. ${xml.includes(POST.slug) ? '✅' : '❌'} 사이트맵 등재`)

  const list = await fetch(`${PROD}/blog?tab=stay-in-korea`).then(r => r.text())
  console.log(`4. ${list.includes(POST.slug) ? '✅' : '❌'} /blog?tab=stay-in-korea 에 노출`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
