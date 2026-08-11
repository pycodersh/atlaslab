/**
 * 전 화 highlight_text가 실제 대사 원문에 포함되는지 스캔
 * - 소스1: kp_dialogue_expressions.matched_text vs kp_dialogues.text_ko
 * - 소스2: kp_bubbles.highlight_text vs kp_bubbles.korean (EP01-30 레거시)
 * npx tsx scripts/scan-highlight-mismatch.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // episode_id → episode_num
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num')
  const epNumMap = new Map((eps ?? []).map(e => [e.id as string, e.episode_num as number]))
  const epIdByNum = new Map((eps ?? []).map(e => [e.episode_num as number, e.id as string]))

  const mismatches: { epNum: number; id: number; source: string; speaker: string; text: string; highlight: string }[] = []

  // ── 소스1: kp_dialogue_expressions.matched_text vs kp_dialogues.text_ko ──
  const { data: deAll } = await sb.from('kp_dialogue_expressions')
    .select('dialogue_id, matched_text, role')
    .eq('role', 'focus')
    .not('matched_text', 'is', null)

  const dlgIds = [...new Set((deAll ?? []).map(d => d.dialogue_id as number))]
  const { data: dlgAll } = await sb.from('kp_dialogues')
    .select('id, text_ko, episode_id, speaker')
    .in('id', dlgIds)
  const dlgMap = new Map((dlgAll ?? []).map(d => [d.id as number, d]))

  // scenes → episode_id 매핑 (kp_dialogues에 episode_id가 직접 없을 수 있어 scene 경유)
  // kp_dialogues.episode_id는 number (episode_num)
  for (const de of (deAll ?? [])) {
    const dlg = dlgMap.get(de.dialogue_id as number)
    if (!dlg) continue
    const text = String(dlg.text_ko ?? '')
    const highlight = String(de.matched_text ?? '')
    if (highlight && !text.includes(highlight)) {
      const epNum = dlg.episode_id as number  // episode_id in kp_dialogues = episode_num
      mismatches.push({ epNum, id: de.dialogue_id as number, source: 'dialogue_expressions', speaker: dlg.speaker as string, text, highlight })
    }
  }

  console.log(`소스1 (kp_dialogue_expressions): ${(deAll ?? []).length}건 검사`)

  // ── 소스2: kp_bubbles.highlight_text vs kp_bubbles.korean (레거시) ──
  const { data: bubblesAll } = await sb.from('kp_bubbles')
    .select('id, panel_id, korean, highlight_text, episode_id')
    .not('highlight_text', 'is', null)
  const legacyBubbles = (bubblesAll ?? []).filter(b => b.highlight_text && String(b.highlight_text).trim() !== '')

  console.log(`소스2 (kp_bubbles.highlight_text): ${legacyBubbles.length}건 검사`)

  for (const b of legacyBubbles) {
    const text = String(b.korean ?? '')
    const highlight = String(b.highlight_text ?? '')
    if (highlight && !text.includes(highlight)) {
      const epNum = b.episode_id as number
      mismatches.push({ epNum, id: b.id as number, source: 'bubble_hl', speaker: '', text, highlight })
    }
  }

  // ── 결과 ──
  if (mismatches.length === 0) {
    console.log('\n✓ 전 화 highlight_text 전부 대사에 포함됨 — 불일치 없음')
    return
  }

  mismatches.sort((a, b) => a.epNum - b.epNum || a.id - b.id)
  const byEp = new Map<number, typeof mismatches>()
  for (const m of mismatches) {
    const arr = byEp.get(m.epNum) ?? []
    arr.push(m)
    byEp.set(m.epNum, arr)
  }

  console.log(`\n⚠ highlight_text 불일치: ${mismatches.length}건 (${byEp.size}개 화)\n`)
  console.log('─'.repeat(72))
  for (const [epNum, items] of byEp) {
    console.log(`EP${String(epNum).padStart(2,'0')} (${items.length}건)`)
    for (const m of items) {
      const src = m.source === 'dialogue_expressions' ? 'DE' : 'BH'
      console.log(`  [${src}] id=${m.id}${m.speaker ? ` [${m.speaker}]` : ''}`)
      console.log(`    대사:      "${m.text}"`)
      console.log(`    highlight: "${m.highlight}"`)
    }
  }
  console.log('─'.repeat(72))
  console.log(`\n합계: ${mismatches.length}건`)
}
main().catch(console.error)
