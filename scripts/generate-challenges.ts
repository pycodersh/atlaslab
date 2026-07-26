/**
 * 규칙 기반 챌린지 생성 — Claude API 없음
 * kp_dialogues + kp_dialogue_expressions(role='focus') + kp_expressions 데이터 사용
 *
 * 에피소드당 focus 표현 최대 3개 × 최대 5문제 = 최대 15개 (99 ep × 15 ≈ 1485)
 *   translation × 2 : expression.examples[0].en → 한국어 4지선다
 *   fill_blank  × 2 : 한국어 빈칸 → 4지선다
 *   word_order  × 1 : 영어 힌트 + 단어 카드 순서 맞추기
 *
 * 실행: npx tsx scripts/generate-challenges.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

// ─── Static fallback pools ────────────────────────────────────────────────────

const FALLBACK_SENTENCES: { ko: string; en: string }[] = [
  { ko: '감사합니다.', en: 'Thank you.' },
  { ko: '괜찮아요.', en: "It's okay." },
  { ko: '잘 모르겠어요.', en: "I'm not sure." },
  { ko: '안녕하세요.', en: 'Hello.' },
  { ko: '맞아요.', en: "That's right." },
]

const FALLBACK_WORDS = ['없어요', '안 돼요', '몰라요', '봐요', '해요']

// ─── Types ────────────────────────────────────────────────────────────────────

interface EpisodeRow { id: number; episode_num: number; title: string }
interface ExpressionRow {
  id: number
  korean: string
  description: string | null
  examples: Array<{ ko: string; en: string }> | null
}
interface DialogueRow {
  id: number
  episode_id: number
  text_ko: string
  text_en: string | null
}
interface FocusMapping { dialogue_id: number; expression_id: number; matched_text: string }

interface ChallengeRow {
  episode_id: number
  order_num: number
  challenge_type: string
  question: { prompt: string }
  options: string[] | null
  answer: string
  word_pieces: string[] | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Remove leading ~ and trailing punctuation to get the core grammar word */
function patternCore(exprKorean: string): string {
  return exprKorean.replace(/^~/, '').replace(/[?！？.。!？]+$/, '').trim()
}

/** Replace the LAST occurrence of target in sentence with ___ */
function makeFillBlank(sentence: string, target: string): string | null {
  if (!sentence || !target) return null
  const idx = sentence.lastIndexOf(target)
  if (idx === -1) return null
  const result = sentence.slice(0, idx) + '___' + sentence.slice(idx + target.length)
  return result.includes('___') ? result : null
}

/** Pick n unique wrong options from pool, pad with fallback if needed */
function pickWrongOptions(pool: string[], exclude: string[], n: number, fallback: string[]): string[] {
  const used = new Set(exclude)
  const wrongs: string[] = []
  for (const item of shuffle(pool)) {
    if (!used.has(item) && !wrongs.includes(item)) {
      wrongs.push(item)
      if (wrongs.length === n) break
    }
  }
  for (const item of fallback) {
    if (wrongs.length >= n) break
    if (!used.has(item) && !wrongs.includes(item)) wrongs.push(item)
  }
  // Last resort: repeat from fallback
  while (wrongs.length < n) {
    wrongs.push(fallback[wrongs.length % fallback.length] ?? '없어요')
  }
  return wrongs.slice(0, n)
}

// ─── Per-expression question generator ───────────────────────────────────────

