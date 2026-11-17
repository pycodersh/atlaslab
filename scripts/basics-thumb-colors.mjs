// 실행: node scripts/basics-list-order.mjs 후 node scripts/basics-thumb-colors.mjs → out/remotion/thumb-colors.json 을 videos.json thumb.bg 로 옮긴다
// 목록 순서(3열)에서 같은 배경 3개 연속(가로·세로)을 없애며 배경을 정한다. 기본: Hangul=cream, Grammar=black, 핵심 글 일부 red(15~20%)
import fs from 'node:fs'
const { all, subs } = JSON.parse(fs.readFileSync('out/remotion/list-order.json', 'utf8'))
const hangul = new Set(subs['Hangul & Pronunciation'])
// 핵심 글(빨강 후보) — 섹션의 대표 개념
const KEY = ['korean-never-say-dangsin-neo', 'korean-topic-vs-subject-particle', 'korean-an-vs-mot-negation', 'korean-particles-e-vs-eseo',
  'korean-because-aseo-vs-euni-kka', 'how-to-read-hangul-in-one-day', 'korean-verb-conjugation-ayo-eoyo', 'korean-politeness-levels-explained',
  'korean-past-tense-explained', 'korean-batchim-final-consonants-explained', 'korean-requests-a-eo-juseyo', 'korean-object-particle-eul-reul']
const bg = Object.fromEntries(all.map(s => [s, hangul.has(s) ? 'cream' : 'black']))
const pages = [all.slice(0, 20), all.slice(20)]
const runs = () => {
  const bad = []
  for (const pg of pages) {
    const at = (r, c) => pg[r * 3 + c]
    const rows = Math.ceil(pg.length / 3)
    for (let r = 0; r < rows; r++) { const row = [0, 1, 2].map(c => at(r, c)).filter(Boolean); if (row.length === 3 && row.every(s => bg[s] === bg[row[0]])) bad.push(row) }
    for (let c = 0; c < 3; c++) for (let r = 0; r + 2 < rows; r++) { const col = [0, 1, 2].map(k => at(r + k, c)); if (col.every(Boolean) && col.every(s => bg[s] === bg[col[0]])) bad.push(col) }
  }
  return bad
}
const reds = () => all.filter(s => bg[s] === 'red').length
const ok = s => { const prev = bg[s]; bg[s] = 'red'; const fine = runs().every(run => !run.includes(s) || bg[run[0]] !== 'red'); bg[s] = prev; return fine }
// 1) 핵심 글 중 연속을 깨는 것부터 빨강, 2) 남은 연속은 핵심 글 빨강 → 그래도 남으면 가운데 글을 반대 기본색으로
const breaks = s => runs().filter(r => r.includes(s)).length
for (const s of [...KEY].sort((x, y) => breaks(y) - breaks(x))) { if (reds() >= Math.round(all.length * 0.2)) break; if (all.includes(s) && breaks(s) && ok(s)) bg[s] = 'red' }
for (const s of KEY) { if (reds() >= Math.ceil(all.length * 0.16)) break; if (all.includes(s) && bg[s] !== 'red' && ok(s)) bg[s] = 'red' }
for (let guard = 0; guard < 50 && runs().length; guard++) {
  const run = runs()[0]
  const pick = run.find(s => ok(s) && reds() < Math.round(all.length * 0.2))
  if (pick) { bg[pick] = 'red'; continue }
  const mid = run[1]; bg[mid] = bg[mid] === 'cream' ? 'black' : 'cream'
}
const flipped = all.filter(s => bg[s] !== 'red' && bg[s] !== (hangul.has(s) ? 'cream' : 'black'))
console.log('red', reds(), '/', all.length, `(${Math.round(reds() / all.length * 100)}%)`, 'runs left', runs().length, 'off-default', flipped)
for (const [i, pg] of pages.entries()) { console.log('page', i + 1); for (let r = 0; r < pg.length; r += 3) console.log('  ' + pg.slice(r, r + 3).map(s => bg[s].padEnd(5) + ' ' + s.slice(0, 26).padEnd(26)).join(' | ')) }
fs.writeFileSync('out/remotion/thumb-colors.json', JSON.stringify(bg, null, 1))
