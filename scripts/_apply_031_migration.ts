/**
 * migration 031: kp_dialogue_expressions SELECT 정책 적용
 * pg_direct_url을 사용해 직접 DDL 실행
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// .env.local을 수동 파싱 (@ 문자 때문에 dotenv 파싱 실패)
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
// PG_DIRECT_URL이 두 줄에 걸쳐 있으므로 수동으로 조합
const pgUrlMatch = envContent.match(/PG_DIRECT_URL=([^\n]+)\n([^\n]+)/)
let PG_URL = ''
if (pgUrlMatch) {
  PG_URL = pgUrlMatch[1] + pgUrlMatch[2]
} else {
  // 한 줄로 되어 있는 경우
  const m = envContent.match(/PG_DIRECT_URL=(.+)/)
  PG_URL = m?.[1]?.trim() ?? ''
}

if (!PG_URL) throw new Error('PG_DIRECT_URL을 찾을 수 없음')
console.log(`DB URL: ${PG_URL.replace(/:([^@]+)@/, ':***@')}`)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Client } = require('pg')

const SQL = `
ALTER TABLE kp_dialogue_expressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kp_dialogue_expressions_public_read" ON kp_dialogue_expressions;

CREATE POLICY "kp_dialogue_expressions_public_read"
  ON kp_dialogue_expressions FOR SELECT TO anon, authenticated
  USING (true);
`

async function main() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('DB 연결 성공')

  try {
    await client.query(SQL)
    console.log('✅ 마이그레이션 031 적용 완료')

    // 정책 확인
    const res = await client.query(`
      SELECT policyname, cmd, roles
      FROM pg_policies
      WHERE tablename = 'kp_dialogue_expressions'
    `)
    console.log('\n적용된 정책:')
    for (const row of res.rows) {
      console.log(`  ${row.policyname}  cmd=${row.cmd}  roles=${row.roles}`)
    }
  } finally {
    await client.end()
  }
}

main().catch(e => { console.error('⛔', e.message); process.exit(1) })
