import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// highlight_text → pattern order (1-5) 역매핑
function getPatternIndex(hl: string, epNum: number): number | null {
  switch (epNum) {
    case 1:
      if (hl === '주세요') return 1
      if (hl === '뭐예요') return 2
      if (hl === '이에요' || hl === '예요') return 3
      if (hl === '있어요' || hl === '없어요') return 4
      if (hl === '얼마예요') return 5
      break
    case 2:
      if (hl === '어디예요') return 1
      if (hl.endsWith('고 싶어요')) return 2
      if (hl === '어떻게 가요') return 3
      if (hl === '주세요') return 4
      if (hl === '좋아요') return 5
      break
    case 3:
      if (hl.endsWith('고 싶어요')) return 1
      if (hl.includes('수 있어요') || hl.includes('수 없어요')) return 2
      if (hl === '아니에요') return 3
      if (hl.startsWith('못')) return 4
      if (hl === '맞아요') return 5
      break
    case 4:
      if (hl.endsWith('도 돼요')) return 1
      // p2 (~하면 안 돼요) - 버블 삭제됨
      if (hl === '어때요') return 3
      if (hl.endsWith('할게요')) return 4
      if (hl === '얼마나 걸려요') return 5
      break
    case 5:
      if (hl === '주실 수 있어요') return 1
      if (hl === '추천해 주세요') return 2
      if (hl.includes('본 적 있어요')) return 3
      if (hl === '살 수 있어요') return 4
      if (hl === '맛있어요') return 5
      break
    case 6:
      if (hl === '좋아해요') return 1
      if (hl === '진짜요' || hl === '대박') return 2
      if (hl.startsWith('너무')) return 3
      if (hl === '잘해요' || hl.startsWith('못')) return 4
      if (hl.includes('오고 싶어요')) return 5
      break
    case 7:
      if (hl === '깎아 주세요') return 1
      if (hl === '다 해서 얼마예요') return 2
      if (hl === '조금만 더 주세요') return 3
      if (hl.startsWith('맛봐')) return 4
      if (hl === '신기해요') return 5
      break
    case 8:
      if (hl === '추천해 주세요') return 1
      if (hl === '뭐 써요') return 2
      if (hl === '어떤 게 좋아요') return 3
      if (hl === '써봤어요') return 4
      if (hl === '피부에 좋아요') return 5
      break
    case 9:
      if (hl === '너무 좋다') return 1
      if (hl.startsWith('배달')) return 2
      if (hl === '생각보다') return 3
      if (hl === '다 같이') return 4
      if (hl === '이미') return 5
      break
    case 10:
      if (hl === '에서 왔어요') return 1
      if (hl === '전공이에요') return 2
      if (hl === '잘 부탁드려요') return 3
      if (hl === '떨려요') return 4
      if (hl === '할 수 있었어요') return 5
      break
  }
  return null
}

