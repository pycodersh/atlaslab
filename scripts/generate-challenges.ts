/**
 * STEP 3: 챌린지 1500개 생성
 * kp_dialogue_expressions(role='focus') 기준으로
 * 에피소드당 focus 표현 3개 × 5문제 = 15개 (translation 2 + fill_blank 2 + word_order 1)
 *
 * 실행 전 setup-challenges.ts로 TRUNCATE 완료 필요
 * 실행: npx ts-node --project tsconfig.scripts.json scripts/generate-challenges.ts
 */
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)
const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-haiku-4-5-20251001'
const EXPRESSIONS_PER_EPISODE = 3
const CONCURRENCY = 4

// ─── Types ───────────────────────────────────────────────────────────────────

interface EpisodeRow { id: number; episode_num: number; title: string }
interface ExpressionRow { id: number; korean: string; description: string | null; examples: Array<{ ko: string; en: string }> | null }
interface FocusMapping { dialogue_id: number; expression_id: number; matched_text: string }
interface BubbleRow { dialogue_id: number | null; korean: string; expression_id: number | null }

interface GeneratedQuestion {
  type: 'translation' | 'fill_blank' | 'word_order'
  prompt: string
  options?: string[]
  answer: string
  pieces?: string[]
}

// ─── Claude generation ───────────────────────────────────────────────────────

const SYSTEM = `You are a Korean language learning challenge generator for beginner English-speaking learners.
Given one Korean expression and its usage context, generate exactly 5 practice questions.
Return ONLY valid JSON — no markdown, no explanation.`

