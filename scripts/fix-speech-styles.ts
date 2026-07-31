/**
 * kpatto_scripts_confirmed.md 말투 수정
 * - 에마, 소피: 항상 존댓말
 * - EP01 지수: 존댓말 (첫만남 예외)
 *
 * 실행: npx tsx scripts/fix-speech-styles.ts          (DRY RUN)
 * 적용: npx tsx scripts/fix-speech-styles.ts --apply
 */
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const APPLY = process.argv.includes('--apply')
const mdPath = path.join(os.homedir(), 'Downloads', 'kpatto_scripts_confirmed.md')

// 특정 라인 번호에 대한 하드코딩 오버라이드 (자동변환이 어렵거나 잘못되는 케이스)
const LINE_OVERRIDES: Record<number, string> = {
  // EP01 지수 존댓말 (첫만남 예외)
  14: '지수: 어서 와요! 주문하시겠어요?',
  22: '지수: 달달하고 맛있어요!',
  26: '지수: 사이즈는요?',
  32: '지수: 네, 있어요!',
  // EP01 에마
  13: '에마: 와, 예뻐요!',
  // EP02 에마
  45: '에마: 와... 사람이 너무 많아요!',
  // EP08 에마 mixed
  227: '에마: 뭐가 좋아요? 다 신기해 보여요.',
  235: '에마: 이거... 친구한테 선물하려고요. 어떤 게 좋아요?',
  // EP11 에마
  320: '에마: 와, 빠르네요!',
  // EP15 에마 시간 (bare noun)
  443: '에마: 매주 금요일 밤 9시예요!',
  447: '에마: 진짜요? 대박이에요!',
  // EP17 에마 (전화 상황, 응→네 + 아파)
  488: '에마: (전화로) 지수야, 저 많이 아파요...',
  505: '에마: 네, 푹 쉬었더니 나았어요!',
  // EP19 에마 경복궁
  547: '에마: 한복 입고 사진 찍는 거예요!',
  554: '에마: 선물로 뭐가 좋을까요?',
  559: '에마: 저도요! 진짜 예뻐요.',
  // EP20 소피 (에마 이름이 문장 끝에 오는 경우 → 이미 존댓말)
  576: '소피: 에마! 정말 오랜만이에요!',
  580: '에마: 네! 요즘 바빠요?',
  // EP19 소피
  555: '소피: 한국 전통 과자 어때요?',
  563: '소피: 인스타에 올려요!',
  // EP26 소피
  762: '소피: 결말이 어떻게 될까요?',
  // EP30 에마 (bare noun 답변)
  866: '에마: 홍대 근처예요!',
  870: '에마: 네! 원룸이에요.',
  // EP31 에마 설레
  895: '에마: 너무 좋아요! 설레요.',
  902: '에마: 근데 짐이 많아서 좀 걱정돼요.',
  907: '에마: 왜요?',
  // EP32 소피 (에마 이름 끝에 오는 경우 → 이미 존댓말, 변경 불필요)
  932: '소피: 고마워요, 에마.',
  940: '소피: 고마워요, 에마.',
  // EP35 에마
  1026: '에마: 신기해요! 우리나라랑 달라요.',
  // EP37 소피 잘하네
  1072: '소피: 노래 진짜 잘하네요!',
  // EP39 소피 시키자
  1138: '소피: 오래 있어도 돼요?',
  // EP41 에마 바쁜데
  1185: '에마: 저 지금 좀 바쁜데요.',
  // EP48 소피 시키자
  1392: '소피: 가성비 좋은 데로 시켜요.',
  // EP54 에마 (나는 → 저는, 영어 처리)
  1565: '에마: 저는 한국어, 넌 영어예요!',
  // EP70 에마 다녀
  2037: '에마: 저 텀블러 갖고 다녀요.',
  // EP72 에마 나도
  2084: '에마: 저도. 미안해요.',
  2092: '에마: 저도 오해했어요.',
  // EP74 에마 저거는
  2153: '에마: 저거는요?',
  // EP79 에마 기다려
  2290: '에마: 얼마나 기다려요?',
  // EP86 에마 그렇구나 → 그렇군요
  2498: '에마: 아, 그렇군요!',
  // EP91 에마 아니야 → 아니에요
  2646: '에마: 꼭 그런 건 아니에요.',
  // EP100
  2895: '에마: 100화가 끝이 아니라 시작이에요!',
  2903: '에마: 한국어로 꿈을 이룰 거예요!',
  2908: '에마: 꼭 만나요!',
}

