/**
 * kp_scenes + kp_dialogues 전체 재구축
 * 기준: kpatto_scripts_confirmed.md
 * 보존: kp_episodes / kp_panels / kp_bubbles(위치·스타일) / 사용자 데이터
 * 재구축: kp_scenes / kp_dialogues / kp_bubbles.dialogue_id / kp_dialogue_expressions
 *
 * 실행: npx tsx scripts/rebuild-scenes-dialogues.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const MD_PATH = 'C:/Users/msj15/Downloads/kpatto_scripts_confirmed.md'
const BACKUP_DIR = 'C:/Users/msj15/Downloads/kpatto_rebuild_backup'

// ── 스피커 매핑 ────────────────────────────────────────────────────────────
const SPEAKER_MAP: Record<string, string> = {
  '에마': 'emma', '지수': 'jisu', '민준': 'minjun', '소피': 'sophie',
  '상인': 'merchant', '사장님': 'merchant', '점원': 'staff', '직원': 'staff',
  '알바생': 'staff', '카페 직원': 'staff',
  '의사': 'doctor', '의사 선생님': 'doctor',
  '약사': 'pharmacist',
  '교수': 'professor', '교수님': 'professor',
  '운전기사': 'driver', '택시 기사': 'driver', '기사님': 'driver',
  '아저씨': 'stranger', '낯선 사람': 'stranger', '지나가는 사람': 'stranger', '행인': 'stranger',
  '학생들': 'students', '학생': 'students',
  '모두': 'all', '일동': 'all',
  '안내 데스크': 'receptionist', '접수원': 'receptionist', '안내원': 'receptionist', '접수': 'receptionist',
  '기사': 'driver',
}

function speakerToId(ko: string): string {
  const key = ko.trim()
  return SPEAKER_MAP[key] ?? key.toLowerCase().replace(/\s+/g, '_')
}

// ── MD 파싱 ───────────────────────────────────────────────────────────────
interface DialogueRow { speaker: string; text_ko: string; order_num: number }
interface SceneData { scene_number: number; location_note: string; dialogues: DialogueRow[] }
interface EpisodeData { ep_num: number; scenes: SceneData[] }

function parseScript(mdPath: string): EpisodeData[] {
  const raw = fs.readFileSync(mdPath, 'utf-8')
  const lines = raw.split(/\r?\n/)
  const episodes: EpisodeData[] = []

  let curEp: EpisodeData | null = null
  let curScene: SceneData | null = null

  const dialogueRe = /^([가-힣\w·\s]+?):\s+(.+)$/

  for (const line of lines) {
    // 에피소드 헤더
    const epM = line.match(/^##\s+EP(\d+)/)
    if (epM) {
      if (curEp) episodes.push(curEp)
      curEp = { ep_num: parseInt(epM[1], 10), scenes: [] }
      curScene = null
      continue
    }
    if (!curEp) continue

    // 컷(씬) 헤더: **[컷N — LOCATION]**
    const scM = line.match(/^\*\*\[컷(\d+)[^\]]*?(?:—\s*(.+?))?\]\*\*/)
    if (scM) {
      curScene = {
        scene_number: parseInt(scM[1], 10),
        location_note: (scM[2] ?? '').trim(),
        dialogues: [],
      }
      curEp.scenes.push(curScene)
      continue
    }

    if (!curScene) continue
    // 메타 라인 제외
    if (line.startsWith('**') || line.startsWith('>') || line.startsWith('#') ||
        line.startsWith('-') || line.trim() === '') continue

    const dm = line.match(dialogueRe)
    if (dm) {
      const speakerKo = dm[1].trim()
      curScene.dialogues.push({
        speaker: speakerToId(speakerKo),
        text_ko: dm[2].trim(),
        order_num: curScene.dialogues.length + 1,
      })
    }
  }
  if (curEp) episodes.push(curEp)
  return episodes
}

// ── 유틸 ─────────────────────────────────────────────────────────────────
async function batchInsert<T>(table: string, rows: T[], size = 100): Promise<T[]> {
  const result: T[] = []
  for (let i = 0; i < rows.length; i += size) {
    const batch = rows.slice(i, i + size)
    const { data, error } = await sb.from(table).insert(batch).select()
    if (error) throw new Error(`INSERT ${table} failed: ${error.message}`)
    result.push(...(data as T[]))
  }
  return result
}

async function batchUpdate(table: string, updates: Array<{ id: number; [k: string]: unknown }>, size = 100) {
  for (let i = 0; i < updates.length; i += size) {
    const batch = updates.slice(i, i + size)
    for (const { id, ...rest } of batch) {
      const { error } = await sb.from(table).update(rest).eq('id', id)
      if (error) throw new Error(`UPDATE ${table} id=${id} failed: ${error.message}`)
    }
  }
}

