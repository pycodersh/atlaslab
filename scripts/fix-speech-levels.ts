import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

const INPUT_FILE = 'C:\\Users\\msj15\\Downloads\\kpatto_scripts_confirmed.md'

// ── 말투 변환 함수 ────────────────────────────────────────────────────────────

// 존댓말 → 반말
function toHanmal(text: string): string {
  let t = text

  // 다단계 패턴: 더 구체적인 것 먼저
  const patterns: [RegExp, string][] = [
    // 대명사: 저→나 (존댓말→반말)
    [/저도\b/g, '나도'],
    [/저는\b/g, '나는'],
    [/저한테\b/g, '나한테'],
    [/저에게\b/g, '나에게'],
    [/제가\b/g, '내가'],
    [/제\b/g, '내'],
    // ~(이/가) 아닌가요? → ~(이/가) 아닌가?
    [/아닌가요\?/g, '아닌가?'],
    // ~겠어요 → ~겠어
    [/겠어요([!?.,\s]|$)/g, '겠어$1'],
    // ~잖아요 → ~잖아
    [/잖아요([!?.,\s]|$)/g, '잖아$1'],
    // ~ㄴ가요? → ~ㄴ가?
    [/ㄴ가요\?/g, 'ㄴ가?'],
    // ~나요? → ~나?
    [/나요\?/g, '나?'],
    // ~군요 → ~구나
    [/군요([!?.,\s]|$)/g, '구나$1'],
    // ~네요 → ~네
    [/네요([!?.,\s]|$)/g, '네$1'],
    // ~죠? → ~지?
    [/죠\?/g, '지?'],
    // ~죠! → ~지!
    [/죠!/g, '지!'],
    // ~죠([^?!]) → ~지$1
    [/죠(\s|$)/g, '지$1'],
    // ~ㄹ게요 → ~ㄹ게
    [/ㄹ게요([!?.,\s]|$)/g, 'ㄹ게$1'],
    // ~을게요 → ~을게
    [/을게요([!?.,\s]|$)/g, '을게$1'],
    // ~ㄹ까요? → ~ㄹ까?
    [/ㄹ까요\?/g, 'ㄹ까?'],
    // ~을까요? → ~을까?
    [/을까요\?/g, '을까?'],
    // ~가요? → ~가?
    [/가요\?/g, '가?'],
    // ~세요 명령형 변환
    [/해 주세요/g, '해줘'],
    [/해주세요/g, '해줘'],
    [/주세요/g, '줘'],
    [/오세요/g, '와'],
    [/가세요/g, '가'],
    [/하세요/g, '해'],
    [/보세요/g, '봐'],
    [/드세요/g, '먹어'],
    [/마세요/g, '마'],
    // 돼요 → 돼
    [/돼요([!?.,\s]|$)/g, '돼$1'],
    // ~았어요/었어요 → ~았어/었어
    [/았어요([!?.,\s]|$)/g, '았어$1'],
    [/었어요([!?.,\s]|$)/g, '었어$1'],
    // ~이에요/예요 → ~이야/야
    [/이에요([!?.,\s]|$)/g, '이야$1'],
    [/예요([!?.,\s]|$)/g, '야$1'],
    // ~어요/아요 → ~어/아
    [/어요([!?.,\s]|$)/g, '어$1'],
    [/아요([!?.,\s]|$)/g, '아$1'],
    // ~요! (단독 요) → (제거)
    [/([가-힣])요([!?])/g, '$1$2'],
    [/([가-힣])요(\s|$)/g, '$1$2'],
    // 고정 표현
    [/당연하죠/g, '당연하지'],
    [/물론이죠/g, '물론이지'],
    [/정말요\?/g, '정말?'],
    [/그렇죠/g, '그렇지'],
    [/맞죠/g, '맞지'],
  ]

  for (const [re, repl] of patterns) {
    t = t.replace(re, repl)
  }
  return t
}

