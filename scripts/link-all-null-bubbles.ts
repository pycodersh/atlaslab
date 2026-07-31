/**
 * EP11~30 dialogue_id=null bubble 일괄 연결
 *
 * 전략:
 *  1단계 (EP11~22): kp_dialogues 텍스트 매칭 → dialogue_id 연결
 *     - 완전일치 → 정규화일치(괄호주석 제거) → 말투변환일치 순으로 시도
 *     - 매칭 실패 시 → INSERT (2단계와 동일)
 *  2단계 (EP23~30): kp_dialogues가 없으므로 bubble.korean을 INSERT 후 연결
 *
 * 실행: npx tsx scripts/link-all-null-bubbles.ts
 * 적용: npx tsx scripts/link-all-null-bubbles.ts --apply
 */
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')

// ─── 텍스트 정규화 ─────────────────────────────────────────────────────────
// "(지도 보며)", "(혼잣말)" 등 괄호 주석 제거, 공백 정리
function normalize(s: string): string {
  return s.replace(/^\([^)]*\)\s*/g, '').replace(/\s+/g, ' ').trim()
}

// 반말→존댓말 간단 변환 (비교용)
function roughJondaemal(s: string): string {
  return s
    .replace(/(워|봐|줘|가|지|네|래|해|야|어|아|게)([!?.]?\s*)$/, '$1요$2')
    .replace(/(뻐|려|녀)([!?.]?\s*)$/, '$1요$2')
}

// ─── 메인 ──────────────────────────────────────────────────────────────────
type Bubble   = { id: number; episode_id: number; speaker: string; korean: string }
type Dialogue = { id: number; episode_id: number; speaker: string; text_ko: string; order_num: number }

type Action =
  | { kind: 'link';   bubbleId: number; dlgId: number;   dlgText: string; method: string }
  | { kind: 'insert'; bubbleId: number; epId: number;     speaker: string; text_ko: string; orderNum: number }

