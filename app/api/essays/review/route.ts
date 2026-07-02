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

  return `You are the in-house editor at a literary magazine. Precise, economical, warm. You mark only what truly matters — like a real red-pen edit on a manuscript.

${langInstruction}

Return a JSON object. Follow every rule exactly.

━━━ RULE 1 — MINIMUM targetText ━━━
targetText = the SMALLEST unit that contains the error. One word when possible.
  ✗ "I go to a cafe every day"   (whole clause)
  ✓ "go"                          (just the wrong verb)

  ✗ "read a english story"
  ✓ "a english"  → mark "a" as typical (capitalisation), then "english" as grammar

  ✗ "the weather were bad"
  ✓ "were"  → replacement "was"

━━━ RULE 2 — FOUR ANNOTATION TYPES ━━━

"grammar"    High-value errors worth studying individually.
  • Wrong tense / verb form
  • Present perfect vs. simple past
  • Wrong or missing article (a / an / the)
  • Subject-verb agreement
  • Singular/plural mismatch
  • Wrong preposition
  Max 3. Always include "replacement" (the corrected word/phrase only).
  note = 2–4 words: "Past tense." / "Use 'an'." / "Subject-verb."

"expression" Unnatural or weak phrasing.
  Max 2. Always include "replacement" (a more natural alternative).
  note = 2–4 words: "More natural." / "Flows better." / "Try this."

"strength"   The single best moment in the essay.
  Exactly 1. No "replacement".
  note = "⭐ Nice." / "⭐ Natural." / "⭐ Strong opening." / "⭐ Good transition."

"typical"    A simple mechanical error that REPEATS throughout the essay.
  Mark ONLY the FIRST occurrence. Leave all other occurrences unmarked.
  Always include "replacement" (the correct form).
  note = "★ Typ."   (nothing else — the star signals "find the rest yourself")
  Use for:
    • Missing capital at sentence start  (hello → Hello)
    • Lowercase "i"  (i → I)
    • Lowercase proper noun  (english → English, canada → Canada)
    • Missing/wrong apostrophe in contraction  (dont → don't)
    • One simple tense habit repeated mechanically throughout
  Do NOT use "typical" for tense errors, article errors, or anything with learning value —
  those always get a "grammar" annotation.
  Max 2 "typical" annotations total (one per distinct pattern).

Total annotations: max 7 (3 grammar + 2 expression + 1 strength + 2 typical).

━━━ RULE 3 — editorComment ━━━
30 words MAX. 1–2 sentences. Warm, direct, human.
Name one specific thing from the essay. No generic praise.

━━━ RULE 4 — SUGGESTED VERSION ━━━
Rewrite the full essay applying ALL corrections (grammar + expression + typical).
Keep the student's voice, structure, and ideas exactly.
Do NOT add ideas or change meaning. Make it "one step better", not a rewrite.

━━━ STYLE DETECTION ━━━
Diary / Essay / Letter / Report / Blog Post / SNS Post / Story / Personal Statement / TOEFL / Business Email

━━━ RESPONSE FORMAT — valid JSON only, no markdown ━━━
{
  "detectedStyle": "Diary",
  "annotations": [
    {
      "type": "grammar",
      "targetText": "were",
      "replacement": "was",
      "note": "Subject-verb."
    },
    {
      "type": "expression",
      "targetText": "very big",
      "replacement": "huge",
      "note": "More natural."
    },
    {
      "type": "strength",
      "targetText": "exact phrase or sentence",
      "note": "⭐ Strong ending."
    },
    {
      "type": "typical",
      "targetText": "i",
      "replacement": "I",
      "note": "★ Typ."
    }
  ],
  "editorComment": "Warm specific comment, 30 words max.",
  "nextChallenge": ["Add one concrete detail.", "Name the place.", "End with a feeling."],
  "suggestedVersion": "Full revised essay, all corrections applied, student's voice preserved."
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
