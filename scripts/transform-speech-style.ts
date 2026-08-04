/**
 * kp_dialogues.text_ko 말투 일괄 변환 (검수용 드라이런)
 * - emma/sophie: 반말 → 존댓말
 * - jisu/minjun: 존댓말 → 반말
 * - emma: 지수야 → 지수 언니
 *
 * 실행: npx tsx scripts/transform-speech-style.ts
 * DB 실제 적용: npx tsx scripts/transform-speech-style.ts --apply
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

// ─── 변환 로직 ───────────────────────────────────────────────────────────────

/** 한 줄(절) 말미의 반말 → 존댓말 변환 */
function clauseToJondaemal(s: string): string {
  // 긴 패턴 먼저
  s = s.replace(/(었어|았어)([\!\?\.]*)\s*$/, '$1요$2')
  s = s.replace(/겠어([\!\?\.]*)\s*$/, '겠어요$1')
  s = s.replace(/잖아([\!\?\.]*)\s*$/, '잖아요$1')
  s = s.replace(/거야([\!\?\.]*)\s*$/, '거예요$1')
  s = s.replace(/이야([\!\?\.]*)\s*$/, '이에요$1')   // 카페이야 → 카페이에요
  s = s.replace(/야([\!\?\.]*)\s*$/, '예요$1')        // 거야 above catches first; 야 alone → 예요
  s = s.replace(/([\uAC00-\uD7A3])게([\!\?\.]*)\s*$/, '$1게요$2')  // 할게/줄게/볼게 등
  // 단음절 어미
  s = s.replace(/지([\!\?\.]*)\s*$/, '죠$1')
  s = s.replace(/네([\!\?\.]*)\s*$/, '네요$1')
  s = s.replace(/래([\!\?\.]*)\s*$/, '래요$1')
  s = s.replace(/해([\!\?\.]*)\s*$/, '해요$1')
  s = s.replace(/봐([\!\?\.]*)\s*$/, '봐요$1')
  s = s.replace(/줘([\!\?\.]*)\s*$/, '줘요$1')
  s = s.replace(/가([\!\?\.]*)\s*$/, '가요$1')
  s = s.replace(/어([\!\?\.]*)\s*$/, '어요$1')
  s = s.replace(/아([\!\?\.]*)\s*$/, '아요$1')
  return s
}

/** 반말 → 존댓말: 멀티라인 대응 (각 줄 개별 처리) */
function toJondaemal(text: string): string {
  return text.split('\n').map(clauseToJondaemal).join('\n')
}

/** 한 줄(절) 말미의 존댓말 → 반말 변환 */
function clauseToBanmal(s: string): string {
  // 긴 패턴 먼저
  s = s.replace(/겠어요([\!\?\.]*)\s*$/, '겠어$1')
  s = s.replace(/이에요([\!\?\.]*)\s*$/, '이야$1')
  s = s.replace(/예요([\!\?\.]*)\s*$/, '야$1')
  s = s.replace(/네요([\!\?\.]*)\s*$/, '네$1')
  s = s.replace(/게요([\!\?\.]*)\s*$/, '게$1')        // 할게요 → 할게
  s = s.replace(/봐요([\!\?\.]*)\s*$/, '봐$1')
  s = s.replace(/래요([\!\?\.]*)\s*$/, '래$1')
  // 세요 패턴 (개별 동사)
  s = s.replace(/주세요([\!\?\.]*)\s*$/, '줘$1')
  s = s.replace(/가세요([\!\?\.]*)\s*$/, '가$1')
  s = s.replace(/오세요([\!\?\.]*)\s*$/, '와$1')
  s = s.replace(/하세요([\!\?\.]*)\s*$/, '해$1')
  s = s.replace(/보세요([\!\?\.]*)\s*$/, '봐$1')
  s = s.replace(/드세요([\!\?\.]*)\s*$/, '먹어$1')
  s = s.replace(/이세요([\!\?\.]*)\s*$/, '이야$1')
  // 해요 → 해
  s = s.replace(/해요([\!\?\.]*)\s*$/, '해$1')
  // 죠 → 지
  s = s.replace(/죠([\!\?\.]*)\s*$/, '지$1')
  // 어요/아요 → 어/아
  s = s.replace(/어요([\!\?\.]*)\s*$/, '어$1')
  s = s.replace(/아요([\!\?\.]*)\s*$/, '아$1')
  // 잖아요 → 잖아
  s = s.replace(/잖아요([\!\?\.]*)\s*$/, '잖아$1')
  return s
}

