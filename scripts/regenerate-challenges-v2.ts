/**
 * kp_challenges 전면 재생성 v2
 *
 * 규칙:
 *  - EP001~EP100 각 정확히 15문제 (3세트 × 5문제)
 *  - 세트 내 순서: translation, translation, fill_blank, fill_blank, word_order
 *  - 소스: kp_expressions.examples (Pattern Popup 예문) 전용, AI 생성 금지
 *  - DB 수정 없이 export만 수행
 *
 * 출력: ~/Downloads/kpatto_challenges_v2_export.json
 * 실행: npx tsx scripts/regenerate-challenges-v2.ts
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

const OUT_FILE = path.join(os.homedir(), 'Downloads', 'kpatto_challenges_v2_export.json')
const CHALLENGE_TYPES = ['translation', 'translation', 'fill_blank', 'fill_blank', 'word_order'] as const
type ChallengeType = typeof CHALLENGE_TYPES[number]

interface KoEn { ko: string; en: string }
interface FocusPattern { id: number; korean: string; english: string; description: string; examples: KoEn[] }

interface ChallengeRecord {
  episode: number
  challenge_id: string
  pattern: string
  challenge_type: ChallengeType
  question: string
  choices: string[] | null
  answer: string
  explanation: string
  source_dialogue: { type: string; ko?: string; en?: string } | null
  difficulty: string
}

// ── 유틸: seeded random ────────────────────────────────────────────────────
function makeRng(seed: number) {
  let s = (seed >>> 0) || 1
  return () => {
    s = Math.imul(1664525, s) + 1013904223
    return (s >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  const rng = makeRng(seed)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── 유틸: 패턴에서 fill_blank 검색어 추출 ──────────────────────────────────
function getPatternSuffixes(korean: string): string[] {
  // ~ 제거
  let core = korean.replace(/^~+/, '').trim()

  const results: string[] = []

  // (으)ㄹ 처리: ~(으)ㄹ 줄 몰랐어요
  if (core.includes('(으)')) {
    results.push(core.replace(/\(으\)/g, '을').trim())
    results.push(core.replace(/\(으\)/g, 'ㄹ').trim())
    results.push(core.replace(/\(으\)\S*/g, '').trim())
  }

  // A/B 처리: ~아/어야겠다 → 아야겠다, 어야겠다, 야겠다
  if (core.includes('/')) {
    const parts = core.split('/')
    parts.forEach(p => { if (p.trim()) results.push(p.trim()) })
    // 마지막 variant의 공통 부분 (뒷쪽 단어들)
    const last = parts[parts.length - 1].trim()
    const words = last.split(/\s+/)
    if (words.length >= 2) results.push(words.slice(1).join(' ').trim())
  }

  // 이/가 같은 optional particle 제거
  const cleaned = core.replace(/\(이\/가\)/g, '').replace(/\(은\/는\)/g, '').replace(/\(을\/를\)/g, '').trim()
  if (cleaned) results.push(cleaned)

  if (results.length === 0) results.push(core)

  // 유효한 suffix만 (2자 이상)
  return [...new Set(results)].filter(s => s.length >= 2)
}

// ── fill_blank 생성: 문장에서 패턴 부분을 ___ 로 치환 ─────────────────────
function createFillBlank(sentence: string, patternKorean: string): { question: string; answer: string } {
  const suffixes = getPatternSuffixes(patternKorean)

  // 1. 가장 긴 suffix부터 우선 시도 (더 구체적)
  const sorted = [...suffixes].sort((a, b) => b.length - a.length)

  for (const suffix of sorted) {
    const idx = sentence.lastIndexOf(suffix)
    if (idx > 0) { // 앞에 context가 있어야 함
      return {
        question: sentence.substring(0, idx) + '___',
        answer: sentence.substring(idx),
      }
    }
  }

  // 2. 마지막 공백 기준으로 뒷부분 blanking (fallback)
  const lastSpace = sentence.lastIndexOf(' ')
  if (lastSpace > 0) {
    return {
      question: sentence.substring(0, lastSpace + 1) + '___',
      answer: sentence.substring(lastSpace + 1),
    }
  }

  // 3. 최후 fallback: 전체 blank
  return { question: '___', answer: sentence }
}

