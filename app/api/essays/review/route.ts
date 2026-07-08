import OpenAI from 'openai'
import type { Plan } from '@/lib/subscription/storage'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getUserWithPlan,
  checkRateLimit,
  incrementDailyUsage,
  logApiCall,
} from '@/lib/ai/rateLimit'
import { hashContent } from '@/lib/ai/contentHash'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const MODEL  = 'gpt-4o-mini'

const FREE_MAX = 300
const PREM_MAX = 500
const ENDPOINT = 'essays/review'

// ── In-flight deduplication ───────────────────────────────────────────────────
// Prevents rapid double-clicks from sending two OpenAI calls for the same user+essay.
const inFlight = new Map<string, number>() // key → start timestamp

function acquireLock(key: string): boolean {
  const now  = Date.now()
  const prev = inFlight.get(key)
  if (prev && now - prev < 30_000) return false // already in-flight (30 s window)
  inFlight.set(key, now)
  return true
}

function releaseLock(key: string) {
  inFlight.delete(key)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isEnglish(text: string): boolean {
  if (text.trim().length === 0) return false
  const nonAscii = (text.match(/[^\x00-\x7F]/g) ?? []).length
  return nonAscii / text.length < 0.4
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ── Pass 1: full review ───────────────────────────────────────────────────────
function buildMainPrompt(language: string): string {
  const langInstructions: Record<string, string> = {
    ko:      '⚠️ 언어 규칙: note, editorComment, nextChallenge 항목을 반드시 한국어로 작성하세요. 영어로 쓰지 마세요.',
    ja:      '⚠️ 言語ルール: note、editorComment、nextChallengeの各項目を必ず日本語で記述してください。',
    es:      '⚠️ Regla de idioma: Escribe note, editorComment y cada ítem de nextChallenge en español.',
    fr:      "⚠️ Règle de langue: Rédigez note, editorComment et chaque nextChallenge en français.",
    de:      '⚠️ Sprachregel: Schreiben Sie note, editorComment und jeden nextChallenge-Punkt auf Deutsch.',
    'zh-cn': '⚠️ 语言规则：note、editorComment、nextChallenge各项目必须用简体中文填写。',
    'zh-tw': '⚠️ 語言規則：note、editorComment、nextChallenge各項目必須用繁體中文填寫。',
    en:      '⚠️ Language rule: Write note, editorComment, and each nextChallenge item in English.',
  }
  const langInstruction = langInstructions[language] ?? langInstructions.en

  return `You are a rigorous English editor. Your job is to find EVERY grammar error — none skipped.

${langInstruction}

━━━ WORKING METHOD — THREE PASSES ━━━

PASS 1 — SENTENCE SCAN (write in "_scan"):
  Go through every sentence one by one. For each sentence check ALL of:
  □ Tense (wrong tense, tense inconsistency with narrative)
  □ Subject-Verb Agreement (including "there was/were")
  □ Verb Form (infinitive / gerund / past participle)
  □ Articles (a / an / the — missing or wrong)
  □ Prepositions
  □ Plural / Singular
  □ Pronouns
  □ Capitalization (sentence starts, proper nouns, "I")
  □ Spelling
  □ Vocabulary (unnatural word choice)
  □ Word Order
  □ Natural Expression
  □ Punctuation
  Do NOT stop early. Check every sentence. Log every error found.

PASS 2 — SELF-REVIEW (continue in "_scan"):
  Re-read the essay. Specifically look for:
  • "there was many/few..." → agreement error
  • Multiple verb errors in the same sentence — list each one
  • Articles before vowels: "a apple" → "an apple"
  • Sentence-start capitals missed in pass 1
  • "didn't + past participle" → "hadn't + past participle"
  • Adverb vs. adjective ("more confident" → "more confidently")
  Add any newly found errors.

PASS 3 — VERIFY & OUTPUT (write verdict in "_scan"):
  Check: does the suggestedVersion fix EVERY error listed in passes 1 and 2?
  If any error was found but NOT fixed in suggestedVersion, fix it now.
  Then output the JSON.

━━━ TARGETTEXT RULE ━━━
Always the SMALLEST unit: one word whenever possible.
  ✗ "the weather were bad"  →  ✓ targetText: "were"
  ✗ "didn't met him"        →  ✓ targetText: "met"
Never annotate an entire sentence.

━━━ ANNOTATION TYPES ━━━

"grammar"  — ALL grammatical errors. NO LIMIT on count. Return every one found.
  Always include "replacement" and "confidence" (0.0–1.0).
  confidence guide:
    0.95–1.0  = certain error (tense, agreement, article before vowel)
    0.80–0.94 = likely error (preposition, vocabulary)
    0.60–0.79 = possible error or style preference
  note = 2–4 words in the user's language.

  Required "subType" — choose exactly one:
    "tense"  "agreement"  "verbForm"  "article"  "preposition"
    "vocabulary"  "missing"  "spelling"  "punctuation"
    "capitalization"  "wordOrder"  "pronoun"  "plural"

  For "missing": targetText = word BEFORE the gap; replacement = missing word only.

"expression"  — Grammatically OK but unnatural phrasing. Max 5.
  Always include "replacement" and "confidence". note = 2–4 words.

"strength"  — The single best moment. Exactly 1. No "replacement".
  note = "⭐ Nice." / "⭐ Natural." / "⭐ Vivid." / "⭐ Strong."
  confidence = 1.0.

"typical"  — Mechanical error repeating throughout. Mark FIRST occurrence only.
  note = exactly "Typ."  Max 2.
  Use ONLY for: lowercase "i", missing sentence-start capital, lowercase proper noun,
  missing apostrophe in contraction.
  Do NOT use for tense/article/agreement — those get "grammar".

━━━ EDITOR COMMENT ━━━
Return three fields (all in the user's language):
- commentStrengths: exactly 2 bullet strings. Specific things done well.
- commentImprovements: exactly 2 bullet strings. Specific, actionable areas to improve.
- commentOverall: 1 warm sentence (≤20 words). Reference something the student actually wrote.
- editorComment: same string as commentOverall (for compatibility).
Keep each bullet under 15 words. No generic praise.

━━━ SUGGESTED VERSION ━━━
Full rewrite applying EVERY correction. Native-sounding, student's voice preserved.
Do NOT add new ideas or change meaning.

━━━ ONE-LINE COACHING ADVICE ━━━
Under 12 words. Coach tone, not textbook.

━━━ STYLE DETECTION ━━━
Diary / Essay / Letter / Report / Blog Post / SNS Post / Story / Personal Statement / TOEFL / Business Email

━━━ SCORE ━━━
score: integer 0-100. Be honest — average learner essays score 55-75.

━━━ VOCABULARY ━━━
5-10 useful words or phrases from the essay.
Each: { "word": "...", "meaning": "...(in user's language)", "example": "Short example sentence." }

━━━ USEFUL CHUNKS ━━━
5-8 natural English expressions or patterns relevant to this essay topic.
Each: { "expression": "...", "usage": "How/when to use it (in user's language)." }

━━━ GRAMMAR TIPS ━━━
3-5 key grammar points the student got wrong or should know.
Each: { "point": "Short label", "explanation": "...(in user's language)", "example": "Wrong → Correct." }

━━━ RESPONSE FORMAT — valid JSON only ━━━
{
  "_scan": "All your Pass 1, Pass 2, Pass 3 thinking goes here.",
  "score": 68,
  "detectedStyle": "Diary",
  "annotations": [
    { "type": "grammar", "subType": "tense", "targetText": "go", "replacement": "went", "note": "과거 시제.", "confidence": 0.99 },
    { "type": "expression", "targetText": "very tired", "replacement": "exhausted", "note": "자연스러운 표현.", "confidence": 0.85 },
    { "type": "strength", "targetText": "phrase", "note": "⭐ Vivid.", "confidence": 1.0 },
    { "type": "typical", "targetText": "i", "replacement": "I", "note": "Typ.", "confidence": 0.99 }
  ],
  "commentStrengths": ["구체적인 경험을 잘 묘사했어요.", "문장 흐름이 자연스럽습니다."],
  "commentImprovements": ["동사 시제를 일관되게 유지해보세요.", "관사 사용을 더 정확하게 써보세요."],
  "commentOverall": "전반적으로 자신만의 목소리가 잘 살아있는 좋은 글입니다.",
  "editorComment": "전반적으로 자신만의 목소리가 잘 살아있는 좋은 글입니다.",
  "nextChallenge": ["목표 1.", "목표 2."],
  "suggestedVersion": "전체 교정 에세이.",
  "oneLineAdvice": "코치 스타일 조언.",
  "vocabulary": [{ "word": "consistency", "meaning": "일관성", "example": "Consistency is key." }],
  "usefulChunks": [{ "expression": "catch up with someone", "usage": "오랜 친구를 다시 만날 때 씁니다." }],
  "grammarTips": [{ "point": "Subject-Verb Agreement", "explanation": "주어와 동사의 수를 맞춰야 합니다.", "example": "There was many people → There were many people." }]
}`
}

// ── Pass 2: verification ──────────────────────────────────────────────────────
const VERIFY_SYSTEM = `You are a grammar checker. Your only job: look for grammar errors that were missed.
Return JSON: { "hasErrors": true/false, "missedErrors": [...] }
missedErrors format: { "targetText": "exact phrase from original essay", "replacement": "correction", "subType": "tense|agreement|verbForm|article|preposition|vocabulary|missing|spelling|punctuation|capitalization|wordOrder|pronoun|plural", "note": "short note", "confidence": 0.0-1.0 }
Only include CLEAR, HIGH-CONFIDENCE errors (confidence >= 0.85).
targetText must be an exact substring from the ORIGINAL ESSAY, not the corrected version.`

async function verifyPass(
  essayBody: string,
  suggestedVersion: string,
  language: string,
): Promise<Array<{ targetText: string; replacement: string; subType: string; note: string; confidence: number }>> {
  const langNote = language === 'ko' ? ' (note field in Korean)' :
                   language === 'ja' ? ' (note field in Japanese)' : ''
  try {
    const res = await openai.chat.completions.create({
      model:           MODEL,
      max_tokens:      1200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: VERIFY_SYSTEM },
        { role: 'user',   content: `ORIGINAL ESSAY:\n${essayBody}\n\nCORRECTED VERSION:\n${suggestedVersion}\n\nFind grammar errors in the ORIGINAL ESSAY not fixed in the corrected version${langNote}. Return only high-confidence errors (≥ 0.85).` },
      ],
    })
    const raw    = res.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(raw)
    if (!parsed.hasErrors || !Array.isArray(parsed.missedErrors)) return []
    return parsed.missedErrors
  } catch {
    return []
  }
}

