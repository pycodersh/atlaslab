/**
 * 감사 보고서에서 "DB: 없음 ❌" 패턴 54개 추출 + 근거 대사 수집
 *
 * 출력: kpatto_missing_popup_patterns_54.json (Downloads)
 * 실행: npx tsx scripts/extract-missing-54.ts
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

const DOWNLOADS   = path.join(os.homedir(), 'Downloads')
const AUDIT_FILE  = path.join(DOWNLOADS, 'kpatto_pattern_popup_audit.md')
const SCRIPT_FILE = path.join(DOWNLOADS, 'kpatto_scripts_confirmed.md')
const OUT_FILE    = path.join(DOWNLOADS, 'kpatto_missing_popup_patterns_54.json')

// ── 1. 감사 보고서 파싱: "DB: 없음 ❌" 항목 추출 ─────────────────────────────
function parseMissingFromAudit(auditContent: string): Array<{ ep: number; pattern_ko: string }> {
  const result: Array<{ ep: number; pattern_ko: string }> = []
  const lines = auditContent.split('\n')
  let currentEp = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // ### EP01 → 에피소드 번호 추적
    const epM = line.match(/^### EP(\d+)/)
    if (epM) {
      currentEp = parseInt(epM[1])
      continue
    }

    // #### 패턴: `...`
    const patM = line.match(/^#### 패턴: `([^`]+)`/)
    if (patM) {
      const patternKo = patM[1]
      // 다음 비어있지 않은 줄 확인
      let j = i + 1
      while (j < lines.length && lines[j].trim() === '') j++
      if (j < lines.length && lines[j].includes('**DB**: 없음 ❌')) {
        result.push({ ep: currentEp, pattern_ko: patternKo })
      }
    }
  }

  return result
}

// ── 2. 스크립트에서 에피소드 섹션 추출 ───────────────────────────────────────
function parseScriptSections(scriptContent: string): Map<number, string> {
  const sections = new Map<number, string>()
  const parts = scriptContent.split(/(?=^## EP\d+)/m)
  for (const part of parts) {
    const m = part.match(/^## EP(\d+)/)
    if (!m) continue
    sections.set(parseInt(m[1]), part)
  }
  return sections
}

// ── 3. 패턴에서 검색 키워드 추출 (~ 제거, 조사 제거) ─────────────────────────
function getSearchTerms(pattern: string): string[] {
  // "~먹을 수 있어요?" → ["먹을 수 있어요"]
  // "~아/어야 할지 모르겠어요" → ["아야 할지 모르겠어요", "어야 할지 모르겠어요", "할지 모르겠어요"]
  const cleaned = pattern
    .replace(/^~\S*\s+/, '')  // 앞 ~단어 제거
    .replace(/^~/, '')         // 남은 ~ 제거
    .replace(/~$/, '')         // 끝 ~ 제거
    .replace(/\?$/, '')        // 물음표 제거
    .trim()

  const terms: string[] = []

  // /A/B 형식 처리 (예: ~아/어야, ~었어/았어)
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/')
    // 첫 번째 옵션
    terms.push(parts[0].trim())
    // 두 번째 옵션
    if (parts[1]) terms.push(parts[1].trim())
    // 공통 뒷부분
    const lastPart = parts[parts.length - 1]
    const lastWords = lastPart.trim().split(/\s+/).slice(-2).join(' ')
    if (lastWords.length >= 3) terms.push(lastWords)
  } else {
    terms.push(cleaned)
    // 마지막 2~3 어절로 검색
    const words = cleaned.split(/\s+/)
    if (words.length >= 3) {
      terms.push(words.slice(-2).join(' '))
    }
    if (words.length >= 2) {
      terms.push(words.slice(-1).join(' '))
    }
  }

  return terms.filter(t => t.length >= 2)
}

// ── 4. 에피소드 섹션에서 근거 대사 찾기 ─────────────────────────────────────
function findSourceDialogues(epSection: string, pattern: string): string[] {
  const terms = getSearchTerms(pattern)
  const found: string[] = []

  // 대사 라인 추출 (- "대사" 또는 **대사** 형식)
  const dialogueLines: string[] = []
  for (const line of epSection.split('\n')) {
    // > "대사" 형식
    const q1 = line.match(/[>-]\s+"([^"]+)"/)
    if (q1) { dialogueLines.push(q1[1]); continue }
    // - **에마**: 대사 형식
    const q2 = line.match(/[•\-]\s+\*\*[^:*]+\*\*[:：]\s+"?([^"]+)"?$/)
    if (q2) { dialogueLines.push(q2[1].trim()); continue }
    // 대사 블록 - 따옴표 없는 일반 텍스트 라인 (순수 대사)
    // 패턴 섹션이 아닌 대사 섹션에서만 수집
    if (line.startsWith('-') && !line.includes('**') && !line.includes('Focus') && !line.includes('Exposure')) {
      const plain = line.replace(/^-+\s*/, '').trim()
      if (plain.length > 2 && /[가-힣]/.test(plain)) dialogueLines.push(plain)
    }
  }

  // 각 검색어로 대사 검색
  for (const term of terms) {
    for (const dl of dialogueLines) {
      if (dl.includes(term) && !found.includes(dl)) {
        found.push(dl)
        if (found.length >= 2) break
      }
    }
    if (found.length >= 2) break
  }

  return found
}

