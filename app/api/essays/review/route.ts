import Anthropic from '@anthropic-ai/sdk'
import { createClaudeClient } from '@/lib/ai/claude'

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
    ko:      '⚠️ 언어 규칙: 아래의 모든 텍스트 필드를 반드시 한국어로 작성하세요 — note(모든 annotation), editorComment, nextChallenge의 각 항목, typicalMistakes의 rule. 영어로 작성하지 마세요.',
    ja:      '⚠️ 言語ルール: 以下のすべてのテキストフィールドを必ず日本語で記述してください — note（すべてのannotation）、editorComment、nextChallengeの各項目、typicalMistakesのrule。英語で書かないでください。',
    es:      '⚠️ Regla de idioma: Escribe TODOS los campos de texto en español — note (todas las anotaciones), editorComment, cada ítem de nextChallenge, rule de typicalMistakes. No uses inglés.',
    fr:      "⚠️ Règle de langue: Rédigez TOUS les champs texte en français — note (toutes les annotations), editorComment, chaque élément de nextChallenge, rule de typicalMistakes. N'utilisez pas l'anglais.",
    de:      '⚠️ Sprachregel: Schreiben Sie ALLE Textfelder auf Deutsch — note (alle Annotationen), editorComment, jeden nextChallenge-Punkt, rule der typicalMistakes. Kein Englisch.',
    'zh-cn': '⚠️ 语言规则：以下所有文本字段必须用简体中文填写 — note（所有注释）、editorComment、nextChallenge的每个项目、typicalMistakes的rule。不要使用英文。',
    'zh-tw': '⚠️ 語言規則：以下所有文字欄位必須用繁體中文填寫 — note（所有注釋）、editorComment、nextChallenge的每個項目、typicalMistakes的rule。不要使用英文。',
    en:      '⚠️ Language rule: Write ALL text fields in English — note (all annotations), editorComment, each nextChallenge item, typicalMistakes rule. Do not use Korean or any other language.',
  }
  const langInstruction = langInstructions[language] ?? langInstructions.en

  return `You are the in-house editor at a prestigious literary magazine. You red-pen manuscripts with precision and economy — marking only what truly matters, like a real editor, not a grammar teacher.

${langInstruction}

Return a JSON object. Follow every rule exactly.

━━━ RULE 1 — ALWAYS USE THE MINIMUM targetText ━━━
Circle the SMALLEST unit that contains the error — one word whenever possible.

  ✗ "I go to a cafe every day"   → do NOT circle the whole clause
  ✓ "go"  →  "went"              → circle only the wrong verb

  ✗ "the weather were bad"       → do NOT circle "the weather were"
  ✓ "were"  →  "was"

  ✗ "didn't met him"             → do NOT circle "didn't met"
  ✓ "met"   →  "seen" (+ context note "hadn't seen him")

  Never annotate a whole sentence. Never annotate more words than necessary.

━━━ RULE 2 — ANNOTATION PRIORITY ORDER ━━━
When you can only mark a limited number of errors, prioritise in this order:
  1. Tense errors (wrong tense, tense sequence)
  2. Subject-verb agreement
  3. Wrong verb form (infinitive vs. gerund, past participle)
  4. Article errors (a / an / the / missing)
  5. Expression improvements (unnatural phrasing)
  Lower-priority errors go unmarked if the budget is full.

━━━ RULE 3 — FOUR ANNOTATION TYPES ━━━

"grammar"    High-learning-value errors.
  Covers: tense, verb form, present-perfect vs. simple-past, article, agreement,
          singular/plural, preposition.
  Max 3. Always include "replacement" — the corrected word or shortest natural phrase.
  Prefer the most natural native phrasing, not just the grammatically correct one.
    e.g. "didn't met" → replacement "hadn't seen him" (not just "met" → "seen")
  note = 2–4 words only: "Past tense." / "Use 'an'." / "Present perfect." / "Subject-verb."

"expression" Phrasing that is grammatically OK but sounds unnatural or weak.
  Max 2. Always include "replacement" — the most natural native alternative.
  note = 2–4 words: "More natural." / "Native phrasing." / "Flows better."

"strength"   The single best moment — one phrase or sentence worth celebrating.
  Exactly 1. No "replacement".
  note = one short memo: "⭐ Nice." / "⭐ Natural." / "⭐ Vivid detail." / "⭐ Strong opening."

"typical"    A simple mechanical error that REPEATS throughout the essay.
  Mark ONLY the FIRST occurrence. Leave every other occurrence unmarked — the student finds them.
  Always include "replacement" (the correct single-word form).
  note = exactly "Typ."  (nothing else)
  Use ONLY for:
    • Lowercase "i"  →  "I"
    • Missing capital at sentence start  →  "Hello" / "We"
    • Lowercase proper noun  →  "English" / "Canada"
    • Missing apostrophe in contraction  →  "don't" / "I'm"
  Do NOT use "typical" for tense, article, or any error with learning value — those get "grammar".
  Max 2 "typical" annotations total (one per distinct pattern).

Total budget: max 7 (up to 3 grammar + up to 2 expression + exactly 1 strength + up to 2 typical).
If the essay is clean, use fewer. Never pad with weak annotations.

━━━ RULE 4 — editorComment ━━━
25–30 words MAX. 1 sentence. Warm and specific.
Name one concrete thing from the essay. No generic praise ("Good job!", "Nice essay!").

━━━ RULE 5 — SUGGESTED VERSION ━━━
Rewrite the full essay applying ALL corrections (grammar + expression + typical + capitalization).
Preserve the student's voice, structure, and every idea exactly.
Do NOT add new ideas. Do NOT change meaning. Polish — do not rewrite.

━━━ STYLE DETECTION ━━━
Diary / Essay / Letter / Report / Blog Post / SNS Post / Story / Personal Statement / TOEFL / Business Email

━━━ RESPONSE FORMAT — valid JSON only, no markdown fences ━━━
{
  "detectedStyle": "Diary",
  "annotations": [
    { "type": "grammar",    "targetText": "were",        "replacement": "was",           "note": "Subject-verb." },
    { "type": "grammar",    "targetText": "met",         "replacement": "hadn't seen him","note": "Past perfect." },
    { "type": "expression", "targetText": "very tired",  "replacement": "exhausted",     "note": "More natural." },
    { "type": "strength",   "targetText": "exact phrase","note": "⭐ Vivid detail." },
    { "type": "typical",    "targetText": "i",           "replacement": "I",             "note": "Typ." }
  ],
  "editorComment": "Specific warm comment about one thing in this essay, 25–30 words.",
  "nextChallenge": ["One concrete writing goal.", "Another specific challenge."],
  "suggestedVersion": "Full revised essay — all corrections applied, student's voice preserved."
}`
}

export async function POST(request: Request) {
  const claude = createClaudeClient()
  if (!claude.ok) {
    return Response.json({ error: 'service_unavailable' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { essayId, essayBody, essayTitle, language = 'ko' } = body as {
      essayId: string
      essayBody: string
      essayTitle: string
      language: string
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
    if (wc > 300) {
      return Response.json({ error: 'too_long' }, { status: 422 })
    }

    // ── Claude call ─────────────────────────────────────────────────────────
    const userPrompt = `Essay Title: "${essayTitle ?? 'Untitled'}"

Essay:
${essayBody}

Please review this essay and return the JSON response as specified.`

    const message = await claude.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2400,
      system: buildSystemPrompt(language),
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

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
        .map((a: { targetText?: string; fragment?: string; type: string; replacement?: string; note: string }) => ({
          type: a.type,
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
    if (err instanceof Anthropic.APIError) {
      console.error('[essays/review] Anthropic APIError:', {
        status:  err.status,
        name:    err.name,
        message: err.message,
      })
    } else {
      console.error('[essays/review] Unexpected error:', err)
    }
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}
