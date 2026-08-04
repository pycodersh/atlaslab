/**
 * kp_expressions_with_examples.json에 episodes 필드 추가
 * 출처: data/kpatto/source/ep_pattern_map.md
 *
 * 규칙:
 * 1. ⚠ 없음 행 무시
 * 2. 같은 EP에 focus+exposure 중복 → focus만 남김
 * 3. 여러 EP에 동일 패턴 → 가장 앞 EP만 focus, 나머지는 exposure
 * 4. episodes 빈 패턴은 그대로 [] 로 두고 목록 보고
 */
const fs = require('fs')
const path = require('path')

const MAP_PATH  = path.resolve(__dirname, '../data/kpatto/source/ep_pattern_map.md')
const EXPR_PATH = path.resolve(__dirname, '../data/kpatto/source/kp_expressions_with_examples.json')
const ARCH_DIR  = path.resolve(__dirname, '../data/kpatto/source/_archive')

// ── 1. ep_pattern_map.md 파싱 ──────────────────────────────────────────────
const mapLines = fs.readFileSync(MAP_PATH, 'utf-8').split('\n')

// rows: { ep, id, role } — ⚠ 없음 제외
const rows = []
for (const line of mapLines) {
  const m = line.match(/\|\s*EP(\d+)\s*\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(focus|exposure)\s*\|/)
  if (!m) continue  // skip header, separator, ⚠ rows
  const ep   = parseInt(m[1])
  const id   = parseInt(m[2])
  const role = m[4]
  rows.push({ ep, id, role })
}

// ── 2. expression_id 기준으로 그룹핑 ──────────────────────────────────────
// Map<id, Map<ep, Set<role>>>
const byId = new Map()
for (const { ep, id, role } of rows) {
  if (!byId.has(id)) byId.set(id, new Map())
  const byEp = byId.get(id)
  if (!byEp.has(ep)) byEp.set(ep, new Set())
  byEp.get(ep).add(role)
}

// ── 3. 규칙 적용 → episodes 배열 생성 ──────────────────────────────────────
// id → [{ ep, role }] (정렬됨)
const episodesMap = new Map()
for (const [id, byEp] of byId) {
  // ep별로 role 결정: focus+exposure → focus
  const epRoles = []
  for (const [ep, roles] of byEp) {
    const role = roles.has('focus') ? 'focus' : 'exposure'
    epRoles.push({ ep, role })
  }
  // ep 순 정렬
  epRoles.sort((a, b) => a.ep - b.ep)

  // 가장 앞 EP 이후는 exposure로 변환
  let focusUsed = false
  for (const item of epRoles) {
    if (item.role === 'focus' && !focusUsed) {
      focusUsed = true
    } else {
      item.role = 'exposure'
    }
  }
  episodesMap.set(id, epRoles)
}

// ── 4. JSON에 episodes 필드 추가 ───────────────────────────────────────────
const data = JSON.parse(fs.readFileSync(EXPR_PATH, 'utf-8'))
const emptyIds = []
let updatedCount = 0

for (const e of data) {
  const episodes = episodesMap.get(e.id) ?? []
  e.episodes = episodes
  if (episodes.length === 0) {
    emptyIds.push(e.id)
  } else {
    updatedCount++
  }
}

fs.writeFileSync(EXPR_PATH, JSON.stringify(data, null, 2), 'utf-8')
console.log(`✓ episodes 필드 추가 완료: ${updatedCount}개 패턴에 배정`)

// ── 5. ep_pattern_map.md → _archive/ 이동 ────────────────────────────────
if (!fs.existsSync(ARCH_DIR)) fs.mkdirSync(ARCH_DIR, { recursive: true })
const archDest = path.join(ARCH_DIR, 'ep_pattern_map.md')
fs.copyFileSync(MAP_PATH, archDest)
fs.unlinkSync(MAP_PATH)
console.log(`✓ ep_pattern_map.md → _archive/ 이동`)

// ── 6. 리포트 ──────────────────────────────────────────────────────────────
// EP별 패턴 수
const epCount = new Map()
for (const [, eps] of episodesMap) {
  for (const { ep, role } of eps) {
    if (!epCount.has(ep)) epCount.set(ep, { focus: 0, exposure: 0 })
    epCount.get(ep)[role]++
  }
}

console.log('\n=== EP별 패턴 수 ===')
const sortedEps = [...epCount.keys()].sort((a, b) => a - b)
for (const ep of sortedEps) {
  const { focus, exposure } = epCount.get(ep)
  console.log(`  EP${String(ep).padStart(2,'0')}: focus=${focus}, exposure=${exposure}, total=${focus+exposure}`)
}

console.log(`\n=== episodes 빈 패턴 (미배정) ===`)
if (emptyIds.length === 0) {
  console.log('  (없음)')
} else {
  console.log(`  ${emptyIds.join(', ')} (${emptyIds.length}건)`)
}
