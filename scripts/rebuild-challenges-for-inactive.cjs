/**
 * 비활성(is_active=false) 표현을 묻던 퀴즈 문항을 같은 에피소드의 활성 패턴 문항으로 바꿔 끼운다.
 *
 * 문항을 그냥 지우면 라운드(에피소드×3, 라운드당 MC2·FB2·SB1 = 5문항)가 비거나 짧아진다
 * (EP20 은 라운드 1 이 0문항이 된다). 그래서 지우지 않고 행을 제자리에서 고쳐 쓴다.
 * slot·round_no·type 은 그대로 두고 expression_id / example_index / 내용만 활성 패턴 기준으로 바꾼다.
 *
 *   --dry     바꿀 내용만 출력하고 아무것도 쓰지 않는다
 *   (기본)    쓰기 전에 exports/kpatto/backup_challenges_before_rebuild.json 에 원본 행을 저장한다
 *
 * 추가 처리
 *   - 활성 패턴 문항의 보기(FB)에 비활성 표현이 들어 있으면 다른 활성 표현으로 교체한다
 *   - 새 예문으로 승격된 885·787 문항(8행)은 새 예문 기준으로 다시 쓴다
 */
const ROOT = 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto'
require('dotenv').config({ path: ROOT + '/.env.local' })
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const DRY = process.argv.includes('--dry')

const norm = s => String(s || '').replace(/[~?.!,\-\s]/g, '')
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }
function shuffle(a, seed) { const r = rng(seed), o = a.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[o[i], o[j]] = [o[j], o[i]] } return o }
async function all(table, cols) { let out = [], from = 0; for (;;) { const { data, error } = await sb.from(table).select(cols).range(from, from + 999); if (error) throw error; out = out.concat(data); if (data.length < 1000) break; from += 1000 } return out }

// 승격 2건: 빈칸으로 뺄 구절 (표현 id:예문 index)
const PROMOTED_BLANK = { '885:2': '계절마다', '787:2': '가까워서 좋아요.' }

