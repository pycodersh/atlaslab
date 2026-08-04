/**
 * kp_dialogue_expressions 재구축 - 실제 INSERT
 *
 * 규칙:
 * - kp_expressions.korean에서 ~ 슬롯 제거한 어구로 kp_dialogues.text_ko 매칭
 * - 한 대사에 여러 패턴 걸리면 가장 긴 matched_text 하나만
 * - role = 'focus'
 * - 기존 데이터 전체 삭제 후 재삽입
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function extractSearchTerms(korean: string): string[] {
  return korean.split('~').map(s => s.trim()).filter(s => s.length > 0)
}

function matchesAll(text: string, terms: string[]): boolean {
  return terms.length > 0 && terms.every(t => text.includes(t))
}

type ExprRow = { id: number; korean: string }
type DlgRow = { id: number; episode_id: number; text_ko: string }
type EpRow = { id: number; episode_num: number }

async function main() {
  console.log('=== kp_dialogue_expressions INSERT ===\n')

  const [{ data: exprRaw }, { data: dlgRaw }, { data: epRaw }] = await Promise.all([
    sb.from('kp_expressions').select('id, korean').order('id'),
    sb.from('kp_dialogues').select('id, episode_id, text_ko').order('id'),
    sb.from('kp_episodes').select('id, episode_num'),
  ])

  const expressions = (exprRaw ?? []) as ExprRow[]
  const dialogues = (dlgRaw ?? []) as DlgRow[]
  const episodes = (epRaw ?? []) as EpRow[]
  const epNumById = new Map(episodes.map(e => [e.id, e.episode_num]))

  console.log(`kp_expressions: ${expressions.length}개`)
  console.log(`kp_dialogues:   ${dialogues.length}개`)

  // ── EP30 조사 ──────────────────────────────────────────────────────────────
  const ep30 = episodes.find(e => e.episode_num === 30)
  console.log(`\n[EP30 조사]`)
  if (!ep30) {
    console.log('  kp_episodes에 EP30 없음 — episode_num=30 레코드 없음')
  } else {
    console.log(`  kp_episodes EP30: id=${ep30.id}`)
    const ep30Dlgs = dialogues.filter(d => d.episode_id === ep30.id)
    console.log(`  kp_dialogues EP30 대사 수: ${ep30Dlgs.length}`)
    if (ep30Dlgs.length > 0) {
      console.log(`  대사 샘플: "${ep30Dlgs[0].text_ko?.slice(0, 50)}"`)
      // 매칭 시도
      let ep30Matches = 0
      for (const expr of expressions) {
        const terms = extractSearchTerms(expr.korean)
        if (!terms.length) continue
        for (const dlg of ep30Dlgs) {
          if (matchesAll(dlg.text_ko, terms)) ep30Matches++
        }
      }
      console.log(`  EP30 매칭 가능 건수: ${ep30Matches}`)
      if (ep30Matches === 0) {
        console.log(`  ↑ 원인: EP30 대사에 기존 패턴 어구가 없음 (EP30은 독립 씬일 수 있음)`)
      }
    } else {
      console.log(`  ↑ 원인: kp_dialogues에 EP30(episode_id=${ep30.id}) 대사가 없음`)
    }
  }

  // ── 매칭 + 대화당 최장 패턴 dedup ─────────────────────────────────────────
  // Map<dialogue_id, {expression_id, matched_text, termLen}>
  const bestPerDialogue = new Map<number, { expression_id: number; matched_text: string; termLen: number }>()

  for (const expr of expressions) {
    const terms = extractSearchTerms(expr.korean)
    if (!terms.length) continue
    const longestTerm = terms.reduce((a, b) => a.length >= b.length ? a : b)

    for (const dlg of dialogues) {
      if (!dlg.text_ko || !matchesAll(dlg.text_ko, terms)) continue
      const existing = bestPerDialogue.get(dlg.id)
      if (!existing || longestTerm.length > existing.termLen) {
        bestPerDialogue.set(dlg.id, {
          expression_id: expr.id,
          matched_text: longestTerm,
          termLen: longestTerm.length,
        })
      }
    }
  }

  const toInsert = [...bestPerDialogue.entries()].map(([dialogue_id, v]) => ({
    dialogue_id,
    expression_id: v.expression_id,
    matched_text: v.matched_text,
    role: 'focus',
  }))

  console.log(`\n[결과]`)
  console.log(`  dedup 후 INSERT 건수: ${toInsert.length}건`)

  // EP별 분포
  const byEp = new Map<number, number>()
  for (const [dlgId] of bestPerDialogue) {
    const dlg = dialogues.find(d => d.id === dlgId)
    const epNum = dlg ? (epNumById.get(dlg.episode_id) ?? 0) : 0
    byEp.set(epNum, (byEp.get(epNum) ?? 0) + 1)
  }
  const CHECK = [1, 5, 10, 20, 30, 31, 40, 50, 60, 70, 80, 90, 100]
  console.log('\n  EP별 INSERT 수:')
  for (const n of CHECK) {
    console.log(`    EP${String(n).padStart(3, '0')}: ${byEp.get(n) ?? 0}건`)
  }

  // ── 기존 삭제 ──────────────────────────────────────────────────────────────
  console.log('\n[기존 데이터 삭제]')
  const { error: delErr } = await sb.from('kp_dialogue_expressions').delete().neq('id', 0)
  if (delErr) { console.error('삭제 실패:', delErr); process.exit(1) }
  console.log('  삭제 완료')

  // ── INSERT in batches ──────────────────────────────────────────────────────
  console.log('\n[INSERT 시작]')
  let inserted = 0
  const BATCH = 500
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)
    const { error } = await sb.from('kp_dialogue_expressions').insert(batch)
    if (error) { console.error(`INSERT 실패 (batch ${i}):`, error); process.exit(1) }
    inserted += batch.length
    process.stdout.write(`  ${inserted}/${toInsert.length} 완료...\r`)
  }

  console.log(`\n\n=== 완료: 총 ${inserted}건 INSERT 됨 ===`)
}

main().catch(e => { console.error(e); process.exit(1) })
