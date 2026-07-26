/**
 * STEP 1+2 of challenge rewrite
 * 1. Checks that challenge_type and word_pieces columns exist
 * 2. Clears all existing kp_challenges rows
 *
 * If columns are missing, prints the SQL to run in Supabase Studio and exits.
 * Run: npx ts-node --project tsconfig.scripts.json scripts/setup-challenges.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  // 1. Check columns exist
  console.log('Checking kp_challenges schema...')
  const { error: colErr } = await sb
    .from('kp_challenges')
    .select('id, challenge_type, word_pieces')
    .limit(1)

  if (colErr) {
    if (colErr.code === '42703' || colErr.message?.includes('does not exist')) {
      console.error('\n❌ Missing columns! Run this SQL in Supabase Studio:\n')
      console.log('ALTER TABLE kp_challenges')
      console.log('  ADD COLUMN IF NOT EXISTS challenge_type TEXT,')
      console.log('  ADD COLUMN IF NOT EXISTS word_pieces JSONB;\n')
    } else {
      console.error('Unexpected error:', colErr.message)
    }
    process.exit(1)
  }

  console.log('✓ Schema OK: challenge_type and word_pieces columns exist')

  // 2. Count existing rows
  const { count } = await sb
    .from('kp_challenges')
    .select('id', { count: 'exact', head: true })

  console.log(`Found ${count ?? 0} existing rows — clearing...`)

  // 3. Delete all rows (SERIAL id starts at 1)
  if ((count ?? 0) > 0) {
    const { error: delErr } = await sb
      .from('kp_challenges')
      .delete()
      .gte('id', 1)

    if (delErr) {
      console.error('Delete failed:', delErr.message)
      process.exit(1)
    }
  }

  console.log('✓ kp_challenges cleared — ready for challenge generation')
  console.log('\nNext step: run scripts/generate-challenges.ts (requires Anthropic API credits)')
}

main().catch(console.error)
