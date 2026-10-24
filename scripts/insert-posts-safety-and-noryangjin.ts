/**
 * blog_posts INSERT 2건 — 외국인 다검색 주제 (Life / Food)
 *
 *  - is-korea-safe-emergency-numbers-tourists      Life  (app k-patto, category 'Korean Culture')
 *  - noryangjin-fish-market-guide-how-to-eat-hoe   Food  (app k-pantry, category 'Cooking Basics')
 *
 * app / category 는 같은 그룹의 기존 글(late-night-medicine-korea-clinics-guide, kalguksu-…)에서 확인한 값을 그대로 쓴다.
 * thumbnail 은 기존 글 중에도 비워 둔 것이 있어(late-night-medicine…) 비워 둔다.
 * 슬러그가 이미 있으면(pause 포함) 중단한다.
 *
 * 실행: npx tsx scripts/insert-posts-safety-and-noryangjin.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { groupKeyOf } from '../lib/blog/sections'
import { classifyBySubcategoryRules } from '../lib/blog/subcategories'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const PROD = 'https://www.atlaslabstudios.com'
const md = (n: string) => fs.readFileSync(path.resolve(process.cwd(), 'scripts', n), 'utf8').trimEnd()
const iso = (offsetMin: number) => new Date(Date.now() - offsetMin * 60_000).toISOString().replace('.000Z', '+00:00')

const POSTS = [
  {
    expectGroup: 'life',
    post: {
      slug: 'is-korea-safe-emergency-numbers-tourists',
      locale: 'en',
      app: 'k-patto',
      category: 'Korean Culture',
      tags: ['korea safety', 'emergency numbers', 'travel tips', 'living in korea'],
      title: 'Is Korea Safe for Tourists? Emergency Numbers, Common Problems, and What to Say',
      description: 'How safe Korea is for visitors, which emergency numbers to call (112, 119, 1330), and the Korean phrases that get help fast.',
      content: md('_post-is-korea-safe-emergency-numbers-tourists.md'),
      published_at: iso(4),
      is_paused: false,
    },
    checks: { tables: 2, cells: 4 * 3 + 7 * 3 },
  },
  {
    expectGroup: 'food',
    post: {
      slug: 'noryangjin-fish-market-guide-how-to-eat-hoe',
      locale: 'en',
      app: 'k-pantry',
      category: 'Cooking Basics',
      tags: ['noryangjin', 'korean seafood', 'hoe', 'seoul food', 'fish market'],
      title: 'Noryangjin Fish Market Guide: How to Buy and Eat Fresh Raw Fish (Hoe) in Seoul',
      description: 'How the buy-downstairs, eat-upstairs system works at Noryangjin, how to avoid overpaying, and the Korean you need for ordering hoe.',
      content: md('_post-noryangjin-fish-market-guide-how-to-eat-hoe.md'),
      published_at: iso(3),
      is_paused: false,
    },
    checks: { tables: 3, cells: 4 * 3 + 9 * 3 + 6 * 3 },
  },
]

async function main() {
  for (const { post, expectGroup } of POSTS) {
    const group = groupKeyOf(post.app, post.category)
    console.log(`\n── ${post.slug}\n   그룹 판정: ${group}  서브 칩 예상: ${classifyBySubcategoryRules(group!, post)}  본문 ${post.content.length} chars`)
    if (group !== expectGroup) { console.error(`⛔ 그룹이 ${expectGroup} 가 아님 — 중단`); process.exit(1) }
    if (new Date(post.published_at).getTime() > Date.now()) { console.error('⛔ published_at 이 미래 — 중단'); process.exit(1) }
    const { data: ex, error } = await sb.from('blog_posts').select('slug,is_paused').eq('slug', post.slug)
    if (error) throw error
    if (ex && ex.length) { console.error('⛔ slug 충돌 — 중단', JSON.stringify(ex)); process.exit(1) }
  }
  console.log('\n✅ 두 slug 모두 충돌 없음')

  const countLive = async () => (await sb.from('blog_posts').select('*', { count: 'exact', head: true }).eq('is_paused', false).lte('published_at', new Date().toISOString())).count ?? 0
  const before = await countLive()

  for (const { post, checks } of POSTS) {
    const { data: row, error } = await sb.from('blog_posts').insert(post)
      .select('id, slug, app, locale, category, tags, published_at, is_paused').single()
    if (error) throw new Error(`INSERT 실패(${post.slug}): ${error.message}`)
    console.log(`\n✅ INSERT ${post.slug}\n` + JSON.stringify(row))

    const url = `${PROD}/blog/${post.locale}/${post.app}/${post.slug}`
    const res = await fetch(url)
    const html = await res.text()
    const tables = (html.match(/<table/g) ?? []).length
    const cells = (html.match(/<td/g) ?? []).length
    console.log(`  1. ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}  ${url}`)
    console.log(`  2. ${tables === checks.tables && cells === checks.cells ? '✅' : '❌'} 표 ${tables}개 / 셀 ${cells}개 (기대 ${checks.tables} / ${checks.cells})`)
  }

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  for (const { post } of POSTS) {
    const hits = (xml.match(new RegExp(post.slug, 'g')) ?? []).length
    console.log(`3. ${hits === 1 ? '✅' : '❌'} 사이트맵 ${post.slug} ${hits}건`)
  }
  for (const { post, expectGroup } of POSTS) {
    const list = await fetch(`${PROD}/blog?tab=${expectGroup}`).then(r => r.text())
    console.log(`4. ${list.includes(post.slug) ? '✅' : '❌'} ${expectGroup} 탭 노출 ${post.slug}`)
  }
  const after = await countLive()
  console.log(`5. ${after === before + 2 ? '✅' : '❌'} 공개 글 ${before} → ${after}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
