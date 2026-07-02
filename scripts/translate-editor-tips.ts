/**
 * Translate 24 Editor's Tips to 7 languages
 * Source: Korean content in data/editor-notes.ts (ko field)
 * Target langs: en, es, ja, zh-CN, zh-TW, fr, de
 * Output: data/editor-tips-translations.ts
 * Run: npx tsx scripts/translate-editor-tips.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { EDITOR_NOTES } from '../data/editor-notes'

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

type TipLangEntry = {
  title: string
  body: string[]
  researchBriefs: string[]
  oneThingToRemember: string
}

type EditorTipTranslation = {
  noteId: number
  translations: Record<Lang, TipLangEntry>
}

// ── prompt ────────────────────────────────────────────────────────────────────
function buildPrompt(note: (typeof EDITOR_NOTES)[0]): string {
  const koTitle = note.title.ko ?? note.title.en
  const koBody = note.body.ko ?? note.body.en
  const koOneThingToRemember = note.oneThingToRemember.ko ?? note.oneThingToRemember.en
  const researchBriefs = note.research.map(r => r.brief.ko ?? r.brief.en ?? '')

  const bodyJson = JSON.stringify(koBody)
  const briefsJson = JSON.stringify(researchBriefs)
  const langTemplate = (lang: string) =>
    `"${lang}":{"title":"...","body":[${koBody.map(() => '"..."').join(',')}],"researchBriefs":[${researchBriefs.map(() => '"..."').join(',')}],"oneThingToRemember":"..."}`

  return `Translate Korean educational content into 7 languages for an English learning app.

CRITICAL JSON RULES:
1. Return ONLY raw JSON — no markdown fences, no explanation, nothing else.
2. ALL double quotes inside string values MUST be escaped as \\".
3. Use single quotes or rephrase to avoid \\" when possible.
4. Every string must be properly closed.

Editor Tip #${note.id} — Category: ${note.partTitle}

Korean source:
title: ${JSON.stringify(koTitle)}
body: ${bodyJson}
researchBriefs: ${briefsJson}
oneThingToRemember: ${JSON.stringify(koOneThingToRemember)}

Translate all Korean text into each of the 7 languages below.
- "en": translate into natural, clear English
- "es": Spanish
- "ja": Japanese
- "zh-CN": Simplified Chinese
- "zh-TW": Traditional Chinese
- "fr": French
- "de": German

Return exactly this JSON (replace ... with translations):
{${LANGS.map(langTemplate).join(',')}}`.trim()
}

// ── JSON repair + parse ────────────────────────────────────────────────────────
function safeParseJson(raw: string): Record<Lang, TipLangEntry> {
  const block = raw.match(/\{[\s\S]*\}/)
  if (!block) throw new Error('no JSON block found')
  try {
    return JSON.parse(block[0])
  } catch {
    const repaired = block[0].replace(
      /("(?:title|oneThingToRemember|researchBriefs|body)":\s*")([\s\S]*?)("(?:,|\s*\}|\s*\]))/g,
      (_m, prefix: string, content: string, suffix: string) =>
        prefix + content.replace(/(?<!\\)"/g, '\\"') + suffix
    )
    return JSON.parse(repaired)
  }
}

// ── translate one note (with 1 retry) ────────────────────────────────────────
async function translateNote(note: (typeof EDITOR_NOTES)[0]): Promise<EditorTipTranslation> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt(note) }],
    })
    const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
    try {
      const parsed = safeParseJson(raw)
      for (const lang of LANGS) {
        if (!parsed[lang]) throw new Error(`missing lang ${lang}`)
        if (!parsed[lang].title?.trim()) throw new Error(`[${lang}] empty title`)
        if (parsed[lang].body.length !== note.body.en.length)
          throw new Error(`[${lang}] expected ${note.body.en.length} body items, got ${parsed[lang].body.length}`)
        if (parsed[lang].researchBriefs.length !== note.research.length)
          throw new Error(`[${lang}] expected ${note.research.length} briefs, got ${parsed[lang].researchBriefs.length}`)
        if (!parsed[lang].oneThingToRemember?.trim()) throw new Error(`[${lang}] empty oneThingToRemember`)
      }
      return { noteId: note.id, translations: parsed }
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
  console.log(`Translating ${EDITOR_NOTES.length} editor tips — 5 concurrent\n`)

  const results: EditorTipTranslation[] = []
  const errors: { id: number; msg: string }[] = []

  await pool(EDITOR_NOTES, 5, async note => {
    process.stdout.write(`  Tip ${String(note.id).padStart(2)}: "${note.title.ko ?? note.title.en}" … `)
    try {
      results.push(await translateNote(note))
      process.stdout.write('✓\n')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push({ id: note.id, msg })
      process.stdout.write(`✗ ${msg}\n`)
    }
  })

  const sorted = results.sort((a, b) => a.noteId - b.noteId)

  const outPath = path.resolve(process.cwd(), 'data/editor-tips-translations.ts')
  fs.writeFileSync(outPath, `/**
 * Editor's Tips translations — All 24 tips
 * Languages: en, es, ja, zh-CN, zh-TW, fr, de
 * Auto-generated. DO NOT EDIT MANUALLY.
 */

