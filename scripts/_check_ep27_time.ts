import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  // kp_dialogues의 모든 컬럼 확인 (타임스탬프 컬럼 있는지)
  const { data, error } = await sb
    .from('kp_dialogues')
    .select('*')
    .eq('episode_id', 27)
    .order('id')
    .limit(1)
  if (error) { console.error(error.message); process.exit(1) }
  console.log('EP27 첫 번째 레코드 컬럼 목록:')
  console.log(JSON.stringify(data?.[0], null, 2))

  // Storage에서 EP27 파일 메타데이터 확인
  const { data: files, error: e2 } = await sb.storage.from('audio').list('dialogues/ep27', { limit: 10 })
  if (e2) { console.error('storage error:', e2.message); return }
  console.log('\nStorage dialogues/ep27 파일 목록:')
  for (const f of files ?? []) {
    const kst = f.updated_at
      ? new Date(f.updated_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
      : 'N/A'
    console.log(`  ${f.name}  updated_at(KST): ${kst}  created_at: ${f.created_at ? new Date(f.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : 'N/A'}`)
  }
}
main().catch(e => { console.error(e); process.exit(1) })
