/**
 * kpatto_scripts_final.md + kp_expressions_with_examples.json
 * → data/kpatto/source/ep_pattern_map.md 생성
 */
const fs = require('fs')
const path = require('path')

const MD_PATH = path.resolve(__dirname, '../data/kpatto/source/kpatto_scripts_final.md')
const EXPR_PATH = path.resolve(__dirname, '../data/kpatto/source/kp_expressions_with_examples.json')
const OUT_PATH = path.resolve(__dirname, '../data/kpatto/source/ep_pattern_map.md')

const expressions = require(EXPR_PATH)

// pattern_ko → { id, pattern_ko } 룩업 (정규화 포함)
function buildExprMap(exprs) {
  const map = new Map()
  for (const e of exprs) {
    const ko = e.pattern_ko.trim()
    map.set(ko, e)
    // ~ 없앤 버전도 등록
    const bare = ko.replace(/~/g, '').trim()
    if (!map.has(bare)) map.set(bare, e)
  }
  return map
}

function findExpr(raw, exprMap, exprs) {
  const t = raw.trim()
  // 1. 직접 일치
  if (exprMap.has(t)) return exprMap.get(t)
  // 2. ~ 없앤 버전으로 일치
  const bare = t.replace(/~/g, '').trim()
  if (exprMap.has(bare)) return exprMap.get(bare)
  // 3. 슬래시 대안 — 앞쪽 토큰만 시도
  if (t.includes('/')) {
    const first = t.split('/')[0].replace(/~/g, '').trim()
    if (exprMap.has('~' + first)) return exprMap.get('~' + first)
    if (exprMap.has(first)) return exprMap.get(first)
  }
  // 4. 부분 포함 (느슨한 매칭)
  for (const e of exprs) {
    const ek = e.pattern_ko.replace(/~/g, '').trim()
    if (ek === bare) return e
  }
  return null
}

