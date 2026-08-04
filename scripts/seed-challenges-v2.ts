/**
 * seed-challenges-v2.ts
 *
 * kp_challenges 전체 삭제 후 알고리즘 기반 재생성 (AI 호출 없음)
 *
 * EP당 15개 고정:
 *   translation 6개 : kp_expressions.examples ko/en 기반
 *                     오답 = 같은 EP 다른 examples ko
 *   fill_blank  6개 : kp_dialogue_expressions.matched_text → kp_dialogues.text_ko 빈칸
 *                     오답 = 같은 EP 다른 matched_text
 *   word_order  3개 : kp_dialogues.text_ko 단어 배열
 *
 * Run: npx tsx scripts/seed-challenges-v2.ts [--apply]
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

const APPLY = process.argv.includes('--apply')

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

/** 정답 포함 4지선다 생성 (pool에서 오답 3개) */
function makeOpts(answer: string, pool: string[]): string[] {
  const wrongs = sample(pool.filter(x => x !== answer), 3)
  if (wrongs.length < 3) return null as unknown as string[] // 오답 부족
  return shuffle([answer, ...wrongs])
}

type Challenge = {
  episode_id: number
  challenge_type: 'translation' | 'fill_blank' | 'word_order'
  question: Record<string, string>
  options: string[] | null
  answer: string
  word_pieces: string[] | null
  order_num: number
}

// ─── 소스 데이터 타입 ────────────────────────────────────────────────────────

type ExprRow = {
  id: number
  episode_id: number
  examples: { ko: string; en: string }[] | null
}

type FocusRow = {
  dialogue_id: number
  matched_text: string
  kp_dialogues: { episode_id: number; text_ko: string } | null
}

type DialogueRow = {
  id: number
  episode_id: number
  text_ko: string
}

