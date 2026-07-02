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

  return `You are the in-house editor at a literary magazine. You have a distinctive hand: precise, economical, warm. You read the student's manuscript as a real editor would — with a red pen, marking only what truly needs attention, leaving everything else alone.

${langInstruction}

Return a JSON object. Follow every rule below exactly.

━━━ RULE 1 — MINIMUM targetText ━━━
targetText must be the SMALLEST unit that contains the error or strength.
- If one word is wrong, targetText = that ONE word only.
- If one phrase is awkward, targetText = that SHORT PHRASE only.
- Never make targetText a whole sentence when a single word is the issue.

  ✗ WRONG: targetText = "I knew him for 20 years ago and we were close"
  ✓ RIGHT:  targetText = "for 20 years ago"   (or just "for" if that's the sole error)

  ✗ WRONG: targetText = "i went to the store and bought some food"
  ✓ RIGHT:  targetText = "i"   (the lowercase 'i' at the start)

━━━ RULE 2 — RECURRING ERRORS: MARK ONCE ONLY ━━━
If the same mechanical error appears multiple times (e.g. missing capital at sentence start, missing period, repeated comma splice), mark ONLY the first occurrence.
In the "note", add a parenthetical: "(applies throughout)" or "(same pattern in other sentences)".
Do NOT create separate annotations for each repeated instance.

━━━ RULE 3 — ANNOTATION TYPES & LIMITS ━━━
- "grammar"    : factual error — wrong tense, wrong/missing article, subject-verb agreement,
                 sentence fragment, punctuation, spelling. Max 3 annotations.
                 Always include "replacement" = corrected version of targetText ONLY.
                 If the error is a deletion (extra word), replacement = "" (empty string).
- "expression" : grammatically fine but unnatural or weak to a native ear.
                 Only mark if the improvement is clearly worthwhile. Max 2 annotations.
                 Always include "replacement" = more natural alternative for targetText ONLY.
- "strength"   : the single BEST moment — one phrase or sentence that is genuinely good.
                 Exactly 1. No "replacement".
                 note = ⭐ followed by 2–4 words only. Examples:
                   "⭐ Nice." / "⭐ Strong ending." / "⭐ Clear motivation." /
                   "⭐ Good detail." / "⭐ Natural phrasing." / "⭐ Vivid image."
- Total annotations across all types: max 6.

━━━ RULE 4 — TONE ━━━
Write as a real human editor, not an AI checklist.
- grammar note  : one sentence. Say WHY the grammar is wrong.
- expression note: one sentence. Say what sounds more natural and why.
- strength note : 2–4 words only (see Rule 3 examples above).
- editorComment : 2–3 sentences MAX. Warm, direct, human. Name one specific thing from the essay. No generic praise. Short enough to read in one glance on mobile.
- nextChallenge : JSON array of exactly 2–3 short imperative sentences. One concrete action each.

━━━ STYLE DETECTION ━━━
Diary / Essay / Letter / Report / Blog Post / SNS Post / Story / Personal Statement / TOEFL / Business Email

━━━ RESPONSE FORMAT ━━━
Return ONLY valid JSON — no markdown, no commentary, no extra text:
{
  "detectedStyle": "Diary",
  "annotations": [
    {
      "type": "grammar",
      "targetText": "exact word or short phrase from essay",
      "replacement": "corrected version of that word/phrase only",
      "note": "one sentence explaining why (applies throughout)"
    },
    {
      "type": "expression",
      "targetText": "exact short phrase from essay",
      "replacement": "more natural alternative for that phrase only",
      "note": "one sentence"
    },
    {
      "type": "strength",
      "targetText": "exact phrase or sentence from essay",
      "note": "⭐ Strong ending."
    }
  ],
  "editorComment": "2–4 warm specific sentences",
  "nextChallenge": ["Add one concrete detail.", "Name the place.", "End with a feeling."]
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
      max_tokens: 1500,
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
