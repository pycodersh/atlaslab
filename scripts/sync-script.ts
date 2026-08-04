/**
 * sync-script.ts — 대본 MD → kp_dialogues / kp_bubbles 동기화
 *
 * 사용법:
 *   npx tsx scripts/sync-script.ts --ep 31
 *   npx tsx scripts/sync-script.ts --ep 31-40
 *   npx tsx scripts/sync-script.ts --dry-run --ep 31
 *
 * 동작:
 *   - kp_dialogues: text_ko 교체 / 행 추가(speaker·order 유지) / 행 삭제
 *   - kp_bubbles  : korean 텍스트만 교체, position·tail은 절대 건드리지 않음
 *                   추가 → 기본 위치로 새 bubble 생성
 *                   삭제 → 해당 bubble 제거
 *   - kp_dialogue_expressions: 텍스트가 바뀐 대사만 기존 매칭 삭제
 *                               (재매칭은 별도 스크립트로)
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const SCRIPT_MD = path.resolve(process.cwd(), 'data/kpatto/source/kpatto_scripts_final.md')

const SPEAKER_MAP: Record<string, string> = {
  '에마': 'emma', '지수': 'jisu', '민준': 'minjun', '소피': 'sophie',
  '모두': 'all', '학생들': 'students', '상인': 'merchant', '직원': 'staff',
  '약사': 'pharmacist', '행인': 'stranger', '교수님': 'professor',
  '기사': 'driver', '접수': 'receptionist', '의사': 'doctor',
}

const DEFAULT_BUBBLE_POSITION = {
  xPct: 10, yPct: 10, widthPct: 68, bubbleKey: 'bubble-oval', lines: 1,
}

// ── 파서 ─────────────────────────────────────────────────────────────────────

interface ParsedDialogue { speaker: string; text_ko: string; order_num: number }
interface ParsedScene    { scene_number: number; location_note: string; dialogues: ParsedDialogue[] }
interface ParsedEpisode  { episode_num: number; scenes: ParsedScene[] }

function isDialogueLine(line: string): { speaker: string; text: string } | null {
  const t = line.trim()
  if (!t || t.startsWith('*') || t.startsWith('-') || t.startsWith('#') || t.startsWith('>') || t.startsWith('\\')) return null
  const colonIdx = t.indexOf(':')
  if (colonIdx <= 0 || colonIdx > 8) return null
  const speaker = t.slice(0, colonIdx).trim()
  const text    = t.slice(colonIdx + 1).trim()
  if (!text || !speaker) return null
  if (speaker.startsWith('Focus') || speaker.startsWith('Exposure')) return null
  return { speaker, text }
}

function parseMarkdown(content: string, epNums: number[]): ParsedEpisode[] {
  const result: ParsedEpisode[] = []
  const sections = content.split(/(?=^## EP\d+)/m)

  for (const section of sections) {
    const m = section.match(/^## EP(\d+)/)
    if (!m) continue
    const episodeNum = parseInt(m[1])
    if (epNums.length && !epNums.includes(episodeNum)) continue

    const parts = section.split(/\*\*\[컷(\d+)\s*[—-]\s*([^\]]*)\]\*\*/g)
    const scenes: ParsedScene[] = []

    for (let i = 1; i < parts.length; i += 3) {
      const sceneNum  = parseInt(parts[i])
      const sceneNote = parts[i + 1]?.trim() ?? ''
      const sceneBody = parts[i + 2] ?? ''
      const dialogues: ParsedDialogue[] = []
      let order = 1

      for (const line of sceneBody.split('\n')) {
        const parsed = isDialogueLine(line)
        if (!parsed) continue
        dialogues.push({
          speaker:  SPEAKER_MAP[parsed.speaker] ?? parsed.speaker,
          text_ko:  parsed.text,
          order_num: order++,
        })
      }
      if (dialogues.length) scenes.push({ scene_number: sceneNum, location_note: sceneNote, dialogues })
    }
    if (scenes.length) result.push({ episode_num: episodeNum, scenes })
  }
  return result
}

