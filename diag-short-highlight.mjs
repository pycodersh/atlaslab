import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

// highlight_text 있는 버블 전체 조회
const { data: bubbles, error } = await sb
  .from('kp_bubbles')
  .select('id, episode_id, korean, highlight_text, dialogue_id')
  .not('highlight_text', 'is', null)

if (error) { console.error(error.message); process.exit(1) }

// dialogue_id → text_ko 맵
const dlgIds = [...new Set(bubbles.filter(b => b.dialogue_id).map(b => b.dialogue_id))]
const dlgMap = new Map()
if (dlgIds.length > 0) {
  const { data: dlgs } = await sb.from('kp_dialogues').select('id, text_ko').in('id', dlgIds)
  for (const d of (dlgs ?? [])) dlgMap.set(d.id, d.text_ko)
}

// episode_id → episode_num 맵
const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
const epNumMap = new Map((eps ?? []).map(e => [e.id, e.episode_num]))

// 2글자 이하 필터
const short = bubbles.filter(b => b.highlight_text && [...b.highlight_text].length <= 2)
console.log(`highlight_text 있는 버블 총계: ${bubbles.length}`)
console.log(`2글자 이하: ${short.length}건\n`)

// 정렬: episode_num → bubble id
const sorted = short.sort((a, b) => {
  const ea = epNumMap.get(a.episode_id) ?? 999
  const eb = epNumMap.get(b.episode_id) ?? 999
  return ea !== eb ? ea - eb : a.id - b.id
})

for (const b of sorted) {
  const text = (b.dialogue_id ? dlgMap.get(b.dialogue_id) : null) ?? b.korean ?? ''
  const hl = b.highlight_text
  const idx = text.indexOf(hl)
  const epNum = epNumMap.get(b.episode_id) ?? '?'

  let matchCtx = '(not found)'
  if (idx !== -1) {
    // 앞뒤 5글자 컨텍스트
    const before = text.slice(Math.max(0, idx - 5), idx)
    const after  = text.slice(idx + hl.length, idx + hl.length + 5)
    matchCtx = `"${before}[${hl}]${after}"`
  }

  console.log(`EP${String(epNum).padStart(2,'0')} id=${b.id}  hl="${hl}"(${[...hl].length}자)  match: ${matchCtx}`)
}