// ── 메인 ─────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })

  // ══════════════════════════════════════════════════════════════
  // PHASE 1: MD 파싱
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 1] MD 파싱...')
  const episodes = parseScript(MD_PATH)
  const totalScriptDialogues = episodes.reduce((s, e) => s + e.scenes.reduce((ss, sc) => ss + sc.dialogues.length, 0), 0)
  const totalScriptScenes = episodes.reduce((s, e) => s + e.scenes.length, 0)
  console.log(`  EP 수: ${episodes.length}, 씬 수: ${totalScriptScenes}, 대사 수: ${totalScriptDialogues}`)

  // ══════════════════════════════════════════════════════════════
  // PHASE 2: 에피소드 ID 맵
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 2] kp_episodes ID 로드...')
  const { data: epRows } = await sb.from('kp_episodes').select('id, episode_num').gte('episode_num', 1).lte('episode_num', 100)
  const epNumToId = new Map((epRows ?? []).map((e: any) => [e.episode_num as number, e.id as number]))
  console.log(`  EP ID 매핑: ${epNumToId.size}개`)

  // ══════════════════════════════════════════════════════════════
  // PHASE 3: 백업
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 3] 백업...')
  const { data: oldScenes } = await sb.from('kp_scenes').select('*')
  const { data: oldDialogues } = await sb.from('kp_dialogues').select('*').in('episode_id', [...epNumToId.values()])
  const { data: oldDex } = await sb.from('kp_dialogue_expressions').select('*')
  fs.writeFileSync(`${BACKUP_DIR}/kp_scenes_backup.json`, JSON.stringify(oldScenes, null, 2))
  fs.writeFileSync(`${BACKUP_DIR}/kp_dialogues_backup.json`, JSON.stringify(oldDialogues, null, 2))
  fs.writeFileSync(`${BACKUP_DIR}/kp_dialogue_expressions_backup.json`, JSON.stringify(oldDex, null, 2))
  console.log(`  kp_scenes: ${oldScenes?.length}건`)
  console.log(`  kp_dialogues: ${oldDialogues?.length}건`)
  console.log(`  kp_dialogue_expressions: ${oldDex?.length}건`)

  // ══════════════════════════════════════════════════════════════
  // PHASE 4: 버블·표현식 위치 맵 저장 (재연결용)
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 4] 위치 매핑 저장 (버블·표현식)...')

  // 기존 씬 맵: scene_id → { episode_num, scene_number }
  const oldSceneMap = new Map<number, { ep_num: number; scene_number: number }>()
  for (const sc of (oldScenes ?? []) as any[]) {
    const ep_num = [...epNumToId.entries()].find(([, id]) => id === sc.episode_id)?.[0]
    if (ep_num) oldSceneMap.set(sc.id, { ep_num, scene_number: sc.scene_number })
  }

  // 기존 대사 맵: dialogue_id → { ep_num, scene_number, order_num }
  const oldDialMap = new Map<number, { ep_num: number; scene_number: number; order_num: number }>()
  for (const dl of (oldDialogues ?? []) as any[]) {
    const sc = oldSceneMap.get(dl.scene_id)
    if (sc) oldDialMap.set(dl.id, { ep_num: sc.ep_num, scene_number: sc.scene_number, order_num: dl.order_num })
  }

  // 버블 위치 맵
  const { data: allBubbles } = await sb.from('kp_bubbles').select('id, dialogue_id').not('dialogue_id', 'is', null)
  interface BubblePos { bubble_id: number; ep_num: number; scene_number: number; order_num: number }
  const bubblePosList: BubblePos[] = []
  let bubbleNoPos = 0
  for (const b of (allBubbles ?? []) as any[]) {
    const pos = oldDialMap.get(b.dialogue_id)
    if (pos) bubblePosList.push({ bubble_id: b.id, ...pos })
    else bubbleNoPos++
  }
  fs.writeFileSync(`${BACKUP_DIR}/bubble_positions.json`, JSON.stringify(bubblePosList, null, 2))
  console.log(`  버블 위치 매핑: ${bubblePosList.length}건 (미매핑: ${bubbleNoPos})`)

  // 표현식 위치 맵
  interface DexPos { expression_id: number; role: string; matched_text: string; ep_num: number; scene_number: number; order_num: number }
  const dexPosList: DexPos[] = []
  let dexNoPos = 0
  for (const d of (oldDex ?? []) as any[]) {
    const pos = oldDialMap.get(d.dialogue_id)
    if (pos) dexPosList.push({ expression_id: d.expression_id, role: d.role, matched_text: d.matched_text, ...pos })
    else dexNoPos++
  }
  fs.writeFileSync(`${BACKUP_DIR}/expression_positions.json`, JSON.stringify(dexPosList, null, 2))
  console.log(`  표현식 위치 매핑: ${dexPosList.length}건 (미매핑: ${dexNoPos})`)

  // ══════════════════════════════════════════════════════════════
  // PHASE 5: 버블 dialogue_id NULL 처리
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 5] kp_bubbles.dialogue_id NULL 처리...')
  const { error: bbErr } = await sb.from('kp_bubbles').update({ dialogue_id: null }).not('dialogue_id', 'is', null)
  if (bbErr) throw new Error(`버블 NULL 처리 실패: ${bbErr.message}`)
  console.log('  완료')

  // ══════════════════════════════════════════════════════════════
  // PHASE 6: kp_dialogue_expressions 삭제
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 6] kp_dialogue_expressions 삭제...')
  const { error: dexDelErr } = await sb.from('kp_dialogue_expressions').delete().gte('id', 0)
  if (dexDelErr) throw new Error(`표현식 삭제 실패: ${dexDelErr.message}`)
  console.log('  완료')

  // ══════════════════════════════════════════════════════════════
  // PHASE 7: kp_dialogues 삭제
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 7] kp_dialogues 삭제...')
  const epIds = [...epNumToId.values()]
  for (let i = 0; i < epIds.length; i += 20) {
    const batch = epIds.slice(i, i + 20)
    const { error } = await sb.from('kp_dialogues').delete().in('episode_id', batch)
    if (error) throw new Error(`대사 삭제 실패: ${error.message}`)
  }
  console.log('  완료')

  // ══════════════════════════════════════════════════════════════
  // PHASE 8: kp_scenes 삭제
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 8] kp_scenes 삭제...')
  for (let i = 0; i < epIds.length; i += 20) {
    const batch = epIds.slice(i, i + 20)
    const { error } = await sb.from('kp_scenes').delete().in('episode_id', batch)
    if (error) throw new Error(`씬 삭제 실패: ${error.message}`)
  }
  console.log('  완료')

  // ══════════════════════════════════════════════════════════════
  // PHASE 9: 새 kp_scenes INSERT
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 9] 새 kp_scenes INSERT...')
  const sceneInserts: Array<{ episode_id: number; scene_number: number; location_note: string }> = []
  for (const ep of episodes) {
    const ep_id = epNumToId.get(ep.ep_num)
    if (!ep_id) { console.warn(`  EP${ep.ep_num}: episode_id 없음`); continue }
    for (const sc of ep.scenes) {
      sceneInserts.push({ episode_id: ep_id, scene_number: sc.scene_number, location_note: sc.location_note })
    }
  }
  const newScenes = await batchInsert<{ id: number; episode_id: number; scene_number: number }>('kp_scenes', sceneInserts)
  // 새 씬 맵: (episode_id, scene_number) → new_scene_id
  const newSceneMap = new Map<string, number>()
  for (const sc of newScenes) {
    newSceneMap.set(`${sc.episode_id}:${sc.scene_number}`, sc.id)
  }
  console.log(`  INSERT 완료: ${newScenes.length}건`)

  // ══════════════════════════════════════════════════════════════
  // PHASE 10: 새 kp_dialogues INSERT
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 10] 새 kp_dialogues INSERT...')
  const dialogueInserts: Array<{ episode_id: number; scene_id: number; speaker: string; text_ko: string; order_num: number }> = []
  for (const ep of episodes) {
    const ep_id = epNumToId.get(ep.ep_num)
    if (!ep_id) continue
    for (const sc of ep.scenes) {
      const scene_id = newSceneMap.get(`${ep_id}:${sc.scene_number}`)
      if (!scene_id) { console.warn(`  EP${ep.ep_num} 씬${sc.scene_number}: scene_id 없음`); continue }
      for (const dl of sc.dialogues) {
        dialogueInserts.push({ episode_id: ep_id, scene_id, speaker: dl.speaker, text_ko: dl.text_ko, order_num: dl.order_num })
      }
    }
  }
  const newDialogues = await batchInsert<{ id: number; episode_id: number; scene_id: number; order_num: number }>('kp_dialogues', dialogueInserts)
  // 새 대사 맵: (episode_id, scene_id, order_num) → new_dialogue_id
  const newDialMap = new Map<string, number>()
  for (const dl of newDialogues) {
    newDialMap.set(`${dl.episode_id}:${dl.scene_id}:${dl.order_num}`, dl.id)
  }
  console.log(`  INSERT 완료: ${newDialogues.length}건`)

  // 역방향 맵: (ep_num, scene_number, order_num) → new_dialogue_id
  const posToNewDial = new Map<string, number>()
  for (const ep of episodes) {
    const ep_id = epNumToId.get(ep.ep_num)
    if (!ep_id) continue
    for (const sc of ep.scenes) {
      const scene_id = newSceneMap.get(`${ep_id}:${sc.scene_number}`)
      if (!scene_id) continue
      for (const dl of sc.dialogues) {
        const dl_id = newDialMap.get(`${ep_id}:${scene_id}:${dl.order_num}`)
        if (dl_id) posToNewDial.set(`${ep.ep_num}:${sc.scene_number}:${dl.order_num}`, dl_id)
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // PHASE 11: 버블 재연결
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 11] 버블 재연결...')
  let bbOk = 0, bbFail = 0
  const bbUpdates: Array<{ id: number; dialogue_id: number }> = []
  for (const pos of bubblePosList) {
    const key = `${pos.ep_num}:${pos.scene_number}:${pos.order_num}`
    const new_did = posToNewDial.get(key)
    if (new_did) {
      bbUpdates.push({ id: pos.bubble_id, dialogue_id: new_did })
      bbOk++
    } else {
      console.warn(`  버블 미연결: bubble_id=${pos.bubble_id} EP${pos.ep_num} 씬${pos.scene_number} order${pos.order_num}`)
      bbFail++
    }
  }
  // 배치 UPDATE
  for (let i = 0; i < bbUpdates.length; i += 50) {
    const batch = bbUpdates.slice(i, i + 50)
    for (const { id, dialogue_id } of batch) {
      const { error } = await sb.from('kp_bubbles').update({ dialogue_id }).eq('id', id)
      if (error) { console.warn(`  버블 업데이트 실패 id=${id}: ${error.message}`); bbFail++; bbOk-- }
    }
  }
  console.log(`  성공: ${bbOk} / 실패: ${bbFail}`)

  // ══════════════════════════════════════════════════════════════
  // PHASE 12: kp_dialogue_expressions 재연결
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 12] kp_dialogue_expressions 재연결...')
  let dexOk = 0, dexFail = 0
  const dexInserts: Array<{ dialogue_id: number; expression_id: number; role: string; matched_text: string }> = []

  // 중복 방지를 위해 (dialogue_id, expression_id, role) 집합
  const seen = new Set<string>()
  for (const pos of dexPosList) {
    const key = `${pos.ep_num}:${pos.scene_number}:${pos.order_num}`
    const new_did = posToNewDial.get(key)
    if (!new_did) {
      console.warn(`  표현식 미연결: expr=${pos.expression_id} EP${pos.ep_num} 씬${pos.scene_number} order${pos.order_num}`)
      dexFail++
      continue
    }
    const dedup = `${new_did}:${pos.expression_id}:${pos.role}`
    if (seen.has(dedup)) continue
    seen.add(dedup)
    // matched_text는 새 대사 텍스트로 업데이트 (나중에 텍스트 참조가 필요할 경우를 위해)
    dexInserts.push({ dialogue_id: new_did, expression_id: pos.expression_id, role: pos.role, matched_text: pos.matched_text })
    dexOk++
  }
  await batchInsert('kp_dialogue_expressions', dexInserts)
  console.log(`  성공: ${dexOk} / 실패: ${dexFail}`)

  // ══════════════════════════════════════════════════════════════
  // PHASE 13: 검증
  // ══════════════════════════════════════════════════════════════
  console.log('\n[Phase 13] 검증...')
  const { count: finalSceneCnt } = await sb.from('kp_scenes').select('*', { count: 'exact', head: true })
  const { count: finalDialCnt } = await sb.from('kp_dialogues').select('*', { count: 'exact', head: true })
  const { count: finalDexCnt } = await sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true })
  const { count: bbLinkedCnt } = await sb.from('kp_bubbles').select('*', { count: 'exact', head: true }).not('dialogue_id', 'is', null)

  console.log('\n══════════════════════════════════════════')
  console.log('  재구축 완료 보고')
  console.log('══════════════════════════════════════════')
  console.log(`스크립트 대사 수    : ${totalScriptDialogues}`)
  console.log(`DB 대사 수         : ${finalDialCnt}`)
  console.log(`불일치             : ${totalScriptDialogues !== finalDialCnt ? '⚠ ' + (finalDialCnt! - totalScriptDialogues) : '0 ✅'}`)
  console.log(`스크립트 씬 수     : ${totalScriptScenes}`)
  console.log(`DB 씬 수           : ${finalSceneCnt}`)
  console.log(`버블 재연결 성공   : ${bbOk}`)
  console.log(`버블 재연결 실패   : ${bbFail}`)
  console.log(`버블 dialogue_id 있음: ${bbLinkedCnt}`)
  console.log(`Focus/Exposure 재연결: ${dexOk}`)
  console.log(`Focus/Exposure 실패  : ${dexFail}`)
  console.log(`kp_dialogue_expressions: ${finalDexCnt}`)
  console.log('══════════════════════════════════════════')
  console.log(`백업 경로: ${BACKUP_DIR}`)
}

main().catch(console.error)
