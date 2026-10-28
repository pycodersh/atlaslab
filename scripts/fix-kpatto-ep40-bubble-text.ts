/**
 * K-PATTO ep40 말풍선 3703 문구를 연결된 대사(11352)와 맞춘다 (2026-10-28 말풍선 전수 점검에서 발견).
 *
 * 말풍선은 dialogue_id 로 대사에 연결돼 있어 앱은 대사 문구를 보여 준다 — 「그래도 나라마다 달라요. 그게 재미있어요.」
 * 말풍선 자체 korean 만 옛 문구(「…달라서 재미있어요.」)로 남아 있어, 내보내기 · 편집기에서 다르게 보였다.
 * 화면에 보이는 것은 그대로다. 하이라이트(#885 「마다 달라요」)도 대사 문구 기준이라 바뀌지 않는다.
 *
 * 실행: npx tsx scripts/fix-kpatto-ep40-bubble-text.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const FROM = '그래도 나라마다 달라서 재미있어요.'

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) {
    throw new Error('patto Supabase 가 아니다 — 중단')
  }
  const { data: d, error: dErr } = await sb.from('kp_dialogues').select('text_ko').eq('id', 11352).single()
  if (dErr) throw new Error(dErr.message)
  const to = d.text_ko as string

  const { data, error } = await sb.from('kp_bubbles')
    .update({ korean: to }).eq('id', 3703).eq('dialogue_id', 11352).eq('korean', FROM).select('id, korean')
  if (error) throw new Error(error.message)
  if (data?.length) { console.log(`✅ kp_bubbles 3703 → ${data[0].korean}`); return }
  const { data: cur } = await sb.from('kp_bubbles').select('korean').eq('id', 3703).single()
  console.log(cur?.korean === to ? '· kp_bubbles 3703 이미 적용됨' : `⚠ kp_bubbles 3703 값이 달라 건너뜀: "${cur?.korean}"`)
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
