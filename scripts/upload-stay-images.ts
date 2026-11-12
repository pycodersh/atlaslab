/**
 * 숙소 글 사진 → webp 변환 → Supabase Storage(blog-covers) 업로드. 업로드한 공개 URL 을 출력한다.
 *
 * 이름 규칙: blog-covers/<slug>-<name>.webp (긴 변 1600px, q80). 썸네일은 이름을 'cover' 로 주면
 * --cover 옵션일 때 blog_posts.thumbnail 에도 넣는다. 본문 <figure> 는 원고(content/stays/*.mdx)에 직접 적는다.
 *
 * 실행: npx tsx scripts/upload-stay-images.ts <slug> <로컬파일>=<name> [...] [--cover]
 *   예) npx tsx scripts/upload-stay-images.ts gyeongwonjae-ambassador-incheon-review "C:/.../경원재 썸네일.jpg=cover" --cover
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import sharp from 'sharp'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'blog-covers'
const args = process.argv.slice(2)
const setCover = args.includes('--cover')
const [slug, ...pairs] = args.filter(a => a !== '--cover')

async function main() {
  if (!slug || !pairs.length) throw new Error('사용법: <slug> <파일>=<name> [...] [--cover]')
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  )

  for (const pair of pairs) {
    const i = pair.lastIndexOf('=')
    const [file, name] = [pair.slice(0, i), pair.slice(i + 1)]
    if (!fs.existsSync(file)) throw new Error(`파일 없음: ${file}`)
    const buf = await sharp(fs.readFileSync(file)).rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 }).toBuffer()
    const meta = await sharp(buf).metadata()
    const objectPath = `${slug}-${name}.webp`
    const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, { contentType: 'image/webp', upsert: true })
    if (error) throw new Error(`업로드 실패 ${objectPath}: ${error.message}`)
    const url = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl
    console.log(`✅ ${name.padEnd(10)} ${meta.width}x${meta.height} ${(buf.length / 1024).toFixed(0)}KB  ${url}`)

    if (setCover && name === 'cover') {
      const { error: uErr } = await sb.from('blog_posts').update({ thumbnail: url }).eq('slug', slug)
      if (uErr) throw new Error(`thumbnail 갱신 실패: ${uErr.message}`)
      console.log(`   ↳ blog_posts.thumbnail 갱신`)
    }
  }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
