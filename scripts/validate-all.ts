/**
 * 세 가지 전수 확인
 * 1. kp_dialogue_expressions.matched_text vs kp_dialogues.text_ko
 * 2. MD Focus Pattern 표현이 해당 EP kp_dialogues에 존재하는지
 * 3. 말투 규칙 위반 (에마/소피 반말, 지수/민준 존댓말)
 *
 * 실행: npx tsx scripts/validate-all.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { fetchAllDialogues } from './_db-utils'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const mdPath = path.join(os.homedir(), 'Downloads', 'kpatto_scripts_confirmed.md')

// ─── 반말 종결어미 (에마/소피 금지) ────────────────────────────────────
const BANMAL_ENDINGS = [
  '야', '해', '어', '아', '지', '봐', '줘', '와', '자',
  '봐', '가', '나', '니', '래', '데', '걸', '구', '고', '네',
  '돼', '때', '려', '녀', '까', '뿐', '뤄', '싶어', '같아',
  '같애', '좋아', '맞아', '그래', '알아', '몰라', '싫어', '있어', '없어',
  '했어', '됐어', '갔어', '왔어', '봤어', '됐어', '쌌어',
  '잖아', '거든', '하던', '보면', '하면', '되면',
]

// 존댓말 종결어미 (에마/소피 정상)
const JONDAEMAL_ENDINGS = [
  '요', '죠', '네요', '군요', '어요', '아요', '해요', '세요', '예요', '이에요',
  '겠어요', '했어요', '됐어요', '갔어요', '왔어요', '봤어요',
  '싶어요', '같아요', '좋아요', '맞아요', '알아요', '몰라요',
  '잖아요', '거든요', '하던데요',
]

// 존댓말 종결어미 (지수/민준 금지 — 에마·소피 상대로)
// → 낯선 사람에게 존댓말은 맞으므로 화자별 일괄 체크는 과잉; 대신 명확한 패턴만
const JISU_MINJUN_JONDAE_ENDINGS = [
  '어요', '아요', '해요', '세요', '예요', '이에요',
  '겠어요', '했어요', '됐어요', '갔어요', '왔어요', '봤어요',
  '싶어요', '같아요', '좋아요', '알아요', '잖아요',
]

// 예외 (단독으로 쓰이는 짧은 표현)
const BANMAL_EXEMPTIONS = new Set([
  '네', '아니요', '저도요', '모두', '건배', '아이고', '세상에', '맞아요',
  '정말요', '진짜요', '감사해요', '괜찮아요', '화이팅', '응원해요',
])

function getBody(text: string): string {
  return text.replace(/[!?.…~]+$/, '').trim()
}

function endsWithBanmal(text: string): boolean {
  const body = getBody(text)
  if (BANMAL_EXEMPTIONS.has(body)) return false
  // 존댓말이면 제외
  for (const e of JONDAEMAL_ENDINGS) {
    if (body.endsWith(e)) return false
  }
  for (const e of BANMAL_ENDINGS) {
    if (body.endsWith(e)) return true
  }
  return false
}

function endsWithJondae(text: string): boolean {
  const body = getBody(text)
  for (const e of JISU_MINJUN_JONDAE_ENDINGS) {
    if (body.endsWith(e)) return true
  }
  return false
}

// ─── MD Focus Pattern 파싱 ────────────────────────────────────────────
function normalizePattern(p: string): string {
  return p.replace(/\/\S+/g, '').replace(/\s+/g, ' ').trim()
}
function splitPatterns(line: string): string[] {
  return line.split(' / ').map(normalizePattern).filter(Boolean)
}
function getSearchTerm(pattern: string): string {
  return pattern
    .replace(/^~\S*\s+/, '')
    .replace(/^~/, '')
    .replace(/\s*~\s*$/, '')
    .replace(/[?!~]/g, '')
    .trim()
}

interface EpFocus { epNum: number; patterns: string[] }
function parseFocusPatterns(content: string): EpFocus[] {
  const result: EpFocus[] = []
  for (const sec of content.split(/(?=^## EP\d+)/m)) {
    const m = sec.match(/^## EP(\d+)/)
    if (!m) continue
    const epNum = parseInt(m[1])
    const focusLine = sec.match(/\*\*Focus Pattern:\*\*\s*([^\n]+)/)
    if (focusLine) result.push({ epNum, patterns: splitPatterns(focusLine[1]) })
  }
  return result
}

// ─── 메인 ─────────────────────────────────────────────────────────────
async function main() {
  // DB 로드
  const [
    { data: exprs },
    { data: eps },
  ] = await Promise.all([
    sb.from('kp_dialogue_expressions').select('id, dialogue_id, matched_text'),
    sb.from('kp_episodes').select('id, episode_num'),
  ])
  const dlgs = await fetchAllDialogues(sb, 'id, episode_id, text_ko, speaker')

  const epNumMap = new Map((eps ?? []).map((e: any) => [e.id as number, e.episode_num as number]))
  const dlgMap   = new Map(dlgs.map((d: any) => [d.id as number, d as any]))
  // episode_id → dialogues[]
  const dlByEp   = new Map<number, Array<{ id: number; text_ko: string; speaker: string }>>()
  for (const d of dlgs) {
    if (!dlByEp.has(d.episode_id)) dlByEp.set(d.episode_id, [])
    dlByEp.get(d.episode_id)!.push(d)
  }
  const epIdMap = new Map((eps ?? []).map((e: any) => [e.episode_num as number, e.id as number]))

  // ══════ 1. matched_text vs text_ko ════════════════════════════════
  console.log('\n══════════════════════════════════════════════')
  console.log('1. matched_text vs text_ko 전수 확인')
  console.log('══════════════════════════════════════════════')
  const mismatches: any[] = []
  for (const expr of exprs ?? [] as any[]) {
    const dlg = dlgMap.get(expr.dialogue_id)
    if (!dlg) { mismatches.push({ expr_id: expr.id, ep: -1, note: '대화 없음', matched_text: expr.matched_text, text_ko: '' }); continue }
    const ep = epNumMap.get(dlg.episode_id) ?? 0
    if (!dlg.text_ko.includes(expr.matched_text)) {
      mismatches.push({ expr_id: expr.id, ep, speaker: dlg.speaker, text_ko: dlg.text_ko, matched_text: expr.matched_text })
    }
  }
  if (!mismatches.length) {
    console.log('✅ 전부 일치 (매칭 실패 없음)')
  } else {
    console.log(`⚠️  매칭 실패: ${mismatches.length}건\n`)
    for (const m of mismatches) {
      const epLabel = m.ep === -1 ? '(고아)' : `EP${String(m.ep).padStart(2,'0')}`
      console.log(`  [expr#${m.expr_id}] ${epLabel} [${m.speaker ?? '?'}]`)
      console.log(`    text_ko     : "${m.text_ko}"`)
      console.log(`    matched_text: "${m.matched_text}"`)
    }
  }

  // ══════ 2. Focus Pattern 표현 vs 대사 존재 ════════════════════════
  console.log('\n══════════════════════════════════════════════')
  console.log('2. Focus Pattern 표현 vs kp_dialogues 존재 확인')
  console.log('══════════════════════════════════════════════')
  const content = fs.readFileSync(mdPath, 'utf-8')
  const focusGroups = parseFocusPatterns(content)
  const focusMissing: any[] = []

  for (const g of focusGroups) {
    const epId = epIdMap.get(g.epNum)
    const dialogues = epId ? (dlByEp.get(epId) ?? []) : []
    for (const p of g.patterns) {
      const term = getSearchTerm(p)
      if (!term || term.length < 2) continue
      const found = dialogues.some(d => d.text_ko.includes(term))
      if (!found) {
        // 단어 하나라도 있으면 soft-match로 허용
        const words = term.split(/\s+/).filter(w => w.length >= 2)
        const softFound = words.some(w => dialogues.some(d => d.text_ko.includes(w)))
        if (!softFound) {
          focusMissing.push({ epNum: g.epNum, pattern: p, term })
        }
      }
    }
  }

  if (!focusMissing.length) {
    console.log('✅ 전체 Focus Pattern 표현이 해당 EP 대사에 존재')
  } else {
    console.log(`⚠️  Focus Pattern 대사 미발견: ${focusMissing.length}건\n`)
    for (const m of focusMissing) {
      console.log(`  EP${String(m.epNum).padStart(2,'0')} | 패턴: "${m.pattern}" | 검색어: "${m.term}"`)
    }
  }

  // ══════ 3. 말투 위반 검사 ════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════')
  console.log('3. 말투 위반 검사')
  console.log('══════════════════════════════════════════════')

  const emmaSOphieBanmal: any[] = []
  const jisuMinjunJondae: any[] = []

  for (const d of dlgs) {
    const ep = epNumMap.get(d.episode_id) ?? 0
    const text: string = d.text_ko ?? ''
    const speaker: string = d.speaker ?? ''

    if (speaker === 'emma' || speaker === 'sophie') {
      if (endsWithBanmal(text)) {
        emmaSOphieBanmal.push({ ep, speaker, text })
      }
    }
    if (speaker === 'jisu' || speaker === 'minjun') {
      if (endsWithJondae(text)) {
        jisuMinjunJondae.push({ ep, speaker, text })
      }
    }
  }

  if (!emmaSOphieBanmal.length) {
    console.log('✅ 에마·소피 반말 위반 없음')
  } else {
    console.log(`⚠️  에마·소피 반말 위반: ${emmaSOphieBanmal.length}건`)
    for (const v of emmaSOphieBanmal) {
      console.log(`  EP${String(v.ep).padStart(2,'0')} [${v.speaker}] "${v.text}"`)
    }
  }

  console.log()
  if (!jisuMinjunJondae.length) {
    console.log('✅ 지수·민준 존댓말 위반 없음')
  } else {
    console.log(`⚠️  지수·민준 존댓말 위반: ${jisuMinjunJondae.length}건`)
    for (const v of jisuMinjunJondae) {
      console.log(`  EP${String(v.ep).padStart(2,'0')} [${v.speaker}] "${v.text}"`)
    }
  }

  console.log('\n══ 완료 ══')
}

main().catch(console.error)
