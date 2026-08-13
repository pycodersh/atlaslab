/**
 * EP61~70 음성 생성 현황 확인
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: episodes, error: epErr } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .gte('episode_num', 61)
    .lte('episode_num', 70)
    .order('episode_num')

  if (epErr) throw new Error(`episodes 조회 실패: ${epErr.message}`)
  if (!episodes?.length) { console.log('EP61~70 에피소드 없음'); return }

  const epIds = episodes.map(e => e.id)
  const epNumMap = new Map(episodes.map(e => [e.id, e.episode_num]))

  const { data: bubbles, error: bErr } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, speaker, korean, audio_url')
    .in('episode_id', epIds)
    .order('episode_id')
    .order('order_num')

  if (bErr) throw new Error(`bubbles 조회 실패: ${bErr.message}`)
  const all = bubbles ?? []

  // EP별 집계
  console.log('\n── EP61~70 현황 ───────────────────────────────')
  console.log('EP   | 전체 | 완료(URL있음) | 미완(URL없음)')
  console.log('-----|------|--------------|-------------')

  let totalAll = 0, totalDone = 0, totalPending = 0
  for (const ep of episodes) {
    const rows = all.filter(b => b.episode_id === ep.id)
    const done = rows.filter(b => b.audio_url).length
    const pend = rows.filter(b => !b.audio_url).length
    totalAll += rows.length; totalDone += done; totalPending += pend
    console.log(`EP${String(ep.episode_num).padStart(2,'0')} |  ${String(rows.length).padStart(3)} |           ${String(done).padStart(3)} |          ${String(pend).padStart(3)}`)
  }
  console.log('-----|------|--------------|-------------')
  console.log(`합계 |  ${String(totalAll).padStart(3)} |           ${String(totalDone).padStart(3)} |          ${String(totalPending).padStart(3)}`)
  console.log(`\n오늘 한도(85건) 기준: ${totalPending <= 85 ? `✅ 전부 처리 가능 (${totalPending}건)` : `⚠️  ${totalPending}건 중 오늘은 85건만 처리`}`)
}

main().catch(e => { console.error(e); process.exit(1) })
