/**
 * Story translation batch 4 — Stories 76-100
 * Parallel (5 concurrent) + auto-retry on JSON parse failure
 * Output: data/story-translations-batch4.ts
 * Run: npx tsx scripts/translate-stories-batch4.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { magazineStories } from '../data/magazine-stories'

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

type Lang = 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'
const LANGS: Lang[] = ['es', 'ja', 'zh-CN', 'zh-TW', 'fr', 'de']
type StoryParaTranslation = { id: string; translation: string }
type StoryLangEntry = { subtitle: string; storyNote: string; paragraphs: StoryParaTranslation[] }
type StoryTranslation = { storyId: number; translations: Record<Lang, StoryLangEntry> }

function buildPrompt(story: (typeof magazineStories)[0]): string {
  const ids = story.paragraphs.map(p => p.id)
  const paraLines = story.paragraphs.map(p => `  ${p.id}: ${JSON.stringify(p.english)}`).join('\n')
  const paraTemplate = ids.map(id => `{"id":${JSON.stringify(id)},"translation":"..."}`).join(',')
  return `Translate English learning app content into 6 languages.

CRITICAL JSON RULES:
1. Return ONLY raw JSON. No markdown, no explanation.
2. Escape ALL double quotes inside string values as \\".
3. Use single quotes or rephrase to avoid \\" escaping when possible.
4. Every string must be properly closed.

Story ${story.id} — "${story.title}"
Subtitle (translate from Korean: ${JSON.stringify(story.subtitleKo)})
Story note (translate from Korean: ${JSON.stringify(story.storyNote)})
Paragraphs — translate each English into the target language:
${paraLines}

Exact JSON to return:
{"es":{"subtitle":"...","storyNote":"...","paragraphs":[${paraTemplate}]},"ja":{"subtitle":"...","storyNote":"...","paragraphs":[${paraTemplate}]},"zh-CN":{"subtitle":"...","storyNote":"...","paragraphs":[${paraTemplate}]},"zh-TW":{"subtitle":"...","storyNote":"...","paragraphs":[${paraTemplate}]},"fr":{"subtitle":"...","storyNote":"...","paragraphs":[${paraTemplate}]},"de":{"subtitle":"...","storyNote":"...","paragraphs":[${paraTemplate}]}}`
}

function safeParseJson(raw: string): Record<Lang, StoryLangEntry> {
  const block = raw.match(/\{[\s\S]*\}/)
  if (!block) throw new Error('no JSON block found')
  try { return JSON.parse(block[0]) } catch {
    const repaired = block[0].replace(
      /("(?:subtitle|storyNote|translation)":\s*")([\s\S]*?)("(?:,|\s*\}|\s*\]))/g,
      (_m, prefix: string, content: string, suffix: string) =>
        prefix + content.replace(/(?<!\\)"/g, '\\"') + suffix
    )
    return JSON.parse(repaired)
  }
}

async function translateStory(story: (typeof magazineStories)[0]): Promise<StoryTranslation> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt(story) }],
    })
    const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
    try {
      const parsed = safeParseJson(raw)
      for (const lang of LANGS) {
        if (!parsed[lang]) throw new Error(`missing lang ${lang}`)
        if (parsed[lang].paragraphs.length !== story.paragraphs.length)
          throw new Error(`[${lang}] expected ${story.paragraphs.length} paras, got ${parsed[lang].paragraphs.length}`)
      }
      return { storyId: story.id, translations: parsed }
    } catch (e) { if (attempt === 2) throw e }
  }
  throw new Error('unreachable')
}

async function pool<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>) {
  const iter = items[Symbol.iterator]()
  async function worker() {
    for (let n = iter.next(); !n.done; n = iter.next()) await fn(n.value)
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
}

async function main() {
  const batch = magazineStories.filter(s => s.id >= 76 && s.id <= 100)
  console.log(`Translating ${batch.length} stories (76–100) — 5 concurrent\n`)

  const results: StoryTranslation[] = []
  const errors: { id: number; msg: string }[] = []

  await pool(batch, 5, async story => {
    process.stdout.write(`  Story ${String(story.id).padStart(3)}: "${story.title}" … `)
    try {
      results.push(await translateStory(story))
      process.stdout.write('✓\n')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push({ id: story.id, msg })
      process.stdout.write(`✗ ${msg}\n`)
    }
  })

  const sorted = results.sort((a, b) => a.storyId - b.storyId)

  const outPath = path.resolve(process.cwd(), 'data/story-translations-batch4.ts')
  fs.writeFileSync(outPath, `/**
 * Story translations — Batch 4 (Stories 76–100)
 * Auto-generated. DO NOT EDIT MANUALLY.
 * Languages: es, ja, zh-CN, zh-TW, fr, de
 */

export type Lang = 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'
export type StoryParaTranslation = { id: string; translation: string }
export type StoryLangEntry = { subtitle: string; storyNote: string; paragraphs: StoryParaTranslation[] }
export type StoryTranslation = { storyId: number; translations: Record<Lang, StoryLangEntry> }

export const storyTranslationsBatch4: StoryTranslation[] = ${JSON.stringify(sorted, null, 2)}
`, 'utf-8')
  console.log(`\nOutput → data/story-translations-batch4.ts`)

  console.log('\n── Batch 4 Validation ───────────────────────────────────────')
  console.log(`Story IDs   : ${sorted.map(r => r.storyId).join(', ')}`)
  console.log(`Story count : ${sorted.length} / 25 ${sorted.length === 25 ? '✓' : '✗ MISMATCH'}`)
  for (const lang of LANGS) {
    const c = sorted.filter(r => r.translations[lang]?.paragraphs?.length === 5).length
    console.log(`${lang.padEnd(6)}      : ${c} / 25 ${c === 25 ? '✓' : '✗ MISMATCH'}`)
  }
  let empties = 0
  for (const r of sorted) for (const lang of LANGS) {
    const e = r.translations[lang]
    if (!e?.subtitle?.trim()) { empties++; console.log(`  ✗ subtitle Story ${r.storyId} [${lang}]`) }
    if (!e?.storyNote?.trim()) { empties++; console.log(`  ✗ storyNote Story ${r.storyId} [${lang}]`) }
    for (const p of e?.paragraphs ?? [])
      if (!p.translation?.trim()) { empties++; console.log(`  ✗ para ${p.id} [${lang}]`) }
  }
  if (empties === 0) console.log('Empty strings : none ✓')
  if (errors.length) { console.log(`\nErrors (${errors.length}):`); errors.forEach(e => console.log(`  ✗ Story ${e.id}: ${e.msg}`)) }
  else console.log('\nBatch 4: All 25 stories translated successfully. ✓')
}

main().catch(e => { console.error(e); process.exit(1) })
