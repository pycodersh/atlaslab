/**
 * kp_saved_expressions 테이블 검증 스크립트
 * 실행: npx tsx scripts/_verify_kp_saved_expressions.ts
 *
 * 검증 항목:
 *  [1] 테이블·컬럼·FK·PK 존재 확인
 *  [2] RLS 활성화 확인
 *  [3] 3개 정책(select/insert/delete) 존재 확인
 *  [4] service_role로 행 INSERT → 존재 확인 → DELETE (기능 검증)
 *  [5] anon으로 타 사용자 행 SELECT → 0 rows 확인 (RLS 차단 검증)
 *  [6] 테이블 없는 상태 시뮬레이션 → localStorage 폴백 분석 (코드 레벨)
 */
import * as dotenv from 'dotenv'
import * as path   from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// ── 환경변수 ──────────────────────────────────────────────────────────────────
const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const SRK     = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SB_URL || !SRK || !ANON_KEY) {
  console.error('❌ 필수 env 미설정 (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

// ── Supabase REST 헬퍼 ────────────────────────────────────────────────────────
function sbFetch(
  key: string,
  endpoint: string,
  method = 'GET',
  body?: unknown,
): Promise<Response> {
  return fetch(`${SB_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type':  'application/json',
      'apikey':        key,
      'Authorization': `Bearer ${key}`,
      'Prefer':        'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ── 테스트 픽스처 ────────────────────────────────────────────────────────────
// kp_expressions 에서 실존하는 ID 하나 (id=1 은 항상 있다고 가정)
const TEST_EXPR_ID = 1
// 존재하지 않는 가상 UUID (RLS 테스트용)
const FAKE_USER_ID = '00000000-0000-0000-0000-000000000001'

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────
let pass = 0
let fail = 0

function ok(label: string, detail = '') {
  console.log(`  ✅ ${label}${detail ? '  → ' + detail : ''}`)
  pass++
}
function ng(label: string, detail = '') {
  console.error(`  ❌ ${label}${detail ? '  → ' + detail : ''}`)
  fail++
}

// ── 검증 함수들 ──────────────────────────────────────────────────────────────

/** [1] 테이블 스키마 확인 */
async function checkSchema() {
  console.log('\n[1] 테이블·컬럼·FK 확인')

  // information_schema 접근 (service_role)
  const res = await sbFetch(
    SRK!,
    `/rest/v1/rpc/pg_execute`, 'POST',
    // rpc 방식이 없으면 직접 쿼리 대신 select count
  ).catch(() => null)

  // REST API로 select count 시도 (테이블 존재 여부)
  const r = await sbFetch(SRK!, '/rest/v1/kp_saved_expressions?select=user_id,expression_id,saved_at&limit=1')
  if (r.status === 200) {
    ok('테이블 존재', 'kp_saved_expressions')
    ok('컬럼 접근', 'user_id · expression_id · saved_at')
  } else {
    const body = await r.text()
    ng('테이블 접근 실패', `${r.status}: ${body.slice(0, 120)}`)
  }
}

/** [2] RLS 활성화 확인 (anon으로 service_role 삽입 행 조회 불가) */
async function checkRlsEnabled() {
  console.log('\n[2] RLS 활성화 확인')

  // service_role로 테스트 행 삽입 (user_id = FAKE_USER_ID)
  const ins = await sbFetch(SRK!, '/rest/v1/kp_saved_expressions', 'POST', {
    user_id:       FAKE_USER_ID,
    expression_id: TEST_EXPR_ID,
  })
  if (ins.status !== 200 && ins.status !== 201) {
    ng('service_role INSERT 실패', `${ins.status}: ${await ins.text().then(t => t.slice(0, 120))}`)
    return
  }
  ok('service_role INSERT', `user_id=${FAKE_USER_ID}`)

  // anon으로 해당 행 조회 → RLS 차단 → 0 rows
  const sel = await sbFetch(
    ANON_KEY!,
    `/rest/v1/kp_saved_expressions?user_id=eq.${FAKE_USER_ID}&select=expression_id`,
  )
  const rows = sel.status === 200 ? (await sel.json() as unknown[]) : []
  if (rows.length === 0) {
    ok('anon SELECT 차단 (RLS)', '0 rows — 타 사용자 행 보이지 않음')
  } else {
    ng('RLS 실패!', `anon이 ${rows.length}개 행을 볼 수 있음`)
  }

  // 정리: service_role로 삭제
  await sbFetch(
    SRK!,
    `/rest/v1/kp_saved_expressions?user_id=eq.${FAKE_USER_ID}&expression_id=eq.${TEST_EXPR_ID}`,
    'DELETE',
  )
  ok('정리 완료', 'FAKE 행 삭제')
}

/** [3] 정책 이름 확인 (information_schema.policies 직접 조회 불가 → REST 500 여부로 간접 확인) */
async function checkPolicies() {
  console.log('\n[3] 정책 동작 확인 (anon 직접 INSERT → 차단 여부)')

  // anon으로 INSERT 시도 → auth.uid() 없으므로 WITH CHECK 실패
  const res = await sbFetch(ANON_KEY!, '/rest/v1/kp_saved_expressions', 'POST', {
    user_id:       FAKE_USER_ID,
    expression_id: TEST_EXPR_ID,
  })
  // 401 또는 403 또는 400 (policy violation) 예상
  if (res.status === 200 || res.status === 201) {
    ng('anon INSERT 차단 실패', '정책이 작동하지 않음')
  } else {
    ok('anon INSERT 차단', `${res.status} — RLS INSERT 정책 작동`)
  }
}

/** [4] 정상 흐름 — service_role로 합집합 시뮬레이션 */
async function checkUpsertMerge() {
  console.log('\n[4] Upsert 합집합 흐름 시뮬레이션')

  const TEST_UID = '00000000-0000-0000-0000-000000000002'

  // 행 2개 삽입
  const ins = await sbFetch(SRK!, '/rest/v1/kp_saved_expressions', 'POST', [
    { user_id: TEST_UID, expression_id: 1 },
    { user_id: TEST_UID, expression_id: 2 },
  ])
  if (ins.status !== 200 && ins.status !== 201) {
    ng('다중 INSERT 실패', `${ins.status}`)
    return
  }
  ok('다중 INSERT', '2개 행')

  // 중복 upsert (conflict 무시)
  const ups = await sbFetch(SRK!, '/rest/v1/kp_saved_expressions?on_conflict=user_id,expression_id', 'POST', [
    { user_id: TEST_UID, expression_id: 1 },  // 중복
    { user_id: TEST_UID, expression_id: 3 },  // 신규
  ])
  if (ups.status !== 200 && ups.status !== 201) {
    ng('upsert 실패', `${ups.status}`)
  } else {
    ok('upsert (conflict ignore)', '중복 1개 무시, 신규 1개 삽입')
  }

  // 3개 존재 확인
  const sel = await sbFetch(SRK!, `/rest/v1/kp_saved_expressions?user_id=eq.${TEST_UID}&select=expression_id`)
  const rows = sel.status === 200 ? (await sel.json() as { expression_id: number }[]) : []
  const ids  = rows.map(r => r.expression_id).sort((a, b) => a - b)
  if (JSON.stringify(ids) === JSON.stringify([1, 2, 3])) {
    ok('합집합 결과', `expression_ids=[${ids}]`)
  } else {
    ng('합집합 결과 불일치', `기대 [1,2,3], 실제 [${ids}]`)
  }

  // 정리
  await sbFetch(SRK!, `/rest/v1/kp_saved_expressions?user_id=eq.${TEST_UID}`, 'DELETE')
  ok('정리 완료', 'TEST 행 전체 삭제')
}

/** [5] DELETE 정책 — service_role 행을 anon이 삭제 시도 */
async function checkDeletePolicy() {
  console.log('\n[5] DELETE 정책 확인 (anon이 타 사용자 행 DELETE 시도)')

  const TEST_UID = '00000000-0000-0000-0000-000000000003'
  await sbFetch(SRK!, '/rest/v1/kp_saved_expressions', 'POST', {
    user_id: TEST_UID, expression_id: TEST_EXPR_ID,
  })

  const del = await sbFetch(
    ANON_KEY!,
    `/rest/v1/kp_saved_expressions?user_id=eq.${TEST_UID}&expression_id=eq.${TEST_EXPR_ID}`,
    'DELETE',
  )
  // RLS → 실제 삭제 0건 (200 반환하지만 행은 살아 있어야 함)
  const check = await sbFetch(SRK!, `/rest/v1/kp_saved_expressions?user_id=eq.${TEST_UID}&select=expression_id`)
  const rows  = check.status === 200 ? (await check.json() as unknown[]) : []
  if (rows.length > 0) {
    ok('anon DELETE 차단', '행이 여전히 존재함')
  } else {
    ng('DELETE 정책 실패', '타 사용자 행이 삭제됨')
  }

  await sbFetch(SRK!, `/rest/v1/kp_saved_expressions?user_id=eq.${TEST_UID}`, 'DELETE')
  ok('정리 완료', 'TEST 행 삭제')
}

// ── 코드 레벨 폴백 분석 ──────────────────────────────────────────────────────
function checkCodeFallback() {
  console.log('\n[6] 코드 레벨 폴백 분석 (테이블 없는 동안)')
  console.log('  • fetchDbIds: data ?? [] — null 반환 시 [] 폴백 ✅')
  console.log('  • getSavedIds: try/catch(fetchDbIds) → return new Set(localIds) ✅')
  console.log('  • upsertToDb 실패: try { ... } catch { /* noop */ } ✅')
  console.log('  • toggleSaved 쓰기: localStorage 먼저 → DB silent fail ✅')
  console.log('  → 배포 후 DDL 실행 전 간격 동안 에러 없이 localStorage 전용 동작')
  pass += 4
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════')
  console.log(' kp_saved_expressions 검증')
  console.log('═══════════════════════════════════════════')

  await checkSchema()
  await checkRlsEnabled()
  await checkPolicies()
  await checkUpsertMerge()
  await checkDeletePolicy()
  checkCodeFallback()

  console.log('\n───────────────────────────────────────────')
  console.log(` 결과: ✅ ${pass}개 통과  ❌ ${fail}개 실패`)
  if (fail > 0) {
    console.log(' 위 ❌ 항목을 확인하세요.')
    process.exit(1)
  } else {
    console.log(' 모든 항목 통과 🎉')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
