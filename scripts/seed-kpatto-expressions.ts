/**
 * 1. MD 파싱 (올바른 ' / ' 분리 + '/포함패턴 앞쪽만' 정규화)
 * 2. EP96 Focus 오버라이드
 * 3. kp_expressions INSERT (기존 중복 제외)
 * 4. kp_dialogue_expressions INSERT (episode별 focus/exposure 연결)
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { fetchAllDialogues } from './_db-utils'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

const mdPath = process.argv[2] ?? path.join(os.homedir(), 'Downloads', 'kpatto_scripts_confirmed.md')

// EP96 Focus 패턴 오버라이드 (사용자 지시)
const EP96_FOCUS = ['딱 이 느낌이에요', '어딘가 모르게 끌려요']

// '/포함 패턴 → 앞쪽만': /X 제거 (e.g. ~이/가 → ~이, ~었어/았어 → ~었어)
function normalizePattern(p: string): string {
  return p.replace(/\/\S+/g, '').replace(/\s+/g, ' ').trim()
}

// 패턴 라인을 ' / '로 분리 후 각각 정규화
function splitPatterns(line: string): string[] {
  return line.split(' / ').map(normalizePattern).filter(Boolean)
}

interface EpGroup { epNum: number; patterns: string[]; role: 'focus' | 'exposure' }

function parseAllPatterns(content: string): EpGroup[] {
  const result: EpGroup[] = []
  const sections = content.split(/(?=^## EP\d+)/m)

  for (const sec of sections) {
    const m = sec.match(/^## EP(\d+)/)
    if (!m) continue
    const epNum = parseInt(m[1])

    const focusLine = sec.match(/\*\*Focus Pattern:\*\*\s*([^\n]+)/)
    if (focusLine) {
      const patterns = epNum === 96 ? EP96_FOCUS : splitPatterns(focusLine[1])
      result.push({ epNum, patterns, role: 'focus' })
    }

    const exposureLine = sec.match(/\*\*Exposure Pattern:\*\*\s*([^\n]+)/)
    if (exposureLine) {
      result.push({ epNum, patterns: splitPatterns(exposureLine[1]), role: 'exposure' })
    }
  }
  return result
}

// 대사 검색: 패턴에서 핵심 검색어 추출
function getSearchTerm(pattern: string): string {
  return pattern
    .replace(/^~\S*\s+/, '')  // ~word 로 시작하면 그 단어 제거
    .replace(/^~/, '')         // 남은 ~ 제거
    .replace(/\s*~\s*$/, '')   // 끝의 ~ 제거
    .trim()
}

function findBestDialogue(
  dialogues: Array<{ id: number; text_ko: string }>,
  pattern: string
): { id: number; text_ko: string } {
  const fallback = dialogues[0]
  if (!dialogues.length) return { id: 0, text_ko: '' }

  const term = getSearchTerm(pattern)
  if (!term || term.length < 2) return fallback

  // 1. 전체 검색어 직접 검색
  const exact = dialogues.find(d => d.text_ko.includes(term))
  if (exact) return exact

  // 2. 마지막 의미 단어로 검색 (2글자 이상)
  const words = term.split(/\s+/).filter(w => w.replace(/[~?!]/g, '').length >= 2)
  if (words.length) {
    const lastWord = words[words.length - 1].replace(/[~?!]/g, '')
    const byWord = dialogues.find(d => d.text_ko.includes(lastWord))
    if (byWord) return byWord

    // 3. 첫 단어로도 시도
    const firstWord = words[0].replace(/[~?!]/g, '')
    if (firstWord !== lastWord) {
      const byFirst = dialogues.find(d => d.text_ko.includes(firstWord))
      if (byFirst) return byFirst
    }
  }

  return fallback
}

async function main() {
  if (!fs.existsSync(mdPath)) {
    console.error('파일 없음:', mdPath); process.exit(1)
  }

  const content = fs.readFileSync(mdPath, 'utf-8')
  const epGroups = parseAllPatterns(content)
  console.log(`에피소드 파싱: ${new Set(epGroups.map(g => g.epNum)).size}개`)

  // ── 고유 패턴 집계 ─────────────────────────────────────────
  interface ExprMeta {
    category: 'focus' | 'exposure'
    firstEp: number
    focusEps: number[]
    exposureEps: number[]
  }
  const exprMap = new Map<string, ExprMeta>()

  for (const g of epGroups) {
    for (const p of g.patterns) {
      if (!exprMap.has(p)) {
        exprMap.set(p, { category: g.role, firstEp: g.epNum, focusEps: [], exposureEps: [] })
      }
      const e = exprMap.get(p)!
      if (g.role === 'focus') e.focusEps.push(g.epNum)
      else e.exposureEps.push(g.epNum)
      if (g.epNum < e.firstEp) e.firstEp = g.epNum
      e.category = e.focusEps.length >= e.exposureEps.length ? 'focus' : 'exposure'
    }
  }

  const totalFocus    = [...exprMap.values()].filter(e => e.focusEps.length > 0).length
  const totalExposure = [...exprMap.values()].filter(e => e.exposureEps.length > 0).length
  const multi         = [...exprMap.values()].filter(e => e.focusEps.length + e.exposureEps.length >= 2).length
  console.log(`고유 패턴: ${exprMap.size}개 (Focus전용: ${totalFocus - multi} / Exposure전용: ${totalExposure - multi} / 중복: ${multi})`)

  // ── 기존 kp_expressions 확인 ──────────────────────────────
  const { data: existing, error: existErr } = await supabase.from('kp_expressions').select('id, korean')
  if (existErr) { console.error('기존 조회 실패:', existErr.message); process.exit(1) }
  const existingMap = new Map(existing?.map(e => [e.korean, e.id]) ?? [])
  console.log(`기존 kp_expressions: ${existingMap.size}개`)

  const toInsert = [...exprMap.entries()]
    .filter(([k]) => !existingMap.has(k))
    .map(([korean, meta]) => ({
      korean,
      english: korean,   // placeholder — fill later
      category: meta.category,
      first_episode: meta.firstEp,
    }))

  console.log(`신규 INSERT: ${toInsert.length}개 / 스킵(기존): ${exprMap.size - toInsert.length}개`)

  // ── kp_expressions INSERT ─────────────────────────────────
  const BATCH = 100
  let insertedCount = 0
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)
    const { error } = await supabase.from('kp_expressions').insert(batch)
    if (error) { console.error(`INSERT 오류 (batch ${i}):`, error.message); process.exit(1) }
    insertedCount += batch.length
    process.stdout.write(`\r  kp_expressions INSERT: ${insertedCount}/${toInsert.length}`)
  }
  if (toInsert.length) console.log()

  // 최신 expression 목록 가져오기
  const { data: allExprs, error: allErr } = await supabase.from('kp_expressions').select('id, korean')
  if (allErr) { console.error('전체 조회 실패:', allErr.message); process.exit(1) }
  const allExprMap = new Map(allExprs?.map(e => [e.korean, e.id]) ?? [])
  console.log(`kp_expressions 총계: ${allExprMap.size}개\n`)

  // ── episode ID + dialogue 로드 ────────────────────────────
  const { data: epRows } = await supabase.from('kp_episodes').select('id, episode_num')
  const epIdMap = new Map(epRows?.map(e => [e.episode_num, e.id]) ?? [])

  const allDialogues = await fetchAllDialogues(supabase, 'id, episode_id, text_ko')

  // episode_id → dialogues[]
  const dlByEp = new Map<number, Array<{ id: number; text_ko: string }>>()
  for (const d of allDialogues) {
    if (!dlByEp.has(d.episode_id)) dlByEp.set(d.episode_id, [])
    dlByEp.get(d.episode_id)!.push({ id: d.id, text_ko: d.text_ko })
  }
  console.log(`대사 로드: ${allDialogues.length}개 (${dlByEp.size}개 에피소드)`)

  // ── kp_dialogue_expressions 빌드 ─────────────────────────
  const deRecords: Array<{
    dialogue_id: number
    expression_id: number
    matched_text: string | null
    role: 'focus' | 'exposure'
  }> = []

  let notFoundExpr = 0
  let noDialogue   = 0
  let matchedExact = 0
  let matchedWord  = 0
  let matchedFallback = 0

  for (const g of epGroups) {
    const epId = epIdMap.get(g.epNum)
    if (!epId) continue
    const dialogues = dlByEp.get(epId) ?? []

    for (const p of g.patterns) {
      const exprId = allExprMap.get(p)
      if (!exprId) { notFoundExpr++; continue }
      if (!dialogues.length) { noDialogue++; continue }

      const term = getSearchTerm(p)
      const best = findBestDialogue(dialogues, p)

      // 매치 품질 분류 (통계용)
      if (term.length >= 2 && best.text_ko.includes(term)) matchedExact++
      else if (term.length >= 2) {
        const words = term.split(/\s+/).filter(w => w.replace(/[~?!]/g, '').length >= 2)
        const anyWord = words.some(w => best.text_ko.includes(w.replace(/[~?!]/g, '')))
        if (anyWord) matchedWord++
        else matchedFallback++
      } else matchedFallback++

      deRecords.push({
        dialogue_id: best.id,
        expression_id: exprId,
        matched_text: best.text_ko,
        role: g.role,
      })
    }
  }

  console.log(`kp_dialogue_expressions 생성: ${deRecords.length}개`)
  console.log(`  정확 매치: ${matchedExact} / 단어 매치: ${matchedWord} / fallback: ${matchedFallback}`)
  if (notFoundExpr) console.warn(`  expression 미발견: ${notFoundExpr}건`)

  // INSERT
  let deOk = 0
  for (let i = 0; i < deRecords.length; i += BATCH) {
    const batch = deRecords.slice(i, i + BATCH)
    const { error } = await supabase.from('kp_dialogue_expressions').insert(batch)
    if (error) { console.error(`DE INSERT 오류 (batch ${i}):`, error.message); break }
    deOk += batch.length
    process.stdout.write(`\r  kp_dialogue_expressions INSERT: ${deOk}/${deRecords.length}`)
  }
  console.log()

  // ── 최종 카운트 ───────────────────────────────────────────
  const countExpr = (await supabase.from('kp_expressions').select('id', { count: 'exact', head: true })).count
  const countDe   = (await supabase.from('kp_dialogue_expressions').select('id', { count: 'exact', head: true })).count

  console.log('\n=== 완료 ===')
  console.log(`kp_expressions          : ${countExpr}`)
  console.log(`kp_dialogue_expressions : ${countDe}`)

  // 샘플 확인: 중복 패턴 상위 5개
  console.log('\n[ 2회 이상 등장 패턴 샘플 (상위 5) ]')
  const multi2 = [...exprMap.entries()]
    .filter(([, v]) => v.focusEps.length + v.exposureEps.length >= 2)
    .sort((a, b) => (b[1].focusEps.length + b[1].exposureEps.length) - (a[1].focusEps.length + a[1].exposureEps.length))
    .slice(0, 5)
  for (const [p, v] of multi2) {
    const total = v.focusEps.length + v.exposureEps.length
    const fStr = v.focusEps.length ? `Focus:EP${v.focusEps.join(',')}` : ''
    const eStr = v.exposureEps.length ? `Exposure:EP${v.exposureEps.join(',')}` : ''
    console.log(`  [${total}회] ${p} — ${[fStr, eStr].filter(Boolean).join(' / ')}`)
  }
}

main().catch(console.error)
