import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

const EP01_IMAGES = [
  '/kpatto/ep-001/ep01_c1.png',
  '/kpatto/ep-001/ep01_c2.png',
  '/kpatto/ep-001/ep01_c3.png',
  '/kpatto/ep-001/ep01_c4.png',
  '/kpatto/ep-001/ep01_c5.png',
]

async function main() {
  // 1. Storage 버킷 목록
  const { data: buckets, error: be } = await sb.storage.listBuckets()
  if (be) console.log('버킷 조회 오류:', be.message)
  else console.log('버킷 목록:', buckets?.map(b => b.name).join(', '))

  // 2. ep-001 폴더 내 파일 목록 시도 (버킷 'kpatto' 가정)
  console.log('\n[kpatto 버킷 ep-001/ 폴더]')
  const { data: folderFiles, error: fe } = await sb.storage.from('kpatto').list('ep-001')
  if (fe) console.log('  오류:', fe.message)
  else {
    if (!folderFiles?.length) console.log('  파일 없음')
    else folderFiles.forEach(f => console.log(`  ${f.name} (${f.metadata?.size ?? '?'} bytes)`))
  }

  // 3. 각 image_url에 대해 download URL 생성 (존재하면 URL 반환)
  console.log('\n[image_url → Storage 확인]')
  for (const url of EP01_IMAGES) {
    // /kpatto/ep-001/ep01_c1.png → bucket=kpatto, path=ep-001/ep01_c1.png
    const parts = url.replace(/^\//, '').split('/')
    const bucket = parts[0]
    const filePath = parts.slice(1).join('/')

    const { data: signedUrl, error } = await sb.storage.from(bucket).createSignedUrl(filePath, 60)
    if (error) {
      console.log(`  ✗ 없음  ${url}`)
      console.log(`       → 오류: ${error.message}`)
    } else {
      console.log(`  ✓ 존재  ${url}`)
    }
  }
}

main().catch(console.error)
