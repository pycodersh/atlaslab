/**
 * export-kpatto-blog.ts
 * k-patto 블로그 발행분 전체를 JSON으로 내보냅니다.
 * 30편씩 4개 파일로 분할 저장.
 *
 * 실행: npx tsx scripts/export-kpatto-blog.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const OUT_DIR  = path.resolve(process.cwd(), 'exports', 'kpatto-blog')
const CHUNK    = 30

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const now = new Date().toISOString()

  console.log('Supabase에서 k-patto 블로그 포스트 조회 중...')

  const { data, error } = await sb
    .from('blog_posts')
    .select('id, slug, title, description, tags, content, published_at')
    .eq('app', 'k-patto')
    .lte('published_at', now)
    .order('published_at', { ascending: true })

  if (error) {
    console.error('조회 실패:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error('k-patto 발행 포스트가 없습니다.')
    process.exit(1)
  }

  console.log(`총 ${data.length}편 조회됨`)

  // 30편씩 청크 분할
  const chunks: typeof data[] = []
  for (let i = 0; i < data.length; i += CHUNK) {
    chunks.push(data.slice(i, i + CHUNK))
  }

  const files: string[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk    = chunks[i]
    const start    = i * CHUNK + 1
    const end      = start + chunk.length - 1
    const fileName = `kpatto-blog-${String(i + 1).padStart(2, '0')}_posts${start}-${end}.json`
    const filePath = path.join(OUT_DIR, fileName)

    fs.writeFileSync(filePath, JSON.stringify(chunk, null, 2), 'utf-8')
    files.push(filePath)
    console.log(`  저장: ${fileName}  (${chunk.length}편)`)
  }

  console.log(`\n완료. 파일 ${files.length}개 → ${OUT_DIR}`)
  console.log('\n경로:')
  for (const f of files) console.log(' ', f)
}

main().catch(e => { console.error(e); process.exit(1) })
