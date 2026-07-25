import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

// Korean speaker name → English identifier
const SPEAKER_MAP: Record<string, string> = {
  '에마': 'emma',
  '지수': 'jisu',
  '민준': 'minjun',
  '소피': 'sophie',
  '모두': 'all',
  '학생들': 'students',
  '상인': 'merchant',
  '직원': 'staff',
  '약사': 'pharmacist',
  '행인': 'stranger',
  '교수님': 'professor',
  '기사': 'driver',
  '접수': 'receptionist',
  '의사': 'doctor',
}

function mapSpeaker(name: string): string {
  return SPEAKER_MAP[name.trim()] ?? name.trim()
}

interface ParsedDialogue {
  speaker: string
  text_ko: string
  order_num: number
}

interface ParsedScene {
  scene_number: number
  location_note: string
  dialogues: ParsedDialogue[]
}

interface ParsedEpisode {
  episode_num: number
  scenes: ParsedScene[]
}

function isDialogueLine(line: string): { speaker: string; text: string } | null {
  const t = line.trim()
  if (!t) return null
  // Skip markdown formatting and separators
  if (t.startsWith('*') || t.startsWith('-') || t.startsWith('#') || t.startsWith('>')) return null

  const colonIdx = t.indexOf(':')
  // Speaker names are short (1-6 chars); skip long strings before colon
  if (colonIdx <= 0 || colonIdx > 8) return null

  const speaker = t.slice(0, colonIdx).trim()
  const text = t.slice(colonIdx + 1).trim()

  if (!text || !speaker) return null
  // Skip metadata lines that slipped through
  if (speaker.startsWith('Focus') || speaker.startsWith('Exposure')) return null

  return { speaker, text }
}

function parseMarkdown(content: string): ParsedEpisode[] {
  const result: ParsedEpisode[] = []

  // Split into per-episode sections, keeping the ## EP header with each section
  const sections = content.split(/(?=^## EP\d+)/m)

  for (const section of sections) {
    const epHeaderMatch = section.match(/^## EP(\d+)/)
    if (!epHeaderMatch) continue
    const episodeNum = parseInt(epHeaderMatch[1])

    // Split by scene headers **[컷N — note]**
    // Using capturing groups in split: [prefix, N, note, body, N, note, body, ...]
    const parts = section.split(/\*\*\[컷(\d+)\s*[—-]\s*([^\]]*)\]\*\*/g)

    const scenes: ParsedScene[] = []
    // parts[0] is the episode header, then triplets: (sceneNum, sceneNote, sceneBody)
    for (let i = 1; i < parts.length; i += 3) {
      const sceneNum = parseInt(parts[i])
      const sceneNote = parts[i + 1]?.trim() ?? ''
      const sceneBody = parts[i + 2] ?? ''

      const dialogues: ParsedDialogue[] = []
      let orderNum = 1

      for (const line of sceneBody.split('\n')) {
        const parsed = isDialogueLine(line)
        if (parsed) {
          dialogues.push({
            speaker: mapSpeaker(parsed.speaker),
            text_ko: parsed.text,
            order_num: orderNum++,
          })
        }
      }

      if (dialogues.length > 0) {
        scenes.push({ scene_number: sceneNum, location_note: sceneNote, dialogues })
      }
    }

    if (scenes.length > 0) {
      result.push({ episode_num: episodeNum, scenes })
    }
  }

  return result
}

async function main() {
  const mdPath = process.argv[2] ?? path.join(os.homedir(), 'Downloads', 'kpatto_scripts_confirmed.md')
  console.log(`Reading: ${mdPath}`)

  if (!fs.existsSync(mdPath)) {
    console.error('파일을 찾을 수 없어요. 경로를 확인하세요:', mdPath)
    process.exit(1)
  }

  const content = fs.readFileSync(mdPath, 'utf-8')
  const episodes = parseMarkdown(content)
  console.log(`Parsed ${episodes.length} episodes\n`)

  // Fetch all episode IDs at once
  const { data: epRows, error: epErr } = await supabase
    .from('kp_episodes')
    .select('id, episode_num')
    .order('episode_num')

  if (epErr || !epRows) {
    console.error('kp_episodes 조회 실패:', epErr?.message)
    process.exit(1)
  }

  const epIdMap = new Map(epRows.map(r => [r.episode_num, r.id]))
  console.log(`DB episodes found: ${epRows.length} (EP${epRows[0]?.episode_num}~EP${epRows.at(-1)?.episode_num})\n`)

  let totalScenes = 0
  let totalDialogues = 0
  let errorCount = 0

  for (const ep of episodes) {
    const episodeId = epIdMap.get(ep.episode_num)
    if (!episodeId) {
      console.warn(`EP${ep.episode_num} not found in DB — skipping`)
      errorCount++
      continue
    }

    // Insert all scenes for this episode at once
    const scenesToInsert = ep.scenes.map(s => ({
      episode_id: episodeId,
      scene_number: s.scene_number,
      location_note: s.location_note,
    }))

    const { data: insertedScenes, error: scenesErr } = await supabase
      .from('kp_scenes')
      .insert(scenesToInsert)
      .select('id, scene_number')

    if (scenesErr || !insertedScenes) {
      console.error(`EP${ep.episode_num} scenes error:`, scenesErr?.message)
      errorCount++
      continue
    }

    // Build scene_id lookup
    const sceneIdMap = new Map(insertedScenes.map(s => [s.scene_number, s.id]))

    // Collect all dialogues for this episode
    const allDialogues = ep.scenes.flatMap(scene => {
      const sceneId = sceneIdMap.get(scene.scene_number)
      if (!sceneId) return []
      return scene.dialogues.map(d => ({
        scene_id: sceneId,
        episode_id: episodeId,
        speaker: d.speaker,
        text_ko: d.text_ko,
        order_num: d.order_num,
      }))
    })

    const { error: dlErr } = await supabase
      .from('kp_dialogues')
      .insert(allDialogues)

    if (dlErr) {
      console.error(`EP${ep.episode_num} dialogues error:`, dlErr.message)
      errorCount++
      continue
    }

    totalScenes += ep.scenes.length
    totalDialogues += allDialogues.length
    console.log(`EP${String(ep.episode_num).padStart(2, '0')} ✓ — ${ep.scenes.length} scenes, ${allDialogues.length} dialogues`)
  }

  console.log('\n=== 완료 ===')
  console.log(`scenes   : ${totalScenes}`)
  console.log(`dialogues: ${totalDialogues}`)
  console.log(`errors   : ${errorCount}`)
}

main().catch(console.error)
