/**
 * kpatto_pattern_popup_audit.md 파싱
 * → { id, pattern_ko, literal_en, usage_en, examples: [] }[]
 * → kp_expressions_base.json
 */
import * as fs from 'fs'

const IN_PATH  = 'C:/Users/msj15/Downloads/kpatto_pattern_popup_audit.md'
const OUT_PATH = 'C:/Users/msj15/Downloads/kp_expressions_base.json'

interface ExprBase {
  id: number
  pattern_ko: string
  literal_en: string
  usage_en: string
  examples: []
}

function main() {
  const raw = fs.readFileSync(IN_PATH, 'utf-8')
  const lines = raw.split(/\r?\n/)

  const results: ExprBase[] = []
  let inPattern = false
  let hasDB = false
  let cur: Partial<ExprBase> = {}

  function flush() {
    if (hasDB && cur.id && cur.pattern_ko) {
      results.push({
        id: cur.id,
        pattern_ko: cur.pattern_ko,
        literal_en: cur.literal_en ?? '',
        usage_en: cur.usage_en ?? '',
        examples: [],
      })
    }
    cur = {}
    hasDB = false
    inPattern = false
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // 새 패턴 섹션 시작
    if (trimmed.startsWith('#### 패턴:')) {
      flush()
      inPattern = true
      continue
    }

    if (!inPattern) continue

    // DB 없음 → 해당 패턴 스킵
    if (/^\- \*\*DB\*\*: 없음/.test(trimmed)) {
      hasDB = false
      continue
    }

    // DB id + DB korean
    const idM = trimmed.match(/\*\*DB id\*\*:\s*(\d+)\s*\|\s*\*\*DB korean\*\*:\s*`([^`]+)`/)
    if (idM) {
      cur.id = parseInt(idM[1], 10)
      cur.pattern_ko = idM[2].trim()
      hasDB = true
      continue
    }

    // Literal
    const litM = trimmed.match(/^\- \*\*Literal\*\*:\s*(.+)$/)
    if (litM) {
      cur.literal_en = litM[1].trim()
      continue
    }

    // Usage (truncated 끝에 '…' 있을 수 있음)
    const usageM = trimmed.match(/^\- \*\*Usage\*\*:\s*(.+)$/)
    if (usageM) {
      cur.usage_en = usageM[1].trim().replace(/…$/, '').trim()
      continue
    }

    // 다음 EP 섹션 시작 시 현재 패턴 완료
    if (trimmed.startsWith('### EP') || trimmed.startsWith('---')) {
      flush()
    }
  }
  flush() // 마지막 패턴 처리

  // id 기준 정렬 + 중복 제거
  const deduped = [...new Map(results.map(r => [r.id, r])).values()]
    .sort((a, b) => a.id - b.id)

  fs.writeFileSync(OUT_PATH, JSON.stringify(deduped, null, 2), 'utf-8')

  console.log(`파싱 완료: ${deduped.length}건`)
  console.log(`저장: ${OUT_PATH}`)

  // 샘플 출력
  console.log('\n[샘플 3건]')
  for (const r of deduped.slice(0, 3)) {
    console.log(`  id=${r.id} | ${r.pattern_ko} | "${r.literal_en}"`)
  }

  // literal / usage 누락 항목 보고
  const noLit = deduped.filter(r => !r.literal_en)
  const noUsage = deduped.filter(r => !r.usage_en)
  if (noLit.length)   console.log(`\nliteral 누락: ${noLit.length}건 (ids: ${noLit.map(r=>r.id).join(', ')})`)
  if (noUsage.length) console.log(`usage 누락:   ${noUsage.length}건 (ids: ${noUsage.map(r=>r.id).join(', ')})`)
}

main()
