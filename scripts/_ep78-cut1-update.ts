/**
 * EP78 컷1 민준 대사 수정
 * korean: "에마, 한국에 얼마나 있을 거예요?" → "에마, 한국에 얼마나 있을 거야?"
 * highlight_text: "얼마나 있을 거"
 * 영문 번역 유지
 * 음성 있으면 삭제
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
  // EP78 전체 버블 조회
  const { data: all, error: allErr } = await sb
    .from('kp_bubbles')
    .select('id, panel_id, order_num, speaker, korean, translations, audio_url, highlight_text')
    .eq('episode_id', 78)
    .order('panel_id')
    .order('order_num')
  if (allErr) throw new Error(`EP78 조회 실패: ${allErr.message}`)

  const panelIds = [...new Set((all ?? []).map(b => b.panel_id))].sort((a, b) => a - b)
  const panelCutNum = new Map(panelIds.map((pid, i) => [pid, i + 1]))

  // 1. EP78 전체 출력
  console.log(`\n── EP78 전체 대사 (${all?.length ?? 0}건) ─────────────────────────────`)
  let prevPanel = -1
  for (const b of all ?? []) {
    const cutNum = panelCutNum.get(b.panel_id)
    if (b.panel_id !== prevPanel) { console.log(`\n  [컷${cutNum}] panel_id=${b.panel_id}`); prevPanel = b.panel_id }
    console.log(`    ord${b.order_num} id=${b.id} [${b.speaker}] "${b.korean}"  hl="${b.highlight_text ?? ''}"  audio=${b.audio_url ? 'Y' : 'N'}`)
  }

  // 2. "얼마나 있을 거예요?" 다른 컷에 있나?
  const dupe = (all ?? []).filter(b => b.korean.includes('얼마나 있을 거예요?'))
  console.log(`\n'얼마나 있을 거예요?' 포함 버블: ${dupe.length}건`)
  for (const d of dupe) console.log(`  id=${d.id} 컷${panelCutNum.get(d.panel_id)} [${d.speaker}] "${d.korean}"`)

  // 3. 수정 대상 확인 (컷1, 민준, 해당 대사)
  const targets = (all ?? []).filter(b =>
    b.korean === '에마, 한국에 얼마나 있을 거예요?' &&
    b.speaker === 'minjun' &&
    panelCutNum.get(b.panel_id) === 1
  )
  console.log(`\n수정 대상: ${targets.length}건`)
  if (targets.length === 0) throw new Error('수정 대상 없음 — 중단')
  if (targets.length > 1) { console.error('⛔ 2건 이상 — 중단'); process.exit(1) }

  const t = targets[0]
  console.log(`  id=${t.id} panel=${t.panel_id} [${t.speaker}] "${t.korean}" audio=${t.audio_url ?? 'null'}`)

  // 4. 음성 파일 삭제 (있을 경우)
  if (t.audio_url) {
    const urlPath = t.audio_url.replace(`${SUPABASE_URL}/storage/v1/object/public/audio/`, '')
    console.log(`\nStorage 삭제: audio/${urlPath}`)
    const { error: stErr } = await sb.storage.from('audio').remove([urlPath])
    if (stErr) throw new Error(`Storage 삭제 실패: ${stErr.message}`)
    console.log('  ✅ Storage 파일 삭제 완료')
  } else {
    console.log('\naudio_url=null — Storage 파일 없음')
  }

  // 5. DB 수정
  const { error: upErr } = await sb
    .from('kp_bubbles')
    .update({
      korean: '에마, 한국에 얼마나 있을 거야?',
      highlight_text: '얼마나 있을 거',
      audio_url: t.audio_url ? null : undefined,  // 음성 있었으면 URL도 null로
    })
    .eq('id', t.id)
  if (upErr) throw new Error(`DB 수정 실패: ${upErr.message}`)
  console.log('\n✅ DB 수정 완료')

  // 6. 수정 결과 확인
  const { data: updated, error: chkErr } = await sb
    .from('kp_bubbles')
    .select('id, korean, translations, highlight_text, audio_url')
    .eq('id', t.id)
    .single()
  if (chkErr) throw new Error(`결과 확인 실패: ${chkErr.message}`)
  console.log('\n수정 후:')
  console.log(`  korean: "${updated.korean}"`)
  console.log(`  highlight_text: "${updated.highlight_text}"`)
  console.log(`  translations: ${JSON.stringify(updated.translations)}`)
  console.log(`  audio_url: ${updated.audio_url ?? 'null'}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
