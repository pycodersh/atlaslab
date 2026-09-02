/**
 * .md 원고 파일의 내용을 blog_posts.content 로 그대로 동기화한다.
 * content 외의 컬럼은 건드리지 않는다.
 *
 * 실행: npx tsx scripts/sync-post-content-from-md.ts <slug> <md경로>
 * 예:   npx tsx scripts/sync-post-content-from-md.ts \
 *         are-side-dishes-free-in-korea \
 *         scripts/_post-are-side-dishes-free-in-korea.md
 *
 * 주의: 본문에 MDX 컴포넌트(<YouTube /> 등)를 쓸 경우, 그 컴포넌트가
 * 프로덕션에 배포된 뒤에 실행할 것. 배포 전에 넣으면 해당 글이
 * "Expected component ... to be defined" 로 렌더 실패한다.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const [slug, mdPath] = process.argv.slice(2)
if (!slug || !mdPath) {
  console.error('사용법: npx tsx scripts/sync-post-content-from-md.ts <slug> <md경로>')
  process.exit(1)
}

async function main() {
  const content = fs.readFileSync(path.resolve(process.cwd(), mdPath), 'utf8').trimEnd()

  // 1. 대상 행 확인 — 정확히 1건이어야 한다
  const { data: rows, error: selErr } = await sb
    .from('blog_posts')
    .select('id, slug, app, locale, content')
    .eq('slug', slug)
  if (selErr) throw new Error(`조회 실패: ${selErr.message}`)

  if (!rows || rows.length === 0) {
    console.error(`⛔ slug '${slug}' 없음 — 중단`)
    process.exit(1)
  }
  if (rows.length > 1) {
    console.error(`⛔ slug '${slug}' 가 ${rows.length}건 — 모호해서 중단`)
    process.exit(1)
  }

  const row = rows[0]
  console.log(`대상: ${row.app}/${row.locale}/${row.slug}  (id=${row.id})`)
  console.log(`  before: ${row.content.length} chars`)
  console.log(`  after : ${content.length} chars`)

  if (row.content === content) {
    console.log('\n변경 없음 — 종료')
    return
  }

  // 2. content 만 UPDATE
  const { error: updErr } = await sb
    .from('blog_posts')
    .update({ content })
    .eq('id', row.id)
  if (updErr) throw new Error(`UPDATE 실패: ${updErr.message}`)

  // 3. 반영 확인
  const { data: after, error: verErr } = await sb
    .from('blog_posts')
    .select('content')
    .eq('id', row.id)
    .single()
  if (verErr) throw new Error(`검증 조회 실패: ${verErr.message}`)

  console.log(after!.content === content ? '\n✅ UPDATE 완료 및 일치 확인' : '\n❌ 저장된 내용이 원고와 다름')
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
