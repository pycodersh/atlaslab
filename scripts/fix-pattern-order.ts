import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

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
  const { data: episodes } = await supabase
    .from('kp_episodes')
    .select('id, episode_num')
    .order('episode_num')
  const epMap = new Map<number, number>()
  for (const e of episodes ?? []) epMap.set(e.episode_num, e.id)

  const { data: panels } = await supabase
    .from('kp_panels')
    .select('id, episode_id, order_num')
  const panelOrderMap = new Map<number, number>()
  for (const p of panels ?? []) panelOrderMap.set(p.id, p.order_num)

  const { data: bubbles } = await supabase
    .from('kp_bubbles')
    .select('episode_id, panel_id, order_num, highlight_text')
    .not('highlight_text', 'is', null)

  const { data: allPatterns } = await supabase
    .from('kp_patterns')
    .select('id, episode_id, order_num, pattern')
    .not('episode_id', 'is', null)
    .order('episode_id')
    .order('order_num')

  console.log('=== 패턴 순서 최종 정리 ===\n')
  console.log('규칙: 버블 있는 패턴 → 등장 순서 1,2,3... / 버블 없는 패턴 → 뒤에 배치\n')

  // episode별 처리
  for (const [epNum, epId] of epMap) {
    const epPatterns = (allPatterns ?? []).filter(p => p.episode_id === epId)
    if (!epPatterns.length) continue

    // 패턴별 첫 등장 readOrder 계산
    const patternFirstRead = new Map<number, number>() // originalPatternIdx(1-5) → readOrder
    const epBubbles = (bubbles ?? [])
      .filter(b => b.episode_id === epId && b.highlight_text)
      .map(b => ({
        ...b,
        readOrder: (panelOrderMap.get(b.panel_id) ?? 0) * 1000 + b.order_num,
      }))
      .sort((a, b) => a.readOrder - b.readOrder)

    for (const b of epBubbles) {
      const pIdx = getPatternIndex(b.highlight_text!, epNum)
      if (pIdx !== null && !patternFirstRead.has(pIdx)) {
        patternFirstRead.set(pIdx, b.readOrder)
      }
    }

    // 각 pattern 객체에 encounterRank 붙이기
    // originalPatternIdx는 현재(or 원래) order_num이 아닌 getPatternIndex 역결과
    // → 여기서는 "버블과 매칭되는 패턴"을 readOrder 기준으로 순위 부여
    // 버블 없는 패턴은 originalPIdx 알 수 없으므로, patternFirstRead의 key set으로만 판별

    // patternFirstRead의 key: getPatternIndex가 반환하는 값(1-5)
    const encountered = [...patternFirstRead.entries()]
      .sort((a, b) => a[1] - b[1])  // readOrder 기준
      .map(([pIdx], rank) => ({ pIdx, rank: rank + 1 }))  // rank: 1-based

    // kp_patterns 각 row에 new_order 할당
    // 버블 있는 패턴: pIdx → encountered rank
    // 버블 없는 패턴: 뒤에 (encountered.length + 1 부터)
    //
    // 어떤 pattern row가 어느 pIdx인지: 현재는 순서가 섞였을 수 있어서
    // "이 pattern row의 패턴명"으로 pIdx를 결정해야 함.
    // → 각 row를 epBubbles와 매칭하여 pIdx 파악

    // pattern row → pIdx 역매핑:
    // patternFirstRead에 있는 pIdx들을 encountered 순으로 새 order 할당
    // patternFirstRead에 없는 pattern row들은 no-bubble → 뒤로

    // 먼저 각 pattern row가 "어느 pIdx"인지 판별:
    // pIdx는 getPatternIndex(highlight_text, epNum)으로 결정되는데
    // kp_patterns에는 highlight_text가 없음.
    // → 대신, highlight_text 값들을 정리해 각 pIdx에 대한 "대표 hl"을 구하고,
    //    pattern row의 기존 order_num vs pIdx 매칭으로 추론

    // 사실 더 간단하게: 각 pattern row의 기존 order_num(현재 엉망일 수 있음)보다는
    // 각 row를 encountered pIdx에 1:1 매핑하는 방법 필요.
    //
    // 안전한 방법: patternFirstRead의 pIdx들을 encounter rank 순으로 정렬한 배열 = orderedPIdx
    // kp_patterns row들을 현재 order_num으로 정렬해 버블 있는 것과 없는 것을 분리
    // 버블 있는 것들을 encounter rank 순으로 재배열 (orderedPIdx[i] → row[i])

    // patternFirstRead에 있는 pIdx = 버블 있는 패턴들의 "원래 의도된 순서"
    // 지금 kp_patterns에서 어떤 row가 그 pIdx에 해당하는지는:
    //   이 script가 이전에 실행되기 전 → order_num = pIdx였음
    //   이 script 이전 실행 후 → order_num이 바뀌었을 수 있음

    // 그러므로 "버블에 등장한 패턴"의 kp_patterns row를 찾는 가장 안전한 방법:
    // 각 encountered pIdx에 대해, 그것이 의미하는 패턴 이름을 hardcode.
    // 하지만 그것도 복잡하므로, 대신:
    // kp_patterns row 수 = 5 (모든 에피소드), encountered 수 = 버블 있는 수
    // 버블 있는 row = encountered.length개, 없는 = 5 - encountered.length
    //
    // 가장 실용적 접근: 현재 DB의 각 패턴 row를 "버블에 등장하는가"로 분류 후,
    // 버블 등장 row들을 첫 등장 순으로 재배열.
    //
    // 버블 등장 여부 판별: getPatternIndex(hl) 의 반환값이 각 row의 order_num과 같은 row → 버블 있음
    // 하지만 이전 script가 order_num을 이미 바꿔서 이 방법이 틀릴 수 있음.
    //
    // → 결론: "encountered pIdx 집합"(원래 의도된 패턴 번호)과 현재 row들 매칭이 필요.
    //   가장 안전한 방법: 각 kp_patterns row의 '패턴 이름'을 보고 pIdx를 결정하는
    //   별도 매핑 테이블 사용.

    // SIMPLEST SAFE APPROACH:
    // encountered = [pIdx1, pIdx2, ...] in readOrder (e.g. [3, 1, 5, 4] for EP05)
    // kp_patterns rows = 5 rows (some with bubbles, some without)
    // "버블 있는 row" = rows whose getPatternIndex-equivalent pIdx is in encountered set
    // → 각 row를 특정 pIdx에 연결하는 가장 안전한 방법: patternFirstRead key set

    const encounteredPIdxSet = new Set(patternFirstRead.keys())
    const orderedEncountered = encountered.map(e => e.pIdx) // [pIdx in encounter order]

    // 각 pattern row를 pIdx에 매핑 (기존 order_num 기반 - 처음 seed 시 pIdx=order_num이었음)
    // 이전 script가 order_num을 바꿨으므로, 더 이상 order_num이 원래 pIdx가 아님.
    // → pattern row의 순서 독립적 식별자가 없음.
    //
    // 최종 해결책: 각 row를 순서대로 encountered에 할당
    // 즉, 기존 order_num 순으로 정렬한 rows에서 버블 있는 것들을 encounter order로, 없는 것들을 뒤로.
    // 이 방식은 "버블 있는 rows 중 첫 번째 = 첫 번째 encounter pattern" 규칙.

    // CRITICAL INSIGHT: encountered pIdx는 getPatternIndex()가 반환하는 값인데
    // 이 함수는 highlight_text 기반으로 패턴 번호(1-5)를 반환함.
    // 이 패턴 번호는 "스토리 내 고유 패턴 유형"을 식별.
    // kp_patterns의 각 row는 특정 패턴 유형에 해당함.
    // 그러므로 encounteredPIdx set의 각 element가 kp_patterns의 어느 row인지 알면 됨.
    //
    // 정답: encountered pIdx 1-5 중 in-set인 것들의 kp_patterns row를 찾아야 함.
    // kp_patterns에는 pattern 컬럼이 있으므로, pattern 이름으로 매칭 가능.

    // 각 pIdx에 대응하는 패턴 이름 substring으로 매칭:
    const pIdxToPatternHint: Record<number, string[]> = {
      1: {
        2: ['어디예요'],
        3: ['하고 싶어요'],
        4: ['해도 돼요', '먹어도'],
        5: ['주실 수 있어요'],
        6: ['좋아해요'],
        7: ['깎아', '좀 깎'],
        8: ['추천해'],
        9: ['너무 좋다', '날씨'],
        10: ['에서 왔어요'],
      }[epNum] ?? ['주세요', '했어요'],
      2: {
        2: ['가고 싶어요', '에 가'],
        3: ['할 수 있어요', '없어요'],
        4: ['하면 안 돼요'],
        5: ['추천해 주세요'],
        6: ['진짜요', '대박'],
        7: ['다 해서', '얼마예요'],
        8: ['뭐 써요', '써요'],
        9: ['배달'],
        10: ['전공이에요'],
      }[epNum] ?? ['뭐예요', '어디예요'],
      3: {
        2: ['어떻게 가요'],
        3: ['이/가 아니에요', '아니에요'],
        4: ['어때요', '는/은 어때'],
        5: ['해 본 적', '본 적'],
        6: ['너무'],
        7: ['조금만'],
        8: ['어떤 게'],
        9: ['생각보다'],
        10: ['잘 부탁'],
      }[epNum] ?? ['이에요', '예요'],
      4: {
        2: ['주세요', '장 주세'],
        3: ['못해요', '못'],
        4: ['로 할게요', '할게요'],
        5: ['어디서 살', '살 수'],
        6: ['잘해요', '잘'],
        7: ['맛봐요', '맛봐'],
        8: ['써봤어요', '봤어요'],
        9: ['다 같이'],
        10: ['떨려요'],
      }[epNum] ?? ['있어요', '없어요'],
      5: {
        2: ['좋아요'],
        3: ['맞아요'],
        4: ['얼마나 걸려요'],
        5: ['맛있어요', '맛없어요'],
        6: ['오고 싶어요'],
        7: ['신기해요'],
        8: ['피부에'],
        9: ['이미'],
        10: ['할 수 있었어요'],
      }[epNum] ?? ['얼마예요', '얼마'],
    }

    // 각 row가 어떤 pIdx인지 패턴 이름으로 판단
    function rowToPIdx(row: { pattern: string }): number | null {
      for (const [pIdx, hints] of Object.entries(pIdxToPatternHint)) {
        if (hints.some(h => row.pattern.includes(h))) return Number(pIdx)
      }
      return null
    }

    const withBubble: typeof epPatterns = []
    const withoutBubble: typeof epPatterns = []

    // 각 row를 pIdx에 매핑
    const rowPIdxMap = new Map<number, number>() // row.id → pIdx
    for (const row of epPatterns) {
      const pIdx = rowToPIdx(row)
      if (pIdx !== null) rowPIdxMap.set(row.id, pIdx)
    }

    for (const row of epPatterns) {
      const pIdx = rowPIdxMap.get(row.id)
      if (pIdx !== null && encounteredPIdxSet.has(pIdx!)) {
        withBubble.push(row)
      } else {
        withoutBubble.push(row)
      }
    }

    // 버블 있는 row들을 encounter 순으로 정렬
    withBubble.sort((a, b) => {
      const pIdxA = rowPIdxMap.get(a.id) ?? 99
      const pIdxB = rowPIdxMap.get(b.id) ?? 99
      const rankA = orderedEncountered.indexOf(pIdxA)
      const rankB = orderedEncountered.indexOf(pIdxB)
      return rankA - rankB
    })

    // 새 order_num 결정: 버블 있는 것 1,2,3... → 버블 없는 것 N+1,N+2...
    const assignments: { id: number; new_order: number; pattern: string }[] = []
    let slot = 1
    for (const row of withBubble) {
      assignments.push({ id: row.id, new_order: slot++, pattern: row.pattern })
    }
    for (const row of withoutBubble) {
      assignments.push({ id: row.id, new_order: slot++, pattern: row.pattern })
    }

    // 현재 order_num과 다른 것만 출력/업데이트
    const changes = assignments.filter(a => {
      const cur = epPatterns.find(p => p.id === a.id)?.order_num
      return cur !== a.new_order
    })

    console.log(`EP${epNum}:`)
    for (const a of assignments) {
      const cur = epPatterns.find(p => p.id === a.id)?.order_num
      const hasBubble = withBubble.some(r => r.id === a.id)
      const changed = cur !== a.new_order
      const tag = hasBubble ? '' : ' (버블없음→끝)'
      console.log(`  ${changed ? '✗' : '✓'} p${a.new_order} [${a.pattern}]${tag}${changed ? `  (이전: ${cur})` : ''}`)
    }

    if (!changes.length) {
      console.log('  → 변경 없음')
    } else {
      // 1단계: 임시값으로 설정 (충돌 방지)
      for (const a of assignments) {
        await supabase.from('kp_patterns').update({ order_num: a.new_order + 500 }).eq('id', a.id)
      }
      // 2단계: 실제 값으로 설정
      for (const a of assignments) {
        const { error } = await supabase.from('kp_patterns').update({ order_num: a.new_order }).eq('id', a.id)
        if (error) console.error(`  FAIL id=${a.id}: ${error.message}`)
      }
      console.log(`  → ${changes.length}개 업데이트 완료`)
    }
    console.log()
  }

  console.log('✓ 전체 정리 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
