/**
 * Korean food / Life in Korea 글의 서브 카테고리 분류를 점검한다(읽기 전용, DB 를 바꾸지 않는다).
 *
 * 실행: npx tsx scripts/classify-subcategories.ts [--rules]
 *   기본      현재 적용 중인 분류(오버라이드 + 규칙)를 서브 카테고리별로 출력한다.
 *   --rules   오버라이드를 무시하고 규칙만으로 분류해, 오버라이드와 다른 글을 보여 준다
 *             (규칙이 얼마나 맞는지 확인하거나, 새 글을 오버라이드에 못 박을지 판단할 때 쓴다).
 *
 * 오버라이드에 없는 글(= 규칙으로 분류된 새 글)은 맨 아래에 따로 모아 슬러그 줄을 그대로 복사해 쓸 수 있게 출력한다.
 */
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { topicSectionKey } from '../lib/blog/sections'
import {
  SUBCATEGORY_OVERRIDES,
  classifyBySubcategoryRules,
  subcategoriesFor,
  subcategoryOf,
} from '../lib/blog/subcategories'

dotenv.config({ path: '.env.local' })

const rulesOnly = process.argv.includes('--rules')

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await sb
    .from('blog_posts')
    .select('slug, title, app, category')
    .eq('locale', 'en')
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  if (error) throw error

  const unpinned: string[] = []
  for (const section of ['food', 'life']) {
    const subs = subcategoriesFor(section)
    const rows = (data ?? []).filter(r => topicSectionKey(r.app, r.category) === section)
    console.log(`\n══ ${section} (${rows.length}편) ══`)
    for (const sub of subs) {
      const list = rows.filter(r => (rulesOnly ? classifyBySubcategoryRules(section, r) : subcategoryOf(section, r)) === sub.key)
      console.log(`\n▸ ${sub.label} (${list.length})`)
      for (const r of list) {
        const pinned = SUBCATEGORY_OVERRIDES[r.slug]
        const ruleSub = classifyBySubcategoryRules(section, r)
        const mark = rulesOnly && pinned && pinned !== ruleSub ? `  ← 오버라이드는 ${pinned}` : ''
        console.log(`  - ${r.slug} | ${r.title.slice(0, 60)}${mark}`)
        // 마지막 분류(기본값)는 오버라이드 없이도 그대로 가므로 확정할 필요가 없다
        if (!pinned && sub.key !== subs[subs.length - 1].key) unpinned.push(`  '${r.slug}': '${sub.key}',`)
      }
    }
  }
  if (unpinned.length) {
    console.log('\n── 오버라이드에 없는 글(규칙으로 분류됨). 확정하려면 SUBCATEGORY_OVERRIDES 에 붙여 넣는다 ──')
    unpinned.forEach(l => console.log(l))
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
