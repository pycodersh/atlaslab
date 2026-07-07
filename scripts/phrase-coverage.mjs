import fs from 'fs'

// Count dict entries — use a robust parser for phrases with apostrophes
const dictSrc = fs.readFileSync('./data/patto-phrase-dictionary.ts', 'utf8')
// Match: phrase: 'text' or phrase: "text" (handle escaped chars)
const dictPhrases = new Set()
// Extract all phrase: '...' blocks handling escaped quotes
const lines = dictSrc.split('\n')
for (const line of lines) {
  const m = line.match(/phrase:\s*'((?:[^'\\]|\\.)*)'\s*,/)
    || line.match(/phrase:\s*"((?:[^"\\]|\\.)*)"\s*,/)
  if (m) {
    // Unescape
    const phrase = m[1].replace(/\\'/g, "'").replace(/\\"/g, '"').toLowerCase()
    dictPhrases.add(phrase)
  }
}
console.log('Dict entries:', dictPhrases.size)

// Load all chunks from story-chunks
const chunkSrc = fs.readFileSync('./data/story-chunks.ts', 'utf8')
const chunkPhrases = new Map()
for (const line of chunkSrc.split('\n')) {
  const m = line.match(/\{ text: "((?:[^"\\]|\\.)*)", type: '(\w+)'/)
  if (m) {
    const text = m[1].replace(/\\"/g, '"').toLowerCase()
    if (!chunkPhrases.has(text)) chunkPhrases.set(text, m[2])
  }
}

// Load pattern examples saveCandidates
const patSrc = fs.readFileSync('./data/pattern-examples-full.ts', 'utf8')
const patPhrases = new Map()
for (const line of patSrc.split('\n')) {
  const m = line.match(/\{ text: '((?:[^'\\]|\\.)*)', type: '(\w+)'/)
    || line.match(/\{ text: "((?:[^"\\]|\\.)*)", type: '(\w+)'/)
  if (m) {
    const text = m[1].replace(/\\'/g, "'").replace(/\\"/g, '"').toLowerCase()
    if (!patPhrases.has(text)) patPhrases.set(text, m[2])
  }
}

const allPhrases = new Map([...chunkPhrases, ...patPhrases])
const covered = [...allPhrases.keys()].filter(p => dictPhrases.has(p))
const uncoveredEntries = [...allPhrases.entries()].filter(([p]) => !dictPhrases.has(p))

console.log('Total unique phrases in content:', allPhrases.size)
console.log('Covered:', covered.length)
console.log('Coverage:', Math.round(covered.length / allPhrases.size * 100) + '%')

// Filter out chunk-type sentence starters (I'm, I don't etc) — these are low-value for dictionary
const SKIP_TYPES = new Set(['chunk'])
const meaningfulUncovered = uncoveredEntries.filter(([, t]) => !SKIP_TYPES.has(t))
const meaningfulTotal = [...allPhrases.entries()].filter(([, t]) => !SKIP_TYPES.has(t))
const meaningfulCovered = meaningfulTotal.filter(([p]) => dictPhrases.has(p))

console.log('\n=== Meaningful phrases (excluding chunks) ===')
console.log('Meaningful total:', meaningfulTotal.length)
console.log('Meaningful covered:', meaningfulCovered.length)
console.log('Meaningful coverage:', Math.round(meaningfulCovered.length / meaningfulTotal.length * 100) + '%')

console.log('\nUncovered by type (excluding chunks):')
const byType = {}
for (const [, type] of meaningfulUncovered) byType[type] = (byType[type] || 0) + 1
for (const [type, count] of Object.entries(byType).sort()) {
  console.log(`  ${type}: ${count}`)
}

console.log('\nUncovered meaningful samples (first 30):')
meaningfulUncovered.slice(0, 30).forEach(([p, t]) => console.log(`  [${t}] ${p}`))

// fallback sentence count estimate (covered phrases saved before dictionary update)
console.log('\nNote: Existing localStorage phrases will show dictionary meanings on reload.')
