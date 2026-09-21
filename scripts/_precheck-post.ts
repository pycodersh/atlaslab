/**
 * 글 삽입 전 사전 확인(읽기 전용).
 * 실행: npx tsx scripts/_precheck-post.ts <새 slug> <기준 slug...>
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { topicSectionKey } from '../lib/blog/sections'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const sb = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const [newSlug, ...refSlugs] = process.argv.slice(2)

async function main() {
  console.log(`1) Supabase 프로젝트: ${new URL(url).hostname.split('.')[0]}`)

  const { data: refs, error } = await sb.from('blog_posts').select('*').in('slug', refSlugs)
  if (error) throw error
  console.log(`\n2) 기준 글 ${refs?.length}/${refSlugs.length}건`)
  console.log(`   컬럼: ${Object.keys(refs?.[0] ?? {}).join(', ')}`)
  for (const r of (refs ?? []).sort((a, b) => a.published_at.localeCompare(b.published_at))) {
    const yt = (r.content as string).match(/<YouTube[^>]*\/>/g)
    console.log(`   - ${r.slug}`)
    console.log(`     app=${r.app} locale=${r.locale} category="${r.category}" is_paused=${r.is_paused}`)
    console.log(`     tags=${JSON.stringify(r.tags)}  published_at=${r.published_at}`)
    console.log(`     YouTube: ${yt?.join(' ') ?? '없음'}`)
  }

  const { data: hit } = await sb
    .from('blog_posts')
    .select('slug, app, locale, is_paused')
    .eq('slug', newSlug)
  console.log(`\n3) 슬러그 "${newSlug}": ${hit && hit.length ? '⛔ 충돌 ' + JSON.stringify(hit) : '✅ 없음 (비공개 포함)'}`)

  // 새 값을 만들지 않으려면 지금 어떤 category 가 있는지부터 봐야 한다.
  // 각 값이 홈·목록의 어느 주제 탭으로 가는지도 같이 찍는다.
  const { data: all } = await sb
    .from('blog_posts')
    .select('app, category')
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  const bucket = new Map<string, { n: number; tabs: Set<string> }>()
  for (const p of all ?? []) {
    const key = `${p.category ?? '(null)'}`
    const tab = topicSectionKey(p.app, p.category) ?? `— (${p.app})`
    const cur = bucket.get(key) ?? { n: 0, tabs: new Set<string>() }
    cur.n++; cur.tabs.add(tab)
    bucket.set(key, cur)
  }
  console.log('\n4) DB 에 실제로 있는 category 값 (공개 글 기준)')
  for (const [cat, v] of [...bucket].sort((a, b) => b[1].n - a[1].n)) {
    console.log(`   ${String(v.n).padStart(3)}편  "${cat}"  → 탭: ${[...v.tabs].join(', ')}`)
  }

  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`\n공개 글 수(현재): ${count}   현재 시각: ${new Date().toISOString()}`)
}

main().catch(e => { console.error(e.message ?? e); process.exit(1) })
