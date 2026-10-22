/**
 * 퀴즈(kp_challenges) 무결성 점검 — 읽기 전용.
 *   node scripts/audit-challenges.cjs
 *
 * 구조:  300 라운드(에피소드 100 × 3) × 5문항 = 1,500행, 라운드당 MC2·FB2·SB1
 * 점검:  1) 라운드 구성  2) 외래키(expression_id 존재·활성)  3) 예문 index 범위
 *        4) 빈 문항·보기·토큰  5) 정답 ∈ 보기 / 토큰으로 정답 복원 가능  6) 활성 패턴 커버리지
 *        7) 참고: MC·SB 문항이 가리키는 예문(example_index)과 문장이 일치하는 비율
 */
const ROOT = 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto'
require('dotenv').config({ path: ROOT + '/.env.local' })
const { createClient } = require('@supabase/supabase-js')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function all(table, cols) { let out = [], from = 0; for (;;) { const { data, error } = await sb.from(table).select(cols).range(from, from + 999); if (error) throw error; out = out.concat(data); if (data.length < 1000) break; from += 1000 } return out }

async function main() {
  const ex = await all('kp_expressions', 'id,korean,is_active,examples')
  const ch = await all('kp_challenges', 'id,ep_no,round_no,slot,type,question,hint,answer,options,tokens,variant,expression_id,example_index')
  const exMap = new Map(ex.map(e => [e.id, e]))
  const problems = {}
  const bad = (k, c, note = '') => { (problems[k] = problems[k] || []).push(`#${c.id} EP${c.ep_no} r${c.round_no} ${c.slot}${note ? ' ' + note : ''}`) }
  const act = ex.filter(e => e.is_active !== false)

  // 1) 라운드 구성
  const rounds = new Map()
  for (const c of ch) { const k = `${c.ep_no}:${c.round_no}`; if (!rounds.has(k)) rounds.set(k, []); rounds.get(k).push(c) }
  let badRound = 0
  for (const [k, rows] of rounds) {
    const t = { multiple_choice: 0, fill_blank: 0, sentence_build: 0 }; rows.forEach(r => t[r.type]++)
    if (rows.length !== 5 || t.multiple_choice !== 2 || t.fill_blank !== 2 || t.sentence_build !== 1) { badRound++; (problems.round = problems.round || []).push(`${k} n=${rows.length} MC${t.multiple_choice} FB${t.fill_blank} SB${t.sentence_build}`) }
  }
  for (const c of ch) {
    const e = exMap.get(c.expression_id)
    // 2) 외래키·활성
    if (c.expression_id == null) bad('fk_null', c)
    else if (!e) bad('fk_missing', c, 'expr ' + c.expression_id)
    else if (e.is_active === false) bad('inactive_ref', c, 'expr ' + c.expression_id)
    // 3) 예문 index
    if (e && !(Number.isInteger(c.example_index) && c.example_index >= 0 && c.example_index < e.examples.length)) bad('example_index', c, String(c.example_index))
    // 4) 빈 값
    if (!String(c.question || '').trim()) bad('empty_question', c)
    if (!String(c.answer || '').trim()) bad('empty_answer', c)
    // 5) 유형별
    if (c.type === 'multiple_choice' || c.type === 'fill_blank') {
      const o = c.options
      if (!Array.isArray(o) || o.length !== 4) bad('options_len', c, JSON.stringify(o))
      else {
        if (new Set(o).size !== 4) bad('options_dup', c)
        if (!o.includes(c.answer)) bad('answer_not_in_options', c, c.answer)
        if (o.some(x => !String(x).trim())) bad('options_empty', c)
      }
    }
    if (c.type === 'fill_blank' && !c.question.includes('___') && c.variant === 'blank') bad('fb_no_blank', c, c.question)
    if (c.type === 'sentence_build') {
      const t = c.tokens
      if (!Array.isArray(t) || t.length < 3) bad('tokens', c)
      else {
        const rem = t.slice(); let ok = true
        for (const w of c.answer.split(/\s+/)) { const k = rem.indexOf(w); if (k < 0) { ok = false; break } rem.splice(k, 1) }
        if (!ok) bad('tokens_cannot_build_answer', c, c.answer)
      }
    }
  }
  // 6) 커버리지
  const covered = new Set(ch.map(c => c.expression_id))
  const uncovered = act.filter(e => !covered.has(e.id))
  // 7) 문장 일치율(참고)
  let tot = 0, match = 0
  for (const c of ch) {
    if (c.type === 'fill_blank') continue
    const e = exMap.get(c.expression_id); const x = e && e.examples[c.example_index]; if (!x) continue
    tot++
    if (c.type === 'multiple_choice' ? (c.question === x.ko && c.answer === x.en) : (c.answer === x.ko && c.question === x.en)) match++
  }
  console.log('=== kp_challenges 무결성 리포트 ===')
  console.log(`표현 ${ex.length} (활성 ${act.length} / 비활성 ${ex.length - act.length}) | 문항 ${ch.length}행 | 라운드 ${rounds.size}개 (이상 ${badRound})`)
  console.log(`문항이 있는 서로 다른 표현 ${covered.size}개 | 활성 패턴 중 문항이 하나도 없는 것 ${uncovered.length}개 ${uncovered.map(e => e.id + ':' + e.korean).join(', ')}`)
  const keys = Object.keys(problems)
  console.log(keys.length ? '\n[문제]' : '\n[문제 없음] 외래키·활성·빈 문항·보기·토큰 검사 모두 통과')
  for (const k of keys) console.log(` - ${k}: ${problems[k].length}건 ${problems[k].slice(0, 4).join(' | ')}`)
  console.log(`\n[참고] MC·SB 문항 중 가리키는 예문(example_index)과 문장이 일치: ${match}/${tot} (${Math.round(match / tot * 100)}%)`)
}
main().then(() => process.exit(0)).catch(e => { console.error('ERR', e.message); process.exit(1) })
