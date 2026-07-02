/**
 * Merge all 4 batch translation files into data/story-translations.ts
 * Run: npx tsx scripts/merge-story-translations.ts
 */

import fs from 'fs'
import path from 'path'

type Lang = 'es' | 'ja' | 'zh-CN' | 'zh-TW' | 'fr' | 'de'
const LANGS: Lang[] = ['es', 'ja', 'zh-CN', 'zh-TW', 'fr', 'de']
type StoryParaTranslation = { id: string; translation: string }
type StoryLangEntry = { subtitle: string; storyNote: string; paragraphs: StoryParaTranslation[] }
type StoryTranslation = { storyId: number; translations: Record<Lang, StoryLangEntry> }

function loadBatch(filename: string): StoryTranslation[] {
  const content = fs.readFileSync(path.resolve(process.cwd(), `data/${filename}`), 'utf-8')
  // Match the first JSON array in the file
  const match = content.match(/=\s*(\[[\s\S]*\])/)
  if (!match) throw new Error(`Could not parse ${filename}`)
  return JSON.parse(match[1])
}

async function main() {
  console.log('Loading batches…')
  const b1 = loadBatch('story-translations-batch1.ts'); console.log(`  Batch 1: ${b1.length} stories`)
  const b2 = loadBatch('story-translations-batch2.ts'); console.log(`  Batch 2: ${b2.length} stories`)
  const b3 = loadBatch('story-translations-batch3.ts'); console.log(`  Batch 3: ${b3.length} stories`)
  const b4 = loadBatch('story-translations-batch4.ts'); console.log(`  Batch 4: ${b4.length} stories`)

  const all = [...b1, ...b2, ...b3, ...b4].sort((a, b) => a.storyId - b.storyId)

  // Check duplicates
  const ids = all.map(r => r.storyId)
  const unique = new Set(ids)
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)

  const outPath = path.resolve(process.cwd(), 'data/story-translations.ts')
  fs.writeFileSync(outPath, `/**
 * Story translations — All 100 stories (Batches 1–4 merged)
 * Languages: es, ja, zh-CN, zh-TW, fr, de
 * Auto-generated. DO NOT EDIT MANUALLY.
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

export const storyTranslations: StoryTranslation[] = ${JSON.stringify(all, null, 2)}
`, 'utf-8')

  console.log(`\nOutput → data/story-translations.ts`)

  // ── Final validation ──────────────────────────────────────────────────────
  console.log('\n══ Final Validation ════════════════════════════════════════')
  console.log(`Total stories   : ${all.length} / 100 ${all.length === 100 ? '✓' : '✗ MISMATCH'}`)
  console.log(`Story ID range  : ${all[0]?.storyId} – ${all[all.length - 1]?.storyId}`)
  console.log(`Duplicates      : ${duplicates.length === 0 ? 'none ✓' : `✗ ${duplicates.join(', ')}`}`)

  // Check all IDs 1-100 present
  const missing = Array.from({ length: 100 }, (_, i) => i + 1).filter(id => !unique.has(id))
  console.log(`Missing IDs     : ${missing.length === 0 ? 'none ✓' : `✗ ${missing.join(', ')}`}`)

  for (const lang of LANGS) {
    const c = all.filter(r => r.translations[lang]?.paragraphs?.length === 5).length
    console.log(`${lang.padEnd(6)}          : ${c} / 100 ${c === 100 ? '✓' : '✗ MISMATCH'}`)
  }

  let empties = 0
  for (const r of all) for (const lang of LANGS) {
    const e = r.translations[lang]
    if (!e?.subtitle?.trim()) { empties++; console.log(`  ✗ subtitle Story ${r.storyId} [${lang}]`) }
    if (!e?.storyNote?.trim()) { empties++; console.log(`  ✗ storyNote Story ${r.storyId} [${lang}]`) }
    for (const p of e?.paragraphs ?? [])
      if (!p.translation?.trim()) { empties++; console.log(`  ✗ para ${p.id} [${lang}]`) }
  }
  console.log(`Empty strings   : ${empties === 0 ? 'none ✓' : `${empties} found ✗`}`)

  const ok = all.length === 100 && duplicates.length === 0 && missing.length === 0 && empties === 0
    && LANGS.every(l => all.filter(r => r.translations[l]?.paragraphs?.length === 5).length === 100)
  console.log(`\n${ok ? '✓ All checks passed — story-translations.ts is ready.' : '✗ Some checks failed — review above.'}`)
}

main().catch(e => { console.error(e); process.exit(1) })
