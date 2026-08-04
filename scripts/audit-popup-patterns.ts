/**
 * K-PATTO Pattern Popup 감사 및 Export 스크립트
 *
 * 출력:
 *   kpatto_pattern_popup_db_export.json  (Downloads)
 *   kpatto_pattern_popup_audit.md        (Downloads)
 *
 * 실행: npx tsx scripts/audit-popup-patterns.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const DOWNLOADS = path.join(os.homedir(), 'Downloads')
const EXPORT_FILE = path.join(DOWNLOADS, 'kpatto_pattern_popup_db_export.json')
const AUDIT_FILE  = path.join(DOWNLOADS, 'kpatto_pattern_popup_audit.md')

const SCRIPT_PATH = path.join(
  os.homedir(), 'Downloads', 'kpatto_scripts_confirmed.md'
)

// ── MD 파싱: EP별 Focus Pattern 목록 ─────────────────────────────────────────
function parseScriptFocusPatterns(content: string): Map<number, string[]> {
  const map = new Map<number, string[]>()
  const sections = content.split(/(?=^## EP\d+)/m)
  for (const sec of sections) {
    const epM = sec.match(/^## EP(\d+)/)
    if (!epM) continue
    const epNum = parseInt(epM[1])
    const focusM = sec.match(/\*\*Focus Pattern:\*\*\s*([^\n]+)/)
    if (!focusM) continue
    const patterns = focusM[1]
      .split(' / ')
      .map(p => p.trim())
      .filter(Boolean)
    map.set(epNum, patterns)
  }
  return map
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  // ── 1. MD 파싱 ─────────────────────────────────────────────────────────────
  if (!fs.existsSync(SCRIPT_PATH)) {
    console.error('스크립트 없음:', SCRIPT_PATH); process.exit(1)
  }
  const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf-8')
  const scriptFocusMap = parseScriptFocusPatterns(scriptContent)
  console.log(`스크립트 파싱 완료: ${scriptFocusMap.size}개 에피소드`)

  // ── 2. DB: kp_expressions 전체 ──────────────────────────────────────────────
  const { data: expressions, error: exprErr } = await sb
    .from('kp_expressions')
    .select('id, korean, english, description, examples, category, first_episode')
    .order('first_episode', { ascending: true })
    .order('id', { ascending: true })
  if (exprErr) { console.error('kp_expressions 조회 실패:', exprErr.message); process.exit(1) }
  console.log(`kp_expressions: ${expressions?.length ?? 0}건`)

  // ── 3. DB: kp_episodes (episode_num → DB id) ──────────────────────────────
  const { data: episodes, error: epErr } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .order('episode_num')
  if (epErr) { console.error('kp_episodes 조회 실패:', epErr.message); process.exit(1) }

  const epNumToDbId = new Map<number, number>()
  for (const ep of episodes ?? []) {
    epNumToDbId.set(ep.episode_num as number, ep.id as number)
  }
  console.log(`kp_episodes: ${epNumToDbId.size}개 에피소드 로드`)

  // ── 4. DB: kp_dialogue_expressions (focus only) ───────────────────────────
  //    focus role만 → expression_id, dialogue_id
  const { data: deRows, error: deErr } = await sb
    .from('kp_dialogue_expressions')
    .select('expression_id, dialogue_id, role')
  if (deErr) { console.error('kp_dialogue_expressions 조회 실패:', deErr.message); process.exit(1) }
  console.log(`kp_dialogue_expressions: ${deRows?.length ?? 0}건`)

  // ── 5. DB: kp_bubbles (dialogue_id → episode_id) ──────────────────────────
  //    dialogue_id가 있는 버블만
  const dialogueIdsAll = [...new Set(
    (deRows ?? []).map((r: any) => r.dialogue_id as number).filter(Boolean)
  )]
  let bubbleRows: Array<{ dialogue_id: number; episode_id: number }> = []
  if (dialogueIdsAll.length > 0) {
    // Supabase limit: in() 최대 500 → 청크 처리
    const CHUNK = 500
    for (let i = 0; i < dialogueIdsAll.length; i += CHUNK) {
      const chunk = dialogueIdsAll.slice(i, i + CHUNK)
      const { data, error } = await sb
        .from('kp_bubbles')
        .select('dialogue_id, episode_id')
        .in('dialogue_id', chunk)
      if (error) { console.error('kp_bubbles 조회 실패:', error.message); process.exit(1) }
      bubbleRows.push(...((data ?? []) as typeof bubbleRows))
    }
  }
  console.log(`kp_bubbles (dialogue_id 있는 것): ${bubbleRows.length}건`)

  // dialogue_id → episode_id (중복 가능 → Set로 수집)
  const dialogueToEpIds = new Map<number, Set<number>>()
  for (const b of bubbleRows) {
    if (!dialogueToEpIds.has(b.dialogue_id)) dialogueToEpIds.set(b.dialogue_id, new Set())
    dialogueToEpIds.get(b.dialogue_id)!.add(b.episode_id)
  }

  // DB episode_id → episode_num 역매핑
  const dbIdToEpNum = new Map<number, number>()
  for (const [epNum, dbId] of epNumToDbId) { dbIdToEpNum.set(dbId, epNum) }

  // ── 6. expression_id → 연결된 episode_nums (focus) ─────────────────────────
  const exprIdToEpNums = new Map<number, Set<number>>()
  const exprIdToRoles  = new Map<number, Set<string>>()

  for (const row of deRows ?? []) {
    const exprId    = row.expression_id as number
    const diagId    = row.dialogue_id   as number
    const role      = row.role          as string

    if (!exprIdToRoles.has(exprId)) exprIdToRoles.set(exprId, new Set())
    exprIdToRoles.get(exprId)!.add(role)

    const epIds = dialogueToEpIds.get(diagId) ?? new Set()
    if (!exprIdToEpNums.has(exprId)) exprIdToEpNums.set(exprId, new Set())
    for (const epId of epIds) {
      const epNum = dbIdToEpNum.get(epId)
      if (epNum != null) exprIdToEpNums.get(exprId)!.add(epNum)
    }
  }

  // ── 7. kp_expressions → korean 기준 lookup ─────────────────────────────────
  const exprByKorean = new Map<string, typeof expressions[0][]>()
  for (const e of expressions ?? []) {
    const k = e.korean as string
    if (!exprByKorean.has(k)) exprByKorean.set(k, [])
    exprByKorean.get(k)!.push(e)
  }

  // ── 8. Focus pattern 전용 expression 집합 ──────────────────────────────────
  // (category = 'focus' OR role = 'focus'인 것)
  const focusExprIds = new Set<number>()
  for (const row of deRows ?? []) {
    if ((row.role as string) === 'focus') focusExprIds.add(row.expression_id as number)
  }
  // category = 'focus'인 것도 포함
  for (const e of expressions ?? []) {
    if ((e.category as string) === 'focus') focusExprIds.add(e.id as number)
  }

  // ── 9. Export JSON 구성 ───────────────────────────────────────────────────
  interface ExportRow {
    id: number
    episode: number | null
    episode_db_ids: number[]
    role: string
    pattern_ko: string
    literal_en: string | null
    usage_en: string | null
    examples: Array<{ ko: string; en: string }> | null
    source_table: string
    category: string | null
  }

  const exportRows: ExportRow[] = []
  for (const e of expressions ?? []) {
    const exprId = e.id as number
    if (!focusExprIds.has(exprId)) continue  // focus 아닌 것 제외

    const linkedEpNums = [...(exprIdToEpNums.get(exprId) ?? [])].sort((a, b) => a - b)
    const linkedEpDbIds: number[] = []
    for (const epNum of linkedEpNums) {
      const dbId = epNumToDbId.get(epNum)
      if (dbId != null) linkedEpDbIds.push(dbId)
    }

    exportRows.push({
      id:            exprId,
      episode:       (e.first_episode as number | null) ?? (linkedEpNums[0] ?? null),
      episode_db_ids: linkedEpDbIds,
      role:          'focus',
      pattern_ko:    e.korean as string,
      literal_en:    (e.english as string | null) || null,
      usage_en:      (e.description as string | null) || null,
      examples:      (e.examples as Array<{ ko: string; en: string }> | null) || null,
      source_table:  'kp_expressions',
      category:      (e.category as string | null) || null,
    })
  }
  exportRows.sort((a, b) => (a.episode ?? 999) - (b.episode ?? 999))

  fs.writeFileSync(EXPORT_FILE, JSON.stringify(exportRows, null, 2), 'utf-8')
  console.log(`\nExport 완료: ${EXPORT_FILE} (${exportRows.length}건)`)

  // ── 10. 감사 비교 ─────────────────────────────────────────────────────────
  type AuditStatus =
    | 'exact'          // 완전 일치
    | 'notation_diff'  // ~ 표기 차이
    | 'pattern_diff'   // 패턴 의미 다름
    | 'not_in_db'      // DB에 없음
    | 'no_literal'     // Literal 누락
    | 'no_usage'       // Usage 누락
    | 'no_examples'    // Examples 누락
    | 'missing_ex'     // 예문 3개 미만

  interface AuditEpEntry {
    ep: number
    scriptPatterns: string[]
    dbMatches: Array<{
      scriptPattern: string
      dbId: number | null
      dbKorean: string | null
      status: AuditStatus[]
      literal_en: string | null
      usage_en: string | null
      exampleCount: number
      linkedEps: number[]
    }>
  }

  const auditRows: AuditEpEntry[] = []

  // 스크립트 기준 EP 순서로 비교
  const scriptEps = [...scriptFocusMap.keys()].sort((a, b) => a - b)

  for (const epNum of scriptEps) {
    const patterns = scriptFocusMap.get(epNum)!
    const entry: AuditEpEntry = { ep: epNum, scriptPatterns: patterns, dbMatches: [] }

    for (const sp of patterns) {
      // 정확 일치 검색
      let dbRec = (exprByKorean.get(sp) ?? []).find(e => focusExprIds.has(e.id as number))
      // ~ 표기 차이 허용: sp에 ~ 붙이거나 제거해서 검색
      if (!dbRec) {
        const withTilde   = sp.startsWith('~') ? sp : ('~' + sp)
        const withoutTilde = sp.startsWith('~') ? sp.slice(1) : sp
        dbRec = (exprByKorean.get(withTilde) ?? []).find(e => focusExprIds.has(e.id as number))
              ?? (exprByKorean.get(withoutTilde) ?? []).find(e => focusExprIds.has(e.id as number))
      }

      const statusList: AuditStatus[] = []

      if (!dbRec) {
        statusList.push('not_in_db')
        entry.dbMatches.push({
          scriptPattern: sp, dbId: null, dbKorean: null,
          status: statusList, literal_en: null, usage_en: null, exampleCount: 0, linkedEps: [],
        })
        continue
      }

      const dbKorean = dbRec.korean as string
      if (dbKorean === sp) {
        statusList.push('exact')
      } else {
        // ~ 차이인지 의미 차이인지 판별
        const normSp = sp.replace(/^~/, '').replace(/~$/, '').trim()
        const normDb = dbKorean.replace(/^~/, '').replace(/~$/, '').trim()
        if (normSp === normDb) {
          statusList.push('notation_diff')
        } else {
          statusList.push('pattern_diff')
        }
      }

      const lit = (dbRec.english as string | null) || null
      const usg = (dbRec.description as string | null) || null
      const exs = (dbRec.examples as Array<{ ko: string; en: string }> | null) || null

      if (!lit) statusList.push('no_literal')
      if (!usg) statusList.push('no_usage')
      if (!exs || exs.length === 0) statusList.push('no_examples')
      else if (exs.length < 3) statusList.push('missing_ex')

      const linkedEps = [...(exprIdToEpNums.get(dbRec.id as number) ?? [])].sort((a, b) => a - b)

      entry.dbMatches.push({
        scriptPattern: sp,
        dbId: dbRec.id as number,
        dbKorean,
        status: statusList,
        literal_en: lit,
        usage_en: usg,
        exampleCount: exs?.length ?? 0,
        linkedEps,
      })
    }

    auditRows.push(entry)
  }

  // ── 11. DB에는 있지만 스크립트 Focus에 없는 항목 ──────────────────────────
  const scriptAllPatterns = new Set<string>()
  for (const ps of scriptFocusMap.values()) {
    for (const p of ps) scriptAllPatterns.add(p)
  }

  const dbOnlyRows: Array<{ id: number; korean: string; linkedEps: number[] }> = []
  for (const e of expressions ?? []) {
    if (!focusExprIds.has(e.id as number)) continue
    const k = e.korean as string
    const normK = k.replace(/^~/, '').replace(/~$/, '').trim()
    const found = scriptAllPatterns.has(k)
               || scriptAllPatterns.has('~' + k)
               || scriptAllPatterns.has(k.slice(1))
               || [...scriptAllPatterns].some(p => p.replace(/^~/, '').replace(/~$/, '').trim() === normK)
    if (!found) {
      const linkedEps = [...(exprIdToEpNums.get(e.id as number) ?? [])].sort((a, b) => a - b)
      dbOnlyRows.push({ id: e.id as number, korean: k, linkedEps })
    }
  }

  // ── 12. 통계 계산 ──────────────────────────────────────────────────────────
  let cntScript    = 0, cntExact = 0, cntNotation = 0, cntPatternDiff = 0
  let cntNotInDb   = 0, cntNoLiteral = 0, cntNoUsage = 0, cntNoEx = 0, cntMissingEx = 0
  let cntComplete  = 0

  for (const row of auditRows) {
    for (const m of row.dbMatches) {
      cntScript++
      if (m.status.includes('exact'))        cntExact++
      if (m.status.includes('notation_diff')) cntNotation++
      if (m.status.includes('pattern_diff')) cntPatternDiff++
      if (m.status.includes('not_in_db'))    cntNotInDb++
      if (m.status.includes('no_literal'))   cntNoLiteral++
      if (m.status.includes('no_usage'))     cntNoUsage++
      if (m.status.includes('no_examples'))  cntNoEx++
      if (m.status.includes('missing_ex'))   cntMissingEx++
      // 완전 데이터: exact + literal + usage + examples 3개 이상
      const isComplete = m.status.includes('exact')
                      && !m.status.includes('no_literal')
                      && !m.status.includes('no_usage')
                      && !m.status.includes('no_examples')
                      && !m.status.includes('missing_ex')
      if (isComplete) cntComplete++
    }
  }

  // ── 13. 중복 표현 (같은 korean이 focus로 2건 이상) ────────────────────────
  const dupMap = new Map<string, typeof expressions>()
  for (const e of expressions ?? []) {
    if (!focusExprIds.has(e.id as number)) continue
    const k = e.korean as string
    if (!dupMap.has(k)) dupMap.set(k, [])
    dupMap.get(k)!.push(e)
  }
  const duplicates = [...dupMap.entries()].filter(([, rows]) => rows.length > 1)

  // ── 14. Audit MD 생성 ─────────────────────────────────────────────────────
  const lines: string[] = [
    '# K-PATTO Pattern Popup 감사 보고서',
    '',
    `생성일시: ${new Date().toISOString()}`,
    `스크립트 기준: kpatto_scripts_confirmed.md (v2 최종)`,
    `DB 테이블: kp_expressions (팝업 데이터) + kp_dialogue_expressions (에피소드 연결)`,
    '',
    '---',
    '',
    '## 요약 통계',
    '',
    `| 항목 | 수 |`,
    `|------|-----|`,
    `| 스크립트 Focus Pattern 총 수 | ${cntScript} |`,
    `| DB focus 팝업 총 수 | ${exportRows.length} |`,
    `| 완전 일치 (exact) | ${cntExact} |`,
    `| 표기 차이 (~ 유무 등) | ${cntNotation} |`,
    `| 패턴 의미 다름 | ${cntPatternDiff} |`,
    `| DB에 없음 (누락) | ${cntNotInDb} |`,
    `| 스크립트에 없는 DB 항목 | ${dbOnlyRows.length} |`,
    `| 중복 DB 항목 | ${duplicates.length} |`,
    `| Literal 누락 | ${cntNoLiteral} |`,
    `| Usage 누락 | ${cntNoUsage} |`,
    `| Examples 누락 | ${cntNoEx + cntMissingEx} |`,
    `| 팝업 정보 완전한 항목 | ${cntComplete} |`,
    '',
    '---',
    '',
    '## 실제 화면 데이터 출처 및 우선순위',
    '',
    '```',
    'kp_dialogue_expressions (role=focus) → expression_id 획득',
    '       ↓',
    'kp_expressions.id → english / description / examples 렌더링 (ExpressionPopup.tsx)',
    '       ↓',
    'kpatto-popup-patterns.ts → 로컬 파일 (현재 앱에서 import 안 함, DB seed 준비용)',
    '',
    '우선순위: DB kp_expressions 단독 (fallback 없음)',
    '```',
    '',
    '---',
    '',
    '## 에피소드별 비교',
    '',
  ]

  for (const row of auditRows) {
    lines.push(`### EP${String(row.ep).padStart(2, '0')}`)
    lines.push('')
    lines.push(`스크립트 Focus Patterns: \`${row.scriptPatterns.join(' / ')}\``)
    lines.push('')

    for (const m of row.dbMatches) {
      const stLabel = m.status.join(', ')
      lines.push(`#### 패턴: \`${m.scriptPattern}\``)
      lines.push('')

      if (m.status.includes('not_in_db')) {
        lines.push(`- **DB**: 없음 ❌`)
        lines.push('')
        continue
      }

      const badge = m.status.includes('exact')        ? '✅ 완전 일치'
                  : m.status.includes('notation_diff') ? '🔶 표기 차이'
                  : m.status.includes('pattern_diff')  ? '⚠️ 패턴 다름'
                  : '❓'

      lines.push(`- **상태**: ${badge}`)
      lines.push(`- **DB id**: ${m.dbId}  |  **DB korean**: \`${m.dbKorean}\``)
      lines.push(`- **연결 에피소드**: ${m.linkedEps.length > 0 ? m.linkedEps.map(e => `EP${String(e).padStart(2, '0')}`).join(', ') : '없음'}`)
      lines.push(`- **Literal**: ${m.literal_en ?? '❌ 없음'}`)
      lines.push(`- **Usage**: ${m.usage_en ? m.usage_en.substring(0, 80) + (m.usage_en.length > 80 ? '…' : '') : '❌ 없음'}`)
      lines.push(`- **Examples**: ${m.exampleCount}개 ${m.exampleCount === 0 ? '❌' : m.exampleCount < 3 ? '⚠️' : '✅'}`)
      lines.push('')
    }
  }

  // DB에만 있는 항목
  if (dbOnlyRows.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## 스크립트 Focus에 없는 DB 항목')
    lines.push('')
    for (const r of dbOnlyRows) {
      lines.push(`- id=${r.id}  \`${r.korean}\`  연결 EP: ${r.linkedEps.map(e => `EP${String(e).padStart(2, '0')}`).join(', ') || '없음'}`)
    }
    lines.push('')
  }

  // 중복 항목
  if (duplicates.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## 중복 DB 항목')
    lines.push('')
    for (const [k, rows] of duplicates) {
      lines.push(`- \`${k}\`: id=${rows.map(r => r.id).join(', ')}`)
    }
    lines.push('')
  }

  fs.writeFileSync(AUDIT_FILE, lines.join('\n'), 'utf-8')
  console.log(`감사 보고서 완료: ${AUDIT_FILE}`)

  // ── 15. 터미널 요약 ────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════')
  console.log('[ 최종 요약 ]')
  console.log('══════════════════════════════════════════════')
  console.log(`스크립트 Focus Pattern 총 수    : ${cntScript}`)
  console.log(`DB focus 팝업 총 수             : ${exportRows.length}`)
  console.log(`완전 일치                       : ${cntExact}`)
  console.log(`표기 차이 (~)                   : ${cntNotation}`)
  console.log(`패턴 의미 다름                  : ${cntPatternDiff}`)
  console.log(`DB에 없는 스크립트 패턴 (누락)  : ${cntNotInDb}`)
  console.log(`스크립트에 없는 DB 항목         : ${dbOnlyRows.length}`)
  console.log(`중복 DB 항목                    : ${duplicates.length}`)
  console.log(`Literal 누락                    : ${cntNoLiteral}`)
  console.log(`Usage 누락                      : ${cntNoUsage}`)
  console.log(`Examples 누락/부족              : ${cntNoEx + cntMissingEx}`)
  console.log(`팝업 정보 완전한 항목           : ${cntComplete}`)
  console.log('')
  console.log('실제 화면 데이터 출처:')
  console.log('  DB kp_expressions (단독, fallback 없음)')
  console.log('')
  console.log('생성 파일:')
  console.log(`  ${EXPORT_FILE}`)
  console.log(`  ${AUDIT_FILE}`)
}

main().catch(console.error)
