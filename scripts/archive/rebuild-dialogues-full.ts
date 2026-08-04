/**
 * kp_dialogues + kp_scenes 전체 재생성 + kp_bubbles.dialogue_id 재연결
 *
 * 실행: npx tsx scripts/rebuild-dialogues-full.ts          (DRY RUN)
 * 적용: npx tsx scripts/rebuild-dialogues-full.ts --apply
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)
const APPLY = process.argv.includes('--apply')

// ─── MD 파서 (seed-kpatto-dialogues.ts 기반) ─────────────────────────────────
const SPEAKER_MAP: Record<string, string> = {
  '에마': 'emma', '지수': 'jisu', '민준': 'minjun', '소피': 'sophie',
  '모두': 'all', '학생들': 'students', '상인': 'merchant', '직원': 'staff',
  '약사': 'pharmacist', '행인': 'stranger', '교수님': 'professor',
  '기사': 'driver', '접수': 'receptionist', '의사': 'doctor',
}
function mapSpeaker(n: string) { return SPEAKER_MAP[n.trim()] ?? n.trim() }

function isDialogueLine(line: string) {
  const t = line.trim()
  if (!t || t.startsWith('*') || t.startsWith('-') || t.startsWith('#') || t.startsWith('>')) return null
  const ci = t.indexOf(':')
  if (ci <= 0 || ci > 8) return null
  const sp = t.slice(0, ci).trim()
  const tx = t.slice(ci + 1).trim()
  if (!tx || !sp || sp.startsWith('Focus') || sp.startsWith('Exposure')) return null
  return { speaker: sp, text: tx }
}

interface Dlg { speaker: string; text_ko: string; order_num: number }
interface Scene { scene_number: number; location_note: string; dialogues: Dlg[] }
interface Ep { episode_num: number; scenes: Scene[] }

function parseMarkdown(content: string): Ep[] {
  const result: Ep[] = []
  const sections = content.split(/(?=^## EP\d+)/m)
  for (const section of sections) {
    const m = section.match(/^## EP(\d+)/)
    if (!m) continue
    const parts = section.split(/\*\*\[컷(\d+)\s*[—-]\s*([^\]]*)\]\*\*/g)
    const scenes: Scene[] = []
    for (let i = 1; i < parts.length; i += 3) {
      const sceneNum = parseInt(parts[i])
      const sceneNote = parts[i + 1]?.trim() ?? ''
      const dialogues: Dlg[] = []
      let ord = 1
      for (const line of (parts[i + 2] ?? '').split('\n')) {
        const p = isDialogueLine(line)
        if (p) dialogues.push({ speaker: mapSpeaker(p.speaker), text_ko: p.text, order_num: ord++ })
      }
      if (dialogues.length > 0) scenes.push({ scene_number: sceneNum, location_note: sceneNote, dialogues })
    }
    if (scenes.length > 0) result.push({ episode_num: parseInt(m[1]), scenes })
  }
  return result
}

function norm(s: string) { return s.replace(/\s+/g, ' ').trim() }

