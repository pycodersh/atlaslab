/**
 * 이미 발행된 글 한 편의 본문(content)만 로컬 원고 파일로 바꾼다 — content/stays 밖의 글(예: INSPIRE · Paradise City)용.
 * 실제 페이지와 같은 옵션으로 MDX 컴파일을 먼저 시험하고, 통과해야 UPDATE 한다. 다른 칼럼은 건드리지 않는다.
 *
 * 실행: npx tsx scripts/update-post-content.ts <slug> <원고 파일> [--dry]
 *   예) npx tsx scripts/update-post-content.ts mohegan-inspire-resort-guide scripts/_post-mohegan-inspire-resort-guide.md
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const [slug, file] = process.argv.slice(2).filter(a => !a.startsWith('--'))
const dry = process.argv.includes('--dry')

async function main() {
  if (!slug || !file) throw new Error('사용법: <slug> <원고 파일> [--dry]')
  const content = fs.readFileSync(file, 'utf8').trimEnd()
  if (/<!--/.test(content)) throw new Error('HTML 주석이 남아 있다(MDX 오류 원인)')
  const { compile } = await import('@mdx-js/mdx')
  const { default: remarkGfm } = await import('remark-gfm')
  await compile(content, { remarkPlugins: [remarkGfm] })
  console.log(`✅ ${slug} — ${content.length} chars, MDX 컴파일 통과`)
  if (dry) return

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  )
  const { data, error } = await sb.from('blog_posts').update({ content }).eq('slug', slug).select('slug, app, locale')
  if (error) throw new Error(`UPDATE 실패: ${error.message}`)
  if (!data?.length) throw new Error(`slug 없음: ${slug}`)
  console.log(`↻ 갱신 ${JSON.stringify(data)}`)
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
