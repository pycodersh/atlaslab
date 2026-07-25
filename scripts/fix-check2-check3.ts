/**
 * CHECK 2 + CHECK 3 수정 스크립트
 * CHECK 2: EP01/04/05/06/10 bubble 분리 (static + Supabase kp_bubbles)
 * CHECK 3: EP01/03/05/06 pattern order_num 수정 (kp_patterns)
 *
 * 사용법: npx tsx scripts/fix-check2-check3.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const tailL    = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailLTop = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }

function ok(msg: string) { console.log(`  ✓ ${msg}`) }
function fail(msg: string): never { console.error(`  ✗ ${msg}`); process.exit(1) }

async function getEpId(epNum: number): Promise<number> {
  const { data, error } = await supabase
    .from('kp_episodes').select('id').eq('episode_num', epNum).single()
  if (error || !data) fail(`EP${epNum} not found: ${error?.message}`)
  return data.id
}

async function getBubble(epId: number, fragment: string) {
  const { data } = await supabase
    .from('kp_bubbles')
    .select('id, panel_id, order_num, position, tail, korean')
    .eq('episode_id', epId)
  const b = data?.find(b => (b.korean as string)?.includes(fragment))
  if (!b) fail(`Bubble "${fragment}" not found in ep_id=${epId}`)
  return b!
}

// ── CHECK 2: 2-way bubble split ──────────────────────────────────────────────
async function splitBubble2(params: {
  epId: number
  epNum: number
  targetFragment: string
  // updated target
  updKorean: string
  updTranslation: string
  updHighlight: string
  updLines: number
  updXPct: number
  updYPct: number
  updWidthPct: number
  updTail: object
  // new bubble (inserted after target)
  newKorean: string
  newTranslation: string
  newHighlight: string
  newLines: number
  newXPct: number
  newYPct: number
  newWidthPct: number
  newTail: object
  newSpeaker?: string
}) {
  console.log(`\n[EP${params.epNum}] Splitting "${params.targetFragment}"`)
  const target = await getBubble(params.epId, params.targetFragment)
  const { panel_id, order_num } = target

  // Get subsequent bubbles in same panel (descending for safe temp shift)
  const { data: subsequent } = await supabase
    .from('kp_bubbles')
    .select('id, order_num')
    .eq('panel_id', panel_id)
    .gt('order_num', order_num)
    .order('order_num', { ascending: false })

  // Step 1: shift subsequent to order+100 (high to low)
  for (const b of subsequent ?? []) {
    const { error } = await supabase.from('kp_bubbles')
      .update({ order_num: b.order_num + 100 }).eq('id', b.id)
    if (error) fail(`Temp shift failed id=${b.id}: ${error.message}`)
  }
  ok(`Shifted ${(subsequent ?? []).length} bubble(s) to temp order`)

  // Step 2: update target bubble
  const { error: e2 } = await supabase.from('kp_bubbles').update({
    korean: params.updKorean,
    translations: { en: params.updTranslation },
    highlight_text: params.updHighlight,
    position: {
      bubbleKey: 'bubble-oval',
      xPct: params.updXPct, yPct: params.updYPct,
      widthPct: params.updWidthPct, lines: params.updLines,
    },
    tail: params.updTail,
  }).eq('id', target.id)
  if (e2) fail(`Update target failed: ${e2.message}`)
  ok(`Updated target → "${params.updKorean}"`)

  // Step 3: insert new bubble at order_num + 1
  const { error: e3 } = await supabase.from('kp_bubbles').insert({
    episode_id: params.epId,
    panel_id,
    order_num: order_num + 1,
    speaker: params.newSpeaker ?? 'emma',
    korean: params.newKorean,
    translations: { en: params.newTranslation },
    highlight_text: params.newHighlight,
    position: {
      bubbleKey: 'bubble-oval',
      xPct: params.newXPct, yPct: params.newYPct,
      widthPct: params.newWidthPct, lines: params.newLines,
    },
    tail: params.newTail,
  })
  if (e3) fail(`Insert new bubble failed: ${e3.message}`)
  ok(`Inserted → "${params.newKorean}"`)

  // Step 4: shift temp back (low to high = ascending of original order)
  for (const b of (subsequent ?? []).slice().reverse()) {
    const { error } = await supabase.from('kp_bubbles')
      .update({ order_num: b.order_num + 1 }).eq('id', b.id)
    if (error) fail(`Restore shift failed id=${b.id}: ${error.message}`)
  }
  ok(`Restored ${(subsequent ?? []).length} bubble(s)`)
}

// ── CHECK 3: pattern order_num 수정 ─────────────────────────────────────────
async function fixPatternOrders(
  epId: number,
  epNum: number,
  fixes: Array<{ keyword: string; targetOrder: number }>
) {
  console.log(`\n[EP${epNum}] Pattern order 수정`)
  const { data: patterns, error } = await supabase
    .from('kp_patterns')
    .select('id, pattern, order_num')
    .eq('episode_id', epId)
    .order('order_num')
  if (error || !patterns?.length) {
    console.log(`  ⚠️ EP${epNum}: patterns not found`)
    return
  }

  const idToOrig = new Map(patterns.map(p => [p.id, p.order_num]))
  const idToFinal = new Map(patterns.map(p => [p.id, p.order_num]))
  const fixedIds = new Set<number>()

  for (const fix of fixes) {
    const p = patterns.find(q => q.pattern.includes(fix.keyword))
    if (!p) { console.log(`  ⚠️ Not found: "${fix.keyword}"`); continue }
    idToFinal.set(p.id, fix.targetOrder)
    fixedIds.add(p.id)
    ok(`Will move: "${p.pattern}" ${idToOrig.get(p.id)} → ${fix.targetOrder}`)
  }

  // Resolve displaced non-fixed patterns
  const takenByFixed = new Set(
    Array.from(fixedIds).map(id => idToFinal.get(id)!)
  )
  for (const p of patterns) {
    if (fixedIds.has(p.id)) continue
    if (takenByFixed.has(idToOrig.get(p.id)!)) {
      // Find the fixed pattern that is taking this pattern's position
      const displacer = patterns.find(fp =>
        fixedIds.has(fp.id) && idToFinal.get(fp.id) === idToOrig.get(p.id)
      )
      if (displacer) {
        const vacatedPos = idToOrig.get(displacer.id)!
        idToFinal.set(p.id, vacatedPos)
        ok(`Displaced: "${p.pattern}" ${idToOrig.get(p.id)} → ${vacatedPos}`)
      }
    }
  }

  // Phase 1: shift all to 1000+ (avoid constraint conflicts)
  for (const p of patterns) {
    const { error: e } = await supabase.from('kp_patterns')
      .update({ order_num: 1000 + (idToOrig.get(p.id) ?? 0) }).eq('id', p.id)
    if (e) fail(`Temp shift pattern id=${p.id}: ${e.message}`)
  }
  ok('All patterns shifted to 1000+')

  // Phase 2: set final order_nums
  for (const p of patterns) {
    const finalOrder = idToFinal.get(p.id)!
    const { error: e } = await supabase.from('kp_patterns')
      .update({ order_num: finalOrder }).eq('id', p.id)
    if (e) fail(`Set final order id=${p.id}: ${e.message}`)
  }
  ok('All patterns set to final order_nums')
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  // ═══ CHECK 2: Bubble splits ═══════════════════════════════════════════════

  // EP01: "큰 거 주세요.\n와이파이 있어요?" → 2 bubbles
  const ep01Id = await getEpId(1)
  await splitBubble2({
    epId: ep01Id, epNum: 1, targetFragment: '큰 거 주세요',
    updKorean: '큰 거 주세요.', updTranslation: 'Large, please.',
    updHighlight: '주세요', updLines: 1,
    updXPct: 3, updYPct: 50, updWidthPct: 42, updTail: tailL,
    newKorean: '와이파이 있어요?', newTranslation: 'Do you have Wi-Fi?',
    newHighlight: '있어요', newLines: 1,
    newXPct: 3, newYPct: 62, newWidthPct: 42, newTail: tailL,
  })

  // EP04: "오! 그걸로 할게요.\n카드로 해도 돼요?" → 2 bubbles
  const ep04Id = await getEpId(4)
  await splitBubble2({
    epId: ep04Id, epNum: 4, targetFragment: '그걸로 할게요',
    updKorean: '오! 그걸로 할게요.', updTranslation: "Oh! I'll go with that.",
    updHighlight: '할게요', updLines: 1,
    updXPct: 4, updYPct: 35, updWidthPct: 56, updTail: tailLTop,
    newKorean: '카드로 해도 돼요?', newTranslation: 'Is it okay to pay by card?',
    newHighlight: '해도 돼요', newLines: 1,
    newXPct: 4, newYPct: 48, newWidthPct: 56, newTail: tailL,
  })

  // EP05: "뭐가 맛있어요?\n추천해 주세요!" → 2 bubbles
  const ep05Id = await getEpId(5)
  await splitBubble2({
    epId: ep05Id, epNum: 5, targetFragment: '뭐가 맛있어요',
    updKorean: '뭐가 맛있어요?', updTranslation: "What's delicious?",
    updHighlight: '맛있어요', updLines: 1,
    updXPct: 4, updYPct: 5, updWidthPct: 58, updTail: tailL,
    newKorean: '추천해 주세요!', newTranslation: 'Please recommend something!',
    newHighlight: '추천해 주세요', newLines: 1,
    newXPct: 4, newYPct: 18, newWidthPct: 58, newTail: tailL,
  })

  // EP06: "케이팝 진짜 좋아해요!\n또 오고 싶어요!" → 2 bubbles
  const ep06Id = await getEpId(6)
  await splitBubble2({
    epId: ep06Id, epNum: 6, targetFragment: '케이팝 진짜 좋아해요',
    updKorean: '케이팝 진짜 좋아해요!', updTranslation: 'I really love K-pop!',
    updHighlight: '좋아해요', updLines: 1,
    updXPct: 4, updYPct: 6, updWidthPct: 60, updTail: tailL,
    newKorean: '또 오고 싶어요!', newTranslation: 'I want to come again!',
    newHighlight: '또 오고 싶어요', newLines: 1,
    newXPct: 4, newYPct: 30, newWidthPct: 60, newTail: tailL,
  })

  // EP10: 3-way split of self-introduction
  console.log('\n[EP10] 3-way split "저는 에마예요..."')
  const ep10Id = await getEpId(10)
  const ep10Target = await getBubble(ep10Id, '저는 에마예요')

  const { error: e10a } = await supabase.from('kp_bubbles').update({
    korean: '저는 에마예요.\n미국에서 왔어요.',
    translations: { en: "I'm Emma.\nI'm from America." },
    highlight_text: '에서 왔어요',
    position: { bubbleKey: 'bubble-oval', xPct: 4, yPct: 6, widthPct: 76, lines: 2 },
    tail: tailL,
  }).eq('id', ep10Target.id)
  if (e10a) fail(`EP10 update target: ${e10a.message}`)
  ok('Updated → "저는 에마예요.\\n미국에서 왔어요."')

  const { error: e10b } = await supabase.from('kp_bubbles').insert({
    episode_id: ep10Id, panel_id: ep10Target.panel_id,
    order_num: ep10Target.order_num + 1, speaker: 'emma',
    korean: '경영학 전공이에요.',
    translations: { en: 'My major is business.' },
    highlight_text: '전공이에요',
    position: { bubbleKey: 'bubble-oval', xPct: 4, yPct: 42, widthPct: 76, lines: 1 },
    tail: tailL,
  })
  if (e10b) fail(`EP10 insert 2nd: ${e10b.message}`)
  ok('Inserted → "경영학 전공이에요."')

  const { error: e10c } = await supabase.from('kp_bubbles').insert({
    episode_id: ep10Id, panel_id: ep10Target.panel_id,
    order_num: ep10Target.order_num + 2, speaker: 'emma',
    korean: '잘 부탁드려요!',
    translations: { en: 'Please take care of me!' },
    highlight_text: '잘 부탁드려요',
    position: { bubbleKey: 'bubble-oval', xPct: 4, yPct: 60, widthPct: 60, lines: 1 },
    tail: tailL,
  })
  if (e10c) fail(`EP10 insert 3rd: ${e10c.message}`)
  ok('Inserted → "잘 부탁드려요!"')

  // ═══ CHECK 3: Pattern order fixes ════════════════════════════════════════

  await fixPatternOrders(ep01Id, 1, [{ keyword: '이에요', targetOrder: 2 }])

  const ep03Id = await getEpId(3)
  await fixPatternOrders(ep03Id, 3, [
    { keyword: '맞아요', targetOrder: 4 },
    { keyword: '아니에요', targetOrder: 5 },
  ])

  await fixPatternOrders(ep05Id, 5, [
    { keyword: '주실 수 있어요', targetOrder: 3 },
    { keyword: '어디서 살 수 있어요', targetOrder: 4 },
  ])

  await fixPatternOrders(ep06Id, 6, [
    { keyword: '잘해요', targetOrder: 3 },
    { keyword: '진짜요', targetOrder: 4 },
  ])

  console.log('\n✓ CHECK 2 + CHECK 3 수정 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
