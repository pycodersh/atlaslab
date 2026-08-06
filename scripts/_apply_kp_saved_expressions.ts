/**
 * kp_saved_expressions 테이블 생성 마이그레이션
 * 승인 일자: 2026-08-06
 * npx tsx scripts/_apply_kp_saved_expressions.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SRK    = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SB_URL || !SRK) { console.error('env 미설정'); process.exit(1) }

// Supabase Management API를 통해 SQL 실행
const PROJECT_REF = SB_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
if (!PROJECT_REF) { console.error('PROJECT_REF 추출 실패'); process.exit(1) }

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS kp_saved_expressions (
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expression_id INT  NOT NULL REFERENCES kp_expressions(id) ON DELETE CASCADE,
    saved_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, expression_id)
  )`,
  `ALTER TABLE kp_saved_expressions ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kp_saved_expressions' AND policyname='kp_se_select') THEN
      CREATE POLICY "kp_se_select" ON kp_saved_expressions FOR SELECT USING (auth.uid() = user_id);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kp_saved_expressions' AND policyname='kp_se_insert') THEN
      CREATE POLICY "kp_se_insert" ON kp_saved_expressions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kp_saved_expressions' AND policyname='kp_se_delete') THEN
      CREATE POLICY "kp_se_delete" ON kp_saved_expressions FOR DELETE USING (auth.uid() = user_id);
    END IF;
  END $$`,
]

async function execSql(sql: string): Promise<void> {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SRK}`,
      },
      body: JSON.stringify({ query: sql }),
    },
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body}`)
  }
}

async function main() {
  console.log(`프로젝트: ${PROJECT_REF}`)
  for (const stmt of STATEMENTS) {
    const preview = stmt.slice(0, 60).replace(/\s+/g, ' ')
    process.stdout.write(`  실행: ${preview}… `)
    try {
      await execSql(stmt)
      console.log('✓')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      // 이미 존재하는 경우 무시
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log('이미 존재, skip ✓')
      } else {
        console.error(`✗ ${msg}`)
        process.exitCode = 1
      }
    }
  }

  // 테이블 존재 확인
  const check = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SRK}` },
      body: JSON.stringify({ query: `SELECT COUNT(*) FROM information_schema.tables WHERE table_name='kp_saved_expressions'` }),
    },
  )
  const checkData = await check.json() as Array<{ count: string }>
  const exists = parseInt(checkData[0]?.count ?? '0') > 0
  if (exists) {
    console.log('\n✓ kp_saved_expressions 테이블 생성 확인')
  } else {
    console.error('\n✗ 테이블 생성 실패')
    process.exitCode = 1
  }
}

main().catch(e => { console.error(e); process.exit(1) })
