/**
 * Upload pattern translations to Supabase
 * - Upserts languages (zh-cn, zh-tw, fr, de)
 * - Upserts pattern_translations (meaning + note) for all 500 patterns
 * - Upserts example_translations for all 2500 examples × 6 languages
 *
 * Prerequisites:
 *   - Run migration 010_pattern_note_column.sql in Supabase first
 *   - SUPABASE_SECRET_KEY must be set in .env.local
 *
 * Run: npx tsx scripts/upload-pattern-translations.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { patternMeaningNoteTranslations } from '../data/pattern-meaning-note-translations'
import { patternExampleTranslationsBatch1 } from '../data/pattern-example-translations-batch1'
import { patternExampleTranslationsBatch2 } from '../data/pattern-example-translations-batch2'
import { patternExampleTranslationsBatch3 } from '../data/pattern-example-translations-batch3'
import { magazineStories } from '../data/magazine-stories'

// patternId → English pattern text
const patternTextMap = Object.fromEntries(
  magazineStories.flatMap(s => s.patterns.map(p => [p.id, p.pattern]))
)

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars not set')

const db = createClient(supabaseUrl, supabaseKey)

// ── constants ─────────────────────────────────────────────────────────────────
// Langs in our translation files (PatternLang)
type PatternLang = 'en' | 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'
const PATTERN_LANGS: PatternLang[] = ['en', 'es', 'ja', 'zh-CN', 'zh-TW', 'fr', 'de']

// Map PatternLang → languages.code in DB (all lowercase)
function toDbLang(lang: PatternLang): string {
  if (lang === 'zh-CN') return 'zh-cn'
  if (lang === 'zh-TW') return 'zh-tw'
  return lang
}

// Map 'pt{s}-{p}' → order_index = (s-1)*5 + p
function patternIdToOrderIndex(id: string): number {
  const m = id.match(/^pt(\d+)-(\d+)$/)
  if (!m) throw new Error(`Invalid pattern ID: ${id}`)
  return (Number(m[1]) - 1) * 5 + Number(m[2])
}

// Merge all example batches into one lookup
const allExTrans = [
  ...patternExampleTranslationsBatch1,
  ...patternExampleTranslationsBatch2,
  ...patternExampleTranslationsBatch3,
]
const exTransByPatternId = Object.fromEntries(allExTrans.map(t => [t.patternId, t]))

// ── Step 1: ensure all languages exist ───────────────────────────────────────
async function ensureLanguages() {
  const langs = [
    { code: 'zh-cn', name: '简体中文' },
    { code: 'zh-tw', name: '繁體中文' },
    { code: 'fr',    name: 'Français' },
    { code: 'de',    name: 'Deutsch'  },
    { code: 'en',    name: 'English'  },
    { code: 'es',    name: 'Español'  },
    { code: 'ja',    name: '日本語'   },
    { code: 'ko',    name: '한국어'   },
  ]
  const { error } = await db.from('languages').upsert(langs, { onConflict: 'code' })
  if (error) throw new Error(`Languages upsert failed: ${error.message}`)
  console.log(`  Languages ensured: ${langs.map(l => l.code).join(', ')}`)
}

// ── Step 2: get pattern UUIDs by order_index ──────────────────────────────────
async function getPatternUuidMap(): Promise<Map<number, string>> {
  const { data, error } = await db
    .from('patterns')
    .select('id, order_index')
    .order('order_index')
  if (error) throw new Error(`Patterns query failed: ${error.message}`)
  const map = new Map<number, string>()
  for (const row of data ?? []) map.set(row.order_index, row.id)
  console.log(`  Pattern UUIDs loaded: ${map.size}`)
  return map
}

// ── Step 3: get example UUIDs by (pattern_id, order_index) ───────────────────
async function getExampleUuidMap(
  patternUuids: string[]
): Promise<Map<string, string>> {
  // Key: `${pattern_id}:${order_index}` → example UUID
  const map = new Map<string, string>()
  // Fetch in chunks of 100
  for (let i = 0; i < patternUuids.length; i += 100) {
    const chunk = patternUuids.slice(i, i + 100)
    const { data, error } = await db
      .from('examples')
      .select('id, pattern_id, order_index')
      .in('pattern_id', chunk)
    if (error) throw new Error(`Examples query failed: ${error.message}`)
    for (const row of data ?? []) map.set(`${row.pattern_id}:${row.order_index}`, row.id)
  }
  console.log(`  Example UUIDs loaded: ${map.size}`)
  return map
}

// ── Step 4: upsert pattern_translations (meaning + note) ──────────────────────
async function upsertPatternTranslations(
  patternUuidMap: Map<number, string>
): Promise<{ inserted: number; skipped: number }> {
  const rows: { pattern_id: string; ui_lang: string; pattern_text: string; meaning: string; note?: string }[] = []
  let skipped = 0

  for (const entry of patternMeaningNoteTranslations) {
    const orderIdx = patternIdToOrderIndex(entry.patternId)
    const patternUuid = patternUuidMap.get(orderIdx)
    if (!patternUuid) { skipped++; continue }

    for (const lang of PATTERN_LANGS) {
      const dbLang = toDbLang(lang)
      const meaning = entry.meaningTranslations[lang]
      if (!meaning?.trim()) continue

      const row: { pattern_id: string; ui_lang: string; pattern_text: string; meaning: string } = {
        pattern_id: patternUuid,
        ui_lang: dbLang,
        pattern_text: patternTextMap[entry.patternId] ?? '',
        meaning,
      }
      rows.push(row)
    }
  }

  // Upsert in chunks of 500
  let totalUpserted = 0
  let upsertErrors = 0
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500)
    const { error } = await db
      .from('pattern_translations')
      .upsert(chunk, { onConflict: 'pattern_id,ui_lang' })
    if (error) {
      console.error(`\n  ✗ pattern_translations chunk ${i}-${i+chunk.length}: ${error.message}`)
      upsertErrors += chunk.length
    } else {
      totalUpserted += chunk.length
    }
    process.stdout.write(`\r  pattern_translations: ${totalUpserted} ok, ${upsertErrors} err / ${rows.length}`)
  }
  console.log()
  return { inserted: totalUpserted, skipped: skipped + upsertErrors }
}

// ── Step 5: upsert example_translations ──────────────────────────────────────
async function upsertExampleTranslations(
  patternUuidMap: Map<number, string>,
  exampleUuidMap: Map<string, string>
): Promise<{ inserted: number; skipped: number }> {
  const rows: { example_id: string; ui_lang: string; translation: string }[] = []
  let skipped = 0

  for (const entry of allExTrans) {
    const orderIdx = patternIdToOrderIndex(entry.patternId)
    const patternUuid = patternUuidMap.get(orderIdx)
    if (!patternUuid) { skipped++; continue }

    for (const ex of entry.examples) {
      const exOrderIndex = ex.index + 1  // DB uses 1-based order_index
      const exampleUuid = exampleUuidMap.get(`${patternUuid}:${exOrderIndex}`)
      if (!exampleUuid) { skipped++; continue }

      for (const lang of (['es', 'ja', 'zh-CN', 'zh-TW', 'fr', 'de'] as PatternLang[])) {
        const dbLang = toDbLang(lang)
        const translation = ex.translations[lang]
        if (!translation?.trim()) continue
        rows.push({ example_id: exampleUuid, ui_lang: dbLang, translation })
      }
    }
  }

  // Upsert in chunks of 500
  let totalUpserted = 0
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500)
    const { error } = await db
      .from('example_translations')
      .upsert(chunk, { onConflict: 'example_id,ui_lang' })
    if (error) throw new Error(`example_translations upsert failed: ${error.message}`)
    totalUpserted += chunk.length
    process.stdout.write(`\r  example_translations: ${totalUpserted} / ${rows.length}`)
  }
  console.log()
  return { inserted: totalUpserted, skipped }
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══ Upload Pattern Translations to Supabase ═══\n')

  // Step 1: languages
  console.log('Step 1: Ensuring language rows…')
  await ensureLanguages()

  // Step 2: pattern UUIDs
  console.log('\nStep 2: Loading pattern UUIDs…')
  const patternUuidMap = await getPatternUuidMap()
  if (patternUuidMap.size === 0) {
    console.error('✗ No patterns found in DB. Run seed scripts first.')
    process.exit(1)
  }

  // Step 3: example UUIDs
  console.log('\nStep 3: Loading example UUIDs…')
  const patternUuids = [...patternUuidMap.values()]
  const exampleUuidMap = await getExampleUuidMap(patternUuids)

  // Step 4: pattern_translations
  console.log('\nStep 4: Upserting pattern_translations (meaning + note)…')
  const ptResult = await upsertPatternTranslations(patternUuidMap)
  console.log(`  Done: ${ptResult.inserted} rows upserted, ${ptResult.skipped} skipped (no UUID)`)

  // Step 5: example_translations
  console.log('\nStep 5: Upserting example_translations…')
  const exResult = await upsertExampleTranslations(patternUuidMap, exampleUuidMap)
  console.log(`  Done: ${exResult.inserted} rows upserted, ${exResult.skipped} skipped`)

  // Summary
  console.log('\n═══ Summary ═══════════════════════════════════')
  console.log(`pattern_translations : ${ptResult.inserted} rows`)
  console.log(`example_translations : ${exResult.inserted} rows`)
  console.log(`Patterns missing UUID: ${ptResult.skipped}`)
  console.log(`Examples missing UUID: ${exResult.skipped}`)
  console.log('\n✓ Upload complete.')
}

main().catch(e => { console.error(e); process.exit(1) })
