/**
 * Pattern Example translations — Batch 2 (Stories 21–40, Patterns pt21-1 ~ pt40-5)
 * 100 patterns × 5 examples × 6 languages (es/ja/zh-CN/zh-TW/fr/de)
 * Translates Korean (ko) examples to 6 languages. English is original, not translated.
 * Output: data/pattern-example-translations-batch2.ts
 * Run: npx tsx scripts/translate-examples-batch2.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { patternExamples } from '../data/pattern-examples'

// ── env ───────────────────────────────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf-8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('='); if (eq < 0) continue
    process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
  }
}
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set in .env.local')
const client = new Anthropic({ apiKey })

// ── types ─────────────────────────────────────────────────────────────────────
type Lang = 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'
const LANGS: Lang[] = ['es', 'ja', 'zh-CN', 'zh-TW', 'fr', 'de']

type ExampleTranslation = {
  index: number  // 0-4
  translations: Record<Lang, string>
}

type PatternExampleTranslation = {
  patternId: string
  examples: ExampleTranslation[]
}

// ── batch 1 scope: stories 1–20 → pt21-1 ~ pt40-5 ────────────────────────────
const BATCH_IDS = Array.from({ length: 20 }, (_, s) =>
  Array.from({ length: 5 }, (_, p) => `pt${s + 21}-${p + 1}`)
).flat()

type PatternItem = { id: string; examples: { en: string; ko: string }[] }
const batchPatterns: PatternItem[] = BATCH_IDS
  .filter(id => patternExamples[id])
  .map(id => ({
    id,
    examples: patternExamples[id].map(e => ({ en: e.en, ko: e.ko })),
  }))

// ── chunk helper ──────────────────────────────────────────────────────────────
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// ── safe JSON parse ───────────────────────────────────────────────────────────
function safeParseJson(raw: string): Record<string, Record<string, string>> {
  const block = raw.match(/\{[\s\S]*\}/)
  if (!block) throw new Error('no JSON block found')
  try {
    return JSON.parse(block[0])
  } catch {
    // Re-escape unescaped quotes inside string values
    let text = block[0]
    let result = ''
    let i = 0
    while (i < text.length) {
      const keyMatch = text.slice(i).match(/^("(?:[^"\\]|\\.)*"\s*:\s*")/)
      if (keyMatch) {
        result += keyMatch[0]
        i += keyMatch[0].length
        let value = ''
        while (i < text.length) {
          const ch = text[i]
          if (ch === '\\' && i + 1 < text.length) {
            value += ch + text[i + 1]; i += 2
          } else if (ch === '"') {
            const rest = text.slice(i + 1).trimStart()
            if (rest.startsWith(',') || rest.startsWith('}') || rest.startsWith('\n')) {
              result += value + '"'; i++; break
            } else {
              value += '\\"'; i++
            }
          } else { value += ch; i++ }
        }
      } else { result += text[i]; i++ }
    }
    return JSON.parse(result)
  }
}

// ── translate a batch of patterns ─────────────────────────────────────────────
// Each batch = multiple patterns, each with 5 examples
// Prompt asks to translate each example's Korean text to 6 languages
async function translateBatch(
  batch: PatternItem[]
): Promise<Record<string, Record<string, string>>> {
  // Key format: "{patternId}_{index}" → { es, ja, zh-CN, zh-TW, fr, de }
  const exampleLines = batch.flatMap(p =>
    p.examples.map((e, i) => `"${p.id}_${i}": ${JSON.stringify(e.ko)}`)
  ).join(',\n')

  const template = batch.flatMap(p =>
    p.examples.map((_, i) =>
      `"${p.id}_${i}": {"es":"...","ja":"...","zh-CN":"...","zh-TW":"...","fr":"...","de":"..."}`
    )
  ).join(',\n')

  const prompt = `Translate Korean sentences from an English learning app into 6 languages.
These are example sentences paired with English originals (not provided here).
Keep translations natural and direct — do NOT over-translate.

CRITICAL RULES:
1. Return ONLY raw JSON — no markdown, no explanation.
2. Escape ALL double quotes inside strings as \\".
3. Keep the same casual, conversational tone as Korean.

Korean sentences to translate:
{
${exampleLines}
}

Return exactly this JSON (replace ... with translations):
{
${template}
}`.trim()

  for (let attempt = 1; attempt <= 2; attempt++) {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
    try {
      const parsed = safeParseJson(raw)
      // Validate all expected keys are present
      for (const p of batch) {
        for (let i = 0; i < p.examples.length; i++) {
          const key = `${p.id}_${i}`
          if (!parsed[key]) throw new Error(`missing key ${key}`)
          for (const lang of LANGS)
            if (!parsed[key][lang]?.trim()) throw new Error(`empty ${key}[${lang}]`)
        }
      }
      return parsed
    } catch (e) {
      if (attempt === 2) throw e
    }
  }
  throw new Error('unreachable')
}

// ── concurrency pool ──────────────────────────────────────────────────────────
async function pool<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>): Promise<void> {
  const iter = items[Symbol.iterator]()
  async function worker() {
    for (let n = iter.next(); !n.done; n = iter.next()) await fn(n.value)
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Batch 2: ${batchPatterns.length} patterns (pt21-1 ~ pt40-5), 5 examples each`)
  console.log(`Total examples: ${batchPatterns.length * 5} × 6 langs\n`)

  // Group into batches of 5 patterns (25 examples per API call)
  const batches = chunk(batchPatterns, 5)
  const raw: Record<string, Record<string, string>> = {}
  const errors: string[] = []

  await pool(batches, 5, async (batch) => {
    const ids = batch.map(p => p.id)
    process.stdout.write(`  ${ids[0]}…${ids[ids.length - 1]} … `)
    try {
      const r = await translateBatch(batch)
      Object.assign(raw, r)
      process.stdout.write('✓\n')
    } catch (e) {
      // Retry each pattern individually
      process.stdout.write('retry… ')
      for (const p of batch) {
        try {
          const r = await translateBatch([p])
          Object.assign(raw, r)
          process.stdout.write(`${p.id}✓ `)
        } catch (e2) {
          const msg = e2 instanceof Error ? e2.message : String(e2)
          errors.push(`${p.id}: ${msg}`)
          process.stdout.write(`${p.id}✗ `)
        }
      }
      process.stdout.write('\n')
    }
  })

  // ── Assemble output ──────────────────────────────────────────────────────
  const output: PatternExampleTranslation[] = batchPatterns.map(p => ({
    patternId: p.id,
    examples: p.examples.map((_, i) => ({
      index: i,
      translations: (raw[`${p.id}_${i}`] ?? {}) as Record<Lang, string>,
    })),
  }))

  const outPath = path.resolve(process.cwd(), 'data/pattern-example-translations-batch2.ts')
  fs.writeFileSync(outPath, `/**
 * Pattern Example translations — Batch 2 (Stories 21–40, pt21-1 ~ pt40-5)
 * 100 patterns × 5 examples × 6 languages (es/ja/zh-CN/zh-TW/fr/de)
 * Auto-generated. DO NOT EDIT MANUALLY.
 */

