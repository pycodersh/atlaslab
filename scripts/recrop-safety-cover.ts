/**
 * is-korea-safe-emergency-numbers-tourists 썸네일 다시 자르기
 *
 * 원본(03.jpg)은 675×1200 세로 사진이고 EMERGENCY 간판이 위쪽에 있다. 썸네일 칸은 3:2 에 가운데 맞춤이라
 * 간판이 잘리고 천장만 보였다. 위쪽 675×450(y 20~470)을 3:2 로 잘라 같은 이름으로 덮어쓰고,
 * CDN 캐시를 피하려고 thumbnail URL 에 ?v=2 를 붙인다.
 *
 * 실행: npx tsx scripts/recrop-safety-cover.ts <잘라 둔 jpg 경로>
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

const SLUG = 'is-korea-safe-emergency-numbers-tourists'
const KEY = `${SLUG}-cover.jpg`
const PROD = 'https://www.atlaslabstudios.com'

async function main() {
  const src = process.argv[2]
  if (!src || !fs.existsSync(src)) throw new Error('잘라 둔 jpg 경로를 인자로 준다')
  const buf = fs.readFileSync(src)

  const { error } = await sb.storage.from('blog-covers').upload(KEY, buf, { contentType: 'image/jpeg', upsert: true })
  if (error) throw new Error(`업로드 실패: ${error.message}`)
  const url = sb.storage.from('blog-covers').getPublicUrl(KEY).data.publicUrl + '?v=2'
  console.log(`↑ ${KEY} (${(buf.length / 1024).toFixed(0)} KB)`)

  const { error: upErr } = await sb.from('blog_posts').update({ thumbnail: url }).eq('slug', SLUG)
  if (upErr) throw new Error(`UPDATE 실패: ${upErr.message}`)
  console.log(`✅ thumbnail = ${url}`)

  const r = await fetch(url)
  const len = Number(r.headers.get('content-length'))
  console.log(`${r.ok && len === buf.length ? '✅' : '❌'} ${r.status} ${len} bytes (올린 파일 ${buf.length})`)
  const html = await fetch(`${PROD}/blog/en/k-patto/${SLUG}`).then(r => r.text())
  console.log(`${html.includes(`${KEY}?v=2`) ? '✅' : '❌'} 페이지가 새 썸네일 URL 을 쓴다`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
