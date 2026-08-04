/**
 * 재구축 최종 검증 (페이지네이션으로 전체 조회)
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

const MD_PATH = 'C:/Users/msj15/Downloads/kpatto_scripts_confirmed.md'
const SPEAKER_MAP: Record<string, string> = {
  '에마': 'emma', '지수': 'jisu', '민준': 'minjun', '소피': 'sophie',
  '상인': 'merchant', '사장님': 'merchant', '점원': 'staff', '직원': 'staff',
  '알바생': 'staff', '의사': 'doctor', '의사 선생님': 'doctor',
  '약사': 'pharmacist', '교수': 'professor', '교수님': 'professor',
  '운전기사': 'driver', '택시 기사': 'driver', '기사님': 'driver', '기사': 'driver',
  '아저씨': 'stranger', '낯선 사람': 'stranger', '지나가는 사람': 'stranger',
  '학생들': 'students', '학생': 'students',
  '모두': 'all', '일동': 'all',
  '안내 데스크': 'receptionist', '접수원': 'receptionist', '접수': 'receptionist',
}
function speakerToId(ko: string) { const k = ko.trim(); return SPEAKER_MAP[k] ?? k.toLowerCase().replace(/\s+/g,'_') }

function parseScript(path: string) {
  const raw = fs.readFileSync(path, 'utf-8')
  const lines = raw.split(/\r?\n/)
  const scriptLines: Array<{ ep: number; scene: number; order: number; text: string }> = []
  let ep = 0, scene = 0, order = 0
  const dlRe = /^([가-힣\w·\s]+?):\s+(.+)$/
  for (const line of lines) {
    const em = line.match(/^##\s+EP(\d+)/); if (em) { ep = +em[1]; scene = 0; order = 0; continue }
    const sm = line.match(/^\*\*\[컷(\d+)/); if (sm) { scene = +sm[1]; order = 0; continue }
    if (!ep || !scene) continue
    if (line.startsWith('**') || line.startsWith('>') || line.startsWith('#') || !line.trim()) continue
    const dm = line.match(dlRe); if (dm) { order++; scriptLines.push({ ep, scene, order, text: dm[2].trim() }) }
  }
  return scriptLines
}

async function getAllDialogues() {
  const rows: any[] = []
  let from = 0
  const PAGE = 500
  while (true) {
    const { data } = await sb.from('kp_dialogues').select('episode_id, text_ko').range(from, from + PAGE - 1).order('id')
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return rows
}

async function main() {
  const { data: epRows } = await sb.from('kp_episodes').select('id, episode_num').gte('episode_num', 1).lte('episode_num', 100)
  const epNumToId = new Map((epRows ?? []).map((e: any) => [e.episode_num as number, e.id as number]))
  const epIdToNum = new Map((epRows ?? []).map((e: any) => [e.id as number, e.episode_num as number]))

  const scriptLines = parseScript(MD_PATH)
  console.log(`스크립트 대사: ${scriptLines.length}건`)

  const allDialogues = await getAllDialogues()
  console.log(`DB 대사: ${allDialogues.length}건`)

  // 에피소드별 비교
  const dbByEp = new Map<number, string[]>()
  for (const d of allDialogues) {
    const ep = epIdToNum.get(d.episode_id)
    if (!ep) continue
    if (!dbByEp.has(ep)) dbByEp.set(ep, [])
    dbByEp.get(ep)!.push(d.text_ko)
  }

  const scriptByEp = new Map<number, string[]>()
  for (const { ep, text } of scriptLines) {
    if (!scriptByEp.has(ep)) scriptByEp.set(ep, [])
    scriptByEp.get(ep)!.push(text)
  }

  let totalMismatch = 0, spacingOnly = 0, contentDiff = 0, notInDB = 0, notInScript = 0
  for (let ep = 1; ep <= 100; ep++) {
    const sTexts = scriptByEp.get(ep) ?? []
    const dTexts = dbByEp.get(ep) ?? []
    if (sTexts.length !== dTexts.length) {
      console.log(`  EP${ep}: 대사 수 불일치 (Script=${sTexts.length}, DB=${dTexts.length})`)
      totalMismatch++
    }
    // 순서대로 비교
    const maxLen = Math.max(sTexts.length, dTexts.length)
    for (let i = 0; i < maxLen; i++) {
      const s = sTexts[i], d = dTexts[i]
      if (s === undefined) { notInScript++; totalMismatch++ }
      else if (d === undefined) { notInDB++; totalMismatch++ }
      else if (s !== d) {
        if (s.replace(/\s+/g,'') === d.replace(/\s+/g,'')) { spacingOnly++ }
        else { contentDiff++; console.log(`  EP${ep}[${i+1}]: Script="${s}" DB="${d}"`) }
        totalMismatch++
      }
    }
  }

  // 전체 집계
  const { count: sceneCnt } = await sb.from('kp_scenes').select('*', { count: 'exact', head: true })
  const { count: dexCnt } = await sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true })
  const { count: bbLinked } = await sb.from('kp_bubbles').select('*', { count: 'exact', head: true }).not('dialogue_id', 'is', null)

  console.log('\n══════════════════════════════════════════')
  console.log('  재구축 최종 검증')
  console.log('══════════════════════════════════════════')
  console.log(`스크립트 대사 수       : ${scriptLines.length}`)
  console.log(`DB 대사 수             : ${allDialogues.length}`)
  console.log(`불일치 (총)            : ${totalMismatch}`)
  console.log(`  공백 차이만          : ${spacingOnly}`)
  console.log(`  내용 차이            : ${contentDiff}`)
  console.log(`  스크립트에만         : ${notInDB}`)
  console.log(`  DB에만               : ${notInScript}`)
  console.log(`DB 씬 수               : ${sceneCnt}`)
  console.log(`kp_dialogue_expressions: ${dexCnt}`)
  console.log(`버블 dialogue_id 연결  : ${bbLinked}`)
}

main().catch(console.error)
