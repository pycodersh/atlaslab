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

function isDialogueLine(line: string) {
  const t = line.trim()
  if (!t || t.startsWith('*') || t.startsWith('-') || t.startsWith('#') || t.startsWith('>') || t.startsWith('\\')) return false
  const ci = t.indexOf(':')
  if (ci <= 0 || ci > 8) return false
  const sp = t.slice(0, ci).trim()
  const tx = t.slice(ci + 1).trim()
  if (!tx || !sp || sp.startsWith('Focus') || sp.startsWith('Exposure')) return false
  return true
}

function parseDialogueCounts(content: string): Map<number, number> {
  const counts = new Map<number, number>()
  const sections = content.split(/(?=^## EP\d+)/m)
  for (const section of sections) {
    const m = section.match(/^## EP(\d+)/)
    if (!m) continue
    const epNum = parseInt(m[1])
    const dialogues = section.split('\n').filter(isDialogueLine)
    counts.set(epNum, dialogues.length)
  }
  return counts
}

async function main() {
  const content = fs.readFileSync(SCRIPT_MD, 'utf-8')
  const mdCounts = parseDialogueCounts(content)

  // DB: episode_num + dialogue count (limit 충분히)
  const { data: epRows } = await supabase.from('kp_episodes').select('id, episode_num').order('episode_num')
  const epIdMap = new Map((epRows ?? []).map(r => [r.id, r.episode_num]))

  // 페이지네이션으로 전체 조회 (Supabase 기본 한도 1000행 우회)
  const dbCounts = new Map<number, number>()
  let offset = 0
  while (true) {
    const { data: page, error } = await supabase
      .from('kp_dialogues').select('episode_id').range(offset, offset + 999)
    if (error) throw new Error(`kp_dialogues: ${error.message}`)
    if (!page || page.length === 0) break
    for (const r of page) {
      const epNum = epIdMap.get(r.episode_id)
      if (epNum == null) continue
      dbCounts.set(epNum, (dbCounts.get(epNum) ?? 0) + 1)
    }
    if (page.length < 1000) break
    offset += 1000
  }

  // 비교
  let mdTotal = 0, dbTotal = 0
  const mismatches: { ep: number; md: number; db: number; diff: number }[] = []

  for (let ep = 1; ep <= 100; ep++) {
    const md = mdCounts.get(ep) ?? 0
    const db = dbCounts.get(ep) ?? 0
    mdTotal += md
    dbTotal += db
    if (md !== db) mismatches.push({ ep, md, db, diff: db - md })
  }

  if (!mismatches.length) {
    console.log('모든 EP 일치 ✓')
  } else {
    console.log(`불일치 EP: ${mismatches.length}개\n`)
    console.log('EP    대본  DB   차이(DB-대본)')
    console.log('─'.repeat(32))
    for (const { ep, md, db, diff } of mismatches) {
      const sign = diff > 0 ? `+${diff}` : `${diff}`
      console.log(`EP${String(ep).padStart(2,'0')}   ${String(md).padStart(3)}   ${String(db).padStart(3)}   ${sign}`)
    }
  }

  console.log('\n합계')
  console.log(`  대본: ${mdTotal}  DB: ${dbTotal}  차이: ${dbTotal - mdTotal}`)
}

main().catch(console.error)
