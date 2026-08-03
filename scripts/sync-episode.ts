/**
 * K-PATTO 에피소드 동기화
 *
 * 텍스트 대본을 파싱해서 DB의 아래 테이블을 재구축:
 *   kp_scenes + kp_dialogues   : 삭제 후 재삽입
 *   kp_bubbles                  : 좌표 유지, 텍스트만 교체 (개수 증감 시 생성·삭제)
 *   kp_dialogue_expressions     : 삭제 후 ▸ 지정 항목만 focus로 재삽입
 *
 * usage:
 *   npx tsx scripts/sync-episode.ts --ep 1
 *   npx tsx scripts/sync-episode.ts --ep 1-10
 *
 * 입력 파일: data/kpatto/scripts/ep001-010.txt (10화 단위)
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── 화자 이름 → DB speaker 코드 ─────────────────────────────────────────────
const SPEAKER_MAP: Record<string, string> = {
  '에마': 'emma', '지수': 'jisu', '민준': 'minjun', '소피': 'sophie',
  '모두': 'all', '학생들': 'students', '학생': 'student',
  '상인': 'merchant', '직원': 'staff', '약사': 'pharmacist',
  '행인': 'stranger', '교수': 'professor', '교수님': 'professor',
  '기사': 'driver', '접수': 'receptionist', '의사': 'doctor',
  '안내방송': 'announcement', '점원': 'clerk',
}
const mapSpeaker = (name: string): string => SPEAKER_MAP[name.trim()] ?? name.trim()

// ── 타입 ────────────────────────────────────────────────────────────────────
interface Highlight { expressionText: string; matchedText: string }
interface Dialogue {
  speaker: string; korean: string; english: string
  type: 'speech' | 'thought'; highlights: Highlight[]; seqInCut: number
}
interface Cut { cutNum: number; dialogues: Dialogue[] }
interface Episode { epNum: number; title: string; cuts: Cut[] }

// ── 텍스트 파일 파서 ─────────────────────────────────────────────────────────
function parseFile(content: string): Map<number, Episode> {
  const episodes = new Map<number, Episode>()
  let ep: Episode | null = null
  let cut: Cut | null = null
  let lastDlg: Dialogue | null = null

  for (const raw of content.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    // EP 헤더: "EP01 | 카페에서"
    const epM = line.match(/^EP(\d+)\s*\|\s*(.+)$/)
    if (epM) {
      ep = { epNum: parseInt(epM[1]), title: epM[2].trim(), cuts: [] }
      episodes.set(ep.epNum, ep)
      cut = null; lastDlg = null
      continue
    }
    if (!ep) continue

    // 컷 헤더: "[컷1]"
    const cutM = line.match(/^\[컷(\d+)\]$/)
    if (cutM) {
      cut = { cutNum: parseInt(cutM[1]), dialogues: [] }
      ep.cuts.push(cut)
      lastDlg = null
      continue
    }
    if (!cut) continue

    // ▸ 하이라이트: "▸ ~표현 → "matched_text""
    if (line.startsWith('▸') && lastDlg) {
      const hlM = line.match(/^▸\s+(.+?)\s*→\s*"(.+)"$/)
      if (hlM) lastDlg.highlights.push({ expressionText: hlM[1].trim(), matchedText: hlM[2].trim() })
      continue
    }

    // EN: 번역
    if (line.startsWith('EN:') && lastDlg) {
      lastDlg.english = line.slice(3).trim()
      continue
    }

    // 대사: "화자(생각)?: 대사"
    // 화자명은 '(', ':', 줄바꿈 이전까지
    const dlgM = line.match(/^([^(\n:]+?)(\(생각\))?:\s*(.+)$/)
    if (dlgM) {
      const d: Dialogue = {
        speaker:    dlgM[1].trim(),
        korean:     dlgM[3].trim(),
        english:    '',
        type:       dlgM[2] ? 'thought' : 'speech',
        highlights: [],
        seqInCut:   cut.dialogues.length + 1,
      }
      cut.dialogues.push(d)
      lastDlg = d
    }
  }

  return episodes
}

// ── CLI 파싱 ─────────────────────────────────────────────────────────────────
function parseRange(argv: string[]): [number, number] {
  const idx = argv.indexOf('--ep')
  if (idx < 0 || !argv[idx + 1]) {
    console.error('--ep 옵션이 필요합니다. 예: --ep 1 또는 --ep 1-10')
    process.exit(1)
  }
  const parts = argv[idx + 1].split('-').map(Number)
  return parts.length === 1 ? [parts[0], parts[0]] : [Math.min(parts[0], parts[1]), Math.max(parts[0], parts[1])]
}

// ── 입력 파일 경로 목록 ──────────────────────────────────────────────────────
function getFilePaths(epFrom: number, epTo: number): string[] {
  const paths = new Set<string>()
  for (let ep = epFrom; ep <= epTo; ep++) {
    const group = Math.floor((ep - 1) / 10)
    const start = group * 10 + 1
    const end   = (group + 1) * 10
    paths.add(path.resolve(process.cwd(), 'data/kpatto/scripts',
      `ep${String(start).padStart(3,'0')}-${String(end).padStart(3,'0')}.txt`))
  }
  return [...paths]
}

// ── 신규 bubble 기본 위치 ─────────────────────────────────────────────────────
function defaultPosition(orderNum: number, type: 'speech' | 'thought' = 'speech'): object {
  const bubbleKey = type === 'thought' ? 'bubble-thought-down' : 'bubble-oval'
  return { xPct: 5, yPct: 5 + (orderNum - 1) * 40, widthPct: 85, bubbleKey, lines: 2 }
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  const [epFrom, epTo] = parseRange(process.argv)

  // ─ 파일 읽기 & 파싱 ──────────────────────────────────────────────────────
  const filePaths = getFilePaths(epFrom, epTo)
  const allEpisodes = new Map<number, Episode>()
  for (const fp of filePaths) {
    if (!fs.existsSync(fp)) { console.error(`파일 없음: ${fp}`); process.exit(1) }
    for (const [num, ep] of parseFile(fs.readFileSync(fp, 'utf-8'))) {
      if (num >= epFrom && num <= epTo) allEpisodes.set(num, ep)
    }
  }
  if (allEpisodes.size === 0) {
    console.error(`EP${epFrom}~EP${epTo} 범위의 에피소드를 찾을 수 없습니다.`)
    process.exit(1)
  }

  // kp_expressions 전체 로드 (korean → id 맵)
  const { data: exprRows } = await sb.from('kp_expressions').select('id, korean')
  const exprMap = new Map<string, number>()
  for (const r of exprRows ?? []) exprMap.set(r.korean, r.id)

  // ── §6 안전장치 1: 스크립트 ▸ 표현이 DB에 전부 존재하는지 검사 ─────────────
  const missingExprs: { epNum: number; text: string }[] = []
  for (const [epNum, ep] of allEpisodes) {
    const seen = new Set<string>()
    for (const cut of ep.cuts)
      for (const dlg of cut.dialogues)
        for (const hl of dlg.highlights)
          if (!seen.has(hl.expressionText) && !exprMap.has(hl.expressionText)) {
            missingExprs.push({ epNum, text: hl.expressionText })
            seen.add(hl.expressionText)
          }
  }
  if (missingExprs.length > 0) {
    for (const m of missingExprs)
      console.error(`EP${m.epNum}: 표현 "${m.text}"이 kp_expressions에 없습니다.`)
    process.exit(1)
  }

  // ── §6 안전장치 2, 3: ▸ 검증 ─────────────────────────────────────────────
  for (const [epNum, ep] of allEpisodes) {
    for (const cut of ep.cuts) {
      for (const dlg of cut.dialogues) {
        for (const hl of dlg.highlights) {
          // 안전장치 2: 표현이 DB에 존재?
          if (!exprMap.has(hl.expressionText)) {
            console.error(`EP${epNum} 컷${cut.cutNum}: 표현 "${hl.expressionText}"이 kp_expressions에 없습니다.`)
            process.exit(1)
          }
          // 안전장치 3: matched_text가 대사에 포함? (exact substring)
          if (!dlg.korean.includes(hl.matchedText)) {
            console.error(
              `EP${epNum} 컷${cut.cutNum}: matched_text "${hl.matchedText}"가 대사에 없습니다.\n` +
              `  대사: "${dlg.korean}"`
            )
            process.exit(1)
          }
        }
      }
    }
  }

  console.log(`✓ 검증 완료 — EP${epFrom}~EP${epTo} (${allEpisodes.size}화)`)

  // ─ 에피소드 ID 맵 ────────────────────────────────────────────────────────
  const { data: epRows } = await sb.from('kp_episodes').select('id, episode_num')
    .in('episode_num', [...allEpisodes.keys()])
  const epIdMap = new Map<number, number>()
  for (const r of epRows ?? []) epIdMap.set(r.episode_num, r.id)

  // ─ 에피소드별 처리 ────────────────────────────────────────────────────────
  for (const [epNum, ep] of [...allEpisodes.entries()].sort((a, b) => a[0] - b[0])) {
    const epId = epIdMap.get(epNum)
    if (!epId) {
      console.error(`EP${epNum}이 kp_episodes에 없습니다.`); process.exit(1)
    }

    console.log(`\n─── EP${String(epNum).padStart(2,'0')} | ${ep.title} ───`)

    // ─ 1. kp_dialogue_expressions 삭제 ──────────────────────────────────────
    const { data: oldDlgs } = await sb.from('kp_dialogues').select('id').eq('episode_id', epId)
    if (oldDlgs?.length) {
      const { error } = await sb.from('kp_dialogue_expressions').delete()
        .in('dialogue_id', oldDlgs.map(d => d.id))
      if (error) { console.error('kp_dialogue_expressions 삭제 오류:', error.message); process.exit(1) }
    }

    // ─ 2. kp_dialogues 삭제 ─────────────────────────────────────────────────
    const { error: dlgDelErr } = await sb.from('kp_dialogues').delete().eq('episode_id', epId)
    if (dlgDelErr) { console.error('kp_dialogues 삭제 오류:', dlgDelErr.message); process.exit(1) }

    // ─ 3. kp_scenes 삭제 ────────────────────────────────────────────────────
    const { error: scDelErr } = await sb.from('kp_scenes').delete().eq('episode_id', epId)
    if (scDelErr) { console.error('kp_scenes 삭제 오류:', scDelErr.message); process.exit(1) }

    // ─ 4. kp_scenes 삽입 ────────────────────────────────────────────────────
    const { data: insertedScenes, error: scInsErr } = await sb.from('kp_scenes')
      .insert(ep.cuts.map(c => ({ episode_id: epId, scene_number: c.cutNum, location_note: '' })))
      .select('id, scene_number')
    if (scInsErr || !insertedScenes) {
      console.error('kp_scenes 삽입 오류:', scInsErr?.message); process.exit(1)
    }
    const sceneIdMap = new Map<number, number>(insertedScenes.map(s => [s.scene_number, s.id]))

    // ─ 5. kp_dialogues 삽입 ─────────────────────────────────────────────────
    const dlgRows: object[] = []
    for (const cut of ep.cuts) {
      const sceneId = sceneIdMap.get(cut.cutNum)!
      cut.dialogues.forEach((d, i) => dlgRows.push({
        episode_id: epId,
        scene_id:   sceneId,
        speaker:    mapSpeaker(d.speaker),
        text_ko:    d.korean,
        order_num:  i + 1,
      }))
    }
    const { data: insertedDlgs, error: dlgInsErr } = await sb.from('kp_dialogues')
      .insert(dlgRows)
      .select('id, scene_id, order_num')
    if (dlgInsErr || !insertedDlgs) {
      console.error('kp_dialogues 삽입 오류:', dlgInsErr?.message); process.exit(1)
    }
    // dialogue_id 역맵: "scene_id:order_num" → id
    const dlgIdMap = new Map<string, number>()
    for (const d of insertedDlgs) dlgIdMap.set(`${d.scene_id}:${d.order_num}`, d.id)

    // ─ 6. kp_bubbles 전량 교체 ──────────────────────────────────────────────
    // 6-a. 기존 좌표 읽기 (컷 번호:seq) → {xPct, yPct}
    const { data: gapPanels } = await sb.from('kp_panels')
      .select('id, order_num')
      .eq('episode_id', epId)
      .eq('type', 'gap')
      .order('order_num')
    const existingGaps: { id: number; order_num: number }[] = gapPanels ?? []

    const posMap = new Map<string, { xPct: number; yPct: number }>()
    let originalBubCount = 0
    for (let gi = 0; gi < existingGaps.length; gi++) {
      const { data: bubs } = await sb.from('kp_bubbles')
        .select('order_num, position')
        .eq('panel_id', existingGaps[gi].id)
        .order('order_num')
      for (const b of bubs ?? []) {
        originalBubCount++
        const pos = b.position as any
        if (pos?.xPct != null && pos?.yPct != null)
          posMap.set(`${gi + 1}:${b.order_num}`, { xPct: pos.xPct, yPct: pos.yPct })
      }
    }

    // 6-b. 기존 bubbles 전량 삭제
    const { error: bubDelAllErr } = await sb.from('kp_bubbles').delete().eq('episode_id', epId)
    if (bubDelAllErr) { console.error('kp_bubbles 전량 삭제 오류:', bubDelAllErr.message); process.exit(1) }

    // 6-c. 초과 gap panels 삭제 (DB 컷 수 > 대본 컷 수)
    let panelsDeleted = 0
    for (const panel of existingGaps.slice(ep.cuts.length)) {
      const { error: pErr } = await sb.from('kp_panels').delete().eq('id', panel.id)
      if (pErr) { console.error(`  초과 panel 삭제 오류 id=${panel.id}:`, pErr.message); process.exit(1) }
      panelsDeleted++
    }

    // 6-d. 신규 gap panels 생성 (대본 컷 수 > DB 컷 수)
    const activePanels = existingGaps.slice(0, ep.cuts.length)
    for (let i = activePanels.length; i < ep.cuts.length; i++) {
      const nextOrder = activePanels.length > 0
        ? activePanels[activePanels.length - 1].order_num + 2 : 1
      const { data: newPanel, error: pErr } = await sb.from('kp_panels')
        .insert({ episode_id: epId, order_num: nextOrder, type: 'gap', height_ratio: 160/430 })
        .select('id, order_num').single()
      if (pErr || !newPanel) { console.error('kp_panels 생성 오류:', pErr?.message); process.exit(1) }
      activePanels.push(newPanel)
    }

    // 6-e. bubbles 재생성 (좌표는 posMap에서 복원, 없으면 기본값)
    let bubRestored = 0, bubNew = 0
    for (let i = 0; i < ep.cuts.length; i++) {
      const cut     = ep.cuts[i]
      const panelId = activePanels[i].id
      for (let j = 0; j < cut.dialogues.length; j++) {
        const dlg     = cut.dialogues[j]
        const seq     = j + 1
        const firstHl = dlg.highlights[0] ?? null
        const exprId  = firstHl ? (exprMap.get(firstHl.expressionText) ?? null) : null
        const hlText  = firstHl?.matchedText ?? null
        const savedPos = posMap.get(`${cut.cutNum}:${seq}`)
        const position = savedPos
          ? { ...(defaultPosition(seq, dlg.type) as object), xPct: savedPos.xPct, yPct: savedPos.yPct }
          : defaultPosition(seq, dlg.type)
        const { error } = await sb.from('kp_bubbles').insert({
          panel_id:       panelId,
          episode_id:     epId,
          order_num:      seq,
          speaker:        mapSpeaker(dlg.speaker),
          korean:         dlg.korean,
          translations:   { en: dlg.english },
          highlight_text: hlText,
          expression_id:  exprId,
          position,
          tail:           null,
          audio_url:      null,
        })
        if (error) { console.error(`  bubble 생성 오류 (컷${cut.cutNum} seq${seq}):`, error.message); process.exit(1) }
        if (savedPos) bubRestored++; else bubNew++
      }
    }
    const bubRemoved = Math.max(0, originalBubCount - bubRestored)

    // ─ 7. kp_dialogue_expressions 삽입 (안전장치 4: 에피소드 내 첫 등장만) ─
    const usedExprIds = new Set<number>()
    const deRows: object[] = []

    for (const cut of ep.cuts) {
      const sceneId = sceneIdMap.get(cut.cutNum)!
      for (const dlg of cut.dialogues) {
        const dlgId = dlgIdMap.get(`${sceneId}:${dlg.seqInCut}`)!
        for (const hl of dlg.highlights) {
          const exprId = exprMap.get(hl.expressionText)!
          if (usedExprIds.has(exprId)) continue  // 안전장치 4: 첫 등장만 연결
          usedExprIds.add(exprId)
          deRows.push({ dialogue_id: dlgId, expression_id: exprId, matched_text: hl.matchedText, role: 'focus' })
        }
      }
    }

    if (deRows.length > 0) {
      const { error: deErr } = await sb.from('kp_dialogue_expressions').insert(deRows)
      if (deErr) { console.error('kp_dialogue_expressions 삽입 오류:', deErr.message); process.exit(1) }
    }

    const totalDlgs = ep.cuts.reduce((s, c) => s + c.dialogues.length, 0)
    const totalHls  = ep.cuts.reduce((s, c) => s + c.dialogues.reduce((ss, d) => ss + d.highlights.length, 0), 0)
    console.log(
      `  ✓ scenes=${ep.cuts.length}  dialogues=${totalDlgs}  highlights=${totalHls}  linked=${deRows.length}` +
      `\n  bubbles: 재생성=${bubRestored + bubNew} (좌표 복원=${bubRestored} / 신규=${bubNew} / 제거=${bubRemoved})` +
      (panelsDeleted > 0 ? `  초과 컷 삭제=${panelsDeleted}` : '')
    )
  }

  console.log('\n══════ 동기화 완료 ══════')
}

main().catch(e => { console.error(e); process.exit(1) })
