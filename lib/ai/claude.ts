import Anthropic from '@anthropic-ai/sdk'

export type ClaudeClientResult =
  | { ok: true; client: Anthropic }
  | { ok: false; error: 'missing_api_key' }

/**
 * Returns a ready-to-use Anthropic client, or a typed error if the key is absent.
 * All server routes that call Claude should use this instead of `new Anthropic()` directly.
 */
export function createClaudeClient(): ClaudeClientResult {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[claude] ANTHROPIC_API_KEY is missing')
    return { ok: false, error: 'missing_api_key' }
  }
  return { ok: true, client: new Anthropic() }
}
