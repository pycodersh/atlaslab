/**
 * kp_expressions.english 절단 156건 전수 조사
 * npx tsx scripts/_audit_english_truncation.ts
 *
 * [1] 절단된 156건 전체 출력 (id·korean·english·글자수)
 * [2] 글자수 분포 — 규칙적 절단인지 확인
 * [3] id 구간 분포
 * [4] 원본 JSON 대조 (data/kpatto/source/kp_expressions_with_examples.json)
 * [5] SEO 페이지 대상 표현 중 절단 건수
 */
import * as dotenv from 'dotenv'
import * as path   from 'path'
import * as fs     from 'fs'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function main() {
  // ── DB: 전체 조회 ─────────────────────────────────────────────────────────
  const { data: all, error } = await sb
    .from('kp_expressions')
    .select('id, korean, english')
    .order('id')

  if (error) { console.error(error.message); process.exit(1) }

  const endings = new Set(['.', '!', '?', ')', '"', '’', '”', '…', '~', "'", ';'])
  const truncated = (all ?? []).filter(r => {
    const e = (r.english ?? '').trim()
    return e.length > 0 && !endings.has(e.slice(-1))
  })

  // ── [1] 전체 목록 ────────────────────────────────────────────────────────
  console.log(`\n[1] 절단 항목 전체 (${truncated.length}건)`)
  console.log('id\tlen\tkorean\tenglish')
  truncated.forEach(r => {
    const len = (r.english ?? '').length
    console.log(`${r.id}\t${len}\t${r.korean}\t${r.english}`)
  })

  // ── [2] 글자수 분포 ───────────────────────────────────────────────────────
  console.log('\n[2] 영어 글자수 분포 (절단 항목)')
  const lenMap = new Map<number, number>()
  truncated.forEach(r => {
    const len = (r.english ?? '').length
    lenMap.set(len, (lenMap.get(len) ?? 0) + 1)
  })
  const sortedLens = [...lenMap.entries()].sort(([a],[b]) => b - a)  // 빈도 내림차순
  sortedLens.slice(0, 20).forEach(([len, cnt]) =>
    console.log(`  len=${len}: ${cnt}건`)
  )
  const maxLen = Math.max(...truncated.map(r => (r.english ?? '').length))
  const minLen = Math.min(...truncated.map(r => (r.english ?? '').length))
  console.log(`  범위: ${minLen}~${maxLen}자`)

  // ── [3] id 구간 ───────────────────────────────────────────────────────────
  console.log('\n[3] id 구간 분포')
  const ranges = [
    [1, 200], [201, 400], [401, 600], [601, 800],
    [801, 900], [901, 1000], [1001, 1100], [1101, 1200],
    [1201, 1300], [1301, 1400],
  ]
  ranges.forEach(([s, e]) => {
    const cnt = truncated.filter(r => r.id >= s && r.id <= e).length
    if (cnt > 0) console.log(`  id ${s}–${e}: ${cnt}건`)
  })

  // ── [4] 원본 JSON 대조 ────────────────────────────────────────────────────
  console.log('\n[4] 원본 JSON 대조')
  const jsonPath = path.resolve(process.cwd(), 'data/kpatto/source/kp_expressions_with_examples.json')
  if (!fs.existsSync(jsonPath)) {
    console.log('  ❌ 파일 없음:', jsonPath)
  } else {
    const raw  = fs.readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(raw) as Array<{ id?: number; korean?: string; english?: string; pattern_id?: number }>
    console.log(`  파일 항목 수: ${data.length}`)

    // korean 기준으로 매핑
    const byKorean = new Map(data.map(d => [d.korean?.trim(), d]))

    let restorable = 0
    let different  = 0
    let notFound   = 0

    const restorableList: Array<{ id: number; korean: string; dbEn: string; jsonEn: string }> = []

    truncated.forEach(r => {
      const match = byKorean.get(r.korean?.trim())
      if (!match) { notFound++; return }
      const jsonEn = (match.english ?? '').trim()
      if (!jsonEn || jsonEn === (r.english ?? '').trim()) { different++; return }
      // JSON 값이 더 길고 구두점으로 끝나면 복원 가능
      if (jsonEn.length > (r.english ?? '').length && endings.has(jsonEn.slice(-1))) {
        restorable++
        restorableList.push({ id: r.id, korean: r.korean, dbEn: r.english ?? '', jsonEn })
      } else {
        different++
      }
    })

    console.log(`  복원 가능 (JSON이 더 길고 완전): ${restorable}건`)
    console.log(`  JSON도 동일하거나 불완전:          ${different}건`)
    console.log(`  JSON에서 못 찾음:                  ${notFound}건`)

    if (restorableList.length > 0) {
      console.log('\n  복원 가능 샘플 10개:')
      restorableList.slice(0, 10).forEach(r => {
        console.log(`  id=${r.id}  "${r.korean}"`)
        console.log(`    DB : "${r.dbEn}"`)
        console.log(`    JSON: "${r.jsonEn}"`)
      })
    }
  }

  // ── [5] SEO 페이지 대상 절단 집계 ────────────────────────────────────────
  console.log('\n[5] SEO 페이지 (/kpatto/expressions/[id]) 대상 절단 수')
  // SEO 페이지는 모든 expressions가 대상이므로 = 절단 건수 전체
  console.log(`  절단 건수: ${truncated.length}건 (전체 ${(all ?? []).length}건 중)`)
  console.log(`  비율: ${((truncated.length / (all ?? []).length) * 100).toFixed(1)}%`)
}

main().catch(e => { console.error(e); process.exit(1) })
