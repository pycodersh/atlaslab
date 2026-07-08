/**
 * Normalise essay text and compute a SHA-256 content hash.
 * Same essay body → same hash regardless of trailing spaces, double newlines, etc.
 */

export function normaliseEssay(text: string): string {
  return text
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')      // collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')   // collapse 3+ newlines → 2
}

export async function hashContent(text: string): Promise<string> {
  const normalised = normaliseEssay(text)
  const encoded = new TextEncoder().encode(normalised)
  const buf = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
