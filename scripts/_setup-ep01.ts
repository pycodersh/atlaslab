/**
 * EP01 DB 설정 — 유자차 카페 시나리오
 * 1. kp_dialogues EP01 교체 (16개 삭제 → 9개 INSERT)
 * 2. kp_bubbles EP01 생성 (gap 패널별)
 * 3. kp_dialogue_expressions 3건 (focus 패턴 매칭)
 * 4. kp_challenges 15건 INSERT
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── EP01 새 대사 ──────────────────────────────────────────────────────────────
// gap 번호 = panel order_num 기준 (1,3,5,7,9,12)
const newDialogues = [
  // gap-3: 컷1 이후
  { gap: 3, speaker: 'emma',  ko: '와, 예쁘다.',                         en: "Wow, it's beautiful.",                          focus: null },
  // gap-5: 컷2 이후
  { gap: 5, speaker: 'staff', ko: '안녕하세요! 어서 오세요.',              en: 'Hello! Welcome.',                                focus: null },
  { gap: 5, speaker: 'emma',  ko: '안녕하세요…',                          en: 'Hello...',                                       focus: null },
  // gap-7: 컷3 이후
  { gap: 7, speaker: 'emma',  ko: '음… 저기요, 이거 뭐예요?',             en: 'Um... excuse me, what is this?',                focus: { expr_id: 771, matched: '뭐예요?' } },
  // gap-9: 컷4 이후
  { gap: 9, speaker: 'staff', ko: '아, 그건 유자차예요. 달콤해요!',        en: "Oh, that's yuja tea. It's sweet!",               focus: null },
  { gap: 9, speaker: 'emma',  ko: '아이스 있어요?',                        en: 'Do you have it iced?',                           focus: { expr_id: 772, matched: '있어요?' } },
  { gap: 9, speaker: 'staff', ko: '네, 있어요.',                           en: 'Yes, we do.',                                    focus: null },
  { gap: 9, speaker: 'emma',  ko: '그럼 아이스 유자차 주세요.',             en: "Then I'll have an iced yuja tea, please.",       focus: { expr_id: 770, matched: '주세요' } },
  // gap-12: 컷5 이후
  { gap: 12, speaker: 'emma', ko: '음… 맛있어요! 오늘은 한국어로 주문했어요.', en: 'Mmm, delicious! Today I ordered in Korean.', focus: null },
]

// 버블 위치 (gap별 index 기준)
// positions[gap][i] = {xPct, yPct, widthPct, lines}
const positions: Record<number, Array<{xPct:number;yPct:number;widthPct:number;lines:1|2|3}>> = {
  3:  [{ xPct: 10, yPct: 15, widthPct: 80, lines: 1 }],
  5:  [
    { xPct: 10, yPct:  8, widthPct: 80, lines: 1 },
    { xPct: 10, yPct: 55, widthPct: 80, lines: 1 },
  ],
  7:  [{ xPct: 10, yPct: 15, widthPct: 80, lines: 2 }],
  9:  [
    { xPct:  5, yPct:  3, widthPct: 85, lines: 2 },
    { xPct:  5, yPct: 28, widthPct: 85, lines: 1 },
    { xPct:  5, yPct: 52, widthPct: 85, lines: 1 },
    { xPct:  5, yPct: 70, widthPct: 85, lines: 2 },
  ],
  12: [{ xPct: 10, yPct: 15, widthPct: 80, lines: 2 }],
}

// ── EP01 챌린지 ───────────────────────────────────────────────────────────────
const challenges = [
  // translation (6)
  { challenge_type: 'translation', question: { prompt: '이거 뭐예요?' },
    options: ['What is this?', 'Where is this?', 'How much is this?', 'Do you have this?'],
    answer: 'What is this?', word_pieces: null },
  { challenge_type: 'translation', question: { prompt: '아이스 있어요?' },
    options: ['Do you have it iced?', 'Is it cold?', 'I want ice.', 'Please make it iced.'],
    answer: 'Do you have it iced?', word_pieces: null },
  { challenge_type: 'translation', question: { prompt: '유자차 주세요.' },
    options: ['Yuja tea, please.', 'I like yuja tea.', 'Is there yuja tea?', 'What is yuja tea?'],
    answer: 'Yuja tea, please.', word_pieces: null },
  { challenge_type: 'translation', question: { prompt: '메뉴판 주세요.' },
    options: ['Please give me the menu.', 'Where is the menu?', "What's on the menu?", 'Is there a menu?'],
    answer: 'Please give me the menu.', word_pieces: null },
  { challenge_type: 'translation', question: { prompt: '이름이 뭐예요?' },
    options: ["What's your name?", 'Do you have a name?', 'Please tell me your name.', 'Is that your name?'],
    answer: "What's your name?", word_pieces: null },
  { challenge_type: 'translation', question: { prompt: '자리 있어요?' },
    options: ['Is there a seat available?', 'Where is my seat?', 'Please give me a seat.', 'Is this seat good?'],
    answer: 'Is there a seat available?', word_pieces: null },
  // fill_blank (6)
  { challenge_type: 'fill_blank', question: { prompt: '이거 ___ (What is this?)' },
    options: ['뭐예요?', '있어요?', '주세요', '좋아요'],
    answer: '뭐예요?', word_pieces: null },
  { challenge_type: 'fill_blank', question: { prompt: '물 ___ (Water, please.)' },
    options: ['주세요', '뭐예요?', '있어요?', '맛있어요'],
    answer: '주세요', word_pieces: null },
  { challenge_type: 'fill_blank', question: { prompt: '화장실 ___ (Is there a restroom?)' },
    options: ['있어요?', '뭐예요?', '주세요', '어때요?'],
    answer: '있어요?', word_pieces: null },
  { challenge_type: 'fill_blank', question: { prompt: '이 케이크 이름이 ___ (What\'s this cake called?)' },
    options: ['뭐예요?', '있어요?', '주세요', '맞아요?'],
    answer: '뭐예요?', word_pieces: null },
  { challenge_type: 'fill_blank', question: { prompt: '아이스 아메리카노 ___ (One iced americano, please.)' },
    options: ['주세요', '뭐예요?', '있어요?', '좋아요'],
    answer: '주세요', word_pieces: null },
  { challenge_type: 'fill_blank', question: { prompt: '와이파이 ___ (Do you have wifi?)' },
    options: ['있어요?', '뭐예요?', '주세요', '어디예요?'],
    answer: '있어요?', word_pieces: null },
  // word_order (3)
  { challenge_type: 'word_order', question: { prompt: 'What is this?' },
    options: null, answer: '이거 뭐예요?',
    word_pieces: ['뭐예요?', '이거'] },
  { challenge_type: 'word_order', question: { prompt: 'One iced yuja tea, please.' },
    options: null, answer: '아이스 유자차 주세요.',
    word_pieces: ['유자차', '주세요.', '아이스'] },
  { challenge_type: 'word_order', question: { prompt: 'Is there a window seat?' },
    options: null, answer: '창가 자리 있어요?',
    word_pieces: ['있어요?', '자리', '창가'] },
]

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  // EP01 ID 조회
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
  if (!ep) { console.error('EP01 없음'); return }
  const epId = ep.id
  console.log(`EP01 id=${epId}`)

  // 패널 목록 (gap 패널 ID 확인)
  const { data: panels } = await sb.from('kp_panels').select('id,order_num,type').eq('episode_id', epId).order('order_num')
  console.log('panels:', JSON.stringify(panels?.map(p => ({id: p.id, num: p.order_num, type: p.type}))))

  // gap 패널 ID 맵 (order_num → id)
  const gapIdMap = new Map<number, number>()
  for (const p of panels??[]) {
    if (p.type === 'gap') gapIdMap.set(p.order_num, p.id)
  }

  // ── 1. 기존 kp_dialogue_expressions EP01 삭제 ───────────────────────────
  // 먼저 EP01 dialogue_ids 조회
  const { data: oldDlgs } = await sb.from('kp_dialogues').select('id').eq('episode_id', epId)
  const oldDlgIds = (oldDlgs??[]).map(d => d.id)
  if (oldDlgIds.length > 0) {
    await sb.from('kp_dialogue_expressions').delete().in('dialogue_id', oldDlgIds)
    console.log(`kp_dialogue_expressions 삭제: EP01 관련 ${oldDlgIds.length}개 dialogue 기준`)
  }

  // ── 2. 기존 kp_bubbles EP01 삭제 ────────────────────────────────────────
  const { error: bubDelErr } = await sb.from('kp_bubbles').delete().eq('episode_id', epId)
  if (bubDelErr) console.error('kp_bubbles 삭제 실패:', bubDelErr.message)
  else console.log('kp_bubbles EP01 삭제 완료')

  // ── 3. 기존 kp_dialogues EP01 삭제 ──────────────────────────────────────
  const { error: dlgDelErr } = await sb.from('kp_dialogues').delete().eq('episode_id', epId)
  if (dlgDelErr) console.error('kp_dialogues 삭제 실패:', dlgDelErr.message)
  else console.log('kp_dialogues EP01 삭제 완료')

  // ── 4. 기존 kp_challenges EP01 삭제 ─────────────────────────────────────
  const { error: chalDelErr } = await sb.from('kp_challenges').delete().eq('episode_id', epId)
  if (chalDelErr) console.error('kp_challenges 삭제 실패:', chalDelErr.message)
  else console.log('kp_challenges EP01 삭제 완료')

  // ── 5. kp_dialogues 새로 INSERT ──────────────────────────────────────────
  const dlgInsertRows = newDialogues.map((d, i) => ({
    episode_id: epId,
    text_ko: d.ko,
    text_en: d.en,
    speaker: d.speaker,
    order_num: i + 1,
  }))
  const { data: insertedDlgs, error: dlgInsErr } = await sb
    .from('kp_dialogues').insert(dlgInsertRows).select('id,text_ko')
  if (dlgInsErr) { console.error('kp_dialogues INSERT 실패:', dlgInsErr.message); return }
  console.log(`kp_dialogues INSERT 완료: ${insertedDlgs?.length}건`)

  // ── 6. kp_bubbles INSERT ─────────────────────────────────────────────────
  // insertedDlgs는 newDialogues와 동일 순서 (INSERT 순서 보장)
  const bubbleRows: any[] = []
  const gapBubbleCount = new Map<number, number>()

  for (let i = 0; i < newDialogues.length; i++) {
    const d = newDialogues[i]
    const dlg = insertedDlgs![i]
    const panelId = gapIdMap.get(d.gap)
    if (!panelId) { console.warn(`gap ${d.gap} 패널 없음`); continue }

    const gapIdx = gapBubbleCount.get(d.gap) ?? 0
    gapBubbleCount.set(d.gap, gapIdx + 1)
    const pos = positions[d.gap]?.[gapIdx]
    if (!pos) { console.warn(`gap ${d.gap} position[${gapIdx}] 없음`); continue }

    bubbleRows.push({
      panel_id: panelId,
      episode_id: epId,
      order_num: gapIdx + 1,
      speaker: d.speaker,
      korean: d.ko,
      translations: { en: d.en },
      position: { xPct: pos.xPct, yPct: pos.yPct, widthPct: pos.widthPct, lines: pos.lines, bubbleKey: 'bubble-oval' },
      tail: null,
      dialogue_id: dlg.id,
      highlight_text: d.focus?.matched ?? null,
      expression_id: d.focus?.expr_id ?? null,
    })
  }
  const { error: bubInsErr } = await sb.from('kp_bubbles').insert(bubbleRows)
  if (bubInsErr) { console.error('kp_bubbles INSERT 실패:', bubInsErr.message); return }
  console.log(`kp_bubbles INSERT 완료: ${bubbleRows.length}건`)

  // ── 7. kp_dialogue_expressions INSERT ───────────────────────────────────
  const deRows: any[] = []
  for (let i = 0; i < newDialogues.length; i++) {
    const d = newDialogues[i]
    if (!d.focus) continue
    const dlg = insertedDlgs![i]
    deRows.push({
      dialogue_id: dlg.id,
      expression_id: d.focus.expr_id,
      matched_text: d.focus.matched,
      role: 'focus',
    })
  }
  const { error: deInsErr } = await sb.from('kp_dialogue_expressions').insert(deRows)
  if (deInsErr) { console.error('kp_dialogue_expressions INSERT 실패:', deInsErr.message) }
  else console.log(`kp_dialogue_expressions INSERT 완료: ${deRows.length}건`)

  // ── 8. kp_challenges INSERT ──────────────────────────────────────────────
  const chalRows = challenges.map((c, i) => ({
    episode_id: epId,
    order_num: i + 1,
    challenge_type: c.challenge_type,
    question: c.question,
    options: c.options,
    answer: c.answer,
    word_pieces: c.word_pieces,
  }))
  const { error: chalInsErr } = await sb.from('kp_challenges').insert(chalRows)
  if (chalInsErr) { console.error('kp_challenges INSERT 실패:', chalInsErr.message) }
  else console.log(`kp_challenges INSERT 완료: ${chalRows.length}건`)

  console.log('\n✓ EP01 설정 완료')
}

main().catch(console.error)
