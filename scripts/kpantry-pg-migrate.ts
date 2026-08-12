/**
 * kpantry-pg-migrate.ts
 *
 * PostgREST 우회 — pg 직접 연결로 SQL 파일 4개를 단일 트랜잭션에서 실행 후 검증.
 *
 * 전제:
 *   .env.local 에 PG_DIRECT_URL=postgresql://... (direct connection, port 5432)
 *
 * 실행:
 *   npx tsx scripts/kpantry-pg-migrate.ts
 */

import { Client } from 'pg'
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

// 접속 파라미터 — .env.local 에서 주입
// PG_PASSWORD 우선; 없으면 PG_DIRECT_URL 에서 추출 (형식: scheme://user:PASSWORD@... 또는 scheme://user:PASSWORD)
function extractPassword(url: string | undefined): string | undefined {
  if (!url) return undefined
  // ://user:PASSWORD@ 또는 ://user:PASSWORD(끝)
  const m = url.match(/:\/\/[^:]+:([^@\/\s]+)/)
  return m?.[1]
}

const PG_PASSWORD =
  process.env.PG_PASSWORD ??
  extractPassword(process.env.PG_DIRECT_URL)

if (!PG_PASSWORD) {
  console.error('❌ PG_PASSWORD 또는 PG_DIRECT_URL 이 .env.local 에 없음')
  process.exit(1)
}

const PG_CONFIG = {
  host:     process.env.PG_HOST     ?? 'aws-0-ap-northeast-2.pooler.supabase.com',
  port:     parseInt(process.env.PG_PORT ?? '5432', 10),
  database: process.env.PG_DATABASE ?? 'postgres',
  user:     process.env.PG_USER     ?? 'postgres.eecvvgkihtcgfikaimao',
  password: PG_PASSWORD,
  ssl:      { rejectUnauthorized: false } as const,
}

const SQL_DIR = resolve(process.cwd(), 'scripts/sql-export')
const FILES: Array<{ file: string; table: string; expectedRows: number }> = [
  { file: '01_pantry_ingredients.sql',         table: 'pantry_ingredients',         expectedRows: 95  },
  { file: '02_pantry_recipes.sql',             table: 'pantry_recipes',             expectedRows: 103 },
  { file: '03_pantry_recipe_ingredients.sql',  table: 'pantry_recipe_ingredients',  expectedRows: 779 },
  { file: '04_pantry_recipe_steps.sql',        table: 'pantry_recipe_steps',        expectedRows: 430 },
]

const OLD_DOMAIN = 'mzcdowxmmuefowcayzfk'

// ── SQL 파일을 INSERT 문 단위로 분리 ─────────────────────────
// 각 파일은 배치별 INSERT … ON CONFLICT … ; 블록으로 구성됨.
// 빈 줄 + ; 기준으로 나눈 뒤 주석/빈 항목 제거.
function splitStatements(sql: string): string[] {
  return sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
}

// ── 연결 실패 힌트 ────────────────────────────────────────────
function connectionHint(err: unknown): string {
  const msg = String(err)
  if (msg.includes('password') || msg.includes('auth') || msg.includes('SASL')) {
    return [
      '  힌트: 비밀번호에 특수문자(@, #, % 등)가 포함되어 있으면 URL 인코딩 필요.',
      '  예) 비밀번호가 "p@ss#1" 이라면 → "p%40ss%231" 로 치환한 뒤',
      '  PG_DIRECT_URL=postgresql://postgres.xxx:p%40ss%231@host:5432/postgres',
      '  로 .env.local 을 수정하세요.',
    ].join('\n')
  }
  if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
    return '  힌트: 호스트/포트 확인. Direct connection 은 port 5432 입니다 (6543은 pooler).'
  }
  return ''
}

