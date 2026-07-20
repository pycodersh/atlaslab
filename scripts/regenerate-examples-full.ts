/**
 * scripts/regenerate-examples-full.ts
 *
 * pattern-examples.ts 기준으로 pattern-examples-full.ts 재생성.
 * 각 예문에서 패턴 앵커 구문을 자동 추출해 saveCandidates 생성.
 *
 * 실행: npx tsx scripts/regenerate-examples-full.ts [--test] [--all]
 *   --test : pt1-1 ~ pt1-5 (15개 예문)만 실행
 *   --all  : 전체 500패턴 실행
 */

import * as fs from 'fs'
import * as path from 'path'
import { patternExamples } from '../data/pattern-examples'
import { magazineStories } from '../data/magazine-stories'

// ── 타입 정의 ────────────────────────────────────────────────────────────────

type SaveCandidateType =
  | 'phrasalVerb'
  | 'idiom'
  | 'fixedExpression'
  | 'collocation'
  | 'chunk'
  | 'prepPhrase'

type SaveCandidate = {
  text: string
  type: SaveCandidateType
  start: number
  end: number
}

type OutputExample = {
  en: string
  saveCandidates: SaveCandidate[]
}

// ── 알려진 청크 사전 (고빈도 구문) ──────────────────────────────────────────

const KNOWN_CHUNKS: Array<{ text: string; type: SaveCandidateType }> = [
  // Phrasal verbs
  { text: 'pick up',         type: 'phrasalVerb' },
  { text: 'give up',         type: 'phrasalVerb' },
  { text: 'show up',         type: 'phrasalVerb' },
  { text: 'set up',          type: 'phrasalVerb' },
  { text: 'take off',        type: 'phrasalVerb' },
  { text: 'put off',         type: 'phrasalVerb' },
  { text: 'come up with',    type: 'phrasalVerb' },
  { text: 'end up',          type: 'phrasalVerb' },
  { text: 'look into',       type: 'phrasalVerb' },
  { text: 'run out of',      type: 'phrasalVerb' },
  { text: 'check in',        type: 'phrasalVerb' },
  { text: 'check out',       type: 'phrasalVerb' },
  { text: 'hold on',         type: 'phrasalVerb' },
  { text: 'move on',         type: 'phrasalVerb' },
  { text: 'figure out',      type: 'phrasalVerb' },
  { text: 'work out',        type: 'phrasalVerb' },
  { text: 'find out',        type: 'phrasalVerb' },
  { text: 'go through',      type: 'phrasalVerb' },
  { text: 'bring up',        type: 'phrasalVerb' },
  { text: 'look forward to', type: 'phrasalVerb' },
  { text: 'wake up',         type: 'phrasalVerb' },
  { text: 'stay up',         type: 'phrasalVerb' },
  { text: 'drop off',        type: 'phrasalVerb' },
  { text: 'call off',        type: 'phrasalVerb' },
  { text: 'reach out',       type: 'phrasalVerb' },
  { text: 'turn out',        type: 'phrasalVerb' },
  // Collocations
  { text: 'swap shifts',         type: 'collocation' },
  { text: 'boarding pass',       type: 'collocation' },
  { text: 'window seat',         type: 'collocation' },
  { text: 'take a break',        type: 'collocation' },
  { text: 'make a reservation',  type: 'collocation' },
  { text: 'make progress',       type: 'collocation' },
  { text: 'make sense',          type: 'collocation' },
  { text: 'make sure',           type: 'collocation' },
  { text: 'stay positive',       type: 'collocation' },
  { text: 'spare key',           type: 'collocation' },
  { text: 'rush hour',           type: 'collocation' },
  { text: 'pick your brain',     type: 'collocation' },
  { text: 'crash at',            type: 'collocation' },
  { text: 'grab dinner',         type: 'collocation' },
  { text: 'grab coffee',         type: 'collocation' },
  { text: 'take a look',         type: 'collocation' },
  { text: 'keep a journal',      type: 'collocation' },
  { text: 'call a plumber',      type: 'collocation' },
  { text: 'tight deadline',      type: 'collocation' },
  { text: 'free breakfast',      type: 'collocation' },
  { text: 'last minute',         type: 'collocation' },
  // Fixed expressions / idioms
  { text: "I'm not sure",           type: 'fixedExpression' },
  { text: 'to be honest',           type: 'fixedExpression' },
  { text: 'to be fair',             type: 'fixedExpression' },
  { text: 'in case',                type: 'fixedExpression' },
  { text: 'at the same time',       type: 'fixedExpression' },
  { text: 'on the other hand',      type: 'fixedExpression' },
  { text: 'as soon as possible',    type: 'fixedExpression' },
  { text: 'by the time',            type: 'fixedExpression' },
  { text: 'all of a sudden',        type: 'idiom' },
  { text: 'once in a while',        type: 'idiom' },
  { text: 'every now and then',     type: 'idiom' },
  { text: 'at the end of the day',  type: 'idiom' },
  // Prep phrases
  { text: 'at work',          type: 'prepPhrase' },
  { text: 'on time',          type: 'prepPhrase' },
  { text: 'in time',          type: 'prepPhrase' },
  { text: 'on my own',        type: 'prepPhrase' },
  { text: 'on the way',       type: 'prepPhrase' },
  { text: 'at the airport',   type: 'prepPhrase' },
  { text: 'for a second',     type: 'prepPhrase' },
  { text: 'for a while',      type: 'prepPhrase' },
]

