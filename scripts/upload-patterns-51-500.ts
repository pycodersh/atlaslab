/**
 * Upload patterns 51-500 (stories 11-100) to Supabase
 * Inserts: patterns, pattern_translations (EN + KO + all langs), examples, example_translations (KO)
 *
 * Run: npx tsx scripts/upload-patterns-51-500.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { magazineStories } from '../data/magazine-stories'
import { patternMeaningNoteTranslations } from '../data/pattern-meaning-note-translations'

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf-8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 0) continue
    process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars not set')

const db = createClient(supabaseUrl, supabaseKey)

function patternIdToOrderIndex(id: string): number {
  const m = id.match(/^pt(\d+)-(\d+)$/)
  if (!m) throw new Error(`Invalid pattern ID: ${id}`)
  return (Number(m[1]) - 1) * 5 + Number(m[2])
}

// Build meaning lookup: patternId → { en, ko, es, ja, ... }
const meaningMap = new Map(
  patternMeaningNoteTranslations.map(t => [t.patternId, t.meaningTranslations])
)

async function main() {
  console.log('═══ Upload Patterns 51-500 to Supabase ═══\n')

  // Get language_id for EN
  const { data: langRow, error: langErr } = await db
    .from('languages')
    .select('id')
    .eq('code', 'en')
    .single()
  if (langErr || !langRow) throw new Error('English language not found in DB')
  const langEnId = langRow.id

  // Filter stories 11-100
  const targetStories = magazineStories.filter(s => s.id >= 11 && s.id <= 100)
  console.log(`Found ${targetStories.length} stories (11-100)`)

  let patternsInserted = 0
  let translationsInserted = 0
  let examplesInserted = 0
  let exTransInserted = 0
  const failures: string[] = []

  for (const story of targetStories) {
    if (!story.patterns || story.patterns.length === 0) {
      console.log(`  Story ${story.id}: no patterns, skipping`)
      continue
    }

    for (const pat of story.patterns) {
      const orderIndex = patternIdToOrderIndex(pat.id)

      // ── 1. Get or insert pattern row ──────────────────────────────────────
      let patternUuid: string

      const { data: existing } = await db
        .from('patterns')
        .select('id')
        .eq('language_id', langEnId)
        .eq('order_index', orderIndex)
        .maybeSingle()

      if (existing) {
        patternUuid = existing.id
      } else {
        const { data: patRow, error: patErr } = await db
          .from('patterns')
          .insert({
            language_id: langEnId,
            level: 1,
            order_index: orderIndex,
            is_published: true,
          })
          .select('id')
          .single()

        if (patErr || !patRow) {
          failures.push(`[${pat.id}] pattern insert failed: ${patErr?.message}`)
          continue
        }
        patternUuid = patRow.id
        patternsInserted++
      }

      // ── 2. Insert pattern_translations ────────────────────────────────────
      const meanings = meaningMap.get(pat.id)
      const translationRows = [
        // EN
        {
          pattern_id: patternUuid,
          ui_lang: 'en',
          pattern_text: pat.pattern,
          meaning: meanings?.en || pat.pattern,
        },
        // KO
        {
          pattern_id: patternUuid,
          ui_lang: 'ko',
          pattern_text: pat.pattern,
          meaning: pat.meaningKo,
        },
      ]

      // Add other languages if available
      const otherLangs = ['es', 'ja', 'zh-CN', 'zh-TW', 'fr', 'de'] as const
      for (const lang of otherLangs) {
        const dbLang = lang.toLowerCase().replace('-', '-')
        const m = meanings?.[lang]
        if (m?.trim()) {
          translationRows.push({
            pattern_id: patternUuid,
            ui_lang: lang === 'zh-CN' ? 'zh-cn' : lang === 'zh-TW' ? 'zh-tw' : lang,
            pattern_text: pat.pattern,
            meaning: m,
          })
        }
      }

      const { error: transErr } = await db
        .from('pattern_translations')
        .upsert(translationRows, { onConflict: 'pattern_id,ui_lang' })

      if (transErr) {
        failures.push(`[${pat.id}] pattern_translations failed: ${transErr.message}`)
      } else {
        translationsInserted += translationRows.length
      }

      // ── 3. Insert examples ────────────────────────────────────────────────
      // Use storySentence + variationSentence as normal examples 1 & 2
      // Use pat.examples[] if present as additional examples
      const exampleRows: { pattern_id: string; difficulty: string; order_index: number; sentence: string }[] = [
        { pattern_id: patternUuid, difficulty: 'normal', order_index: 1, sentence: pat.storySentence },
        { pattern_id: patternUuid, difficulty: 'normal', order_index: 2, sentence: pat.variationSentence },
      ]

      if (pat.examples && pat.examples.length > 0) {
        pat.examples.forEach((ex, i) => {
          exampleRows.push({
            pattern_id: patternUuid,
            difficulty: 'normal',
            order_index: i + 3,
            sentence: ex.en,
          })
        })
      }

      const { data: insertedExamples, error: exErr } = await db
        .from('examples')
        .upsert(exampleRows, { onConflict: 'pattern_id,difficulty,order_index' })
        .select('id, order_index')

      if (exErr) {
        failures.push(`[${pat.id}] examples failed: ${exErr.message}`)
        continue
      }
      examplesInserted += exampleRows.length

      // ── 4. Insert example_translations (KO) ──────────────────────────────
      if (!insertedExamples || insertedExamples.length === 0) continue

      const koSentences: Record<number, string> = {
        1: pat.storySentenceKo,
        2: pat.variationSentenceKo,
      }
      if (pat.examples) {
        pat.examples.forEach((ex, i) => {
          koSentences[i + 3] = ex.ko
        })
      }

      const exTransRows = insertedExamples
        .filter(ex => koSentences[ex.order_index])
        .map(ex => ({
          example_id: ex.id,
          ui_lang: 'ko',
          translation: koSentences[ex.order_index],
        }))

      if (exTransRows.length > 0) {
        const { error: exTransErr } = await db
          .from('example_translations')
          .upsert(exTransRows, { onConflict: 'example_id,ui_lang' })

        if (exTransErr) {
          failures.push(`[${pat.id}] example_translations failed: ${exTransErr.message}`)
        } else {
          exTransInserted += exTransRows.length
        }
      }

      process.stdout.write(`\r  Progress: pattern ${orderIndex}/500`)
    }
  }

  console.log('\n\n═══ Summary ═══════════════════════════════════')
  console.log(`patterns            : ${patternsInserted}`)
  console.log(`pattern_translations: ${translationsInserted}`)
  console.log(`examples            : ${examplesInserted}`)
  console.log(`example_translations: ${exTransInserted}`)
  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`)
    failures.forEach(f => console.log('  -', f))
  } else {
    console.log('\n✓ No failures.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