function buildQuestions(
  epDbId: number,
  expr: ExpressionRow,
  focusDlg: DialogueRow,          // primary dialogue containing this expression
  matchedText: string,
  secondDlg: DialogueRow | null,  // another dialogue using same expression
  sentencePool: string[],          // other episode text_ko for wrong options
  matchedTextPool: string[],       // other expressions' matched_text for fill_blank wrongs
  startOrder: number
): ChallengeRow[] {
  const rows: ChallengeRow[] = []
  let order = startOrder

  const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()
  const ko1 = normalize(focusDlg.text_ko)
  const core = patternCore(expr.korean)

  // For fill_blank: prefer core word when matched_text is the whole sentence or too long
  const fillTarget = (matchedText === ko1 || matchedText.length > 20)
    ? core
    : matchedText

  // For fill_blank wrong options: single words only
  const shortMatchedTexts = matchedTextPool
    .map(t => t.replace(/[?！？.。!？]+$/, '').trim())
    .filter(t => !t.includes(' '))
  const wrongWords = [
    ...shortMatchedTexts,
    ...FALLBACK_WORDS,
  ].filter(w => w !== fillTarget && w !== core)

  const makeRow = (
    type: string,
    prompt: string,
    options: string[] | null,
    answer: string,
    pieces: string[] | null,
  ): ChallengeRow => ({
    episode_id: epDbId,
    order_num: order++,
    challenge_type: type,
    question: { prompt },
    options,
    answer,
    word_pieces: pieces,
  })

  // ── Translation Q1: expression example[0] EN → KO (the actual dialogue sentence) ──
  const ex0 = expr.examples?.[0]
  if (ex0?.en && ko1) {
    const wrongs = pickWrongOptions(sentencePool, [ko1], 3, FALLBACK_SENTENCES.map(s => s.ko))
    rows.push(makeRow('translation', `"${ex0.en}"`, shuffle([ko1, ...wrongs]), ko1, null))
  }

  // ── Translation Q2: expression example[1] EN → KO (example sentence) ────────────
  const ex1 = expr.examples?.[1]
  if (ex1?.en && ex1.ko && ex1.ko !== ko1) {
    const wrongs = pickWrongOptions(sentencePool, [ex1.ko, ko1], 3, FALLBACK_SENTENCES.map(s => s.ko))
    rows.push(makeRow('translation', `"${ex1.en}"`, shuffle([ex1.ko, ...wrongs]), ex1.ko, null))
  } else if (secondDlg && secondDlg.text_ko !== ko1) {
    // Fallback: second dialogue + example[0] as English hint
    const ko2 = normalize(secondDlg.text_ko)
    const en2 = ex0?.en ?? `How do you say: ${core}?`
    const wrongs = pickWrongOptions(sentencePool, [ko2, ko1], 3, FALLBACK_SENTENCES.map(s => s.ko))
    rows.push(makeRow('translation', `"${en2}"`, shuffle([ko2, ...wrongs]), ko2, null))
  }

  // ── Fill blank Q1: dialogue sentence with fillTarget → ___ ────────────────────────
  const fb1 = makeFillBlank(ko1, fillTarget) ?? makeFillBlank(ko1, core)
  if (fb1 && fb1 !== '___') {
    const correct1 = ko1.includes(fillTarget) ? fillTarget : core
    const wrongs1 = pickWrongOptions(wrongWords, [correct1], 3, FALLBACK_WORDS)
    rows.push(makeRow('fill_blank', fb1, shuffle([correct1, ...wrongs1]), correct1, null))
  }

  // ── Fill blank Q2: expression example sentence with core → ___ ───────────────────
  const ex2 = expr.examples?.[1] ?? expr.examples?.[0]
  let fb2Added = false
  if (ex2) {
    const fb2 = makeFillBlank(ex2.ko, core) ?? makeFillBlank(ex2.ko, fillTarget)
    if (fb2 && fb2 !== '___' && fb2 !== fb1) {
      const correct2 = ex2.ko.includes(core) ? core : fillTarget
      const wrongs2 = pickWrongOptions(wrongWords, [correct2], 3, FALLBACK_WORDS)
      rows.push(makeRow('fill_blank', fb2, shuffle([correct2, ...wrongs2]), correct2, null))
      fb2Added = true
    }
  }
  // Fallback: second dialogue sentence
  if (!fb2Added && secondDlg && secondDlg.text_ko !== ko1) {
    const ko2 = normalize(secondDlg.text_ko)
    const fb2b = makeFillBlank(ko2, fillTarget) ?? makeFillBlank(ko2, core)
    if (fb2b && fb2b !== '___' && fb2b !== fb1) {
      const correct2b = ko2.includes(fillTarget) ? fillTarget : core
      const wrongs2b = pickWrongOptions(wrongWords, [correct2b], 3, FALLBACK_WORDS)
      rows.push(makeRow('fill_blank', fb2b, shuffle([correct2b, ...wrongs2b]), correct2b, null))
    }
  }

  // ── Word order: dialogue sentence split into chips + 1 distractor ─────────────────
  const cleanKo = ko1.replace(/[!?！？。.…]+$/, '').trim()
  const words = cleanKo.split(/\s+/)
    .map(w => w.replace(/[!?！？。.…,，]+$/, '').trim())
    .filter(Boolean)
  const wordHint = ex0?.en ?? `"${core}"`
  if (words.length >= 2) {
    const singleWordPool = matchedTextPool.filter(t => !t.includes(' '))
    const distractor =
      singleWordPool.find(t => !words.includes(t)) ??
      FALLBACK_WORDS.find(d => !words.includes(d)) ??
      '없어요'
    rows.push(makeRow('word_order', `"${wordHint}"`, null, words.join(' '), shuffle([...words, distractor])))
  }

  return rows
}

