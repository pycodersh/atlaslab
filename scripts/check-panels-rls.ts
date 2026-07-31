import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function main() {
  // 1. Service role — 전체 컬럼 확인
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
  const { data: panels, error: ae } = await admin
    .from('kp_panels')
    .select('id, order_num, type, image_url, layout, height_ratio')
    .eq('episode_id', 1)
    .order('order_num')

  console.log('=== EP01 kp_panels (service role) ===')
  if (ae) console.log('오류:', ae.message)
  else for (const p of panels ?? []) console.log(JSON.stringify(p))

  // 2. Anon key — 브라우저에서 실제로 사용하는 클라이언트
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
  const { data: anonPanels, error: be } = await anon
    .from('kp_panels')
    .select('id, order_num, type, image_url')
    .eq('episode_id', 1)
    .order('order_num')

  console.log('\n=== Anon 클라이언트 읽기 결과 ===')
  if (be) console.log('오류:', be.message)
  else {
    console.log(`행 수: ${anonPanels?.length ?? 0}`)
    for (const p of anonPanels ?? []) console.log(JSON.stringify(p))
  }

  // 3. kp_episodes도 anon으로 읽을 수 있는지
  const { data: anonEp, error: ce } = await anon
    .from('kp_episodes')
    .select('id, episode_num, title')
    .eq('episode_num', 1)
    .single()
  console.log('\n=== kp_episodes anon 읽기 ===')
  if (ce) console.log('오류:', ce.message)
  else console.log(JSON.stringify(anonEp))
}

main().catch(console.error)
