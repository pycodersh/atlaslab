/**
 * Essay Review QA Script
 * Usage: node scripts/test-essay-qa.mjs [--lang ko|en] [--url http://localhost:3001]
 *
 * Runs the review API against a test essay with known errors,
 * then reports: detected / expected / missed.
 */

import { readFileSync } from 'fs'

// ── Config ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const lang = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'ko'
const baseUrl = args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://localhost:3001'

// ── Test Essay ───────────────────────────────────────────────────────────────
// Each sentence is annotated with expected errors for QA tracking.
const TEST_ESSAY = `last weekend i go to a english class with my friend.
the weather were very nice and there was many people outside.
i have study english for almost one year but i still feel difficult to speak.
my teacher give me a lot of good advices about learning english.
she said that consistency are more important than talent.
after class we drink two cup of coffee and talk about our future plan.
i was very happy because i didnt met her for almost six months.
when i came back home i watches a movie and write a short diary.
i wants to travel to canada next year because i likes beautiful nature.
if i can speak english more confident i will make many foreign friend.`

// ── Ground Truth ─────────────────────────────────────────────────────────────
// Each entry: { id, sentence (excerpt), errorType, targetWord, description }
// This is the "answer key" — what a perfect reviewer should find.
const EXPECTED_ERRORS = [
  // Sentence 1: "last weekend i go to a english class with my friend."
  { id: 'E01', type: 'capitalization', target: 'last',     desc: 'Sentence must start with capital "Last"' },
  { id: 'E02', type: 'typical',        target: 'i',        desc: 'Lowercase "i" — should be "I" (repeating)' },
  { id: 'E03', type: 'tense',          target: 'go',       desc: 'Past tense "went" required' },
  { id: 'E04', type: 'article',        target: 'a english',desc: '"a" → "an" before vowel sound' },

  // Sentence 2: "the weather were very nice and there was many people outside."
  { id: 'E05', type: 'capitalization', target: 'the',      desc: 'Sentence must start with capital "The"' },
  { id: 'E06', type: 'agreement',      target: 'were',     desc: '"weather were" → "weather was"' },
  { id: 'E07', type: 'agreement',      target: 'was many', desc: '"there was many" → "there were many"' },

  // Sentence 3: "i have study english for almost one year but i still feel difficult to speak."
  { id: 'E08', type: 'verbForm',       target: 'study',    desc: 'Present perfect "have studied"' },
  { id: 'E09', type: 'expression',     target: 'feel difficult to speak', desc: 'Unnatural — "find it hard to speak"' },

  // Sentence 4: "my teacher give me a lot of good advices about learning english."
  { id: 'E10', type: 'tense',          target: 'give',     desc: 'Past tense "gave"' },
  { id: 'E11', type: 'plural',         target: 'advices',  desc: 'Uncountable — "advice" has no plural' },

  // Sentence 5: "she said that consistency are more important than talent."
  { id: 'E12', type: 'agreement',      target: 'are',      desc: '"consistency are" → "consistency is"' },

  // Sentence 6: "after class we drink two cup of coffee and talk about our future plan."
  { id: 'E13', type: 'tense',          target: 'drink',    desc: 'Past tense "drank"' },
  { id: 'E14', type: 'plural',         target: 'two cup',  desc: '"two cup" → "two cups"' },
  { id: 'E15', type: 'tense',          target: 'talk',     desc: 'Past tense "talked"' },

  // Sentence 7: "i was very happy because i didnt met her for almost six months."
  { id: 'E16', type: 'verbForm',       target: 'met',      desc: '"didn\'t met" → "hadn\'t seen"' },

  // Sentence 8: "when i came back home i watches a movie and write a short diary."
  { id: 'E17', type: 'agreement',      target: 'watches',  desc: 'Past tense "watched"' },
  { id: 'E18', type: 'tense',          target: 'write',    desc: 'Past tense "wrote"' },

  // Sentence 9: "i wants to travel to canada next year because i likes beautiful nature."
  { id: 'E19', type: 'agreement',      target: 'wants',    desc: '"I wants" → "I want"' },
  { id: 'E20', type: 'capitalization', target: 'canada',   desc: 'Proper noun — "Canada"' },
  { id: 'E21', type: 'agreement',      target: 'likes',    desc: '"I likes" → "I like"' },

  // Sentence 10: "if i can speak english more confident i will make many foreign friend."
  { id: 'E22', type: 'verbForm',       target: 'confident',desc: 'Adverb "confidently" needed' },
  { id: 'E23', type: 'plural',         target: 'foreign friend', desc: '"foreign friends" (plural)' },
]