export type TipLang = 'en' | 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'

export type TipLangEntry = {
  title: string
  body: string[]
  researchBriefs: string[]
  oneThingToRemember: string
}

export type EditorTipTranslation = {
  noteId: number
  translations: Record<TipLang, TipLangEntry>
}

export const editorTipTranslations: EditorTipTranslation[] = ${JSON.stringify(sorted, null, 2)}
`, 'utf-8')

  console.log(`\nOutput → data/editor-tips-translations.ts`)

  // ── validation ───────────────────────────────────────────────────────────
  console.log('\n══ Validation ══════════════════════════════════════════════')
  console.log(`Total tips   : ${sorted.length} / 24 ${sorted.length === 24 ? '✓' : '✗ MISMATCH'}`)

  const missing = Array.from({ length: 24 }, (_, i) => i + 1).filter(id => !sorted.find(r => r.noteId === id))
  console.log(`Missing IDs  : ${missing.length === 0 ? 'none ✓' : `✗ ${missing.join(', ')}`}`)

  for (const lang of LANGS) {
    const c = sorted.filter(r => r.translations[lang]?.title?.trim()).length
    console.log(`${lang.padEnd(6)}       : ${c} / 24 ${c === 24 ? '✓' : `✗ MISMATCH`}`)
  }

  let empties = 0
  for (const r of sorted) {
    const note = EDITOR_NOTES.find(n => n.id === r.noteId)!
    for (const lang of LANGS) {
      const e = r.translations[lang]
      if (!e?.title?.trim()) { empties++; console.log(`  ✗ title Tip ${r.noteId} [${lang}]`) }
      if (!e?.oneThingToRemember?.trim()) { empties++; console.log(`  ✗ oneThingToRemember Tip ${r.noteId} [${lang}]`) }
      for (let i = 0; i < e?.body?.length ?? 0; i++)
        if (!e.body[i]?.trim()) { empties++; console.log(`  ✗ body[${i}] Tip ${r.noteId} [${lang}]`) }
      for (let i = 0; i < (note?.research?.length ?? 0); i++)
        if (!e?.researchBriefs?.[i]?.trim()) { empties++; console.log(`  ✗ researchBriefs[${i}] Tip ${r.noteId} [${lang}]`) }
    }
  }
  console.log(`Empty strings: ${empties === 0 ? 'none ✓' : `${empties} found ✗`}`)

  if (errors.length) {
    console.log(`\nErrors (${errors.length}):`)
    errors.forEach(e => console.log(`  ✗ Tip ${e.id}: ${e.msg}`))
  } else {
    console.log('\n✓ All 24 editor tips translated successfully.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
