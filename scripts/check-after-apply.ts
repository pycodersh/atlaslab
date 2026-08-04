/**
 * 말투 변환 적용 후 검증:
 * 1. 미변환(복합모음 어미) 목록
 * 2. EP01, EP11, EP21 대사 확인
 */
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// 반말 어미 패턴 — 줄 끝에서 감지 (복합모음 포함)
// NFC 기준으로 말미 음절이 종성 없이 모음으로 끝나는 것들
const BANMAL_END = /([봐줘봐려녀며져쳐봐뻐봐겨려여봐봐봐봐봐봐봐봐봐봐][!?.]?\s*$)|([어아해가지네래봐줘야이야거야잖아겠어][!?.]?\s*$)/u

// 단순하게: 존댓말이 아닌 종결 패턴으로 끝나는 emma/sophie 대사 찾기
// 존댓말 종결: 요, 죠, 이에요, 예요, 세요, 게요, 었어요, 았어요, 겠어요, 습니다 등
const JONDAEMAL_END = /(?:요|죠|이에요|예요|세요|습니다|ㅂ니다)[!?.,]?\s*$/

async function main() {
  // ── 1. 미변환 목록 ──────────────────────────────────────
  const { data: emmasophie } = await sb
    .from('kp_dialogues')
    .select('id, speaker, text_ko')
    .in('speaker', ['emma', 'sophie'])
    .order('id')

  const missed: { id: number; speaker: string; text_ko: string; reason: string }[] = []
  for (const r of (emmasophie ?? [])) {
    const lines = r.text_ko.split('\n')
    for (const line of lines) {
      const clean = line.replace(/^\(.*?\)\s*/, '').trim() // (혼잣말) 등 제거
      if (!clean) continue
      if (JONDAEMAL_END.test(clean)) continue  // 이미 존댓말
      // 반말로 보이는 것
      // 특정 반말 종결 패턴
      if (/(?:어|아|해|봐|줘|가|지|네|래|야|이야|거야|잖아|겠어|게|뻐|려|녀|쳐|여)[!?.]?\s*$/.test(clean)) {
        missed.push({ id: r.id, speaker: r.speaker, text_ko: r.text_ko, reason: clean })
        break
      }
    }
  }

  console.log(`\n=== 미변환 반말 대사 (emma/sophie) — ${missed.length}건 ===`)
  missed.forEach(r => console.log(`  id=${r.id} [${r.speaker}] "${r.text_ko}"  ← 끝: "${r.reason}"`))

  fs.writeFileSync('scripts/missed-banmal.json', JSON.stringify(missed, null, 2))
  console.log(`→ missed-banmal.json 저장`)

  // ── 2. EP01, EP11, EP21 대사 확인 ──────────────────────
  for (const epNum of [1, 11, 21]) {
    const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', epNum).single()
    if (!ep) { console.log(`\nEP${epNum}: 없음`); continue }

    const { data: dlg } = await sb
      .from('kp_dialogues')
      .select('id, speaker, text_ko')
      .eq('episode_id', ep.id)
      .order('order_num')

    console.log(`\n=== EP${epNum} 대사 (${dlg?.length}줄) ===`)
    dlg?.forEach(r => console.log(`  [${r.speaker.padEnd(7)}] ${r.text_ko}`))
  }

  // ── 3. EP01 하이라이트 매칭 검증 ──────────────────────
  console.log('\n=== EP01 하이라이트 매칭 검증 ===')
  const { data: ep1 } = await sb.from('kp_episodes').select('id').eq('episode_num', 1).single()
  if (ep1) {
    const { data: bubbles } = await sb
      .from('kp_bubbles')
      .select('id, dialogue_id, highlight_text')
      .eq('episode_id', ep1.id)
      .not('dialogue_id', 'is', null)

    const dlgIds = bubbles?.map((b: any) => b.dialogue_id).filter(Boolean) ?? []
    const { data: dlgRows } = await sb.from('kp_dialogues').select('id, text_ko').in('id', dlgIds)
    const { data: exprRows } = await sb
      .from('kp_dialogue_expressions')
      .select('dialogue_id, matched_text, expression_id')
      .in('dialogue_id', dlgIds)
      .eq('role', 'focus')

    const textMap = new Map(dlgRows?.map((r: any) => [r.id, r.text_ko]))
    const matchMap = new Map(exprRows?.map((r: any) => [r.dialogue_id, { matched: r.matched_text, expId: r.expression_id }]))

    bubbles?.forEach((b: any) => {
      const text = textMap.get(b.dialogue_id) ?? '(없음)'
      const info = matchMap.get(b.dialogue_id)
      if (!info) return
      const found = info.matched ? text.includes(info.matched) : false
      const icon = found ? '✅' : '❌'
      console.log(`  ${icon} dlg=${b.dialogue_id} text="${text}" matched="${info.matched}" exp=${info.expId}`)
    })
  }
}
main().catch(console.error)