// ── 유틸 ─────────────────────────────────────────────────────────────────────

function findCaseInsensitive(sentence: string, phrase: string): number {
  return sentence.toLowerCase().indexOf(phrase.toLowerCase())
}

// 주어 대명사 패턴 (예문에서 패턴 매칭 시 제거)
const SUBJECT_PREFIXES = [
  "I've ", "I'd ", "I'm ", "I'll ", "I ", "You ", "She ", "He ", "We ", "They ",
  "It's ", "There's ", "Let's ", "Let "
]

/** 패턴 텍스트에서 앵커 구문 추출
 *  "I want to ~."        → ["want to"]   (주어 제거 후 ~ 앞 부분)
 *  "I'm thinking about ~ing." → ["thinking about"]
 *  "That's because ~."   → ["That's because"]  (주어 없으면 그대로)
 *  "It turns out ~."     → ["It turns out"]
 *  "~ works for me."     → ["works for me"]   (~ 뒤 부분)
 */
function extractAnchors(patternText: string): string[] {
  // ~ 앞뒤로 분리
  const parts = patternText.split('~')
  const results: string[] = []

  for (let raw of parts) {
    // 구두점 / 공백 제거
    let p = raw.replace(/^[\s,.|]+|[\s,.|]+$/g, '').trim()
    // "ing" suffix 제거 (thinking about ~ing → thinking about)
    p = p.replace(/ing$/, '').trim()
    if (p.length < 3) continue

    // 앞쪽 주어 제거 (주어로 시작하면 제거해야 예문의 다른 주어와도 매칭됨)
    let stripped = p
    for (const prefix of SUBJECT_PREFIXES) {
      if (stripped.startsWith(prefix)) {
        stripped = stripped.slice(prefix.length).trim()
        break
      }
    }
    // 주어 제거 후 3글자 이상이면 stripped 우선
    if (stripped.length >= 3) {
      results.push(stripped)
    } else {
      // 주어 제거 후 너무 짧으면 원문 그대로
      results.push(p)
    }
  }

  return results
}

/** 단일 예문에서 saveCandidates 추출 */
function extractCandidates(
  sentence: string,
  patternAnchors: string[],
): SaveCandidate[] {
  const candidates: SaveCandidate[] = []
  const added = new Set<string>() // 중복 방지 (start-end key)

  function addCandidate(text: string, type: SaveCandidateType, start: number) {
    const end = start + text.length
    const key = `${start}-${end}`
    if (added.has(key)) return
    added.add(key)
    candidates.push({ text, type, start, end })
  }

  // 1. 패턴 앵커 매칭 (가장 중요)
  for (const anchor of patternAnchors) {
    const idx = findCaseInsensitive(sentence, anchor)
    if (idx !== -1) {
      // 실제 문장 텍스트(대소문자 원본) 사용
      const actual = sentence.slice(idx, idx + anchor.length)
      addCandidate(actual, 'chunk', idx)
    }
  }

  // 2. 알려진 청크 사전 매칭
  for (const { text, type } of KNOWN_CHUNKS) {
    const idx = findCaseInsensitive(sentence, text)
    if (idx !== -1) {
      // 패턴 앵커와 겹치는지 확인 (겹치면 스킵)
      const end = idx + text.length
      const overlaps = candidates.some(c => idx < c.end && end > c.start)
      if (!overlaps) {
        const actual = sentence.slice(idx, idx + text.length)
        addCandidate(actual, type, idx)
      }
    }
  }

  // start 순으로 정렬
  candidates.sort((a, b) => a.start - b.start)
  return candidates
}

// ── 메인 로직 ────────────────────────────────────────────────────────────────

function buildPatternTextMap(): Map<string, string> {
  const map = new Map<string, string>()
  for (const story of magazineStories) {
    for (const p of story.patterns) {
      map.set(p.id, p.pattern)
    }
  }
  return map
}

