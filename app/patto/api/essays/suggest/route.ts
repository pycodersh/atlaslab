import { createClaudeClient } from '@/lib/ai/claude'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserWithPlan, logApiCall } from '@/lib/ai/rateLimit'
import { hashContent } from '@/lib/ai/contentHash'

const MODEL    = 'claude-haiku-4-5-20251001'
const ENDPOINT = 'essays/suggest'

const LANG_NAMES: Record<string, string> = {
  ko: 'Korean', ja: 'Japanese', es: 'Spanish',
  fr: 'French', de: 'German', 'zh-cn': 'Simplified Chinese', 'zh-tw': 'Traditional Chinese',
}

// ── In-flight dedup (10 s cooldown per user + same input text) ────────────────
const inFlight = new Map<string, number>()

function acquireLock(key: string): boolean {
  const now  = Date.now()
  const prev = inFlight.get(key)
  if (prev && now - prev < 10_000) return false
  inFlight.set(key, now)
  return true
}
function releaseLock(key: string) { inFlight.delete(key) }

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const claude = createClaudeClient()
  if (!claude.ok) {
    return Response.json({ error: 'service_unavailable' }, { status: 503 })
  }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return Response.json({ error: 'service_unavailable' }, { status: 500 })
  }
  const session = await createClient()

  try {
    const body = await request.json()
    const { text, language = 'ko' } = body as { text: string; language: string }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return Response.json({ error: 'invalid_input' }, { status: 400 })
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    const authedUser = await getUserWithPlan(session)
    if (!authedUser) {
      return Response.json({ error: 'unauthenticated' }, { status: 401 })
    }

    // ── In-flight dedup ───────────────────────────────────────────────────────
    const inputHash = await hashContent(text)
    const lockKey   = `${authedUser.id}:${inputHash}`
    if (!acquireLock(lockKey)) {
      return Response.json({ error: 'duplicate_request' }, { status: 409 })
    }

    try {
      const langName = LANG_NAMES[language] ?? "the user's native language"

      const message = await claude.client.messages.create({
        model:      MODEL,
        max_tokens: 200,
        messages: [{
          role:    'user',
          content: `The user is writing an English essay and got stuck on this sentence written in ${langName}:

"${text.trim()}"

Provide ONE natural English expression that a native speaker would actually use.
Rules:
- Return ONLY the English sentence — no explanation, no alternatives, no quotes, no intro phrase.
- Match the tone of the original (casual vs. formal).
- Keep it concise and natural.`,
        }],
      })

      const inputTokens  = message.usage?.input_tokens
      const outputTokens = message.usage?.output_tokens
      const suggestion   = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

      if (!suggestion) {
        void logApiCall(admin, { userId: authedUser.id, endpoint: ENDPOINT, model: MODEL, status: 'failed', reason: 'empty_response' })
        return Response.json({ error: 'empty_response' }, { status: 500 })
      }

      void logApiCall(admin, { userId: authedUser.id, endpoint: ENDPOINT, model: MODEL, status: 'success', inputTokens, outputTokens })
      return Response.json({ suggestion })

    } finally {
      releaseLock(lockKey)
    }

  } catch (err) {
    console.error('[essays/suggest] error:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}