// 다 형태 특수 변환 테이블 (stem → 존댓말)
const DA_FORMS: Record<string, string> = {
  '예쁘다': '예뻐요',
  '많다': '많아요',
  '빠르다': '빨라요',
  '신기하다': '신기해요',
  '맞다': '맞아요',
  '있다': '있어요',
  '없다': '없어요',
  '좋다': '좋아요',
  '힘들다': '힘들어요',
  '달라': '달라요',  // 다르다의 비격식 → 존댓말
  '나빠': '나빠요',
  '좋아': '좋아요',
}

// 반말 → 존댓말 변환 (한 문장)
function makePoliteSegment(seg: string): string {
  if (!seg.trim()) return seg

  // 무대지문이 있으면 내용 부분만 처리
  let prefix = ''
  const parenMatch = seg.match(/^(\([^)]+\)\s*)/)
  if (parenMatch) {
    prefix = parenMatch[1]
    seg = seg.slice(prefix.length)
  }

  // 구두점 분리
  const punctMatch = seg.match(/^([\s\S]*?)([!?.…]+)$/)
  const body = punctMatch ? punctMatch[1] : seg
  const punc = punctMatch ? punctMatch[2] : ''

  let r = body

  // 다 형태 하드코딩 변환
  for (const [from, to] of Object.entries(DA_FORMS)) {
    if (r.endsWith(from)) {
      r = r.slice(0, r.length - from.length) + to
      return prefix + r + punc
    }
  }

  // 응 → 네 (단독 혹은 시작)
  if (/^응$/.test(r.trim())) { return prefix + '네' + punc }

  // 이야 → 이에요
  if (r.endsWith('이야')) { return prefix + r.slice(0, -2) + '이에요' + punc }
  // 거야 → 거예요
  if (r.endsWith('거야')) { return prefix + r.slice(0, -2) + '거예요' + punc }
  // 아니야 → 아니에요 (부정 서술격)
  if (r.endsWith('아니야')) { return prefix + r.slice(0, -2) + '에요' + punc }

  // 야 → 예요 (명사 서술격, 앞이 모음으로 끝나는 경우)
  if (r.endsWith('야') && !r.endsWith('하야') && !r.endsWith('에마야') && !r.endsWith('지수야') && !r.endsWith('소피야') && !r.endsWith('민준야') && !r.endsWith('오빠야')) {
    return prefix + r.slice(0, -1) + '예요' + punc
  }

  // 지 → 죠 (문말)
  if (r.endsWith('지')) { return prefix + r.slice(0, -1) + '죠' + punc }

  // 더라 → 더라고요
  if (r.endsWith('더라')) { return prefix + r.slice(0, -2) + '더라고요' + punc }

  // 거든 → 거든요
  if (r.endsWith('거든')) { return prefix + r + '요' + punc }
  // 잖아 → 잖아요
  if (r.endsWith('잖아')) { return prefix + r + '요' + punc }
  // ㄴ데 / 는데 → ㄴ데요 / 는데요
  if (r.endsWith('ㄴ데') || r.endsWith('는데')) { return prefix + r + '요' + punc }

  // 봐 → 봐요, 줘 → 줘요, 줄게 → 줄게요 등
  if (r.endsWith('줄게') || r.endsWith('할게') || r.endsWith('올게') || r.endsWith('갈게') || r.endsWith('볼게') || r.endsWith('먹을게') || r.endsWith('시킬게') || r.endsWith('부를게') || r.endsWith('할게')) {
    return prefix + r + '요' + punc
  }
  if (r.endsWith('ㄹ래') || r.endsWith('을래') || r.endsWith('할래') || r.endsWith('먹을래') || r.endsWith('갈래')) {
    return prefix + r + '요' + punc
  }

  // 어/아 → 어요/아요 (주요 동사/형용사 어미)
  if (r.endsWith('어')) { return prefix + r + '요' + punc }
  if (r.endsWith('아')) { return prefix + r + '요' + punc }

  // 봐 → 봐요
  if (r.endsWith('봐')) { return prefix + r + '요' + punc }

  // 해 → 해요 (하다 동사)
  if (r.endsWith('해')) { return prefix + r + '요' + punc }

  // 와 → 와요 (오다 명령)
  if (r.endsWith('와')) { return prefix + r + '요' + punc }

  // 때 → 때요 (어때 → 어때요)
  if (r.endsWith('때')) { return prefix + r + '요' + punc }
  // 려 → 려요 (올려 → 올려요, 기다려 → 기다려요)
  if (r.endsWith('려')) { return prefix + r + '요' + punc }
  // 녀 → 녀요 (다녀 → 다녀요)
  if (r.endsWith('녀')) { return prefix + r + '요' + punc }
  // 까 → 까요 (좋을까 → 좋을까요)
  if (r.endsWith('까')) { return prefix + r + '요' + punc }
  // 네 → 네요 (잘하네 → 잘하네요)
  if (r.endsWith('네')) { return prefix + r + '요' + punc }
  // 돼 → 돼요 (하면 돼 → 하면 돼요)
  if (r.endsWith('돼')) { return prefix + r + '요' + punc }
  // 데 → 데요 (바쁜데 → 바쁜데요) — 는데/ㄴ데 이미 위에서 처리
  if (r.endsWith('데') && !r.endsWith('는데')) { return prefix + r + '요' + punc }

  // 마 → 마요 (금지 명령: ~지 마) ← 이름(에마 등) 오변환 방지로 " 마"만 매칭
  if (r.endsWith(' 마')) { return prefix + r + '요' + punc }

  // 자 → 요 (청유형: 가자→가요, 하자→해요)
  if (r.endsWith('하자')) { return prefix + r.slice(0, -2) + '해요' + punc }
  if (r.endsWith('자')) {
    const stem = r.slice(0, -1)
    if (stem.endsWith('하')) return prefix + stem.slice(0, -1) + '해요' + punc
    return prefix + stem + '요' + punc
  }

  // 게 → 게요 (의지/완곡)
  if (r.endsWith('게')) { return prefix + r + '요' + punc }

  // 나 → 나요 (의문)
  if (r.endsWith('나')) { return prefix + r + '요' + punc }

  return prefix + seg  // 변환 불필요 or 이미 존댓말
}

