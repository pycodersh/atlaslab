/**
 * scripts/diag-challenge-lang.mjs
 * kp_challenges 한국어 노출 전수 진단 (읽기 전용)
 *
 * 사용법:
 *   node scripts/diag-challenge-lang.mjs
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ 환경변수 누락: NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const KO_REGEX = /[가-힣]/

// ─── 전체 행 페이지네이션 가져오기 ───────────────────────────────────────────
async function fetchAll(table, select, pageSize = 1000) {
  const rows = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + pageSize - 1)
    if (error) throw new Error(`${table} fetch 오류: ${error.message}`)
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
  return rows
}

async function main() {
  console.log('=== kp_challenges 한국어 노출 전수 진단 ===\n')

  // ─── 1. kp_challenges 전체 로드 ─────────────────────────────────────────
  let allRows
  try {
    allRows = await fetchAll('kp_challenges', 'id, ep_no, type, variant, question')
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }

  console.log(`총 로드: ${allRows.length}건\n`)

  // ─── type별 집계 ─────────────────────────────────────────────────────────
  const types = ['multiple_choice', 'fill_blank', 'sentence_build']
  const summary = {}

  for (const type of types) {
    const rows   = allRows.filter(r => r.type === type)
    const koRows = rows.filter(r => KO_REGEX.test(r.question ?? ''))
    const enRows = rows.filter(r => !KO_REGEX.test(r.question ?? ''))
    summary[type] = { total: rows.length, koCount: koRows.length, enCount: enRows.length, samples: koRows.slice(0, 3) }
  }

  console.log('── type별 한국어 지문 집계 ──')
  for (const type of types) {
    const { total, koCount, enCount } = summary[type]
    const pct = total > 0 ? Math.round((koCount / total) * 100) : 0
    console.log(`  ${type}: ${koCount}건 한국어 / ${total}건 전체 (${pct}%)  [영어 ${enCount}건]`)
  }

  // fill_blank는 variant별로도 확인
  console.log('\n── fill_blank variant별 세부 ──')
  for (const v of ['blank', 'identify']) {
    const rows   = allRows.filter(r => r.type === 'fill_blank' && r.variant === v)
    const koRows = rows.filter(r => KO_REGEX.test(r.question ?? ''))
    console.log(`  fill_blank[${v}]: ${koRows.length}건 한국어 / ${rows.length}건 전체`)
    if (koRows.length > 0) {
      const sample = koRows[0]
      console.log(`    샘플 question: "${(sample.question ?? '').slice(0, 60)}"`)
    }
  }

  // sentence_build 비-한국어 샘플
  console.log('\n── sentence_build 샘플 (첫 3건) ──')
  const sbRows = allRows.filter(r => r.type === 'sentence_build').slice(0, 3)
  for (const r of sbRows) {
    const lang = KO_REGEX.test(r.question ?? '') ? '한국어' : '영어'
    console.log(`  EP${String(r.ep_no).padStart(2,'0')} question[${lang}]: "${(r.question ?? '').slice(0, 60)}"`)
  }

  // ─── 2. kp_expressions.examples 구조 확인 ──────────────────────────────
  console.log('\n=== kp_expressions.examples 구조 확인 ===\n')
  let exprs
  try {
    const { data, error } = await supabase
      .from('kp_expressions')
      .select('id, korean, examples')
      .not('examples', 'is', null)
      .limit(5)
    if (error) throw new Error(error.message)
    exprs = data ?? []
  } catch (e) {
    console.error('expressions 조회 오류:', e.message)
    process.exit(1)
  }

  let foundFields = false
  for (const expr of exprs) {
    const exArr = Array.isArray(expr.examples) ? expr.examples : []
    if (exArr.length > 0) {
      const firstEx = exArr[0]
      const keys = Object.keys(firstEx)
      console.log(`expr id=${expr.id} (korean="${expr.korean}")`)
      console.log(`  examples[0] 필드: ${keys.join(', ')}`)
      console.log(`  examples[0] 값:   ${JSON.stringify(firstEx)}`)

      // 영어 번역 필드 추측
      const enFields = keys.filter(k => {
        const v = firstEx[k]
        return typeof v === 'string' && v.length > 0 && !KO_REGEX.test(v)
      })
      const koFields = keys.filter(k => {
        const v = firstEx[k]
        return typeof v === 'string' && v.length > 0 && KO_REGEX.test(v)
      })
      console.log(`  → 영어로 보이는 필드: [${enFields.join(', ') || '없음'}]`)
      console.log(`  → 한국어로 보이는 필드: [${koFields.join(', ') || '없음'}]`)
      foundFields = true
      break
    }
  }
  if (!foundFields) {
    console.log('  examples 배열이 있는 표현이 없음')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