async function main() {
  console.log('══════════════════════════════════════════════════════════')
  console.log('  K-PANTRY 데이터 이전 (pg 직접 연결)')
  console.log(`  연결: ${PG_CONFIG.user}@${PG_CONFIG.host}:${PG_CONFIG.port}/${PG_CONFIG.database}`)
  console.log('══════════════════════════════════════════════════════════\n')

  const client = new Client(PG_CONFIG)

  // ── 연결 ──────────────────────────────────────────────────
  try {
    await client.connect()
    console.log('✅ DB 연결 성공\n')
  } catch (e) {
    console.error('❌ DB 연결 실패:', e)
    const hint = connectionHint(e)
    if (hint) console.error(hint)
    process.exit(1)
  }

  // ── 트랜잭션: 4개 파일 순서대로 실행 ──────────────────────
  try {
    await client.query('BEGIN')
    console.log('[트랜잭션 시작]')

    for (const { file, table } of FILES) {
      const filePath = resolve(SQL_DIR, file)
      const sql = readFileSync(filePath, 'utf8')
      const stmts = splitStatements(sql)

      console.log(`\n  [${file}] — ${stmts.length}개 배치`)

      for (let i = 0; i < stmts.length; i++) {
        try {
          await client.query(stmts[i])
          process.stdout.write(`    배치 ${i + 1}/${stmts.length}\r`)
        } catch (e) {
          // 몇 번째 행 블록인지 계산 (배치 크기 100)
          const approxRowStart = i * 100 + 1
          const approxRowEnd   = Math.min((i + 1) * 100, 99999)
          console.error(`\n❌ 오류 발생`)
          console.error(`   파일 : ${file}`)
          console.error(`   배치 : ${i + 1}/${stmts.length}  (약 ${approxRowStart}~${approxRowEnd}번째 행)`)
          console.error(`   내용 : ${String(e).split('\n')[0]}`)
          await client.query('ROLLBACK')
          console.error('\n[ROLLBACK 완료]')
          process.exit(1)
        }
      }
      console.log(`\n  ✅ ${table} 완료`)
    }

    await client.query('COMMIT')
    console.log('\n[COMMIT 완료]\n')

  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('❌ 예기치 않은 오류:', e)
    process.exit(1)
  }

  // ── 검증 ─────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════════════')
  console.log('  검증')
  console.log('══════════════════════════════════════════════════════════')

  let failed = false

  // 1. 행 수
  console.log('\n[1] 테이블별 행 수')
  for (const { table, expectedRows } of FILES) {
    const { rows } = await client.query<{ count: string }>(`SELECT COUNT(*) AS count FROM ${table}`)
    const actual = parseInt(rows[0].count, 10)
    const ok = actual === expectedRows
    if (!ok) failed = true
    console.log(`  ${ok ? '✅' : '❌'} ${table}: ${actual} / 기대 ${expectedRows}`)
  }

  // 2. 구 도메인 잔존
  console.log('\n[2] 구 도메인 잔존 (3개 컬럼)')
  const urlCols: Array<{ table: string; col: string }> = [
    { table: 'pantry_ingredients',    col: 'image_url'      },
    { table: 'pantry_recipes',        col: 'hero_image_url' },
    { table: 'pantry_recipe_steps',   col: 'image_url'      },
  ]
  for (const { table, col } of urlCols) {
    const { rows } = await client.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM ${table} WHERE ${col} LIKE $1`,
      [`%${OLD_DOMAIN}%`],
    )
    const bad = parseInt(rows[0].count, 10)
    const ok  = bad === 0
    if (!ok) failed = true
    console.log(`  ${ok ? '✅' : '❌'} ${table}.${col}: 구 도메인 ${bad}건`)
  }

  // 3. slug null / 중복
  console.log('\n[3] pantry_recipes.slug')
  const { rows: slugNull } = await client.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM pantry_recipes WHERE slug IS NULL`,
  )
  const { rows: slugDup } = await client.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM (
       SELECT slug FROM pantry_recipes GROUP BY slug HAVING COUNT(*) > 1
     ) dup`,
  )
  const nullCnt = parseInt(slugNull[0].count, 10)
  const dupCnt  = parseInt(slugDup[0].count, 10)
  if (nullCnt !== 0 || dupCnt !== 0) failed = true
  console.log(`  ${nullCnt === 0 ? '✅' : '❌'} slug null: ${nullCnt}건`)
  console.log(`  ${dupCnt  === 0 ? '✅' : '❌'} slug 중복: ${dupCnt}건`)

  // 4. 고아 행
  console.log('\n[4] 고아 행 (외래키 무결성)')
  const { rows: orphanRI } = await client.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM pantry_recipe_ingredients ri
     WHERE NOT EXISTS (SELECT 1 FROM pantry_recipes     r WHERE r.id = ri.recipe_id)
        OR NOT EXISTS (SELECT 1 FROM pantry_ingredients i WHERE i.id = ri.ingredient_id)`,
  )
  const { rows: orphanRS } = await client.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM pantry_recipe_steps rs
     WHERE NOT EXISTS (SELECT 1 FROM pantry_recipes r WHERE r.id = rs.recipe_id)`,
  )
  const oriRI = parseInt(orphanRI[0].count, 10)
  const oriRS = parseInt(orphanRS[0].count, 10)
  if (oriRI !== 0 || oriRS !== 0) failed = true
  console.log(`  ${oriRI === 0 ? '✅' : '❌'} pantry_recipe_ingredients 고아: ${oriRI}건`)
  console.log(`  ${oriRS === 0 ? '✅' : '❌'} pantry_recipe_steps 고아: ${oriRS}건`)

  // ── 최종 ─────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════')
  if (!failed) {
    console.log('✅ 전체 검증 통과 — 4단계 진행 가능')
  } else {
    console.log('❌ 검증 실패 항목 있음 — 위 내용 확인 후 재처리')
  }

  await client.end()
  if (failed) process.exit(1)
}

main().catch(e => { console.error(e); process.exit(1) })
