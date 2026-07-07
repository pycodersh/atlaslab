import fs from 'fs'

// Build phrase dict index
const dictSrc = fs.readFileSync('./data/patto-phrase-dictionary.ts', 'utf8')
const dictIndex = new Map()
for (const line of dictSrc.split('\n')) {
  const m = line.match(/phrase:\s*'([^'\\]*(?:\\.[^'\\]*)*)',\s*meaning:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/)
  if (m) {
    const phrase = m[1].replace(/\\'/g, "'").toLowerCase()
    const meaning = m[2].replace(/\\'/g, "'")
    dictIndex.set(phrase, meaning)
  }
}
console.log('Dict entries:', dictIndex.size)

const irregular = {
  went:'go', came:'come', took:'take', made:'make', gave:'give', got:'get',
  kept:'keep', felt:'feel', found:'find', held:'hold', put:'put', set:'set',
  cut:'cut', ran:'run', sat:'sit', stood:'stand', fell:'fall', broke:'break',
  built:'build', brought:'bring', bought:'buy', caught:'catch', led:'lead',
  left:'leave', lost:'lose', meant:'mean', sent:'send', spent:'spend',
  stuck:'stick', told:'tell', thought:'think', wore:'wear', won:'win',
  wrote:'write', heard:'hear', saw:'see', said:'say', knew:'know',
  grew:'grow', drew:'draw', flew:'fly', lay:'lie', paid:'pay',
  rode:'ride', rose:'rise', drove:'drive', chose:'choose', woke:'wake',
  spoke:'speak', dug:'dig', hung:'hang', lit:'light', swam:'swim',
  sang:'sing', rang:'ring', began:'begin', bore:'bear', blew:'blow',
  forgot:'forget', forgave:'forgive', hid:'hide', hurt:'hurt',
  overcame:'overcome', slept:'sleep', sped:'speed', swept:'sweep',
  swore:'swear', threw:'throw', tore:'tear', understood:'understand',
  withdrew:'withdraw',
}

function lookupPhrase(phrase) {
  const lower = phrase.toLowerCase().trim()
  if (dictIndex.has(lower)) return dictIndex.get(lower)
  const words = lower.split(' ')
  if (words.length < 2) return null
  const first = words[0]
  const rest = words.slice(1)
  const tryWith = (base) => {
    const cand = [base, ...rest].join(' ')
    return dictIndex.has(cand) ? dictIndex.get(cand) : null
  }
  // -ed
  if (first.endsWith('ed') && first.length > 4) {
    const b1 = first.slice(0, -2)
    const b2 = first.slice(0, -1)
    const b3 = (b1.length > 1 && b1[b1.length-1] === b1[b1.length-2]) ? b1.slice(0,-1) : null
    const b4 = b1.endsWith('i') ? b1.slice(0,-1) + 'y' : null
    return tryWith(b1) || tryWith(b2) || (b3 && tryWith(b3)) || (b4 && tryWith(b4)) || null
  }
  // -ing
  if (first.endsWith('ing') && first.length > 4) {
    const b1 = first.slice(0, -3)
    const b2 = first.slice(0, -3) + 'e'
    const b3 = (b1.length > 1 && b1[b1.length-1] === b1[b1.length-2]) ? b1.slice(0,-1) : null
    return tryWith(b1) || tryWith(b2) || (b3 && tryWith(b3)) || null
  }
  // irregular
  if (irregular[first]) return tryWith(irregular[first])
  return null
}

// Collect all non-chunk candidates from story-chunks
const chunkSrc = fs.readFileSync('./data/story-chunks.ts', 'utf8')
const candidates = new Map()
for (const line of chunkSrc.split('\n')) {
  const m = line.match(/\{ text: "([^"]+)", type: '(\w+)'/)
  if (m && m[2] !== 'chunk') {
    const key = m[1].toLowerCase()
    if (!candidates.has(key)) candidates.set(key, { text: m[1], type: m[2] })
  }
}
const patSrc = fs.readFileSync('./data/pattern-examples-full.ts', 'utf8')
const rePatSingle = /\{ text: '((?:[^'\\]|\\.)*)', type: '(\w+)'/g
let mm
while ((mm = rePatSingle.exec(patSrc)) !== null) {
  if (mm[2] !== 'chunk') {
    const txt = mm[1].replace(/\\'/g, "'")
    const key = txt.toLowerCase()
    if (!candidates.has(key)) candidates.set(key, { text: txt, type: mm[2] })
  }
}

console.log('Total candidates (non-chunk):', candidates.size)

const missing = []
for (const [, {text, type}] of candidates) {
  if (!lookupPhrase(text)) missing.push({ text, type })
}

console.log('Truly missing (after normalization fix):', missing.length)
const byType = {}
for (const {text, type} of missing) {
  if (!byType[type]) byType[type] = []
  byType[type].push(text)
}
for (const [type, list] of Object.entries(byType).sort()) {
  console.log('\n' + type + ' (' + list.length + '):')
  list.forEach(t => console.log('  ' + t))
}
fs.writeFileSync('./scripts/truly-missing-phrases.json', JSON.stringify(missing, null, 2))
console.log('\nWrote scripts/truly-missing-phrases.json')