// ── Annotation normaliser ─────────────────────────────────────────────────────
type RawAnnotation = {
  targetText?: string; fragment?: string; type: string; subType?: string
  replacement?: string; note: string; confidence?: number
}

function normaliseAnnotations(annotations: RawAnnotation[], essayBody: string): object[] {
  return annotations
    .map(a => ({
      type:        a.type,
      ...(a.subType ? { subType: a.subType } : {}),
      fragment:    a.targetText ?? a.fragment ?? '',
      replacement: a.replacement,
      note:        a.note,
      confidence:  typeof a.confidence === 'number' ? Math.round(a.confidence * 100) / 100 : undefined,
    }))
    .filter(a => typeof a.fragment === 'string' && a.fragment.length > 0 && essayBody.includes(a.fragment))
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const admin   = createAdminClient()
  const session = await createClient()
  const DEV     = process.env.NODE_ENV === 'development'

  try {
    const body = await request.json()
    const {
      essayId,
      essayBody,
      essayTitle,
      language = 'ko',
      // plan is accepted from client but NOT trusted — read from DB below
    } = body as { essayId: string; essayBody: string; essayTitle: string; language: string; plan?: Plan }

    // ── 1. Auth ───────────────────────────────────────────────────────────────
    const authedUser = await getUserWithPlan(session)
    if (!authedUser) {
      void logApiCall(admin, { userId: null, endpoint: ENDPOINT, model: MODEL, status: 'rejected', reason: 'unauthenticated' })
      return Response.json({ error: 'unauthenticated' }, { status: 401 })
    }
    const { id: userId, plan } = authedUser

    // ── 2. Input validation ───────────────────────────────────────────────────
    if (!essayBody || typeof essayBody !== 'string') {
      return Response.json({ error: 'invalid_input' }, { status: 400 })
    }
    if (!isEnglish(essayBody)) {
      void logApiCall(admin, { userId, endpoint: ENDPOINT, model: MODEL, status: 'rejected', reason: 'not_english' })
      return Response.json({ error: 'not_english' }, { status: 422 })
    }
    const wc       = wordCount(essayBody)
    const maxWords = plan === 'premium' ? PREM_MAX : FREE_MAX
    if (wc < 30) {
      return Response.json({ error: 'too_short' }, { status: 422 })
    }
    if (wc > maxWords) {
      void logApiCall(admin, { userId, endpoint: ENDPOINT, model: MODEL, status: 'rejected', reason: 'word_limit' })
      return Response.json({ error: 'too_long' }, { status: 422 })
    }

    // ── 3. Server-side daily rate limit ───────────────────────────────────────
    const rateCheck = await checkRateLimit(admin, userId, ENDPOINT, plan)
    if (!rateCheck.allowed) {
      void logApiCall(admin, { userId, endpoint: ENDPOINT, model: MODEL, status: 'rejected', reason: 'daily_limit' })
      return Response.json(
        { error: 'daily_limit', used: rateCheck.used, limit: rateCheck.limit },
        { status: 429 },
      )
    }

    // ── 4. In-flight dedup (same user + essay within 30 s) ───────────────────
    const lockKey = `${userId}:${essayId}`
    if (!acquireLock(lockKey)) {
      return Response.json({ error: 'duplicate_request' }, { status: 409 })
    }

    try {
      // ── 5. Content hash cache ───────────────────────────────────────────────
      const contentHash = await hashContent(essayBody)
      const { data: cached } = await admin
        .from('essay_review_cache')
        .select('review_json, hit_count')
        .eq('content_hash', contentHash)
        .single()

      if (cached?.review_json) {
        void admin.from('essay_review_cache')
          .update({ hit_count: (cached.hit_count ?? 0) + 1 })
          .eq('content_hash', contentHash)
        void logApiCall(admin, { userId, endpoint: ENDPOINT, model: MODEL, status: 'cached', reason: 'cache_hit' })
        return Response.json({ review: cached.review_json, essayId, cached: true })
      }

      // ── 6. OpenAI Pass 1 ────────────────────────────────────────────────────
      const userPrompt = `Essay Title: "${essayTitle ?? 'Untitled'}"\n\nEssay:\n${essayBody}\n\nReview this essay. Find EVERY grammar error. Return the JSON as specified.`

      let completion: Awaited<ReturnType<typeof openai.chat.completions.create>>
      try {
        completion = await openai.chat.completions.create({
          model:           MODEL,
          max_tokens:      5000,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: buildMainPrompt(language) },
            { role: 'user',   content: userPrompt },
          ],
        })
      } catch (apiErr: unknown) {
        const msg    = apiErr instanceof Error ? apiErr.message : String(apiErr)
        const status = (apiErr as { status?: number }).status
        console.error(`[essays/review] OpenAI error — status=${status} message=${msg}`)
        void logApiCall(admin, { userId, endpoint: ENDPOINT, model: MODEL, status: 'failed', reason: 'openai_error' })
        return Response.json(
          { error: 'openai_error', ...(DEV ? { detail: msg, status } : {}) },
          { status: 502 },
        )
      }

      const finishReason = completion.choices[0]?.finish_reason
      const rawText      = completion.choices[0]?.message?.content ?? ''
      const inputTokens  = completion.usage?.prompt_tokens
      const outputTokens = completion.usage?.completion_tokens
      console.log(`[essays/review] Pass1 finish_reason=${finishReason} tokens=${completion.usage?.total_tokens} rawLen=${rawText.length}`)
      if (DEV) console.log('[essays/review] Pass1 raw:', rawText.slice(0, 500))

      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('[essays/review] Non-JSON response:', rawText.slice(0, 1000))
        void logApiCall(admin, { userId, endpoint: ENDPOINT, model: MODEL, status: 'failed', reason: 'parse_error', inputTokens, outputTokens })
        return Response.json(
          { error: 'parse_error', ...(DEV ? { rawResponse: rawText.slice(0, 1000) } : {}) },
          { status: 500 },
        )
      }

      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch (parseErr) {
        console.error('[essays/review] JSON.parse failed:', parseErr)
        void logApiCall(admin, { userId, endpoint: ENDPOINT, model: MODEL, status: 'failed', reason: 'parse_error', inputTokens, outputTokens })
        return Response.json({ error: 'parse_error' }, { status: 500 })
      }

      // Normalise annotations
      let annotations: object[] = []
      if (Array.isArray(parsed.annotations)) {
        annotations = normaliseAnnotations(parsed.annotations as RawAnnotation[], essayBody)
      }

      // ── 7. Pass 2: verification ─────────────────────────────────────────────
      const suggestedVersion: string = typeof parsed.suggestedVersion === 'string' ? parsed.suggestedVersion : ''
      if (suggestedVersion) {
        const missed = await verifyPass(essayBody, suggestedVersion, language)
        if (missed.length > 0) {
          const extra = normaliseAnnotations(missed.map(m => ({ ...m, type: 'grammar' })), essayBody)
          const existingFrags = (annotations as Array<{ fragment?: string }>)
            .map(a => a.fragment?.toLowerCase() ?? '').filter(Boolean)
          for (const e of extra) {
            const frag = (e as { fragment?: string }).fragment?.toLowerCase() ?? ''
            if (!frag) continue
            if (!existingFrags.some(x => x.includes(frag) || frag.includes(x))) {
              annotations.push(e)
              existingFrags.push(frag)
            }
          }
          console.log(`[essays/review] Pass2 added ${extra.length} missed error(s)`)
        } else {
          console.log('[essays/review] Pass2: no additional errors')
        }
      }

      // ── 8. Build final review ───────────────────────────────────────────────
      const review = {
        detectedStyle:       parsed.detectedStyle,
        annotations,
        editorComment:       typeof parsed.commentOverall === 'string' ? parsed.commentOverall : (typeof parsed.editorComment === 'string' ? parsed.editorComment : ''),
        commentStrengths:    Array.isArray(parsed.commentStrengths)    ? parsed.commentStrengths    : undefined,
        commentImprovements: Array.isArray(parsed.commentImprovements) ? parsed.commentImprovements : undefined,
        commentOverall:      typeof parsed.commentOverall === 'string' ? parsed.commentOverall      : undefined,
        nextChallenge:       Array.isArray(parsed.nextChallenge) ? parsed.nextChallenge : typeof parsed.nextChallenge === 'string' ? [parsed.nextChallenge] : [],
        ...(suggestedVersion ? { suggestedVersion } : {}),
        oneLineAdvice:       parsed.oneLineAdvice,
        score:               typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : undefined,
        vocabulary:          Array.isArray(parsed.vocabulary)   ? parsed.vocabulary   : undefined,
        usefulChunks:        Array.isArray(parsed.usefulChunks) ? parsed.usefulChunks : undefined,
        grammarTips:         Array.isArray(parsed.grammarTips)  ? parsed.grammarTips  : undefined,
        createdAt:           new Date().toISOString(),
      }

      // ── 9. Persist results & increment usage ────────────────────────────────
      // Cache the review (best-effort — failure must not break the response)
      void admin.from('essay_review_cache').insert({ content_hash: contentHash, review_json: review }).then(({ error }) => {
        if (error) console.error('[essays/review] cache insert error:', error.message)
      })
      // Only charge usage on successful API response (not on parse errors or failures)
      void incrementDailyUsage(admin, userId, ENDPOINT)
      void logApiCall(admin, { userId, endpoint: ENDPOINT, model: MODEL, status: 'success', inputTokens, outputTokens })

      return Response.json({ review, essayId, cached: false })

    } finally {
      releaseLock(lockKey)
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[essays/review] Unexpected error:', err)
    return Response.json(
      { error: 'server_error', ...(process.env.NODE_ENV === 'development' ? { detail: msg } : {}) },
      { status: 500 },
    )
  }
}