function generate(keys: string[]): Record<string, OutputExample[]> {
  const patternTextMap = buildPatternTextMap()
  const result: Record<string, OutputExample[]> = {}

  let totalGenerated = 0
  let totalWithChunks = 0

  for (const key of keys) {
    const examples = patternExamples[key]
    if (!examples || examples.length === 0) {
      console.warn(`  [WARN] No examples for ${key}`)
      continue
    }

    const patternText = patternTextMap.get(key) ?? ''
    const anchors = extractAnchors(patternText)

    const outputExamples: OutputExample[] = examples.slice(0, 3).map(ex => {
      const candidates = extractCandidates(ex.en, anchors)
      totalGenerated++
      if (candidates.length > 0) totalWithChunks++
      return { en: ex.en, saveCandidates: candidates }
    })

    result[key] = outputExamples
  }

  console.log(`\n  Generated: ${totalGenerated} examples`)
  console.log(`  With chunks: ${totalWithChunks} (${Math.round(totalWithChunks / totalGenerated * 100)}%)`)
  console.log(`  No chunks: ${totalGenerated - totalWithChunks}`)

  return result
}

function renderTs(data: Record<string, OutputExample[]>): string {
  const now = new Date().toISOString().slice(0, 10)
  let out = `// PATTO Pattern Examples Full — regenerated ${now}\n`
  out += `// Generated by scripts/regenerate-examples-full.ts\n\n`
  out += `export type SaveCandidateType =\n`
  out += `  | 'phrasalVerb'\n  | 'idiom'\n  | 'fixedExpression'\n`
  out += `  | 'collocation'\n  | 'chunk'\n  | 'prepPhrase'\n\n`
  out += `export type SaveCandidate = {\n`
  out += `  text: string\n  type: SaveCandidateType\n`
  out += `  start: number\n  end: number\n}\n\n`
  out += `export type PatternExampleSlim = {\n`
  out += `  en: string\n  saveCandidates: SaveCandidate[]\n}\n\n`
  out += `export const patternExamplesFull: Record<string, PatternExampleSlim[]> = {\n`

  for (const [key, examples] of Object.entries(data)) {
    out += `  '${key}': [\n`
    for (const ex of examples) {
      out += `    {\n`
      out += `      en: ${JSON.stringify(ex.en)},\n`
      if (ex.saveCandidates.length === 0) {
        out += `      saveCandidates: [],\n`
      } else {
        out += `      saveCandidates: [\n`
        for (const c of ex.saveCandidates) {
          out += `        { text: ${JSON.stringify(c.text)}, type: '${c.type}', start: ${c.start}, end: ${c.end} },\n`
        }
        out += `      ],\n`
      }
      out += `    },\n`
    }
    out += `  ],\n`
  }

  out += `}\n`
  return out
}

// ── 실행 ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const isTest = args.includes('--test')
const isAll  = args.includes('--all')

if (!isTest && !isAll) {
  console.log('Usage: npx tsx scripts/regenerate-examples-full.ts [--test | --all]')
  console.log('  --test : pt1-1 ~ pt1-5 테스트 실행')
  console.log('  --all  : 전체 500패턴 실행 후 파일 덮어쓰기')
  process.exit(0)
}

const allKeys = Object.keys(patternExamples)
const targetKeys = isTest
  ? ['pt1-1', 'pt1-2', 'pt1-3', 'pt1-4', 'pt1-5']
  : allKeys

console.log(`\n▶ ${isTest ? 'TEST MODE' : 'FULL MODE'} — ${targetKeys.length} patterns`)

const result = generate(targetKeys)

if (isTest) {
  // 테스트: 결과 출력만
  console.log('\n── 테스트 결과 ──────────────────────────────────────')
  for (const [key, examples] of Object.entries(result)) {
    console.log(`\n[${key}]`)
    for (let i = 0; i < examples.length; i++) {
      const ex = examples[i]
      const chunks = ex.saveCandidates.map(c => `"${c.text}"(${c.type})`).join(', ')
      console.log(`  [${i}] ${ex.en}`)
      console.log(`       → ${chunks || '(no chunks)'}`)
    }
  }
} else {
  // 전체: 기존 파일 백업 후 덮어쓰기
  const dataDir  = path.join(process.cwd(), 'data')
  const outPath  = path.join(dataDir, 'pattern-examples-full.ts')
  const bakPath  = path.join(dataDir, 'pattern-examples-full.backup.ts')

  console.log(`\n▶ Backing up to ${bakPath}`)
  fs.copyFileSync(outPath, bakPath)

  const tsContent = renderTs(result)
  fs.writeFileSync(outPath, tsContent, 'utf8')
  console.log(`✅ Written: ${outPath}`)
  console.log(`   Lines: ${tsContent.split('\n').length}`)
}
