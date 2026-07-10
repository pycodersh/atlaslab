import fs from 'fs'

const src = fs.readFileSync('./data/magazine-stories.ts', 'utf8')
const idRe = /id:\s*'(p\d+-\d+)'/g
const paragraphs = []
let m
while ((m = idRe.exec(src)) !== null) {
  const id = m[1]
  const after = src.slice(m.index, m.index + 800)
  const dqM = after.match(/english:\s*"([^]*?)",\s*[\n\s]*korean/)
  const sqM = after.match(/english:\s*'([^]*?)',\s*[\n\s]*korean/)
  const raw = dqM ? dqM[1] : sqM ? sqM[1] : null
  if (raw) {
    paragraphs.push({ id, english: raw.replace(/\\"/g, '"').replace(/\\n/g, ' ').trim() })
  }
}
const report = JSON.parse(fs.readFileSync('./scripts/chunk-report.json', 'utf8'))
const uncovered = report.uncoveredIds.slice(0, 80)
for (const id of uncovered) {
  const p = paragraphs.find(x => x.id === id)
  if (p) console.log(id + ': ' + p.english)
}