async function main() {
  // 1. EP11~30 정보
  const { data: eps } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .gte('episode_num', 11).lte('episode_num', 30)
    .order('episode_num')
  if (!eps?.length) { console.error('에피소드 없음'); return }
  const epMap = new Map(eps.map(e => [e.id as number, e.episode_num as number]))
  const epIds = eps.map(e => e.id as number)

  // 2. null 버블 목록
  const { data: bRaw } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, speaker, korean')
    .in('episode_id', epIds)
    .is('dialogue_id', null)
    .order('episode_id').order('id')
  const nullBubbles = (bRaw ?? []) as Bubble[]

  // 3. 각 에피소드별 기존 kp_dialogues 로드 (이미 연결된 것 포함)
  const { data: dRaw } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, speaker, text_ko, order_num')
    .in('episode_id', epIds)
    .order('episode_id').order('order_num').order('id')
  const allDialogues = (dRaw ?? []) as Dialogue[]

  // 이미 다른 bubble에 연결된 dialogue_id 집합
  const { data: linkedRaw } = await sb
    .from('kp_bubbles')
    .select('dialogue_id')
    .in('episode_id', epIds)
    .not('dialogue_id', 'is', null)
  const usedDlgIds = new Set((linkedRaw ?? []).map((r: any) => r.dialogue_id as number))

  // episode별 사용 가능한 dialogues
  const availableByEp = new Map<number, Dialogue[]>()
  for (const d of allDialogues) {
    if (usedDlgIds.has(d.id)) continue
    if (!availableByEp.has(d.episode_id)) availableByEp.set(d.episode_id, [])
    availableByEp.get(d.episode_id)!.push(d)
  }

  // episode별 현재 max order_num (INSERT 시 다음 번호 계산용)
  const maxOrderByEp = new Map<number, number>()
  for (const d of allDialogues) {
    const cur = maxOrderByEp.get(d.episode_id) ?? 0
    if (d.order_num > cur) maxOrderByEp.set(d.episode_id, d.order_num)
  }

  // ── 액션 계획 ────────────────────────────────────────────────────────────
  const actions: Action[] = []
  const stats = { linked: 0, inserted: 0, byMethod: {} as Record<string, number> }

  // INSERT 시 order_num 추적 (ep별)
  const insertCountByEp = new Map<number, number>()

  for (const b of nullBubbles) {
    const epNum = epMap.get(b.episode_id) ?? 0
    const avail = availableByEp.get(b.episode_id) ?? []
    const bNorm = normalize(b.korean)

    // ── 매칭 시도 ──
    // 1) 완전 일치
    let found = avail.find(d => d.text_ko === b.korean)
    if (found) {
      actions.push({ kind: 'link', bubbleId: b.id, dlgId: found.id, dlgText: found.text_ko, method: '완전일치' })
      avail.splice(avail.indexOf(found), 1)
      usedDlgIds.add(found.id)
      stats.byMethod['완전일치'] = (stats.byMethod['완전일치'] ?? 0) + 1
      stats.linked++
      continue
    }

    // 2) 정규화 일치 (괄호 주석 무시)
    found = avail.find(d => normalize(d.text_ko) === bNorm)
    if (found) {
      actions.push({ kind: 'link', bubbleId: b.id, dlgId: found.id, dlgText: found.text_ko, method: '정규화일치' })
      avail.splice(avail.indexOf(found), 1)
      usedDlgIds.add(found.id)
      stats.byMethod['정규화일치'] = (stats.byMethod['정규화일치'] ?? 0) + 1
      stats.linked++
      continue
    }

    // 3) 말투 변환 후 일치 (bubble 반말 → 존댓말 변환해서 dialogue와 비교)
    const bJondae = roughJondaemal(bNorm)
    found = avail.find(d => normalize(d.text_ko) === bJondae || normalize(d.text_ko) === roughJondaemal(normalize(d.text_ko)) && normalize(d.text_ko) === bNorm)
    if (!found) {
      // dialogue 정규화 → 반말 변환 후 bubble과 비교
      found = avail.find(d => roughJondaemal(normalize(d.text_ko)) === bNorm || normalize(d.text_ko) === bJondae)
    }
    if (found) {
      actions.push({ kind: 'link', bubbleId: b.id, dlgId: found.id, dlgText: found.text_ko, method: '말투변환일치' })
      avail.splice(avail.indexOf(found), 1)
      usedDlgIds.add(found.id)
      stats.byMethod['말투변환일치'] = (stats.byMethod['말투변환일치'] ?? 0) + 1
      stats.linked++
      continue
    }

    // 4) 매칭 실패 → INSERT
    const insertIdx = (insertCountByEp.get(b.episode_id) ?? 0) + 1
    insertCountByEp.set(b.episode_id, insertIdx)
    const maxOrd = maxOrderByEp.get(b.episode_id) ?? 0
    const orderNum = maxOrd + insertIdx
    actions.push({ kind: 'insert', bubbleId: b.id, epId: b.episode_id, speaker: b.speaker, text_ko: b.korean, orderNum })
    stats.byMethod['INSERT신규'] = (stats.byMethod['INSERT신규'] ?? 0) + 1
    stats.inserted++
  }

  // ── 결과 출력 ────────────────────────────────────────────────────────────
  console.log(`\n=== 처리 계획: 총 ${actions.length}건 ===`)
  console.log(`  텍스트 매칭 연결: ${stats.linked}건`)
  console.log(`  신규 INSERT:      ${stats.inserted}건`)
  console.log(`  방법별:`, stats.byMethod)

  // 에피소드별 요약
  const epSummary: Record<number, { link: number; insert: number }> = {}
  for (const a of actions) {
    const b = nullBubbles.find(x => x.id === a.bubbleId)!
    const epNum = epMap.get(b.episode_id) ?? 0
    if (!epSummary[epNum]) epSummary[epNum] = { link: 0, insert: 0 }
    if (a.kind === 'link')   epSummary[epNum].link++
    else                      epSummary[epNum].insert++
  }
  console.log('\n에피소드별:')
  for (const [ep, v] of Object.entries(epSummary).sort((a,b) => Number(a[0])-Number(b[0]))) {
    console.log(`  EP${ep}: link=${v.link} insert=${v.insert}`)
  }

  // link 액션 상세
  console.log('\n=== 매칭 연결 상세 ===')
  for (const a of actions.filter(x => x.kind === 'link')) {
    const b = nullBubbles.find(x => x.id === a.bubbleId)!
    const epNum = epMap.get(b.episode_id) ?? 0
    const lk = a as Extract<Action, {kind:'link'}>
    console.log(`  EP${epNum} bubble=${b.id} [${b.speaker}] "${b.korean}"`)
    console.log(`    → dlg=${lk.dlgId} "${lk.dlgText}"  (${lk.method})`)
  }

  // insert 액션 상세
  console.log('\n=== 신규 INSERT 상세 ===')
  for (const a of actions.filter(x => x.kind === 'insert')) {
    const b = nullBubbles.find(x => x.id === a.bubbleId)!
    const epNum = epMap.get(b.episode_id) ?? 0
    const ins = a as Extract<Action, {kind:'insert'}>
    console.log(`  EP${epNum} bubble=${b.id} [${b.speaker}] "${b.korean}"  order=${ins.orderNum}`)
  }

  if (!APPLY) {
    console.log('\n──── DRY RUN ────')
    console.log('적용: npx tsx scripts/link-all-null-bubbles.ts --apply')
    return
  }

  // ── DB 적용 ───────────────────────────────────────────────────────────────
  console.log('\n──── DB 적용 시작 ────')
  let ok = 0, fail = 0

  for (const a of actions) {
    if (a.kind === 'link') {
      const { error } = await sb.from('kp_bubbles').update({ dialogue_id: a.dlgId }).eq('id', a.bubbleId)
      if (error) { console.error(`  ❌ link bubble=${a.bubbleId}: ${error.message}`); fail++ }
      else ok++
    } else {
      // INSERT kp_dialogues
      const { data: newDlg, error: insErr } = await sb
        .from('kp_dialogues')
        .insert({ episode_id: a.epId, speaker: a.speaker, text_ko: a.text_ko, order_num: a.orderNum })
        .select('id')
        .single()
      if (insErr || !newDlg) {
        console.error(`  ❌ insert bubble=${a.bubbleId}: ${insErr?.message}`)
        fail++
        continue
      }
      const newDlgId = (newDlg as any).id as number
      const { error: updErr } = await sb.from('kp_bubbles').update({ dialogue_id: newDlgId }).eq('id', a.bubbleId)
      if (updErr) { console.error(`  ❌ link after insert bubble=${a.bubbleId}: ${updErr.message}`); fail++ }
      else ok++
    }
  }

  console.log(`\n완료: ✅ ${ok}건 / ❌ ${fail}건`)

  // 적용 후 검증
  console.log('\n=== 적용 후 검증 ===')
  const { data: remaining } = await sb
    .from('kp_bubbles')
    .select('episode_id')
    .in('episode_id', epIds)
    .is('dialogue_id', null)
  console.log(`남은 null bubble: ${remaining?.length ?? 0}개`)
}
main().catch(console.error)