// ── CLI 파싱 ─────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  const dryRun  = args.includes('--dry-run')
  const epIndex = args.indexOf('--ep')
  let epNums: number[] = []

  if (epIndex >= 0 && args[epIndex + 1]) {
    const raw = args[epIndex + 1]
    if (raw.includes('-')) {
      const [lo, hi] = raw.split('-').map(Number)
      for (let i = lo; i <= hi; i++) epNums.push(i)
    } else {
      epNums = [parseInt(raw)]
    }
  }

  if (!epNums.length) {
    console.error('--ep 옵션이 필요합니다. 예: --ep 31 | --ep 31-40')
    process.exit(1)
  }

  return { dryRun, epNums }
}

// ── DB 조회 ──────────────────────────────────────────────────────────────────

interface DbDialogue {
  id: number; scene_id: number; scene_number: number
  speaker: string; text_ko: string; order_num: number
}
interface DbBubble {
  id: number; dialogue_id: number | null; korean: string
  position: object | null; tail: object | null; panel_id: number | null
}

async function fetchEpId(epNum: number): Promise<number | null> {
  const { data } = await supabase.from('kp_episodes').select('id').eq('episode_num', epNum).single()
  return data?.id ?? null
}

async function fetchDialogues(episodeId: number): Promise<DbDialogue[]> {
  // 1. scene_id → scene_number 맵 구성
  const { data: scenes, error: se } = await supabase
    .from('kp_scenes').select('id, scene_number').eq('episode_id', episodeId)
  if (se) throw new Error(`kp_scenes: ${se.message}`)
  const sceneNumMap = new Map<number, number>((scenes ?? []).map(s => [s.id, s.scene_number]))

  // 2. 대사 조회
  const { data, error } = await supabase
    .from('kp_dialogues')
    .select('id, scene_id, speaker, text_ko, order_num')
    .eq('episode_id', episodeId)
    .order('scene_id').order('order_num')
  if (error) throw new Error(`kp_dialogues: ${error.message}`)

  return (data ?? []).map((r: any) => ({
    id: r.id,
    scene_id: r.scene_id,
    scene_number: sceneNumMap.get(r.scene_id) ?? 0,
    speaker: r.speaker,
    text_ko: r.text_ko,
    order_num: r.order_num,
  }))
}

async function fetchBubbles(episodeId: number): Promise<DbBubble[]> {
  const { data, error } = await supabase
    .from('kp_bubbles')
    .select('id, dialogue_id, korean, position, tail, panel_id')
    .eq('episode_id', episodeId)
  if (error) throw new Error(`kp_bubbles: ${error.message}`)
  return (data ?? []) as DbBubble[]
}

async function fetchPanelIdForScene(episodeId: number, sceneNumber: number): Promise<number | null> {
  // scene_number 1 → order_num 1 (컷 순서 = 씬 순서)
  const { data } = await supabase
    .from('kp_panels')
    .select('id')
    .eq('episode_id', episodeId)
    .eq('order_num', sceneNumber)
    .eq('type', 'panel')
    .single()
  return data?.id ?? null
}

// ── diff 계산 ─────────────────────────────────────────────────────────────────

type ChangeType = 'update' | 'add' | 'delete'

interface DialogueDiff {
  type: ChangeType
  scene_number: number
  order_num: number
  speaker: string
  before?: string
  after?: string
  db_id?: number   // for update/delete
}

function computeDiff(
  parsed: ParsedScene[],
  db: DbDialogue[],
): DialogueDiff[] {
  const diffs: DialogueDiff[] = []
  const dbMap = new Map<string, DbDialogue>()
  for (const d of db) dbMap.set(`${d.scene_number}-${d.order_num}`, d)

  const parsedKeys = new Set<string>()

  for (const scene of parsed) {
    for (const d of scene.dialogues) {
      const key = `${scene.scene_number}-${d.order_num}`
      parsedKeys.add(key)
      const existing = dbMap.get(key)

      if (!existing) {
        diffs.push({ type: 'add', scene_number: scene.scene_number, order_num: d.order_num, speaker: d.speaker, after: d.text_ko })
      } else if (existing.text_ko !== d.text_ko) {
        diffs.push({ type: 'update', scene_number: scene.scene_number, order_num: d.order_num, speaker: d.speaker, before: existing.text_ko, after: d.text_ko, db_id: existing.id })
      }
    }
  }

  // 삭제: DB에는 있지만 파싱된 대본에 없는 것
  for (const d of db) {
    const key = `${d.scene_number}-${d.order_num}`
    if (!parsedKeys.has(key)) {
      diffs.push({ type: 'delete', scene_number: d.scene_number, order_num: d.order_num, speaker: d.speaker, before: d.text_ko, db_id: d.id })
    }
  }

  return diffs
}