// 나 → 저, 내가 → 제가, 내 → 제 (1인칭 겸양어)
function replaceFirstPerson(text: string): string {
  // 문장 시작의 나도/나는/나 → 저도/저는/저
  text = text.replace(/^나도/, '저도')
  text = text.replace(/^나는/, '저는')
  text = text.replace(/^나 /, '저 ')
  text = text.replace(/^나,/, '저,')
  // 내가 → 제가
  text = text.replace(/내가/g, '제가')
  // 단독 내 (소유) → 제 (단어 경계 고려)
  text = text.replace(/내 /g, '제 ')
  text = text.replace(/내$/g, '제')
  return text
}

// 한 문장이 이미 존댓말인지 확인
function isAlreadyPolite(text: string): boolean {
  // 구두점 제거 후 확인
  const body = text.replace(/[!?.…]+$/, '').trim()
  if (!body) return true
  const last = body[body.length - 1]

  // 존댓말 어미로 끝나는 경우
  if (body.endsWith('요') || body.endsWith('죠') || body.endsWith('세요') ||
      body.endsWith('이에요') || body.endsWith('예요') || body.endsWith('이에요') ||
      body.endsWith('겠어요') || body.endsWith('드려요') || body.endsWith('드릴게요') ||
      body.endsWith('습니다') || body.endsWith('ㅂ니다') || body.endsWith('할까요') ||
      body.endsWith('어요') || body.endsWith('아요')) {
    return true
  }

  // 단독 감탄사/응답 (구두점 제거 후 body로 비교)
  const exemptions = ['네', '아니요', '저도', '저도요', '모두', '건배', '아이고', '세상에']
  if (exemptions.includes(body)) return true

  return false
}

