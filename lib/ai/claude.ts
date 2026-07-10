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

  if (!key) {
    console.error('[claude] ANTHROPIC_API_KEY is missing — returning 503')
    return { ok: false, error: 'missing_api_key' }
  }

  try {
    const client = new Anthropic({ apiKey: key })
    return { ok: true, client }
  } catch (err) {
    console.error('[claude] Anthropic client init failed:', err)
    return { ok: false, error: 'missing_api_key' }
  }
}