// ── dry-run 출력 ──────────────────────────────────────────────────────────────

function printDryRun(
  epNum: number,
  diffs: DialogueDiff[],
  bubbles: DbBubble[],
  db: DbDialogue[],
) {
  const bubbleByDialogue = new Map<number, DbBubble[]>()
  for (const b of bubbles) {
    if (b.dialogue_id == null) continue
    if (!bubbleByDialogue.has(b.dialogue_id)) bubbleByDialogue.set(b.dialogue_id, [])
    bubbleByDialogue.get(b.dialogue_id)!.push(b)
  }

  const updates = diffs.filter(d => d.type === 'update')
  const adds    = diffs.filter(d => d.type === 'add')
  const deletes = diffs.filter(d => d.type === 'delete')

  const affectedBubbles = updates.reduce((sum, d) => sum + (d.db_id ? (bubbleByDialogue.get(d.db_id)?.length ?? 0) : 0), 0)
  const removedBubbles  = deletes.reduce((sum, d) => sum + (d.db_id ? (bubbleByDialogue.get(d.db_id)?.length ?? 0) : 0), 0)
  const exprDeletes     = updates.reduce((sum, d) => sum + (d.db_id ? (bubbleByDialogue.get(d.db_id)?.length ?? 0) : 0), 0)

  console.log(`\n▶ EP${String(epNum).padStart(2, '0')} — dry-run 결과`)
  console.log(`  변경: ${updates.length}건  추가: ${adds.length}건  삭제: ${deletes.length}건`)
  console.log(`  말풍선 텍스트 교체: ${affectedBubbles}개  말풍선 제거: ${removedBubbles}개  표현 매칭 초기화: ${exprDeletes}건`)

  if (updates.length) {
    console.log('\n  [변경 대사]')
    for (const d of updates) {
      console.log(`    컷${d.scene_number}-순서${d.order_num} (${d.speaker})`)
      console.log(`      before: ${d.before}`)
      console.log(`      after : ${d.after}`)
    }
  }
  if (adds.length) {
    console.log('\n  [추가 대사]')
    for (const d of adds) {
      console.log(`    컷${d.scene_number}-순서${d.order_num} (${d.speaker}): ${d.after}  ← 말풍선 기본위치로 생성`)
    }
  }
  if (deletes.length) {
    console.log('\n  [삭제 대사]')
    for (const d of deletes) {
      console.log(`    컷${d.scene_number}-순서${d.order_num} (${d.speaker}): ${d.before}  ← 말풍선도 제거`)
    }
  }

  if (!diffs.length) console.log('  → 변경 없음')
}

// ── 실제 적용 ─────────────────────────────────────────────────────────────────

