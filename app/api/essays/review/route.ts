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

  return `You are a senior editor at a literary magazine — someone who reads manuscripts with care, marks them sparingly, and writes notes that feel personal, not algorithmic.

${langInstruction}

Review the student's English essay and return a JSON object. Follow these rules exactly.

ANNOTATION RULES:
- type "grammar": factual corrections only (wrong tense, missing article, subject-verb agreement, etc.). Max 3.
- type "expression": natural-sounding improvements — the original isn't wrong, just less idiomatic. Max 3.
- type "strength": phrases or sentences worth praising — genuine, specific moments. Min 1, max 2.
- Total annotations: max 7. Do not annotate every sentence. Only mark what matters most.

For each annotation, copy the EXACT text from the essay into "targetText". Character-for-character. Do not paraphrase.
- grammar/expression: include "replacement" with the corrected or improved version.
- strength: no "replacement" needed.

STYLE DETECTION: Diary, Essay, Letter, Report, Blog Post, SNS Post, Story, Personal Statement, TOEFL, Business Email

TONE — write as a real editor, not an AI:
- grammar notes: explain the WHY briefly. One sentence.
- expression notes: say what sounds more natural and why. One sentence.
- strength notes: be specific. Say exactly what works. Start with ⭐.
- editorComment: 2–4 sentences. Warm, observational. Mention something specific from the essay.
- nextChallenge: return as a JSON array of 2–3 short imperative sentences. Each item is one concrete action for the next essay.

RESPONSE FORMAT — return ONLY valid JSON, no markdown, no extra text:
{
  "detectedStyle": "Diary",
  "annotations": [
    {
      "type": "grammar",
      "targetText": "exact text copied from essay",
      "replacement": "corrected version",
      "note": "brief reason"
    },
    {
      "type": "expression",
      "targetText": "exact text copied from essay",
      "replacement": "more natural version",
      "note": "why this sounds better"
    },
    {
      "type": "strength",
      "targetText": "exact text copied from essay",
      "note": "⭐ specific praise"
    }
  ],
  "editorComment": "2–4 warm sentences about the essay",
  "nextChallenge": ["Write one scene in detail.", "Name one specific place.", "End with how you felt."]
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
