import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const DIALOGUES = [
  { key: 'ep02-c1-b1', ko: '와... 사람이 너무 많다!',              en: 'Wow... there are so many people!',              character: 'emma' },
  { key: 'ep02-c2-b1', ko: '저기요, 홍대 어떻게 가요?',             en: 'Excuse me, how do I get to Hongdae?',            character: 'emma' },
  { key: 'ep02-c3-b1', ko: '지수야! 홍대 가고 싶어요... 어디예요?',  en: 'Jisu! I want to go to Hongdae... where is it?',  character: 'emma' },
  { key: 'ep02-c3-b2', ko: '에마야! 여기서 뭐 해?',                 en: 'Emma! What are you doing here?',                character: 'jisu' },
  { key: 'ep02-c4-b1', ko: '표 두 장 주세요!',                      en: 'Two tickets, please!',                          character: 'emma' },
  { key: 'ep02-c4-b2', ko: '완벽해!',                               en: 'Perfect!',                                      character: 'jisu' },
  { key: 'ep02-c5-b1', ko: '와, 서울 진짜 좋아요!',                 en: 'Wow, I really like Seoul!',                     character: 'emma' },
  { key: 'ep02-c5-b2', ko: '그치? 나도 좋아!',                      en: 'Right? Me too!',                                character: 'jisu' },
]

export async function GET() {
  const supabase = createAdminClient()

  // 1. Try upsert — succeeds if table already exists
  const { error: upsertError } = await supabase
    .from('kpatto_dialogues')
    .upsert(DIALOGUES, { onConflict: 'key' })

  if (!upsertError) {
    return NextResponse.json({ ok: true, inserted: DIALOGUES.length })
  }

  // 2. Table missing — try creating via pg REST endpoint with service role key
  const tableNotFound =
    upsertError.code === '42P01' ||
    upsertError.message?.includes('kpatto_dialogues')

  if (tableNotFound) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY)!
    const createSql = `
      CREATE TABLE IF NOT EXISTS public.kpatto_dialogues (
        key text PRIMARY KEY, ko text NOT NULL, en text NOT NULL, character text NOT NULL
      );
    `
    // Try Supabase pg SQL endpoint (available on some plans)
    const pgRes = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query: createSql }),
    })

    if (pgRes.ok) {
      // Table created — retry upsert
      const { error: retryErr } = await supabase
        .from('kpatto_dialogues')
        .upsert(DIALOGUES, { onConflict: 'key' })
      if (!retryErr) {
        return NextResponse.json({ ok: true, inserted: DIALOGUES.length, note: 'table created' })
      }
    }

    // Cannot auto-create — return DDL for manual run
    return NextResponse.json({
      ok: false,
      action: 'run_ddl_in_supabase_sql_editor',
      sql: `CREATE TABLE IF NOT EXISTS public.kpatto_dialogues (
  key       text PRIMARY KEY,
  ko        text NOT NULL,
  en        text NOT NULL,
  character text NOT NULL
);`,
    }, { status: 409 })
  }

  return NextResponse.json({ ok: false, error: upsertError.message }, { status: 500 })
}