async function applyDiffs(
  epNum: number,
  episodeId: number,
  diffs: DialogueDiff[],
  bubbles: DbBubble[],
  db: DbDialogue[],
  parsedScenes: ParsedScene[],
) {
  const bubbleByDialogue = new Map<number, DbBubble[]>()
  for (const b of bubbles) {
    if (b.dialogue_id == null) continue
    if (!bubbleByDialogue.has(b.dialogue_id)) bubbleByDialogue.set(b.dialogue_id, [])
    bubbleByDialogue.get(b.dialogue_id)!.push(b)
  }

  let updatedDialogues = 0, updatedBubbles = 0, insertedDialogues = 0, deletedDialogues = 0, clearedExprs = 0

  // 1. 업데이트
  for (const diff of diffs.filter(d => d.type === 'update')) {
    const { error } = await supabase.from('kp_dialogues').update({ text_ko: diff.after }).eq('id', diff.db_id!)
    if (error) { console.error(`  ✗ 대사 업데이트 실패 (id=${diff.db_id}):`, error.message); continue }
    updatedDialogues++

    // bubble korean 텍스트만 교체
    for (const b of bubbleByDialogue.get(diff.db_id!) ?? []) {
      const { error: be } = await supabase.from('kp_bubbles').update({ korean: diff.after! }).eq('id', b.id)
      if (!be) updatedBubbles++
    }

    // dialogue_expressions 초기화 (텍스트 바뀐 대사 → 재매칭 필요)
    const { error: ee } = await supabase.from('kp_dialogue_expressions').delete().eq('dialogue_id', diff.db_id!)
    if (!ee) clearedExprs++
  }

  // 2. 추가
  for (const diff of diffs.filter(d => d.type === 'add')) {
    const scene = parsedScenes.find(s => s.scene_number === diff.scene_number)
    if (!scene) continue

    // scene_id 조회
    const { data: sceneRow } = await supabase
      .from('kp_scenes').select('id').eq('episode_id', episodeId).eq('scene_number', diff.scene_number).single()
    if (!sceneRow) { console.warn(`  ⚠ scene not found: EP${epNum} 컷${diff.scene_number}`); continue }

    const { data: newDlg, error: de } = await supabase
      .from('kp_dialogues')
      .insert({ scene_id: sceneRow.id, episode_id: episodeId, speaker: diff.speaker, text_ko: diff.after!, order_num: diff.order_num })
      .select('id').single()
    if (de || !newDlg) { console.error(`  ✗ 대사 추가 실패:`, de?.message); continue }
    insertedDialogues++

    // 기본 위치로 bubble 생성
    const panelId = await fetchPanelIdForScene(episodeId, diff.scene_number)
    const { error: be } = await supabase.from('kp_bubbles').insert({
      episode_id:  episodeId,
      panel_id:    panelId,
      dialogue_id: newDlg.id,
      order_num:   diff.order_num,
      speaker:     diff.speaker,
      korean:      diff.after!,
      position:    DEFAULT_BUBBLE_POSITION,
      tail:        null,
    })
    if (be) console.warn(`  ⚠ bubble 추가 실패 (dlg=${newDlg.id}):`, be.message)
  }

  // 3. 삭제
  for (const diff of diffs.filter(d => d.type === 'delete')) {
    // bubble 먼저 제거
    const { error: be } = await supabase.from('kp_bubbles').delete().eq('dialogue_id', diff.db_id!)
    if (be) console.warn(`  ⚠ bubble 삭제 실패:`, be.message)

    const { error: de } = await supabase.from('kp_dialogues').delete().eq('id', diff.db_id!)
    if (!de) deletedDialogues++
  }

  console.log(`  EP${String(epNum).padStart(2, '0')} 적용 완료`)
  console.log(`    대사 변경: ${updatedDialogues}  추가: ${insertedDialogues}  삭제: ${deletedDialogues}`)
  console.log(`    말풍선 텍스트 교체: ${updatedBubbles}  표현 매칭 초기화: ${clearedExprs}`)
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { dryRun, epNums } = parseArgs()

  console.log(`\n[sync-script] ${dryRun ? '🔍 dry-run' : '✏ 적용'} — EP: ${epNums.join(', ')}`)
  console.log(`대본: ${SCRIPT_MD}\n`)

  if (!fs.existsSync(SCRIPT_MD)) {
    console.error('대본 파일을 찾을 수 없습니다:', SCRIPT_MD)
    process.exit(1)
  }

  const content  = fs.readFileSync(SCRIPT_MD, 'utf-8')
  const episodes = parseMarkdown(content, epNums)

  if (!episodes.length) {
    console.error('지정한 EP를 대본에서 찾을 수 없습니다:', epNums)
    process.exit(1)
  }

  let totalDiffs = 0

  for (const ep of episodes) {
    const episodeId = await fetchEpId(ep.episode_num)
    if (!episodeId) { console.warn(`  EP${ep.episode_num}: DB에 없음 — 건너뜀`); continue }

    const db      = await fetchDialogues(episodeId)
    const bubbles = await fetchBubbles(episodeId)
    const diffs   = computeDiff(ep.scenes, db)
    totalDiffs   += diffs.length

    if (dryRun) {
      printDryRun(ep.episode_num, diffs, bubbles, db)
    } else {
      if (!diffs.length) { console.log(`  EP${ep.episode_num}: 변경 없음`); continue }
      await applyDiffs(ep.episode_num, episodeId, diffs, bubbles, db, ep.scenes)
    }
  }

  if (dryRun) {
    console.log(`\n총 변경 예정: ${totalDiffs}건`)
    console.log('적용하려면 --dry-run 없이 실행하세요.')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
