/**
 * 다중 표현이 연결된 dialogue들의 kp_bubbles.dialogue_id 연결
 *
 * 대상: 한 dialogue에 kp_dialogue_expressions 행이 2건 이상인 21건
 * 조건:
 *   1. kp_bubbles.korean === kp_dialogues.text_ko (글자 단위 정확 일치)
 *   2. kp_bubbles.dialogue_id IS NULL (이미 연결된 것은 건드리지 않음)
 * 불일치/이미연결 → 건너뜀 + 목록 출력
 *
 * --apply 없으면 dry-run (변경 없음)
 * position·widthPct·lines 등 레이아웃 값 불변
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')

// 조사에서 확인된 21개 dialogue IDs (다중 표현 연결)
const TARGET_DLG_IDS = [
  10383, 10393, 11100, 11221, 11230, 11275,
  11460, 11479, 11499, 11598, 11623, 11632,
  11640, 11693, 11732, 11746, 11773, 11805,
  11837, 11887, 11892,
]

async function main() {
  console.log(`\n=== kp_bubbles.dialogue_id 연결 (다중 표현 21건) ${APPLY ? '[APPLY]' : '[DRY-RUN]'} ===\n`)

  // ── 1. dialogue 정보 조회 ────────────────────────────────────────────────────
  const { data: dlgRows } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, text_ko')
    .in('id', TARGET_DLG_IDS)
    .order('id')
  const dlgList = (dlgRows ?? []) as { id: number; episode_id: number; text_ko: string }[]
  console.log(`kp_dialogues 조회: ${dlgList.length}건\n`)

  // ── 2. episode_num → UUID 매핑 ───────────────────────────────────────────────
  const epNums = [...new Set(dlgList.map(d => d.episode_id))]
  const { data: epRows } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .in('episode_num', epNums)
  const epUuidMap = new Map((epRows ?? []).map(e => [e.episode_num as number, e.id as string]))

  // ── 3. kp_dialogue_expressions role 확인 ────────────────────────────────────
  const { data: exprRows } = await sb
    .from('kp_dialogue_expressions')
    .select('dialogue_id, expression_id, matched_text, role')
    .in('dialogue_id', TARGET_DLG_IDS)
    .order('dialogue_id')
  type ExprRow = { dialogue_id: number; expression_id: number; matched_text: string; role: string }
  const exprByDlg = new Map<number, ExprRow[]>()
  for (const r of (exprRows ?? []) as ExprRow[]) {
    const arr = exprByDlg.get(r.dialogue_id) ?? []
    arr.push(r)
    exprByDlg.set(r.dialogue_id, arr)
  }

  // ── 4. 각 dialogue 처리 ──────────────────────────────────────────────────────
  const linked: { dlgId: number; ep: number; bubbleId: string; text: string }[] = []
  const skipped: { dlgId: number; ep: number; reason: string; text: string }[] = []

  for (const dlg of dlgList) {
    const epNum = dlg.episode_id
    const uuid  = epUuidMap.get(epNum)
    if (!uuid) {
      skipped.push({ dlgId: dlg.id, ep: epNum, reason: 'episode UUID 없음', text: dlg.text_ko })
      continue
    }

    // kp_dialogue_expressions role 확인
    const exprs = exprByDlg.get(dlg.id) ?? []
    const focusExprs = exprs.filter(e => e.role === 'focus')
    const roleNote = focusExprs.length >= 2
      ? `role=focus ${focusExprs.length}건 ✅`
      : focusExprs.length === 1
      ? `role=focus 1건 (하이라이트 1개만 표시됨)`
      : `role=focus 없음 ⚠️ — highlightMap 미반영`

    // kp_bubbles에서 텍스트 일치 + dialogue_id=NULL 인 버블 찾기
    const { data: bubbleRows } = await sb
      .from('kp_bubbles')
      .select('id, korean, dialogue_id, expression_id')
      .eq('episode_id', uuid)
      .eq('korean', dlg.text_ko)
    type BubRow = { id: string; korean: string; dialogue_id: number | null; expression_id: number | null }
    const bubbles = (bubbleRows ?? []) as BubRow[]

    const nullBubbles = bubbles.filter(b => b.dialogue_id === null)
    const linkedBubbles = bubbles.filter(b => b.dialogue_id !== null)

    if (bubbles.length === 0) {
      skipped.push({ dlgId: dlg.id, ep: epNum, reason: '텍스트 일치 버블 없음 (korean≠text_ko)', text: dlg.text_ko })
      console.log(`⚠️  EP${String(epNum).padStart(2,'0')} dlg=${dlg.id}  텍스트 불일치 — 건너뜀`)
      console.log(`   text_ko="${dlg.text_ko.slice(0,50)}"`)
      continue
    }
    if (linkedBubbles.length > 0 && nullBubbles.length === 0) {
      // 이미 모두 연결됨
      console.log(`✓  EP${String(epNum).padStart(2,'0')} dlg=${dlg.id}  이미 연결됨 (bubble.dialogue_id=${linkedBubbles[0].dialogue_id})  ${roleNote}`)
      continue
    }

    // 연결 대상
    for (const b of nullBubbles) {
      console.log(`${ APPLY ? '→' : '~'} EP${String(epNum).padStart(2,'0')} dlg=${dlg.id}  bubble_id=${b.id}  "${dlg.text_ko.slice(0,35)}"`)
      console.log(`   ${roleNote}`)

      if (APPLY) {
        const { error } = await sb
          .from('kp_bubbles')
          .update({ dialogue_id: dlg.id })
          .eq('id', b.id)
        if (error) {
          console.error(`   ⛔ UPDATE 실패: ${error.message}`)
          skipped.push({ dlgId: dlg.id, ep: epNum, reason: `UPDATE 실패: ${error.message}`, text: dlg.text_ko })
          continue
        }
        console.log(`   ✅ dialogue_id=${dlg.id} 설정 완료`)
      }
      linked.push({ dlgId: dlg.id, ep: epNum, bubbleId: b.id, text: dlg.text_ko })
    }
  }

  // ── 5. 요약 ─────────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(55)}`)
  console.log(`연결 ${APPLY ? '완료' : '예정'}: ${linked.length}건  건너뜀: ${skipped.length}건`)

  if (skipped.length > 0) {
    console.log('\n⚠️  건너뜀 목록:')
    for (const s of skipped) {
      console.log(`  EP${String(s.ep).padStart(2,'0')} dlg=${s.dlgId}  ${s.reason}`)
      console.log(`    "${s.text.slice(0,50)}"`)
    }
  }

  if (!APPLY) {
    console.log(`\n실제 적용하려면: npx tsx scripts/_link_multi_expr_bubbles.ts --apply`)
  }
}

main().catch(e => { console.error('⛔', e.message); process.exit(1) })
