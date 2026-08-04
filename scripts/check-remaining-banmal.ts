/**
 * 말투 수정 후 남아있는 반말 대사 재조회
 * emma/sophie → 반말 종결어미 탐지
 * EP15 emma 대사도 별도 확인
 */
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// 존댓말 종결 패턴
const JONDAEMAL = /(?:요|죠|이에요|예요|세요|습니다|ㅂ니다|네요|게요|봐요|래요|해요|줘요|가요|어요|아요|뻐요|려요|녀요|져요|처요)[!?.,]?\s*$/

// 반말 종결 감지 (복합모음 포함)
const BANMAL = /(?:어|아|해|봐|줘|가|지|네|래|야|이야|거야|잖아|겠어|었어|았어|게|뻐|려|녀|져|처|워|봐)[!?.]\s*$|(?:어|아|해|봐|줘|가|지|네|래|야|이야|거야|잖아|겠어|었어|았어|게|뻐|려|녀|져|처|워|봐)\s*$/

// 명백히 반말이 아닌 것 (부사/감탄사/명사 종결)
const NOT_BANMAL = /^(네\.\.\.|드디어!|어머|아이고|와|맞아요|감사해요|괜찮아요|정말요|진짜요)/

async function main() {
  const { data: rows } = await sb
    .from('kp_dialogues')
    .select('id, speaker, text_ko, episode_id')
    .in('speaker', ['emma', 'sophie'])
    .order('id')

  const banmalList: { id: number; speaker: string; text_ko: string; ep: number }[] = []

  for (const r of (rows ?? [])) {
    if (NOT_BANMAL.test(r.text_ko)) continue

    const lines = r.text_ko.split('\n')
    let isBanmal = false
    for (const line of lines) {
      const clean = line.replace(/^\([^)]*\)\s*/, '').trim()
      if (!clean) continue
      if (JONDAEMAL.test(clean)) continue
      if (BANMAL.test(clean)) {
        isBanmal = true
        break
      }
    }
    if (isBanmal) {
      banmalList.push({ id: r.id, speaker: r.speaker, text_ko: r.text_ko, ep: r.episode_id })
    }
  }

  console.log(`\n=== emma/sophie 반말 잔존 대사: ${banmalList.length}건 ===\n`)
  for (const r of banmalList) {
    console.log(`  id=${r.id} ep_id=${r.ep} [${r.speaker}] "${r.text_ko}"`)
  }

  // EP15 에마 대사 전체
  const { data: ep15 } = await sb.from('kp_episodes').select('id').eq('episode_num', 15).single()
  if (ep15) {
    const { data: emmaDlg } = await sb
      .from('kp_dialogues')
      .select('id, speaker, text_ko')
      .eq('episode_id', ep15.id)
      .in('speaker', ['emma', 'sophie'])
      .order('id')

    console.log(`\n=== EP15 emma/sophie 대사 (${emmaDlg?.length}줄) ===`)
    for (const r of (emmaDlg ?? [])) {
      const ok = JONDAEMAL.test(r.text_ko.split('\n').pop() ?? '') ? '✅' : '⚠️'
      console.log(`  ${ok} id=${r.id} [${r.speaker}] "${r.text_ko}"`)
    }
  } else {
    console.log('\nEP15 없음')
  }
}
main().catch(console.error)
