/**
 * EP81 컷2 삭제 대상 확인
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
  // EP81 id 조회
  const { data: ep, error: epErr } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .eq('episode_num', 81)
    .single()
  if (epErr || !ep) throw new Error(`EP81 조회 실패: ${epErr?.message}`)
  console.log(`EP81 id: ${ep.id}`)

  // EP81 전체 버블 조회 (컷·순번 포함)
  const { data: bubbles, error: bErr } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, cut_num, order_num, speaker, korean, english, audio_url, x, y, width, height')
    .eq('episode_id', ep.id)
    .order('cut_num')
    .order('order_num')
  if (bErr) throw new Error(`버블 조회 실패: ${bErr.message}`)
  const all = bubbles ?? []

  console.log(`\nEP81 전체 버블 (${all.length}건):`)
  for (const b of all) {
    const mark = b.korean === '알았어, 비밀.' ? ' ← 삭제 대상?' : ''
    console.log(`  cut${b.cut_num} ord${b.order_num} id=${b.id} [${b.speaker}] "${b.korean}" / "${b.english}"  audio=${b.audio_url ? 'Y' : 'N'}${mark}`)
  }

  // 삭제 대상 특정
  const targets = all.filter(b => b.korean === '알았어, 비밀.' && b.speaker === '지수' && b.cut_num === 2)
  console.log(`\n삭제 대상 검색 결과: ${targets.length}건`)
  for (const t of targets) {
    console.log(`  id=${t.id} cut${t.cut_num} ord${t.order_num} [${t.speaker}] "${t.korean}" audio=${t.audio_url ?? 'none'}`)
    console.log(`  좌표: x=${t.x} y=${t.y} w=${t.width} h=${t.height}`)
  }

  if (targets.length !== 1) {
    console.log(targets.length === 0 ? '\n⛔ 삭제 대상을 찾을 수 없습니다.' : '\n⛔ 2건 이상 발견 — 중단')
    process.exit(1)
  }

  // 컷2 전체
  const cut2 = all.filter(b => b.cut_num === 2)
  console.log(`\n컷2 버블 (${cut2.length}건):`)
  for (const b of cut2) {
    console.log(`  ord${b.order_num} id=${b.id} [${b.speaker}] "${b.korean}"`)
    console.log(`    x=${b.x} y=${b.y} w=${b.width} h=${b.height}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
