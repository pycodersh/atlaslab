/**
 * kp_expressions.english gloss 자동 생성 제안
 *
 * 규칙:
 *  - english === korean (아직 실제 영어 gloss 없음) 인 것만 대상
 *  - examples[0].en 기반으로 슬롯(~) 패턴 형태 변환
 *  - 5단어 이내, 슬롯 위치에 ~ 삽입
 *
 * 실행: npx tsx scripts/generate-gloss.ts
 * 적용: npx tsx scripts/generate-gloss.ts --apply
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

// ─── 글로스 생성 로직 ──────────────────────────────────────────────────────

function generateGloss(korean: string, examples: { ko: string; en: string }[]): string {
  const ex = examples[0]
  if (!ex?.en) return korean

  const hasTilde = korean.includes('~')

  // 슬롯 없음 → example.en을 4단어 이내로 축약
  if (!hasTilde) {
    const trimmed = ex.en.replace(/[.!?]$/, '').trim()
    const words = trimmed.split(' ')
    return words.slice(0, 5).join(' ')
  }

  const parts = korean.split('~')
  const before = parts[0] ?? ''  // ~ 앞 고정 텍스트
  const after = parts[1] ?? ''   // ~ 뒤 고정 텍스트

  // ~ 가 문장 첫 위치 (before가 비어있음)
  if (!before.trim()) {
    // 어미별 템플릿 매핑
    if (after.startsWith('주세요'))       return '~ please'
    if (after.startsWith('뭐예요'))       return 'What is ~?'
    if (after.startsWith('있어요'))       return 'Is there ~?'
    if (after.startsWith('어떻게 가요'))  return 'How do I get to ~?'
    if (after.startsWith('가고 싶어요'))  return 'I want to go to ~'
    if (after.startsWith('어때요'))       return 'How is ~?'
    if (after.startsWith('로 할게요'))    return "I'll have ~"
    if (after.startsWith('해 본 적 있어요')) return 'Have you ever ~?'
    if (after.startsWith('추천해 주세요')) return 'Please recommend ~'
    if (after.startsWith('주실 수 있어요')) return 'Could you ~?'
    if (after.startsWith('좋아해요'))     return 'I like ~'
    if (after.startsWith('더 주세요'))    return 'More ~, please'
    if (after.startsWith('깎아 주세요'))  return 'Discount on ~, please'
    if (after.startsWith('써봤어요'))     return 'Have you tried ~?'
    if (after.startsWith('어떤 게 좋아요')) return 'Which ~ is good?'
    if (after.startsWith('에서 왔어요'))  return "I'm from ~"
    if (after.startsWith('어디서 타요'))  return 'Where do I catch ~?'
    if (after.startsWith('먹고 싶어요'))  return 'I want to eat ~'
    if (after.startsWith('못 먹어요'))    return "I can't eat ~"
    if (after.startsWith('먹어도 돼요'))  return 'Can I eat ~?'
    if (after.startsWith('불러도 돼요'))  return 'Can I call you ~?'
    if (after.startsWith('라서 행복해'))  return 'Happy because of ~'
    if (after.startsWith('라서 좋아요'))  return 'I like it because ~'
    if (after.startsWith('고 싶어요'))    return 'I want to ~'
    if (after.startsWith('해도 돼요'))    return 'Is it okay to ~?'
    if (after.startsWith('어서 좋아요'))  return 'I like that ~'
    if (after.startsWith('면 안 돼요'))   return "You can't ~"
    if (after.startsWith('면 돼요'))      return 'You can ~'
    if (after.startsWith('지 않아도 돼요')) return "You don't have to ~"
    if (after.startsWith('지 마세요'))    return "Please don't ~"
    if (after.startsWith('게 해주세요'))  return 'Please make it ~'
    if (after.startsWith('아요') || after.startsWith('어요')) {
      // "~아요/어요" → example.en 기반 마지막 단어 대체
      const enClean = ex.en.replace(/[.!?]$/, '')
      const words = enClean.split(' ')
      if (words.length >= 2) {
        words[words.length - 1] = '~'
        return words.slice(0, 5).join(' ')
      }
    }
    // 매핑 없음 → example.en에서 마지막 내용어 → ~
    const enClean = ex.en.replace(/[.!?]$/, '')
    const words = enClean.split(' ')
    if (words.length >= 2) {
      const tail = words.slice(-1)[0]
      const frame = words.slice(0, -1).join(' ')
      const punct = ex.en.match(/([?!])$/) ? ex.en.slice(-1) : ''
      return `${frame} ~${punct}`.trim()
    }
    return `~ ${after.replace(/[.!?]/g, '').trim()}`
  }

  // ~ 가 중간 위치
  if (before.trim() === '생각보다') return 'More ~ than expected'
  if (before.trim() === '이미')    return 'Already ~'
  // 기타 중간 슬롯: "before ~ after" 형태 단순화
  const beforeEn = ex.en.split(' ').slice(0, 2).join(' ')
  return `${before.trim()} ~`
}

// ─── 메인 ────────────────────────────────────────────────────────────────

async function main() {
  // 팝업에 등장하는 표현식만 (kp_dialogue_expressions focus 연결)
  const { data: focusRows } = await sb
    .from('kp_dialogue_expressions')
    .select('expression_id')
    .eq('role', 'focus')
  const popupIds = [...new Set((focusRows ?? []).map((r: any) => Number(r.expression_id)))]

  const { data: expRows } = await sb
    .from('kp_expressions')
    .select('id, korean, english, examples')
    .in('id', popupIds)
    .order('id')

  if (!expRows?.length) { console.error('데이터 없음'); process.exit(1) }

  type Row = { id: number; korean: string; english: string | null; examples: {ko:string;en:string}[] | null }
  const rows = expRows as Row[]

  // english === korean 인 것만 (아직 실제 gloss 없는 것)
  const targets = rows.filter(r => !r.english || r.english === r.korean)
  const skipped = rows.filter(r => r.english && r.english !== r.korean)

  console.log(`\n팝업 등장 표현식: ${rows.length}건`)
  console.log(`  → 업데이트 대상 (english=korean): ${targets.length}건`)
  console.log(`  → 건드리지 않음 (이미 다른 값):  ${skipped.length}건\n`)

  const proposals: { id: number; korean: string; current: string; proposed: string }[] = []

  for (const r of targets) {
    const examples = r.examples ?? []
    const gloss = generateGloss(r.korean, examples)
    proposals.push({
      id: r.id,
      korean: r.korean,
      current: r.english ?? '(null)',
      proposed: gloss,
    })
  }

  // ─ 출력
  console.log('=== 글로스 제안 목록 ===\n')
  for (const p of proposals) {
    const flag = p.proposed === p.korean ? '⚠️ 변환 실패' : ''
    console.log(`id=${String(p.id).padEnd(4)}  ${p.korean.padEnd(24)}  →  "${p.proposed}" ${flag}`)
  }

  // ─ 파일 저장
  fs.writeFileSync('scripts/gloss-proposals.json', JSON.stringify(proposals, null, 2), 'utf-8')
  console.log(`\n→ gloss-proposals.json 저장 (${proposals.length}건)`)

  // 변환 실패 목록
  const failed = proposals.filter(p => p.proposed === p.korean || p.proposed.startsWith('~'))
  if (failed.length) {
    console.log(`\n⚠️ 수동 검토 필요 (${failed.length}건):`)
    failed.forEach(p => console.log(`  id=${p.id} ${p.korean} → "${p.proposed}"`))
  }

  if (!APPLY) {
    console.log('\n──── DRY RUN ────')
    console.log('적용: npx tsx scripts/generate-gloss.ts --apply')
    return
  }

  // ─ DB 적용
  console.log('\n──── DB 업데이트 ────')
  let ok = 0, fail = 0
  for (const p of proposals) {
    if (p.proposed === p.korean) continue // 변환 실패 건 스킵
    const { error } = await sb.from('kp_expressions').update({ english: p.proposed }).eq('id', p.id)
    if (error) { console.error(`  ❌ id=${p.id}: ${error.message}`); fail++ }
    else ok++
  }
  console.log(`완료: ✅ ${ok}건 / ❌ ${fail}건`)
}
main().catch(console.error)
