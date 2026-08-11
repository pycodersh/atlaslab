/**
 * 전 화 highlight_text 불일치 스캔 (강화된 2-레이어 기준)
 *
 * 기준1 (확실한 오류): matched_text ⊄ text_ko
 *   → matched_text가 대사 원문에 없음
 *
 * 기준2 (스캔 강화): expr_core ⊄ matched_text
 *   → 표현 핵심부(leading ~/-/공백 제거)가 matched_text에 온전히 포함되지 않음
 *   → 예: expr_core="나라마다 달라요", matched_text="나라마다 달라" → ✗
 *
 * 레거시(소스2): kp_bubbles.highlight_text vs kp_bubbles.korean
 *   → 기준1만 적용 (expression 연결 없음)
 *
 * npx tsx scripts/scan-highlight-mismatch.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

/** kp_expressions.korean에서 leading ~/-·공백 제거하여 핵심부 추출 */
function exprCore(korean: string): string {
  return korean.replace(/^[~\-]+\s*/, '').trim()
}

async function main() {
  // episode_id → episode_num
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num')
  const epNumByStr = new Map((eps ?? []).map(e => [e.id as string, e.episode_num as number]))

  const issues1: { epNum: number; id: number; source: string; speaker: string; text: string; highlight: string; reason: string }[] = []
  const issues2: typeof issues1 = []

  // ── 소스1: kp_dialogue_expressions (role='focus') ──────────────────────────
  const { data: deAll } = await sb.from('kp_dialogue_expressions')
    .select('id, dialogue_id, expression_id, matched_text, role')
    .eq('role', 'focus')
    .not('matched_text', 'is', null)

  const dlgIds = [...new Set((deAll ?? []).map(d => d.dialogue_id as number))]
  const { data: dlgAll } = await sb.from('kp_dialogues')
    .select('id, text_ko, episode_id, speaker')
    .in('id', dlgIds)
  const dlgMap = new Map((dlgAll ?? []).map(d => [d.id as number, d]))

  const exprIds = [...new Set((deAll ?? []).filter(d => d.expression_id != null).map(d => d.expression_id as number))]
  const { data: exprAll } = await sb.from('kp_expressions')
    .select('id, korean')
    .in('id', exprIds)
  const exprMap = new Map((exprAll ?? []).map(e => [e.id as number, e.korean as string]))

  let de_total = 0

  for (const de of (deAll ?? [])) {
    const dlg = dlgMap.get(de.dialogue_id as number)
    if (!dlg) continue
    de_total++
    const text    = String(dlg.text_ko ?? '')
    const mt      = String(de.matched_text ?? '')
    const epNum   = dlg.episode_id as number  // kp_dialogues.episode_id = episode_num

    // 기준1: matched_text가 대사에 포함되지 않으면
    if (mt && !text.includes(mt)) {
      issues1.push({ epNum, id: de.id as number, source: 'DE', speaker: String(dlg.speaker ?? ''), text, highlight: mt, reason: `matched_text("${mt}") ⊄ text_ko` })
      continue  // 기준1 실패면 기준2 체크 불필요
    }

    // 기준2: expression 핵심부가 matched_text에 온전히 포함되는지
    const exprKorean = exprMap.get(de.expression_id as number)
    if (exprKorean) {
      const core = exprCore(exprKorean)
      if (core && !mt.includes(core)) {
        issues2.push({ epNum, id: de.id as number, source: 'DE', speaker: String(dlg.speaker ?? ''), text, highlight: mt, reason: `expr_core("${core}") ⊄ matched_text("${mt}")` })
      }
    }
  }

  console.log(`소스1 (kp_dialogue_expressions): ${de_total}건 검사`)

  // ── 소스2: kp_bubbles.highlight_text (레거시, EP01-30) ─────────────────────
  const { data: bubblesAll } = await sb.from('kp_bubbles')
    .select('id, panel_id, korean, highlight_text, episode_id')
    .not('highlight_text', 'is', null)
  const legacyBubbles = (bubblesAll ?? []).filter(b => b.highlight_text && String(b.highlight_text).trim() !== '')

  console.log(`소스2 (kp_bubbles.highlight_text): ${legacyBubbles.length}건 검사`)

  for (const b of legacyBubbles) {
    const text      = String(b.korean ?? '')
    const highlight = String(b.highlight_text ?? '')
    if (highlight && !text.includes(highlight)) {
      const epNum = b.episode_id as number
      issues1.push({ epNum, id: b.id as number, source: 'BH', speaker: '', text, highlight, reason: `highlight_text ⊄ korean` })
    }
  }

  // ── 결과 출력 ─────────────────────────────────────────────────────────────────
  const printGroup = (items: typeof issues1, title: string) => {
    if (items.length === 0) {
      console.log(`\n✓ ${title} — 불일치 없음`)
      return
    }
    items.sort((a, b) => a.epNum - b.epNum || a.id - b.id)
    const byEp = new Map<number, typeof items>()
    for (const m of items) {
      const arr = byEp.get(m.epNum) ?? []
      arr.push(m)
      byEp.set(m.epNum, arr)
    }
    console.log(`\n⚠ ${title}: ${items.length}건 (${byEp.size}개 화)`)
    console.log('─'.repeat(72))
    for (const [epNum, list] of byEp) {
      console.log(`EP${String(epNum).padStart(2,'0')} (${list.length}건)`)
      for (const m of list) {
        console.log(`  [${m.source}] id=${m.id}${m.speaker ? ` [${m.speaker}]` : ''} | ${m.reason}`)
        console.log(`    대사:      "${m.text}"`)
        console.log(`    highlight: "${m.highlight}"`)
      }
    }
    console.log('─'.repeat(72))
    console.log(`합계: ${items.length}건`)
  }

  printGroup(issues1, '기준1 (matched_text ⊄ text_ko) — 확실한 오류')
  printGroup(issues2, '기준2 (expr_core ⊄ matched_text) — 표현 핵심부 누락')
}
main().catch(console.error)
