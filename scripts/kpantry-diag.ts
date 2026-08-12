/**
 * kpantry-diag.ts
 * PostgREST 스키마 캐시 / 접근 권한 진단
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const DST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const DST_KEY = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!

const dst = createClient(DST_URL, DST_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function check(label: string, fn: () => Promise<unknown>) {
  try {
    const result = await fn()
    console.log(`✅ ${label}:`, JSON.stringify(result).slice(0, 120))
  } catch (e) {
    console.log(`❌ ${label}:`, String(e))
  }
}

async function main() {
  console.log(`URL : ${DST_URL}`)
  console.log(`KEY : ${DST_KEY?.slice(0, 20)}...`)
  console.log()

  // 1. patto 기존 테이블 (반드시 있어야 함)
  await check('patterns (patto 기존)', async () => {
    const { data, error } = await dst.from('patterns').select('id').limit(1)
    if (error) throw error
    return { rows: data?.length }
  })

  // 2. pantry_ingredients (신규)
  await check('pantry_ingredients', async () => {
    const { data, error } = await dst.from('pantry_ingredients').select('id').limit(1)
    if (error) throw error
    return { rows: data?.length }
  })

  // 3. PostgREST REST API 직접 호출 (fetch)
  await check('REST /pantry_ingredients (fetch)', async () => {
    const res = await fetch(
      `${DST_URL}/rest/v1/pantry_ingredients?limit=1`,
      {
        headers: {
          apikey: DST_KEY,
          Authorization: `Bearer ${DST_KEY}`,
        },
      },
    )
    const body = await res.json()
    return { status: res.status, body }
  })

  // 4. PostgREST root — 어떤 테이블이 노출돼 있는지 목록
  await check('REST root (테이블 목록)', async () => {
    const res = await fetch(`${DST_URL}/rest/v1/`, {
      headers: {
        apikey: DST_KEY,
        Authorization: `Bearer ${DST_KEY}`,
      },
    })
    const body = await res.json() as Record<string, unknown>
    // paths 키에서 pantry_ 로 시작하는 항목만
    const paths = body.paths as Record<string, unknown> | undefined
    const pantryPaths = paths ? Object.keys(paths).filter(p => p.includes('pantry')) : []
    return { pantryTables: pantryPaths }
  })

  // 5. GRANT 확인 — information_schema.role_table_grants via RPC (가능하면)
  await check('anon GRANT 확인 (RPC sql)', async () => {
    const { data, error } = await dst.rpc('exec_sql', {
      sql: `SELECT table_name, privilege_type FROM information_schema.role_table_grants
            WHERE grantee='anon' AND table_name LIKE 'pantry_%' LIMIT 10`,
    })
    if (error) throw error
    return data
  })
}

main().catch(e => { console.error(e); process.exit(1) })
