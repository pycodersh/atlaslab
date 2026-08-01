/**
 * kp_challenges 전체 export
 * 출력: kpatto_challenges_export.json (Downloads)
 *
 * 포함: episode, challenge_id, pattern, challenge_type, question, choices,
 *        answer, explanation, source_dialogue, difficulty
 *
 * 실행: npx tsx scripts/export-kpatto-challenges.ts
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

const OUT_FILE = path.join(os.homedir(), 'Downloads', 'kpatto_challenges_export.json')
const PAGE = 500

async function fetchAll<T>(table: string, columns: string): Promise<T[]> {
  const result: T[] = []
  let from = 0
  while (true) {
    const { data, error } = await sb.from(table).select(columns).order('id').range(from, from + PAGE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    if (!data || data.length === 0) break
    result.push(...(data as T[]))
    if (data.length < PAGE) break
    from += PAGE
  }
  return result
}

interface ChallengeRow {
  id: number
  episode_id: number
  challenge_type: string | null
  question: Record<string, string> | string | null
  options: string[] | null
  answer: string | null
  word_pieces: string[] | null
  order_num: number | null
  [key: string]: unknown
}

interface EpisodeRow { id: number; episode_num: number }
interface ExpressionRow { id: number; korean: string; examples: Array<{ ko: string; en: string }> | null }
interface FocusLink { expression_id: number; kp_dialogues: { episode_id: number; text_ko: string } }

function getPrompt(q: ChallengeRow['question']): string {
  if (!q) return ''
  if (typeof q === 'string') return q
  return q.prompt ?? q.text ?? JSON.stringify(q)
}

function getField(q: ChallengeRow['question'], field: string): string | null {
  if (!q || typeof q === 'string') return null
  return (q as Record<string, string>)[field] ?? null
}

async function main() {
  console.log('데이터 로드 중...')

  const [challenges, episodes] = await Promise.all([
    fetchAll<ChallengeRow>('kp_challenges', '*'),
    fetchAll<EpisodeRow>('kp_episodes', 'id, episode_num'),
  ])
  console.log(`  kp_challenges: ${challenges.length}건`)
  console.log(`  kp_episodes:   ${episodes.length}건`)

  // episode_id → episode_num 맵
  const epNumMap = new Map<number, number>()
  for (const e of episodes) epNumMap.set(e.id, e.episode_num)

  // focus expressions: episode_id → expressions[]
  // expression을 통해 pattern 파생 시도
  const { data: focusLinks } = await sb
    .from('kp_dialogue_expressions')
    .select('expression_id, kp_dialogues!inner(episode_id, text_ko)')
    .eq('role', 'focus')
  const { data: expressions } = await sb
    .from('kp_expressions')
    .select('id, korean, examples')

  // expression_id → korean 맵
  const exprMap = new Map<number, ExpressionRow>()
  for (const e of (expressions ?? [])) exprMap.set(e.id, e as ExpressionRow)

  // episode_id → Set<expression.korean>
  const epPatternMap = new Map<number, string[]>()
  for (const link of (focusLinks ?? []) as unknown as FocusLink[]) {
    const epId = link.kp_dialogues.episode_id
    const expr = exprMap.get(link.expression_id)
    if (!expr) continue
    if (!epPatternMap.has(epId)) epPatternMap.set(epId, [])
    const list = epPatternMap.get(epId)!
    if (!list.includes(expr.korean)) list.push(expr.korean)
  }

  // answer → Set<expression.korean>: translation에서 pattern 파생
  // answer(ko)가 examples 중 하나인 expression 역탐색
  const answerToPattern = new Map<string, string>()
  for (const expr of (expressions ?? [])) {
    for (const ex of (expr.examples ?? [])) {
      if (ex?.ko) answerToPattern.set(ex.ko, expr.korean)
    }
  }

  // ── export 변환 ──────────────────────────────────────────────────────────
  const output = challenges.map((c, i) => {
    const epNum = epNumMap.get(c.episode_id) ?? null
    const prompt = getPrompt(c.question)

    // challenge_id: EP001-C0001 형식
    const epStr = String(epNum ?? 0).padStart(3, '0')
    const ordStr = String(c.order_num ?? i + 1).padStart(4, '0')
    const challenge_id = `EP${epStr}-C${ordStr}`

    // pattern: answer 기반 역탐색 (translation) 우선, 없으면 episode의 focus 패턴 목록
    let pattern: string | null = null
    if (c.answer && answerToPattern.has(c.answer)) {
      pattern = answerToPattern.get(c.answer) ?? null
    }
    if (!pattern && epNum !== null) {
      const patterns = epPatternMap.get(c.episode_id)
      pattern = patterns ? (patterns[0] ?? null) : null
    }

    // question: 직접 저장된 추가 필드 시도
    const explanation = getField(c.question, 'explanation') ?? getField(c.question, 'hint_en') ?? null
    const source_dialogue = getField(c.question, 'source_dialogue') ?? getField(c.question, 'source') ?? null

    // difficulty: DB 컬럼에 직접 있으면 사용, 없으면 null
    const difficulty = (c as any).difficulty ?? null

    // choices (= options)
    const choices = c.options ?? null

    return {
      episode: epNum,
      challenge_id,
      pattern,
      challenge_type: c.challenge_type ?? null,
      question: prompt || null,
      choices,
      answer: c.answer ?? null,
      explanation,
      source_dialogue,
      difficulty,
    }
  })

  // 에피소드 번호 오름차순 → challenge_id 오름차순 정렬
  output.sort((a, b) => {
    const ea = a.episode ?? 9999
    const eb = b.episode ?? 9999
    if (ea !== eb) return ea - eb
    return a.challenge_id.localeCompare(b.challenge_id)
  })

  // ── 통계 ──────────────────────────────────────────────────────────────────
  const byType: Record<string, number> = {}
  for (const r of output) {
    const t = r.challenge_type ?? 'null'
    byType[t] = (byType[t] ?? 0) + 1
  }

  const epCoverage = new Set(output.map(r => r.episode)).size
  const withPattern = output.filter(r => r.pattern !== null).length
  const withExpl    = output.filter(r => r.explanation !== null).length
  const withSrc     = output.filter(r => r.source_dialogue !== null).length
  const withDiff    = output.filter(r => r.difficulty !== null).length

  console.log('\n[ 통계 ]')
  console.log(`  총 챌린지: ${output.length}건`)
  console.log(`  에피소드 커버리지: ${epCoverage}개`)
  console.log(`  challenge_type 분포:`)
  for (const [t, n] of Object.entries(byType).sort()) console.log(`    ${t}: ${n}건`)
  console.log(`  pattern 채움: ${withPattern}/${output.length}`)
  console.log(`  explanation:  ${withExpl}/${output.length}`)
  console.log(`  source_dialogue: ${withSrc}/${output.length}`)
  console.log(`  difficulty:   ${withDiff}/${output.length}`)

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`\n✅ 저장 완료: ${OUT_FILE}`)
  console.log(`   (${output.length}건 / ${Math.round(JSON.stringify(output).length / 1024)}KB)`)
}

main().catch(console.error)
