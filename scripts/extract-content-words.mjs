// Extracts content words from PATTO story/pattern data files.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const STOP = new Set('the a an is it to of in on at be do as by or so if my we he she they you i am are was were has had not but and for with that this from have can will would could should been its our their his her him them out up get got let put set too ago yet nor via per off due few any all own new old big bad one two may say see how who why what when where than then just also even very here there much some more such well good said each both after while about into over back most used come give know like look made make take time only same other does your did use now many way day these those being because before between during every first last long never often since still through under until upon whether'.split(/\s+/))

function extractFields(text, fieldNames) {
  const results = []
  for (const field of fieldNames) {
    // Match field: "..." or field: '...' (allow multiline via [^] but stop at closing quote of same type)
    const dq = new RegExp(`${field}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'g')
    const sq = new RegExp(`${field}\\s*:\\s*'((?:[^'\\\\]|\\\\.)*)'`, 'g')
    let m
    while ((m = dq.exec(text))) results.push(m[1])
    while ((m = sq.exec(text))) results.push(m[1])
  }
  return results
}

const files = [
  { path: join(root, 'data/magazine-stories.ts'), fields: ['english'] },
  { path: join(root, 'data/pattern-examples.ts'), fields: ['en'] },
  { path: join(root, 'data/pattern-examples-full.ts'), fields: ['en'] },
]

const words = new Set()
for (const f of files) {
  const text = readFileSync(f.path, 'utf8')
  const fields = extractFields(text, f.fields)
  for (const s of fields) {
    const tokens = s.toLowerCase().split(/[^a-z]+/)
    for (const t of tokens) {
      if (t.length >= 3 && /^[a-z]+$/.test(t) && !STOP.has(t)) words.add(t)
    }
  }
}

const sorted = [...words].sort()
writeFileSync(join(__dirname, '_content-words.txt'), sorted.join('\n') + '\n', 'utf8')
console.log('Total content words:', sorted.length)
