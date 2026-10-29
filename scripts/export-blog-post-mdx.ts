/**
 * blog_posts 글 → content/blog/<slug>.mdx (프론트매터 + 본문). 손으로 고친 뒤 publish-content-posts.ts 로 되돌려 넣는다.
 * 이미 파일이 있으면 덮어쓰지 않는다.
 *
 * 실행: npx tsx scripts/export-blog-post-mdx.ts <slug> [slug ...]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

;(async () => {
  for (const slug of process.argv.slice(2)) {
    const out = path.resolve(process.cwd(), 'content', 'blog', `${slug}.mdx`)
    if (fs.existsSync(out)) { console.log(`· ${slug}: 파일이 이미 있다 — 건너뜀`); continue }
    const { data, error } = await sb.from('blog_posts').select('app, category, slug, title, description, tags, content').eq('slug', slug).eq('locale', 'en').eq('is_paused', false).single()
    if (error) { console.error(`✗ ${slug}: ${error.message}`); continue }
    const { content, ...fm } = data
    fs.writeFileSync(out, matter.stringify(`\n${(content as string).replace(/\r\n/g, '\n').trim()}\n`, fm))
    console.log(`✓ ${slug} (${data.app} / ${data.category})`)
  }
})()
