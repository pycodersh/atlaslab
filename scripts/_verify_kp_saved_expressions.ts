/**
 * kp_saved_expressions 테이블 검증 스크립트
 *
 * Supabase Dashboard SQL Editor에서 DDL 실행 후 이 스크립트를 실행:
 *   npx tsx scripts/_verify_kp_saved_expressions.ts
 *
 * 검증 항목:
 *   1. 테이블 존재 여부
 *   2. FK 동작 (존재하지 않는 expression_id 거부)
 *   3. RLS 활성화 (anon 조회 → 0건)
 *   4. INSERT → SELECT → DELETE 흐름 (service role)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!
const ANON_KEY         = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const anon = createClient(SUPABASE_URL, ANON_KEY)

let pass = 0
let fail = 0

function ok(msg: string)   { console.log(`  ✅ ${msg}`); pass++ }
function ng(msg: string)   { console.log(`  ❌ ${msg}`); fail++ }
function info(msg: string) { console.log(`  ℹ️  ${msg}`) }

async function main() {
  console.log('\n══════════════════════════════════════════')
  console.log('  kp_saved_expressions 검증 시작')
  console.log('══════════════════════════════════════════\n')

  // ── 1. 테이블 존재 ──────────────────────────────────────────────────────────
  console.log('[1] 테이블 존재 확인')
  const { error: tblErr } = await admin
    .from('kp_saved_expressions')
    .select('user_id')
    .limit(1)

  const missing = tblErr?.message?.includes('does not exist')
    || tblErr?.message?.includes('schema cache')
    || tblErr?.code === 'PGRST116'

  if (missing) {
    ng(`테이블 없음: ${tblErr?.message}`)
    console.log('\n🛑 DDL이 아직 실행되지 않았습니다.')
    console.log('   Supabase Dashboard → SQL Editor에서 아래를 실행하세요:\n')
    printDDL()
    process.exit(1)
  }
  if (tblErr) {
    info(`예상치 못한 오류 (계속 진행): ${tblErr.message}`)
  } else {
    ok('kp_saved_expressions 테이블 존재')
  }

  // ── 2. FK 동작 확인 ────────────────────────────────────────────────────────
  console.log('\n[2] FK 제약 확인 (존재하지 않는 expression_id 99999999 삽입 시도)')
  const { error: fkErr } = await admin
    .from('kp_saved_expressions')
    .insert({ user_id: '00000000-0000-0000-0000-000000000001', expression_id: 99999999 })

  if (fkErr) {
    // 23503 = foreign_key_violation
    if (fkErr.code === '23503' || fkErr.message.includes('foreign key') || fkErr.message.includes('violates')) {
      ok(`FK kp_expressions.id 동작 (삽입 거부, code=${fkErr.code})`)
    } else {
      info(`다른 원인으로 거부: ${fkErr.code} ${fkErr.message}`)
    }
  } else {
    // 실수로 삽입된 경우 정리
    await admin.from('kp_saved_expressions').delete()
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
    ng('FK 미동작 — expression_id 99999999가 삽입됨 (FK가 없거나 CASCADE 미설정)')
  }

  // ── 3. RLS 확인 (anon 조회 → 0건) ─────────────────────────────────────────
  console.log('\n[3] RLS 확인 (비인증 anon 키로 전체 SELECT)')
  const { data: anonRows, error: anonErr } = await anon
    .from('kp_saved_expressions')
    .select('*')

  if (anonErr) {
    if (anonErr.code === '42501' || anonErr.message.includes('permission')) {
      ok('RLS 활성화: 비인증 접근 거부')
    } else {
      info(`anon SELECT 오류 (RLS일 가능성 있음): ${anonErr.code} ${anonErr.message}`)
    }
  } else if ((anonRows?.length ?? 0) === 0) {
    ok('RLS 활성화: anon 조회 0건')
  } else {
    ng(`RLS 미동작: anon이 ${anonRows!.length}건 조회됨`)
  }

  // ── 4. INSERT / SELECT / DELETE 흐름 (service role) ───────────────────────
  console.log('\n[4] INSERT → SELECT → DELETE 흐름 검증')

  const { data: exprRow } = await admin
    .from('kp_expressions')
    .select('id')
    .limit(1)
    .single()
  const exprId = exprRow?.id as number | undefined

  if (!exprId) {
    ng('kp_expressions 행 없음 → INSERT 테스트 불가')
  } else {
    const testUser = '11111111-2222-3333-4444-555555555555'

    const { error: insErr } = await admin
      .from('kp_saved_expressions')
      .insert({ user_id: testUser, expression_id: exprId })

    if (insErr) {
      ng(`INSERT 실패: ${insErr.message}`)
    } else {
      ok(`INSERT 성공 (expression_id=${exprId})`)

      const { data: sel } = await admin
        .from('kp_saved_expressions')
        .select('*')
        .eq('user_id', testUser)

      sel && sel.length > 0 ? ok('SELECT 성공') : ng('SELECT 실패: 삽입 행을 찾을 수 없음')

      const { error: delErr } = await admin
        .from('kp_saved_expressions')
        .delete()
        .eq('user_id', testUser)

      delErr ? ng(`DELETE 실패: ${delErr.message}`) : ok('DELETE 성공 (테스트 행 정리)')
    }
  }

  // ── 요약 ──────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════')
  console.log(`  결과: ✅ ${pass}건 통과  /  ❌ ${fail}건 실패`)
  console.log('══════════════════════════════════════════\n')

  if (fail > 0) process.exit(1)
}

function printDDL() {
  console.log(`CREATE TABLE IF NOT EXISTS kp_saved_expressions (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expression_id INT  NOT NULL REFERENCES kp_expressions(id) ON DELETE CASCADE,
  saved_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, expression_id)
);
ALTER TABLE kp_saved_expressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kp_se_select" ON kp_saved_expressions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "kp_se_insert" ON kp_saved_expressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kp_se_delete" ON kp_saved_expressions
  FOR DELETE USING (auth.uid() = user_id);`)
}

main().catch(e => { console.error(e); process.exit(1) })
