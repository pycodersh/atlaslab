import * as fs from 'fs'
import * as path from 'path'

// ── 1. 배분표 파싱 ─────────────────────────────────────────────────────────────
const mapPath = path.resolve(process.cwd(), 'data/kpatto/source/_archive/ep_pattern_map.md')
const mapText = fs.readFileSync(mapPath, 'utf-8')

type MapRow = { ep: number; pattern_ko: string; role: string }
const mapRows: MapRow[] = []

for (const line of mapText.split('\n')) {
  // | EP01 | 771 | ~뭐예요? | focus |  ← valid
  // | EP01 | ⚠ 없음 | ⚠ ~이에요/예요 | exposure |  ← skip
  const m = line.match(/^\|\s*(EP(\d+))\s*\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(\w+)\s*\|/)
  if (!m) continue
  mapRows.push({ ep: parseInt(m[2]), pattern_ko: m[4].trim(), role: m[5].trim() })
}

// ── 2. 스크립트 txt 파싱 ────────────────────────────────────────────────────────
const scriptsDir = path.resolve(process.cwd(), 'data/kpatto/scripts')
const txtFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.txt')).sort()

type ScriptSlot = { ep: number; expression: string }
const scriptSlots: ScriptSlot[] = []

for (const file of txtFiles) {
  const text = fs.readFileSync(path.join(scriptsDir, file), 'utf-8')
  const lines = text.split('\n')
  let currentEp = 0
  for (const line of lines) {
    const epMatch = line.match(/^EP(\d+)/)
    if (epMatch) currentEp = parseInt(epMatch[1])
    const exprMatch = line.match(/▸\s+(.+?)\s+→/)
    if (exprMatch && currentEp > 0)
      scriptSlots.push({ ep: currentEp, expression: exprMatch[1].trim() })
  }
}

// ── 3. 대조 ────────────────────────────────────────────────────────────────────
// 스크립트 슬롯을 "EP:expression" Set으로 만들어 빠르게 조회
const scriptSet = new Set(scriptSlots.map(s => `${s.ep}:${s.expression}`))
// 스크립트 전체 expression 집합 (EP 무관)
const scriptExprAll = new Set(scriptSlots.map(s => s.expression))

// 배분표에 있는데 스크립트에 없는 것
type Missing = { ep: number; pattern_ko: string; role: string; reason: string }
const missing: Missing[] = []

for (const row of mapRows) {
  const key = `${row.ep}:${row.pattern_ko}`
  if (!scriptSet.has(key)) {
    const reason = scriptExprAll.has(row.pattern_ko)
      ? `다른 EP에만 존재 (scripts에 있음)`
      : `스크립트에 없음`
    missing.push({ ...row, reason })
  }
}

// ── 4. 출력 ────────────────────────────────────────────────────────────────────
console.log(`\n=== 배분표 vs 스크립트 대조 ===`)
console.log(`  배분표 유효 슬롯 : ${mapRows.length}`)
console.log(`  스크립트 슬롯    : ${scriptSlots.length}`)
console.log(`  누락 (배분표 O / 스크립트 X): ${missing.length}`)

if (missing.length === 0) {
  console.log('\n  누락 없음 ✓')
} else {
  console.log(`\n  EP  | role     | 표현                          | 비고`)
  console.log(`  ${'─'.repeat(72)}`)
  for (const m of missing.sort((a, b) => a.ep - b.ep || a.pattern_ko.localeCompare(b.pattern_ko)))
    console.log(`  EP${String(m.ep).padStart(2, '0')} | ${m.role.padEnd(8)} | ${m.pattern_ko.padEnd(29)} | ${m.reason}`)
}

// ── 5. 역방향: 스크립트에만 있고 배분표에 없는 것 ────────────────────────────────
const mapSet = new Set(mapRows.map(r => `${r.ep}:${r.pattern_ko}`))
const extraInScript = scriptSlots.filter(s => !mapSet.has(`${s.ep}:${s.expression}`))
console.log(`\n=== 스크립트 O / 배분표 X (총 ${extraInScript.length}건) ===`)
if (extraInScript.length === 0) {
  console.log('  없음 ✓')
} else {
  console.log('  EP  | 표현')
  for (const s of extraInScript.sort((a, b) => a.ep - b.ep))
    console.log(`  EP${String(s.ep).padStart(2, '0')} | ${s.expression}`)
}