async function main() {
  // 1. kp_episodes (epNum → DB id)
  const { data: episodes } = await supabase
    .from('kp_episodes')
    .select('id, episode_num')
    .order('episode_num')
  const epMap = new Map<number, number>()
  for (const e of episodes ?? []) epMap.set(e.episode_num, e.id)

  // 2. kp_panels (episode_id + order_num → panel_id)
  const { data: panels } = await supabase
    .from('kp_panels')
    .select('id, episode_id, order_num, type')
    .order('order_num')
  const panelOrderMap = new Map<number, number>() // panel_id → panel.order_num
  for (const p of panels ?? []) panelOrderMap.set(p.id, p.order_num)

  // 3. kp_bubbles with highlight_text
  const { data: bubbles } = await supabase
    .from('kp_bubbles')
    .select('id, episode_id, panel_id, order_num, highlight_text')
    .not('highlight_text', 'is', null)

  // 4. kp_patterns (EP01~10)
  const { data: allPatterns } = await supabase
    .from('kp_patterns')
    .select('id, code, episode_id, order_num, pattern')
    .not('episode_id', 'is', null)
    .order('episode_id')
    .order('order_num')

  const toUpdate: { id: number; new_order: number; pattern: string; ep: number }[] = []

  console.log('=== 패턴 순서 vs 대사 등장 순서 ===\n')

  for (const [epNum, epId] of epMap) {
    const epPatterns = (allPatterns ?? []).filter(p => p.episode_id === epId)
    if (!epPatterns.length) continue

    // 이 에피소드의 버블들 — 읽기 순서(panel.order_num * 1000 + bubble.order_num)로 정렬
    const epBubbles = (bubbles ?? [])
      .filter(b => b.episode_id === epId && b.highlight_text)
      .map(b => ({
        ...b,
        readOrder: (panelOrderMap.get(b.panel_id) ?? 0) * 1000 + b.order_num,
      }))
      .sort((a, b) => a.readOrder - b.readOrder)

    // 각 패턴(1-5)의 첫 등장 readOrder
    const patternFirstRead = new Map<number, number>() // patternIdx(1-5) → readOrder
    for (const b of epBubbles) {
      const pIdx = getPatternIndex(b.highlight_text!, epNum)
      if (pIdx !== null && !patternFirstRead.has(pIdx)) {
        patternFirstRead.set(pIdx, b.readOrder)
      }
    }

    // 등장 순서대로 정렬 → 새 order_num 결정
    const encountered = [...patternFirstRead.entries()]
      .sort((a, b) => a[1] - b[1])  // readOrder 기준
    // encountered = [[patternIdx, readOrder], ...] in reading order

    console.log(`EP${epNum}:`)
    let mismatch = false

    for (const p of epPatterns) {
      // 이 패턴의 patternIdx 파악 (order_num 기준으로 찾기)
      const pIdx = p.order_num
      const readOrd = patternFirstRead.get(pIdx) ?? null
      // 실제 등장 순위 (1-based)
      const encRank = readOrd !== null
        ? encountered.findIndex(([idx]) => idx === pIdx) + 1
        : null

      const status = readOrd === null ? '— (버블 없음)' :
        encRank === pIdx ? '✓' : `✗ → 실제 ${encRank}번째 등장`
      console.log(`  p${pIdx} [${p.pattern}]: ${status}`)

      if (encRank !== null && encRank !== pIdx) {
        mismatch = true
        toUpdate.push({ id: p.id, new_order: encRank, pattern: p.pattern, ep: epNum })
      }
    }
    if (!mismatch) console.log('  → 순서 정확')
    console.log()
  }

  // EP01 null episode_id 패턴 현황 보고
  const ep1NullPatterns = (allPatterns ?? []).filter(p => p.episode_id === null)
  if (ep1NullPatterns.length) {
    console.log(`⚠ episode_id=null 패턴 ${ep1NullPatterns.length}개:`)
    ep1NullPatterns.forEach(p => console.log(`  id=${p.id} [${p.code}] ${p.pattern}`))
    console.log()
  }

  if (!toUpdate.length) {
    console.log('✓ 모든 패턴 순서 정확 — 업데이트 불필요')
    return
  }

  console.log('=== order_num 업데이트 ===')
  // 같은 episode 내에서 두 패턴이 번호를 맞교환하는 경우 충돌 방지: 임시값으로 먼저 설정
  for (const u of toUpdate) {
    await supabase.from('kp_patterns').update({ order_num: u.new_order + 100 }).eq('id', u.id)
  }
  for (const u of toUpdate) {
    const { error } = await supabase.from('kp_patterns').update({ order_num: u.new_order }).eq('id', u.id)
    if (error) console.error(`  FAIL id=${u.id}: ${error.message}`)
    else console.log(`  EP${u.ep} [${u.pattern}] order_num → ${u.new_order}`)
  }
  console.log('\n✓ 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
