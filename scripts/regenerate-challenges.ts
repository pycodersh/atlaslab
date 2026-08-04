/**
 * kp_challenges 전체 삭제 후 규칙 기반 재생성
 *
 * 소스:
 *   translation : kp_expressions.examples[].en → ko
 *   fill_blank  : kp_dialogues.text_ko에서 matched_text를 ___로
 *   word_order  : kp_dialogues.text_ko를 단어 단위로 분리
 *
 * 실행  : npx tsx scripts/regenerate-challenges.ts
 * 적용  : npx tsx scripts/regenerate-challenges.ts --apply
 */
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────

/** matched_text를 ___ 으로 교체 (첫 번째 등장만) */
function makeBlank(text: string, matched: string): string {
  return text.replace(matched, '___')
}

/** 배열에서 n개 랜덤 샘플 */
function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr].sort(() => Math.random() - 0.5)
  return copy.slice(0, n)
}

/** 정답 + 오답 3개로 4지선다 옵션 생성 */
function makeOptions(answer: string, pool: string[]): string[] {
  const wrongs = sample(pool.filter(x => x !== answer), 3)
  const opts = [answer, ...wrongs].sort(() => Math.random() - 0.5)
  return opts
}

/**
 * 표현식 패턴에서 핵심 빈칸 대상 추출
 * "~주세요" → "주세요",  "~어떻게 가요?" → "가요",  "신기해요" → "신기해요"
 */
function extractCorePattern(korean: string): string {
  const clean = korean.replace(/[?!]/g, '').trim()
  const words = clean.split(/\s+/).filter(Boolean)
  const last = (words[words.length - 1] ?? clean).replace(/^~/g, '')
  return last || clean.replace(/^~/g, '')
}

// ─── 메인 ──────────────────────────────────────────────────────────────────

type Challenge = {
  episode_id: number
  challenge_type: 'translation' | 'fill_blank' | 'word_order'
  question: Record<string, string>
  options: string[] | null
  answer: string
  word_pieces: string[] | null
  order_num: number
}

