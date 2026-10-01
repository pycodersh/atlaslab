/**
 * generate-global-post.mjs 는 기본적으로 생성 즉시 공개(is_paused: false)한다.
 * --draft 로 생성했을 때만 비공개 초안으로 들어가는데, 그걸 검수 후 공개 전환할 때 쓴다.
 * 이미 공개된 글을 내리고 싶을 때는 --unpublish 로 반대로 쓴다.
 *
 * 실행: npx tsx scripts/publish-global-draft.ts <slug>
 *       npx tsx scripts/publish-global-draft.ts <slug> --unpublish   (비공개로 되돌리기)
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const PROD = 'https://www.atlaslabstudios.com'

async function main() {
  const [slug, ...rest] = process.argv.slice(2)
  if (!slug) { console.error('사용법: npx tsx scripts/publish-global-draft.ts <slug> [--unpublish]'); process.exit(1) }
  const unpublish = rest.includes('--unpublish')

  const { data: before, error: readErr } = await sb
    .from('blog_posts')
    .select('id, slug, app, locale, category, title, is_paused')
    .eq('slug', slug)
    .single()
  if (readErr || !before) { console.error(`⛔ slug "${slug}" 를 찾지 못함: ${readErr?.message ?? ''}`); process.exit(1) }

  console.log(`현재: ${before.title}  (is_paused=${before.is_paused})`)

  const { data: row, error } = await sb
    .from('blog_posts')
    .update({ is_paused: unpublish })
    .eq('slug', slug)
    .select('id, slug, app, locale, category, is_paused')
    .single()
  if (error) throw new Error(`UPDATE 실패: ${error.message}`)

  console.log(`✅ ${unpublish ? '비공개 전환' : '공개 전환'} 완료\n${JSON.stringify(row, null, 2)}`)

  if (!unpublish) {
    const url = `${PROD}/blog/${row.locale}/${row.app}/${row.slug}`
    const res = await fetch(url)
    console.log(`${res.status === 200 ? '✅' : '❌'} HTTP ${res.status}  ${url}`)
    const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
    const hit = xml.includes(row.slug)
    console.log(`${hit ? '✅' : '⏳'} 사이트맵 등재 ${hit ? '확인됨' : '아직 안 보임(재배포/캐시 지연일 수 있음)'}`)
  }
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