// ─── Per-episode processor ────────────────────────────────────────────────────

const MAX_EXPRESSIONS = 3

async function processEpisode(ep: EpisodeRow): Promise<number> {
  // 1. Fetch all dialogues for the episode
  const { data: dlgsRaw } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, text_ko, text_en')
    .eq('episode_id', ep.id)
    .order('order_num')

  const dlgList = (dlgsRaw ?? []) as DialogueRow[]
  if (dlgList.length === 0) return 0

  const dlgIds = dlgList.map(d => d.id)

  // 2. Fetch focus mappings for these dialogues
  const { data: mappingsRaw } = await sb
    .from('kp_dialogue_expressions')
    .select('dialogue_id, expression_id, matched_text')
    .in('dialogue_id', dlgIds)
    .eq('role', 'focus')

  const mappings = (mappingsRaw ?? []) as FocusMapping[]
  if (mappings.length === 0) return 0

  // 3. Build dialogue_id → dialogue lookup
  const dlgById = new Map<number, DialogueRow>()
  for (const d of dlgList) {
    if (d.text_ko) dlgById.set(d.id, d)
  }

  // 4. Group mappings by expression_id
  const byExpr = new Map<number, FocusMapping[]>()
  for (const m of mappings) {
    if (!byExpr.has(m.expression_id)) byExpr.set(m.expression_id, [])
    byExpr.get(m.expression_id)!.push(m)
  }

  // 5. Pick top MAX_EXPRESSIONS by occurrence count
  const exprIds = [...byExpr.keys()]
    .sort((a, b) => (byExpr.get(b)?.length ?? 0) - (byExpr.get(a)?.length ?? 0))
    .slice(0, MAX_EXPRESSIONS)

  if (exprIds.length === 0) return 0

  // 6. Fetch expression metadata
  const { data: exprRaw } = await sb
    .from('kp_expressions')
    .select('id, korean, description, examples')
    .in('id', exprIds)

  const exprMap = new Map<number, ExpressionRow>()
  for (const e of (exprRaw ?? []) as ExpressionRow[]) {
    exprMap.set(e.id, e)
  }

  // 7. Sentence pool = all episode text_ko sentences (for wrong options in translation)
  const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()
  const allKoSentences: string[] = dlgList
    .filter(d => d.text_ko)
    .map(d => normalize(d.text_ko))

  // 8. Matched_text pool for fill_blank wrong options
  const allMatchedTexts = [...new Set(mappings.map(m => m.matched_text))]

  // 9. Generate questions per expression
  const allRows: ChallengeRow[] = []
  let orderCounter = 1

  for (const exprId of exprIds) {
    const expr = exprMap.get(exprId)
    if (!expr) continue

    const exprMappings = byExpr.get(exprId) ?? []
    const firstDlg = dlgById.get(exprMappings[0].dialogue_id)
    if (!firstDlg) continue

    const secondDlg = exprMappings[1] ? (dlgById.get(exprMappings[1].dialogue_id) ?? null) : null
    const matchedText = exprMappings[0].matched_text

    // Sentence pool = all episode sentences EXCLUDING this expression's dialogues
    const exprDlgKo = new Set(exprMappings
      .map(m => dlgById.get(m.dialogue_id)?.text_ko)
      .filter(Boolean)
      .map(s => normalize(s!)))
    const sentencePool = allKoSentences.filter(s => !exprDlgKo.has(s))

    // Matched_text pool = other expressions' matched_text
    const matchedTextPool = allMatchedTexts.filter(t => t !== matchedText)

    const questions = buildQuestions(
      ep.id, expr, firstDlg, matchedText,
      secondDlg, sentencePool, matchedTextPool, orderCounter
    )

    allRows.push(...questions)
    orderCounter += questions.length

    if (questions.length > 0) {
      console.log(`    EP${ep.episode_num} / "${expr.korean}" → ${questions.length}q`)
    }
  }

  if (allRows.length === 0) return 0

  const { error } = await sb.from('kp_challenges').insert(allRows)
  if (error) throw new Error(`Insert EP${ep.episode_num}: ${error.message}`)
  return allRows.length
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Rule-based challenge generation (no API) ===\n')

  // Clear existing challenges
  const { count: existing } = await sb
    .from('kp_challenges')
    .select('id', { count: 'exact', head: true })

  if ((existing ?? 0) > 0) {
    console.log(`Clearing ${existing} existing challenges...`)
    const { error } = await sb.from('kp_challenges').delete().gte('id', 1)
    if (error) { console.error('Clear failed:', error.message); process.exit(1) }
    console.log('✓ Cleared\n')
  }

  // Get all episodes
  const { data: episodes } = await sb
    .from('kp_episodes')
    .select('id, episode_num, title')
    .order('episode_num')

  if (!episodes || episodes.length === 0) {
    console.log('No episodes found'); return
  }

  const epList = episodes as EpisodeRow[]
  console.log(`Processing ${epList.length} episodes...\n`)

  let totalInserted = 0
  let totalSkipped = 0

  for (const ep of epList) {
    try {
      const n = await processEpisode(ep)
      if (n > 0) {
        console.log(`  EP${ep.episode_num} ✓ ${n} challenges`)
        totalInserted += n
      } else {
        totalSkipped++
      }
    } catch (err) {
      console.error(`  EP${ep.episode_num} ✗`, (err as Error).message)
    }
  }

  // Final count
  const { count: finalCount } = await sb
    .from('kp_challenges')
    .select('id', { count: 'exact', head: true })
    .not('challenge_type', 'is', null)

  console.log(`\n=== Done ===`)
  console.log(`Inserted: ${totalInserted} challenges`)
  console.log(`Skipped:  ${totalSkipped} episodes (no focus data)`)
  console.log(`DB total: ${finalCount} challenges`)

  // Sample
  const { data: sample } = await sb
    .from('kp_challenges')
    .select('episode_id, challenge_type, question, options, answer, word_pieces')
    .order('id')
    .limit(6)

  if (sample && sample.length > 0) {
    console.log('\n--- Sample ---')
    for (const r of sample) {
      const q = r as { episode_id: number; challenge_type: string; question: { prompt: string }; options: string[] | null; answer: string; word_pieces: string[] | null }
      console.log(`[${q.challenge_type}] ${q.question.prompt}`)
      if (q.options) console.log(`  opts: ${q.options.join(' | ')}`)
      console.log(`  ans:  ${q.answer}`)
      if (q.word_pieces) console.log(`  pcs:  ${q.word_pieces.join(' ')}`)
    }
  }
}

main().catch(console.error)
