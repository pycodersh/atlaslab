/**
 * K-PATTO ep81 대사 11677 jisu 「알았어, 비밀.」 삭제 (2026-10-28 말풍선 전수 점검에서 발견).
 *
 * 이 대사를 보여 줄 말풍선이 없어 앱에 한 번도 나오지 않았다(ep81: 대사 8 · 말풍선 7).
 * 패턴 하이라이트 링크가 없을 때만, 문구 · 화자가 처음 확인한 그대로일 때만 지운다.
 * 음성 파일(audio/dialogues/ep81/11677.wav)은 스토리지에 남는다 — 아무 데서도 가리키지 않는다.
 *
 * 실행: npx tsx scripts/delete-kpatto-ep81-orphan-dialogue.ts
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

const ID = 11677

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) {
    throw new Error('patto Supabase 가 아니다 — 중단')
  }
  const { data: cur } = await sb.from('kp_dialogues').select('id, episode_id, speaker, text_ko').eq('id', ID).maybeSingle()
  if (!cur) { console.log(`· kp_dialogues ${ID} 이미 지워짐`); return }

  const links = await sb.from('kp_dialogue_expressions').select('id', { count: 'exact', head: false }).eq('dialogue_id', ID).range(0, 0)
  const bubbles = await sb.from('kp_bubbles').select('id', { count: 'exact', head: false }).eq('dialogue_id', ID).range(0, 0)
  if (links.count == null || bubbles.count == null) throw new Error('확인 쿼리 count 가 null')
  if (links.count || bubbles.count) { console.log(`⚠ 아직 가리키는 행이 있어 건너뜀 — links ${links.count}, bubbles ${bubbles.count}`); return }

  const { data, error } = await sb.from('kp_dialogues').delete()
    .eq('id', ID).eq('episode_id', 81).eq('speaker', 'jisu').eq('text_ko', '알았어, 비밀.').select('id')
  if (error) throw new Error(error.message)
  console.log(data?.length ? `✅ kp_dialogues ${ID} 삭제 (ep81 jisu 「알았어, 비밀.」)` : `⚠ 값이 달라 건너뜀: ${JSON.stringify(cur)}`)

  const left = await sb.from('kp_dialogues').select('id', { count: 'exact', head: false }).eq('episode_id', 81).range(0, 0)
  const lb = await sb.from('kp_bubbles').select('id', { count: 'exact', head: false }).eq('episode_id', 81).range(0, 0)
  console.log(`ep81 now: dialogues ${left.count}, bubbles ${lb.count}`)
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
