import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  // 1. kp_panels 전체 개수
  const { count, error: ce } = await sb.from('kp_panels').select('id', { count: 'exact', head: true })
  console.log(`kp_panels 전체: ${ce?.message ?? count}개`)

  // 2. 샘플 10개
  const { data, error: de } = await sb.from('kp_panels').select('*').limit(10)
  if (de) { console.log('오류:', de.message); return }
  if (!data?.length) { console.log('데이터 없음'); return }

  console.log('\n샘플 10개:')
  for (const r of data) console.log(JSON.stringify(r))

  // 3. episode_id 분포
  const { data: epIds } = await sb.from('kp_panels').select('episode_id').limit(500)
  const uniq = [...new Set(epIds?.map(r => r.episode_id))].sort((a, b) => a - b)
  console.log('\nepisode_id 분포:', uniq.join(', '))

  // 4. image_url 있는 EP01 (episode_id 1번)
  const { data: ep1panels } = await sb
    .from('kp_panels')
    .select('id, episode_id, order_num, image_url')
    .eq('episode_id', uniq[0])
    .order('order_num')
  console.log(`\n첫 episode_id(${uniq[0]}) 패널:`)
  for (const p of ep1panels ?? []) console.log('  ', JSON.stringify(p))

  // 5. image_url 전체 목록 (첫 5)
  const { data: urlRows } = await sb.from('kp_panels').select('episode_id, order_num, image_url')
    .not('image_url', 'is', null).limit(5)
  console.log('\nimage_url 있는 패널 (첫 5):')
  for (const r of urlRows ?? []) console.log('  ', JSON.stringify(r))
}

main().catch(console.error)
