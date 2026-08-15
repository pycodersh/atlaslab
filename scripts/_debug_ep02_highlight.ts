/**
 * EP02 경복궁 버블 하이라이트 디버그
 * fetch-episode.ts 가 실제로 어떤 값을 조립하는지 그대로 재현
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // ── Step 1: EP02 UUID 확인 ──────────────────────────────────────────────────
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 2).single()
  console.log(`EP02 UUID: ${ep?.id}\n`)

  // ── Step 2: 경복궁 버블의 실제 DB 값 ─────────────────────────────────────────
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, korean, dialogue_id, highlight_text, expression_id')
    .eq('episode_id', ep!.id)
    .ilike('korean', '%경복궁%')

  console.log('=== kp_bubbles 경복궁 행 ===')
  for (const b of (bubbles ?? [])) {
    console.log(`  id: ${b.id}`)
    console.log(`  korean: "${b.korean}"`)
    console.log(`  dialogue_id: ${b.dialogue_id}   ← NULL이면 highlightMap 안 탐`)
    console.log(`  highlight_text(레거시): "${b.highlight_text}"`)
    console.log(`  expression_id: ${b.expression_id}`)
  }

  // ── Step 3: dialogue_id가 있으면 kp_dialogue_expressions 조회 ────────────────
  const dlgId = (bubbles ?? [])[0]?.dialogue_id
  console.log(`\n=== kp_dialogue_expressions (dialogue_id=${dlgId}) ===`)
  if (dlgId == null) {
    console.log('  ⛔ dialogue_id가 NULL — kp_dialogue_expressions 조회 불가')
    console.log('  → highlight_text 폴백: ["가고 싶어요"] (1개만) ← 여기가 원인')
  } else {
    const { data: exprs } = await sb
      .from('kp_dialogue_expressions')
      .select('id, dialogue_id, matched_text, role, expression_id')
      .eq('dialogue_id', dlgId)
      .order('id')
    console.log(`  전체 행 (role 무관): ${(exprs ?? []).length}건`)
    for (const e of (exprs ?? [])) {
      console.log(`    id=${e.id}  role=${e.role}  matched="${e.matched_text}"`)
    }

    // fetch-episode.ts 와 동일한 필터: role='focus'
    const focused = (exprs ?? []).filter(e => e.role === 'focus')
    console.log(`\n  role='focus' 필터 후: ${focused.length}건`)
    for (const e of focused) {
      console.log(`    matched="${e.matched_text}"`)
    }

    // highlightMap 시뮬레이션
    const arr: string[] = []
    for (const m of focused) {
      if (m.matched_text != null) arr.push(m.matched_text)
    }
    console.log(`\n  → highlightMap.get(${dlgId}) 결과: [${arr.map(s => `"${s}"`).join(', ')}]`)
    console.log(`  → renderKorean 에 넘어갈 highlights 개수: ${arr.length}`)
  }

  // ── Step 4: renderKorean indexOf 시뮬레이션 ───────────────────────────────────
  const bubbleKorean = (bubbles ?? [])[0]?.korean ?? ''
  const dlgId2 = (bubbles ?? [])[0]?.dialogue_id
  if (dlgId2 != null) {
    const { data: focused2 } = await sb
      .from('kp_dialogue_expressions')
      .select('matched_text')
      .eq('dialogue_id', dlgId2)
      .eq('role', 'focus')
    const highlights = (focused2 ?? []).map(e => e.matched_text as string).filter(Boolean)

    console.log(`\n=== renderKorean indexOf 시뮬레이션 ===`)
    console.log(`  text (korean): "${bubbleKorean}"`)
    for (const hl of highlights) {
      const idx = bubbleKorean.indexOf(hl)
      console.log(`  indexOf("${hl}") = ${idx}  ${idx === -1 ? '❌ 미검출' : `✅ [${idx}~${idx+hl.length}]`}`)
      if (idx === -1) {
        // 문자 코드 확인
        console.log(`    text chars: ${[...bubbleKorean].map(c => `${c}(U+${c.codePointAt(0)!.toString(16).toUpperCase()})`).join(' ')}`)
        console.log(`    hl chars:   ${[...hl].map(c => `${c}(U+${c.codePointAt(0)!.toString(16).toUpperCase()})`).join(' ')}`)
      }
    }
  }
}

main().catch(e => { console.error('⛔', e.message); process.exit(1) })
