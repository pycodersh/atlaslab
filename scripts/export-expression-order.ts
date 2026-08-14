/**
 * kp_expressions → expression-order.csv
 * 정렬: first_episode ASC (null 맨 뒤), 동일값 내 id ASC
 * 컬럼: 순번, id, slug, first_episode, pattern_ko, english, examples
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const OUT = path.resolve(process.cwd(), 'scripts/carousel/expression-order.csv')

/** CSV 셀: 쌍따옴표 이스케이프 후 따옴표로 감싸기 */
function cell(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  return `"${s.replace(/"/g, '""')}"`
}

async function main() {
  // 전체 조회 (Supabase 기본 limit=1000 → 범위 명시)
  const { data, error } = await sb
    .from('kp_expressions')
    .select('id, slug, first_episode, korean, english, examples')
    .order('first_episode', { ascending: true, nullsFirst: false })
    .order('id', { ascending: true })
    .range(0, 999)

  if (error) throw new Error(`조회 실패: ${error.message}`)
  const rows = data ?? []

  // ── 통계 ──────────────────────────────────────────────────────────────
  const nullCount = rows.filter(r => r.first_episode === null).length
  console.log(`총 행 수: ${rows.length}  (기대: 325)  ${rows.length === 325 ? '✅' : '⚠️ 불일치'}`)
  console.log(`first_episode = null: ${nullCount}건  ${nullCount === 0 ? '✅ 없음' : `⚠️ ${nullCount}건 → 맨 뒤 배치`}`)

  // ── CSV 생성 ──────────────────────────────────────────────────────────
  const header = ['순번', 'id', 'slug', 'first_episode', 'pattern_ko', 'english', 'examples'].join(',')
  const lines = rows.map((r, i) => [
    i + 1,
    cell(r.id),
    cell(r.slug),
    cell(r.first_episode),
    cell(r.korean),
    cell(r.english),
    cell(r.examples),
  ].join(','))

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, '﻿' + header + '\n' + lines.join('\n'), 'utf-8')
  console.log(`\n저장 완료: ${OUT}`)

  // ── 앞/뒤 샘플 확인 ───────────────────────────────────────────────────
  console.log('\n첫 5행:')
  for (const r of rows.slice(0, 5)) {
    console.log(`  #${rows.indexOf(r)+1}  id=${r.id}  ep=${r.first_episode ?? 'null'}  slug=${r.slug ?? '-'}`)
  }
  console.log('\n마지막 5행:')
  for (const r of rows.slice(-5)) {
    console.log(`  #${rows.indexOf(r)+1}  id=${r.id}  ep=${r.first_episode ?? 'null'}  slug=${r.slug ?? '-'}`)
  }
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