// 대안: 원시 텍스트에서 대사 찾기
function findDialoguesRaw(epSection: string, pattern: string): string[] {
  const terms = getSearchTerms(pattern)
  const found: string[] = []

  const lines = epSection.split('\n')
  for (const line of lines) {
    // 한글이 있는 줄에서 패턴 키워드 검색
    if (!/[가-힣]/.test(line)) continue
    // Focus/Exposure Pattern 라인 제외
    if (line.includes('Focus Pattern') || line.includes('Exposure Pattern')) continue
    // 마크다운 메타 제외
    if (line.startsWith('#') || line.startsWith('|') || line.startsWith('장소') || line.startsWith('등장')) continue

    const koText = line
      .replace(/\*\*/g, '')
      .replace(/\*[가-힣\w]+\*[:：]\s*/g, '') // *에마*: 제거
      .replace(/^[-•]\s*/, '')
      .replace(/`/g, '')
      .trim()

    if (koText.length < 4) continue

    for (const term of terms) {
      if (koText.includes(term) && !found.includes(koText)) {
        found.push(koText)
        break
      }
    }
    if (found.length >= 2) break
  }
  return found
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  // 파일 읽기
  if (!fs.existsSync(AUDIT_FILE))  { console.error('감사 파일 없음:', AUDIT_FILE);  process.exit(1) }
  if (!fs.existsSync(SCRIPT_FILE)) { console.error('스크립트 없음:', SCRIPT_FILE); process.exit(1) }

  const auditContent  = fs.readFileSync(AUDIT_FILE, 'utf-8')
  const scriptContent = fs.readFileSync(SCRIPT_FILE, 'utf-8')

  // ── 누락 패턴 추출 ─────────────────────────────────────────────────────────
  const missing = parseMissingFromAudit(auditContent)
  console.log(`감사 파일에서 누락 패턴 추출: ${missing.length}개`)

  // ── 스크립트 섹션 파싱 ──────────────────────────────────────────────────────
  const scriptSections = parseScriptSections(scriptContent)
  console.log(`스크립트 에피소드 섹션: ${scriptSections.size}개`)

  // ── DB 현재 패턴 목록 (중복 체크용) ──────────────────────────────────────
  const { data: dbExprs, error: dbErr } = await sb
    .from('kp_expressions')
    .select('id, korean')
  if (dbErr) { console.error('DB 조회 실패:', dbErr.message); process.exit(1) }
  const dbKoreanMap = new Map<string, number>()
  for (const e of dbExprs ?? []) {
    dbKoreanMap.set(e.korean as string, e.id as number)
  }
  console.log(`DB kp_expressions: ${dbKoreanMap.size}건 로드`)

  // ── 결과 생성 ─────────────────────────────────────────────────────────────
  interface OutputRow {
    episode: number
    pattern_ko: string
    source_dialogues: string[]
    literal_en: string
    usage_en: string
    examples: never[]
    possible_existing_db_id?: number
    status?: string
  }

  const outputRows: OutputRow[] = []
  let noDialogueCount = 0
  let possibleExistingCount = 0
  const seenPatterns = new Set<string>()
  let duplicateInFileCount = 0

  for (const { ep, pattern_ko } of missing) {
    // 파일 내 중복 체크
    if (seenPatterns.has(pattern_ko)) {
      duplicateInFileCount++
      console.warn(`  [중복] EP${ep} "${pattern_ko}"`)
      continue
    }
    seenPatterns.add(pattern_ko)

    // 에피소드 섹션에서 근거 대사 찾기
    const epSection = scriptSections.get(ep) ?? ''
    let dialogues = findSourceDialogues(epSection, pattern_ko)
    if (dialogues.length === 0) {
      dialogues = findDialoguesRaw(epSection, pattern_ko)
    }
    if (dialogues.length === 0) noDialogueCount++

    // DB 동일 패턴 체크 (exact)
    const existingId = dbKoreanMap.get(pattern_ko)

    const row: OutputRow = {
      episode: ep,
      pattern_ko,
      source_dialogues: dialogues,
      literal_en: '',
      usage_en: '',
      examples: [],
    }

    if (existingId != null) {
      row.possible_existing_db_id = existingId
      row.status = 'possible_existing_match'
      possibleExistingCount++
    }

    outputRows.push(row)
  }

  // 에피소드 오름차순 정렬
  outputRows.sort((a, b) => a.episode - b.episode)

  // ── 검증 ────────────────────────────────────────────────────────────────
  console.log('\n[ 검증 ]')
  console.log(`  추출 수: ${outputRows.length}개 (목표: 54)`)
  console.log(`  파일 내 중복: ${duplicateInFileCount}개`)
  console.log(`  DB 동일 패턴 발견: ${possibleExistingCount}개`)
  console.log(`  근거 대사 없음: ${noDialogueCount}개`)
  console.log(`  대표 에피소드 없음: ${outputRows.filter(r => r.episode === 0).length}개`)

  if (outputRows.length !== 54) {
    console.warn(`⚠️  추출 수(${outputRows.length})가 54개와 다릅니다 — 감사 파일 재확인 필요`)
  }

  // ── JSON 저장 ────────────────────────────────────────────────────────────
  fs.writeFileSync(OUT_FILE, JSON.stringify(outputRows, null, 2), 'utf-8')
  console.log(`\n저장 완료: ${OUT_FILE}`)

  // ── 터미널 목록 ──────────────────────────────────────────────────────────
  console.log('\n[ 추출된 누락 패턴 목록 ]')
  for (const r of outputRows) {
    const diagStr = r.source_dialogues.length > 0 ? `"${r.source_dialogues[0]}"` : '(대사 없음)'
    const existFlag = r.status === 'possible_existing_match' ? ` ⚠️ DB id=${r.possible_existing_db_id}` : ''
    console.log(`  EP${String(r.episode).padStart(2, '0')}  ${r.pattern_ko.padEnd(28)}  ${diagStr}${existFlag}`)
  }
}

main().catch(console.error)
