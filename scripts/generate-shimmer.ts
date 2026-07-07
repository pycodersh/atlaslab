/**
 * Shimmer TTS Generation Script
 *
 * Generates pattern phrase + example audio using OpenAI TTS (shimmer voice).
 * Uploads to Supabase Storage bucket "audio":
 *   patterns/{patternId}-shimmer.mp3
 *   examples/{exampleId}-shimmer.mp3
 * Writes metadata to data/shimmer-audio-meta.ts (and .json for incremental runs).
 *
 * Usage:
 *   npm run generate-shimmer                                              # all patterns + examples
 *   npm run generate-shimmer -- --pattern pt1-1                          # single pattern
 *   npm run generate-shimmer -- --patterns pt1-1,pt5-3,pt20-2            # multiple patterns (comma-separated)
 *   npm run generate-shimmer -- --patterns-only                          # only pattern phrases
 *   npm run generate-shimmer -- --examples-only                          # only examples
 *   npm run generate-shimmer -- --skip-existing                          # skip already uploaded files
 */

import * as dotenv    from 'dotenv'
import * as path      from 'path'
import * as fs        from 'fs'
import OpenAI         from 'openai'
import { createClient } from '@supabase/supabase-js'
import { magazineStories }    from '../data/magazine-stories'
import { getPatternExamples } from '../data/pattern-examples'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY
const OPENAI_KEY   = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, OPENAI_API_KEY')
  process.exit(1)
}

const BUCKET = 'audio'
const VOICE  = 'shimmer' as const
const MODEL  = 'tts-1'

const openai   = new OpenAI({ apiKey: OPENAI_KEY })
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── CLI flags ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)

// --pattern pt1-1           → single pattern filter
// --patterns pt1-1,pt5-3   → multiple pattern filter (comma-separated)
const patternFilterRaw = args.includes('--pattern')
  ? args[args.indexOf('--pattern') + 1]
  : args.includes('--patterns')
    ? args[args.indexOf('--patterns') + 1]
    : null

const patternFilterSet: Set<string> | null = patternFilterRaw
  ? new Set(patternFilterRaw.split(',').map(s => s.trim()).filter(Boolean))
  : null

const skipExisting = args.includes('--skip-existing')
const patternsOnly = args.includes('--patterns-only')
const examplesOnly = args.includes('--examples-only')

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip tilde notation for clean TTS: "I want to ~" → "I want to" */
function cleanPatternText(pattern: string): string {
  return pattern
    .replace(/\s*~ing\.?/g, '')
    .replace(/\s*~\.?/g, '')
    .trim()
}

/**
 * Estimate MP3 duration from buffer size.
 * OpenAI tts-1 outputs ~24kbps effective MP3 for short sentences.
 */
function estimateDuration(buffer: Buffer): number {
  const BYTES_PER_SEC = 24000 / 8   // 24 kbps
  return Math.round((buffer.byteLength / BYTES_PER_SEC) * 10) / 10
}

/** Generate TTS audio buffer via OpenAI Shimmer */
async function generateAudio(text: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: MODEL,
    voice: VOICE,
    input: text,
    speed: 1.0,
  })
  const ab = await response.arrayBuffer()
  return Buffer.from(ab)
}

/** Upload buffer to Supabase Storage. Returns public URL. */
async function uploadAudio(storagePath: string, buffer: Buffer): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: 'audio/mpeg', upsert: true })
  if (error) throw new Error(`Upload [${storagePath}]: ${error.message}`)
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

