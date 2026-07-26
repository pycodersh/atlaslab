/**
 * focus 표현 284개의 description을 규칙 기반으로 업데이트 (API 불필요)
 * 기존 description + examples + structure 데이터를 조합해 2-3문장 상세 설명 생성
 * Run: npx tsx scripts/update-descriptions.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

type ExprRow = {
  id: number
  korean: string
  description: string | null
  structure: string | null
  examples: { ko: string; en: string }[] | null
}

function patternLabel(korean: string): string {
  return korean.replace(/^~/, '').replace(/[?！？.。!？]+$/, '').trim()
}

function buildDescription(expr: ExprRow): string {
  const existing = expr.description?.trim() ?? ''
  const label = patternLabel(expr.korean)
  const examples = (expr.examples ?? []).slice(0, 3)

  // Sentence 1: use existing short tagline (already good) or derive one
  const s1 = existing || `Use ${label} in everyday Korean conversation.`

  // Sentence 2: structural note — how to form / what comes before
  let s2 = ''
  if (expr.structure) {
    s2 = `The pattern follows: ${expr.structure}.`
  } else if (examples.length > 0) {
    // Infer noun slot: find the part before the pattern label in the first example
    const firstKo = examples[0].ko
    const splitIdx = firstKo.lastIndexOf(label)
    if (splitIdx > 0) {
      const prefix = firstKo.slice(0, splitIdx).trim()
      if (prefix && !prefix.includes(' ')) {
        s2 = `Just place a noun before ${label} — no conjugation needed.`
      } else if (prefix) {
        s2 = `Say what you need, then add ${label} at the end.`
      }
    }
  }
  if (!s2) s2 = `It works in casual and polite speech alike.`

  // Sentence 3: concrete examples
  let s3 = ''
  if (examples.length >= 2) {
    const ex1 = examples[0]
    const ex2 = examples[1]
    s3 = `Common uses: ${ex1.ko} (${ex1.en}) or ${ex2.ko} (${ex2.en}).`
  } else if (examples.length === 1) {
    s3 = `For example: ${examples[0].ko} — "${examples[0].en}".`
  }

  return [s1, s2, s3].filter(Boolean).join(' ')
}

async function main() {
  // 1. focus 표현 ID 목록
  const { data: focusRows } = await sb
    .from('kp_dialogue_expressions')
    .select('expression_id')
    .eq('role', 'focus')
  const focusIds = [...new Set((focusRows ?? []).map((r: { expression_id: number }) => r.expression_id))]
  console.log(`focus 표현 ${focusIds.length}개 대상`)

  // 2. 표현 상세 fetch
  const exprs: ExprRow[] = []
  for (let i = 0; i < focusIds.length; i += 100) {
    const { data } = await sb
      .from('kp_expressions')
      .select('id, korean, description, structure, examples')
      .in('id', focusIds.slice(i, i + 100))
    exprs.push(...((data ?? []) as ExprRow[]))
  }
  console.log(`DB에서 ${exprs.length}개 로드 완료`)

  // 3. 생성 + DB 업데이트
  let updated = 0
  let skipped = 0

  for (const expr of exprs) {
    const existing = expr.description?.trim() ?? ''
    // Skip if already detailed (> 120 chars — previously updated)
    if (existing.length > 120) {
      skipped++
      continue
    }

    const newDesc = buildDescription(expr)

    const { error } = await sb
      .from('kp_expressions')
      .update({ description: newDesc })
      .eq('id', expr.id)

    if (error) {
      console.error(`  ✗ id=${expr.id} ${expr.korean}: ${error.message}`)
    } else {
      updated++
      if (updated <= 5 || updated % 50 === 0) {
        console.log(`  [${updated}] ${expr.korean}`)
        console.log(`      → ${newDesc}`)
      }
    }
  }

  console.log(`\n=== 완료 ===`)
  console.log(`업데이트: ${updated}개`)
  console.log(`스킵 (이미 상세):  ${skipped}개`)

  // 샘플 출력
  console.log('\n--- 최종 샘플 조회 ---')
  const { data: samples } = await sb
    .from('kp_expressions')
    .select('korean, description')
    .in('id', focusIds.slice(0, 3))
  samples?.forEach((r: { korean: string; description: string }) => {
    console.log(`[${r.korean}]\n  ${r.description}`)
  })
}

main().catch(console.error)
