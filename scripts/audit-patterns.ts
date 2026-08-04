/**
 * kp_expressions / kp_dialogue_expressions 전수 감사
 * 1. hightlight matched_text vs text_ko
 * 2. 패턴 총 개수 (focus/exposure)
 * 3. 패턴 내용 완성도 (korean/english/description/examples)
 * 4. focus 샘플 5개
 *
 * 실행: npx tsx scripts/audit-patterns.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fetchAllDialogues } from './_db-utils'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  // ── 데이터 로드 ──────────────────────────────────────────────────────────────
  const [
    { data: exprs  },
    { data: deRows },
    { data: eps    },
  ] = await Promise.all([
    sb.from('kp_expressions').select('id, korean, english, description, category, examples, first_episode'),
    sb.from('kp_dialogue_expressions').select('id, dialogue_id, matched_text, role, expression_id'),
    sb.from('kp_episodes').select('id, episode_num'),
  ])

  const allDlgs = await fetchAllDialogues(sb, 'id, episode_id, text_ko, speaker')

  const dlgMap    = new Map(allDlgs.map((d: any) => [d.id as number, d as any]))
  const epNumMap  = new Map((eps ?? []).map((e: any) => [e.id as number, e.episode_num as number]))

  // ══════ 1. matched_text vs text_ko (role='focus') ══════════════════════════
  console.log('\n══════════════════════════════════════════════')
  console.log('1. 하이라이트 matched_text vs text_ko (role=focus)')
  console.log('══════════════════════════════════════════════')

  const focusRows = (deRows ?? []).filter((r: any) => r.role === 'focus')
  const mismatches: any[] = []

  for (const r of focusRows as any[]) {
    const dlg = dlgMap.get(r.dialogue_id)
    if (!dlg) {
      mismatches.push({ id: r.id, ep: -1, note: '대화 없음', matched_text: r.matched_text, text_ko: '' })
      continue
    }
    const ep = epNumMap.get(dlg.episode_id) ?? 0
    if (!(dlg.text_ko ?? '').includes(r.matched_text ?? '')) {
      mismatches.push({ id: r.id, ep, speaker: dlg.speaker, text_ko: dlg.text_ko, matched_text: r.matched_text })
    }
  }

  if (!mismatches.length) {
    console.log(`✅ 전부 일치 (focus ${focusRows.length}건 검사)`)
  } else {
    console.log(`⚠️  매칭 실패: ${mismatches.length}건 / 검사 ${focusRows.length}건\n`)
    for (const m of mismatches) {
      const label = m.ep === -1 ? '(고아)' : `EP${String(m.ep).padStart(2, '0')}`
      console.log(`  [de#${m.id}] ${label} [${m.speaker ?? '?'}]`)
      console.log(`    text_ko     : "${m.text_ko}"`)
      console.log(`    matched_text: "${m.matched_text}"`)
    }
  }

  // ══════ 2. 패턴 총 개수 ════════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════')
  console.log('2. 패턴 총 개수')
  console.log('══════════════════════════════════════════════')

  const allExprs = (exprs ?? []) as any[]
  const focusExprs    = allExprs.filter(e => e.category === 'focus')
  const exposureExprs = allExprs.filter(e => e.category === 'exposure')

  console.log(`kp_expressions 총계  : ${allExprs.length}개`)
  console.log(`  focus    : ${focusExprs.length}개`)
  console.log(`  exposure : ${exposureExprs.length}개`)
  console.log(`kp_dialogue_expressions: ${(deRows ?? []).length}건 (focus: ${focusRows.length} / exposure: ${(deRows ?? []).filter((r: any) => r.role === 'exposure').length})`)

  // ══════ 3. 패턴 내용 완성도 ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════')
  console.log('3. 패턴 내용 완성도')
  console.log('══════════════════════════════════════════════')

  const empty = (v: any) => v == null || (typeof v === 'string' && v.trim() === '')
  const sameAsKorean = (e: any) => e.english === e.korean

  const noKorean     = allExprs.filter(e => empty(e.korean))
  const noEnglish    = allExprs.filter(e => empty(e.english) || sameAsKorean(e))
  const noDesc       = allExprs.filter(e => empty(e.description))
  const fewExamples  = allExprs.filter(e => !Array.isArray(e.examples) || e.examples.length < 3)

  console.log(`korean null/빈값          : ${noKorean.length}개`)
  console.log(`english null/빈값/korean동일: ${noEnglish.length}개`)
  console.log(`description null/빈값      : ${noDesc.length}개`)
  console.log(`examples 3개 미만          : ${fewExamples.length}개`)

  if (noKorean.length) {
    console.log('\n  [korean 없음 목록]')
    for (const e of noKorean) console.log(`    id=${e.id} category=${e.category}`)
  }

  if (noEnglish.length) {
    const sample = noEnglish.slice(0, 8)
    console.log(`\n  [english 미완성 샘플 (상위 8개)]`)
    for (const e of sample) {
      const reason = empty(e.english) ? '비어있음' : 'korean과 동일'
      console.log(`    id=${e.id} [${e.category}] korean="${e.korean}" → english="${e.english}" (${reason})`)
    }
    if (noEnglish.length > 8) console.log(`    ... 외 ${noEnglish.length - 8}개`)
  }

  if (noDesc.length) {
    const sample = noDesc.slice(0, 5)
    console.log(`\n  [description 없음 샘플 (상위 5개)]`)
    for (const e of sample) console.log(`    id=${e.id} [${e.category}] "${e.korean}"`)
    if (noDesc.length > 5) console.log(`    ... 외 ${noDesc.length - 5}개`)
  }

  if (fewExamples.length) {
    const none = fewExamples.filter(e => !Array.isArray(e.examples) || e.examples.length === 0)
    const some = fewExamples.filter(e => Array.isArray(e.examples) && e.examples.length > 0 && e.examples.length < 3)
    console.log(`\n  [examples 없음: ${none.length}개 / 1-2개: ${some.length}개]`)
    const sample = fewExamples.slice(0, 5)
    for (const e of sample) {
      const cnt = Array.isArray(e.examples) ? e.examples.length : 0
      console.log(`    id=${e.id} [${e.category}] "${e.korean}" → examples: ${cnt}개`)
    }
    if (fewExamples.length > 5) console.log(`    ... 외 ${fewExamples.length - 5}개`)
  }

  // ══════ 4. focus 샘플 5개 ══════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════')
  console.log('4. focus 샘플 5개 (korean/english/description/examples)')
  console.log('══════════════════════════════════════════════')

  const sample5 = focusExprs.slice(0, 5)
  for (const e of sample5) {
    console.log(`\n  [id=${e.id}] EP${e.first_episode} / ${e.category}`)
    console.log(`    korean     : "${e.korean}"`)
    console.log(`    english    : "${e.english}"`)
    console.log(`    description: "${e.description ?? ''}"`)
    const exArr = Array.isArray(e.examples) ? e.examples : []
    console.log(`    examples   : ${exArr.length}개`)
    for (const ex of exArr.slice(0, 2)) {
      console.log(`      • ko="${ex.ko ?? ex.korean ?? ''}" en="${ex.en ?? ex.english ?? ''}"`)
    }
    if (exArr.length > 2) console.log(`      ... 외 ${exArr.length - 2}개`)
  }

  console.log('\n══ 완료 ══')
}

main().catch(console.error)