/** 존댓말 → 반말: 멀티라인 대응 */
function toBanmal(text: string): string {
  return text.split('\n').map(clauseToBanmal).join('\n')
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply')

async function main() {
  // 1. 전체 대상 행 로드
  const { data: rows, error } = await sb
    .from('kp_dialogues')
    .select('id, speaker, text_ko')
    .in('speaker', ['emma', 'sophie', 'jisu', 'minjun'])
    .order('id')
  if (error || !rows) { console.error(error); process.exit(1) }

  const changes: { id: number; speaker: string; before: string; after: string; note: string }[] = []

  // 오변환 제외 목록 (자동 변환 skip — 수동값 있으면 그걸로 설정)
  const OVERRIDES: Record<number, string | null> = {
    101:  null,          // "네..." — 부사, 변환 제외
    230:  null,          // "드디어!" — 부사, 변환 제외
    796:  null,          // "드디어!" — 부사, 변환 제외
    544: '나는 한국어, 넌 영어예요!', // 수동 수정
  }

  for (const row of rows) {
    let after = row.text_ko
    let note = ''

    if (row.id in OVERRIDES) {
      const override = OVERRIDES[row.id]
      if (override === null) continue           // 변환 제외
      after = override                          // 수동값 사용
      note = '수동수정'
    } else if (row.speaker === 'emma') {
      after = after.replace(/지수야/g, '지수 언니')
      after = toJondaemal(after)
      if (row.text_ko.includes('지수야') && after !== row.text_ko) note = '지수야+반말→존댓말'
      else if (row.text_ko.includes('지수야')) note = '지수야'
      else if (after !== row.text_ko) note = '반말→존댓말'
    } else if (row.speaker === 'sophie') {
      after = toJondaemal(after)
      if (after !== row.text_ko) note = '반말→존댓말'
    } else if (row.speaker === 'jisu') {
      after = toBanmal(after)
      if (/습니다|ㅂ니다/.test(after)) note = '⚠️ 습니다 미변환'
      else if (after !== row.text_ko) note = '존댓말→반말'
    } else if (row.speaker === 'minjun') {
      after = toBanmal(after)
      if (/습니다|ㅂ니다/.test(after)) note = '⚠️ 습니다 미변환'
      else if (after !== row.text_ko) note = '존댓말→반말'
    }

    if (after !== row.text_ko) {
      changes.push({ id: row.id, speaker: row.speaker, before: row.text_ko, after, note })
    }
  }

  // 2. 결과 파일 저장
  const outJson = 'scripts/speech-style-changes.json'
  fs.writeFileSync(outJson, JSON.stringify(changes, null, 2), 'utf-8')

  // 3. 콘솔 출력 (화자별 요약 + 전체 목록)
  console.log(`\n총 변환 대상: ${changes.length}/${rows.length}행\n`)

  for (const spk of ['emma', 'sophie', 'jisu', 'minjun']) {
    const c = changes.filter(r => r.speaker === spk)
    console.log(`=== ${spk} (${c.length}건) ===`)
    for (const r of c) {
      console.log(`  id=${r.id} [${r.note}]`)
      console.log(`    전: ${r.before}`)
      console.log(`    후: ${r.after}`)
    }
    console.log()
  }

  if (!APPLY) {
    console.log('──── DRY RUN ────')
    console.log(`실제 적용: npx tsx scripts/transform-speech-style.ts --apply`)
    return
  }

  // 4. DB 적용
  console.log('──── DB 적용 중 ────')
  let ok = 0
  let fail = 0
  for (const c of changes) {
    const { error } = await sb.from('kp_dialogues').update({ text_ko: c.after }).eq('id', c.id)
    if (error) { console.error(`  ❌ id=${c.id}: ${error.message}`); fail++ }
    else ok++
  }
  console.log(`완료: ✅ ${ok}건 / ❌ ${fail}건`)
}
main().catch(console.error)
