// K-Pantry 잠긴 레시피 단계 보호 확인 — scripts/sql/kpantry-recipe-lock-04-rls.sql 적용 뒤 실행.
//
//   node scripts/sql/verify-kpantry-recipe-lock.mjs
//
// 1) 공개 키(anon): 잠긴 레시피 단계 0행, 무료 레시피 단계는 읽힘, 전체 보이는 단계 = 무료 레시피 단계 수
// 2) 로그인 Pro 구독자(authenticated + 활성 구독): 잠긴 레시피 단계가 읽힘
//    — 기존 auth 사용자 한 명으로 트랜잭션 안에서 구독 행을 만들고 확인한 뒤 ROLLBACK (DB 에 남기지 않는다)
// 3) 로그인 일반 사용자: 잠긴 단계 0행, 자기 구독 행을 직접 INSERT 하면 거부
import { createClient } from '@supabase/supabase-js'
import pg from 'pg'
import { config } from 'dotenv'

config({ path: '.env.local', quiet: true })
const clean = v => (v ?? '').replace(/^﻿/, '').trim()
const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
if (!url.includes('eecvvgkihtcgfikaimao')) throw new Error(`not the patto project: ${url}`)

const LOCKED = 'galbi-jjim'
const FREE = 'bibimbap'
let failed = 0
const check = (label, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`); if (!ok) failed++ }

// ── 1. anon ──
const anon = createClient(url, anonKey, { auth: { persistSession: false } })
const recipeId = async slug => (await anon.from('pantry_recipes').select('id').eq('slug', slug).single()).data.id
const lockedId = await recipeId(LOCKED)
const freeId = await recipeId(FREE)

const lockedAnon = await anon.from('pantry_recipe_steps').select('id, description').eq('recipe_id', lockedId)
check(`anon: locked "${LOCKED}" steps blocked`, !lockedAnon.error && lockedAnon.data.length === 0, `${lockedAnon.data?.length} rows`)
const freeAnon = await anon.from('pantry_recipe_steps').select('id').eq('recipe_id', freeId)
check(`anon: free "${FREE}" steps readable`, !freeAnon.error && freeAnon.data.length > 0, `${freeAnon.data?.length} rows`)
const embedded = await anon.from('pantry_recipes').select('slug, pantry_recipe_steps(id)').eq('slug', LOCKED).single()
check('anon: embedded select (old client path) returns no locked steps', embedded.data?.pantry_recipe_steps?.length === 0, `${embedded.data?.pantry_recipe_steps?.length} rows`)
const allAnon = await anon.from('pantry_recipe_steps').select('id', { count: 'exact', head: true })

// ── 2·3. authenticated (SQL role switch, rolled back) ──
const pw = clean(process.env.PG_PASSWORD) || clean(process.env.PG_DIRECT_URL).match(/:\/\/[^:]+:([^@/\s]+)/)?.[1]
const db = new pg.Client({ host: 'aws-1-ap-northeast-2.pooler.supabase.com', port: 5432, database: 'postgres', user: 'postgres.eecvvgkihtcgfikaimao', password: pw, ssl: { rejectUnauthorized: false } })
await db.connect()
const freeSteps = (await db.query('select count(*)::int n from pantry_recipe_steps s join pantry_recipes r on r.id = s.recipe_id where r.is_free')).rows[0].n
check('anon: visible steps total == free recipes\' steps', allAnon.count === freeSteps, `${allAnon.count} vs ${freeSteps}`)

const { rows: [u] } = await db.query('select id from auth.users order by created_at limit 1')
if (!u) {
  console.log('SKIP  no auth user to simulate a subscriber')
} else {
  const asUser = async fn => {
    await db.query('begin')
    try {
      await db.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: u.id, role: 'authenticated' })])
      await db.query('set local role authenticated')
      return await fn()
    } finally { await db.query('rollback') }
  }
  const lockedCount = () => db.query('select count(*)::int n from pantry_recipe_steps where recipe_id = $1', [lockedId]).then(r => r.rows[0].n)

  const plain = await asUser(lockedCount)
  check('logged-in, no subscription: locked steps blocked', plain === 0, `${plain} rows`)

  const selfInsert = await asUser(async () => {
    try { await db.query(`insert into pantry_subscriptions (user_id, plan, status) values ($1, 'pro', 'active')`, [u.id]); return 'inserted' }
    catch (e) { return e.message }
  })
  check('logged-in user cannot self-activate Pro', selfInsert !== 'inserted', selfInsert)

  // 구독 행은 서비스 롤(postgres)로 만들고, 같은 트랜잭션에서 authenticated 로 읽어 본 뒤 통째로 되돌린다
  await db.query('begin')
  let pro
  try {
    await db.query(`delete from pantry_subscriptions where user_id = $1`, [u.id])
    await db.query(`insert into pantry_subscriptions (user_id, plan, status) values ($1, 'pro', 'active')`, [u.id])
    await db.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: u.id, role: 'authenticated' })])
    await db.query('set local role authenticated')
    pro = (await db.query('select count(*)::int n from pantry_recipe_steps where recipe_id = $1', [lockedId])).rows[0].n
  } finally { await db.query('rollback') }
  check('logged-in Pro subscriber: locked steps readable', pro > 0, `${pro} rows`)
  const left = (await db.query('select count(*)::int n from pantry_subscriptions')).rows[0].n
  check('no test subscription row left behind', left === 0, `${left} rows`)
}
await db.end()

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed')
process.exit(failed ? 1 : 0)
