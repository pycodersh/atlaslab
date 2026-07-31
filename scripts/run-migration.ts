/**
 * Supabase pg_meta API를 통해 kp_challenges 컬럼 추가
 * 실행: npx ts-node --project tsconfig.scripts.json scripts/run-migration.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY!

async function execSQL(sql: string): Promise<{ ok: boolean; error?: string }> {
  // Method 1: pg_meta REST API (Supabase internal)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
  }).catch(() => null)

  // Use supabase-js client for column existence check only
  const sb = createClient(SUPABASE_URL, SERVICE_KEY)

  // Check if challenge_type column already exists
  const { error: checkErr } = await sb
    .from('kp_challenges')
    .select('id, challenge_type, word_pieces')
    .limit(1)

  if (!checkErr) {
    console.log('✓ challenge_type and word_pieces columns already exist')
    return { ok: true }
  }

  // Columns missing — try via Management API SQL endpoint
  const project_ref = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]
  if (!project_ref) return { ok: false, error: 'Cannot parse project_ref from URL' }

  // Try Supabase Management API (requires PAT, not service key)
  const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${project_ref}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (mgmtRes.ok) {
    return { ok: true }
  }

  const errText = await mgmtRes.text()
  return { ok: false, error: `Management API: ${mgmtRes.status} ${errText}` }
}

async function main() {
  console.log('Checking kp_challenges schema...')

  const sb = createClient(SUPABASE_URL, SERVICE_KEY)

  // Check if columns exist
  const { error: checkErr } = await sb
    .from('kp_challenges')
    .select('id, challenge_type, word_pieces')
    .limit(1)

  if (!checkErr) {
    console.log('✓ challenge_type and word_pieces columns already exist — skipping ALTER TABLE')
  } else {
    console.log(`Columns missing (${checkErr.message}). Attempting migration...`)

    const sql = `
      ALTER TABLE kp_challenges ADD COLUMN IF NOT EXISTS challenge_type TEXT;
      ALTER TABLE kp_challenges ADD COLUMN IF NOT EXISTS word_pieces JSONB;
    `

    const result = await execSQL(sql)
    if (result.ok) {
      console.log('✓ Migration applied')
    } else {
      console.error('✗ Migration failed:', result.error)
      console.error('\nPlease run the following SQL manually in Supabase Studio:')
      console.error('https://supabase.com/dashboard/project/eecvvgkihtcgfikaimao/sql/new\n')
      console.error('ALTER TABLE kp_challenges ADD COLUMN IF NOT EXISTS challenge_type TEXT;')
      console.error('ALTER TABLE kp_challenges ADD COLUMN IF NOT EXISTS word_pieces JSONB;')
      process.exit(1)
    }
  }

  // Truncate
  console.log('\nTruncating kp_challenges...')
  const { count } = await sb
    .from('kp_challenges')
    .select('id', { count: 'exact', head: true })

  if ((count ?? 0) > 0) {
    const { error: delErr } = await sb.from('kp_challenges').delete().gte('id', 1)
    if (delErr) {
      console.error('Delete failed:', delErr.message)
      process.exit(1)
    }
  }
  console.log(`✓ Cleared ${count ?? 0} rows`)
  console.log('\nReady for generate-challenges.ts')
}

main().catch(console.error)
