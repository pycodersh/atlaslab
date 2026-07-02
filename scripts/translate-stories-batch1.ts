/**
 * Story translation batch 1 — Stories 1-25
 * Translates subtitle, storyNote, and paragraph text (from English) into 6 languages.
 * Output: data/story-translations-batch1.ts
 *
 * Run: npx tsx scripts/translate-stories-batch1.ts
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

// ── Types ─────────────────────────────────────────────────────────────────────
type Lang = 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'
const LANGS: Lang[] = ['es', 'ja', 'zh-CN', 'zh-TW', 'fr', 'de']

export type StoryParaTranslation = { id: string; translation: string }
export type StoryLangEntry = {
  subtitle: string
  storyNote: string
  paragraphs: StoryParaTranslation[]
}
export type StoryTranslation = {
  storyId: number
  translations: Record<Lang, StoryLangEntry>
}

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildPrompt(story: (typeof magazineStories)[0]): string {
  const paraList = story.paragraphs
    .map(p => `  - id: "${p.id}"\n    english: "${p.english.replace(/"/g, '\\"')}"`)
    .join('\n')

  return `You are translating content for an English learning app. The app teaches English to speakers of other languages, so the translations are used as "meaning explanations" of English text.

Translation rules:
1. Translate naturally — convey meaning and nuance, not word-for-word.
2. Keep magazine/literary style for subtitle and storyNote.
3. Keep paragraph translations clear and readable for language learners.
4. Do NOT add or remove sentences.
5. Preserve any punctuation style from the English original.

Source content for Story ${story.id} — "${story.title}":

Subtitle (Korean original, translate this): "${story.subtitleKo}"
Story note (Korean original, translate this): "${story.storyNote}"

Paragraphs — translate each English text into the target language:
${paraList}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "es": {
    "subtitle": "...",
    "storyNote": "...",
    "paragraphs": [
      { "id": "${story.paragraphs[0].id}", "translation": "..." },
      { "id": "${story.paragraphs[1].id}", "translation": "..." },
      { "id": "${story.paragraphs[2].id}", "translation": "..." },
      { "id": "${story.paragraphs[3].id}", "translation": "..." },
      { "id": "${story.paragraphs[4].id}", "translation": "..." }
    ]
  },
  "ja": { "subtitle": "...", "storyNote": "...", "paragraphs": [...] },
  "zh-CN": { "subtitle": "...", "storyNote": "...", "paragraphs": [...] },
  "zh-TW": { "subtitle": "...", "storyNote": "...", "paragraphs": [...] },
  "fr": { "subtitle": "...", "storyNote": "...", "paragraphs": [...] },
  "de": { "subtitle": "...", "storyNote": "...", "paragraphs": [...] }
}`
}

// ── Translate one story ───────────────────────────────────────────────────────
async function translateStory(story: (typeof magazineStories)[0]): Promise<StoryTranslation> {
  const prompt = buildPrompt(story)

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })
  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Story ${story.id}: no JSON in response`)

  const parsed = JSON.parse(jsonMatch[0]) as Record<Lang, StoryLangEntry>

  // Validate paragraph count
  for (const lang of LANGS) {
    if (!parsed[lang]) throw new Error(`Story ${story.id}: missing lang "${lang}"`)
    if (parsed[lang].paragraphs.length !== story.paragraphs.length) {
      throw new Error(
        `Story ${story.id} [${lang}]: expected ${story.paragraphs.length} paragraphs, got ${parsed[lang].paragraphs.length}`
      )
    }
  }

  return { storyId: story.id, translations: parsed }
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const batch = magazineStories.filter(s => s.id >= 1 && s.id <= 25)
  console.log(`Translating ${batch.length} stories to ${LANGS.length} languages…\n`)

  const results: StoryTranslation[] = []
  const errors: string[] = []

  for (const story of batch) {
    process.stdout.write(`  Story ${String(story.id).padStart(2)}: "${story.title}" … `)
    try {
      const result = await translateStory(story)
      results.push(result)
      console.log('✓')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Story ${story.id}: ${msg}`)
      console.log(`✗ ${msg}`)
    }
    // Brief pause to avoid rate limiting
    if (story.id < 25) await sleep(800)
  }

  // ── Write output file ─────────────────────────────────────────────────────
  const outPath = path.resolve(process.cwd(), 'data/story-translations-batch1.ts')
  const fileContent = `/**
 * Story translations — Batch 1 (Stories 1–25)
 * Auto-generated by scripts/translate-stories-batch1.ts
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

export const storyTranslationsBatch1: StoryTranslation[] = ${JSON.stringify(results, null, 2)}
`
  fs.writeFileSync(outPath, fileContent, 'utf-8')
  console.log(`\nOutput written to data/story-translations-batch1.ts`)

  // ── Validation ────────────────────────────────────────────────────────────
  console.log('\n── Validation ───────────────────────────────────────────────')
  console.log(`Story ID range : ${results.map(r => r.storyId).join(', ')}`)
  console.log(`Story count    : ${results.length} / 25 ${results.length === 25 ? '✓' : '✗ MISMATCH'}`)

  for (const lang of LANGS) {
    const count = results.filter(r => r.translations[lang]?.paragraphs?.length === 5).length
    const label = lang.padEnd(6)
    console.log(`${label}         : ${count} / 25 ${count === 25 ? '✓' : '✗ MISMATCH'}`)
  }

  // Check empty strings
  let emptyCount = 0
  for (const r of results) {
    for (const lang of LANGS) {
      const entry = r.translations[lang]
      if (!entry.subtitle.trim()) { emptyCount++; console.log(`  ✗ Empty subtitle: Story ${r.storyId} [${lang}]`) }
      if (!entry.storyNote.trim()) { emptyCount++; console.log(`  ✗ Empty storyNote: Story ${r.storyId} [${lang}]`) }
      for (const p of entry.paragraphs) {
        if (!p.translation.trim()) { emptyCount++; console.log(`  ✗ Empty para: Story ${r.storyId} [${lang}] ${p.id}`) }
      }
    }
  }
  if (emptyCount === 0) console.log('Empty strings  : none ✓')
  else console.log(`Empty strings  : ${emptyCount} found ✗`)

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`)
    errors.forEach(e => console.log(`  ✗ ${e}`))
  } else {
    console.log('\nAll stories translated successfully. ✓')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
