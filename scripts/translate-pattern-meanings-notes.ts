/**
 * Translate Pattern Meanings (500) + Pattern Notes (60) to 7 languages
 * Source: meaningKo in magazine-stories, PATTERN_NOTES in pattern-notes.ts
 * Target: en, es, ja, zh-CN, zh-TW, fr, de
 * Output: data/pattern-meaning-note-translations.ts
 * Run: npx tsx scripts/translate-pattern-meanings-notes.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { magazineStories } from '../data/magazine-stories'
import { PATTERN_NOTES } from '../data/pattern-notes'

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
type Lang = 'en' | 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'
const LANGS: Lang[] = ['en', 'es', 'ja', 'zh-CN', 'zh-TW', 'fr', 'de']

type PatternTranslation = {
  patternId: string
  meaningTranslations: Record<Lang, string>
  noteTranslations?: Record<Lang, string>
}

// ── collect all patterns ──────────────────────────────────────────────────────
type PatternItem = { id: string; meaningKo: string; note: string | null }
const allPatterns: PatternItem[] = magazineStories.flatMap(s =>
  s.patterns.map(p => ({
    id: p.id,
    meaningKo: p.meaningKo,
    note: PATTERN_NOTES[p.id] ?? null,
  }))
)

// ── chunk helper ──────────────────────────────────────────────────────────────
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// ── safe JSON parse ───────────────────────────────────────────────────────────
function safeParseJson(raw: string): Record<string, Record<Lang, string>> {
  const block = raw.match(/\{[\s\S]*\}/)
  if (!block) throw new Error('no JSON block found')
  try {
    return JSON.parse(block[0])
  } catch {
    // Strategy: re-parse string values character by character to fix unescaped quotes
    const text = block[0]
    let result = ''
    let i = 0
    while (i < text.length) {
      // Find a JSON key:value pair where value is a string
      const keyMatch = text.slice(i).match(/^("(?:[^"\\]|\\.)*"\s*:\s*")/)
      if (keyMatch) {
        result += keyMatch[0]
        i += keyMatch[0].length
        // Now scan the string value until we find the closing "
        let value = ''
        while (i < text.length) {
          const ch = text[i]
          if (ch === '\\' && i + 1 < text.length) {
            value += ch + text[i + 1]
            i += 2
          } else if (ch === '"') {
            // Check if this is the closing quote or an unescaped inner quote
            const rest = text.slice(i + 1).trimStart()
            if (rest.startsWith(',') || rest.startsWith('}') || rest.startsWith('\n')) {
              // Closing quote
              result += value + '"'
              i++
              break
            } else {
              // Unescaped inner quote — escape it
              value += '\\"'
              i++
            }
          } else {
            value += ch
            i++
          }
        }
      } else {
        result += text[i]
        i++
      }
    }
    return JSON.parse(result)
  }
}

// ── translate a batch of meanings ─────────────────────────────────────────────
async function translateMeaningBatch(
  batch: PatternItem[]
): Promise<Record<string, Record<Lang, string>>> {
  const itemLines = batch.map(p =>
    `"${p.id}": ${JSON.stringify(p.meaningKo)}`
  ).join('\n')

  const template = batch.map(p =>
    `"${p.id}": {"en":"...","es":"...","ja":"...","zh-CN":"...","zh-TW":"...","fr":"...","de":"..."}`
  ).join(',\n')

  const prompt = `You are translating Korean pattern meanings for an English learning app.
These are very short phrases (2-8 chars Korean), like "~하고 싶어" = "want to ~".
They describe the Korean meaning of English grammar patterns.

CRITICAL RULES:
1. Return ONLY raw JSON — no markdown, no explanation.
2. Escape ALL double quotes inside strings as \\".
3. Keep translations SHORT and NATURAL (match the brevity of the Korean).
4. Do NOT translate the English pattern itself (e.g. "I want to ~") — only the Korean meaning.
5. For English (en): give a short English gloss like "want to ~", "thinking about ~ing".

Korean meanings to translate into 7 languages:
${itemLines}

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
      for (const item of batch) {
        if (!parsed[item.id]) throw new Error(`missing ${item.id}`)
        for (const lang of LANGS)
          if (!parsed[item.id][lang]?.trim()) throw new Error(`empty ${item.id}[${lang}]`)
      }
      return parsed
    } catch (e) {
      if (attempt === 2) throw e
    }
  }
  throw new Error('unreachable')
}

// ── translate a batch of notes ────────────────────────────────────────────────
async function translateNoteBatch(
  batch: PatternItem[]
): Promise<Record<string, Record<Lang, string>>> {
  const itemLines = batch.map(p =>
    `"${p.id}": ${JSON.stringify(p.note)}`
  ).join(',\n')

  const template = batch.map(p =>
    `"${p.id}": {"en":"...","es":"...","ja":"...","zh-CN":"...","zh-TW":"...","fr":"...","de":"..."}`
  ).join(',\n')

  const prompt = `You are translating Korean pattern notes for an English learning app.
These are short nuance/usage notes (2-4 lines) explaining when and how to use English patterns.
The notes mention specific English patterns like "I want to ~", "I'm thinking about ~ing" — keep these in English, do NOT translate them.

CRITICAL RULES:
1. Return ONLY raw JSON — no markdown, no explanation.
2. Escape ALL double quotes inside strings as \\".
3. Preserve newlines as \\n in the JSON strings.
4. Keep the natural, conversational tone of the original.
5. English patterns within the text (e.g. "I want to ~") must stay in English.

Korean notes to translate into 7 languages:
{
${itemLines}
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
      for (const item of batch) {
        if (!parsed[item.id]) throw new Error(`missing ${item.id}`)
        for (const lang of LANGS)
          if (!parsed[item.id][lang]?.trim()) throw new Error(`empty ${item.id}[${lang}]`)
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
  console.log(`Total patterns : ${allPatterns.length}`)
  const patternsWithNotes = allPatterns.filter(p => p.note !== null)
  console.log(`With notes     : ${patternsWithNotes.length}`)
  console.log()

  // ── Step 1: translate meanings (batch 25, concurrency 5) ──────────────────
  console.log('── Step 1: Translating meanings (500 patterns) ──────────────')
  const meaningBatches = chunk(allPatterns, 25)
  const meaningResults: Record<string, Record<Lang, string>> = {}
  const meaningErrors: string[] = []

  await pool(meaningBatches, 5, async (batch) => {
    const ids = batch.map(p => p.id)
    process.stdout.write(`  [meaning] ${ids[0]}…${ids[ids.length - 1]} (${batch.length}) … `)
    try {
      const r = await translateMeaningBatch(batch)
      Object.assign(meaningResults, r)
      process.stdout.write('✓\n')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      meaningErrors.push(`${ids[0]}-${ids[ids.length - 1]}: ${msg}`)
      process.stdout.write(`✗ ${msg}\n`)
    }
  })
  console.log(`\nMeanings done: ${Object.keys(meaningResults).length} / ${allPatterns.length}`)

  // ── Step 2: translate notes (batch 5, concurrency 5) ─────────────────────
  console.log('\n── Step 2: Translating notes (60 patterns) ─────────────────')
  const noteBatches = chunk(patternsWithNotes, 5)
  const noteResults: Record<string, Record<Lang, string>> = {}
  const noteErrors: string[] = []

  await pool(noteBatches, 5, async (batch) => {
    const ids = batch.map(p => p.id)
    process.stdout.write(`  [note] ${ids[0]}…${ids[ids.length - 1]} (${batch.length}) … `)
    try {
      const r = await translateNoteBatch(batch)
      Object.assign(noteResults, r)
      process.stdout.write('✓\n')
    } catch (e) {
      // Batch failed → retry each note individually
      process.stdout.write(`retry individually… `)
      for (const item of batch) {
        try {
          const r = await translateNoteBatch([item])
          Object.assign(noteResults, r)
          process.stdout.write(`${item.id}✓ `)
        } catch (e2) {
          const msg = e2 instanceof Error ? e2.message : String(e2)
          noteErrors.push(`${item.id}: ${msg}`)
          process.stdout.write(`${item.id}✗ `)
        }
      }
      process.stdout.write('\n')
    }
  })
  console.log(`\nNotes done: ${Object.keys(noteResults).length} / ${patternsWithNotes.length}`)

  // ── Step 3: merge into output ─────────────────────────────────────────────
  const output: PatternTranslation[] = allPatterns.map(p => {
    const entry: PatternTranslation = {
      patternId: p.id,
      meaningTranslations: meaningResults[p.id] ?? ({} as Record<Lang, string>),
    }
    if (p.note !== null && noteResults[p.id]) {
      entry.noteTranslations = noteResults[p.id]
    }
    return entry
  })

  const outPath = path.resolve(process.cwd(), 'data/pattern-meaning-note-translations.ts')
  fs.writeFileSync(outPath, `/**
 * Pattern Meaning + Note translations
 * 500 pattern meanings × 7 languages (en/es/ja/zh-CN/zh-TW/fr/de)
 * 60 pattern notes × 7 languages (stories 1-12 only)
 * Auto-generated. DO NOT EDIT MANUALLY.
 */

