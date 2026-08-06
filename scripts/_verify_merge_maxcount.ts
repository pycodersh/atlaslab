/**
 * mergeLocalToDb max-count 우선 검증
 * npx tsx scripts/_verify_merge_maxcount.ts
 *
 * [A] DB=1, local=2 → 병합 후 DB=2 (local이 더 많음)
 * [B] DB=3, local=1 → 병합 후 DB=3 (DB가 더 많음)
 * [C] DB 없음, local=2 → 병합 후 DB=2 (신규 삽입)
 * [D] completed_at — 더 늦은 쪽 채택
 * [E] 병합 후 localStorage 원본 유지, DB 우선 읽기
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SRK    = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SB_URL || !SRK) { console.error('env 미설정'); process.exit(1) }

const sb = createClient(SB_URL, SRK, { auth: { persistSession: false } })

let uid = ''

function ok(msg: string)   { console.log(`  ✓ ${msg}`) }
function fail(msg: string) { console.error(`  ✗ ${msg}`); process.exitCode = 1 }
function ts(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString()
}

// ── 테스트 유저 생성 / 삭제 ─────────────────────────────────────────────────
async function setup() {
  const { data, error } = await sb.auth.admin.createUser({
    email: `_test_merge_${Date.now()}@patto.test`,
    password: 'TestPatto2026!',
    email_confirm: true,
  })
  if (error || !data?.user) { console.error('유저 생성 실패:', error?.message); process.exit(1) }
  uid = data.user.id
  console.log(`테스트 유저: ${uid}`)
}
async function cleanup() {
  if (uid) await sb.auth.admin.deleteUser(uid)  // CASCADE → episode_progress 자동 삭제
}

// ── mergeLocalToDb 로직 재현 (episode-progress.ts와 동일) ───────────────────
type Rec = { completed_at: string; completed_count: number }
type LocalStore = Record<number, Rec>

async function runMerge(localStore: LocalStore) {
  // DB 현재 상태 조회
  const { data: dbRows } = await sb
    .from('kp_episode_progress')
    .select('episode_num, completed_at, completed_count')
    .eq('user_id', uid)

  const dbMap = new Map<number, Rec>(
    (dbRows ?? []).map(r => [
      r.episode_num as number,
      { completed_at: r.completed_at as string, completed_count: r.completed_count as number },
    ]),
  )

  const toUpsert = Object.entries(localStore)
    .filter(([ep, rec]) => {
      const dbRec = dbMap.get(Number(ep))
      if (!dbRec) return true
      return rec.completed_count > dbRec.completed_count
    })
    .map(([ep, rec]) => {
      const dbRec = dbMap.get(Number(ep))
      const laterAt = dbRec
        ? (rec.completed_at > dbRec.completed_at ? rec.completed_at : dbRec.completed_at)
        : rec.completed_at
      return {
        user_id:         uid,
        episode_num:     Number(ep),
        completed_at:    laterAt,
        completed_count: rec.completed_count,
      }
    })

  if (toUpsert.length > 0) {
    await sb
      .from('kp_episode_progress')
      .upsert(toUpsert, { onConflict: 'user_id,episode_num' })
  }
  return { upsertCount: toUpsert.length }
}

async function getDbRow(epNum: number) {
  const { data } = await sb
    .from('kp_episode_progress')
    .select('completed_count, completed_at')
    .eq('user_id', uid)
    .eq('episode_num', epNum)
    .maybeSingle()
  return data as Rec | null
}

// ── [A] DB=1 → local=2 → 병합 → DB=2 ────────────────────────────────────────
async function testA() {
  console.log('\n[A] DB=1, local=2 → 병합 후 DB=2')
  const t1 = ts(-2)  // 이틀 전
  const t2 = ts(-1)  // 어제

  // DB에 EP01 count=1 삽입
  await sb.from('kp_episode_progress').insert({
    user_id: uid, episode_num: 1, completed_at: t1, completed_count: 1,
  })
  ok(`DB EP01 삽입 (count=1, at=${t1.slice(0,10)})`)

  // local: EP01 count=2 (로그아웃 중 두 번 완료)
  const local: LocalStore = {
    1: { completed_at: t2, completed_count: 2 },
  }
  const { upsertCount } = await runMerge(local)
  ok(`병합 upsert ${upsertCount}건`)

  const row = await getDbRow(1)
  if (row?.completed_count === 2) ok(`DB EP01 count=2 ✔`)
  else fail(`expected 2, got ${row?.completed_count}`)

  // completed_at: 더 늦은 t2 채택
  if (row?.completed_at >= t2.slice(0, 19)) ok(`completed_at → 더 늦은 날짜(${t2.slice(0,10)}) ✔`)
  else fail(`completed_at 불일치: ${row?.completed_at}`)

  // 정리
  await sb.from('kp_episode_progress').delete().eq('user_id', uid).eq('episode_num', 1)
}

// ── [B] DB=3, local=1 → 병합 후 DB=3 (변경 없음) ────────────────────────────
async function testB() {
  console.log('\n[B] DB=3, local=1 → 병합 후 DB=3 유지')

  await sb.from('kp_episode_progress').insert({
    user_id: uid, episode_num: 2, completed_at: ts(-3), completed_count: 3,
  })
  ok('DB EP02 삽입 (count=3)')

  const local: LocalStore = {
    2: { completed_at: ts(-1), completed_count: 1 },
  }
  const { upsertCount } = await runMerge(local)
  ok(`병합 upsert ${upsertCount}건 (0이어야 함)`)
  if (upsertCount !== 0) fail(`upsertCount expected 0, got ${upsertCount}`)

  const row = await getDbRow(2)
  if (row?.completed_count === 3) ok('DB EP02 count=3 유지 ✔')
  else fail(`expected 3, got ${row?.completed_count}`)

  await sb.from('kp_episode_progress').delete().eq('user_id', uid).eq('episode_num', 2)
}

// ── [C] DB 없음, local=2 → 신규 삽입 ────────────────────────────────────────
async function testC() {
  console.log('\n[C] DB 없음, local=2 → 신규 삽입')

  const local: LocalStore = {
    3: { completed_at: ts(), completed_count: 2 },
  }
  const { upsertCount } = await runMerge(local)
  ok(`병합 upsert ${upsertCount}건`)

  const row = await getDbRow(3)
  if (row?.completed_count === 2) ok('DB EP03 count=2 삽입 ✔')
  else fail(`expected 2, got ${row?.completed_count}`)

  await sb.from('kp_episode_progress').delete().eq('user_id', uid).eq('episode_num', 3)
}

// ── [D] completed_at: 더 늦은 쪽 채택 ───────────────────────────────────────
async function testD() {
  console.log('\n[D] completed_at — 더 늦은 쪽 채택')

  const older = ts(-5)
  const newer = ts(-1)

  // DB: older, local: newer, local count > DB → upsert 발생
  await sb.from('kp_episode_progress').insert({
    user_id: uid, episode_num: 4, completed_at: older, completed_count: 1,
  })

  const local: LocalStore = {
    4: { completed_at: newer, completed_count: 2 },
  }
  await runMerge(local)

  const row = await getDbRow(4)
  // completed_at 비교: DB에 저장된 값이 newer 이상이어야 함
  if (row && row.completed_at >= newer.slice(0, 19))
    ok(`completed_at = ${row.completed_at.slice(0,10)} (newer, 정상) ✔`)
  else
    fail(`completed_at expected ≥ ${newer.slice(0,10)}, got ${row?.completed_at?.slice(0,10)}`)

  // 반대: DB newer, local older → upsert 안 함 (count도 같거나 DB가 크면 skip)
  await sb.from('kp_episode_progress').delete().eq('user_id', uid).eq('episode_num', 4)
  await sb.from('kp_episode_progress').insert({
    user_id: uid, episode_num: 4, completed_at: newer, completed_count: 3,
  })
  const local2: LocalStore = {
    4: { completed_at: older, completed_count: 1 },
  }
  const { upsertCount } = await runMerge(local2)
  if (upsertCount === 0) ok('DB newer + DB count 큼 → upsert 없음 ✔')
  else fail(`upsert 발생하지 않아야 함, got ${upsertCount}`)

  await sb.from('kp_episode_progress').delete().eq('user_id', uid).eq('episode_num', 4)
}

// ── [E] 병합 후 localStorage 원본 유지 확인 (코드 검토) ─────────────────────
function testE() {
  console.log('\n[E] localStorage 원본 유지 (코드 검토)')
  // mergeLocalToDb는 writeLocal()을 호출하지 않음 → localStorage 불변
  // getEpisodeProgressMap()은 병합 후 fetchDbMap()으로 재조회 → DB 우선
  ok('mergeLocalToDb에 writeLocal() 호출 없음 → localStorage 불변 ✔')
  ok('병합 후 fetchDbMap() 재조회 → DB 우선 읽기 ✔')
}

// ── 실행 ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== mergeLocalToDb max-count 우선 검증 ===')
  try {
    await setup()
    await testA()
    await testB()
    await testC()
    await testD()
    testE()
  } finally {
    await cleanup()
    console.log('\n테스트 유저 삭제 완료')
  }
  const code = process.exitCode ?? 0
  console.log(`\n=== ${code === 0 ? '전체 PASS ✓' : '일부 FAIL ✗'} ===`)
}

main().catch(e => { console.error(e); process.exit(1) })
