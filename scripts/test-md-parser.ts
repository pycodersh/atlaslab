/**
 * MD 파서 검증 (DB 수정 없음)
 */
import * as fs from 'fs'

const MD_PATH = 'C:/Users/msj15/Downloads/kpatto_scripts_confirmed.md'

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
  '안내 데스크': 'receptionist', '접수원': 'receptionist', '안내원': 'receptionist',
}

function speakerToId(ko: string): string {
  const key = ko.trim()
  return SPEAKER_MAP[key] ?? key.toLowerCase().replace(/\s+/g, '_')
}

function parseScript(mdPath: string) {
  const raw = fs.readFileSync(mdPath, 'utf-8')
  const lines = raw.split(/\r?\n/)
  const episodes: any[] = []
  let curEp: any = null
  let curScene: any = null
  const dialogueRe = /^([가-힣\w·\s]+?):\s+(.+)$/
  const unknownSpeakers = new Set<string>()

  for (const line of lines) {
    const epM = line.match(/^##\s+EP(\d+)/)
    if (epM) {
      if (curEp) episodes.push(curEp)
      curEp = { ep_num: parseInt(epM[1], 10), scenes: [] }
      curScene = null; continue
    }
    if (!curEp) continue
    const scM = line.match(/^\*\*\[컷(\d+)[^\]]*?(?:[—-]\s*(.+?))?\]\*\*/)
    if (scM) {
      curScene = { scene_number: parseInt(scM[1], 10), location_note: (scM[2] ?? '').trim(), dialogues: [] }
      curEp.scenes.push(curScene); continue
    }
    if (!curScene) continue
    if (line.startsWith('**') || line.startsWith('>') || line.startsWith('#') || line.startsWith('-') || line.trim() === '') continue
    const dm = line.match(dialogueRe)
    if (dm) {
      const speakerKo = dm[1].trim()
      const speakerId = speakerToId(speakerKo)
      if (speakerId === speakerKo.toLowerCase().replace(/\s+/g, '_') && !SPEAKER_MAP[speakerKo]) {
        unknownSpeakers.add(speakerKo)
      }
      curScene.dialogues.push({ speaker: speakerId, text_ko: dm[2].trim(), order_num: curScene.dialogues.length + 1 })
    }
  }
  if (curEp) episodes.push(curEp)
  return { episodes, unknownSpeakers }
}

const { episodes, unknownSpeakers } = parseScript(MD_PATH)

const totalScenes = episodes.reduce((s: number, e: any) => s + e.scenes.length, 0)
const totalDials = episodes.reduce((s: number, e: any) => s + e.scenes.reduce((ss: number, sc: any) => ss + sc.dialogues.length, 0), 0)

console.log(`EP 수: ${episodes.length}`)
console.log(`씬 수: ${totalScenes}`)
console.log(`대사 수: ${totalDials}`)
console.log(`미매핑 스피커: ${[...unknownSpeakers].join(', ') || '없음'}`)

// 씬 수 분포
const sceneCounts = episodes.map((e: any) => e.scenes.length)
const unique = [...new Set(sceneCounts)].sort()
console.log(`씬 수 분포: ${unique.map(n => `${n}컷×${sceneCounts.filter((x: number) => x===n).length}EP`).join(', ')}`)

// 대사 수 분포
const dialCounts = episodes.map((e: any) => e.scenes.reduce((s: number, sc: any) => s + sc.dialogues.length, 0))
const dialUnique = [...new Set(dialCounts)].sort((a: number, b: number) => a - b)
console.log(`EP당 대사 수 범위: ${Math.min(...dialCounts)}~${Math.max(...dialCounts)}`)

// 특정 EP 확인: EP01, EP54, EP57, EP99, EP100
for (const epNum of [1, 54, 57, 99, 100]) {
  const ep = episodes.find((e: any) => e.ep_num === epNum)
  if (!ep) { console.log(`EP${epNum}: 없음`); continue }
  const dCount = ep.scenes.reduce((s: number, sc: any) => s + sc.dialogues.length, 0)
  console.log(`\nEP${String(epNum).padStart(2,'0')} (${ep.scenes.length}씬, ${dCount}대사):`)
  for (const sc of ep.scenes) {
    console.log(`  컷${sc.scene_number} [${sc.location_note}]: ${sc.dialogues.length}개`)
    for (const dl of sc.dialogues) {
      console.log(`    ${dl.order_num}. [${dl.speaker}] ${dl.text_ko}`)
    }
  }
}
