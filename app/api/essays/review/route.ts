import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// Detect if text is primarily English (rough heuristic)
function isEnglish(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return false
  // If more than 40% of characters are non-ASCII, it's likely not English
  const nonAscii = (text.match(/[^\x00-\x7F]/g) ?? []).length
  return nonAscii / text.length < 0.4
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function buildSystemPrompt(appLang: string): string {
  const langInstructions: Record<string, string> = {
    ko: '한국어로 모든 note, editorComment, nextChallenge를 작성하세요.',
    ja: '日本語でnote、editorComment、nextChallengeをすべて書いてください。',
    es: 'Escribe todas las notas, editorComment y nextChallenge en español.',
    fr: 'Rédigez toutes les notes, editorComment et nextChallenge en français.',
    de: 'Schreiben Sie alle Notizen, editorComment und nextChallenge auf Deutsch.',
    'zh-cn': '请用简体中文写所有的note、editorComment和nextChallenge。',
    'zh-tw': '請用繁體中文寫所有的note、editorComment和nextChallenge。',
    en: 'Write all notes, editorComment, and nextChallenge in English.',
  }
  const langInstruction = langInstructions[appLang] ?? langInstructions.en

  return `You are a thoughtful magazine editor — the kind who works at Monocle, Kinfolk, or The New York Times Magazine. You review essays with genuine care and a light editorial touch.

${langInstruction}

Your task is to review a student's English essay and return a structured JSON response. Follow these rules STRICTLY:

ANNOTATION RULES:
- Maximum 3 grammar corrections (type: "grammar")
- Maximum 3 expression improvements (type: "expression")
- Minimum 2 genuine praises (type: "praise") — find truly good moments
- Total annotations: maximum 8

For each annotation, identify the EXACT text fragment from the essay. Copy it character-for-character — it must match exactly so it can be found programmatically.

STYLE DETECTION:
Detect the essay's style from: Diary, Business Email, Essay, TOEFL, Letter, Report, SNS Post, Story, Personal Statement, Blog Post

TONE:
- Be warm, specific, and encouraging — not clinical
- Praises should be genuine, not generic
- Grammar notes should explain the WHY, not just state the rule
- Expression improvements should feel like upgrades, not corrections
- The student should feel like a magazine editor personally read their work

RESPONSE FORMAT — return ONLY valid JSON, no markdown, no extra text:
{
  "detectedStyle": "Diary",
  "annotations": [
    {
      "type": "grammar",
      "fragment": "exact text from the essay",
      "replacement": "corrected version",
      "note": "brief explanation in the target language"
    },
    {
      "type": "expression",
      "fragment": "exact text from the essay",
      "replacement": "better expression",
      "note": "why this sounds more natural"
    },
    {
      "type": "praise",
      "fragment": "exact text from the essay",
      "note": "⭐ specific praise for this moment"
    }
  ],
  "editorComment": "1-2 sentence overall editorial comment",
  "nextChallenge": "One specific writing challenge for their next essay"
}

IMPORTANT: The "fragment" field must be copied EXACTLY from the essay text — same spelling, same spacing, same punctuation. Do not paraphrase or modify it.`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { essayId, essayBody, essayTitle, appLang = 'ko' } = body as {
      essayId: string
      essayBody: string
      essayTitle: string
      appLang: string
    }

    // Validation
    if (!essayBody || typeof essayBody !== 'string') {
      return Response.json({ error: 'invalid_input' }, { status: 400 })
    }

    const wc = wordCount(essayBody)
    if (!isEnglish(essayBody)) {
      return Response.json({ error: 'not_english' }, { status: 422 })
    }
    if (wc < 10) {
      return Response.json({ error: 'too_short' }, { status: 422 })
    }
    if (wc > 300) {
      return Response.json({ error: 'too_long' }, { status: 422 })
    }

    const userPrompt = `Essay Title: "${essayTitle}"

Essay:
${essayBody}

Please review this essay and return the JSON response as specified.`

    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      system: buildSystemPrompt(appLang),
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'parse_error' }, { status: 500 })
    }

    const review = JSON.parse(jsonMatch[0])

    // Filter annotations to only those whose fragment actually exists in the essay
    if (Array.isArray(review.annotations)) {
      review.annotations = review.annotations.filter(
        (a: { fragment: string }) =>
          typeof a.fragment === 'string' && essayBody.includes(a.fragment),
      )
    }

    review.createdAt = new Date().toISOString()

    return Response.json({ review, essayId })
  } catch (err) {
    console.error('[essays/review]', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}