// kpatto_scripts_final.md 파싱
function parseScript(mdPath) {
  const text = fs.readFileSync(mdPath, 'utf-8')
  const lines = text.split('\n')
  const result = new Map() // epNum → { focus: [{raw, expr}], exposure: [{raw, expr}] }

  let curEp = 0
  const exprMap = buildExprMap(expressions)

  for (const line of lines) {
    const t = line.trim()
    const epMatch = t.match(/^## EP(\d+)/)
    if (epMatch) { curEp = parseInt(epMatch[1]); continue }

    const focusMatch = t.match(/^\*\*Focus Pattern:\*\*\s*(.+)/)
    if (focusMatch && curEp > 0) {
      if (!result.has(curEp)) result.set(curEp, { focus: [], exposure: [] })
      const raws = focusMatch[1].split(' / ').map(s => s.trim()).filter(Boolean)
      for (const raw of raws) {
        const expr = findExpr(raw, exprMap, expressions)
        result.get(curEp).focus.push({ raw, expr })
      }
      continue
    }

    const expMatch = t.match(/^\*\*Exposure Pattern:\*\*\s*(.+)/)
    if (expMatch && curEp > 0) {
      if (!result.has(curEp)) result.set(curEp, { focus: [], exposure: [] })
      const raws = expMatch[1].split(' / ').map(s => s.trim()).filter(Boolean)
      for (const raw of raws) {
        const expr = findExpr(raw, exprMap, expressions)
        result.get(curEp).exposure.push({ raw, expr })
      }
    }
  }
  return result
}

function main() {
  const epMap = parseScript(MD_PATH)

  // ─── ep_pattern_map.md 생성 ───
  const rows = []
  for (const [epNum, { focus, exposure }] of [...epMap.entries()].sort((a,b) => a[0]-b[0])) {
    const ep = String(epNum).padStart(2, '0')
    for (const { raw, expr } of focus) {
      rows.push({ ep: epNum, epStr: ep, id: expr?.id ?? null, pattern: expr?.pattern_ko ?? raw, rawPattern: raw, role: 'focus', hasExpr: !!expr })
    }
    for (const { raw, expr } of exposure) {
      rows.push({ ep: epNum, epStr: ep, id: expr?.id ?? null, pattern: expr?.pattern_ko ?? raw, rawPattern: raw, role: 'exposure', hasExpr: !!expr })
    }
  }

  const lines = [
    '# EP 패턴 배정표',
    '',
    '> 출처: kpatto_scripts_final.md × kp_expressions_with_examples.json',
    `> 생성: ${new Date().toISOString().slice(0,10)}`,
    '',
    '| EP | expression_id | pattern_ko | role |',
    '|---|---|---|---|',
  ]
  for (const r of rows) {
    const idStr = r.id !== null ? r.id : '⚠ 없음'
    const patStr = r.hasExpr ? r.pattern : `⚠ ${r.rawPattern}`
    lines.push(`| EP${r.epStr} | ${idStr} | ${patStr} | ${r.role} |`)
  }

  // ─── 리포트 ───
  // 1. 어느 EP에도 배정 안 된 패턴
  const assignedIds = new Set(rows.filter(r => r.id).map(r => r.id))
  const unassigned = expressions.filter(e => !assignedIds.has(e.id))

  // 2. 중복 배정 (expression_id가 2개 이상 EP에)
  const idToEps = new Map()
  for (const r of rows) {
    if (!r.id) continue
    if (!idToEps.has(r.id)) idToEps.set(r.id, new Set())
    idToEps.get(r.id).add(r.ep)
  }
  const duplicates = [...idToEps.entries()].filter(([id, eps]) => eps.size > 1)

  // 3. id 1235
  const expr1235 = expressions.find(e => e.id === 1235)
  const ep1235rows = rows.filter(r => r.id === 1235)

  // 4. EP당 배정 패턴 수
  const perEpCount = new Map()
  for (const r of rows) {
    perEpCount.set(r.ep, (perEpCount.get(r.ep) || 0) + 1)
  }
  const counts = [...perEpCount.values()]
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  const avg = (counts.reduce((a,b)=>a+b,0)/counts.length).toFixed(1)
  // 분포 상세
  const distMap = {}
  for (const c of counts) distMap[c] = (distMap[c]||0)+1

  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 리포트')
  lines.push('')

  lines.push(`### 1. 어느 EP에도 배정 안 된 패턴 (${unassigned.length}개)`)
  lines.push('')
  if (unassigned.length === 0) {
    lines.push('없음')
  } else {
    lines.push('| id | pattern_ko |')
    lines.push('|---|---|')
    for (const e of unassigned) lines.push(`| ${e.id} | ${e.pattern_ko} |`)
  }

  lines.push('')
  lines.push(`### 2. 두 개 이상 EP에 중복 배정된 패턴 (${duplicates.length}개)`)
  lines.push('')
  if (duplicates.length === 0) {
    lines.push('없음')
  } else {
    lines.push('| expression_id | pattern_ko | EP 목록 |')
    lines.push('|---|---|---|')
    for (const [id, eps] of duplicates.sort((a,b)=>a[0]-b[0])) {
      const e = expressions.find(x=>x.id===id)
      const epList = [...eps].sort((a,b)=>a-b).map(n=>`EP${String(n).padStart(2,'0')}`).join(', ')
      lines.push(`| ${id} | ${e?.pattern_ko ?? '?'} | ${epList} |`)
    }
  }

  lines.push('')
  lines.push(`### 3. id 1235 (~얼마나 걸려요?) 소속 EP`)
  lines.push('')
  if (ep1235rows.length === 0) {
    lines.push('⚠ 어느 EP에도 배정되지 않음 (id 대역 1235는 다른 패턴과 동떨어짐)')
  } else {
    for (const r of ep1235rows) lines.push(`- EP${r.epStr} [${r.role}]`)
  }

  lines.push('')
  lines.push(`### 4. EP당 배정 패턴 수 분포`)
  lines.push('')
  lines.push(`- 총 배정 EP: ${perEpCount.size}개`)
  lines.push(`- 최소: ${min}개 / 최대: ${max}개 / 평균: ${avg}개`)
  lines.push(`- 분포:`)
  for (const [cnt, epCnt] of Object.entries(distMap).sort((a,b)=>Number(a[0])-Number(b[0]))) {
    lines.push(`  - ${cnt}개 배정: ${epCnt}개 EP`)
  }

  fs.writeFileSync(OUT_PATH, lines.join('\n'), 'utf-8')
  console.log(`✓ 생성: ${OUT_PATH}`)
  console.log(`  행: ${rows.length}행 (EP: ${epMap.size}개)`)
  console.log(`  미배정 패턴: ${unassigned.length}개`)
  console.log(`  중복 배정: ${duplicates.length}개`)
  console.log(`  id 1235 배정 EP: ${ep1235rows.length === 0 ? '없음' : ep1235rows.map(r=>'EP'+r.epStr).join(', ')}`)
  console.log(`  EP당 min/max/avg: ${min}/${max}/${avg}`)

  // 매칭 실패 목록 (디버깅용)
  const noExpr = rows.filter(r => !r.hasExpr)
  if (noExpr.length > 0) {
    console.log(`\n⚠ expression 없음 (${noExpr.length}건):`)
    for (const r of noExpr) console.log(`  EP${r.epStr} [${r.role}] "${r.rawPattern}"`)
  }
}

main()
