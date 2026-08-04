/**
 * add-gap-rows-ep31.ts
 *
 * EP31 kp_panels에 gap row를 추가하고 kp_bubbles.panel_id를 gap row로 마이그레이션.
 * 이후 fetch-episode.ts의 hasGaps=true 경로를 타게 되어 에디터·뷰어 좌표계 완전 통일.
 *
 * 변환 전 구조:
 *   [c1(wide), c2(split), c3(split), c4(split), c5(split), c6(wide)]
 *   kp_bubbles.panel_id → 이미지 패널 가리킴
 *
 * 변환 후 구조 (EP01-30 패턴 동일):
 *   [g0(gap), c1, g1(gap), c2, c3, g2(gap), c4, c5, g3(gap), c6, g4(gap)]
 *   kp_bubbles.panel_id → 해당 gap row 가리킴
 *
 * Run (dry): npx tsx scripts/add-gap-rows-ep31.ts
 * Run (apply): npx tsx scripts/add-gap-rows-ep31.ts --apply
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')
const EP_NUM = 31

type DBPanel = { id: number; order_num: number; type: string; layout: string | null; height_ratio: number | null }
type DBBubble = { id: number; panel_id: number; order_num: number }

// Same row-grouping logic as fetch-episode.ts (hasGaps=false path)
function groupIntoRows(panels: DBPanel[]): DBPanel[][] {
  const rows: DBPanel[][] = []
  let cur: DBPanel[] = []
  let wSum = 0
  for (const p of panels) {
    const lay = (p.layout ?? 'wide') as string
    if (lay === 'wide') {
      if (cur.length) { rows.push(cur); cur = []; wSum = 0 }
      rows.push([p])
    } else if (lay.startsWith('split:')) {
      cur.push(p); wSum += parseFloat(lay.slice(6))
      if (wSum >= 99) { rows.push(cur); cur = []; wSum = 0 }
    } else if (lay.startsWith('stack-t:')) {
      cur.push(p); wSum += parseFloat(lay.slice(8))
    } else if (lay === 'stack-b') {
      cur.push(p); rows.push(cur); cur = []; wSum = 0
    }
  }
  if (cur.length) rows.push(cur)
  return rows
}

async function main() {
  console.log(`=== add-gap-rows EP${EP_NUM} ===`)
  console.log(APPLY ? '[ APPLY MODE ]' : '[ DRY RUN ]')

  // ── 1. 에피소드 조회 ────────────────────────────────────────────────────────
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', EP_NUM).single()
  if (!ep) { console.error('에피소드 없음'); process.exit(1) }
  const epId = ep.id as number
  console.log(`\nEP${EP_NUM} id = ${epId}`)

  // ── 2. 현재 kp_panels 조회 ──────────────────────────────────────────────────
  const { data: panels } = await sb
    .from('kp_panels')
    .select('id, order_num, type, layout, height_ratio')
    .eq('episode_id', epId)
    .order('order_num')
  if (!panels?.length) { console.error('패널 없음'); process.exit(1) }

  const panelList = panels as DBPanel[]
  const hasGap = panelList.some(p => p.type === 'gap')
  if (hasGap) { console.log('이미 gap row가 있음 → 중단'); return }

  const imagePanels = panelList.filter(p => p.type === 'panel')
  console.log(`이미지 패널 ${imagePanels.length}개: ${imagePanels.map(p => `#${p.id}(${p.layout})`).join(', ')}`)

  // ── 3. 현재 kp_bubbles 조회 ─────────────────────────────────────────────────
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, panel_id, order_num')
    .eq('episode_id', epId)
    .order('order_num')
  const bubbleList = (bubbles ?? []) as DBBubble[]
  console.log(`버블 ${bubbleList.length}개`)

  const byPanel = new Map<number, DBBubble[]>()
  for (const b of bubbleList) {
    if (!byPanel.has(b.panel_id)) byPanel.set(b.panel_id, [])
    byPanel.get(b.panel_id)!.push(b)
  }

  // ── 4. 행 그룹핑 ────────────────────────────────────────────────────────────
  const rows = groupIntoRows(imagePanels)
  console.log(`\n행 그룹: ${rows.length}개`)
  rows.forEach((row, i) => {
    const hasBubble = row.filter(p => (byPanel.get(p.id)?.length ?? 0) > 0).length
    console.log(`  행 ${i}: [${row.map(p => `#${p.id}(${p.layout})`).join(', ')}] → n=${hasBubble}`)
  })

  // ── 5. 새 order_num 계획 ────────────────────────────────────────────────────
  // g0, c1, g1, c2, c3, g2, c4, c5, g3, c6, g4
  // order_num = 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, ...
  type GapPlan = { order_num: number; height_ratio: number; bubbles: DBBubble[] }
  type PanelPlan = { id: number; new_order: number }

  const gapPlans: GapPlan[] = []
  const panelPlans: PanelPlan[] = []

  let orderCursor = 1

  // gap-0 (빈 갭, 맨 앞)
  gapPlans.push({ order_num: orderCursor++, height_ratio: 0.55, bubbles: [] })

  for (const row of rows) {
    for (const p of row) {
      panelPlans.push({ id: p.id, new_order: orderCursor++ })
    }
    const rowBubbles = row
      .flatMap(p => (byPanel.get(p.id) ?? []).sort((a, b) => a.order_num - b.order_num))
    const n = row.filter(p => (byPanel.get(p.id)?.length ?? 0) > 0).length
    gapPlans.push({
      order_num: orderCursor++,
      height_ratio: n === 0 ? 0.55 : 0.88 * n,
      bubbles: rowBubbles,
    })
  }

  console.log('\n── 계획 ──────────────────────────────────────────────────────')
  console.log(`패널 order_num 변경 ${panelPlans.length}건:`)
  panelPlans.forEach(pp => {
    const orig = imagePanels.find(p => p.id === pp.id)!
    console.log(`  panel#${pp.id}(${orig.layout}) order ${orig.order_num} → ${pp.new_order}`)
  })
  console.log(`gap row INSERT ${gapPlans.length}건:`)
  gapPlans.forEach((g, i) => {
    const n = g.bubbles.length
    console.log(`  gap-${i}: order=${g.order_num}, height_ratio=${g.height_ratio.toFixed(2)}, bubbles=${n}`)
  })

  if (!APPLY) {
    console.log('\n──── DRY RUN 완료 ────')
    console.log('실제 적용: npx tsx scripts/add-gap-rows-ep31.ts --apply')
    return
  }

  // ── 6. APPLY ────────────────────────────────────────────────────────────────
  console.log('\n적용 시작...')

  // 6-1. 기존 패널 order_num 업데이트 (충돌 방지: 임시로 음수로 먼저 설정)
  console.log('패널 order_num 임시 음수화...')
  for (const pp of panelPlans) {
    const { error } = await sb.from('kp_panels').update({ order_num: -pp.new_order }).eq('id', pp.id)
    if (error) { console.error(`  패널#${pp.id} 실패: ${error.message}`); process.exit(1) }
  }
  console.log('패널 order_num 확정...')
  for (const pp of panelPlans) {
    const { error } = await sb.from('kp_panels').update({ order_num: pp.new_order }).eq('id', pp.id)
    if (error) { console.error(`  패널#${pp.id} 실패: ${error.message}`); process.exit(1) }
  }
  console.log('✓ 패널 order_num 업데이트 완료')

  // 6-2. gap row INSERT
  console.log('gap row 삽입...')
  const gapInserts = gapPlans.map(g => ({
    episode_id: epId,
    order_num: g.order_num,
    type: 'gap',
    image_url: null,
    layout: null,
    height_ratio: g.height_ratio,
  }))
  const { data: insertedGaps, error: insertErr } = await sb
    .from('kp_panels')
    .insert(gapInserts)
    .select('id, order_num')
  if (insertErr || !insertedGaps) { console.error('gap INSERT 실패:', insertErr); process.exit(1) }
  console.log(`✓ gap row ${insertedGaps.length}개 삽입`)

  // gap-N의 DB id를 order_num으로 찾기
  const gapByOrder = new Map<number, number>() // order_num → gap panel id
  for (const g of insertedGaps) gapByOrder.set(g.order_num as number, g.id as number)

  // 6-3. kp_bubbles.panel_id를 gap panel id로 업데이트
  console.log('kp_bubbles panel_id 마이그레이션...')
  let migrated = 0
  for (const gapPlan of gapPlans) {
    if (!gapPlan.bubbles.length) continue
    const gapPanelId = gapByOrder.get(gapPlan.order_num)
    if (!gapPanelId) { console.error(`gap id not found for order=${gapPlan.order_num}`); continue }
    const bubbleIds = gapPlan.bubbles.map(b => b.id)
    const { error } = await sb.from('kp_bubbles').update({ panel_id: gapPanelId }).in('id', bubbleIds)
    if (error) { console.error(`  bubble 업데이트 실패: ${error.message}`); continue }
    migrated += bubbleIds.length
    console.log(`  gap#${gapPanelId}(order=${gapPlan.order_num}) ← bubble ${bubbleIds.length}개`)
  }
  console.log(`✓ bubble panel_id 마이그레이션 ${migrated}건 완료`)

  // ── 7. 검증 ────────────────────────────────────────────────────────────────
  console.log('\n── 검증 ──────────────────────────────────────────────────────')
  const { data: verifyPanels } = await sb
    .from('kp_panels')
    .select('id, order_num, type, height_ratio')
    .eq('episode_id', epId)
    .order('order_num')
  console.log('kp_panels 최종:')
  for (const p of (verifyPanels ?? [])) {
    console.log(`  order=${p.order_num} type=${p.type} hr=${p.height_ratio ?? '-'}`)
  }

  const { data: verifyBubbles } = await sb
    .from('kp_bubbles')
    .select('id, panel_id')
    .eq('episode_id', epId)
  const gapIds = new Set((verifyPanels ?? []).filter(p => p.type === 'gap').map(p => p.id))
  const orphaned = (verifyBubbles ?? []).filter(b => !gapIds.has(b.panel_id))
  if (orphaned.length) {
    console.warn(`⚠ 고아 버블(gap가 아닌 panel_id) ${orphaned.length}개: id=${orphaned.map(b=>b.id).join(',')}`)
  } else {
    console.log('✓ 모든 버블이 gap panel_id를 가리킴')
  }

  console.log('\n=== 완료 ===')
  console.log('⚠ kpatto_webtoon_layouts 테이블의 overrides가 있다면 버블 ID가 변경됐으니 초기화 필요.')
  console.log('  기존 ID 형식: b-gap-N-M → 새 ID 형식: b-{gap_order_num}-M')
}

main().catch(e => { console.error(e); process.exit(1) })
