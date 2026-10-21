/**
 * Korean basics(문법) 글 일괄 INSERT — 하루 2편씩 쓰는 로드맵용 (Day 3: -(으)ㄹ 수 있다/없다, -아/어 보다).
 *
 * app='k-patto', locale='en', category='Korean Grammar' (lib/blog/sections.ts 의 basics 섹션).
 * 새 글을 추가하려면 POSTS 배열에 항목을 더하고 원고 .md 를 scripts/ 에 둔다.
 *
 * 하는 일: slug 충돌 확인(일시중지 글 포함) → MDX 컴파일 시험 → INSERT(published_at 은 1분 간격 과거 시각)
 *         → 라이브 확인(200, 표, 사이트맵, /blog?tab=basics 노출) → basics 공개 글 수 증가 확인.
 *
 * 실행: npx tsx scripts/insert-korean-basics-day3.ts
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

const POSTS = [
  {
    slug: 'korean-can-su-itda-eopda',
    md: '_post-korean-can-su-itda-eopda.md',
    title: "Saying 'I Can' and 'I Can't': -(으)ㄹ 수 있다 / 없다",
    description: 'One pattern covers ability, possibility, and permission in Korean. Learn -(으)ㄹ 수 있다 and 없다, how to ask "Can I...?" politely, and how it differs from 못.',
    tags: ['ability', 'grammar', 'beginner', 'verbs'],
  },
  {
    slug: 'korean-have-you-ever-eo-boda',
    md: '_post-korean-have-you-ever-eo-boda.md',
    title: "'Have You Ever...?': Talking About Experiences with -아/어 보다",
    description: 'Use -아/어 보다 to say "try it" and "I have done it before." See how 먹어 봤어요 differs from 먹었어요, and how to ask about experiences.',
    tags: ['experience', 'grammar', 'beginner', 'verbs'],
  },
] as const

async function publicBasicsCount() {
  const { data, error } = await sb.from('blog_posts').select('app, category').eq('locale', 'en').eq('is_paused', false).lte('published_at', new Date().toISOString())
  if (error) throw error
  return (data ?? []).filter(r => topicSectionKey(r.app, r.category) === 'basics').length
}

async function main() {
  const before = await publicBasicsCount()
  console.log(`basics 공개 글 수(시작): ${before}`)
  const { compile } = await import('@mdx-js/mdx')
  const { default: remarkGfm } = await import('remark-gfm')

  const rows = []
  for (const [i, p] of POSTS.entries()) {
    const content = fs.readFileSync(path.resolve(process.cwd(), 'scripts', p.md), 'utf8').trimEnd()
    const words = content.split(/\s+/).length
    await compile(content, { remarkPlugins: [remarkGfm] })
    const { data: ex, error } = await sb.from('blog_posts').select('slug, is_paused').eq('slug', p.slug)
    if (error) throw error
    if (ex?.length) { console.error(`⛔ slug 충돌 — 중단: ${p.slug}`, JSON.stringify(ex)); process.exit(1) }
    console.log(`✅ ${p.slug}: ${words}단어, MDX 컴파일 통과, 충돌 없음`)
    rows.push({
      slug: p.slug, locale: 'en', app: 'k-patto', category: 'Korean Grammar',
      tags: [...p.tags], title: p.title, description: p.description, content,
      // 1분 간격, 모두 현재보다 과거(미래면 사이트맵 lte(now) 에서 빠진다). 순서: 첫 글이 더 앞.
      published_at: new Date(Date.now() - (POSTS.length - i + 1) * 60_000).toISOString().replace(/\.\d{3}Z$/, '+00:00'),
      is_paused: false,
    })
  }

  const { data: inserted, error: insErr } = await sb.from('blog_posts').insert(rows).select('id, slug, category, published_at, is_paused')
  if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)
  console.log('\n✅ INSERT 완료\n' + JSON.stringify(inserted, null, 2))

  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  const list = await fetch(`${PROD}/blog?tab=basics`).then(r => r.text())
  for (const p of POSTS) {
    const res = await fetch(`${PROD}/blog/en/k-patto/${p.slug}`)
    const html = await res.text()
    const tables = (html.match(/<table/g) ?? []).length
    console.log(`${p.slug}\n  1. ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}   표 ${tables}개   H2 ${(html.match(/<h2/g) ?? []).length}개\n  2. ${xml.includes(p.slug) ? '✅' : '❌'} 사이트맵   ${list.includes(p.slug) ? '✅' : '❌'} /blog?tab=basics`)
  }
  const after = await publicBasicsCount()
  console.log(`\nbasics 공개 글 수: ${before} → ${after} ${after === before + POSTS.length ? '✅' : '❌'}`)
}

main().then(() => process.exit(0)).catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
