/**
 * EP12~30 kp_bubbles에 dialogue_id 연결
 *
 * 전략:
 * 1. text_ko 정규화 매칭 (괄호 prefix 제거, \n→space)으로 auto-match
 * 2. bubble 437 (EP22 "맛있을 것 같아요!") → dialogue 222 수동 고정
 * 3. 연결 완료 후 focus expression chain 상태 확인
 *
 * 실행: npx tsx scripts/link-ep12-30-dialogues.ts
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

function log(msg: string) { console.log(`[link-dialogues] ${msg}`) }

function normalize(text: string): string {
  return (text ?? '').replace(/^\([^)]*\)\s*/, '').replace(/\n/g, ' ').trim()
}

// ── Step 1: Auto-match via normalized text ─────────────────────────────────
async function autoMatch() {
  log('=== Step 1: Auto-match (정규화 텍스트 매칭) ===')

  const { data: eps } = await sb.from('kp_episodes')
    .select('id, episode_num').gte('episode_num', 12).lte('episode_num', 30)
  const epIds = (eps ?? []).map(e => e.id)
  const epMap: Record<number, number> = {}
  for (const e of (eps ?? [])) epMap[e.id] = e.episode_num

  const { data: bubbles } = await sb.from('kp_bubbles')
    .select('id, korean, episode_id, dialogue_id').in('episode_id', epIds)
  const { data: dialogues } = await sb.from('kp_dialogues')
    .select('id, episode_id, text_ko').in('episode_id', epIds)

  // 정규화 dialogue map: (episode_id|normalized_text) → dialogue_id
  const dlgMap = new Map<string, number>()
  for (const d of (dialogues ?? [])) {
    const key = `${d.episode_id}|${normalize(d.text_ko)}`
    dlgMap.set(key, d.id)
  }

  // bubble별 매칭
  const updates: Array<{ bubble_id: number; dialogue_id: number }> = []
  const noMatch: Array<{ ep: number; bubble_id: number; ko: string }> = []

  for (const b of (bubbles ?? [])) {
    if (b.dialogue_id != null) continue // 이미 연결된 것 skip
    const key = `${b.episode_id}|${normalize(b.korean)}`
    const dlgId = dlgMap.get(key)
    if (dlgId != null) {
      updates.push({ bubble_id: b.id, dialogue_id: dlgId })
    } else {
      noMatch.push({ ep: epMap[b.episode_id], bubble_id: b.id, ko: normalize(b.korean) })
    }
  }

  log(`  매칭 성공: ${updates.length}개 / 실패: ${noMatch.length}개`)

  // DB 업데이트
  const CHUNK = 50
  let done = 0
  for (let i = 0; i < updates.length; i += CHUNK) {
    const chunk = updates.slice(i, i + CHUNK)
    for (const u of chunk) {
      const { error } = await sb.from('kp_bubbles')
        .update({ dialogue_id: u.dialogue_id })
        .eq('id', u.bubble_id)
      if (error) { console.error(`  ❌ bubble ${u.bubble_id}:`, error.message); continue }
      done++
    }
    log(`  업데이트 진행: ${Math.min(i + CHUNK, updates.length)}/${updates.length}`)
  }
  log(`  ✓ ${done}개 업데이트 완료`)

  return noMatch
}

// ── Step 2: 수동 연결 ─────────────────────────────────────────────────────
async function manualFix() {
  log('\n=== Step 2: 수동 연결 (1건) ===')

  // bubble 437 (EP22 "맛있을 것 같아요!") → dialogue 222 (여기 맛있을 것 같아요!)
  const { error } = await sb.from('kp_bubbles')
    .update({ dialogue_id: 222 })
    .eq('id', 437)
  if (error) { console.error('  ❌ bubble 437:', error.message); return }
  log('  ✓ bubble 437 (맛있을 것 같아요!) → dialogue 222 (여기 맛있을 것 같아요!)')
}

// ── Step 3: Focus chain 상태 확인 ─────────────────────────────────────────
async function verifyFocusChain() {
  log('\n=== Step 3: Focus expression chain 검증 ===')

  const { data: eps } = await sb.from('kp_episodes')
    .select('id, episode_num').gte('episode_num', 12).lte('episode_num', 30)
  const epIds = (eps ?? []).map(e => e.id)
  const epMap: Record<number, number> = {}
  for (const e of (eps ?? [])) epMap[e.id] = e.episode_num

  // focus expression 있는 dialogue 목록
  const { data: dialogues } = await sb.from('kp_dialogues')
    .select('id, episode_id, text_ko').in('episode_id', epIds)
  const dlgIds = (dialogues ?? []).map(d => d.id)
  const dlgEpMap: Record<number, number> = {}
  const dlgTextMap: Record<number, string> = {}
  for (const d of (dialogues ?? [])) {
    dlgEpMap[d.id] = d.episode_id
    dlgTextMap[d.id] = d.text_ko
  }

  const { data: focusExprs } = await sb.from('kp_dialogue_expressions')
    .select('dialogue_id, matched_text, expression_id, role')
    .eq('role', 'focus').in('dialogue_id', dlgIds)

  // 연결된 bubble 상태 조회
  const focusDlgIds = (focusExprs ?? []).map(f => f.dialogue_id)
  const { data: linkedBubbles } = await sb.from('kp_bubbles')
    .select('id, korean, dialogue_id, expression_id, episode_id')
    .in('dialogue_id', focusDlgIds)
    .in('episode_id', epIds)

  const bubbleByDlg: Record<number, typeof linkedBubbles> = {}
  for (const b of (linkedBubbles ?? [])) {
    if (!bubbleByDlg[b.dialogue_id]) bubbleByDlg[b.dialogue_id] = []
    bubbleByDlg[b.dialogue_id]!.push(b)
  }

  log(`  focus dialogue 총 ${focusExprs?.length}개:\n`)
  let connected = 0, noExpr = 0
  for (const fe of (focusExprs ?? [])) {
    const epNum = epMap[dlgEpMap[fe.dialogue_id]] ?? '?'
    const bubbles = bubbleByDlg[fe.dialogue_id] ?? []
    const hasExpr = fe.expression_id != null
    const status = bubbles.length > 0
      ? (hasExpr ? '✅ 완전 연결 (popup 가능)' : '🟡 bubble 연결됨 (expression_id 없어서 popup 불가)')
      : '❌ bubble 미연결'
    if (bubbles.length > 0 && hasExpr) connected++
    if (bubbles.length > 0 && !hasExpr) noExpr++
    log(`  EP${String(epNum).padStart(2, '0')} dlg=${fe.dialogue_id} [${normalize(dlgTextMap[fe.dialogue_id])}]`)
    log(`    matched="${fe.matched_text}" expr_id=${fe.expression_id ?? 'null'} → ${status}`)
    bubbles.forEach(b => log(`    bubble id=${b.id} ko=${b.korean.replace(/\n/g, '↵').slice(0, 30)}`))
  }

  log(`\n  요약: 완전연결 ${connected}개 / bubble연결+expression없음 ${noExpr}개 / bubble미연결 ${(focusExprs?.length ?? 0) - connected - noExpr}개`)
  log('  → expression_id 채우기는 별도 작업 필요 (kp_expressions 새로 추가 or 기존 ID 매핑)')
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  await autoMatch()
  await manualFix()
  await verifyFocusChain()
  log('\n=== 완료 ===')
}

main().catch(console.error)
