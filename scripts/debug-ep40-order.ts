/**
 * EP40 전체재생 순서 조사
 * - EP39·40·41 kp_panels 순서 비교
 * - EP40 allBubbles 시뮬레이션 (sections 순서 재현)
 * - 전 화 비정상 패턴 스캔
 *
 * 수정 없음 — 조사·보고 전용
 * npx tsx scripts/debug-ep40-order.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// fetch-episode.ts 의 complex path 로직을 그대로 재현
function simulateSections(panelList: { id: number; type: string; order_num: number; layout: string | null }[]) {
  const imgPanels = panelList.filter(p => p.type === 'panel')
  const sortedGapRows = [...panelList.filter(p => p.type === 'gap')].sort((a, b) => a.order_num - b.order_num)

  const rowsL: typeof imgPanels[] = []
  let curL: typeof imgPanels = [], wSumL = 0
  for (const p of imgPanels) {
    const lay = (p.layout ?? 'wide') as string
    if (lay === 'wide') {
      if (curL.length) { rowsL.push(curL); curL = []; wSumL = 0 }
      rowsL.push([p])
    } else if (lay.startsWith('split:')) {
      curL.push(p); wSumL += parseFloat(lay.slice(6))
      if (wSumL >= 99) { rowsL.push(curL); curL = []; wSumL = 0 }
    } else if (lay.startsWith('stack-t:')) {
      curL.push(p); wSumL += parseFloat(lay.slice(8))
    } else if (lay === 'stack-b') {
      curL.push(p); rowsL.push(curL); curL = []; wSumL = 0
    }
  }
  if (curL.length) rowsL.push(curL)

  const gapQ = [...sortedGapRows]
  const sections: { type: 'gap' | 'panel'; id: number; order_num: number; row?: number }[] = []
  let panelCount = 0

  for (let ri = 0; ri < rowsL.length; ri++) {
    const row = rowsL[ri]
    const lastOrd = row[row.length - 1].order_num
    const gi = gapQ.findIndex(g => g.order_num >= lastOrd)
    if (gi >= 0) {
      const [gRow] = gapQ.splice(gi, 1)
      sections.push({ type: 'gap', id: gRow.id, order_num: gRow.order_num, row: ri + 1 })
    }
    for (const rp of row) {
      panelCount++
      sections.push({ type: 'panel', id: rp.id, order_num: rp.order_num, row: ri + 1 })
    }
  }
  // trailing gaps
  for (const gRow of gapQ) {
    sections.push({ type: 'gap', id: gRow.id, order_num: gRow.order_num })
  }

  return { rows: rowsL, sections }
}

async function getEpisodePanels(epNum: number) {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', epNum).single()
  if (!ep) return null
  const { data: panels } = await sb.from('kp_panels')
    .select('id, type, order_num, layout, height_ratio, image_url')
    .eq('episode_id', ep.id as string)
    .order('order_num')
  return panels ?? []
}

async function getEpisodeBubbles(epNum: number) {
  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', epNum).single()
  if (!ep) return null

  // kp_bubbles (panel_id 기반)
  const { data: panels } = await sb.from('kp_panels').select('id, type, order_num').eq('episode_id', ep.id as string)
  const gapIds = (panels ?? []).filter(p => p.type === 'gap').map(p => p.id as number)
  if (gapIds.length === 0) return []

  const { data: bubbles } = await sb.from('kp_bubbles')
    .select('id, panel_id, order_num, speaker, korean, dialogue_id, audio_url')
    .in('panel_id', gapIds)
    .order('order_num')

  // kp_dialogues의 audio_url 가져오기
  const { data: dialogues } = await sb.from('kp_dialogues').select('id, audio_url, speaker, text_ko').eq('episode_id', epNum)
  const dlgMap = new Map((dialogues ?? []).map(d => [d.id as number, d]))

  return (bubbles ?? []).map(b => ({
    ...b,
    dialogue_audio: b.dialogue_id ? dlgMap.get(b.dialogue_id as number)?.audio_url : null,
    dialogue_speaker: b.dialogue_id ? dlgMap.get(b.dialogue_id as number)?.speaker : null,
  }))
}

async function printEpPanels(epNum: number) {
  const panels = await getEpisodePanels(epNum)
  if (!panels) { console.log(`EP${epNum}: 에피소드 없음`); return }

  const imagePanels = panels.filter(p => p.type === 'panel')
  const gapPanels = panels.filter(p => p.type === 'gap')
  console.log(`\n━━ EP${epNum} panels ━━`)
  console.log(`  이미지: [${imagePanels.map(p => `${p.order_num}(${p.layout ?? 'wide'})`).join(', ')}]`)
  console.log(`  갭:     [${gapPanels.map(p => p.order_num).join(', ')}]`)

  const gapOrderSet = new Set(gapPanels.map(p => p.order_num as number))
  const hasConflict = imagePanels.some(p => gapOrderSet.has(p.order_num as number))
  console.log(`  hasOrderConflict: ${hasConflict}`)
}

async function main() {
  // ── 1. EP39·40·41 패널 구조 비교 ─────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════')
  console.log('  1. EP39·40·41 패널 순서 구조')
  console.log('═══════════════════════════════════════════════')

  for (const epNum of [39, 40, 41]) {
    await printEpPanels(epNum)
  }

  // ── 2. EP40 allBubbles 시뮬레이션 ────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════')
  console.log('  2. EP40 allBubbles 재생 순서 시뮬레이션')
  console.log('═══════════════════════════════════════════════')

  const ep40Panels = await getEpisodePanels(40)
  const ep40Bubbles = await getEpisodeBubbles(40)

  if (ep40Panels && ep40Bubbles) {
    const { rows, sections } = simulateSections(ep40Panels as any[])

    // gap_id → bubbles 매핑
    const byPanel = new Map<number, typeof ep40Bubbles>()
    for (const b of ep40Bubbles) {
      const arr = byPanel.get(b.panel_id as number) ?? []
      arr.push(b)
      byPanel.set(b.panel_id as number, arr)
    }

    console.log(`\n  총 행(row) 수: ${rows.length}`)
    console.log(`  총 sections: ${sections.length} (gap=${sections.filter(s => s.type === 'gap').length}, panel=${sections.filter(s => s.type === 'panel').length})`)

    console.log('\n  ── 재생 순서 (sections → allBubbles) ──')
    let bubbleIdx = 0
    for (const sec of sections) {
      if (sec.type === 'gap') {
        const bs = (byPanel.get(sec.id) ?? []).sort((a, b) => (a.order_num as number) - (b.order_num as number))
        for (const b of bs) {
          const audioOk = !!(b.audio_url || b.dialogue_audio)
          console.log(`  [${String(bubbleIdx + 1).padStart(2)}] gap(order_num=${sec.order_num}) | id=${b.id} | ${b.dialogue_speaker ?? b.speaker} | "${String(b.korean ?? '').slice(0, 25)}" | audio=${audioOk ? '✓' : '✗NULL'}`)
          bubbleIdx++
        }
      } else {
        // panel 섹션: 컷 번호를 row 기준으로 표시
        const panelData = ep40Panels.find(p => p.id === sec.id)
        console.log(`  ──── 컷(panel id=${sec.id}, order_num=${sec.order_num}, layout=${panelData?.layout ?? 'wide'}) ────`)
      }
    }
  }

  // ── 3. EP39·41 allBubbles 시뮬레이션 ────────────────────────────────
  for (const epNum of [39, 41]) {
    console.log(`\n═══════════════════════════════════════════════`)
    console.log(`  3. EP${epNum} allBubbles 재생 순서 시뮬레이션`)
    console.log(`═══════════════════════════════════════════════`)

    const panels = await getEpisodePanels(epNum)
    const bubbles = await getEpisodeBubbles(epNum)
    if (!panels || !bubbles) continue

    const gapOrderSet = new Set(panels.filter(p => p.type === 'gap').map(p => p.order_num as number))
    const hasConflict = panels.filter(p => p.type === 'panel').some(p => gapOrderSet.has(p.order_num as number))
    if (!hasConflict) { console.log(`  EP${epNum}: simple path (no conflict)`); continue }

    const { sections } = simulateSections(panels as any[])
    const byPanel = new Map<number, typeof bubbles>()
    for (const b of bubbles) {
      const arr = byPanel.get(b.panel_id as number) ?? []
      arr.push(b)
      byPanel.set(b.panel_id as number, arr)
    }

    let bubbleIdx = 0
    for (const sec of sections) {
      if (sec.type === 'gap') {
        const bs = (byPanel.get(sec.id) ?? []).sort((a, b) => (a.order_num as number) - (b.order_num as number))
        for (const b of bs) {
          console.log(`  [${String(bubbleIdx + 1).padStart(2)}] gap(${sec.order_num}) | ${b.dialogue_speaker ?? b.speaker} | "${String(b.korean ?? '').slice(0, 25)}"`)
          bubbleIdx++
        }
      } else {
        const panelData = panels.find(p => p.id === sec.id)
        console.log(`  ──── 컷(id=${sec.id}, order_num=${sec.order_num}, ${panelData?.layout ?? 'wide'}) ────`)
      }
    }
  }

  // ── 4. 전 화 이상 패턴 스캔 ─────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════')
  console.log('  4. EP01-100 패널 이상 패턴 스캔')
  console.log('═══════════════════════════════════════════════')
  console.log('     (중복 order_num, NULL, 음수, 건너뜀 검사)')

  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
  const problems: string[] = []

  for (const ep of (eps ?? [])) {
    const epNum = ep.episode_num as number
    const { data: panels } = await sb.from('kp_panels')
      .select('id, type, order_num, layout')
      .eq('episode_id', ep.id as string)
      .order('order_num')
    if (!panels || panels.length === 0) continue

    const pNums = panels.filter(p => p.type === 'panel').map(p => p.order_num as number)
    const gNums = panels.filter(p => p.type === 'gap').map(p => p.order_num as number)

    const issues: string[] = []

    // NULL / 음수
    const hasNull = panels.some(p => p.order_num == null)
    const hasNeg  = panels.some(p => (p.order_num as number) < 0)
    if (hasNull) issues.push('NULL order_num')
    if (hasNeg)  issues.push('음수 order_num')

    // 패널 중복
    const pUniq = new Set(pNums)
    if (pUniq.size < pNums.length) issues.push(`image 중복: [${pNums.join(',')}]`)

    // 갭 중복
    const gUniq = new Set(gNums)
    if (gUniq.size < gNums.length) issues.push(`gap 중복: [${gNums.join(',')}]`)

    // 갭 수 vs 이미지 패널 수 (갭이 너무 많으면 trailing이 생겨 allBubbles 순서 뒤집힘)
    if (gNums.length > pNums.length) {
      issues.push(`gap(${gNums.length}) > panel(${pNums.length})`)
    }

    if (issues.length > 0) {
      const issueStr = `EP${String(epNum).padStart(2,'0')}: ⚠ ${issues.join(' | ')}`
      console.log('  ' + issueStr)
      problems.push(issueStr)
    }
  }

  if (problems.length === 0) {
    console.log('  ✓ 전 화 이상 없음')
  } else {
    console.log(`\n  ⚠ 이상 화 ${problems.length}건`)
  }
}

main().catch(console.error)
