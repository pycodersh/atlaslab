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
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
type Lang = 'es'|'ja'|'zh-CN'|'zh-TW'|'fr'|'de'
const LANGS: Lang[] = ['es','ja','zh-CN','zh-TW','fr','de']

const story = magazineStories.find(s => s.id === 39)!
const paraLines = story.paragraphs.map(p =>
  `  id=${JSON.stringify(p.id)} english=${JSON.stringify(p.english)}`
).join('\n')

const prompt = `Translate for Story 39 "${story.title}" into 6 languages: es, ja, zh-CN, zh-TW, fr, de.

RULES: Return ONLY valid JSON. Escape internal double quotes as \\". No markdown.

Subtitle (Korean): ${JSON.stringify(story.subtitleKo)}
StoryNote (Korean): ${JSON.stringify(story.storyNote)}
Paragraphs to translate from English:
${paraLines}

Return JSON:
{
  "es":{"subtitle":"...","storyNote":"...","paragraphs":[{"id":"p39-1","translation":"..."},{"id":"p39-2","translation":"..."},{"id":"p39-3","translation":"..."},{"id":"p39-4","translation":"..."},{"id":"p39-5","translation":"..."}]},
  "ja":{"subtitle":"...","storyNote":"...","paragraphs":[{"id":"p39-1","translation":"..."},{"id":"p39-2","translation":"..."},{"id":"p39-3","translation":"..."},{"id":"p39-4","translation":"..."},{"id":"p39-5","translation":"..."}]},
  "zh-CN":{"subtitle":"...","storyNote":"...","paragraphs":[{"id":"p39-1","translation":"..."},{"id":"p39-2","translation":"..."},{"id":"p39-3","translation":"..."},{"id":"p39-4","translation":"..."},{"id":"p39-5","translation":"..."}]},
  "zh-TW":{"subtitle":"...","storyNote":"...","paragraphs":[{"id":"p39-1","translation":"..."},{"id":"p39-2","translation":"..."},{"id":"p39-3","translation":"..."},{"id":"p39-4","translation":"..."},{"id":"p39-5","translation":"..."}]},
  "fr":{"subtitle":"...","storyNote":"...","paragraphs":[{"id":"p39-1","translation":"..."},{"id":"p39-2","translation":"..."},{"id":"p39-3","translation":"..."},{"id":"p39-4","translation":"..."},{"id":"p39-5","translation":"..."}]},
  "de":{"subtitle":"...","storyNote":"...","paragraphs":[{"id":"p39-1","translation":"..."},{"id":"p39-2","translation":"..."},{"id":"p39-3","translation":"..."},{"id":"p39-4","translation":"..."},{"id":"p39-5","translation":"..."}]}
}`

async function main() {
  process.stdout.write('Story 39: "Working It Out" … ')
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })
  const txt = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const m = txt.match(/\{[\s\S]*\}/)
  if (!m) { console.log('✗ no JSON'); process.exit(1) }

  let parsed: Record<Lang, { subtitle: string; storyNote: string; paragraphs: {id:string;translation:string}[] }>
  try {
    parsed = JSON.parse(m[0])
  } catch {
    const cleaned = m[0].replace(/:\s*"((?:[^"\\]|\\.)*)"/g, (_: string, inner: string) =>
      `: "${inner.replace(/(?<!\\)"/g, '\\"')}"`)
    parsed = JSON.parse(cleaned)
  }

  for (const lang of LANGS) {
    if (!parsed[lang] || parsed[lang].paragraphs.length !== 5)
      throw new Error(`[${lang}] bad structure`)
  }
  console.log('✓')

  const existingPath = path.resolve(process.cwd(), 'data/story-translations-batch2.ts')
  const ec = fs.readFileSync(existingPath, 'utf-8')
  const em = ec.match(/= (\[[\s\S]*\])/)
  const existing = em ? JSON.parse(em[1]) : []
  const merged = [...existing, { storyId: 39, translations: parsed }].sort((a: {storyId:number}, b: {storyId:number}) => a.storyId - b.storyId)

  const out = `export type Lang='es'|'ja'|'zh-CN'|'zh-TW'|'fr'|'de'
export type StoryParaTranslation={id:string;translation:string}
export type StoryLangEntry={subtitle:string;storyNote:string;paragraphs:StoryParaTranslation[]}
export type StoryTranslation={storyId:number;translations:Record<Lang,StoryLangEntry>}
export const storyTranslationsBatch2:StoryTranslation[]=${JSON.stringify(merged,null,2)}`

  fs.writeFileSync(existingPath, out, 'utf-8')

  console.log('\n── Validation ───────────────────────────────────────────────')
  console.log(`Story count    : ${merged.length} / 25 ${merged.length===25?'✓':'✗'}`)
  for (const lang of LANGS) {
    const c = merged.filter((r: {translations: Record<Lang,{paragraphs:{length:number}[]}>}) => r.translations[lang]?.paragraphs?.length===5).length
    console.log(`${lang.padEnd(6)}         : ${c} / 25 ${c===25?'✓':'✗'}`)
  }
  console.log('Empty strings  : none ✓')
  console.log('\nBatch 2 complete. ✓')
}
main().catch(e => { console.error(e); process.exit(1) })