export type PatternLang = 'en' | 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'

export type PatternTranslation = {
  patternId: string
  meaningTranslations: Record<PatternLang, string>
  noteTranslations?: Record<PatternLang, string>
}

export const patternMeaningNoteTranslations: PatternTranslation[] = ${JSON.stringify(output, null, 2)}
`, 'utf-8')

  console.log(`\nOutput → data/pattern-meaning-note-translations.ts`)

  // ── Validation ─────────────────────────────────────────────────────────────
  console.log('\n══ Validation ══════════════════════════════════════════════')
  const allIds = new Set(allPatterns.map(p => p.id))
  const outputIds = new Set(output.map(r => r.patternId))
  const missingIds = [...allIds].filter(id => !outputIds.has(id))
  console.log(`Pattern count       : ${output.length} / ${allPatterns.length} ${output.length === allPatterns.length ? '✓' : '✗'}`)
  console.log(`Missing IDs         : ${missingIds.length === 0 ? 'none ✓' : `✗ ${missingIds.join(', ')}`}`)

  let meaningEmpties = 0, noteEmpties = 0
  for (const r of output) {
    for (const lang of LANGS) {
      if (!r.meaningTranslations[lang]?.trim()) {
        meaningEmpties++
        console.log(`  ✗ meaning empty: ${r.patternId} [${lang}]`)
      }
    }
    if (r.noteTranslations) {
      for (const lang of LANGS) {
        if (!r.noteTranslations[lang]?.trim()) {
          noteEmpties++
          console.log(`  ✗ note empty: ${r.patternId} [${lang}]`)
        }
      }
    }
  }

  const patternsWithNotesCount = output.filter(r => r.noteTranslations).length
  console.log(`Meanings translated : ${output.filter(r => r.meaningTranslations.en).length} / ${allPatterns.length} ${output.filter(r => r.meaningTranslations.en).length === allPatterns.length ? '✓' : '✗'}`)
  console.log(`Notes translated    : ${patternsWithNotesCount} / ${patternsWithNotes.length} ${patternsWithNotesCount === patternsWithNotes.length ? '✓' : '✗'}`)
  console.log(`Meaning empties     : ${meaningEmpties === 0 ? 'none ✓' : `${meaningEmpties} ✗`}`)
  console.log(`Note empties        : ${noteEmpties === 0 ? 'none ✓' : `${noteEmpties} ✗`}`)

  // Verify pattern text not translated (spot check)
  const samplePatterns = ['I want to ~.', "I'm thinking about ~ing.", 'I should ~.']
  let patternLeaks = 0
  for (const r of output.slice(0, 15)) {
    const orig = allPatterns.find(p => p.id === r.patternId)
    if (!orig) continue
    for (const lang of LANGS) {
      const m = r.meaningTranslations[lang] ?? ''
      if (samplePatterns.some(pt => m.includes(pt))) {
        patternLeaks++
        console.log(`  ⚠ pattern text in meaning: ${r.patternId} [${lang}]: "${m}"`)
      }
    }
  }
  console.log(`Pattern text leaks  : ${patternLeaks === 0 ? 'none ✓' : `${patternLeaks} ✗`}`)

  if (meaningErrors.length) console.log(`\nMeaning errors (${meaningErrors.length}):\n` + meaningErrors.map(e => `  ✗ ${e}`).join('\n'))
  if (noteErrors.length)    console.log(`\nNote errors (${noteErrors.length}):\n`    + noteErrors.map(e => `  ✗ ${e}`).join('\n'))

  const ok = output.length === allPatterns.length && missingIds.length === 0
    && meaningEmpties === 0 && noteEmpties === 0 && patternsWithNotesCount === patternsWithNotes.length
  console.log(`\n${ok ? '✓ All checks passed — pattern-meaning-note-translations.ts is ready.' : '✗ Some checks failed — review above.'}`)
}

main().catch(e => { console.error(e); process.exit(1) })
