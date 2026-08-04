/**
 * K-PATTO DB 재구축 준비
 * 1. kp_expressions에 compare 컬럼 추가 (TEXT nullable)
 * 2. kp_dialogue_expressions에서 role='exposure' 전량 삭제
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  // ── 1. compare 컬럼 추가 ──────────────────────────────────────────────────
  // PostgREST를 통한 DDL은 지원 안 되므로 rpc 또는 직접 확인 필요
  // → 먼저 컬럼 존재 여부 확인 (INSERT로 빠르게 체크)
  const { data: sample } = await sb.from('kp_expressions').select('id, compare').limit(1)
  if (sample && 'compare' in (sample[0] ?? {})) {
    console.log('✓ compare 컬럼 이미 존재')
  } else {
    console.log('⚠ compare 컬럼 미존재 — Supabase Dashboard에서 수동 실행 필요:')
    console.log('  ALTER TABLE kp_expressions ADD COLUMN compare TEXT;')
    console.log('  (PostgREST는 DDL을 지원하지 않아 직접 실행 필요)')
  }

  // ── 2. exposure 행 삭제 ────────────────────────────────────────────────────
  const { data: beforeCount } = await sb
    .from('kp_dialogue_expressions')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'exposure')

  const { error: delErr, count } = await sb
    .from('kp_dialogue_expressions')
    .delete({ count: 'exact' })
    .eq('role', 'exposure')

  if (delErr) {
    console.error('exposure 삭제 실패:', delErr.message)
  } else {
    console.log(`✓ kp_dialogue_expressions exposure 삭제: ${count ?? 0}건`)
  }

  // 잔여 확인
  const { count: remaining } = await sb
    .from('kp_dialogue_expressions')
    .select('id', { count: 'exact', head: true })
  console.log(`  잔여 kp_dialogue_expressions: ${remaining}건 (전부 focus)`)
}
main().catch(console.error)
