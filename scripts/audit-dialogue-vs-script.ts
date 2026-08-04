/**
 * kp_dialogues.text_ko vs kpatto_scripts_confirmed.md 비교 감사
 * 보고만 수행 -- DB 수정 없음
 *
 * 실행: npx tsx scripts/audit-dialogue-vs-script.ts
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

interface ScriptLine { ep: number; text: string }

function parseScript(mdPath: string): ScriptLine[] {
  const raw = fs.readFileSync(mdPath, 'utf-8')
  const lines = raw.split(/\r?\n/)
  const result: ScriptLine[] = []
  let currentEp = 0
  // "이름: 대사" -- 이름은 한글/숫자/점·문자
  const dialogueRe = /^[가-힣\w·\s]+?:\s+(.+)$/

  for (const line of lines) {
    const epMatch = line.match(/^##\s+EP(\d+)/)
    if (epMatch) { currentEp = parseInt(epMatch[1], 10); continue }
    if (currentEp === 0) continue
    if (line.startsWith('**') || line.startsWith('>') || line.startsWith('#') ||
        line.startsWith('-') || line.trim() === '' || line.startsWith('|')) continue
    const dm = line.match(dialogueRe)
    if (dm) result.push({ ep: currentEp, text: dm[1].trim() })
  }
  return result
}

function classifyDiff(script: string, db: string): string {
  if (script.replace(/\s+/g, '') === db.replace(/\s+/g, '')) return 'spacing_only'
  if (script.replace(/[.?!,\u2026\u00B7\s]/g, '') === db.replace(/[.?!,\u2026\u00B7\s]/g, '')) return 'punctuation_only'
  return 'content_diff'
}

interface MismatchReport {
  ep: number
  type: 'script_not_in_db' | 'db_not_in_script' | 'diff'
  script?: string
  db?: string
  db_id?: number
  diff_class?: string
}

async function main() {
  const MD_PATH = 'C:/Users/msj15/Downloads/kpatto_scripts_confirmed.md'

  console.log('MD 파일 파싱 중...')
  const scriptLines = parseScript(MD_PATH)
  console.log(`  -> 대사 ${scriptLines.length}개 파싱 완료`)

  const scriptByEp = new Map<number, string[]>()
  for (const { ep, text } of scriptLines) {
    if (!scriptByEp.has(ep)) scriptByEp.set(ep, [])
    scriptByEp.get(ep)!.push(text)
  }

  console.log('DB 조회 중...')
  const { data: episodes } = await sb.from('kp_episodes')
    .select('id, episode_num')
    .gte('episode_num', 1).lte('episode_num', 100)
    .order('episode_num')

  const epNumToId = new Map((episodes ?? []).map((e: any) => [e.episode_num as number, e.id as number]))
  const epIdToNum = new Map((episodes ?? []).map((e: any) => [e.id as number, e.episode_num as number]))

  const { data: dbDialogues } = await sb.from('kp_dialogues')
    .select('id, episode_id, text_ko')
    .in('episode_id', [...epNumToId.values()])
    .order('id')

  console.log(`  -> DB 대사 ${dbDialogues?.length ?? 0}개 로드 완료`)

  const dbByEp = new Map<number, Array<{ id: number; text_ko: string }>>()
  for (const row of (dbDialogues ?? []) as Array<{ id: number; episode_id: number; text_ko: string }>) {
    const ep = epIdToNum.get(row.episode_id)
    if (!ep) continue
    if (!dbByEp.has(ep)) dbByEp.set(ep, [])
    dbByEp.get(ep)!.push({ id: row.id, text_ko: row.text_ko })
  }

  const reports: MismatchReport[] = []
  let totalEps = 0, epsWithDiff = 0
  let spacingOnly = 0, punctOnly = 0, contentDiff = 0
  let scriptNotInDB = 0, dbNotInScript = 0

  for (let ep = 1; ep <= 100; ep++) {
    const scriptTexts = scriptByEp.get(ep) ?? []
    const dbTexts = dbByEp.get(ep) ?? []
    if (scriptTexts.length === 0 && dbTexts.length === 0) continue
    totalEps++

    const dbSet = new Set(dbTexts.map(r => r.text_ko))
    const scriptSet = new Set(scriptTexts)
    let epHasDiff = false

    // 스크립트 대사 -> DB 매칭
    const matchedDbIds = new Set<number>()
    for (const s of scriptTexts) {
      if (dbSet.has(s)) {
        const found = dbTexts.find(r => r.text_ko === s)
        if (found) matchedDbIds.add(found.id)
        continue
      }
      // 공백 무시 매칭
      const noSpaceS = s.replace(/\s+/g, '')
      const spaceMatch = dbTexts.find(r => r.text_ko.replace(/\s+/g, '') === noSpaceS)
      if (spaceMatch) {
        matchedDbIds.add(spaceMatch.id)
        const cls = classifyDiff(s, spaceMatch.text_ko)
        reports.push({ ep, type: 'diff', script: s, db: spaceMatch.text_ko, db_id: spaceMatch.id, diff_class: cls })
        if (cls === 'spacing_only') spacingOnly++
        else if (cls === 'punctuation_only') punctOnly++
        else contentDiff++
        epHasDiff = true
        continue
      }
      // 구두점 무시 매칭
      const noPunctS = s.replace(/[.?!,\u2026\u00B7\s]/g, '')
      const punctMatch = dbTexts.find(r => r.text_ko.replace(/[.?!,\u2026\u00B7\s]/g, '') === noPunctS)
      if (punctMatch) {
        matchedDbIds.add(punctMatch.id)
        reports.push({ ep, type: 'diff', script: s, db: punctMatch.text_ko, db_id: punctMatch.id, diff_class: 'punctuation_only' })
        punctOnly++
        epHasDiff = true
        continue
      }
      // 매칭 실패
      reports.push({ ep, type: 'script_not_in_db', script: s })
      scriptNotInDB++
      epHasDiff = true
    }

    // DB 대사 -> 스크립트 미매칭
    for (const d of dbTexts) {
      if (matchedDbIds.has(d.id)) continue
      if (scriptSet.has(d.text_ko)) { matchedDbIds.add(d.id); continue }
      const noPunctD = d.text_ko.replace(/[.?!,\u2026\u00B7\s]/g, '')
      const inScript = scriptTexts.some(s => s.replace(/[.?!,\u2026\u00B7\s]/g, '') === noPunctD)
      if (!inScript) {
        reports.push({ ep, type: 'db_not_in_script', db: d.text_ko, db_id: d.id })
        dbNotInScript++
        epHasDiff = true
      }
    }

    if (epHasDiff) epsWithDiff++
  }

  // ── 출력 ─────────────────────────────────────────────────────────────

  console.log('\n====================================================')
  console.log('  K-PATTO 대사 비교 감사 결과 (보고용)')
  console.log('====================================================')
  console.log(`검사 EP 수            : ${totalEps}`)
  console.log(`차이 있는 EP          : ${epsWithDiff}`)
  console.log('----------------------------------------------------')
  console.log(`공백 차이만           : ${spacingOnly}`)
  console.log(`구두점 차이만         : ${punctOnly}`)
  console.log(`내용 차이             : ${contentDiff}`)
  console.log(`스크립트->DB 없음     : ${scriptNotInDB}`)
  console.log(`DB->스크립트 없음     : ${dbNotInScript}`)
  console.log('====================================================')

  const contentDiffs = reports.filter(r => r.type === 'diff' && r.diff_class === 'content_diff')
  if (contentDiffs.length > 0) {
    console.log(`\n[내용 차이 ${contentDiffs.length}건]`)
    for (const r of contentDiffs) {
      console.log(`  EP${String(r.ep).padStart(3,'0')} Script: "${r.script}"`)
      console.log(`        DB[${r.db_id}]: "${r.db}"`)
    }
  }

  const noScriptInDB = reports.filter(r => r.type === 'script_not_in_db')
  if (noScriptInDB.length > 0) {
    console.log(`\n[스크립트 대사가 DB에 없음 ${noScriptInDB.length}건]`)
    for (const r of noScriptInDB) {
      console.log(`  EP${String(r.ep).padStart(3,'0')}: "${r.script}"`)
    }
  }

  const noDBInScript = reports.filter(r => r.type === 'db_not_in_script')
  if (noDBInScript.length > 0) {
    console.log(`\n[DB 대사가 스크립트에 없음 ${noDBInScript.length}건]`)
    for (const r of noDBInScript) {
      console.log(`  EP${String(r.ep).padStart(3,'0')} [id=${r.db_id}]: "${r.db}"`)
    }
  }

  const spacingDiffs = reports.filter(r => r.type === 'diff' && r.diff_class === 'spacing_only')
  if (spacingDiffs.length > 0) {
    console.log(`\n[공백 차이만 ${spacingDiffs.length}건 (참고)]`)
    for (const r of spacingDiffs) {
      console.log(`  EP${String(r.ep).padStart(3,'0')} Script: "${r.script}"`)
      console.log(`        DB[${r.db_id}]: "${r.db}"`)
    }
  }

  const punctDiffs = reports.filter(r => r.type === 'diff' && r.diff_class === 'punctuation_only')
  if (punctDiffs.length > 0) {
    console.log(`\n[구두점 차이만 ${punctDiffs.length}건 (참고)]`)
    for (const r of punctDiffs) {
      console.log(`  EP${String(r.ep).padStart(3,'0')} Script: "${r.script}"`)
      console.log(`        DB[${r.db_id}]: "${r.db}"`)
    }
  }

  const outPath = 'C:/Users/msj15/Downloads/kpatto_dialogue_audit.json'
  fs.writeFileSync(outPath, JSON.stringify({ summary: { totalEps, epsWithDiff, spacingOnly, punctOnly, contentDiff, scriptNotInDB, dbNotInScript }, reports }, null, 2), 'utf-8')
  console.log(`\n상세 결과 저장: ${outPath}`)
}

main().catch(console.error)
