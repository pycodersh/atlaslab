/**
 * 지역 음식 batch2 이미지 9장을 pantry-recipe-images 버킷 루트에 업로드한다.
 * batch1 과 같은 위치·규격(1536x1024 jpg).
 *
 * upsert:false — 같은 이름이 이미 있으면 실패해야 한다(덮어쓰지 않는다).
 *
 * 실행: npx tsx scripts/kpantry-batch2-upload-images.ts <이미지폴더>
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

const BUCKET = 'pantry-recipe-images'

const FILES = [
  'kimchi-regional-01.jpg',
  'jeotgal-varieties-02.jpg',
  'godeungeo-jorim-01.jpg',
  'galchi-jorim-02.jpg',
  'gyeongju-ssambap-01.jpg',
  'ssam-wrapping-02.jpg',
  'sundae-plate-01.jpg',
  'sundae-dipping-02.jpg',
  'korean-regional-table-01.jpg',
]

const srcDir = process.argv[2]
if (!srcDir) {
  console.error('사용법: npx tsx scripts/kpantry-batch2-upload-images.ts <이미지폴더>')
  process.exit(1)
}

async function main() {
  // 1. 파일 존재 확인 — 하나라도 없으면 아무것도 올리지 않는다
  const missing = FILES.filter(f => !fs.existsSync(path.join(srcDir, f)))
  if (missing.length) {
    console.error('⛔ 파일 없음 — 중단:', missing.join(', '))
    process.exit(1)
  }
  console.log(`파일 ${FILES.length}개 확인 (${srcDir})\n`)

  // 2. 업로드
  let ok = 0
  for (const name of FILES) {
    const body = fs.readFileSync(path.join(srcDir, name))
    const { error } = await sb.storage.from(BUCKET).upload(name, body, {
      contentType: 'image/jpeg',
      upsert: false,
    })
    if (error) {
      console.error(`  ❌ ${name} — ${error.message}`)
      continue
    }
    ok++
    console.log(`  ✅ ${name}  ${Math.round(body.length / 1024)}KB`)
  }

  // 3. public URL 200 확인
  console.log('\n── public URL 확인 ──')
  let live = 0
  for (const name of FILES) {
    const { data } = sb.storage.from(BUCKET).getPublicUrl(name)
    const res = await fetch(data.publicUrl, { method: 'HEAD' })
    if (res.status === 200) live++
    console.log(`  ${res.status === 200 ? '✅' : '❌'} ${res.status}  ${data.publicUrl}`)
  }

  console.log(`\n업로드 ${ok}/${FILES.length}, URL 200 ${live}/${FILES.length}`)
  if (live !== FILES.length) process.exit(1)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