// 다중 문장 처리 (! . 구분)
function makePolite(text: string): string {
  if (isAlreadyPolite(text)) return text

  // 1인칭 겸양어 변환
  text = replaceFirstPerson(text)

  // 문장 내 여러 절 처리: ". " 또는 "! "로 구분
  // e.g., "진짜 좋았어! 사진도 많이 찍었어."
  const parts: string[] = []
  const sentenceRegex = /([^!?.]+[!?.]+\s*)/g
  let lastIndex = 0
  let match

  // 문장 분리 시도
  const segments: { text: string; punc: string }[] = []
  const re = /([^!?.]*?)([!?.])([ \n]|$)/g
  let prev = 0

  // 간단한 접근: 구두점+공백으로 분리
  const rawSegments = text.split(/(?<=[!?.])\s+/)
  if (rawSegments.length > 1) {
    return rawSegments.map(s => {
      if (isAlreadyPolite(s)) return s
      return makePoliteSegment(s)
    }).join(' ')
  }

  return makePoliteSegment(text)
}

function main() {
  const content = fs.readFileSync(mdPath, 'utf-8')
  const lines = content.split('\n')

  let currentEp = 0
  let changeCount = 0
  const newLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1  // 1-indexed
    const line = lines[i]

    // 에피소드 번호 추적
    const epMatch = line.match(/^## EP(\d+)/)
    if (epMatch) {
      currentEp = parseInt(epMatch[1])
    }

    // 헤더 업데이트
    if (line.startsWith('> 말투 기준:')) {
      const newHeader = '> 말투 기준: 에마·소피 항상 존댓말 / 지수·민준→에마·소피 반말(EP01 지수 제외) / 지수·민준→낯선 사람 존댓말'
      if (line !== newHeader) {
        if (!APPLY) console.log(`L${lineNum} [헤더]\n  "${line}"\n  → "${newHeader}"`)
        newLines.push(newHeader)
        changeCount++
        continue
      }
    }

    // 하드코딩 오버라이드 적용
    if (LINE_OVERRIDES[lineNum]) {
      if (line.trim() !== LINE_OVERRIDES[lineNum]) {
        if (!APPLY) console.log(`L${lineNum} EP${currentEp} [오버라이드]\n  "${line.trim()}"\n  → "${LINE_OVERRIDES[lineNum]}"`)
        newLines.push(LINE_OVERRIDES[lineNum])
        changeCount++
        continue
      }
    }

    // 대사 라인 파싱
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0 && colonIdx <= 6) {
      const speaker = line.slice(0, colonIdx).trim()
      const text = line.slice(colonIdx + 1).trim()

      // 변환 대상: 에마, 소피 (모든 EP), EP01 지수
      const needsConversion =
        speaker === '에마' ||
        speaker === '소피' ||
        (speaker === '지수' && currentEp === 1)

      if (needsConversion && text) {
        const newText = makePolite(text)
        if (newText !== text) {
          const newLine = `${speaker}: ${newText}`
          if (!APPLY) {
            console.log(`L${lineNum} EP${currentEp} [${speaker}]`)
            console.log(`  "${text}"`)
            console.log(`  → "${newText}"`)
          }
          newLines.push(newLine)
          changeCount++
          continue
        }
      }
    }

    newLines.push(line)
  }

  console.log(`\n총 변경: ${changeCount}건`)

  if (APPLY) {
    fs.writeFileSync(mdPath, newLines.join('\n'), 'utf-8')
    console.log('파일 저장 완료:', mdPath)
  } else {
    console.log('\n적용: npx tsx scripts/fix-speech-styles.ts --apply')
  }
}

main()
