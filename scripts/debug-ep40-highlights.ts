/**
 * EP40 하이라이트 수정 전 조사
 * - 해당 두 대사의 kp_dialogues / kp_dialogue_expressions 현재값 확인
 * npx tsx scripts/debug-ep40-highlights.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const TARGETS = [
    '그래도 나라마다 달라서 재미있어요.',  // 수정 1
    '처음엔 다 낯설었는데…',              // 수정 2
  ]

  // EP40 episode id
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 40).single()
  if (!ep) { console.log('EP40 없음'); return }

  for (const text of TARGETS) {
    console.log(`\n━━ 대사: "${text}" ━━`)

    // kp_dialogues
    const { data: dlgs } = await sb.from('kp_dialogues')
      .select('id, speaker, text_ko, audio_url, audio_hash, order_num')
      .eq('episode_id', 40)
      .eq('text_ko', text)
    if (!dlgs || dlgs.length === 0) {
      console.log('  ✗ kp_dialogues 없음')
      continue
    }

    for (const d of dlgs) {
      console.log(`  kp_dialogues.id=${d.id} [${d.speaker}] order_num=${d.order_num}`)
      console.log(`    audio_url=${d.audio_url ? '✓' : 'NULL'}  audio_hash=${d.audio_hash ?? 'NULL'}`)

      // kp_dialogue_expressions
      const { data: des } = await sb.from('kp_dialogue_expressions')
        .select('id, expression_id, matched_text, role')
        .eq('dialogue_id', d.id as number)
      if (!des || des.length === 0) {
        console.log('    kp_dialogue_expressions: 없음')
      } else {
        for (const de of des) {
          // kp_expressions
          const { data: expr } = await sb.from('kp_expressions')
            .select('id, korean, first_episode')
            .eq('id', de.expression_id as number)
            .single()
          console.log(`    DE id=${de.id} role=${de.role} matched_text="${de.matched_text}"`)
          console.log(`       expr: id=${expr?.id} korean="${expr?.korean}"`)
          // matched_text가 text_ko에 포함되는지
          const inText = String(text).includes(String(de.matched_text ?? ''))
          console.log(`       matched_text ⊆ text_ko: ${inText ? '✓' : '✗'}`)
          // expr.korean (핵심부) matched_text에 포함되는지
          const exprCore = String(expr?.korean ?? '').replace(/^[~-]/, '').trim()
          const coreInMt = String(de.matched_text ?? '').includes(exprCore)
          console.log(`       expr_core="${exprCore}" ⊆ matched_text: ${coreInMt ? '✓' : '✗'}`)
        }
      }

      // kp_bubbles
      const { data: bubbles } = await sb.from('kp_bubbles')
        .select('id, korean, position, bubbleKey, lines')
        .eq('episode_id', 40)
        .eq('dialogue_id', d.id as number)
      if (bubbles && bubbles.length > 0) {
        for (const b of bubbles) {
          const pos = b.position as Record<string, unknown> ?? {}
          console.log(`    kp_bubbles.id=${b.id}  widthPct=${pos.widthPct} xPct=${pos.xPct} yPct=${pos.yPct} bubbleKey=${pos.bubbleKey} lines=${pos.lines}`)
        }
      }
    }
  }
}
main().catch(console.error)