// ── word_order 토큰 분리 ───────────────────────────────────────────────────
function splitTokens(sentence: string): string[] {
  // 마침표/물음표 제거 후 공백 분리
  const words = sentence.replace(/[.?!。]+$/, '').split(/\s+/).filter(w => w.length > 0)

  if (words.length <= 5) return words

  // 긴 문장: 3~4 청크로 묶기
  const chunkSize = Math.ceil(words.length / 3)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, Math.min(i + chunkSize, words.length)).join(' '))
  }
  return chunks
}

// ── distractor 선택 ────────────────────────────────────────────────────────
function pickDistractors(pool: string[], answer: string, count: number, seed: number): string[] {
  const targetLen = answer.length
  const candidates = pool
    .filter(s => s !== answer && s.trim().length > 0)
    .sort((a, b) => Math.abs(a.length - targetLen) - Math.abs(b.length - targetLen))

  // 중복 제거 후 상위 N개에서 seed 기반 무작위 선택
  const unique = [...new Set(candidates)]
  const pool2 = unique.slice(0, Math.max(count * 4, 12))
  const shuffled = shuffle(pool2, seed)
  return shuffled.slice(0, count)
}

// ── 단일 문제 생성 ─────────────────────────────────────────────────────────
function buildChallenge(
  episodeNum: number,
  orderNum: number,
  pattern: FocusPattern,
  example: KoEn,
  type: ChallengeType,
  translationPool: string[],  // 오답 후보 (Korean 문장들)
  fillBlankPool: string[],    // fill_blank 오답 후보 (pattern endings)
  seed: number,
): ChallengeRecord | null {
  const epStr = String(episodeNum).padStart(3, '0')
  const ordStr = String(orderNum).padStart(4, '0')
  const challenge_id = `EP${epStr}-C${ordStr}`

  const sourceObj = { type: 'pattern_example', ko: example.ko, en: example.en }

  if (type === 'translation') {
    const question = example.en
    const answer = example.ko
    const distractors = pickDistractors(translationPool, answer, 3, seed)
    if (distractors.length < 3) return null
    const choices = shuffle([answer, ...distractors], seed + 1)

    return {
      episode: episodeNum,
      challenge_id,
      pattern: pattern.korean,
      challenge_type: 'translation',
      question,
      choices,
      answer,
      explanation: `${pattern.korean} is used to ${pattern.description.split('.')[0].toLowerCase().replace(/^used to /, '')}.`,
      source_dialogue: sourceObj,
      difficulty: 'easy',
    }
  }

  if (type === 'fill_blank') {
    const { question, answer } = createFillBlank(example.ko, pattern.korean)
    if (!answer || answer === example.ko) return null // blank 생성 실패

    const distractors = pickDistractors(
      fillBlankPool.filter(s => s !== answer),
      answer, 3, seed
    )
    if (distractors.length < 3) return null
    const choices = shuffle([answer, ...distractors], seed + 1)

    return {
      episode: episodeNum,
      challenge_id,
      pattern: pattern.korean,
      challenge_type: 'fill_blank',
      question,
      choices,
      answer,
      explanation: `Fill in with the pattern ${pattern.korean}.`,
      source_dialogue: sourceObj,
      difficulty: example.ko.length > 12 ? 'medium' : 'easy',
    }
  }

  if (type === 'word_order') {
    const answer = example.ko
    const tokens = splitTokens(answer)
    if (tokens.length < 2) return null
    const choices = shuffle(tokens, seed)

    return {
      episode: episodeNum,
      challenge_id,
      pattern: pattern.korean,
      challenge_type: 'word_order',
      question: example.en,
      choices,
      answer,
      explanation: `Arrange the words to form: "${answer}"`,
      source_dialogue: sourceObj,
      difficulty: 'medium',
    }
  }

  return null
}