async function generateQuestions(
  expression: ExpressionRow,
  dialogueSentences: string[],
  distractorKorean: string[]
): Promise<GeneratedQuestion[]> {
  const examples = (expression.examples ?? []).slice(0, 3).map(e => `"${e.ko}" (${e.en})`).join('\n')
  const sentences = dialogueSentences.slice(0, 3).map(s => `"${s}"`).join('\n')
  const distractors = distractorKorean.slice(0, 5).join(', ')

  const userMsg = `Expression: ${expression.korean}
Description: ${expression.description ?? '(none)'}
Example sentences from the dictionary:
${examples}
Sentences from the story that use this expression:
${sentences}
Other Korean expressions in this episode (use as wrong MC options):
${distractors}

Generate 5 questions:
- 2 TRANSLATION questions: English prompt → 4 Korean choices (1 correct, 3 wrong)
  Use story sentences as the correct answer. Wrong options should be plausible Korean sentences from the episode.
- 2 FILL_BLANK questions: Take a story sentence, replace the CORE WORD of the expression with "___",
  then provide 4 options for the blank (1 correct word/phrase, 3 plausible wrong words).
- 1 WORD_ORDER question: English prompt + pieces array (correct words split naturally + 1 wrong word chip as distractor),
  answer as space-separated correct Korean words.

Return ONLY this JSON (no markdown):
{
  "questions": [
    {"type": "translation", "prompt": "...", "options": ["correct", "wrong1", "wrong2", "wrong3"], "answer": "correct"},
    {"type": "translation", "prompt": "...", "options": ["wrong1", "correct", "wrong2", "wrong3"], "answer": "correct"},
    {"type": "fill_blank", "prompt": "Korean with ___", "options": ["correct", "wrong1", "wrong2", "wrong3"], "answer": "correct"},
    {"type": "fill_blank", "prompt": "Korean with ___", "options": ["wrong1", "wrong2", "correct", "wrong3"], "answer": "correct"},
    {"type": "word_order", "prompt": "English meaning", "pieces": ["word1", "word2", "word3", "distractor"], "answer": "word1 word2 word3"}
  ]
}`

  const res = await ai.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM,
    messages: [{ role: 'user', content: userMsg }],
  })

  const text = res.content[0].type === 'text' ? res.content[0].text.trim() : ''
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const parsed = JSON.parse(cleaned) as { questions: GeneratedQuestion[] }
  if (!Array.isArray(parsed.questions)) throw new Error('Unexpected response format')
  return parsed.questions.slice(0, 5)
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function insertChallenges(
  episodeDbId: number,
  questions: GeneratedQuestion[],
  startOrder: number
): Promise<number> {
  const rows = questions.map((q, i) => ({
    episode_id: episodeDbId,
    order_num: startOrder + i,
    challenge_type: q.type,
    question: { prompt: q.prompt },
    options: q.type !== 'word_order' ? (q.options ?? null) : null,
    answer: q.answer,
    word_pieces: q.type === 'word_order' ? (q.pieces ?? null) : null,
  }))

  const { error } = await sb.from('kp_challenges').insert(rows)
  if (error) throw new Error(`Insert failed: ${error.message}`)
  return rows.length
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function processEpisode(ep: EpisodeRow): Promise<{ inserted: number; failed: number }> {
  let inserted = 0
  let failed = 0

  // 1. Get all bubbles for the episode
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('dialogue_id, korean, expression_id')
    .eq('episode_id', ep.id)
  const bubbleList = (bubbles ?? []) as BubbleRow[]

  // 2. Get dialogue IDs with expression links
  const dialogueIds = [...new Set(bubbleList.filter(b => b.dialogue_id != null).map(b => b.dialogue_id as number))]
  if (dialogueIds.length === 0) return { inserted: 0, failed: 0 }

  // 3. Get focus mappings for this episode's dialogues
  const { data: focusMappings } = await sb
    .from('kp_dialogue_expressions')
    .select('dialogue_id, expression_id, matched_text')
    .in('dialogue_id', dialogueIds)
    .eq('role', 'focus')
  const mappings = (focusMappings ?? []) as FocusMapping[]
  if (mappings.length === 0) return { inserted: 0, failed: 0 }

  // 4. Group dialogue sentences by expression
  const dialogueSentencesByDialogueId = new Map<number, string>()
  for (const b of bubbleList) {
    if (b.dialogue_id != null && b.korean) {
      dialogueSentencesByDialogueId.set(b.dialogue_id, b.korean)
    }
  }

  const sentencesByExpression = new Map<number, string[]>()
  for (const m of mappings) {
    const sentence = dialogueSentencesByDialogueId.get(m.dialogue_id)
    if (!sentence) continue
    if (!sentencesByExpression.has(m.expression_id)) sentencesByExpression.set(m.expression_id, [])
    sentencesByExpression.get(m.expression_id)!.push(sentence)
  }

  // 5. Pick top EXPRESSIONS_PER_EPISODE expressions (by number of dialogue occurrences)
  const expressionIds = [...sentencesByExpression.keys()]
  const topExpressionIds = expressionIds
    .sort((a, b) => (sentencesByExpression.get(b)?.length ?? 0) - (sentencesByExpression.get(a)?.length ?? 0))
    .slice(0, EXPRESSIONS_PER_EPISODE)

  if (topExpressionIds.length === 0) return { inserted: 0, failed: 0 }

  // 6. Fetch expression data
  const { data: exprData } = await sb
    .from('kp_expressions')
    .select('id, korean, description, examples')
    .in('id', topExpressionIds)
  const expressions = (exprData ?? []) as ExpressionRow[]

  // 7. Build distractor list: Korean forms of other focus expressions in this episode
  const distractorIds = expressionIds.filter(id => !topExpressionIds.includes(id)).slice(0, 6)
  let distractorKorean: string[] = []
  if (distractorIds.length > 0) {
    const { data: distData } = await sb
      .from('kp_expressions')
      .select('korean')
      .in('id', distractorIds)
    distractorKorean = (distData ?? []).map((r: { korean: string }) => r.korean)
  }
  // Also add some story sentences as distractors
  const storySentenceSamples = bubbleList
    .filter(b => b.expression_id == null && b.korean)
    .slice(0, 5)
    .map(b => b.korean)
  distractorKorean = [...distractorKorean, ...storySentenceSamples]

  // 8. Generate challenges per expression (sequentially to avoid rate limits)
  let orderNum = 1
  for (const expr of expressions) {
    const sentences = sentencesByExpression.get(expr.id) ?? []
    try {
      console.log(`  EP${ep.episode_num} / expression "${expr.korean}" (${sentences.length} sentences)`)
      const questions = await generateQuestions(expr, sentences, distractorKorean)
      const count = await insertChallenges(ep.id, questions, orderNum)
      inserted += count
      orderNum += count
      console.log(`    ✓ ${count} questions inserted`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`    ✗ Failed for "${expr.korean}": ${msg}`)
      failed++
    }
    // Brief pause to respect rate limits
    await new Promise(r => setTimeout(r, 500))
  }

  return { inserted, failed }
}

async function main() {
  // Get all episodes that have bubbles with expression links
  const { data: episodes } = await sb
    .from('kp_episodes')
    .select('id, episode_num, title')
    .order('episode_num')
  if (!episodes || episodes.length === 0) {
    console.log('No episodes found')
    return
  }

  console.log(`Processing ${episodes.length} episodes with concurrency ${CONCURRENCY}`)
  console.log('Model:', MODEL)
  console.log('Target: 3 expressions × 5 questions = 15 per episode\n')

  let totalInserted = 0
  let totalFailed = 0

  // Process episodes in batches of CONCURRENCY
  const epList = episodes as EpisodeRow[]
  for (let i = 0; i < epList.length; i += CONCURRENCY) {
    const batch = epList.slice(i, i + CONCURRENCY)
    console.log(`\nBatch ${Math.floor(i / CONCURRENCY) + 1}: EP${batch.map(e => e.episode_num).join(', EP')}`)

    const results = await Promise.allSettled(batch.map(ep => processEpisode(ep)))
    for (const [j, result] of results.entries()) {
      const ep = batch[j]
      if (result.status === 'fulfilled') {
        totalInserted += result.value.inserted
        totalFailed += result.value.failed
      } else {
        console.error(`  EP${ep.episode_num} batch error:`, result.reason)
        totalFailed++
      }
    }
  }

  console.log('\n=== Done ===')
  console.log(`Inserted: ${totalInserted} challenges`)
  console.log(`Failed:   ${totalFailed} expressions`)

  // Verify
  const { count } = await sb
    .from('kp_challenges')
    .select('id', { count: 'exact', head: true })
    .not('challenge_type', 'is', null)
  console.log(`DB total: ${count} challenges with challenge_type`)
}

main().catch(console.error)
