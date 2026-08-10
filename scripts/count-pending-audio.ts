import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // EP41~50 전체 대사 수 + pending(audio_url null) 수, 화별
  const { data, error } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, audio_url')
    .gte('episode_id', 41)
    .lte('episode_id', 50)
    .order('episode_id', { ascending: true })

  if (error) { console.error(error); process.exit(1) }

  // 화별 집계
  const epMap: Record<number, { total: number; pending: number }> = {}
  for (const row of data ?? []) {
    const ep = row.episode_id as number
    if (!epMap[ep]) epMap[ep] = { total: 0, pending: 0 }
    epMap[ep].total++
    if (!row.audio_url) epMap[ep].pending++
  }

  let grandTotal = 0
  let grandPending = 0
  for (const ep of Object.keys(epMap).map(Number).sort((a,b)=>a-b)) {
    const { total, pending } = epMap[ep]
    grandTotal += total
    grandPending += pending
    console.log(`EP${String(ep).padStart(2,'0')}: total=${total}, pending=${pending}`)
  }
  console.log(`─────────────────────────────`)
  console.log(`EP41~50 합계: total=${grandTotal}, pending=${grandPending}`)

  // EP41~48 부분합도 계산
  let sub48Total = 0
  let sub48Pending = 0
  for (const ep of Object.keys(epMap).map(Number).sort((a,b)=>a-b).filter(e => e <= 48)) {
    sub48Total += epMap[ep].total
    sub48Pending += epMap[ep].pending
  }
  console.log(`EP41~48 합계: total=${sub48Total}, pending=${sub48Pending}`)
}

main()