// ─── 메인 ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== seed-challenges-v2 ===\n')

  // ── 1. DB 로드 ────────────────────────────────────────────────────────────

  console.log('Loading kp_episodes...')
  const { data: episodes } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .order('episode_num')
  if (!episodes?.length) { console.error('kp_episodes 없음'); process.exit(1) }
  console.log(`  ${episodes.length}개 에피소드`)

  console.log('Loading kp_expressions...')
  const { data: exprRaw } = await sb
    .from('kp_expressions')
    .select('id, episode_id, examples')
  const expressions = (exprRaw ?? []) as ExprRow[]
  console.log(`  ${expressions.length}개 expressions`)

  console.log('Loading kp_dialogue_expressions (focus)...')
  const { data: focusRaw } = await sb
    .from('kp_dialogue_expressions')
    .select('dialogue_id, matched_text, kp_dialogues!inner(episode_id, text_ko)')
    .eq('role', 'focus')
  const focusRows = (focusRaw ?? []) as unknown as FocusRow[]
  console.log(`  ${focusRows.length}개 focus 매핑`)

  console.log('Loading kp_dialogues...')
  const { data: dlgRaw } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, text_ko')
    .order('id')
  const dialogues = (dlgRaw ?? []) as DialogueRow[]
  console.log(`  ${dialogues.length}개 dialogues\n`)

  // ── 2. EP별 인덱스 ────────────────────────────────────────────────────────

  // EP id → examples 목록 (ko, en 모두 있는 것만)
  const exprByEp = new Map<number, { ko: string; en: string }[]>()
  for (const expr of expressions) {
    const epId = expr.episode_id
    if (!exprByEp.has(epId)) exprByEp.set(epId, [])
    for (const ex of (expr.examples ?? [])) {
      if (ex.ko && ex.en) exprByEp.get(epId)!.push({ ko: ex.ko, en: ex.en })
    }
  }

  // EP id → fill_blank 소스 목록 ({text_ko, matched_text})
  type FillSrc = { text_ko: string; matched_text: string }
  const fillByEp = new Map<number, FillSrc[]>()
  for (const row of focusRows) {
    const dlg = row.kp_dialogues
    if (!dlg) continue
    const epId = dlg.episode_id
    const matched = row.matched_text
    if (!matched || !dlg.text_ko.includes(matched) || matched.length >= dlg.text_ko.length) continue
    if (!fillByEp.has(epId)) fillByEp.set(epId, [])
    fillByEp.get(epId)!.push({ text_ko: dlg.text_ko, matched_text: matched })
  }

  // EP id → dialogues
  const dlgByEp = new Map<number, DialogueRow[]>()
  for (const d of dialogues) {
    if (!dlgByEp.has(d.episode_id)) dlgByEp.set(d.episode_id, [])
    dlgByEp.get(d.episode_id)!.push(d)
  }

  // ── 3. 챌린지 생성 ────────────────────────────────────────────────────────

  const challenges: Challenge[] = []
  const stats: { ep: number; t: number; f: number; w: number; skip: string[] }[] = []

  for (const ep of episodes) {
    const epId = ep.id
    const epNum = ep.episode_num
    const epChallenges: Challenge[] = []
    const epSkips: string[] = []
    let order = 1

    // ── translation 6개 ─────────────────────────────────────────────────────
    const allExamples = exprByEp.get(epId) ?? []
    const koPool = allExamples.map(e => e.ko) // 같은 EP 오답 풀

    const tSrc = shuffle(allExamples).slice(0, 6)
    for (const ex of tSrc) {
      const opts = makeOpts(ex.ko, koPool)
      if (!opts) { epSkips.push(`translation:opts<4`); continue }
      epChallenges.push({
        episode_id: epId,
        challenge_type: 'translation',
        question: { prompt: ex.en },
        options: opts,
        answer: ex.ko,
        word_pieces: null,
        order_num: order++,
      })
    }
    if (tSrc.length < 6) epSkips.push(`translation:src=${tSrc.length}<6`)

    // ── fill_blank 6개 ──────────────────────────────────────────────────────
    const fillSrcs = fillByEp.get(epId) ?? []
    const matchedPool = fillSrcs.map(s => s.matched_text) // 같은 EP 오답 풀

    const fSrc = shuffle(fillSrcs).slice(0, 6)
    for (const src of fSrc) {
      const prompt = src.text_ko.replace(src.matched_text, '___')
      const opts = makeOpts(src.matched_text, matchedPool)
      if (!opts) { epSkips.push(`fill_blank:opts<4`); continue }
      epChallenges.push({
        episode_id: epId,
        challenge_type: 'fill_blank',
        question: { prompt },
        options: opts,
        answer: src.matched_text,
        word_pieces: null,
        order_num: order++,
      })
    }
    if (fSrc.length < 6) epSkips.push(`fill_blank:src=${fSrc.length}<6`)

    // ── word_order 3개 ──────────────────────────────────────────────────────
    const dlgs = (dlgByEp.get(epId) ?? []).filter(d =>
      d.text_ko && d.text_ko.trim().split(/\s+/).length >= 2
    )
    const wSrc = shuffle(dlgs).slice(0, 3)
    for (const d of wSrc) {
      const pieces = d.text_ko.trim().split(/\s+/).filter(Boolean)
      epChallenges.push({
        episode_id: epId,
        challenge_type: 'word_order',
        question: { prompt: d.text_ko },
        options: null,
        answer: pieces.join(' '),
        word_pieces: shuffle(pieces),
        order_num: order++,
      })
    }
    if (wSrc.length < 3) epSkips.push(`word_order:src=${wSrc.length}<3`)

    challenges.push(...epChallenges)
    stats.push({
      ep: epNum,
      t: epChallenges.filter(c => c.challenge_type === 'translation').length,
      f: epChallenges.filter(c => c.challenge_type === 'fill_blank').length,
      w: epChallenges.filter(c => c.challenge_type === 'word_order').length,
      skip: epSkips,
    })
  }

  // ── 4. 결과 요약 ─────────────────────────────────────────────────────────

  console.log(`총 생성: ${challenges.length}개 / 목표 1500개`)
  console.log(`\n| EP  | T | F | W | total | 비고 |`)
  console.log(`|-----|---|---|---|-------|------|`)

  const CHECK_EPS = new Set([1, 50, 100])
  const WARN_EPS: number[] = []
  for (const s of stats) {
    const total = s.t + s.f + s.w
    const flag = total < 15 ? '⚠' : '✓'
    if (total < 15) WARN_EPS.push(s.ep)
    if (CHECK_EPS.has(s.ep) || total < 15) {
      console.log(`| EP${String(s.ep).padStart(3,'0')} | ${s.t} | ${s.f} | ${s.w} | ${String(total).padStart(5)} | ${flag} ${s.skip.join('; ')} |`)
    }
  }

  if (WARN_EPS.length === 0) {
    console.log('\n✓ 전체 EP 15개 달성')
  } else {
    console.log(`\n⚠ ${WARN_EPS.length}개 EP 15개 미달: EP${WARN_EPS.slice(0,10).join(', EP')}${WARN_EPS.length > 10 ? '...' : ''}`)
  }

  if (!APPLY) {
    console.log('\n──── DRY RUN ────')
    console.log('실제 적용: npx tsx scripts/seed-challenges-v2.ts --apply')
    return
  }

  // ── 5. DB 적용 ────────────────────────────────────────────────────────────

  console.log('\n기존 kp_challenges 전체 삭제...')
  const { error: delErr } = await sb.from('kp_challenges').delete().gte('id', 0)
  if (delErr) { console.error('삭제 실패:', delErr); process.exit(1) }
  console.log('✓ 삭제 완료')

  console.log(`\n${challenges.length}개 INSERT (배치 200개)...`)
  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < challenges.length; i += BATCH) {
    const batch = challenges.slice(i, i + BATCH)
    const { error } = await sb.from('kp_challenges').insert(batch)
    if (error) { console.error(`배치 ${i}: ${error.message}`); continue }
    inserted += batch.length
    process.stdout.write(`\r  ${inserted}/${challenges.length}`)
  }
  console.log(`\n✓ ${inserted}개 INSERT 완료`)

  // EP01, EP50, EP100 확인
  console.log('\n=== EP01 / EP50 / EP100 각 15개 확인 ===')
  for (const epNum of [1, 50, 100]) {
    const ep = episodes.find(e => e.episode_num === epNum)
    if (!ep) { console.log(`EP${epNum}: 없음`); continue }
    const { data: rows } = await sb
      .from('kp_challenges')
      .select('challenge_type, question, options, answer, order_num')
      .eq('episode_id', ep.id)
      .order('order_num')
    console.log(`\n--- EP${String(epNum).padStart(3,'0')} (${rows?.length ?? 0}개) ---`)
    for (const r of (rows ?? [])) {
      const type = r.challenge_type.padEnd(11)
      const q = String(r.question?.prompt ?? '').slice(0, 40).replace(/\n/g, ' ')
      const a = String(r.answer ?? '').slice(0, 20)
      console.log(`  ${type} Q: "${q}"  A: "${a}"`)
    }
  }

  console.log('\n=== 완료 ===')
}

main().catch(e => { console.error(e); process.exit(1) })
