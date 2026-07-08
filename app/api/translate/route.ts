import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase/admin'
import { logApiCall } from '@/lib/ai/rateLimit'

const openai   = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const MODEL    = 'gpt-4o-mini'
const ENDPOINT = 'translate'

const LANG_NAMES: Record<string, string> = {
  ko: 'Korean', ja: 'Japanese', es: 'Spanish',
  fr: 'French', de: 'German', 'zh-cn': 'Simplified Chinese', 'zh-tw': 'Traditional Chinese',
}

function normaliseCacheKey(type: string, text: string, lang: string): string {
  return `${type}:${text.trim().replace(/\s+/g, ' ').toLowerCase()}:${lang}`
}

export async function POST(req: Request) {
  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return Response.json({ error: 'service_unavailable' }, { status: 500 })
  }

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

  const cacheKey = normaliseCacheKey(type, text, targetLang)

  // ── 1. Server-side cache lookup ───────────────────────────────────────────
  const { data: cached } = await admin
    .from('translation_cache')
    .select('translation, hit_count')
    .eq('cache_key', cacheKey)
    .single()

  if (cached?.translation) {
    void admin.from('translation_cache')
      .update({ hit_count: (cached.hit_count ?? 0) + 1 })
      .eq('cache_key', cacheKey)
    void logApiCall(admin, { userId: null, endpoint: ENDPOINT, model: MODEL, status: 'cached', reason: 'cache_hit' })
    return Response.json({ translation: cached.translation })
  }

  // ── 2. Call OpenAI ────────────────────────────────────────────────────────
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
      model:       MODEL,
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  80,
      temperature: 0.2,
    })
    const translation  = res.choices[0]?.message?.content?.trim() ?? ''
    const inputTokens  = res.usage?.prompt_tokens
    const outputTokens = res.usage?.completion_tokens

    if (!translation) {
      return Response.json({ error: 'translation failed' }, { status: 500 })
    }

    // Persist to server cache (best-effort; ignore duplicate key errors)
    void admin.from('translation_cache').insert({
      cache_key:     cacheKey,
      item_type:     type,
      original_text: text,
      target_lang:   targetLang,
      translation,
    }).then(({ error }) => {
      if (error && error.code !== '23505') {
        console.error('[translate] cache insert error:', error.message)
      }
    })

    void logApiCall(admin, { userId: null, endpoint: ENDPOINT, model: MODEL, status: 'success', inputTokens, outputTokens })
    return Response.json({ translation })

  } catch {
    return Response.json({ error: 'translation failed' }, { status: 500 })
  }
}