// 반말 → 존댓말 (에마→민준 등 필요시)
function toJondaemal(text: string): string {
  let t = text
  // 간단한 변환 (필요한 경우만)
  const patterns: [RegExp, string][] = [
    [/어([!?.,\s]|$)/g, '어요$1'],
    [/아([!?.,\s]|$)/g, '아요$1'],
    [/야([!?.,\s]|$)/g, '요$1'],
    [/이야([!?.,\s]|$)/g, '이에요$1'],
  ]
  for (const [re, repl] of patterns) {
    t = t.replace(re, repl)
  }
  return t
}

// ── 스피커+에피소드별 규칙 적용 ────────────────────────────────────────────────

interface LineInfo {
  speaker: string
  target: string  // 대화 상대 (에피소드 등장인물 기반)
  epNum: number
}

function needsHanmal(speaker: string, target: string, epNum: number): boolean {
  if (speaker === '에마') {
    if (target === '지수') return epNum >= 21
    if (target === '소피') return true  // 항상 반말
    if (target === '민준') return false // 항상 존댓말
    return false // 직원/행인 등 → 존댓말
  }
  if (speaker === '지수') {
    if (target === '에마') return true
    if (target === '민준') return true
    return false
  }
  if (speaker === '민준') {
    if (target === '에마') return true
    if (target === '지수') return true
    return false
  }
  if (speaker === '소피') {
    if (target === '에마') return true  // 반말
    if (target === '지수') return false // 존댓말
    if (target === '민준') return false // 존댓말
    return false // 모르는 사람 → 존댓말
  }
  return false
}

function needsJondaemal(speaker: string, target: string, epNum: number): boolean {
  return !needsHanmal(speaker, target, epNum)
}

// ── 파일 파싱 + 교정 ──────────────────────────────────────────────────────────

interface Change {
  epNum: number
  before: string
  after: string
  speaker: string
}

function parseAndFix(content: string): { fixed: string; changes: Change[] } {
  const lines = content.split('\n')
  const result: string[] = []
  const changes: Change[] = []

  let currentEp = 0
  let characters: string[] = []  // 등장인물

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 에피소드 헤더 파싱
    const epMatch = line.match(/^## EP(\d+)/)
    if (epMatch) {
      currentEp = parseInt(epMatch[1])
      characters = []
      result.push(line)
      continue
    }

    // 등장인물 파싱
    const charMatch = line.match(/^\*\*등장인물:\*\*\s*(.+)/)
    if (charMatch) {
      characters = charMatch[1].split(/[,，、\s]+/).map(c => c.trim()).filter(Boolean)
      result.push(line)
      continue
    }

    // 대사 라인 파싱: "화자: 대사"
    const dialogueMatch = line.match(/^(에마|지수|민준|소피|직원|상인|행인|약사|기사|교수님|의사|접수):\s*(.+)/)
    if (dialogueMatch && currentEp > 0) {
      const speaker = dialogueMatch[1]
      const dialogue = dialogueMatch[2]

      // 대화 상대 추론: 등장인물에서 화자 제외한 주요 캐릭터
      const mainChars = ['에마', '지수', '민준', '소피']
      const others = characters.filter(c => c !== speaker && mainChars.includes(c))
      const target = others.length === 1 ? others[0] : inferTarget(speaker, others, currentEp)

      let newDialogue = dialogue

      if (target && mainChars.includes(speaker)) {
        if (needsHanmal(speaker, target, currentEp)) {
          // 존댓말 → 반말 체크: ~요 패턴이 있으면 변환
          if (hasJondaemalEnding(dialogue)) {
            newDialogue = toHanmal(dialogue)
          }
        }
        // 필요시 반말 → 존댓말 체크 (현재는 주로 반말 교정만)
      }

      if (newDialogue !== dialogue) {
        changes.push({
          epNum: currentEp,
          before: `${speaker}: ${dialogue}`,
          after: `${speaker}: ${newDialogue}`,
          speaker,
        })
        result.push(`${speaker}: ${newDialogue}`)
      } else {
        result.push(line)
      }
      continue
    }

    result.push(line)
  }

  return { fixed: result.join('\n'), changes }
}