export type ExampleLang = 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'

export type ExampleTranslation = {
  index: number
  translations: Record<ExampleLang, string>
}

export type PatternExampleTranslation = {
  patternId: string
  examples: ExampleTranslation[]
}

export const patternExampleTranslationsBatch2: PatternExampleTranslation[] = ${JSON.stringify(output, null, 2)}
`, 'utf-8')

  console.log(`\nOutput → data/pattern-example-translations-batch2.ts`)

  // ── Validation ───────────────────────────────────────────────────────────
  console.log('\n══ Validation ══════════════════════════════════════════════')
  console.log(`Pattern count  : ${output.length} / 100 ${output.length === 100 ? '✓' : '✗'}`)

  const wrongCount = output.filter(r => r.examples.length !== 5)
  console.log(`Example count  : ${wrongCount.length === 0 ? '5 per pattern ✓' : `✗ wrong count: ${wrongCount.map(r => r.patternId).join(', ')}`}`)

  let empties = 0
  for (const r of output) {
    for (const ex of r.examples) {
      for (const lang of LANGS) {
        if (!ex.translations[lang]?.trim()) {
          empties++
          console.log(`  ✗ empty: ${r.patternId}[${ex.index}][${lang}]`)
        }
      }
    }
  }

  for (const lang of LANGS) {
    const filled = output.filter(r => r.examples.every(e => e.translations[lang]?.trim())).length
    console.log(`${lang.padEnd(6)}         : ${filled} / 100 ${filled === 100 ? '✓' : '✗'}`)
  }

  console.log(`Empty strings  : ${empties === 0 ? 'none ✓' : `${empties} ✗`}`)

  if (errors.length) console.log(`\nErrors (${errors.length}):\n` + errors.map(e => `  ✗ ${e}`).join('\n'))

  const ok = output.length === 100 && wrongCount.length === 0 && empties === 0 && errors.length === 0
  console.log(`\n${ok ? '✓ All checks passed — batch 1 is ready.' : '✗ Some checks failed.'}`)
}

main().catch(e => { console.error(e); process.exit(1) })
