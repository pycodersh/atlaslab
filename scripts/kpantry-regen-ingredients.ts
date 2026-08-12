/**
 * kpantry-regen-ingredients.ts
 * 01_pantry_ingredients.sql 재생성 (aliases TEXT[] 수정)
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

const SRC_URL = 'https://mzcdowxmmuefowcayzfk.supabase.co'
const SRC_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16Y2Rvd3htbXVlZm93Y2F5emZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTA0NjM1MSwiZXhwIjoyMTAwNjIyMzUxfQ.TGy4ghXZv-CkYGTCSDBk3HsiSgyDrYqHnbj-gL7lRa0'

const DST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

const URL_RULES = [
  {
    from: `${SRC_URL}/storage/v1/object/public/ingredients/`,
    to:   `${DST_URL}/storage/v1/object/public/pantry-ingredients/`,
  },
]

function replaceUrl(url: string | null | undefined): string | null {
  if (!url) return url ?? null
  for (const rule of URL_RULES) {
    if (url.startsWith(rule.from)) return rule.to + url.slice(rule.from.length)
  }
  return url
}

// ── SQL 리터럴 ────────────────────────────────────────────────
function litStr(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

function lit(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'boolean')        return v ? 'TRUE' : 'FALSE'
  if (typeof v === 'number')         return isFinite(v) ? String(v) : 'NULL'
  if (Array.isArray(v)) {
    if (v.length === 0) return `ARRAY[]::text[]`
    const els = v.map(el =>
      el === null || el === undefined ? 'NULL' : litStr(String(el)),
    )
    return `ARRAY[${els.join(', ')}]::text[]`
  }
  if (typeof v === 'string') return litStr(v)
  return litStr(JSON.stringify(v))
}

// ── 조회 ─────────────────────────────────────────────────────
const src = createClient(SRC_URL, SRC_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function fetchAll(table: string): Promise<Record<string, unknown>[]> {
  const PAGE = 1000
  const rows: Record<string, unknown>[] = []
  let offset = 0
  while (true) {
    const { data, error } = await src.from(table).select('*').range(offset, offset + PAGE - 1)
    if (error) throw new Error(`fetchAll(${table}): ${error.message}`)
    if (!data || data.length === 0) break
    rows.push(...(data as Record<string, unknown>[]))
    if (data.length < PAGE) break
    offset += PAGE
  }
  return rows
}

// ── SQL 생성 ─────────────────────────────────────────────────
function buildSql(dstTable: string, rows: Record<string, unknown>[], batchSize = 100): string {
  if (rows.length === 0) return `-- ${dstTable}: 데이터 없음\n`
  const cols = Object.keys(rows[0])
  const updateCols = cols.filter(c => c !== 'id')
  const lines: string[] = [
    `-- ══════════════════════════════════════════`,
    `-- ${dstTable}  (${rows.length}행)`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- ══════════════════════════════════════════`,
    '',
  ]
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    lines.push(`INSERT INTO ${dstTable} (${cols.map(c => `"${c}"`).join(', ')}) VALUES`)
    lines.push(batch.map(row => `  (${cols.map(c => lit(row[c])).join(', ')})`).join(',\n'))
    lines.push(`ON CONFLICT (id) DO UPDATE SET`)
    lines.push(updateCols.map(c => `  "${c}" = EXCLUDED."${c}"`).join(',\n') + ';')
    lines.push('')
  }
  return lines.join('\n')
}

async function main() {
  console.log('ingredients 조회 중...')
  const raw = await fetchAll('ingredients')
  const rows = raw.map(r => ({
    ...r,
    image_url: replaceUrl(r.image_url as string | null),
  }))
  console.log(`  ${rows.length}행 조회 완료`)

  const sql = buildSql('pantry_ingredients', rows)
  const outPath = resolve(process.cwd(), 'scripts/sql-export/01_pantry_ingredients.sql')
  writeFileSync(outPath, sql, 'utf8')
  console.log(`✅ 재생성: ${outPath}\n`)

  // ── 샘플 출력 ────────────────────────────────────────────
  const withAlias  = rows.filter(r => Array.isArray(r.aliases) && (r.aliases as unknown[]).length > 0)
  const noAlias    = rows.filter(r => !r.aliases || (r.aliases as unknown[]).length === 0)
  const nullAlias  = rows.filter(r => r.aliases === null || r.aliases === undefined)

  console.log(`aliases 있는 행 : ${withAlias.length}건`)
  console.log(`aliases 빈 배열 : ${noAlias.length - nullAlias.length}건`)
  console.log(`aliases NULL    : ${nullAlias.length}건`)

  console.log('\n─── aliases 있는 샘플 (3건) ───')
  for (const r of withAlias.slice(0, 3)) {
    const aliasLit = lit(r.aliases)
    console.log(`  name: ${r.name}`)
    console.log(`  aliases raw : ${JSON.stringify(r.aliases)}`)
    console.log(`  aliases SQL : ${aliasLit}`)
    console.log()
  }

  console.log('─── aliases NULL 샘플 (2건) ───')
  for (const r of nullAlias.slice(0, 2)) {
    console.log(`  name: ${r.name}`)
    console.log(`  aliases SQL : ${lit(r.aliases)}`)
    console.log()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
