import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const LANG_NAMES: Record<string, string> = {
  ko:      'Korean',
  ja:      'Japanese',
  es:      'Spanish',
  fr:      'French',
  de:      'German',
  'zh-cn': 'Simplified Chinese',
  'zh-tw': 'Traditional Chinese',
}

export async function POST(req: Request) {
  const { type, text, targetLang } = await req.json() as {
    type: 'word' | 'phrase' | 'pattern'
    text: string
    targetLang: string
  }

  if (!text || !targetLang || targetLang === 'en') {
    return Response.json({ error: 'invalid input' }, { status: 400 })
  }

  const langName = LANG_NAMES[targetLang]
  if (!langName) return Response.json({ error: 'unsupported language' }, { status: 400 })

  const typeHint: Record<string, string> = {
    word:    'English word',
    phrase:  'English phrase or idiom',
    pattern: 'English sentence pattern used for language learning',
  }

  const prompt = type === 'pattern'
    ? `Translate this English sentence pattern into ${langName}. Return only the short meaning/translation (not the full example sentence). Keep it concise — the way a learner's flashcard would show it.\n\nPattern: "${text}"\n\nTranslation:`
    : `Translate this ${typeHint[type] ?? 'English expression'} into ${langName}. Return only the translated meaning — no extra explanation, no romanization, no parentheses.\n\nExpression: "${text}"\n\nTranslation:`

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80,
      temperature: 0.2,
    })
    const translation = res.choices[0]?.message?.content?.trim() ?? ''
    return Response.json({ translation })
  } catch {
    return Response.json({ error: 'translation failed' }, { status: 500 })
  }
}
