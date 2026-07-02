import Anthropic from '@anthropic-ai/sdk'

export type ClaudeClientResult =
  | { ok: true; client: Anthropic }
  | { ok: false; error: 'missing_api_key' }

/**
 * Returns a ready-to-use Anthropic client, or a typed error if the key is absent.
 * All server routes that call Claude should use this instead of `new Anthropic()` directly.
 */
export function createClaudeClient(): ClaudeClientResult {
  const key = process.env.ANTHROPIC_API_KEY

  // Diagnostic log — visible in Vercel Function logs
  console.log('[claude] ANTHROPIC_API_KEY present:', !!key)
  if (key) {
    console.log('[claude] ANTHROPIC_API_KEY prefix:', key.slice(0, 8))
    console.log('[claude] ANTHROPIC_API_KEY length:', key.length)
  } else {
    console.error('[claude] ANTHROPIC_API_KEY is missing — returning 503')
    return { ok: false, error: 'missing_api_key' }
  }

  try {
    const client = new Anthropic({ apiKey: key })
    console.log('[claude] Anthropic client created successfully')
    return { ok: true, client }
  } catch (err) {
    console.error('[claude] Anthropic client init failed:', err)
    return { ok: false, error: 'missing_api_key' }
  }
}