async function main() {
  const ex = await all('kp_expressions', 'id,korean,english,first_episode,is_active,examples')
  const ch = await all('kp_challenges', 'id,ep_no,round_no,slot,type,question,hint,answer,options,tokens,variant,expression_id,example_index')
  const exMap = new Map(ex.map(e => [e.id, e]))
  const active = id => exMap.get(id)?.is_active !== false
  const offKor = new Set(ex.filter(e => e.is_active === false).map(e => norm(e.korean)))
  const byEp = new Map(); for (const c of ch) { if (!byEp.has(c.ep_no)) byEp.set(c.ep_no, []); byEp.get(c.ep_no).push(c) }

  // 같은 에피소드(없으면 근처)의 활성 표현 — 오답 보기 후보
  const patsNear = (ep, selfId) => ex.filter(e => e.is_active !== false && e.id !== selfId && e.first_episode && Math.abs(e.first_episode - ep) <= 3)
  const enPool = (ep, selfId) => {
    const same = [], near = []
    for (const e of patsNear(ep, selfId)) for (const x of e.examples) (e.first_episode === ep ? same : near).push(x.en)
    return [...same, ...near]
  }
  const koWords = (ep, selfId, avoid) => {
    const out = []
    for (const e of patsNear(ep, selfId)) for (const x of e.examples) for (const w of x.ko.split(/\s+/)) if (!avoid.includes(w) && !out.includes(w)) out.push(w)
    return out
  }
  const koPhrases = (ep, selfId, avoid) => patsNear(ep, selfId).map(e => e.korean).filter(k => !avoid.includes(k))

  // 패턴 어구가 예문에 그대로 있으면 그 구절(문장 끝이면 구두점까지)을, 없으면 마지막 두 어절을 뺀다
  function blankPhrase(e, example) {
    const core = e.korean.replace(/[~]/g, '').replace(/\(으\)/g, '').replace(/^[-\s]+|[\s?]+$/g, '').replace(/\s*\/.*$/, '').trim()
    const ko = example.ko
    if (core.length >= 2 && ko.includes(core)) {
      const i = ko.indexOf(core)
      const rest = ko.slice(i + core.length)
      return { phrase: /^[?.!]*$/.test(rest) ? ko.slice(i) : core, matched: true }
    }
    return { phrase: ko.split(/\s+/).slice(-2).join(' '), matched: false }
  }
  // 마지막 두 어절 형태의 오답(다른 예문 조각)
  const tails = (ep, selfId, avoid) => {
    const out = []
    for (const e of patsNear(ep, selfId)) for (const x of e.examples) { const t = x.ko.split(/\s+/).slice(-2).join(' '); if (!avoid.includes(t) && !out.includes(t)) out.push(t) }
    return out
  }

  function build(type, e, exIdx, seed, ep, manualBlank) {
    const x = e.examples[exIdx]
    if (type === 'multiple_choice') {
      const dis = shuffle([...new Set(enPool(ep, e.id))].filter(t => t !== x.en), seed).slice(0, 3)
      return { question: x.ko, hint: null, answer: x.en, options: shuffle([x.en, ...dis], seed + 1), tokens: null, variant: '' }
    }
    if (type === 'sentence_build') {
      const ans = x.ko.split(/\s+/)
      const dis = shuffle(koWords(ep, e.id, ans), seed).slice(0, 2)
      return { question: x.en, hint: null, answer: x.ko, options: null, tokens: shuffle([...ans, ...dis], seed + 1), variant: '' }
    }
    const bp = manualBlank ? { phrase: manualBlank, matched: true } : blankPhrase(e, x)
    const ph = bp.phrase
    const pool = bp.matched ? koPhrases(ep, e.id, [ph, e.korean]) : tails(ep, e.id, [ph])
    const dis = shuffle([...new Set(pool)], seed).slice(0, 3)
    return { question: x.ko.replace(ph, '___').trim(), hint: x.en, answer: ph, options: shuffle([ph, ...dis], seed + 1), tokens: null, variant: 'blank' }
  }

  const updates = [] // { id, before, patch, why }
  const used = new Map() // `${ep}:${round}` → Set(`${exprId}:${idx}:${type}`)
  for (const c of ch) { const k = `${c.ep_no}:${c.round_no}`; if (!used.has(k)) used.set(k, new Set()); if (active(c.expression_id)) used.get(k).add(`${c.expression_id}:${c.example_index}:${c.type}`) }

  // 1) 비활성 표현 문항 → 같은 에피소드 활성 패턴 문항으로 교체
  const rr = new Map()
  for (const c of ch.filter(c => !active(c.expression_id)).sort((a, b) => a.ep_no - b.ep_no || a.round_no - b.round_no || a.slot.localeCompare(b.slot))) {
    const pats = [...new Set((byEp.get(c.ep_no) || []).filter(r => active(r.expression_id)).map(r => r.expression_id))].sort((a, b) => a - b)
    if (!pats.length) { console.log('!! EP' + c.ep_no + ' 활성 패턴 없음 — row ' + c.id + ' 건너뜀'); continue }
    const key = `${c.ep_no}:${c.round_no}`
    let n = rr.get(c.ep_no) || 0, pick = null
    for (let t = 0; t < pats.length * 3 && !pick; t++, n++) {
      const pid = pats[n % pats.length], idx = Math.floor(n / pats.length) % 3
      if (!used.get(key).has(`${pid}:${idx}:${c.type}`)) pick = [pid, idx]
    }
    if (!pick) pick = [pats[n % pats.length], n % 3]   // 어쩔 수 없을 때만 중복 허용
    rr.set(c.ep_no, n + 1)
    used.get(key).add(`${pick[0]}:${pick[1]}:${c.type}`)
    const e = exMap.get(pick[0])
    const patch = { ...build(c.type, e, pick[1], c.id * 7 + pick[1], c.ep_no), expression_id: pick[0], example_index: pick[1] }
    updates.push({ id: c.id, before: c, patch, why: `비활성 ${c.expression_id} → 활성 ${pick[0]} ex${pick[1] + 1}` })
  }

  // 2) 활성 문항의 FB 보기에 비활성 표현이 끼어 있으면 교체
  for (const c of ch.filter(c => active(c.expression_id) && Array.isArray(c.options) && c.type === 'fill_blank')) {
    const bad = c.options.filter(o => o !== c.answer && offKor.has(norm(o)))
    if (!bad.length) continue
    const e = exMap.get(c.expression_id)
    const pool = shuffle(koPhrases(c.ep_no, c.expression_id, [...c.options, e.korean]), c.id)
    const opts = c.options.map(o => (bad.includes(o) ? (pool.shift() || o) : o))
    updates.push({ id: c.id, before: c, patch: { options: opts }, why: `보기의 비활성 표현 교체: ${bad.join(', ')}` })
  }

  // 3) 승격 885·787: 새 예문 기준으로 다시 쓰기(기존 보기 중 정답만 바꾸고 오답은 유지)
  for (const c of ch.filter(c => [885, 787].includes(c.expression_id))) {
    const e = exMap.get(c.expression_id), x = e.examples[c.example_index]
    let patch
    if (c.type === 'multiple_choice') patch = { question: x.ko, answer: x.en, options: c.options.map(o => (o === c.answer ? x.en : o)) }
    else if (c.type === 'sentence_build') {
      const old = c.answer.split(/\s+/), ans = x.ko.split(/\s+/)
      const dis = []; const rem = old.slice(); for (const t of c.tokens) { const k = rem.indexOf(t); if (k >= 0) rem.splice(k, 1); else dis.push(t) }
      patch = { question: x.en, answer: x.ko, tokens: shuffle([...ans, ...dis.filter(t => !ans.includes(t))], c.id) }
    } else {
      const ph = PROMOTED_BLANK[`${c.expression_id}:${c.example_index}`]
      patch = { question: x.ko.replace(ph, '___').trim(), hint: x.en, answer: ph, options: c.options.map(o => (o === c.answer ? ph : o)) }
    }
    updates.push({ id: c.id, before: c, patch, why: `승격 ${c.expression_id} 새 예문 반영` })
  }

  // 같은 행이 둘 이상의 규칙에 걸리면 마지막 것이 이긴다(위 순서)
  const merged = new Map()
  for (const u of updates) merged.set(u.id, merged.has(u.id) ? { ...u, patch: { ...merged.get(u.id).patch, ...u.patch } } : u)
  console.log('수정할 행', merged.size, '(교체', updates.filter(u => u.why.startsWith('비활성')).length, '· 보기 교체', updates.filter(u => u.why.startsWith('보기')).length, '· 승격', updates.filter(u => u.why.startsWith('승격')).length + ')')
  for (const u of [...merged.values()].slice(0, DRY ? 400 : 0)) {
    const b = u.before, p = u.patch
    console.log(`#${u.id} EP${b.ep_no} r${b.round_no} ${b.slot} ${b.type} | ${u.why}`)
    if (p.question !== undefined) console.log(`    Q: ${b.question}  →  ${p.question}`)
    if (p.answer !== undefined) console.log(`    A: ${b.answer}  →  ${p.answer}`)
    if (p.options) console.log(`    opts: ${JSON.stringify(p.options)}`)
    if (p.tokens) console.log(`    tokens: ${JSON.stringify(p.tokens)}`)
  }
  if (DRY) { console.log('DRY RUN'); return }

  fs.writeFileSync(ROOT + '/exports/kpatto/backup_challenges_before_rebuild.json', JSON.stringify([...merged.values()].map(u => u.before), null, 2), 'utf8')
  for (const u of merged.values()) {
    const { error } = await sb.from('kp_challenges').update(u.patch).eq('id', u.id)
    if (error) throw new Error(u.id + ' ' + error.message)
  }
  console.log('OK: 갱신', merged.size)
}
main().then(() => process.exit(0)).catch(e => { console.error('ERR', e.message); process.exit(1) })
