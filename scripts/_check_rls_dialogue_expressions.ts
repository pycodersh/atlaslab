/**
 * kp_dialogue_expressions RLS 정책 확인
 * - 서비스 롤(RLS 우회) vs anon 롤 결과 비교
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anonKey   = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

const sbService = createClient(url, serviceKey, { auth: { persistSession: false } })
const sbAnon    = createClient(url, anonKey,    { auth: { persistSession: false } })

async function main() {
  console.log('=== kp_dialogue_expressions RLS 검증 ===\n')

  // 1. 서비스 롤 (RLS 우회)
  const { data: svcRows, error: svcErr } = await sbService
    .from('kp_dialogue_expressions')
    .select('dialogue_id, matched_text, role')
    .eq('dialogue_id', 10383)
    .eq('role', 'focus')
  console.log(`서비스 롤 결과: ${svcRows?.length ?? 0}건  (error=${svcErr?.message ?? 'none'})`)
  for (const r of (svcRows ?? [])) console.log(`  matched="${r.matched_text}"  role=${r.role}`)

  // 2. anon 롤 (브라우저에서 쓰는 키)
  const { data: anonRows, error: anonErr } = await sbAnon
    .from('kp_dialogue_expressions')
    .select('dialogue_id, matched_text, role')
    .eq('dialogue_id', 10383)
    .eq('role', 'focus')
  console.log(`\nanon 롤 결과: ${anonRows?.length ?? 0}건  (error=${anonErr?.message ?? 'none'})`)
  for (const r of (anonRows ?? [])) console.log(`  matched="${r.matched_text}"  role=${r.role}`)

  // 3. RLS 정책 목록 (pg_policies)
  console.log('\n=== pg_policies (kp_dialogue_expressions) ===')
  const { data: policies, error: polErr } = await sbService
    .rpc('get_policies_for_table', { table_name: 'kp_dialogue_expressions' })
    .select('*')
  if (polErr) {
    console.log('  rpc 없음, 직접 조회 시도...')
    const { data: p2, error: e2 } = await sbService
      .from('pg_policies')
      .select('policyname, cmd, qual')
      .eq('tablename', 'kp_dialogue_expressions')
    if (e2) {
      console.log(`  pg_policies 접근 불가: ${e2.message}`)
    } else {
      for (const p of (p2 ?? [])) console.log(`  policy: ${p.policyname} cmd=${p.cmd}`)
    }
  } else {
    console.log(JSON.stringify(policies, null, 2))
  }

  // 4. kp_expressions, kp_patterns은 anon으로 읽히나? (비교 대상)
  const { data: exprAnon, error: exprErr } = await sbAnon
    .from('kp_expressions')
    .select('id').limit(1)
  console.log(`\nanon → kp_expressions: ${exprAnon?.length ?? 0}건  error=${exprErr?.message ?? 'none'}`)

  const { data: dlgAnon, error: dlgErr } = await sbAnon
    .from('kp_dialogue_expressions')
    .select('id').limit(1)
  console.log(`anon → kp_dialogue_expressions (any): ${dlgAnon?.length ?? 0}건  error=${dlgErr?.message ?? 'none'}`)
}

main().catch(e => { console.error('⛔', e.message); process.exit(1) })
