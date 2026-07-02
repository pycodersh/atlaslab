import { createClaudeClient } from '@/lib/ai/claude'

const LANG_NAMES: Record<string, string> = {
  ko:      'Korean',
  ja:      'Japanese',
  es:      'Spanish',
  fr:      'French',
  de:      'German',
  'zh-cn': 'Simplified Chinese',
  'zh-tw': 'Traditional Chinese',
}

export async function POST(request: Request) {
  const claude = createClaudeClient()
  if (!claude.ok) {
    return Response.json({ error: 'service_unavailable' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { text, language = 'ko' } = body as { text: string; language: string }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return Response.json({ error: 'invalid_input' }, { status: 400 })
    }

    const langName = LANG_NAMES[language] ?? 'the user\'s native language'

    const message = await claude.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `The user is writing an English essay and got stuck on this sentence written in ${langName}:

"${text.trim()}"

Provide ONE natural English expression that a native speaker would actually use.
Rules:
- Return ONLY the English sentence — no explanation, no alternatives, no quotes, no intro phrase.
- Match the tone of the original (casual vs. formal).
- Keep it concise and natural.`,
      }],
    })

    const suggestion = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : ''

    if (!suggestion) {
      return Response.json({ error: 'empty_response' }, { status: 500 })
    }

    return Response.json({ suggestion })
  } catch (err) {
    console.error('[essays/suggest] error:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}
