/**
 * Extracts all unique phrases from story-chunks.ts and pattern-examples-full.ts
 * Run: node scripts/extract-phrases.mjs
 */
import fs from 'fs'

// --- Parse story-chunks.ts ---
const chunkSrc = fs.readFileSync('./data/story-chunks.ts', 'utf8')
const chunkRe = /\{ text: "([^"]+)", type: '(\w+)'/g
const chunkPhrases = new Map() // text.lower -> {text, type}
let m
while ((m = chunkRe.exec(chunkSrc)) !== null) {
  const key = m[1].toLowerCase()
  if (!chunkPhrases.has(key)) chunkPhrases.set(key, { text: m[1], type: m[2] })
}

// --- Parse pattern-examples-full.ts ---
const patSrc = fs.readFileSync('./data/pattern-examples-full.ts', 'utf8')
const patRe = /\{ text: '([^']+)', type: '(\w+)'/g
while ((m = patRe.exec(patSrc)) !== null) {
  const key = m[1].toLowerCase()
  if (!chunkPhrases.has(key)) chunkPhrases.set(key, { text: m[1], type: m[2] })
}

// Also try double-quote version
const patRe2 = /\{ text: "([^"]+)", type: '(\w+)'/g
while ((m = patRe2.exec(patSrc)) !== null) {
  const key = m[1].toLowerCase()
  if (!chunkPhrases.has(key)) chunkPhrases.set(key, { text: m[1], type: m[2] })
}

// Sort by type then text
const sorted = [...chunkPhrases.values()].sort((a, b) => {
  if (a.type !== b.type) return a.type.localeCompare(b.type)
  return a.text.localeCompare(b.text)
})

console.log(`Total unique phrases: ${sorted.length}`)
console.log('\nBy type:')
const byType = {}
for (const p of sorted) {
  byType[p.type] = (byType[p.type] || 0) + 1
}
for (const [type, count] of Object.entries(byType).sort()) {
  console.log(`  ${type}: ${count}`)
}

// Write to file for review
let out = '// All unique phrases extracted from story-chunks + pattern-examples\n'
out += '// Format: phrase | type\n\n'
for (const { text, type } of sorted) {
  out += `${text.padEnd(50)} | ${type}\n`
}
fs.writeFileSync('./scripts/extracted-phrases.txt', out)
console.log('\nWrote scripts/extracted-phrases.txt')

// Also write as JSON for building dictionary
const json = sorted.map(({ text, type }) => ({ phrase: text, type }))
fs.writeFileSync('./scripts/extracted-phrases.json', JSON.stringify(json, null, 2))
console.log('Wrote scripts/extracted-phrases.json')
