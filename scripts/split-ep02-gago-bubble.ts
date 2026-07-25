import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const tailR    = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailL    = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailLTop = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }

async function main() {
  const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 2).single()
  if (!ep) { console.error('EP02 not found'); return }

  // 분리 대상: panel=16 (gap-2)
  // order=1 → "지수! 홍대\n가고 싶어요..." (첫 번째 버블)
  // order=2 → jisu "에마야!..." → order=3으로 밀기
  // INSERT order=2 → "어디예요?" (새 버블)

  // Step 1: jisu 버블 order=2 → 102 (임시)
  const { error: e1 } = await supabase
    .from('kp_bubbles')
    .update({ order_num: 102 })
    .eq('panel_id', 16)
    .eq('order_num', 2)
  if (e1) { console.error('STEP1 FAIL:', e1.message); return }
  console.log('✓ jisu bubble → order=102 (temp)')

  // Step 2: 기존 버블 order=1 업데이트 (내용 + 위치 수정)
  const { error: e2 } = await supabase
    .from('kp_bubbles')
    .update({
      korean: '지수! 홍대\n가고 싶어요...',
      translations: { en: 'Jisu! I want to go\nto Hongdae...' },
      highlight_text: '가고 싶어요',
      position: {
        bubbleKey: 'bubble-oval',
        xPct: 28, yPct: 3, widthPct: 64, lines: 2,
      },
      tail: tailR,
    })
    .eq('panel_id', 16)
    .eq('order_num', 1)
  if (e2) { console.error('STEP2 FAIL:', e2.message); return }
  console.log('✓ bubble-1 updated: "지수! 홍대\\n가고 싶어요..." highlight=가고 싶어요')

  // Step 3: 새 버블 INSERT order=2
  const { data: ep02Panel16 } = await supabase
    .from('kp_bubbles')
    .select('episode_id')
    .eq('panel_id', 16)
    .eq('order_num', 1)
    .single()
  const epId = ep02Panel16?.episode_id ?? ep.id

  const { error: e3 } = await supabase
    .from('kp_bubbles')
    .insert({
      episode_id: epId,
      panel_id: 16,
      order_num: 2,
      speaker: 'emma',
      korean: '어디예요?',
      translations: { en: 'Where is it?' },
      position: {
        bubbleKey: 'bubble-oval',
        xPct: 6, yPct: 30, widthPct: 40, lines: 1,
      },
      tail: tailL,
      highlight_text: '어디예요',
    })
  if (e3) { console.error('STEP3 FAIL:', e3.message); return }
  console.log('✓ bubble-2 inserted: "어디예요?" highlight=어디예요')

  // Step 4: jisu 버블 order=102 → 3
  const { error: e4 } = await supabase
    .from('kp_bubbles')
    .update({ order_num: 3 })
    .eq('panel_id', 16)
    .eq('order_num', 102)
  if (e4) { console.error('STEP4 FAIL:', e4.message); return }
  console.log('✓ jisu bubble → order=3')

  // 결과 확인
  const { data: result } = await supabase
    .from('kp_bubbles')
    .select('order_num, speaker, korean, highlight_text')
    .eq('panel_id', 16)
    .order('order_num')
  console.log('\n=== panel=16 최종 상태 ===')
  result?.forEach(b => console.log(`  order=${b.order_num} [${b.speaker}] "${b.korean?.replace(/\n/g,'\\n')}" highlight=${b.highlight_text ?? 'null'}`))
  console.log('\n✓ 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