const TOTAL_EXPECTED = EXPECTED_ERRORS.length

// ── Call API ─────────────────────────────────────────────────────────────────
console.log(`\n📝 PATTO Essay Review QA`)
console.log(`   Model: gpt-4o-mini  |  Lang: ${lang}  |  Endpoint: ${baseUrl}`)
console.log(`   Expected errors: ${TOTAL_EXPECTED}\n`)
console.log('⏳ Calling review API...\n')

const res = await fetch(`${baseUrl}/api/essays/review`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    essayId: 'qa-test-001',
    essayBody: TEST_ESSAY,
    essayTitle: 'My Weekend English Class',
    language: lang,
    plan: 'free',
  }),
})

if (!res.ok) {
  const err = await res.json().catch(() => ({}))
  console.error('❌ API error:', res.status, err)
  process.exit(1)
}

const { review } = await res.json()
const annotations = review?.annotations ?? []

// ── Match annotations → expected errors ──────────────────────────────────────
function normalize(s) {
  return (s ?? '').toLowerCase().trim()
}

// For each expected error, check if any annotation covers it
const results = EXPECTED_ERRORS.map(expected => {
  const matched = annotations.find(a => {
    const frag = normalize(a.fragment)
    const tgt  = normalize(expected.target)
    // Fragment contains the target word, or target contains the fragment
    const textMatch = frag.includes(tgt) || tgt.includes(frag)
    // Type match — flexible aliases since same error can be labelled differently
    const typeAliases = {
      typical:        ['typical', 'capitalization'],
      capitalization: ['capitalization', 'typical'],
      tense:          ['tense', 'verbForm', 'agreement'],
      verbForm:       ['verbForm', 'tense', 'vocabulary'],
      agreement:      ['agreement', 'tense'],
      plural:         ['plural', 'grammar'],
      expression:     ['expression'],
    }
    const allowedTypes = typeAliases[expected.type] ?? [expected.type, 'grammar']
    const typeMatch = allowedTypes.includes(a.type) || allowedTypes.includes(a.subType) || a.type === 'grammar'
    return textMatch && typeMatch
  })
  return { ...expected, found: Boolean(matched), matchedFragment: matched?.fragment }
})

const found    = results.filter(r => r.found)
const missed   = results.filter(r => !r.found)
const extra    = annotations.filter(a =>
  !results.find(r => r.found && normalize(r.target).includes(normalize(a.fragment)))
)

const pct = Math.round((found.length / TOTAL_EXPECTED) * 100)

// ── Report ────────────────────────────────────────────────────────────────────
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`  Expected errors : ${TOTAL_EXPECTED}`)
console.log(`  Detected        : ${annotations.length} annotations total`)
console.log(`  ✅ Matched      : ${found.length} / ${TOTAL_EXPECTED} (${pct}%)`)
console.log(`  ❌ Missed       : ${missed.length}`)
console.log(`  ℹ️  Extra        : ${extra.length} (valid but not in answer key)`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

if (found.length > 0) {
  console.log('✅ FOUND:')
  found.forEach(r => console.log(`  [${r.id}] ${r.type.padEnd(14)} "${r.target}" → matched as "${r.matchedFragment}"`))
}

if (missed.length > 0) {
  console.log('\n❌ MISSED:')
  missed.forEach(r => console.log(`  [${r.id}] ${r.type.padEnd(14)} "${r.target}" — ${r.desc}`))
}

if (extra.length > 0) {
  console.log('\nℹ️  EXTRA annotations (not in answer key — may still be valid):')
  extra.forEach(a => console.log(`  [${a.type}/${a.subType ?? '-'}] "${a.fragment}" → "${a.replacement ?? ''}"`))
}

console.log(`\n🎯 Coverage: ${pct}% (${found.length}/${TOTAL_EXPECTED})`)

if (pct >= 80) {
  console.log('   ✅ PASS — review quality is acceptable')
} else if (pct >= 60) {
  console.log('   ⚠️  PARTIAL — some important errors missed')
} else {
  console.log('   ❌ FAIL — too many errors missed, prompt needs improvement')
}

console.log(`\n📋 oneLineAdvice: "${review.oneLineAdvice}"`)
console.log(`📋 editorComment: "${review.editorComment}"`)
