/**
 * EP50 gap > panel 원인 조사 (조사 전용, 수정 없음)
 * npx tsx scripts/debug-ep50-panels.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 50).single()
  if (!ep) { console.log('EP50 없음'); return }

  // kp_panels
  const { data: panels } = await sb.from('kp_panels')
    .select('id, type, order_num, layout, height_ratio, image_url')
    .eq('episode_id', ep.id as string)
    .order('order_num')

  const imgPanels = (panels ?? []).filter(p => p.type === 'panel')
  const gapPanels = (panels ?? []).filter(p => p.type === 'gap')

  console.log(`\n━━ EP50 kp_panels (총 ${(panels ?? []).length}행) ━━`)
  console.log(`  이미지 패널: ${imgPanels.length}개`)
  for (const p of imgPanels) {
    console.log(`    id=${p.id} order_num=${p.order_num} layout=${p.layout ?? 'wide'}`)
  }
  console.log(`  갭 패널: ${gapPanels.length}개`)
  for (const p of gapPanels) {
    console.log(`    id=${p.id} order_num=${p.order_num}`)
  }

  // kp_bubbles for gap panels
  const gapIds = gapPanels.map(p => p.id as number)
  const { data: bubbles } = await sb.from('kp_bubbles')
    .select('id, panel_id, order_num, speaker, korean, dialogue_id')
    .in('panel_id', gapIds)
    .order('panel_id').then(r => ({ data: r.data?.sort((a, b) => (a.panel_id as number) - (b.panel_id as number) || (a.order_num as number) - (b.order_num as number)) ?? null, error: r.error }))

  console.log(`\n  갭 말풍선 (${(bubbles ?? []).length}건):`)
  for (const b of (bubbles ?? [])) {
    const gap = gapPanels.find(p => p.id === b.panel_id)
    console.log(`    gap.order_num=${gap?.order_num} | bubble.id=${b.id} [${b.speaker}] "${String(b.korean ?? '').slice(0,30)}"`)
  }

  // kp_scenes
  const { data: scenes } = await sb.from('kp_scenes')
    .select('id, order_num, image_url')
    .eq('episode_id', ep.id as string)
    .order('order_num')

  console.log(`\n━━ EP50 kp_scenes (${(scenes ?? []).length}컷) ━━`)
  for (const s of (scenes ?? [])) {
    const img = s.image_url as string | null
    console.log(`  scene.id=${s.id} order_num=${s.order_num}`)
  }

  // 진단
  console.log('\n━━ 진단 ━━')
  console.log(`  대본 컷 수:     6 ([컷1]~[컷6])`)
  console.log(`  kp_panels image: ${imgPanels.length}개`)
  console.log(`  kp_panels gap:   ${gapPanels.length}개`)
  console.log(`  kp_scenes:       ${(scenes ?? []).length}컷`)

  if (gapPanels.length > imgPanels.length) {
    const trailing = gapPanels.filter(g => {
      const ord = g.order_num as number
      const maxImg = Math.max(...imgPanels.map(p => p.order_num as number))
      return ord > maxImg
    })
    console.log(`\n  trailing gap 후보 (image max order_num 초과):`)
    for (const t of trailing) {
      const bs = (bubbles ?? []).filter(b => b.panel_id === t.id)
      console.log(`    gap id=${t.id} order_num=${t.order_num} → 말풍선: ${bs.map(b => `[${b.speaker}] "${String(b.korean).slice(0,20)}"`).join(' / ')}`)
    }
  }
}
main().catch(console.error)
