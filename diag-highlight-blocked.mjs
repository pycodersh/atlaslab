/**
 * [B] 검증: highlight_text가 korean에 존재하지만 어절 경계 가드에 의해 차단됐던 버블 집계
 * (수정 후 기준으로는 이 목록이 모두 정상 하이라이트됨)
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const KOREAN_RE = /[가-힣]/

// highlight_text가 있는 버블 전체 조회
const { data: bubbles, error } = await sb
  .from('kp_bubbles')
  .select('id, episode_id, korean, highlight_text, dialogue_id')
  .not('highlight_text', 'is', null)

if (error) { console.error(error.message); process.exit(1) }

// dialogue_id가 있는 경우 kp_dialogues.text_ko 사용
const dlgIds = [...new Set(bubbles.filter(b => b.dialogue_id).map(b => b.dialogue_id))]
const dlgMap = new Map()
if (dlgIds.length > 0) {
  const { data: dlgs } = await sb.from('kp_dialogues').select('id, text_ko').in('id', dlgIds)
  for (const d of (dlgs ?? [])) dlgMap.set(d.id, d.text_ko)
}

// EP 번호 맵
const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
const epNumMap = new Map((eps ?? []).map(e => [e.id, e.episode_num]))

let totalWithHighlight = 0
let notFound = 0
let blockedByGuard = 0
let ok = 0
const blockedList = []

for (const b of bubbles) {
  const text = (b.dialogue_id ? dlgMap.get(b.dialogue_id) : null) ?? b.korean
  const hl = b.highlight_text
  if (!text || !hl) continue

  totalWithHighlight++
  const idx = text.indexOf(hl)
  if (idx === -1) { notFound++; continue }

  // 구 가드 조건: 공백 없고 앞 문자가 한글이면 차단
  if (!hl.includes(' ') && idx > 0 && KOREAN_RE.test(text[idx - 1])) {
    blockedByGuard++
    const epNum = epNumMap.get(b.episode_id) ?? '?'
    blockedList.push({ ep: epNum, id: b.id, text: text.slice(0, 30), hl })
  } else {
    ok++
  }
}

console.log(`highlight_text 있는 버블 총계: ${totalWithHighlight}`)
console.log(`  ✓ 정상 매칭: ${ok}`)
console.log(`  ✗ 어절 가드 차단 (수정 전 미하이라이트): ${blockedByGuard}`)
console.log(`  ? korean에서 미발견: ${notFound}`)

if (blockedList.length > 0) {
  console.log('\n차단 목록:')
  const sorted = blockedList.sort((a, b) => a.ep - b.ep)
  for (const r of sorted) {
    console.log(`  EP${String(r.ep).padStart(2,'0')} id=${r.id}: hl="${r.hl}" in "${r.text}..."`)
  }
}
