/**
 * Patch script — retranslate failed stories from batch 1
 * Failed: 2, 3, 8, 10, 17, 20, 22, 23
 * Merges results into data/story-translations-batch1.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { magazineStories } from '../data/magazine-stories'

// ── Load .env.local ───────────────────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf-8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key) process.env[key] = val
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

const FAILED_IDS = [2, 3, 8, 10, 17, 20, 22, 23]

function buildPrompt(story: (typeof magazineStories)[0]): string {
  const paraList = story.paragraphs
    .map(p => `  - id: "${p.id}"\n    english: ${JSON.stringify(p.english)}`)
    .join('\n')

  return `You are translating content for an English learning app.

CRITICAL JSON RULES:
- Return ONLY valid JSON — no markdown, no code fences, no explanation.
- Inside JSON string values, always escape double quotes as \\" and backslashes as \\\\.
- Use single quotes or rephrase to avoid double quotes inside translation text whenever possible.
- Every string value must be properly terminated.

Translate for Story ${story.id} — "${story.title}":
Subtitle (from Korean: "${story.subtitleKo}") → translate into each language
Story note (from Korean: "${story.storyNote}") → translate into each language
Paragraphs: translate each English text into the target language:
${paraList}

Return this exact JSON structure:
{
  "es": { "subtitle": "...", "storyNote": "...", "paragraphs": [${story.paragraphs.map(p => `{"id":${JSON.stringify(p.id)},"translation":"..."}`).join(',')}] },
  "ja": { "subtitle": "...", "storyNote": "...", "paragraphs": [${story.paragraphs.map(p => `{"id":${JSON.stringify(p.id)},"translation":"..."}`).join(',')}] },
  "zh-CN": { "subtitle": "...", "storyNote": "...", "paragraphs": [${story.paragraphs.map(p => `{"id":${JSON.stringify(p.id)},"translation":"..."}`).join(',')}] },
  "zh-TW": { "subtitle": "...", "storyNote": "...", "paragraphs": [${story.paragraphs.map(p => `{"id":${JSON.stringify(p.id)},"translation":"..."}`).join(',')}] },
  "fr": { "subtitle": "...", "storyNote": "...", "paragraphs": [${story.paragraphs.map(p => `{"id":${JSON.stringify(p.id)},"translation":"..."}`).join(',')}] },
  "de": { "subtitle": "...", "storyNote": "...", "paragraphs": [${story.paragraphs.map(p => `{"id":${JSON.stringify(p.id)},"translation":"..."}`).join(',')}] }
}`
}

async function translateStory(story: (typeof magazineStories)[0]): Promise<StoryTranslation> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: buildPrompt(story) }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON — try direct parse first, then extract block
  let parsed: Record<Lang, StoryLangEntry>
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('no JSON block found')
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    // Attempt to sanitize unescaped double quotes inside strings
    const cleaned = raw.replace(/:\s*"((?:[^"\\]|\\.)*)"/g, (match, inner) => {
      // re-escape any unescaped internal quotes
      const fixed = inner.replace(/(?<!\\)"/g, '\\"')
      return `: "${fixed}"`
    })
    const jsonMatch2 = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch2) throw new Error('no JSON block after cleanup')
    parsed = JSON.parse(jsonMatch2[0])
  }

  for (const lang of LANGS) {
    if (!parsed[lang]) throw new Error(`missing lang "${lang}"`)
    if (parsed[lang].paragraphs.length !== story.paragraphs.length) {
      throw new Error(`[${lang}] expected ${story.paragraphs.length} paras, got ${parsed[lang].paragraphs.length}`)
    }
  }

  return { storyId: story.id, translations: parsed }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function main() {
  // Load existing results
  const existingPath = path.resolve(process.cwd(), 'data/story-translations-batch1.ts')
  const existingContent = fs.readFileSync(existingPath, 'utf-8')
  const existingMatch = existingContent.match(/= (\[[\s\S]*\])/)
  const existing: StoryTranslation[] = existingMatch ? JSON.parse(existingMatch[1]) : []
  console.log(`Existing: ${existing.length} stories loaded`)

  const stories = magazineStories.filter(s => FAILED_IDS.includes(s.id))
  console.log(`Retrying ${stories.length} failed stories: ${FAILED_IDS.join(', ')}\n`)

  const retried: StoryTranslation[] = []
  const errors: string[] = []

  for (const story of stories) {
    process.stdout.write(`  Story ${String(story.id).padStart(2)}: "${story.title}" … `)
    try {
      const result = await translateStory(story)
      retried.push(result)
      console.log('✓')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Story ${story.id}: ${msg}`)
      console.log(`✗ ${msg}`)
    }
    await sleep(800)
  }

  // Merge and sort by storyId
  const merged = [...existing, ...retried].sort((a, b) => a.storyId - b.storyId)

  const fileContent = `/**
 * Story translations — Batch 1 (Stories 1–25)
 * Auto-generated by scripts/translate-stories-batch1.ts + patch
 * Languages: es, ja, zh-CN, zh-TW, fr, de
 * DO NOT EDIT MANUALLY — regenerate if source stories change.
 */

export type Lang = 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'

export type StoryParaTranslation = {
  id: string
  translation: string
}

export type StoryLangEntry = {
  subtitle: string
  storyNote: string
  paragraphs: StoryParaTranslation[]
}

export type StoryTranslation = {
  storyId: number
  translations: Record<Lang, StoryLangEntry>
}

export const storyTranslationsBatch1: StoryTranslation[] = ${JSON.stringify(merged, null, 2)}
`

  fs.writeFileSync(existingPath, fileContent, 'utf-8')
  console.log(`\nOutput written to data/story-translations-batch1.ts`)

  // ── Validation ──────────────────────────────────────────────────────────
  console.log('\n── Validation ───────────────────────────────────────────────')
  const ids = merged.map(r => r.storyId)
  console.log(`Story IDs      : ${ids.join(', ')}`)
  console.log(`Story count    : ${merged.length} / 25 ${merged.length === 25 ? '✓' : '✗ MISMATCH'}`)

  for (const lang of LANGS) {
    const count = merged.filter(r => r.translations[lang]?.paragraphs?.length === 5).length
    console.log(`${lang.padEnd(6)}         : ${count} / 25 ${count === 25 ? '✓' : '✗ MISMATCH'}`)
  }

  let emptyCount = 0
  for (const r of merged) {
    for (const lang of LANGS) {
      const entry = r.translations[lang]
      if (!entry?.subtitle?.trim()) { emptyCount++; console.log(`  ✗ Empty subtitle: Story ${r.storyId} [${lang}]`) }
      if (!entry?.storyNote?.trim()) { emptyCount++; console.log(`  ✗ Empty storyNote: Story ${r.storyId} [${lang}]`) }
      for (const p of entry?.paragraphs ?? []) {
        if (!p.translation?.trim()) { emptyCount++; console.log(`  ✗ Empty para: Story ${r.storyId} [${lang}] ${p.id}`) }
      }
    }
  }
  if (emptyCount === 0) console.log('Empty strings  : none ✓')
  else console.log(`Empty strings  : ${emptyCount} found ✗`)

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`)
    errors.forEach(e => console.log(`  ✗ ${e}`))
  } else {
    console.log('\nAll patch stories translated successfully. ✓')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
