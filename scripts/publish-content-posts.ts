/**
 * content/blog/*.mdx → blog_posts (2026-10-29, docs/CONTENT_GUIDELINES.md 형식의 손글 원고)
 *
 * 프론트매터: title · description · slug · app · category · tags · pexelsQuery
 *   - 같은 app · slug · locale(en) 글이 있으면 제목 · 설명 · 태그 · 본문만 바꾼다(주소 · 발행일 유지, 대표 이미지가 없으면 채운다).
 *   - 없으면 새로 넣는다(즉시 공개, 대표 이미지는 Pexels).
 * 안전장치: 사이트와 같은 MDX 컴파일러(remark-gfm)로 컴파일되지 않으면 아무것도 쓰지 않는다.
 *           바꾸기 전 행은 scripts/backups/ 에 남기고, 쓰기 직전에 다시 읽어 그 사이 바뀌었으면 쓰지 않는다.
 *
 * 실행: npx tsx scripts/publish-content-posts.ts [slug ...] [--dry-run]   (slug 를 안 주면 content/blog 전부)
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const DIR = path.resolve(process.cwd(), 'content', 'blog')
const DRY = process.argv.includes('--dry-run')
const only = process.argv.slice(2).filter(a => !a.startsWith('--'))

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
)

async function pexels(query: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) { console.warn('  PEXELS_API_KEY 없음 — 대표 이미지 없이'); return null }
  const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1&size=large`, { headers: { Authorization: key } })
  if (!r.ok) { console.warn(`  Pexels ${r.status}`); return null }
  const j = await r.json()
  return j.photos?.[0]?.src?.large2x ?? j.photos?.[0]?.src?.large ?? null
}

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')
  const { compile } = await import('@mdx-js/mdx')
  const remarkGfm = (await import('remark-gfm')).default

  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.mdx')).filter(f => !only.length || only.includes(f.replace(/\.mdx$/, '')))
  for (const file of files) {
    const { data: fm, content } = matter(fs.readFileSync(path.join(DIR, file), 'utf8'))
    const body = content.trim().replace(/\r\n/g, '\n')
    for (const k of ['title', 'description', 'slug', 'app', 'category', 'tags']) if (!fm[k]) throw new Error(`${file}: 프론트매터 ${k} 누락`)
    await compile(body, { remarkPlugins: [remarkGfm] })   // 실패하면 throw — 쓰지 않는다
    const words = body.split(/\s+/).filter(Boolean).length
    const faq = (body.slice(body.search(/^## Frequently Asked Questions/m)).match(/^(\*\*.+\?\*\*|###\s+.+\?)\s*$/gm) ?? []).length
    console.log(`${fm.slug}: ${words}단어 · FAQ ${faq}개 · MDX OK`)

    const { data: rows, error } = await sb.from('blog_posts').select('*').eq('app', fm.app).eq('slug', fm.slug).eq('locale', 'en')
    if (error) throw new Error(error.message)
    if ((rows?.length ?? 0) > 1) throw new Error(`${fm.slug}: 같은 slug 행이 ${rows!.length}개 — 중단`)
    const existing = rows?.[0]

    if (existing) {
      const patch: Record<string, unknown> = { title: fm.title, description: fm.description, tags: fm.tags, content: body, category: fm.category }
      if (!existing.thumbnail && fm.pexelsQuery) patch.thumbnail = await pexels(fm.pexelsQuery)
      console.log(`  → 기존 글 갱신 (id ${existing.id}, 발행일 ${String(existing.published_at).slice(0, 10)} 유지${patch.thumbnail ? ', 대표 이미지 추가' : ''})`)
      if (DRY) continue
      const bdir = path.resolve(process.cwd(), 'scripts', 'backups'); fs.mkdirSync(bdir, { recursive: true })
      const bak = path.join(bdir, `${fm.slug}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
      fs.writeFileSync(bak, JSON.stringify(existing, null, 2))
      const { data: again } = await sb.from('blog_posts').select('content').eq('id', existing.id).single()
      if (again?.content !== existing.content) { console.log('  ⚠ 그 사이 본문이 바뀌어 쓰지 않았다'); continue }
      const { error: upErr } = await sb.from('blog_posts').update(patch).eq('id', existing.id)
      if (upErr) throw new Error(upErr.message)
      console.log(`  ✅ 갱신 (백업: ${path.relative(process.cwd(), bak)})`)
    } else {
      const thumbnail = fm.pexelsQuery ? await pexels(fm.pexelsQuery) : null
      const row = {
        slug: fm.slug, locale: 'en', app: fm.app, category: fm.category, title: fm.title, description: fm.description,
        tags: fm.tags, content: body, thumbnail, published_at: new Date().toISOString(), is_paused: false,
      }
      console.log(`  → 새 글 (${fm.app} / ${fm.category}${thumbnail ? ', 대표 이미지 Pexels' : ''})`)
      if (DRY) continue
      const { data, error: insErr } = await sb.from('blog_posts').insert(row).select('id').single()
      if (insErr) throw new Error(insErr.message)
      console.log(`  ✅ 삽입 id ${data.id}`)
    }
  }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
