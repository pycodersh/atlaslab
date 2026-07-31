import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const mdPath = process.argv[2] ?? path.join(os.homedir(), 'Downloads', 'kpatto_scripts_confirmed.md')

if (!fs.existsSync(mdPath)) {
  console.error('파일 없음:', mdPath)
  process.exit(1)
}

const content = fs.readFileSync(mdPath, 'utf-8')

interface PatternEntry {
  pattern: string
  role: 'focus' | 'exposure'
  episodes: number[]
}

// 에피소드별로 파싱
const sections = content.split(/(?=^## EP\d+)/m)

const focusMap = new Map<string, number[]>()   // pattern -> [epNums]
const exposureMap = new Map<string, number[]>()

for (const section of sections) {
  const epMatch = section.match(/^## EP(\d+)/)
  if (!epMatch) continue
  const epNum = parseInt(epMatch[1])

  const focusLine = section.match(/\*\*Focus Pattern:\*\*\s*([^\n]+)/)
  const exposureLine = section.match(/\*\*Exposure Pattern:\*\*\s*([^\n]+)/)

  if (focusLine) {
    const patterns = focusLine[1].split('/').map(p => p.trim()).filter(Boolean)
    for (const p of patterns) {
      if (!focusMap.has(p)) focusMap.set(p, [])
      focusMap.get(p)!.push(epNum)
    }
  }

  if (exposureLine) {
    const patterns = exposureLine[1].split('/').map(p => p.trim()).filter(Boolean)
    for (const p of patterns) {
      if (!exposureMap.has(p)) exposureMap.set(p, [])
      exposureMap.get(p)!.push(epNum)
    }
  }
}

// Focus + Exposure 통합 (같은 패턴이 양쪽에 등장하는 경우 확인)
const allPatterns = new Map<string, { focus: number[]; exposure: number[] }>()

for (const [p, eps] of focusMap) {
  if (!allPatterns.has(p)) allPatterns.set(p, { focus: [], exposure: [] })
  allPatterns.get(p)!.focus = eps
}
for (const [p, eps] of exposureMap) {
  if (!allPatterns.has(p)) allPatterns.set(p, { focus: [], exposure: [] })
  allPatterns.get(p)!.exposure = eps
}

// 총 등장 횟수(Focus+Exposure) 기준 정렬
const sorted = [...allPatterns.entries()].sort((a, b) => {
  const aTotal = a[1].focus.length + a[1].exposure.length
  const bTotal = b[1].focus.length + b[1].exposure.length
  return bTotal - aTotal
})

// 중복 등장 패턴만 추출 (2회 이상)
const repeated = sorted.filter(([, v]) => v.focus.length + v.exposure.length >= 2)
const focusOnly = [...focusMap.entries()].filter(([, eps]) => eps.length === 1)
const exposureOnly = [...exposureMap.entries()].filter(([, eps]) => eps.length === 1)

// ─────────────────────────────────────────────
console.log('='.repeat(70))
console.log('  K-PATTO 패턴 분석 리포트')
console.log('='.repeat(70))
console.log(`\n파싱된 에피소드 수: ${sections.filter(s => /^## EP\d+/.test(s)).length}`)
console.log(`Focus 패턴 종류: ${focusMap.size}`)
console.log(`Exposure 패턴 종류: ${exposureMap.size}`)
console.log(`전체 고유 패턴 수: ${allPatterns.size}`)

console.log('\n' + '─'.repeat(70))
console.log('  [ 2회 이상 등장한 패턴 ] — 재사용·연계 구조')
console.log('─'.repeat(70))

if (repeated.length === 0) {
  console.log('  없음 (모든 패턴이 1회만 등장)')
} else {
  for (const [p, v] of repeated) {
    const total = v.focus.length + v.exposure.length
    const parts: string[] = []
    if (v.focus.length)    parts.push(`Focus: EP${v.focus.join(', EP')}`)
    if (v.exposure.length) parts.push(`Exposure: EP${v.exposure.join(', EP')}`)
    console.log(`  [${total}회] ${p}`)
    console.log(`        ${parts.join(' / ')}`)
  }
}

console.log('\n' + '─'.repeat(70))
console.log('  [ Focus Pattern 전체 목록 ] — 에피소드별')
console.log('─'.repeat(70))

// 에피소드 순서로 출력
const focusByEp = new Map<number, string[]>()
for (const [p, eps] of focusMap) {
  for (const ep of eps) {
    if (!focusByEp.has(ep)) focusByEp.set(ep, [])
    focusByEp.get(ep)!.push(p)
  }
}
for (const ep of [...focusByEp.keys()].sort((a, b) => a - b)) {
  console.log(`  EP${String(ep).padStart(2,'0')}: ${focusByEp.get(ep)!.join(' / ')}`)
}

console.log('\n' + '─'.repeat(70))
console.log('  [ Exposure Pattern 전체 목록 ] — 에피소드별')
console.log('─'.repeat(70))

const exposureByEp = new Map<number, string[]>()
for (const [p, eps] of exposureMap) {
  for (const ep of eps) {
    if (!exposureByEp.has(ep)) exposureByEp.set(ep, [])
    exposureByEp.get(ep)!.push(p)
  }
}
for (const ep of [...exposureByEp.keys()].sort((a, b) => a - b)) {
  console.log(`  EP${String(ep).padStart(2,'0')}: ${exposureByEp.get(ep)!.join(' / ')}`)
}

console.log('\n' + '─'.repeat(70))
console.log('  [ 통계 요약 ]')
console.log('─'.repeat(70))
const totalFocusMentions = [...focusMap.values()].reduce((s, eps) => s + eps.length, 0)
const totalExposureMentions = [...exposureMap.values()].reduce((s, eps) => s + eps.length, 0)
console.log(`  Focus 패턴 총 언급 수: ${totalFocusMentions} (${(totalFocusMentions/100).toFixed(1)}개/ep 평균)`)
console.log(`  Exposure 패턴 총 언급 수: ${totalExposureMentions} (${(totalExposureMentions/100).toFixed(1)}개/ep 평균)`)
console.log(`  중복 등장 패턴: ${repeated.length}개`)
console.log(`  1회만 등장한 패턴: ${allPatterns.size - repeated.length}개`)
console.log('='.repeat(70))
