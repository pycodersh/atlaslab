import OpenAI from 'openai'
import type { Plan } from '@/lib/subscription/storage'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FREE_MAX  = 300
const PREM_MAX  = 500

function isEnglish(text: string): boolean {
  if (text.trim().length === 0) return false
  const nonAscii = (text.match(/[^\x00-\x7F]/g) ?? []).length
  return nonAscii / text.length < 0.4
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ── Pass 1: full review ──────────────────────────────────────────────────────
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
25–30 words, 1 sentence. Warm, specific. Quote or reference something the student actually wrote.
No generic praise.

━━━ SUGGESTED VERSION ━━━
Full rewrite applying EVERY correction. Native-sounding, student's voice preserved.
Do NOT add new ideas or change meaning.

━━━ ONE-LINE COACHING ADVICE ━━━
Under 12 words. Coach tone, not textbook.
Examples: "Consistency builds confidence." / "Small improvements become fluency."

━━━ STYLE DETECTION ━━━
Diary / Essay / Letter / Report / Blog Post / SNS Post / Story / Personal Statement / TOEFL / Business Email

━━━ RESPONSE FORMAT — valid JSON only ━━━
{
  "_scan": "All your Pass 1, Pass 2, Pass 3 thinking goes here.",
  "detectedStyle": "Diary",
  "annotations": [
    { "type": "grammar",    "subType": "tense",       "targetText": "go",        "replacement": "went",           "note": "과거 시제.", "confidence": 0.99 },
    { "type": "grammar",    "subType": "agreement",   "targetText": "were",      "replacement": "was",            "note": "주어-동사.", "confidence": 0.99 },
    { "type": "grammar",    "subType": "article",     "targetText": "a english", "replacement": "an English",     "note": "'an' 사용.", "confidence": 0.99 },
    { "type": "grammar",    "subType": "plural",      "targetText": "two cup",   "replacement": "two cups",       "note": "복수형.", "confidence": 0.97 },
    { "type": "expression", "targetText": "very tired","replacement": "exhausted","note": "자연스러운 표현.", "confidence": 0.85 },
    { "type": "strength",   "targetText": "phrase",    "note": "⭐ Vivid.", "confidence": 1.0 },
    { "type": "typical",    "targetText": "i",         "replacement": "I",        "note": "Typ.", "confidence": 0.99 }
  ],
  "editorComment": "25–30단어 코멘트.",
  "nextChallenge": ["목표 1.", "목표 2."],
  "suggestedVersion": "전체 교정 에세이.",
  "oneLineAdvice": "코치 스타일 조언."
}`
}

// ── Pass 2: verification ─────────────────────────────────────────────────────
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

  const verifyPrompt = `ORIGINAL ESSAY:
${essayBody}

CORRECTED VERSION (what the reviewer fixed):
${suggestedVersion}

Find grammar errors in the ORIGINAL ESSAY that were NOT fixed in the corrected version${langNote}.
These are errors the reviewer missed. Return only high-confidence errors (≥ 0.85).`

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: VERIFY_SYSTEM },
        { role: 'user', content: verifyPrompt },
      ],
    })
    const raw = res.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(raw)
    if (!parsed.hasErrors || !Array.isArray(parsed.missedErrors)) return []
    return parsed.missedErrors
  } catch {
    return []
  }
}

// ── Annotation normaliser ────────────────────────────────────────────────────
type RawAnnotation = {
  targetText?: string
  fragment?: string
  type: string
  subType?: string
  replacement?: string
  note: string
  confidence?: number
}

function normaliseAnnotations(
  annotations: RawAnnotation[],
  essayBody: string,
): object[] {
  return annotations
    .map(a => ({
      type: a.type,
      ...(a.subType ? { subType: a.subType } : {}),
      fragment: a.targetText ?? a.fragment ?? '',
      replacement: a.replacement,
      note: a.note,
      confidence: typeof a.confidence === 'number' ? Math.round(a.confidence * 100) / 100 : undefined,
    }))
    .filter((a) =>
      typeof a.fragment === 'string' &&
      a.fragment.length > 0 &&
      essayBody.includes(a.fragment),
    )
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      essayId,
      essayBody,
      essayTitle,
      language = 'ko',
      plan = 'free',
    } = body as {
      essayId: string
      essayBody: string
      essayTitle: string
      language: string
      plan: Plan
    }

    // ── Input validation ──────────────────────────────────────────────────────
    if (!essayBody || typeof essayBody !== 'string') {
      return Response.json({ error: 'invalid_input' }, { status: 400 })
    }
    if (!isEnglish(essayBody)) {
      return Response.json({ error: 'not_english' }, { status: 422 })
    }
    const wc = wordCount(essayBody)
    if (wc < 30) {
      return Response.json({ error: 'too_short' }, { status: 422 })
    }
    const maxWords = plan === 'premium' ? PREM_MAX : FREE_MAX
    if (wc > maxWords) {
      return Response.json({ error: 'too_long' }, { status: 422 })
    }

    // ── Pass 1: main review ───────────────────────────────────────────────────
    const userPrompt = `Essay Title: "${essayTitle ?? 'Untitled'}"

Essay:
${essayBody}

Review this essay. Find EVERY grammar error. Return the JSON as specified.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 5000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildMainPrompt(language) },
        { role: 'user', content: userPrompt },
      ],
    })

    const rawText = completion.choices[0]?.message?.content ?? ''
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[essays/review] Non-JSON response:', rawText.slice(0, 200))
      return Response.json({ error: 'parse_error' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Normalise pass-1 annotations
    let annotations: object[] = []
    if (Array.isArray(parsed.annotations)) {
      annotations = normaliseAnnotations(parsed.annotations as RawAnnotation[], essayBody)
    }

    // ── Pass 2: verification ──────────────────────────────────────────────────
    const suggestedVersion: string = typeof parsed.suggestedVersion === 'string' ? parsed.suggestedVersion : ''
    if (suggestedVersion) {
      const missed = await verifyPass(essayBody, suggestedVersion, language)
      if (missed.length > 0) {
        const extraAnnotations = normaliseAnnotations(
          missed.map(m => ({ ...m, type: 'grammar' })),
          essayBody,
        )
        // Deduplicate: skip if fragment overlaps with any existing annotation
        const existingFrags = (annotations as Array<{ fragment?: string }>)
          .map(a => a.fragment?.toLowerCase() ?? '')
          .filter(Boolean)
        for (const extra of extraAnnotations) {
          const frag = (extra as { fragment?: string }).fragment?.toLowerCase() ?? ''
          if (!frag) continue
          // Skip if any existing fragment contains this one, or this one contains an existing
          const overlap = existingFrags.some(e => e.includes(frag) || frag.includes(e))
          if (!overlap) {
            annotations.push(extra)
            existingFrags.push(frag)
          }
        }
        console.log(`[essays/review] Pass 2 added ${extraAnnotations.length} missed error(s)`)
      } else {
        console.log('[essays/review] Pass 2: no additional errors found')
      }
    }

    // ── Build final response ──────────────────────────────────────────────────
    const final = {
      detectedStyle: parsed.detectedStyle,
      annotations,
      editorComment: parsed.editorComment,
      nextChallenge: Array.isArray(parsed.nextChallenge)
        ? parsed.nextChallenge
        : typeof parsed.nextChallenge === 'string'
          ? [parsed.nextChallenge]
          : [],
      ...(suggestedVersion ? { suggestedVersion } : {}),
      oneLineAdvice: parsed.oneLineAdvice,
      createdAt: new Date().toISOString(),
    }

    return Response.json({ review: final, essayId })

  } catch (err) {
    console.error('[essays/review] Unexpected error:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}
