/**
 * 로컬 이미지 파일을 Supabase Storage(public 버킷 "blog-covers")에 올리고,
 * 공개 URL을 blog_posts.thumbnail 에 바로 저장한다.
 *
 * generate-global-post.mjs 가 Pexels URL을 그대로 쓰는 것과 같은 원리 —
 * DB 컬럼이 URL 문자열이라 git 커밋·배포 없이 바로 반영된다. 생성한 커버
 * 이미지(예: Gemini 이미지 생성)를 표지로 쓸 때 이 스크립트로 올린다.
 *
 * 실행: npx tsx scripts/upload-blog-cover.ts <로컬 파일> <slug>.jpg <slug>
 *   예) npx tsx scripts/upload-blog-cover.ts /tmp/cover.jpg climate-card-vs-t-money-seoul.jpg climate-card-vs-t-money-seoul
 *
 * slug 인자를 생략하면 업로드만 하고 DB는 건드리지 않는다.
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

const BUCKET = 'blog-covers'
const [localPath, objectPath, slug] = process.argv.slice(2)

async function main() {
  if (!localPath || !objectPath) {
    console.error('사용법: npx tsx scripts/upload-blog-cover.ts <로컬 파일> <objectPath, 예: slug.jpg> [slug]')
    process.exit(1)
  }

  // 버킷이 없으면 공개 버킷으로 만든다(처음 쓸 때만 해당)
  const { data: buckets } = await sb.storage.listBuckets()
  if (!buckets?.some(b => b.name === BUCKET)) {
    const { error: cErr } = await sb.storage.createBucket(BUCKET, { public: true })
    if (cErr) throw new Error(`버킷 생성 실패: ${cErr.message}`)
    console.log(`✅ 버킷 생성: ${BUCKET} (public)`)
  }

  const file = fs.readFileSync(localPath)
  const { error: upErr } = await sb.storage.from(BUCKET).upload(objectPath, file, {
    // 확장자로 정한다 — 도식은 PNG 로 올려야 글자가 깨끗하다
    contentType: /\.png$/i.test(objectPath) ? 'image/png' : /\.webp$/i.test(objectPath) ? 'image/webp' : 'image/jpeg',
    upsert: true,
  })
  if (upErr) throw new Error(`업로드 실패: ${upErr.message}`)

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(objectPath)
  console.log(`✅ 업로드 완료: ${pub.publicUrl}`)

  if (slug) {
    const { data: row, error: updErr } = await sb
      .from('blog_posts')
      .update({ thumbnail: pub.publicUrl })
      .eq('slug', slug)
      .select('slug, thumbnail')
      .single()
    if (updErr) throw new Error(`thumbnail 갱신 실패: ${updErr.message}`)
    console.log(`✅ blog_posts.thumbnail 갱신: ${JSON.stringify(row)}`)
  }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