/** Check if a file already exists in Supabase Storage */
async function fileExists(storagePath: string): Promise<boolean> {
  const folder = storagePath.split('/').slice(0, -1).join('/')
  const name   = storagePath.split('/').pop()!
  const { data } = await supabase.storage.from(BUCKET).list(folder, { search: name, limit: 1 })
  return (data ?? []).some(f => f.name === name)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Metadata file paths ───────────────────────────────────────────────────────
const JSON_PATH = path.resolve(process.cwd(), 'data/shimmer-audio-meta.json')
const TS_PATH   = path.resolve(process.cwd(), 'data/shimmer-audio-meta.ts')

type AudioMeta = { url: string; duration: number }

const outPatterns: Record<string, AudioMeta> = {}
const outExamples: Record<string, AudioMeta> = {}

// Load previously saved metadata for incremental generation
if (fs.existsSync(JSON_PATH)) {
  const saved = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
  Object.assign(outPatterns, saved.patterns ?? {})
  Object.assign(outExamples, saved.examples ?? {})
}

function saveMetadata() {
  // Save JSON (fast incremental checkpoint)
  fs.writeFileSync(JSON_PATH, JSON.stringify({ patterns: outPatterns, examples: outExamples }, null, 2))

  // Regenerate TypeScript metadata file
  const ts = `/**
 * Shimmer TTS audio metadata — generated by scripts/generate-shimmer.ts
 *
 * Do not edit manually.
 * Run \`npm run generate-shimmer\` to regenerate.
 * Last generated: ${new Date().toISOString()}
 */

export type ShimmerAudioMeta = {
  url:      string   // Supabase public URL
  duration: number   // seconds (estimated from MP3 size)
}

/** Pattern phrase audio — keyed by patternId (e.g., 'pt1-1') */
export const shimmerPatterns: Record<string, ShimmerAudioMeta> = ${JSON.stringify(outPatterns, null, 2)}

/** Example sentence audio — keyed by exampleId (e.g., 'pt1-1-ex1') */
export const shimmerExamples: Record<string, ShimmerAudioMeta> = ${JSON.stringify(outExamples, null, 2)}
`
  fs.writeFileSync(TS_PATH, ts)
  console.log(`  📄 Saved → ${path.basename(TS_PATH)} (${Object.keys(outPatterns).length} patterns, ${Object.keys(outExamples).length} examples)`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎙️  PATTO Shimmer TTS Generation')
  console.log(`   model: ${MODEL}, voice: ${VOICE}`)
  console.log(`   skip-existing: ${skipExisting}, patterns-only: ${patternsOnly}, examples-only: ${examplesOnly}`)
  if (patternFilterSet) console.log(`   filter: ${[...patternFilterSet].join(', ')}`)
  console.log()

  // Collect all patterns
  const allPatterns: { id: string; cleanText: string }[] = []
  for (const story of magazineStories) {
    for (const pat of story.patterns) {
      if (patternFilterSet && !patternFilterSet.has(pat.id)) continue
      allPatterns.push({ id: pat.id, cleanText: cleanPatternText(pat.pattern) })
    }
  }

  let done  = 0
  let error = 0

  // ── 1. Pattern phrases ─────────────────────────────────────────────────────
  if (!examplesOnly) {
    console.log(`🔤 Pattern phrases: ${allPatterns.length} items`)
    for (const { id, cleanText } of allPatterns) {
      const storagePath = `patterns/${id}-shimmer.mp3`

      if (skipExisting && outPatterns[id]) {
        process.stdout.write(`  ↩  ${id}\r`)
        continue
      }

      try {
        if (skipExisting && await fileExists(storagePath)) {
          const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
          outPatterns[id] = { url, duration: outPatterns[id]?.duration ?? 0 }
          process.stdout.write(`  ↩  ${id} (exists)\r`)
          continue
        }

        process.stdout.write(`  🎙  ${id}: "${cleanText.slice(0, 50)}"…\r`)
        const buffer   = await generateAudio(cleanText)
        const url      = await uploadAudio(storagePath, buffer)
        const duration = estimateDuration(buffer)
        outPatterns[id] = { url, duration }
        done++
        console.log(`  ✅ ${id} → ${duration.toFixed(1)}s`)

        if (done % 20 === 0) saveMetadata()
        await sleep(150)   // ~6 req/s — within OpenAI limits
      } catch (err) {
        error++
        console.error(`  ❌ ${id}:`, (err as Error).message)
      }
    }
    saveMetadata()
  }

  // ── 2. Examples (from pattern-examples.ts — same text as displayed in app) ──
  if (!patternsOnly) {
    console.log(`\n📝 Examples`)

    for (const { id: patId } of allPatterns) {
      const exs = getPatternExamples(patId).slice(0, 3)
      for (let i = 0; i < exs.length; i++) {
        const ex          = exs[i]
        const exKey       = `${patId}-ex${i + 1}`    // matches PatternsPageV2 shimmerExId
        const storagePath = `examples/${exKey}-shimmer.mp3`

        if (skipExisting && outExamples[exKey]) {
          process.stdout.write(`  ↩  ${exKey}\r`)
          continue
        }

        try {
          if (skipExisting && await fileExists(storagePath)) {
            const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
            outExamples[exKey] = { url, duration: outExamples[exKey]?.duration ?? 0 }
            continue
          }

          process.stdout.write(`  🎙  ${exKey}: "${ex.en.slice(0, 55)}"…\r`)
          const buffer   = await generateAudio(ex.en)
          const url      = await uploadAudio(storagePath, buffer)
          const duration = estimateDuration(buffer)
          outExamples[exKey] = { url, duration }
          done++
          console.log(`  ✅ ${exKey}: "${ex.en.slice(0, 50)}" → ${duration.toFixed(1)}s`)

          if (done % 30 === 0) saveMetadata()
          await sleep(150)
        } catch (err) {
          error++
          console.error(`  ❌ ${exKey}:`, (err as Error).message)
        }
      }
    }
    saveMetadata()
  }

  console.log(`\n🎉 Done! ${done} generated, ${error} errors.`)
  if (error > 0) process.exit(1)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
