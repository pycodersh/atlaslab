import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

async function main() {
  // 1. auth.users 전체 조회 (이메일 + 가입일 확인)
  const { data: { users }, error: authErr } = await sb.auth.admin.listUsers({ perPage: 1000 })
  if (authErr) { console.error('auth error:', authErr); return }

  console.log('=== 전체 auth.users ===')
  users.forEach(u => console.log(`  ${u.email ?? '(no email)'}  |  created: ${u.created_at}  |  id: ${u.id}`))

  // 2. Jul 25 근처 가입자 필터
  const recent = users.filter(u => u.created_at >= '2026-07-24' && u.created_at <= '2026-07-27')
  console.log(`\n=== Jul 24~26 가입자 (${recent.length}명) ===`)
  recent.forEach(u => console.log(JSON.stringify({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in: u.last_sign_in_at })))

  // 3. user_profiles 컬럼 구조 확인 (첫 행)
  const { data: sample, error: profileErr } = await sb
    .from('user_profiles')
    .select('*')
    .limit(3)
  console.log('\n=== user_profiles 구조 (샘플 3행) ===')
  console.log(JSON.stringify(sample, null, 2))
  if (profileErr) console.error('profile error:', profileErr)

  // 4. subscriptions 컬럼 구조 확인
  const { data: subSample, error: subErr } = await sb
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  console.log('\n=== subscriptions 최근 5행 ===')
  console.log(JSON.stringify(subSample, null, 2))
  if (subErr) console.error('sub error:', subErr)
}

main().catch(console.error)
