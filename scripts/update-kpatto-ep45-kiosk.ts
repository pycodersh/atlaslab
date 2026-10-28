/**
 * K-PATTO ep45 「도움 주기」 대사 개편 (2026-10-28) — 다시 그린 키오스크 주문 컷에 맞춘다.
 *
 * 새 대사 (말풍선 칸 = 기존 gap 패널 그대로)
 *   2201  emma   민준 씨, 뭐 도와드릴까요? 제가 대신 주문해 드릴까요?
 *   2202  minjun 고마워! 그럼 부탁 좀 할게.
 *   2203  emma   저기요, 죄송한데요 혹시 주문 좀 도와주실 수 있어요?
 *   2204  clerk  네, 키오스크 사용법 알려드릴게요!            (emma 「제가 대신 주문할까요?」 자리)
 *   2205  clerk  여기 있습니다. 맛있게 드세요!  /  emma 감사합니다!
 *   2206  minjun 이제 나보다 잘하는데?
 *   빠진 대사: emma 「뭐부터 해 드릴까요?」 (대사 11388 · 말풍선 3739 삭제)
 *
 * 패턴 4개(first_episode 45)는 모두 하이라이트를 유지한다.
 *   #901  해 드릴까요?      → 「주문해 드릴까요?」 (11388 에서 11386 으로)
 *   #1362 -을까요?          → 「도와드릴까요?」     (11390 「주문할까요?」 에서 11386 으로)
 *   #1338 -어 드리다        → 「알려드릴게요」     (11386 「도와드릴까요?」 에서 11390 으로)
 *   #902  죄송한데요 혹시 ~ → 그대로
 *   한 말풍선 안에서 하이라이트가 겹치면 앱은 긴 것만 보여 주므로(renderKorean), 겹치지 않게 나눴다.
 * 말풍선을 대사에 연결(dialogue_id)해 한 말풍선이 하이라이트 여러 개를 보여 줄 수 있게 한다.
 *
 * 안전장치: 각 행이 처음 확인한 값 그대로일 때만 바꾸거나 지운다. 다시 돌리면 "이미 적용됨" 으로 넘어간다.
 * 바뀐 대사 음성은 따로: npx tsx scripts/generate-kpatto-audio-gemini.ts --ep 45 --no-expr
 *
 * 실행: npx tsx scripts/update-kpatto-ep45-kiosk.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

type Row = Record<string, unknown>
type Update = { table: string; id: number; from: Row; to: Row }
type Delete = { table: string; id: number; from: Row }

const NEW_1 = '민준 씨, 뭐 도와드릴까요? 제가 대신 주문해 드릴까요?'
const NEW_4 = '네, 키오스크 사용법 알려드릴게요!'
const en = (s: string) => ({ en: s })

const UPDATES: Update[] = [
  // ── 패턴 링크 (먼저 옮겨야 11388 을 지울 수 있다)
  { table: 'kp_dialogue_expressions', id: 5797, from: { dialogue_id: 11386, expression_id: 1338, matched_text: '도와드릴까요?' }, to: { dialogue_id: 11390, matched_text: '알려드릴게요' } },
  { table: 'kp_dialogue_expressions', id: 5798, from: { dialogue_id: 11388, expression_id: 901,  matched_text: '해 드릴까요?' },  to: { dialogue_id: 11386 } },
  { table: 'kp_dialogue_expressions', id: 5800, from: { dialogue_id: 11390, expression_id: 1362, matched_text: '주문할까요?' },   to: { dialogue_id: 11386, matched_text: '도와드릴까요?' } },

  // ── 대사
  { table: 'kp_dialogues', id: 11386, from: { text_ko: '민준 씨, 뭐 도와드릴까요?' }, to: { text_ko: NEW_1, text_en: 'Minjun, can I help you with anything? Shall I order for you?' } },
  { table: 'kp_dialogues', id: 11387, from: { text_ko: '고마워! 그럼 부탁 좀 할게.' }, to: { text_en: "Thanks! Then I'll leave it to you." } },
  { table: 'kp_dialogues', id: 11389, from: { text_ko: '저기요, 죄송한데요 혹시 주문 좀 도와주실 수 있어요?' }, to: { text_en: 'Excuse me, sorry to bother you — could you help me order?' } },
  { table: 'kp_dialogues', id: 11390, from: { speaker: 'emma', text_ko: '제가 대신 주문할까요?' }, to: { speaker: 'clerk', text_ko: NEW_4, text_en: 'Sure, let me show you how to use the kiosk!' } },
  { table: 'kp_dialogues', id: 11391, from: { text_ko: '여기 있습니다. 맛있게 드세요!' }, to: { text_en: 'Here you go. Enjoy your meal!' } },
  { table: 'kp_dialogues', id: 11392, from: { text_ko: '감사합니다!' }, to: { text_en: 'Thank you!' } },
  { table: 'kp_dialogues', id: 11393, from: { text_ko: '이제 나보다 잘하는데?' }, to: { text_en: "You're doing better than me now!" } },

  // ── 말풍선 (위치는 그대로 — 편집 모드에서 맞춘다)
  { table: 'kp_bubbles', id: 3737, from: { korean: '민준 씨, 뭐 도와드릴까요?' },
    to: { korean: NEW_1, translations: en('Minjun, can I help you with anything? Shall I order for you?'), highlight_text: '해 드릴까요?', expression_id: 901, dialogue_id: 11386 } },
  { table: 'kp_bubbles', id: 3738, from: { korean: '고마워! 그럼 부탁 좀 할게.' }, to: { translations: en("Thanks! Then I'll leave it to you."), dialogue_id: 11387 } },
  { table: 'kp_bubbles', id: 3740, from: { korean: '저기요, 죄송한데요 혹시 주문 좀 도와주실 수 있어요?' }, to: { dialogue_id: 11389 } },
  { table: 'kp_bubbles', id: 3741, from: { speaker: 'emma', korean: '제가 대신 주문할까요?' },
    to: { speaker: 'clerk', korean: NEW_4, translations: en('Sure, let me show you how to use the kiosk!'), highlight_text: '알려드릴게요', expression_id: 1338, dialogue_id: 11390 } },
  { table: 'kp_bubbles', id: 3742, from: { korean: '여기 있습니다. 맛있게 드세요!' }, to: { translations: en('Here you go. Enjoy your meal!'), dialogue_id: 11391 } },
  { table: 'kp_bubbles', id: 3743, from: { korean: '감사합니다!' }, to: { dialogue_id: 11392 } },
  { table: 'kp_bubbles', id: 3744, from: { korean: '이제 나보다 잘하는데?' }, to: { translations: en("You're doing better than me now!"), dialogue_id: 11393 } },
]

const DELETES: Delete[] = [
  { table: 'kp_bubbles',   id: 3739,  from: { korean: '뭐부터 해 드릴까요?' } },
  { table: 'kp_dialogues', id: 11388, from: { text_ko: '뭐부터 해 드릴까요?' } },
]

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const matches = (row: Row, want: Row) => Object.entries(want).every(([k, v]) => same(row[k], v))

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) {
    throw new Error('patto Supabase 가 아니다 — 중단')
  }

  console.log('── updates')
  for (const u of UPDATES) {
    const label = `${u.table} id=${u.id}`
    const fields = [...new Set([...Object.keys(u.from), ...Object.keys(u.to)])].join(',')
    const { data: cur, error } = await sb.from(u.table).select(fields).eq('id', u.id).maybeSingle()
    if (error) throw new Error(`${label}: ${error.message}`)
    if (!cur) { console.log(`  ⚠ ${label} 행이 없어 건너뜀`); continue }
    const row = cur as unknown as Row
    if (matches(row, u.to)) { console.log(`  · ${label} 이미 적용됨`); continue }
    if (!matches(row, u.from)) { console.log(`  ⚠ ${label} 값이 달라 건너뜀: ${JSON.stringify(row)}`); continue }
    let q = sb.from(u.table).update(u.to).eq('id', u.id)
    for (const [k, v] of Object.entries(u.from)) if (typeof v !== 'object') q = q.eq(k, v as string | number)
    const { data, error: upErr } = await q.select('id')
    if (upErr) throw new Error(`${label}: ${upErr.message}`)
    console.log(data?.length ? `  ✅ ${label} ${JSON.stringify(u.to)}` : `  ⚠ ${label} 그 사이 값이 바뀌어 건너뜀`)
  }

  console.log('── deletes')
  for (const d of DELETES) {
    const label = `${d.table} id=${d.id}`
    const { data: cur } = await sb.from(d.table).select(Object.keys(d.from).join(',')).eq('id', d.id).maybeSingle()
    if (!cur) { console.log(`  · ${label} 이미 지워짐`); continue }
    if (!matches(cur as unknown as Row, d.from)) { console.log(`  ⚠ ${label} 값이 달라 건너뜀`); continue }
    const { count: refs } = await sb.from('kp_dialogue_expressions').select('id', { count: 'exact', head: false })
      .eq('dialogue_id', d.table === 'kp_dialogues' ? d.id : -1).range(0, 0)
    if (refs == null) throw new Error(`${label}: 링크 확인 count 가 null`)
    if (refs > 0) { console.log(`  ⚠ ${label} 아직 링크 ${refs}개가 가리켜 건너뜀`); continue }
    let q = sb.from(d.table).delete().eq('id', d.id)
    for (const [k, v] of Object.entries(d.from)) q = q.eq(k, v as string)
    const { data, error } = await q.select('id')
    if (error) throw new Error(`${label}: ${error.message}`)
    console.log(data?.length ? `  ✅ ${label} 삭제` : `  ⚠ ${label} 삭제 안 됨`)
  }

  // ── 확인 1: ep45 말풍선마다 하이라이트 문구가 실제 대사 안에 있는가 (앱과 같은 규칙으로)
  console.log('── verify')
  const { data: bubbles } = await sb.from('kp_bubbles').select('id, speaker, korean, dialogue_id, highlight_text, expression_id').eq('episode_id', 45).order('id')
  const dIds = (bubbles ?? []).map(b => b.dialogue_id).filter(Boolean) as number[]
  const { data: links } = await sb.from('kp_dialogue_expressions').select('dialogue_id, expression_id, matched_text').eq('role', 'focus').in('dialogue_id', dIds).order('id')
  for (const b of bubbles ?? []) {
    const hl = (links ?? []).filter(l => l.dialogue_id === b.dialogue_id)
    const shown = hl.length ? hl : (b.highlight_text && b.expression_id ? [{ matched_text: b.highlight_text, expression_id: b.expression_id }] : [])
    const parts = shown.map(h => `${b.korean.includes(h.matched_text) ? '✓' : '✗'} #${h.expression_id} "${h.matched_text}"`)
    console.log(`  ${b.id} ${b.speaker}: ${b.korean}${parts.length ? '  ' + parts.join('  ') : ''}`)
  }

  // ── 확인 2: 활성 패턴 300개 모두 하이라이트 링크가 있는가
  const active: { id: number; korean: string }[] = []
  for (let i = 0; ; i += 1000) {
    const { data, error } = await sb.from('kp_expressions').select('id, korean').eq('is_active', true).range(i, i + 999)
    if (error) throw new Error(error.message)
    active.push(...data); if (data.length < 1000) break
  }
  const linked = new Set<number>()
  for (let i = 0; ; i += 1000) {
    const { data, error } = await sb.from('kp_dialogue_expressions').select('expression_id').eq('role', 'focus').not('expression_id', 'is', null).range(i, i + 999)
    if (error) throw new Error(error.message)
    for (const r of data) linked.add(r.expression_id as number)
    if (data.length < 1000) break
  }
  const missing = active.filter(e => !linked.has(e.id))
  console.log(`  active patterns ${active.length}, without a highlight link: ${missing.length}${missing.length ? ' — ' + missing.map(e => `#${e.id} ${e.korean}`).join(', ') : ''}`)
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
