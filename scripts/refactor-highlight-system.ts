/**
 * 하이라이트 시스템 전면 재정비
 *
 * 1. kp_dialogue_expressions.matched_text를 kp_bubbles.highlight_text로 업데이트
 *    (EP01~10 focus-linked bubble들, highlight_text 있는 경우)
 * 2. dialogue_id IS NULL AND highlight_text NOT NULL AND expression_id IS NULL
 *    → highlight_text = null (더 이상 사용 안 함)
 *
 * 실행: npx tsx scripts/refactor-highlight-system.ts
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

function log(msg: string) { console.log(`[refactor-highlight] ${msg}`) }

// ── Step 1: kp_dialogue_expressions.matched_text 품질 개선 ──────────────────
async function fixMatchedText() {
  log('=== Step 1: kp_dialogue_expressions.matched_text 개선 ===')

  // focus 연결된 bubble들 (dialogue_id 있는 것)
  const { data: bubbles } = await sb.from('kp_bubbles')
    .select('id, dialogue_id, highlight_text')
    .not('dialogue_id', 'is', null)
    .not('highlight_text', 'is', null)

  if (!bubbles || bubbles.length === 0) {
    log('  대상 bubble 없음')
    return
  }

  const dialogueIds = bubbles.map(b => b.dialogue_id as number)
  const { data: focusRows } = await sb.from('kp_dialogue_expressions')
    .select('id, dialogue_id, matched_text, role')
    .in('dialogue_id', dialogueIds)
    .eq('role', 'focus')

  if (!focusRows || focusRows.length === 0) {
    log('  focus expression 없음')
    return
  }

  // dialogue_id → bubble highlight_text 매핑
  const hlMap = new Map<number, string>()
  for (const b of bubbles) {
    if (b.dialogue_id != null && b.highlight_text) {
      hlMap.set(b.dialogue_id as number, b.highlight_text as string)
    }
  }

  let updated = 0
  let skipped = 0
  for (const row of focusRows) {
    const newText = hlMap.get(row.dialogue_id as number)
    if (!newText) { skipped++; continue }
    if (row.matched_text === newText) { skipped++; continue }

    const { error } = await sb.from('kp_dialogue_expressions')
      .update({ matched_text: newText })
      .eq('id', row.id)

    if (error) {
      console.error(`  ❌ id=${row.id}:`, error.message)
      continue
    }
    log(`  ✓ dlg_expr id=${row.id}: "${row.matched_text}" → "${newText}"`)
    updated++
  }

  log(`  완료: ${updated} 업데이트, ${skipped} 스킵`)
}

// ── Step 2: 불필요한 highlight_text 제거 ───────────────────────────────────
async function clearOrphanHighlightText() {
  log('\n=== Step 2: 고아 highlight_text 제거 ===')
  log('  조건: dialogue_id IS NULL AND highlight_text NOT NULL AND expression_id IS NULL')

  const { data: targets } = await sb.from('kp_bubbles')
    .select('id, korean, highlight_text, episode_id')
    .is('dialogue_id', null)
    .not('highlight_text', 'is', null)
    .is('expression_id', null)

  if (!targets || targets.length === 0) {
    log('  대상 없음')
    return
  }

  // episode_id → episode_num
  const epIds = [...new Set(targets.map(b => b.episode_id))]
  const { data: eps } = await sb.from('kp_episodes')
    .select('id, episode_num').in('id', epIds)
  const epMap: Record<number, number> = {}
  for (const e of (eps ?? [])) epMap[e.id] = e.episode_num

  log(`  총 ${targets.length}개 bubble highlight_text 제거:`)
  const epGroups: Record<number, number> = {}
  for (const t of targets) {
    const epNum = epMap[t.episode_id] ?? 0
    epGroups[epNum] = (epGroups[epNum] ?? 0) + 1
  }
  for (const [epNum, count] of Object.entries(epGroups).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    log(`    EP${String(epNum).padStart(2, '0')}: ${count}개`)
  }

  const ids = targets.map(t => t.id)
  const CHUNK = 50
  let cleared = 0
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK)
    const { error } = await sb.from('kp_bubbles')
      .update({ highlight_text: null })
      .in('id', chunk)
    if (error) {
      console.error(`  ❌ chunk ${i}~${i + CHUNK}:`, error.message)
      continue
    }
    cleared += chunk.length
    log(`  진행: ${cleared}/${ids.length}`)
  }

  log(`  완료: ${cleared}개 highlight_text 제거`)
}

// ── 검증 ───────────────────────────────────────────────────────────────────
async function verify() {
  log('\n=== 검증 ===')

  const { data: remaining } = await sb.from('kp_bubbles')
    .select('id, korean, highlight_text, dialogue_id, expression_id')
    .not('highlight_text', 'is', null)

  log(`  highlight_text 남아있는 bubble: ${remaining?.length}`)
  remaining?.forEach(b => {
    const info = `dlg=${b.dialogue_id ?? 'null'} expr=${b.expression_id ?? 'null'}`
    log(`    id=${b.id} ko=${b.korean.slice(0, 20)} hl=${b.highlight_text} [${info}]`)
  })

  const { data: focusRows } = await sb.from('kp_dialogue_expressions')
    .select('dialogue_id, matched_text, expression_id')
    .eq('role', 'focus')
    .limit(5)
  log(`\n  kp_dialogue_expressions focus 샘플 (5개):`)
  focusRows?.forEach(r => log(`    dlg=${r.dialogue_id} expr=${r.expression_id} matched="${r.matched_text}"`))
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  await fixMatchedText()
  await clearOrphanHighlightText()
  await verify()
  log('\n=== 완료 ===')
}

main().catch(console.error)