async function main() {
  // ── 1. 소스 데이터 로드 ──────────────────────────────────────────────────

  // kp_dialogue_expressions (focus) + kp_dialogues + kp_expressions
  const { data: focusRaw } = await sb
    .from('kp_dialogue_expressions')
    .select(`
      dialogue_id,
      matched_text,
      expression_id,
      kp_dialogues!inner(id, episode_id, text_ko, text_en),
      kp_expressions!inner(id, korean, english, examples)
    `)
    .eq('role', 'focus')

  if (!focusRaw?.length) { console.error('kp_dialogue_expressions 없음'); process.exit(1) }

  // 타입 정리
  type FocusRow = {
    dialogue_id: number
    matched_text: string
    expression_id: number
    kp_dialogues: { id: number; episode_id: number; text_ko: string; text_en: string | null }
    kp_expressions: { id: number; korean: string; english: string | null; examples: { ko: string; en: string }[] | null }
  }
  const focusRows = focusRaw as unknown as FocusRow[]

  // ── 2. 오답 풀 준비 ─────────────────────────────────────────────────────

  // translation 오답 풀: 모든 expressions.examples.ko
  const translationAnswerPool: string[] = []
  for (const row of focusRows) {
    for (const ex of (row.kp_expressions.examples ?? [])) {
      if (ex.ko) translationAnswerPool.push(ex.ko)
    }
  }
  // 중복 제거
  const translationPool = [...new Set(translationAnswerPool)]

  // fill_blank 오답 풀: 모든 matched_text
  const fillBlankPool = [...new Set(focusRows.map(r => r.matched_text))]

  // ── 3. 챌린지 생성 ──────────────────────────────────────────────────────

  const challenges: Challenge[] = []
  let orderCounter: Record<number, number> = {}

  function nextOrder(epId: number): number {
    orderCounter[epId] = (orderCounter[epId] ?? 0) + 1
    return orderCounter[epId]
  }

  for (const row of focusRows) {
    const { episode_id, text_ko } = row.kp_dialogues
    const matched = row.matched_text
    const examples = row.kp_expressions.examples ?? []

    // ── fill_blank: 대화 텍스트 기반 (matched가 일부인 경우만) ──
    if (matched && text_ko.includes(matched) && matched.length < text_ko.length) {
      const q = makeBlank(text_ko, matched)
      const opts = makeOptions(matched, fillBlankPool)
      challenges.push({
        episode_id,
        challenge_type: 'fill_blank',
        question: { prompt: q },
        options: opts,
        answer: matched,
        word_pieces: null,
        order_num: nextOrder(episode_id),
      })
    }

    // ── fill_blank: examples 기반 (expression의 핵심 패턴을 빈칸으로) ──
    const corePattern = extractCorePattern(row.kp_expressions.korean)
    if (corePattern) {
      for (const ex of examples) {
        if (!ex.ko || !ex.en) continue
        if (!ex.ko.includes(corePattern)) continue
        const q = makeBlank(ex.ko, corePattern)
        if (q === ex.ko) continue
        challenges.push({
          episode_id,
          challenge_type: 'fill_blank',
          question: { prompt: q },
          options: makeOptions(corePattern, fillBlankPool),
          answer: corePattern,
          word_pieces: null,
          order_num: nextOrder(episode_id),
        })
      }
    }

    // ── word_order ───────────────────────────────────────────────
    if (text_ko) {
      // 영어 프롬프트: matched와 가장 근접한 example.en → 첫 example.en → expression.english → 한국어 패턴
      const enPrompt =
        examples.find(ex => ex.ko.includes(matched))?.en ??
        examples[0]?.en ??
        row.kp_expressions.english ??
        `[${row.kp_expressions.korean}]`

      const pieces = text_ko.replace(/([.!?…])/g, ' $1').split(/\s+/).filter(Boolean)
      if (pieces.length > 1) {
        challenges.push({
          episode_id,
          challenge_type: 'word_order',
          question: { prompt: enPrompt },
          options: null,
          answer: text_ko,
          word_pieces: pieces,
          order_num: nextOrder(episode_id),
        })
      }
    }

    // ── translation (expression.examples → 각 에피소드당 할당) ──
    for (const ex of examples) {
      if (!ex.ko || !ex.en) continue
      const opts = makeOptions(ex.ko, translationPool)
      challenges.push({
        episode_id,
        challenge_type: 'translation',
        question: { prompt: ex.en },
        options: opts,
        answer: ex.ko,
        word_pieces: null,
        order_num: nextOrder(episode_id),
      })
    }
  }

  // ── 4. 통계 출력 ─────────────────────────────────────────────────────────

  const byType = { translation: 0, fill_blank: 0, word_order: 0 }
  for (const c of challenges) byType[c.challenge_type]++

  console.log(`\n생성 챌린지: 총 ${challenges.length}건`)
  console.log(`  translation: ${byType.translation}`)
  console.log(`  fill_blank:  ${byType.fill_blank}`)
  console.log(`  word_order:  ${byType.word_order}`)

  // 에피소드당 분포 (처음 10개)
  const epDist: Record<number, { t: number; f: number; w: number }> = {}
  for (const c of challenges) {
    if (!epDist[c.episode_id]) epDist[c.episode_id] = { t: 0, f: 0, w: 0 }
    if (c.challenge_type === 'translation') epDist[c.episode_id].t++
    else if (c.challenge_type === 'fill_blank') epDist[c.episode_id].f++
    else epDist[c.episode_id].w++
  }
  console.log('\n에피소드별 분포 (앞 5개):')
  Object.entries(epDist).slice(0, 5).forEach(([ep, v]) =>
    console.log(`  ep_id=${ep} translation=${v.t} fill_blank=${v.f} word_order=${v.w}`)
  )

  // 샘플 출력
  console.log('\n=== 샘플: translation 2건 ===')
  challenges.filter(c => c.challenge_type === 'translation').slice(0, 2).forEach(c =>
    console.log(`  [ep${c.episode_id}] Q: "${c.question.prompt}" → A: "${c.answer}"`)
  )
  console.log('\n=== 샘플: fill_blank 2건 ===')
  challenges.filter(c => c.challenge_type === 'fill_blank').slice(0, 2).forEach(c =>
    console.log(`  [ep${c.episode_id}] Q: "${c.question.prompt}" → A: "${c.answer}"`)
  )
  console.log('\n=== 샘플: word_order 2건 ===')
  challenges.filter(c => c.challenge_type === 'word_order').slice(0, 2).forEach(c =>
    console.log(`  [ep${c.episode_id}] Q: "${c.question.prompt}" pieces: [${c.word_pieces?.join(', ')}]`)
  )

  // 파일 저장
  fs.writeFileSync('scripts/challenges-new.json', JSON.stringify(challenges.slice(0, 100), null, 2))
  console.log('\n→ challenges-new.json (첫 100개) 저장')

  if (!APPLY) {
    console.log('\n──── DRY RUN ────')
    console.log('실제 적용: npx tsx scripts/regenerate-challenges.ts --apply')
    return
  }

  // ── 5. DB 적용: 전체 삭제 후 배치 INSERT ─────────────────────────────────

  console.log('\n──── 기존 kp_challenges 전체 삭제 ────')
  const { error: delErr } = await sb.from('kp_challenges').delete().gte('id', 0)
  if (delErr) { console.error('삭제 실패:', delErr); process.exit(1) }
  console.log('✅ 삭제 완료')

  console.log('\n──── 새 챌린지 INSERT (배치 100개) ────')
  const BATCH = 100
  let inserted = 0
  for (let i = 0; i < challenges.length; i += BATCH) {
    const batch = challenges.slice(i, i + BATCH)
    const { error } = await sb.from('kp_challenges').insert(batch)
    if (error) { console.error(`배치 ${i}-${i+BATCH} 실패:`, error.message); continue }
    inserted += batch.length
    process.stdout.write(`\r  ${inserted}/${challenges.length} 삽입...`)
  }
  console.log(`\n✅ 총 ${inserted}건 INSERT 완료`)
}
main().catch(console.error)
