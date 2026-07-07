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

function buildSystemPrompt(language: string): string {
  const langInstructions: Record<string, string> = {
    ko:      '⚠️ 언어 규칙: 아래의 모든 텍스트 필드를 반드시 한국어로 작성하세요 — note(모든 annotation), editorComment, nextChallenge의 각 항목. 영어로 작성하지 마세요.',
    ja:      '⚠️ 言語ルール: 以下のすべてのテキストフィールドを必ず日本語で記述してください — note（すべてのannotation）、editorComment、nextChallengeの各項目。英語で書かないでください。',
    es:      '⚠️ Regla de idioma: Escribe TODOS los campos de texto en español — note (todas las anotaciones), editorComment, cada ítem de nextChallenge. No uses inglés.',
    fr:      "⚠️ Règle de langue: Rédigez TOUS les champs texte en français — note (toutes les annotations), editorComment, chaque élément de nextChallenge. N'utilisez pas l'anglais.",
    de:      '⚠️ Sprachregel: Schreiben Sie ALLE Textfelder auf Deutsch — note (alle Annotationen), editorComment, jeden nextChallenge-Punkt. Kein Englisch.',
    'zh-cn': '⚠️ 语言规则：以下所有文本字段必须用简体中文填写 — note（所有注释）、editorComment、nextChallenge的每个项目。不要使用英文。',
    'zh-tw': '⚠️ 語言規則：以下所有文字欄位必須用繁體中文填寫 — note（所有注釋）、editorComment、nextChallenge的每個項目。不要使用英文。',
    en:      '⚠️ Language rule: Write ALL text fields in English — note (all annotations), editorComment, each nextChallenge item. Do not use Korean or any other language.',
  }
  const langInstruction = langInstructions[language] ?? langInstructions.en

  return `You are a rigorous English editor. Your job is to find EVERY grammar error in the essay — not just the obvious ones.

${langInstruction}

━━━ HOW TO WORK — THREE PASSES ━━━

PASS 1 — SCAN (write in "_scan"):
  Read the essay sentence by sentence. For EVERY sentence, check ALL of these:
  □ Tense — is the tense correct? consistent with the narrative?
  □ Subject-Verb Agreement — does the verb match the subject?
  □ Verb Form — infinitive / gerund / past participle used correctly?
  □ Articles — is a / an / the correct? missing?
  □ Prepositions — correct preposition used?
  □ Plural/Singular — nouns correctly pluralised or singular?
  □ Pronouns — correct pronoun case and reference?
  □ Capitalization — sentence starts, proper nouns, "I" capitalised?
  □ Spelling — any misspelled words?
  □ Vocabulary — is this the most natural word choice?
  □ Word Order — natural English word order?
  □ Natural Expression — does it sound like a native speaker?
  □ Punctuation — missing or wrong punctuation?

  Do NOT stop after finding 2–3 errors. Check EVERY sentence. List all errors found.

PASS 2 — SELF-REVIEW (write in "_scan", continue):
  Re-read each sentence. Ask: "Did I miss any error above?"
  Especially check for:
  • Subject-verb agreement that was overlooked
  • Tense inconsistency between sentences
  • Articles before vowel sounds (a → an)
  • Repeated capitalization errors (mark only the FIRST as "typical")
  Add any newly found errors to your list.

PASS 3 — OUTPUT:
  Before outputting, verify:
  ✓ Every sentence was checked
  ✓ Multi-error sentences have ALL errors included
  ✓ suggestedVersion fixes EVERY error (grammar + expression + typical)
  ✓ No error in suggestedVersion that is missing from annotations
  Then output the final JSON.

━━━ MINIMUM TARGETTEXT RULE ━━━
Always circle the SMALLEST unit containing the error — one word whenever possible.
  ✗ "the weather were bad"  → do NOT circle "the weather were"
  ✓ "were"  →  "was"
  ✗ "didn't met him"  → do NOT circle "didn't met"
  ✓ "met"  →  "seen"  (note explains "hadn't seen him")
Never annotate an entire sentence.

━━━ ANNOTATION TYPES ━━━

"grammar"  — Grammatical errors with clear learning value.
  Covers: tense, agreement, verbForm, article, preposition, plural/singular,
          pronoun, vocabulary, missing word, spelling, punctuation, capitalization, wordOrder.
  Max 8. Always include "replacement". note = 2–4 words.

  Required "subType" — choose exactly one:
    "tense"          "agreement"      "verbForm"       "article"
    "preposition"    "vocabulary"     "missing"        "spelling"
    "punctuation"    "capitalization" "wordOrder"      "pronoun"
    "plural"

  For "missing": targetText = word directly BEFORE the gap; replacement = the missing word only.

"expression"  — Grammatically correct but unnatural or weak phrasing.
  Max 3. Always include "replacement" (natural native alternative). note = 2–4 words.

"strength"  — The single best moment worth celebrating. Exactly 1. No "replacement".
  note = "⭐ Nice." / "⭐ Natural." / "⭐ Vivid." / "⭐ Strong opening."

"typical"  — A mechanical error that REPEATS throughout the essay.
  Mark ONLY the FIRST occurrence. note = exactly "Typ."
  Use ONLY for: lowercase "i", missing sentence-start capital, lowercase proper noun,
  missing apostrophe in contraction.
  Do NOT use for tense/article/agreement — those are "grammar".
  Max 2 "typical" annotations (one per distinct repeating pattern).

Total budget: up to 12 grammar + up to 3 expression + exactly 1 strength + up to 2 typical.
Find ALL errors first, then prioritise if over budget. Never pad.

IMPORTANT — easily missed errors to check explicitly:
• "there was many people" → "there were many people" (existential there + plural)
• Multiple tense errors in one sentence — annotate EACH wrong verb separately
• Sentence-start capitalization ("last weekend" → "Last weekend"):
  use "typical" if the pattern repeats throughout, "capitalization" subtype if isolated
• Adverb vs. adjective ("speak more confident" → "more confidently") — subType "verbForm"
• "didn't + past participle" errors ("didn't met" → "hadn't met")

━━━ EDITOR COMMENT ━━━
25–30 words, 1 sentence, warm and specific. Name one concrete thing from this essay.
No generic praise. Reference something the student actually wrote.

━━━ SUGGESTED VERSION ━━━
Rewrite the FULL essay applying every correction — grammar, expression, typical, capitalization.
Keep the student's exact voice, structure, and ideas. Do NOT add new ideas.
Write it as a native speaker would naturally express the same thoughts.

━━━ ONE-LINE COACHING ADVICE ━━━
Under 12 words. Sound like a coach, not a textbook.
Give direction, not just grammar rules.
Examples: "Consistency builds confidence." / "Small improvements become fluency."
         "Accuracy comes from repetition." / "Speak first. Perfection comes later."
Write in the same language as all other text fields.

━━━ STYLE DETECTION ━━━
Diary / Essay / Letter / Report / Blog Post / SNS Post / Story / Personal Statement / TOEFL / Business Email

━━━ RESPONSE FORMAT — valid JSON only, no markdown fences ━━━
{
  "_scan": "Your sentence-by-sentence analysis from Pass 1 and Pass 2 goes here. This field is ignored by the parser — use it freely to think through every error.",
  "detectedStyle": "Diary",
  "annotations": [
    { "type": "grammar",    "subType": "agreement",      "targetText": "were",       "replacement": "was",             "note": "주어-동사 불일치." },
    { "type": "grammar",    "subType": "tense",          "targetText": "go",         "replacement": "went",            "note": "과거 시제 사용." },
    { "type": "grammar",    "subType": "article",        "targetText": "a english",  "replacement": "an English",      "note": "'an' 사용." },
    { "type": "grammar",    "subType": "preposition",    "targetText": "arrived to", "replacement": "arrived at",      "note": "전치사 오류." },
    { "type": "grammar",    "subType": "spelling",       "targetText": "recieve",    "replacement": "receive",         "note": "철자 오류." },
    { "type": "grammar",    "subType": "plural",         "targetText": "two cup",    "replacement": "two cups",        "note": "복수형 사용." },
    { "type": "grammar",    "subType": "vocabulary",     "targetText": "very big",   "replacement": "enormous",        "note": "더 강한 표현." },
    { "type": "expression", "targetText": "very tired",  "replacement": "exhausted", "note": "자연스러운 표현." },
    { "type": "strength",   "targetText": "exact phrase from essay", "note": "⭐ Vivid detail." },
    { "type": "typical",    "targetText": "i",           "replacement": "I",         "note": "Typ." }
  ],
  "editorComment": "이 에세이만의 구체적인 내용을 언급하는 25–30단어 코멘트.",
  "nextChallenge": ["구체적인 글쓰기 목표 1.", "구체적인 글쓰기 목표 2."],
  "suggestedVersion": "모든 교정이 반영된 전체 에세이 — 학생의 목소리와 아이디어 유지.",
  "oneLineAdvice": "코치처럼 12단어 이하의 조언."
}`
}

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

    // ── Input validation ────────────────────────────────────────────────────
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

    // ── OpenAI call ─────────────────────────────────────────────────────────
    const userPrompt = `Essay Title: "${essayTitle ?? 'Untitled'}"

Essay:
${essayBody}

Please review this essay and return the JSON response as specified.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildSystemPrompt(language) },
        { role: 'user', content: userPrompt },
      ],
    })

    const rawText = completion.choices[0]?.message?.content ?? ''

    // ── Parse response ──────────────────────────────────────────────────────
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[essays/review] Non-JSON response:', rawText.slice(0, 200))
      return Response.json({ error: 'parse_error' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Map targetText → fragment; filter out non-matching annotations
    if (Array.isArray(parsed.annotations)) {
      parsed.annotations = parsed.annotations
        .map((a: { targetText?: string; fragment?: string; type: string; subType?: string; replacement?: string; note: string }) => ({
          type: a.type,
          ...(a.subType ? { subType: a.subType } : {}),
          fragment: a.targetText ?? a.fragment ?? '',
          replacement: a.replacement,
          note: a.note,
        }))
        .filter((a: { fragment: string }) =>
          typeof a.fragment === 'string' &&
          a.fragment.length > 0 &&
          essayBody.includes(a.fragment),
        )
    }

    // Ensure nextChallenge is always an array
    if (typeof parsed.nextChallenge === 'string') {
      parsed.nextChallenge = [parsed.nextChallenge]
    }

    // suggestedVersion: keep as-is if string, drop if missing
    if (typeof parsed.suggestedVersion !== 'string' || !parsed.suggestedVersion.trim()) {
      delete parsed.suggestedVersion
    }

    parsed.createdAt = new Date().toISOString()

    return Response.json({ review: parsed, essayId })

  } catch (err) {
    console.error('[essays/review] Unexpected error:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}