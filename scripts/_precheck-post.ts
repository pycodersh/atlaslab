/**
 * 글 삽입 전 사전 확인(읽기 전용).
 * 실행: npx tsx scripts/_precheck-post.ts <새 slug> <기준 slug...>
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

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

  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`\n공개 글 수(현재): ${count}   현재 시각: ${new Date().toISOString()}`)
}

main().catch(e => { console.error(e.message ?? e); process.exit(1) })
