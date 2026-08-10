/**
 * 말풍선 위치 불일치 조사 스크립트
 * [1] 버블 키 생성 경로
 * [2] API 라우트 비교
 * [3] kpatto_webtoon_layouts episode_id 형식
 * [4] EP31 override 키 vs kp_bubbles 키 대조
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

const HR = '─'.repeat(60)

// ─── [3] kpatto_webtoon_layouts episode_id 전수 확인 ────────────────
async function checkLayoutIds() {
  console.log('\n' + HR)
  console.log('[3] kpatto_webtoon_layouts — episode_id 목록')
  console.log(HR)

  const { data, error } = await supabase
    .from('kpatto_webtoon_layouts')
    .select('episode_id, overrides')
    .order('episode_id')

  if (error) { console.error(error); return }

  const rows = data ?? []
  console.log(`전체 행: ${rows.length}개`)

  // 형식 분류
  const padded: string[] = []   // kp-ep-031
  const unpadded: string[] = [] // kp-ep-31
  const other: string[] = []

  for (const row of rows) {
    const id = row.episode_id as string
    if (/kp-ep-\d{3,}/.test(id)) padded.push(id)
    else if (/kp-ep-\d{1,2}$/.test(id)) unpadded.push(id)
    else other.push(id)
  }

  console.log(`\n3자리 (kp-ep-031 형식): ${padded.length}개`)
  console.log(padded.join(', ') || '(없음)')

  console.log(`\n1-2자리 (kp-ep-31 형식): ${unpadded.length}개`)
  console.log(unpadded.join(', ') || '(없음)')

  if (other.length) {
    console.log(`\n기타: ${other.length}개`)
    console.log(other.join(', '))
  }

  // 중복 확인: 같은 에피소드 번호를 가진 두 가지 형식
  const epNums = new Map<string, string[]>()  // epNum → [ids]
  for (const row of rows) {
    const id = row.episode_id as string
    const m = id.match(/kp-ep-(\d+)/)
    if (!m) continue
    const num = String(parseInt(m[1]))  // normalize to plain number string
    if (!epNums.has(num)) epNums.set(num, [])
    epNums.get(num)!.push(id)
  }

  const dups = [...epNums.entries()].filter(([, ids]) => ids.length > 1)
  if (dups.length > 0) {
    console.log(`\n⚠️  중복 에피소드 번호 (형식 다른 행 공존): ${dups.length}개`)
    for (const [num, ids] of dups) {
      const overridesCounts = ids.map(id => {
        const row = rows.find(r => r.episode_id === id)
        return `${id} (overrides=${Object.keys((row?.overrides as Record<string,unknown>) ?? {}).length}건)`
      })
      console.log(`  EP${num}: ${overridesCounts.join(' | ')}`)
    }
  } else {
    console.log('\n✅ 중복 형식 없음')
  }

  return rows
}

// ─── [4] EP31 override 키 vs kp_bubbles 생성 키 대조 ──────────────
async function checkEP31Keys() {
  console.log('\n' + HR)
  console.log('[4] EP31 override 키 vs kp_bubbles 생성 키 대조')
  console.log(HR)

  // EP31 episode_num=31 → kp_episodes.id
  const { data: ep } = await supabase
    .from('kp_episodes')
    .select('id')
    .eq('episode_num', 31)
    .single()
  if (!ep) { console.log('EP31 kp_episodes 행 없음'); return }

  // kp_panels (EP31)
  const { data: panels } = await supabase
    .from('kp_panels')
    .select('id, order_num, type, layout')
    .eq('episode_id', (ep as {id: number}).id)
    .order('order_num')

  const panelList = (panels ?? []) as Array<{id: number; order_num: number; type: string; layout: string | null}>

  console.log(`\nkp_panels 총 ${panelList.length}개:`)
  for (const p of panelList) {
    console.log(`  order_num=${p.order_num} type=${p.type} layout=${p.layout ?? 'wide'}`)
  }

  // hasGaps 및 hasOrderConflict 판별
  const hasGaps = panelList.some(p => p.type === 'gap')
  const gapOrderSet = new Set(panelList.filter(p => p.type === 'gap').map(p => p.order_num))
  const hasOrderConflict = panelList.some(p => p.type === 'panel' && gapOrderSet.has(p.order_num))

  console.log(`\nhasGaps=${hasGaps}  hasOrderConflict=${hasOrderConflict}`)

  // 코드 경로 결정
  let codePath: string
  if (!hasGaps) codePath = 'C: 이미지패널만 (신규 방식, gap-0=top, gap-1부터 대화)'
  else if (!hasOrderConflict) codePath = 'A: EP01-30 방식 (b-{order_num}-{i+1})'
  else codePath = 'B: EP31-100 방식 (b-gap-{N}-{i+1})'
  console.log(`코드 경로: ${codePath}`)

  // kp_bubbles (EP31) - order_num으로 정렬
  const { data: bubbles } = await supabase
    .from('kp_bubbles')
    .select('panel_id, order_num')
    .eq('episode_id', (ep as {id: number}).id)
    .order('order_num')

  const bubbleList = (bubbles ?? []) as Array<{panel_id: number; order_num: number}>

  // 버블 키 시뮬레이션
  const byPanel = new Map<number, number>()  // panel_id → bubble count
  for (const b of bubbleList) {
    byPanel.set(b.panel_id, (byPanel.get(b.panel_id) ?? 0) + 1)
  }

  const simulatedKeys: string[] = []

  if (!hasGaps) {
    // Path C
    const imgPanels = panelList.filter(p => p.type === 'panel')
    let gapCount = 0
    gapCount++ // gap-0: top empty gap
    for (const p of imgPanels) {
      const gapId = `gap-${gapCount++}`
      const cnt = byPanel.get(p.id) ?? 0
      for (let i = 0; i < cnt; i++) simulatedKeys.push(`b-${gapId}-${i + 1}`)
    }
  } else if (!hasOrderConflict) {
    // Path A
    for (const p of panelList) {
      if (p.type === 'gap') {
        const cnt = byPanel.get(p.id) ?? 0
        for (let i = 0; i < cnt; i++) simulatedKeys.push(`b-${p.order_num}-${i + 1}`)
      }
    }
  } else {
    // Path B
    const imgPanels = panelList.filter(p => p.type === 'panel')
    const sortedGapRows = [...panelList.filter(p => p.type === 'gap')].sort((a, b) => a.order_num - b.order_num)

    // row 구성 (layout 기반)
    const rows: typeof imgPanels[0][][] = []
    let cur: typeof imgPanels = [], wSum = 0
    for (const p of imgPanels) {
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

    const gapQ = [...sortedGapRows]
    let gapCount = 0

    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri]
      const lastOrd = row[row.length - 1].order_num
      const gi = gapQ.findIndex(g => g.order_num >= lastOrd)
      if (gi >= 0) {
        const [gRow] = gapQ.splice(gi, 1)
        const gapId = `gap-${gapCount++}`
        const cnt = byPanel.get(gRow.id) ?? 0
        for (let i = 0; i < cnt; i++) simulatedKeys.push(`b-${gapId}-${i + 1}`)
      }
    }
    for (const gRow of gapQ) {
      const gapId = `gap-${gapCount++}`
      const cnt = byPanel.get(gRow.id) ?? 0
      for (let i = 0; i < cnt; i++) simulatedKeys.push(`b-${gapId}-${i + 1}`)
    }
  }

  console.log(`\n생성되는 버블 키 (${simulatedKeys.length}개):`)
  console.log(simulatedKeys.join(', '))

  // kpatto_webtoon_layouts override 키 (EP31)
  const candidates = ['kp-ep-031', 'kp-ep-31']
  for (const cand of candidates) {
    const { data: layout } = await supabase
      .from('kpatto_webtoon_layouts')
      .select('overrides')
      .eq('episode_id', cand)
      .single()

    if (!layout) {
      console.log(`\n[${cand}] → 행 없음`)
      continue
    }
    const ov = (layout.overrides as Record<string,unknown>) ?? {}
    const ovKeys = Object.keys(ov)
    console.log(`\n[${cand}] overrides 키 (${ovKeys.length}개):`)
    console.log(ovKeys.join(', ') || '(없음)')

    // 매칭 여부
    const simSet = new Set(simulatedKeys)
    const matched = ovKeys.filter(k => simSet.has(k))
    const unmatched = ovKeys.filter(k => !simSet.has(k))
    console.log(`  ✅ 매칭: ${matched.length}개 / ❌ 미매칭: ${unmatched.length}개`)
    if (unmatched.length) console.log(`  미매칭 키: ${unmatched.join(', ')}`)
  }
}

// ─── [1] EP01 vs EP31 키 직접 출력 ────────────────────────────────
async function compareEP01vsEP31() {
  console.log('\n' + HR)
  console.log('[1] EP01 vs EP31 — 생성 키 비교')
  console.log(HR)

  for (const epNum of [1, 31]) {
    const { data: ep } = await supabase
      .from('kp_episodes')
      .select('id')
      .eq('episode_num', epNum)
      .single()
    if (!ep) { console.log(`EP${epNum}: kp_episodes 없음`); continue }

    const { data: panels } = await supabase
      .from('kp_panels')
      .select('id, order_num, type, layout')
      .eq('episode_id', (ep as {id: number}).id)
      .order('order_num')

    const panelList = (panels ?? []) as Array<{id: number; order_num: number; type: string; layout: string | null}>
    const hasGaps = panelList.some(p => p.type === 'gap')
    const gapOrderSet = new Set(panelList.filter(p => p.type === 'gap').map(p => p.order_num))
    const hasOrderConflict = panelList.some(p => p.type === 'panel' && gapOrderSet.has(p.order_num))

    const { data: bubbles } = await supabase
      .from('kp_bubbles')
      .select('panel_id, order_num')
      .eq('episode_id', (ep as {id: number}).id)
      .order('order_num')
    const bubbleList = (bubbles ?? []) as Array<{panel_id: number; order_num: number}>
    const byPanel = new Map<number, number>()
    for (const b of bubbleList) byPanel.set(b.panel_id, (byPanel.get(b.panel_id) ?? 0) + 1)

    let path: string
    const keys: string[] = []
    if (!hasGaps) {
      path = 'C(신규)'
      const imgPanels = panelList.filter(p => p.type === 'panel')
      let gc = 1  // gap-0 is top empty
      for (const p of imgPanels) {
        const gapId = `gap-${gc++}`
        const cnt = byPanel.get(p.id) ?? 0
        for (let i = 0; i < cnt; i++) keys.push(`b-${gapId}-${i + 1}`)
      }
    } else if (!hasOrderConflict) {
      path = 'A(EP01-30)'
      for (const p of panelList) {
        if (p.type === 'gap') {
          const cnt = byPanel.get(p.id) ?? 0
          for (let i = 0; i < cnt; i++) keys.push(`b-${p.order_num}-${i + 1}`)
        }
      }
    } else {
      path = 'B(EP31-100 gap공유)'
      const imgPanels = panelList.filter(p => p.type === 'panel')
      const sortedGaps = [...panelList.filter(p => p.type === 'gap')].sort((a, b) => a.order_num - b.order_num)
      const rows: typeof imgPanels[0][][] = []
      let cur: typeof imgPanels = [], wSum = 0
      for (const p of imgPanels) {
        const lay = p.layout ?? 'wide'
        if (lay === 'wide') { if (cur.length) { rows.push(cur); cur = []; wSum = 0 } rows.push([p]) }
        else if (lay.startsWith('split:')) { cur.push(p); wSum += parseFloat(lay.slice(6)); if (wSum >= 99) { rows.push(cur); cur = []; wSum = 0 } }
        else if (lay.startsWith('stack-t:')) { cur.push(p); wSum += parseFloat(lay.slice(8)) }
        else if (lay === 'stack-b') { cur.push(p); rows.push(cur); cur = []; wSum = 0 }
      }
      if (cur.length) rows.push(cur)
      const gapQ = [...sortedGaps]; let gc = 0
      for (const row of rows) {
        const lastOrd = row[row.length - 1].order_num
        const gi = gapQ.findIndex(g => g.order_num >= lastOrd)
        if (gi >= 0) { const [gRow] = gapQ.splice(gi, 1); const gapId = `gap-${gc++}`; const cnt = byPanel.get(gRow.id) ?? 0; for (let i = 0; i < cnt; i++) keys.push(`b-${gapId}-${i + 1}`) }
      }
      for (const gRow of gapQ) { const gapId = `gap-${gc++}`; const cnt = byPanel.get(gRow.id) ?? 0; for (let i = 0; i < cnt; i++) keys.push(`b-${gapId}-${i + 1}`) }
    }

    console.log(`\nEP${epNum} (경로=${path}):`)
    console.log(`  패널: ${panelList.length}개 (gap=${panelList.filter(p=>p.type==='gap').length}, panel=${panelList.filter(p=>p.type==='panel').length})`)
    console.log(`  hasGaps=${hasGaps} hasOrderConflict=${hasOrderConflict}`)
    console.log(`  생성 버블 키 (${keys.length}개): ${keys.join(', ')}`)
  }
}

// ─── [2] API 라우트 비교 ────────────────────────────────────────────
function compareAPIRoutes() {
  console.log('\n' + HR)
  console.log('[2] API 라우트 비교 (코드 기준)')
  console.log(HR)
  console.log(`
에디터: GET /api/admin/episode-layout?id={episode.id}
  → kpatto_webtoon_layouts WHERE episode_id = id
  → 반환: { episodeId, overrides, bubbles }

뷰어:   GET /api/kpatto/episode-layout?id={episode.id}
  → kpatto_webtoon_layouts WHERE episode_id = id
  → 반환: { episodeId, overrides, bubbles }

차이점:
  - 쿼리: 동일 (episode_id = id)
  - 반환 필드: 동일 (overrides, bubbles)
  - episode.id 출처:
      에디터: fetchWebtoonEpisode(normalizeEpId(URL param))
      뷰어: fetchWebtoonEpisode(normalizeEpId(URL param))
      → 둘 다 normalizeEpId → kp-ep-031 형식 사용

결론: API 라우트 자체는 동일하게 동작.
      episode_id 형식이 일치해야만 올바른 행을 읽음.
  `)
}

async function main() {
  compareAPIRoutes()
  await checkLayoutIds()
  await compareEP01vsEP31()
  await checkEP31Keys()
}

main().catch(console.error)
