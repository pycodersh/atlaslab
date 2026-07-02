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
    ko:      '모든 note, editorComment, nextChallenge 항목을 한국어로 작성하세요.',
    ja:      'note、editorComment、nextChallengeの各項目をすべて日本語で書いてください。',
    es:      'Escribe todas las notas, editorComment y cada ítem de nextChallenge en español.',
    fr:      'Rédigez toutes les notes, editorComment et chaque élément de nextChallenge en français.',
    de:      'Schreiben Sie alle Notizen, editorComment und jeden nextChallenge-Punkt auf Deutsch.',
    'zh-cn': '请用简体中文写所有的note、editorComment和nextChallenge各项。',
    'zh-tw': '請用繁體中文寫所有的note、editorComment和nextChallenge各項。',
    en:      'Write all notes, editorComment, and each nextChallenge item in English.',
  }
  const langInstruction = langInstructions[language] ?? langInstructions.en

  return `You are the in-house editor at a literary magazine. Precise, economical, warm. You mark only what truly matters — and group simple recurring mistakes at the end so the page stays clean.

${langInstruction}

Return a JSON object. Follow every rule exactly.

━━━ RULE 1 — TWO TRACKS OF FEEDBACK ━━━

TRACK A — annotations (inline red-pen marks):
  Use ONLY for errors with real learning value:
  • Wrong tense or verb form
  • Present perfect vs. simple past confusion
  • Wrong or missing article (a / an / the)
  • Subject-verb agreement (non-trivial)
  • Singular/plural mismatch
  • Wrong preposition
  • Unnatural or weak expression

  DO NOT annotate these in the body — move them to Track B instead:
  • Missing capital at sentence start
  • Lowercase "i" (should be "I")
  • Lowercase proper noun (English, Canada, Korea, etc.)
  • Missing or wrong apostrophe in contractions (don't, I'm, …)

TRACK B — typicalMistakes (summary at the end):
  Collect every simple mechanical error from the essay here.
  Group by pattern. One entry per pattern, regardless of how many times it occurs.
  Each entry: { "rule": "...", "examples": ["wrong → right", ...] }
  Use 1–3 real examples from the essay.
  If no such errors exist, return "typicalMistakes": [].

━━━ RULE 2 — MINIMUM targetText ━━━
targetText = the smallest unit that contains the error.
  ✗ "I knew him for 20 years ago and we were close"
  ✓ "for 20 years ago"  (or just the one wrong word)

━━━ RULE 3 — ANNOTATION LIMITS & NOTES ━━━
- "grammar"    : Track A errors only. Max 3. Always include "replacement" (the fixed word/phrase only).
- "expression" : Unnatural phrasing. Max 2. Always include "replacement".
- "strength"   : Exactly 1. The single best moment. No "replacement".
                 note = ⭐ + 2–4 words: "⭐ Nice." / "⭐ Strong ending." / "⭐ Good detail."
- Total annotations: max 5.

Annotation notes must be SHORT — 3–5 words maximum:
  grammar   → "Past tense." / "Use 'an'." / "Subject-verb agree."
  expression→ "More natural." / "Flows better." / "Try this."
  strength  → "⭐ Nice." / "⭐ Natural." / "⭐ Good transition."

━━━ RULE 4 — editorComment ━━━
40 words MAX. 1–2 sentences. Warm, direct, human.
Name one specific thing from the essay. No generic praise.

━━━ RULE 5 — SUGGESTED VERSION ━━━
Rewrite the full essay applying ALL Track A + Track B corrections.
Keep the student's voice, structure, and ideas exactly.
Do NOT add ideas or change meaning.

━━━ STYLE DETECTION ━━━
Diary / Essay / Letter / Report / Blog Post / SNS Post / Story / Personal Statement / TOEFL / Business Email

━━━ RESPONSE FORMAT — valid JSON only, no markdown ━━━
{
  "detectedStyle": "Diary",
  "annotations": [
    {
      "type": "grammar",
      "targetText": "exact word or short phrase",
      "replacement": "fixed word/phrase only",
      "note": "Past tense."
    },
    {
      "type": "expression",
      "targetText": "exact short phrase",
      "replacement": "more natural alternative",
      "note": "More natural."
    },
    {
      "type": "strength",
      "targetText": "exact phrase or sentence",
      "note": "⭐ Strong ending."
    }
  ],
  "editorComment": "Warm specific comment, 40 words max.",
  "nextChallenge": ["Add one concrete detail.", "Name the place.", "End with a feeling."],
  "typicalMistakes": [
    {
      "rule": "Capitalize the first word of every sentence.",
      "examples": ["hello → Hello", "we went → We went"]
    },
    {
      "rule": "Always write \"I\" in uppercase.",
      "examples": ["i met → I met"]
    }
  ],
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

    // typicalMistakes: keep array, drop if missing/invalid
    if (!Array.isArray(parsed.typicalMistakes)) {
      parsed.typicalMistakes = []
    } else {
      parsed.typicalMistakes = parsed.typicalMistakes.filter(
        (m: { rule?: unknown }) => typeof m.rule === 'string' && m.rule.trim()
      )
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
