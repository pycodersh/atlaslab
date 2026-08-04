/**
 * [2] thought 대사 bubbleKey 일괄 업데이트
 *
 * kp_dialogues.type 컬럼이 없으므로 스크립트 파일에서 (생각) 텍스트를 직접 파싱해
 * kp_bubbles.korean과 매칭 후 position.bubbleKey='bubble-thought-down'으로 업데이트.
 *
 * ※ position의 xPct, yPct 등 좌표는 절대 변경하지 않음
 * ※ position=null인 버블은 건드리지 않음
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const SCRIPT_DIR = 'data/kpatto/scripts'
const SCRIPT_FILES = [
  'ep001-010.txt', 'ep011-020.txt', 'ep021-030.txt', 'ep031-040.txt',
  'ep041-050.txt', 'ep051-060.txt', 'ep061-070.txt', 'ep071-080.txt',
  'ep081-090.txt', 'ep091-100.txt',
]

// 스크립트 파일 파싱 → EP별 thought 텍스트 Set
function parseThoughts() {
  const byEp = new Map() // ep_num → Set<string>
  for (const file of SCRIPT_FILES) {
    const text = readFileSync(join(SCRIPT_DIR, file), 'utf8')
    let curEp = null
    for (const line of text.split('\n')) {
      const epM = line.match(/^EP(\d+)\s*[\|｜]/)
      if (epM) {
        curEp = parseInt(epM[1])
        if (!byEp.has(curEp)) byEp.set(curEp, new Set())
        continue
      }
      // 화자(생각): 텍스트
      const thoughtM = line.match(/\(생각\):\s*(.+)$/)
      if (thoughtM && curEp !== null) {
        byEp.get(curEp).add(thoughtM[1].trim())
      }
    }
  }
  return byEp
}

const thoughtsByEp = parseThoughts()

// EP별 thought 개수 출력
let totalThought = 0
for (const [ep, texts] of [...thoughtsByEp.entries()].sort((a,b) => a[0]-b[0])) {
  if (texts.size > 0) { console.log(`EP${String(ep).padStart(2,'0')}: thought ${texts.size}개`); totalThought += texts.size }
}
console.log(`\n스크립트 전체 thought 대사: ${totalThought}개\n`)

// EP ID 맵
const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
const epIdMap = new Map((eps ?? []).map(e => [e.episode_num, e.id]))

// 전체 kp_bubbles 조회 (korean, position)
const { data: allBubbles, error: bErr } = await sb
  .from('kp_bubbles')
  .select('id, episode_id, korean, position')

if (bErr) { console.error('kp_bubbles 조회 오류:', bErr.message); process.exit(1) }

const epNumMap = new Map((eps ?? []).map(e => [e.id, e.episode_num]))

// EP별로 그룹화
const bubByEp = new Map()
for (const b of (allBubbles ?? [])) {
  const epNum = epNumMap.get(b.episode_id)
  if (!epNum) continue
  if (!bubByEp.has(epNum)) bubByEp.set(epNum, [])
  bubByEp.get(epNum).push(b)
}

// 매칭 및 업데이트
const toUpdate = []
const unmatched = []

for (const [epNum, thoughtTexts] of thoughtsByEp) {
  const bubbles = bubByEp.get(epNum) ?? []
  for (const text of thoughtTexts) {
    // 정확 매칭 먼저
    let match = bubbles.find(b => b.korean === text || b.korean?.trim() === text.trim())
    // 없으면 끝 마침표 차이 허용
    if (!match) {
      const stripped = text.replace(/[.。]$/, '')
      match = bubbles.find(b => b.korean?.replace(/[.。]$/, '') === stripped)
    }
    if (match) {
      if (match.position !== null) {
        const currentKey = match.position?.bubbleKey
        if (currentKey !== 'bubble-thought-down' && currentKey !== 'bubble-thought-up') {
          toUpdate.push({ id: match.id, epNum, korean: text, currentKey, position: match.position })
        }
      }
    } else {
      unmatched.push({ ep: epNum, text })
    }
  }
}

console.log(`업데이트 대상: ${toUpdate.length}개`)
if (unmatched.length > 0) {
  console.log(`\n⚠ 매칭 실패 (${unmatched.length}개):`)
  for (const u of unmatched) {
    console.log(`  EP${String(u.ep).padStart(2,'0')}: "${u.text}"`)
  }
}

if (toUpdate.length === 0) {
  console.log('업데이트할 항목 없음')
  process.exit(0)
}

// EP별 집계 출력
const byEpCount = {}
for (const u of toUpdate) byEpCount[u.epNum] = (byEpCount[u.epNum] ?? 0) + 1
console.log('\n적용 예정 EP별:')
for (const [ep, cnt] of Object.entries(byEpCount).sort((a,b)=>Number(a[0])-Number(b[0]))) {
  console.log(`  EP${String(ep).padStart(2,'0')}: ${cnt}건`)
}

// 실제 업데이트
let updated = 0
for (const u of toUpdate) {
  const newPos = { ...u.position, bubbleKey: 'bubble-thought-down' }
  const { error } = await sb.from('kp_bubbles').update({ position: newPos }).eq('id', u.id)
  if (error) console.error(`  id=${u.id} 실패:`, error.message)
  else updated++
}
console.log(`\n✓ 업데이트 완료: ${updated}/${toUpdate.length}건`)