// ── 에피소드별 15문제 생성 ─────────────────────────────────────────────────
function generateEpisodeChallenges(
  episodeNum: number,
  patterns: FocusPattern[],
  translationPool: string[],
  fillBlankPool: string[],
): ChallengeRecord[] {
  const N = patterns.length
  // (patternIdx, type) 조합별로 독립 카운터 → 같은 type에서 예문 반복 방지
  const perPatternTypeCounter: Record<string, number> = {}
  const challenges: ChallengeRecord[] = []
  const baseSeed = episodeNum * 1000

  let orderNum = 1

  for (let set = 0; set < 3; set++) {
    for (let qInSet = 0; qInSet < 5; qInSet++) {
      const patternIdx = (set + qInSet) % N
      const pattern = patterns[patternIdx]
      const type = CHALLENGE_TYPES[qInSet]

      // type별 독립 카운터로 예문 선택
      const key = `${patternIdx}:${type}`
      const cnt = perPatternTypeCounter[key] ?? 0
      const example = pattern.examples[cnt % pattern.examples.length]
      perPatternTypeCounter[key] = cnt + 1

      const seed = baseSeed + set * 10 + qInSet
      const ch = buildChallenge(
        episodeNum, orderNum, pattern, example, type,
        translationPool, fillBlankPool, seed
      )

      if (ch) {
        challenges.push(ch)
        orderNum++
      } else {
        // fallback: 다음 예문으로 재시도
        const fallbackEx = pattern.examples[(cnt + 1) % pattern.examples.length]
        const ch2 = buildChallenge(
          episodeNum, orderNum, pattern, fallbackEx, type,
          translationPool, fillBlankPool, seed + 500
        )
        if (ch2) { challenges.push(ch2); orderNum++ }
        else {
          console.warn(`  EP${episodeNum} set${set} q${qInSet} (${type}) 생성 실패: ${pattern.korean} / ${example.ko}`)
        }
      }
    }
  }

  return challenges
}

// ── 검증 ──────────────────────────────────────────────────────────────────
interface ValidationError { episode: number; challenge_id: string; issue: string }

