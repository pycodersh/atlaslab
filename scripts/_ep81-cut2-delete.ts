/**
 * EP81 컷2 지수 대사 삭제
 * 삭제 대상: id=4028 [jisu] "알았어, 비밀."
 * 에러 시 즉시 중단.
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
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

async function main() {
  // ── 1. 삭제 대상 재확인 ────────────────────────────────────────────────────
  const { data: targets, error: findErr } = await sb
    .from('kp_bubbles')
    .select('id, panel_id, episode_id, order_num, speaker, korean, translations, audio_url')
    .eq('episode_id', 81)
    .eq('speaker', 'jisu')
    .eq('korean', '알았어, 비밀.')

  if (findErr) throw new Error(`조회 실패: ${findErr.message}`)
  console.log(`삭제 대상 검색: ${targets?.length ?? 0}건`)

  if (!targets || targets.length === 0) throw new Error('삭제 대상 없음 — 중단')
  if (targets.length > 1) {
    console.error('⛔ 2건 이상 발견 — 중단')
    for (const t of targets) console.error(`  id=${t.id} panel=${t.panel_id} "${t.korean}"`)
    process.exit(1)
  }

  const target = targets[0]
  console.log(`\n삭제 예정:`)
  console.log(`  id=${target.id} | panel_id=${target.panel_id} | order_num=${target.order_num}`)
  console.log(`  speaker=${target.speaker} | korean="${target.korean}"`)
  console.log(`  translations=${JSON.stringify(target.translations)}`)
  console.log(`  audio_url=${target.audio_url ?? 'null (없음)'}`)

  // ── 2. Storage 음성 파일 삭제 (있을 경우만) ────────────────────────────────
  if (target.audio_url) {
    // URL에서 버킷 경로 추출: .../public/audio/bubbles/epXX/b_ID.mp3
    const urlPath = target.audio_url.replace(`${SUPABASE_URL}/storage/v1/object/public/audio/`, '')
    console.log(`\nStorage 파일 삭제: audio/${urlPath}`)
    const { error: storageErr } = await sb.storage.from('audio').remove([urlPath])
    if (storageErr) throw new Error(`Storage 삭제 실패: ${storageErr.message}`)
    console.log('  ✅ Storage 파일 삭제 완료')
  } else {
    console.log('\nStorage 파일: 없음 (audio_url=null) — 건너뜀')
  }

  // ── 3. DB 행 삭제 ──────────────────────────────────────────────────────────
  console.log(`\nDB 삭제: kp_bubbles id=${target.id}`)
  const { error: delErr } = await sb
    .from('kp_bubbles')
    .delete()
    .eq('id', target.id)
    .eq('episode_id', 81) // 다른 EP 보호
  if (delErr) throw new Error(`DB 삭제 실패: ${delErr.message}`)
  console.log('  ✅ DB 행 삭제 완료')

  // ── 4. 순번 재정리 — 같은 panel 내 order_num > 삭제된 것 ───────────────────
  // id=4028은 panel 2393의 order_num=2(마지막)이므로 재정리 불필요
  // 그래도 확인 차 조회
  const { data: remaining, error: remErr } = await sb
    .from('kp_bubbles')
    .select('id, order_num, speaker, korean')
    .eq('panel_id', target.panel_id)
    .order('order_num')
  if (remErr) throw new Error(`남은 버블 조회 실패: ${remErr.message}`)

  console.log(`\npanel ${target.panel_id} 남은 버블 (${remaining?.length ?? 0}건):`)
  for (const r of remaining ?? []) {
    console.log(`  order_num=${r.order_num} id=${r.id} [${r.speaker}] "${r.korean}"`)
  }

  // ── 5. EP81 전체 버블 최종 목록 ───────────────────────────────────────────
  const { data: all, error: allErr } = await sb
    .from('kp_bubbles')
    .select('id, panel_id, order_num, speaker, korean, audio_url')
    .eq('episode_id', 81)
    .order('panel_id')
    .order('order_num')
  if (allErr) throw new Error(`전체 목록 조회 실패: ${allErr.message}`)

  // panel_id → 컷 번호 매핑 (오름차순 순서)
  const panelIds = [...new Set((all ?? []).map(b => b.panel_id))].sort((a, b) => a - b)
  const panelCutNum = new Map(panelIds.map((pid, i) => [pid, i + 1]))

  console.log(`\n── EP81 전체 대사 최종 목록 (${all?.length ?? 0}건) ──────────────────────`)
  let prevPanel = -1
  for (const b of all ?? []) {
    const cutNum = panelCutNum.get(b.panel_id)
    if (b.panel_id !== prevPanel) {
      console.log(`\n  [컷${cutNum}] panel_id=${b.panel_id}`)
      prevPanel = b.panel_id
    }
    console.log(`    ord${b.order_num} id=${b.id} [${b.speaker}] "${b.korean}"`)
  }

  // 컷2(panel 2393) 확인
  const cut2 = (all ?? []).filter(b => b.panel_id === target.panel_id)
  console.log(`\n── 검증: 삭제된 panel(${target.panel_id}) 잔여 버블 ──`)
  if (cut2.length === 1 && cut2[0].speaker === 'emma') {
    console.log(`  ✅ 에마 대사 1건만 남음: "${cut2[0].korean}"`)
  } else {
    console.log(`  ⚠️  예상과 다름:`, JSON.stringify(cut2))
  }
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
