/**
 * kp_episode_progress 검증 스크립트
 * npx tsx scripts/_verify_ep_progress.ts
 *
 * [1] completed_count +1 (동일 화 두 번 완료)
 * [2] localStorage → DB 병합 시뮬레이션 (DB 우선)
 * [3] RLS: anon key로 타 사용자 행 차단
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SRK     = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANON    = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
               ?? process.env.NEXT_PUBLIC_ANON_KEY
               ?? ''

if (!SB_URL || !SRK) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 미설정')
  process.exit(1)
}

const sb     = createClient(SB_URL, SRK,  { auth: { persistSession: false } })
const sbAnon = createClient(SB_URL, ANON, { auth: { persistSession: false } })

let uidA = ''
let uidB = ''

function ok(msg: string)   { console.log(`  ✓ ${msg}`) }
function fail(msg: string) { console.error(`  ✗ ${msg}`); process.exitCode = 1 }
function now()             { return new Date().toISOString() }

// ── 테스트 유저 생성 ──────────────────────────────────────────────────────────
async function setup() {
  const { data: a, error: ea } = await sb.auth.admin.createUser({
    email: `_test_a_${Date.now()}@patto.test`,
    password: 'TestPatto2026!',
    email_confirm: true,
  })
  const { data: b, error: eb } = await sb.auth.admin.createUser({
    email: `_test_b_${Date.now()}@patto.test`,
    password: 'TestPatto2026!',
    email_confirm: true,
  })
  if (ea || eb || !a?.user || !b?.user) {
    console.error('테스트 유저 생성 실패:', ea?.message ?? eb?.message)
    process.exit(1)
  }
  uidA = a.user.id
  uidB = b.user.id
  console.log(`테스트 유저 A: ${uidA}`)
  console.log(`테스트 유저 B: ${uidB}`)
}

// ── 정리 ──────────────────────────────────────────────────────────────────────
async function cleanup() {
  // ON DELETE CASCADE 로 episode_progress 자동 삭제
  if (uidA) await sb.auth.admin.deleteUser(uidA)
  if (uidB) await sb.auth.admin.deleteUser(uidB)
}

// ── [1] completed_count +1 ────────────────────────────────────────────────────
async function test1() {
  console.log('\n[1] completed_count +1 (동일 화 두 번 완료)')

  // 1회차 삽입
  const { error: e1 } = await sb.from('kp_episode_progress').insert({
    user_id: uidA, episode_num: 1, completed_at: now(), completed_count: 1,
  })
  if (e1) { fail(`1회 삽입 실패: ${e1.message}`); return }
  ok('1회차 삽입 (count=1)')

  // 2회차: read → +1 → upsert  (markEpisodeComplete 로직과 동일)
  const { data: existing } = await sb
    .from('kp_episode_progress')
    .select('completed_count')
    .eq('user_id', uidA)
    .eq('episode_num', 1)
    .maybeSingle()

  const nextCount = (existing?.completed_count ?? 0) + 1

  const { error: e2 } = await sb.from('kp_episode_progress').upsert(
    { user_id: uidA, episode_num: 1, completed_at: now(), completed_count: nextCount },
    { onConflict: 'user_id,episode_num' },
  )
  if (e2) { fail(`2회 upsert 실패: ${e2.message}`); return }

  // 최종 확인
  const { data: row } = await sb
    .from('kp_episode_progress')
    .select('completed_count')
    .eq('user_id', uidA)
    .eq('episode_num', 1)
    .single()

  if (row?.completed_count === 2) ok('completed_count = 2 ✔')
  else fail(`expected 2, got ${row?.completed_count}`)
}

// ── [2] localStorage → DB 병합 (DB 우선) ─────────────────────────────────────
async function test2() {
  console.log('\n[2] localStorage → DB 병합 (DB 우선)')

  // DB에 EP02 미리 삽입 (count=3 — 유저 B가 이미 두 번 더 완료한 상태 시뮬레이션)
  const { error: pre } = await sb.from('kp_episode_progress').insert({
    user_id: uidB, episode_num: 2, completed_at: now(), completed_count: 3,
  })
  if (pre) { fail(`DB EP02 삽입 실패: ${pre.message}`); return }
  ok('DB EP02 삽입 (count=3)')

  // "localStorage" 레코드: EP01·EP02·EP03
  const localRecords = [
    { episode_num: 1, completed_at: now(), completed_count: 1 },
    { episode_num: 2, completed_at: now(), completed_count: 1 }, // 충돌 — DB에 이미 있음
    { episode_num: 3, completed_at: now(), completed_count: 2 },
  ]

  // DB 현재 상태 조회 (mergeLocalToDb와 동일 로직)
  const { data: dbRows } = await sb
    .from('kp_episode_progress')
    .select('episode_num, completed_count')
    .eq('user_id', uidB)

  const dbMap = new Map(
    (dbRows ?? []).map(r => [r.episode_num as number, r.completed_count as number]),
  )

  // DB에 없는 항목만 INSERT
  const toInsert = localRecords
    .filter(r => !dbMap.has(r.episode_num))
    .map(r => ({ user_id: uidB, ...r }))

  if (toInsert.length > 0) {
    const { error } = await sb.from('kp_episode_progress').insert(toInsert)
    if (error) { fail(`병합 삽입 실패: ${error.message}`); return }
  }
  ok(`병합 ${toInsert.length}건 삽입 (EP01·EP03 → DB, EP02 스킵)`)

  // 결과 검증
  const { data: final } = await sb
    .from('kp_episode_progress')
    .select('episode_num, completed_count')
    .eq('user_id', uidB)
    .order('episode_num')

  const ep1 = final?.find(r => r.episode_num === 1)
  const ep2 = final?.find(r => r.episode_num === 2)
  const ep3 = final?.find(r => r.episode_num === 3)

  if (ep1?.completed_count === 1) ok('EP01: count=1 (local → DB)')
  else fail(`EP01: expected 1, got ${ep1?.completed_count}`)

  if (ep2?.completed_count === 3) ok('EP02: count=3 (DB 우선 — local count=1 무시)')
  else fail(`EP02: expected 3 (DB), got ${ep2?.completed_count}`)

  if (ep3?.completed_count === 2) ok('EP03: count=2 (local → DB)')
  else fail(`EP03: expected 2, got ${ep3?.completed_count}`)
}

// ── [3] RLS: anon key로 타 사용자 행 차단 ─────────────────────────────────────
async function test3() {
  console.log('\n[3] RLS — anon key (비로그인) 로 타 사용자 행 차단')

  if (!ANON) {
    console.log('  ⚠ anon key 미설정, 스킵')
    return
  }

  // uidA의 EP01 행이 이미 test1()에서 삽입되어 있음
  // anon 클라이언트: auth.uid() = NULL → USING (auth.uid() = user_id) → 항상 false → 0건
  const { data: sel, error: se } = await sbAnon
    .from('kp_episode_progress')
    .select('episode_num')
    .eq('user_id', uidA)

  if (se)                         ok(`SELECT 차단 (에러: ${se.message})`)
  else if (!sel || sel.length === 0) ok('SELECT 차단 (0건 반환 — RLS 정책 작동)')
  else                            fail(`SELECT 차단 실패: ${sel.length}건 노출`)

  // UPDATE 시도
  const { data: upd, error: ue } = await sbAnon
    .from('kp_episode_progress')
    .update({ completed_count: 999 })
    .eq('user_id', uidA)
    .select('completed_count')

  if (ue)                         ok(`UPDATE 차단 (에러: ${ue.message})`)
  else if (!upd || upd.length === 0) ok('UPDATE 차단 (영향 행 0건 — RLS silent block)')
  else                            fail(`UPDATE 차단 실패: count = ${upd[0]?.completed_count}`)

  // DB 실제 값 재확인 (count=999로 변경되지 않았는지)
  const { data: actual } = await sb
    .from('kp_episode_progress')
    .select('completed_count')
    .eq('user_id', uidA)
    .eq('episode_num', 1)
    .single()

  if (actual?.completed_count !== 999) ok(`실제 DB 값 유지: count=${actual?.completed_count} (999 아님)`)
  else                                 fail('DB 값이 999로 변경됨 — RLS 우회 발생!')
}

// ── 실행 ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== kp_episode_progress 검증 시작 ===\n')
  try {
    await setup()
    await test1()
    await test2()
    await test3()
  } finally {
    await cleanup()
    console.log('\n테스트 유저 삭제 완료 (ON DELETE CASCADE → 진행도 행도 삭제)')
  }
  const code = process.exitCode ?? 0
  console.log(`\n=== ${code === 0 ? '전체 PASS ✓' : '일부 FAIL ✗'} ===`)
}

main().catch(e => { console.error(e); process.exit(1) })