function hasJondaemalEnding(text: string): boolean {
  // 존댓말 어미 패턴
  return /([어아]요|겠어요|잖아요|군요|네요|[죠죠]|ㄹ게요|을게요|[ㄹ을]까요|가요|나요|이에요|예요|세요|아닌가요|당연하죠|물론이죠)([!?,\s]|$)/.test(text)
    || /([가-힣])요([!?]|$)/.test(text)
}

function inferTarget(speaker: string, others: string[], epNum: number): string {
  // 등장인물이 여럿일 때 주 대화 상대 추론
  if (others.length === 0) return ''
  // 에마가 있으면 에마를 기본 상대로
  if (others.includes('에마')) return '에마'
  return others[0]
}

// ── DB 동기화 ──────────────────────────────────────────────────────────────────

async function syncToDb(changes: Change[]) {
  console.log(`\n=== DB 동기화 (${changes.length}건) ===`)

  // 에피소드 ID 캐시
  const epIdCache = new Map<number, number>()
  const getEpId = async (epNum: number) => {
    if (!epIdCache.has(epNum)) {
      const { data } = await sb.from('kp_episodes').select('id').eq('episode_num', epNum).single()
      epIdCache.set(epNum, data!.id)
    }
    return epIdCache.get(epNum)!
  }

  let updated = 0
  let notFound = 0

  for (const change of changes) {
    const epId = await getEpId(change.epNum)
    // before의 대사 텍스트 추출
    const beforeText = change.before.replace(/^[^:]+:\s*/, '')
    const afterText = change.after.replace(/^[^:]+:\s*/, '')

    // DB에서 해당 대사 찾기
    const { data: rows } = await sb
      .from('kp_dialogues')
      .select('id, text_ko')
      .eq('episode_id', epId)
      .ilike('text_ko', `%${beforeText.slice(0, 10)}%`)

    if (!rows || rows.length === 0) {
      console.log(`  [NOT FOUND] EP${change.epNum}: "${beforeText.slice(0, 30)}..."`)
      notFound++
      continue
    }

    // 가장 비슷한 것 찾기
    const match = rows.find(r => r.text_ko === beforeText) || rows[0]

    const { error } = await sb
      .from('kp_dialogues')
      .update({ text_ko: afterText })
      .eq('id', match.id)

    if (error) {
      console.log(`  [ERROR] EP${change.epNum}: ${error.message}`)
    } else {
      console.log(`  [OK] EP${change.epNum} id=${match.id}: "${beforeText.slice(0, 20)}" → "${afterText.slice(0, 20)}"`)
      updated++
    }
  }

  console.log(`\nDB 동기화 완료: ${updated}건 업데이트, ${notFound}건 미매칭`)
}

// ── 메인 ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== K-PATTO 말투 교정 시작 ===\n')

  const content = fs.readFileSync(INPUT_FILE, 'utf-8')
  const { fixed, changes } = parseAndFix(content)

  // 1. 변경 목록 출력
  console.log(`=== 수정된 대사 목록 (총 ${changes.length}건) ===\n`)
  let lastEp = 0
  for (const c of changes) {
    if (c.epNum !== lastEp) {
      console.log(`\n[EP${String(c.epNum).padStart(2, '0')}]`)
      lastEp = c.epNum
    }
    console.log(`  전: ${c.before}`)
    console.log(`  후: ${c.after}`)
  }

  if (changes.length === 0) {
    console.log('(변경 없음)')
    return
  }

  // 2. 파일 저장
  fs.writeFileSync(INPUT_FILE, fixed, 'utf-8')
  console.log(`\n\n파일 저장 완료: ${INPUT_FILE}`)

  // 3. DB 동기화
  await syncToDb(changes)

  console.log('\n=== 완료 ===')
}

main().catch(console.error)
