/**
 * P001~P005 Pattern Popup 확정 데이터 업데이트
 * - kp_expressions 테이블에서 korean 기준으로 조회 → 비교 → 업데이트
 *
 * 조회만: npx tsx scripts/update-popup-p001-p005.ts
 * 실제 반영: npx tsx scripts/update-popup-p001-p005.ts --apply
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')

// ── 확정 데이터 (P001~P005) ─────────────────────────────────────────────────
const CONFIRMED = [
  {
    pid: 'P001',
    korean: '~뭐예요?',
    english: 'What is ~?',
    description: "Used to ask what something is when you don't know its name or identity.",
    examples: [
      { ko: '이거 뭐예요?', en: 'What is this?' },
      { ko: '저 음식 뭐예요?', en: 'What is that food?' },
      { ko: '이 단어 뭐예요?', en: 'What is this word?' },
    ],
  },
  {
    pid: 'P002',
    korean: '~주세요',
    english: 'Give me ~, please.',
    description: 'Used to politely request something or place an order.',
    examples: [
      { ko: '물 주세요.', en: 'Water, please.' },
      { ko: '메뉴판 주세요.', en: 'Please give me the menu.' },
      { ko: '영수증 주세요.', en: 'Please give me the receipt.' },
    ],
  },
  {
    pid: 'P003',
    korean: '~있어요?',
    english: 'Is there ~? / Do you have ~?',
    description: 'Used to ask whether something exists or is available.',
    examples: [
      { ko: '와이파이 있어요?', en: 'Is there Wi-Fi?' },
      { ko: '영어 메뉴 있어요?', en: 'Do you have an English menu?' },
      { ko: '빈자리 있어요?', en: 'Is there an empty seat?' },
    ],
  },
  {
    pid: 'P004',
    korean: '~가고 싶어요',
    english: 'I want to go to ~.',
    description: 'Used to say that you want to go to a place.',
    examples: [
      { ko: '한강에 가고 싶어요.', en: 'I want to go to the Han River.' },
      { ko: '부산에 가고 싶어요.', en: 'I want to go to Busan.' },
      { ko: '집에 가고 싶어요.', en: 'I want to go home.' },
    ],
  },
  {
    pid: 'P005',
    korean: '~어떻게 가요?',
    english: 'How do I get to ~?',
    description: 'Used to ask for directions to a place.',
    examples: [
      { ko: '서울역 어떻게 가요?', en: 'How do I get to Seoul Station?' },
      { ko: '시청 어떻게 가요?', en: 'How do I get to City Hall?' },
      { ko: '공항 어떻게 가요?', en: 'How do I get to the airport?' },
    ],
  },
]

// ── 메인 ──────────────────────────────────────────────────────────────────────
async function main() {
  const targetKoreans = CONFIRMED.map(c => c.korean)

  // ── 1. DB 조회 ────────────────────────────────────────────────────────────
  const { data: rows, error } = await sb
    .from('kp_expressions')
    .select('id, korean, english, description, examples, category, first_episode')
    .in('korean', targetKoreans)

  if (error) { console.error('조회 실패:', error.message); process.exit(1) }

  console.log(`\n[ DB 조회 결과: ${rows?.length ?? 0}건 ]\n`)

  // 중복 레코드 검사
  const countMap: Record<string, number> = {}
  for (const row of rows ?? []) {
    countMap[row.korean] = (countMap[row.korean] ?? 0) + 1
  }
  const duplicates = Object.entries(countMap).filter(([, n]) => n > 1)
  if (duplicates.length) {
    console.warn('⚠️  중복 레코드 발견:')
    duplicates.forEach(([k, n]) => console.warn(`   "${k}" → ${n}건`))
  }

  const dbByKorean = new Map<string, typeof rows[0]>()
  for (const row of rows ?? []) {
    if (countMap[row.korean] === 1) dbByKorean.set(row.korean, row)
  }

  // ── 2. 비교 및 업데이트 ───────────────────────────────────────────────────
  const results: Array<{
    pid: string; korean: string; dbId: number | null;
    status: 'ok' | 'not_found' | 'duplicate' | 'mismatch'
    old_english?: string; old_description?: string; old_examples?: unknown
    error?: string
  }> = []

  for (const conf of CONFIRMED) {
    const dbRow = dbByKorean.get(conf.korean)

    if (!dbRow) {
      const isDup = (countMap[conf.korean] ?? 0) > 1
      results.push({
        pid: conf.pid, korean: conf.korean, dbId: null,
        status: isDup ? 'duplicate' : 'not_found',
        error: isDup ? '중복 레코드 → 자동 수정 불가' : 'DB에 없음',
      })
      continue
    }

    // 기존 값 백업
    const backup = {
      old_english: dbRow.english ?? '(없음)',
      old_description: dbRow.description ?? '(없음)',
      old_examples: dbRow.examples ?? '(없음)',
    }

    // 실제 업데이트
    if (APPLY) {
      const { error: upErr } = await sb
        .from('kp_expressions')
        .update({
          english: conf.english,
          description: conf.description,
          examples: conf.examples,
        })
        .eq('id', dbRow.id)

      if (upErr) {
        results.push({
          pid: conf.pid, korean: conf.korean, dbId: dbRow.id,
          status: 'mismatch', error: `UPDATE 실패: ${upErr.message}`, ...backup,
        })
        continue
      }
    }

    results.push({
      pid: conf.pid, korean: conf.korean, dbId: dbRow.id,
      status: 'ok', ...backup,
    })
  }

  // ── 3. 결과 보고 ──────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════')
  console.log(APPLY ? '[ 업데이트 완료 보고서 ]' : '[ DRY RUN — 변경 없음 ]')
  console.log('═══════════════════════════════════════════\n')

  for (const r of results) {
    const mark = r.status === 'ok' ? '✅' : '❌'
    console.log(`${mark} ${r.pid} | DB id=${r.dbId ?? 'N/A'} | ${r.korean}`)

    if (r.status === 'ok') {
      console.log(`   기존 english    : ${r.old_english}`)
      console.log(`   기존 description: ${r.old_description}`)
      console.log(`   기존 examples   : ${JSON.stringify(r.old_examples)}`)
      console.log(APPLY ? '   → 확정 데이터로 교체 완료' : '   → [APPLY 시 교체 예정]')
    } else {
      console.log(`   상태: ${r.error}`)
    }
    console.log()
  }

  const okCount  = results.filter(r => r.status === 'ok').length
  const errCount = results.filter(r => r.status !== 'ok').length

  console.log(`─────────────────────────────────────────`)
  console.log(`처리: ${okCount}건 ${APPLY ? '반영' : '반영 예정'} / ${errCount}건 불일치/누락`)
  if (!APPLY) {
    console.log('\n실제 반영하려면 --apply 옵션을 추가하세요:')
    console.log('  npx tsx scripts/update-popup-p001-p005.ts --apply')
  }
}

main().catch(console.error)
