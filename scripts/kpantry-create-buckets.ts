/**
 * kpantry-create-buckets.ts
 * patto Supabase에 pantry 전용 Storage 버킷 2개를 생성한다.
 * 이미 존재하면 무시한다.
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!URL || !KEY) { console.error('env 없음'); process.exit(1) }

const client = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BUCKETS = [
  { id: 'pantry-recipe-images', name: 'pantry-recipe-images', public: true },
  { id: 'pantry-ingredients',   name: 'pantry-ingredients',   public: true },
]

async function main() {
  for (const b of BUCKETS) {
    const { data, error } = await client.storage.createBucket(b.id, {
      public: b.public,
    })
    if (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log(`✅ ${b.id} — 이미 존재 (건너뜀)`)
      } else {
        console.error(`❌ ${b.id} 생성 실패: ${error.message}`)
        process.exit(1)
      }
    } else {
      console.log(`✅ ${b.id} — 생성 완료`)
    }
  }

  // 확인
  const { data: list } = await client.storage.listBuckets()
  const pantry = (list ?? []).filter(b => b.name.startsWith('pantry-'))
  console.log(`\n현재 pantry-* 버킷: ${pantry.map(b => b.name).join(', ')}`)
}

main().catch(e => { console.error(e); process.exit(1) })