function validateChallenges(all: ChallengeRecord[]): ValidationError[] {
  const errors: ValidationError[] = []
  const byEp = new Map<number, ChallengeRecord[]>()

  for (const c of all) {
    if (!byEp.has(c.episode)) byEp.set(c.episode, [])
    byEp.get(c.episode)!.push(c)
  }

  // EP001~EP100 존재 여부
  for (let ep = 1; ep <= 100; ep++) {
    if (!byEp.has(ep)) {
      errors.push({ episode: ep, challenge_id: '', issue: 'EP 전체 없음' })
    }
  }

  const expectedTypeSeq = ['translation','translation','fill_blank','fill_blank','word_order',
    'translation','translation','fill_blank','fill_blank','word_order',
    'translation','translation','fill_blank','fill_blank','word_order']

  for (const [ep, challenges] of byEp.entries()) {
    // 15문제 수
    if (challenges.length !== 15) {
      errors.push({ episode: ep, challenge_id: '', issue: `문제 수 ${challenges.length} (≠15)` })
    }

    // 유형 순서
    for (let i = 0; i < Math.min(challenges.length, 15); i++) {
      if (challenges[i].challenge_type !== expectedTypeSeq[i]) {
        errors.push({
          episode: ep,
          challenge_id: challenges[i].challenge_id,
          issue: `유형 순서 오류: 위치${i} 기대=${expectedTypeSeq[i]} 실제=${challenges[i].challenge_type}`,
        })
      }
    }

    for (const c of challenges) {
      // choices 개수
      if (c.challenge_type === 'translation' || c.challenge_type === 'fill_blank') {
        if (!c.choices || c.choices.length !== 4) {
          errors.push({ episode: ep, challenge_id: c.challenge_id, issue: `choices ${c.choices?.length ?? 0} (≠4)` })
        }
        // 정답이 choices에 정확히 1회
        const cnt = (c.choices ?? []).filter(ch => ch === c.answer).length
        if (cnt !== 1) {
          errors.push({ episode: ep, challenge_id: c.challenge_id, issue: `정답이 choices에 ${cnt}회 (≠1)` })
        }
      }
      if (c.challenge_type === 'word_order') {
        if (!c.choices || c.choices.length < 2) {
          errors.push({ episode: ep, challenge_id: c.challenge_id, issue: `word_order choices 부족 (${c.choices?.length})` })
        }
        // 토큰의 글자 집합 = answer 글자 집합 (순서·구두점 무관)
        if (c.choices) {
          const choiceChars = c.choices.join('').replace(/[.?!。\s]+/g, '').split('').sort().join('')
          const answerChars = c.answer.replace(/[.?!。\s]+/g, '').split('').sort().join('')
          if (choiceChars !== answerChars) {
            errors.push({ episode: ep, challenge_id: c.challenge_id, issue: `word_order 토큰 불일치: choices="${c.choices.join('|')}" answer="${c.answer}"` })
          }
        }
      }
      // explanation / source_dialogue 없음
      if (!c.explanation) {
        errors.push({ episode: ep, challenge_id: c.challenge_id, issue: 'explanation 없음' })
      }
      if (!c.source_dialogue) {
        errors.push({ episode: ep, challenge_id: c.challenge_id, issue: 'source_dialogue 없음' })
      }
      if (!c.difficulty) {
        errors.push({ episode: ep, challenge_id: c.challenge_id, issue: 'difficulty 없음' })
      }
    }
  }

  // 중복 문제 (episode+question 동일)
  const seen = new Set<string>()
  for (const c of all) {
    const key = `${c.episode}::${c.question}::${c.challenge_type}`
    if (seen.has(key)) {
      errors.push({ episode: c.episode, challenge_id: c.challenge_id, issue: `중복 문제: ${c.question}` })
    }
    seen.add(key)
  }

  return errors
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('── K-PATTO 챌린지 v2 재생성 시작 ──\n')

  // 1. 에피소드 맵
  const { data: epRows } = await sb.from('kp_episodes').select('id, episode_num').order('episode_num')
  const epNumToId = new Map((epRows ?? []).map((e: any) => [e.episode_num as number, e.id as number]))
  console.log(`에피소드: ${epNumToId.size}개 로드`)

  // 2. focus 표현식 연결 (episode_id → expression_ids)
  const { data: focusLinks } = await sb
    .from('kp_dialogue_expressions')
    .select('expression_id, kp_dialogues!inner(episode_id)')
    .eq('role', 'focus')

  // episode_id → Set<expression_id>
  const epExprMap = new Map<number, Set<number>>()
  for (const link of (focusLinks ?? []) as any[]) {
    const epId = link.kp_dialogues.episode_id
    if (!epExprMap.has(epId)) epExprMap.set(epId, new Set())
    epExprMap.get(epId)!.add(link.expression_id)
  }
  console.log(`focus 연결: ${focusLinks?.length ?? 0}건`)

  // 3. 모든 expressions 조회
  const { data: exprRows } = await sb
    .from('kp_expressions')
    .select('id, korean, english, description, examples')

  const exprById = new Map<number, FocusPattern>()
  for (const e of (exprRows ?? []) as any[]) {
    if (e.examples && Array.isArray(e.examples) && e.examples.length > 0) {
      exprById.set(e.id, {
        id: e.id,
        korean: e.korean,
        english: e.english ?? '',
        description: e.description ?? '',
        examples: e.examples,
      })
    }
  }
  console.log(`expressions: ${exprById.size}개 (예문 있는 것)\n`)

  // 4. 전역 distractor pool 구성
  const allKoExamples: string[] = []
  const allFillBlankAnswers: string[] = []

  for (const expr of exprById.values()) {
    for (const ex of expr.examples) {
      if (ex.ko) allKoExamples.push(ex.ko)
    }
    // fill_blank 오답 후보: 패턴 suffix
    const suffixes = getPatternSuffixes(expr.korean)
    allFillBlankAnswers.push(...suffixes)
    // 예문의 마지막 단어도 후보로 추가
    for (const ex of expr.examples) {
      if (ex.ko) {
        const lastWord = ex.ko.replace(/[.?!。]+$/, '').split(/\s+/).pop()
        if (lastWord && lastWord.length >= 2) allFillBlankAnswers.push(lastWord)
      }
    }
  }
  const uniqueFillPool = [...new Set(allFillBlankAnswers)]
  console.log(`Translation 오답 pool: ${allKoExamples.length}개`)
  console.log(`Fill_blank 오답 pool: ${uniqueFillPool.length}개\n`)

  // 5. 에피소드별 challenge 생성
  const allChallenges: ChallengeRecord[] = []
  let totalNoPatternEps = 0

  for (let epNum = 1; epNum <= 100; epNum++) {
    const epId = epNumToId.get(epNum)
    if (!epId) {
      console.warn(`⚠️  EP${epNum}: kp_episodes에 없음`)
      continue
    }

    const exprIds = epExprMap.get(epId)
    if (!exprIds || exprIds.size === 0) {
      console.warn(`⚠️  EP${epNum}: focus pattern 없음`)
      totalNoPatternEps++
      continue
    }

    // 패턴을 expression_id 오름차순으로 정렬
    const patterns: FocusPattern[] = []
    for (const exId of [...exprIds].sort((a, b) => a - b)) {
      const expr = exprById.get(exId)
      if (expr) patterns.push(expr)
    }

    if (patterns.length === 0) {
      console.warn(`⚠️  EP${epNum}: 유효한 예문이 있는 패턴 없음`)
      totalNoPatternEps++
      continue
    }

    const challenges = generateEpisodeChallenges(epNum, patterns, allKoExamples, uniqueFillPool)

    const epStr = String(epNum).padStart(3, '0')
    console.log(`EP${epStr}: ${challenges.length}문제 (패턴 ${patterns.length}개: ${patterns.map(p => p.korean).join(', ')})`)
    allChallenges.push(...challenges)
  }

  console.log(`\n총 생성: ${allChallenges.length}문제`)

  // 6. 검증
  console.log('\n── 검증 시작 ──')
  const errors = validateChallenges(allChallenges)
  if (errors.length === 0) {
    console.log('✅ 모든 검증 통과')
  } else {
    console.log(`⚠️  검증 오류 ${errors.length}건:`)
    for (const e of errors.slice(0, 30)) {
      console.log(`  EP${String(e.episode).padStart(3,'0')} [${e.challenge_id || '-'}]: ${e.issue}`)
    }
    if (errors.length > 30) console.log(`  ... 외 ${errors.length - 30}건`)
  }

  // 7. 통계
  const byType: Record<string, number> = {}
  for (const c of allChallenges) {
    byType[c.challenge_type] = (byType[c.challenge_type] ?? 0) + 1
  }
  const byDiff: Record<string, number> = {}
  for (const c of allChallenges) {
    byDiff[c.difficulty] = (byDiff[c.difficulty] ?? 0) + 1
  }
  const epCount = new Set(allChallenges.map(c => c.episode)).size

  console.log('\n── 통계 ──')
  console.log(`  총 문제: ${allChallenges.length} (목표: 1500)`)
  console.log(`  에피소드 수: ${epCount}/100`)
  console.log(`  패턴 없는 EP: ${totalNoPatternEps}개`)
  console.log(`  유형 분포:`, byType)
  console.log(`  난이도 분포:`, byDiff)
  console.log(`  explanation 있음: ${allChallenges.filter(c => c.explanation).length}/${allChallenges.length}`)
  console.log(`  source_dialogue 있음: ${allChallenges.filter(c => c.source_dialogue).length}/${allChallenges.length}`)

  // 8. export
  const exportData = {
    generated_at: new Date().toISOString(),
    total: allChallenges.length,
    episodes_covered: epCount,
    validation_errors: errors.length,
    challenges: allChallenges,
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(exportData, null, 2), 'utf-8')
  console.log(`\n✅ 저장 완료: ${OUT_FILE}`)
  console.log(`   (${allChallenges.length}건 / ${Math.round(JSON.stringify(exportData).length / 1024)}KB)`)

  if (errors.length > 0) {
    const errFile = path.join(os.homedir(), 'Downloads', 'kpatto_challenges_v2_errors.json')
    fs.writeFileSync(errFile, JSON.stringify(errors, null, 2), 'utf-8')
    console.log(`   오류 목록: ${errFile}`)
  }
}

main().catch(console.error)