// ─── 메인 ────────────────────────────────────────────────────────────────────
async function main() {
  const mdPath = path.join(os.homedir(), 'Downloads', 'kpatto_scripts_confirmed.md')
  console.log(`Reading: ${mdPath}`)
  if (!fs.existsSync(mdPath)) { console.error('파일 없음:', mdPath); process.exit(1) }

  const content = fs.readFileSync(mdPath, 'utf-8')
  const episodes = parseMarkdown(content)
  console.log(`Parsed ${episodes.length} episodes`)

  const { data: epRows } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
  const epIdMap = new Map((epRows ?? []).map(r => [r.episode_num as number, r.id as number]))

  const totalNewScenes = episodes.reduce((n, e) => n + e.scenes.length, 0)
  const totalNewDlgs = episodes.reduce((n, e) => n + e.scenes.reduce((m, s) => m + s.dialogues.length, 0), 0)

  if (!APPLY) {
    console.log('\n=== DRY RUN ===')
    console.log('삭제 예정: kp_dialogue_expressions, kp_dialogues, kp_scenes 전체')
    console.log(`삽입 예정: ${totalNewScenes} scenes, ${totalNewDlgs} dialogues`)
    console.log('\n에피소드별:')
    for (const ep of episodes) {
      const dlgCount = ep.scenes.reduce((n, s) => n + s.dialogues.length, 0)
      console.log(`  EP${String(ep.episode_num).padStart(2, '0')}: ${ep.scenes.length}scenes, ${dlgCount}dlgs`)
    }
    console.log('\n적용: npx tsx scripts/rebuild-dialogues-full.ts --apply')
    return
  }

  // ─── STEP 1: SET kp_bubbles.dialogue_id = null ───────────────────────────────
  console.log('\n──── STEP 1: SET kp_bubbles.dialogue_id = null ────')
  const { error: s1err } = await sb.from('kp_bubbles').update({ dialogue_id: null }).not('id', 'is', null)
  if (s1err) { console.error('ERROR:', s1err.message); process.exit(1) }
  console.log('완료')

  // ─── STEP 2: DELETE kp_dialogue_expressions ──────────────────────────────────
  console.log('\n──── STEP 2: DELETE kp_dialogue_expressions ────')
  const { error: s2err } = await sb.from('kp_dialogue_expressions').delete().not('id', 'is', null)
  if (s2err) console.warn('경고 (무시):', s2err.message)
  else console.log('완료')

  // ─── STEP 3: DELETE kp_dialogues ─────────────────────────────────────────────
  console.log('\n──── STEP 3: DELETE kp_dialogues ────')
  const { error: s3err } = await sb.from('kp_dialogues').delete().gte('id', 1)
  if (s3err) { console.error('ERROR:', s3err.message); process.exit(1) }
  console.log('완료')

  // ─── STEP 4: DELETE kp_scenes ────────────────────────────────────────────────
  console.log('\n──── STEP 4: DELETE kp_scenes ────')
  const { error: s4err } = await sb.from('kp_scenes').delete().gte('id', 1)
  if (s4err) { console.error('ERROR:', s4err.message); process.exit(1) }
  console.log('완료')

  // ─── STEP 5: INSERT kp_scenes + kp_dialogues ─────────────────────────────────
  console.log('\n──── STEP 5: INSERT kp_scenes + kp_dialogues ────')

  // episodeId → new dialogues (sorted by scene_number, order_num)
  const newDlgsByEp = new Map<number, { id: number; speaker: string; text_ko: string; scene_number: number; order_num: number }[]>()

  let totalScenes = 0, totalDialogues = 0
  for (const ep of episodes) {
    const epId = epIdMap.get(ep.episode_num)
    if (!epId) { console.warn(`EP${ep.episode_num} DB에 없음 - 스킵`); continue }

    const { data: insertedScenes, error: scenesErr } = await sb
      .from('kp_scenes')
      .insert(ep.scenes.map(s => ({ episode_id: epId, scene_number: s.scene_number, location_note: s.location_note })))
      .select('id, scene_number')
    if (scenesErr || !insertedScenes) { console.error(`EP${ep.episode_num} scenes error:`, scenesErr?.message); continue }

    const sceneIdMap = new Map(insertedScenes.map(s => [s.scene_number as number, s.id as number]))
    const allDlgInserts = ep.scenes.flatMap(scene => {
      const sceneId = sceneIdMap.get(scene.scene_number)
      if (!sceneId) return []
      return scene.dialogues.map(d => ({
        scene_id: sceneId, episode_id: epId,
        speaker: d.speaker, text_ko: d.text_ko, order_num: d.order_num,
      }))
    })

    const { data: insertedDlgs, error: dlErr } = await sb
      .from('kp_dialogues').insert(allDlgInserts)
      .select('id, speaker, text_ko, order_num, scene_id')
    if (dlErr || !insertedDlgs) { console.error(`EP${ep.episode_num} dialogues error:`, dlErr?.message); continue }

    const sidToSn = new Map(insertedScenes.map(s => [s.id as number, s.scene_number as number]))
    const dlgsForEp = (insertedDlgs as any[]).map(d => ({
      id: d.id as number,
      speaker: d.speaker as string,
      text_ko: d.text_ko as string,
      scene_number: sidToSn.get(d.scene_id) ?? 0,
      order_num: d.order_num as number,
    }))
    newDlgsByEp.set(epId, dlgsForEp)

    totalScenes += ep.scenes.length
    totalDialogues += allDlgInserts.length
    console.log(`  EP${String(ep.episode_num).padStart(2, '0')} ✓ ${ep.scenes.length}scenes ${allDlgInserts.length}dlgs`)
  }
  console.log(`\n완료: ${totalScenes} scenes, ${totalDialogues} dialogues`)

  // ─── STEP 6: kp_bubbles.dialogue_id 재연결 ───────────────────────────────────
  console.log('\n──── STEP 6: kp_bubbles.dialogue_id 재연결 ────')

  const { data: allEps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
  let linkedTotal = 0, nullTotal = 0

  for (const epRow of (allEps ?? []) as any[]) {
    const epId = epRow.id as number
    const epNum = epRow.episode_num as number

    const newDlgs = newDlgsByEp.get(epId)
    if (!newDlgs?.length) {
      console.log(`  EP${String(epNum).padStart(2, '0')}: 스크립트 없음 - 스킵`)
      continue
    }

    const { data: bubbles } = await sb
      .from('kp_bubbles').select('id, panel_id, order_num, speaker, korean')
      .eq('episode_id', epId).order('panel_id').order('order_num')
    if (!bubbles?.length) continue

    const sortedDlgs = [...newDlgs].sort((a, b) =>
      a.scene_number !== b.scene_number ? a.scene_number - b.scene_number : a.order_num - b.order_num
    )

    // ── PHASE 1: 텍스트 매칭 ──────────────────────────────────────────────────
    const usedDlgIds = new Set<number>()
    const linkedBubIds = new Set<number>()
    const updates: { bubId: number; dlgId: number }[] = []

    const dlgByText = new Map<string, { id: number; speaker: string }[]>()
    for (const d of sortedDlgs) {
      const key = norm(d.text_ko)
      if (!dlgByText.has(key)) dlgByText.set(key, [])
      dlgByText.get(key)!.push({ id: d.id, speaker: d.speaker })
    }

    for (const b of bubbles as any[]) {
      const key = norm(b.korean ?? '')
      const candidates = dlgByText.get(key)
      if (candidates) {
        const match = candidates.find(c => c.speaker === b.speaker && !usedDlgIds.has(c.id))
          ?? candidates.find(c => !usedDlgIds.has(c.id))
        if (match) {
          updates.push({ bubId: b.id, dlgId: match.id })
          usedDlgIds.add(match.id)
          linkedBubIds.add(b.id)
        }
      }
    }

    // ── PHASE 2: speaker-positional 폴백 (텍스트 불일치 에피소드용) ──────────
    const unmatchedBubbles = (bubbles as any[]).filter(b => !linkedBubIds.has(b.id))
    const unusedDlgs = sortedDlgs.filter(d => !usedDlgIds.has(d.id))

    const unBubBySpeaker = new Map<string, number[]>()
    for (const b of unmatchedBubbles) {
      if (!unBubBySpeaker.has(b.speaker)) unBubBySpeaker.set(b.speaker, [])
      unBubBySpeaker.get(b.speaker)!.push(b.id)
    }
    const unDlgBySpeaker = new Map<string, number[]>()
    for (const d of unusedDlgs) {
      if (!unDlgBySpeaker.has(d.speaker)) unDlgBySpeaker.set(d.speaker, [])
      unDlgBySpeaker.get(d.speaker)!.push(d.id)
    }
    for (const [spk, bubIds] of unBubBySpeaker) {
      const dlgIds = unDlgBySpeaker.get(spk) ?? []
      for (let i = 0; i < Math.min(bubIds.length, dlgIds.length); i++) {
        updates.push({ bubId: bubIds[i], dlgId: dlgIds[i] })
      }
    }

    // ── DB 적용 ───────────────────────────────────────────────────────────────
    let epLinked = 0, epNull = (bubbles as any[]).length - updates.length
    for (const u of updates) {
      const { error } = await sb.from('kp_bubbles').update({ dialogue_id: u.dlgId }).eq('id', u.bubId)
      if (error) { console.error(`    ❌ bubble=${u.bubId}: ${error.message}`); epNull++ }
      else epLinked++
    }

    linkedTotal += epLinked
    nullTotal += epNull
    console.log(`  EP${String(epNum).padStart(2, '0')}: ${epLinked}개 연결, ${epNull}개 null`)
  }

  console.log(`\n=== 최종 완료: ${linkedTotal}개 연결, ${nullTotal}개 null ===`)
}
main().catch(console.error)
