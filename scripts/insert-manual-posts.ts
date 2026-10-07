/**
 * scripts/manual-posts/*.md (프런트매터 + 본문) 를 blog_posts 에 게시한다.
 * Gemini 를 쓰지 않고 사람이 쓴 글을 올릴 때 쓴다. 이 사이트의 글은 파일이 아니라
 * Supabase DB 행이라서, md 를 푸시하는 것만으로는 사이트에 나오지 않는다 — 이 스크립트가 INSERT 한다.
 *
 * 프런트매터는 영문 자동 생성 파이프라인(generate-global-post.mjs)과 같은 규격이다:
 *   title / description / date / category(life-in-korea | korean-food) / tags / thumbnail / readTime
 *
 * 실행: npx tsx scripts/insert-manual-posts.ts
 *   - 슬러그(= 파일명)가 하나라도 이미 있으면(비공개 포함) 아무것도 넣지 않고 멈춘다.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import matter from 'gray-matter'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)
const PROD = 'https://www.atlaslabstudios.com'
const DIR = path.resolve(process.cwd(), 'scripts', 'manual-posts')
const CATS: Record<string, { app: string; category: string; tab: string }> = {
  'life-in-korea': { app: 'k-patto', category: 'Korean Culture', tab: 'life' },
  'korean-food':   { app: 'k-pantry', category: 'Cooking Basics', tab: 'food' },
}
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

async function publicCount() {
  const { count } = await sb.from('blog_posts').select('*', { count: 'exact', head: true })
    .eq('is_paused', false).lte('published_at', new Date().toISOString())
  return count ?? 0
}

async function main() {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md')).sort()
  const posts = files.map(f => {
    const { data, content } = matter(fs.readFileSync(path.join(DIR, f), 'utf8'))
    const slug = f.replace(/\.md$/, '')
    const cat = CATS[data.category]
    const body = content.trim()
    const problems: string[] = []
    if (!cat) problems.push(`알 수 없는 category: ${data.category}`)
    for (const k of ['title', 'description', 'tags']) if (!data[k]) problems.push(`${k} 누락`)
    if (!data.thumbnail) problems.push('thumbnail 비어 있음')
    const w = words(body)
    if (w < 800 || w > 1200) problems.push(`본문 ${w}단어 (800~1200)`)
    if (!/^\|.+\|$/m.test(body)) problems.push('표 없음')
    if (!/^>\s/m.test(body)) problems.push('인용구 없음')
    if (problems.length) { console.error(`⛔ ${f}: ${problems.join(', ')}`); process.exit(1) }
    return { slug, cat, data, body, w }
  })

  // 슬러그 충돌 — 비공개 포함. 하나라도 있으면 전부 중단
  for (const p of posts) {
    const { data: hit, error } = await sb.from('blog_posts').select('slug, is_paused').eq('slug', p.slug)
    if (error) throw new Error(error.message)
    if (hit?.length) { console.error(`⛔ slug 충돌 — 전부 중단: ${JSON.stringify(hit)}`); process.exit(1) }
  }
  console.log(`✅ ${posts.length}편 검증 통과, slug 충돌 없음`)

  const before = await publicCount()
  const now = Date.now()
  const inserted: { slug: string; app: string }[] = []
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i]
    const published_at = new Date(now - (posts.length - i) * 60_000).toISOString().replace('.000Z', '+00:00')
    const row = {
      slug: p.slug, locale: 'en', app: p.cat.app, category: p.cat.category,
      tags: p.data.tags, title: p.data.title, description: p.data.description,
      content: p.body, thumbnail: p.data.thumbnail, published_at, is_paused: false,
    }
    const { data, error } = await sb.from('blog_posts').insert(row).select('id, slug, app, category, published_at').single()
    if (error) throw new Error(`${p.slug} INSERT 실패: ${error.message}`)
    inserted.push({ slug: p.slug, app: p.cat.app })
    console.log(`✅ INSERT ${i + 1}/${posts.length}  ${data.slug}  ${data.app} / ${data.category}  ${p.w}단어  id=${data.id}`)
  }

  console.log('\n── 확인 ──')
  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  for (const p of posts) {
    const url = `${PROD}/blog/en/${p.cat.app}/${p.slug}`
    const res = await fetch(url)
    const html = await res.text()
    const tab = await fetch(`${PROD}/blog?tab=${p.cat.tab}`).then(r => r.text())
    const tables = (html.match(/<table/g) ?? []).length
    console.log(`${p.slug}\n   ${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}  ${tables >= 1 ? '✅' : '❌'} 표 ${tables}개  ${html.includes('images.pexels.com') ? '✅' : '❌'} 썸네일  ${xml.includes(p.slug) ? '✅' : '❌'} 사이트맵  ${tab.includes(p.slug) ? '✅' : '❌'} ${p.cat.tab} 탭`)
  }
  const after = await publicCount()
  console.log(`\n공개 글 ${before} → ${after}  ${after === before + posts.length ? '✅' : '❌'} (기대 +${posts.length})`)
}
main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
