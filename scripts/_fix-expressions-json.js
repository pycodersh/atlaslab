/**
 * kp_expressions_with_examples.json의 literal_en / usage_en 오류 수정
 * A: literal_en이 pattern_ko(한국어)인 항목 → 영어로
 * B: 예문 앞부분이 literal_en에 들어간 항목 → 패턴 영어로
 * C: 패턴 앞머리만 남은 항목 → 완성된 영어로
 * D: usage_en이 "❌ 없음"인 항목 → 올바른 usage_en
 */
const fs = require('fs')
const path = require('path')

const EXPR_PATH = path.resolve(__dirname, '../data/kpatto/source/kp_expressions_with_examples.json')

const fixes = {
  // ── A: literal_en = pattern_ko (한국어 그대로) ────────────────────────────
  798:  { literal_en: 'I take the ~.' },
  799:  { literal_en: 'I get off at ~.' },
  800:  { literal_en: 'Please take me to ~.' },
  801:  { literal_en: 'Can you make it less ~?' },
  802:  { literal_en: 'Can I get a refill on ~?' },
  803:  { literal_en: 'What are you doing on ~?' },
  804:  { literal_en: 'Do you want to ~ together?' },
  805:  { literal_en: "I think I'll be a little late." },
  806:  { literal_en: "I'm lost." },
  807:  { literal_en: 'Just keep going straight.' },
  808:  { literal_en: 'Turn ~ at the corner.' },
  809:  { literal_en: 'Have you tried ~? / Have you seen ~?' },
  810:  { literal_en: "It's fun." },
  811:  { literal_en: 'I highly recommend it.' },
  812:  { literal_en: "What's the weather like in ~?" },
  813:  { literal_en: 'It looks like ~ is coming.' },
  816:  { literal_en: 'Do you have medicine for ~?' },
  817:  { literal_en: "It's better not to eat." },
  818:  { literal_en: "What's your hobby?" },
  819:  { literal_en: 'Me too.' },
  820:  { literal_en: "~ isn't that great." },
  821:  { literal_en: "What's famous around here?" },
  822:  { literal_en: "Let's take a photo together." },
  823:  { literal_en: 'Did the photo come out well?' },
  824:  { literal_en: 'Long time no see.' },
  825:  { literal_en: 'Have you been well?' },
  826:  { literal_en: 'See you next time.' },
  828:  { literal_en: 'How was ~?' },
  829:  { literal_en: 'It was my first time, but...' },
  830:  { literal_en: 'It seems like ~. / I think ~.' },
  831:  { literal_en: 'It seems ~. / Looks like ~.' },
  833:  { literal_en: 'I have to ~.' },
  834:  { literal_en: "Don't ~." },
  835:  { literal_en: "Don't forget to ~." },
  836:  { literal_en: 'What do you think about ~?' },
  837:  { literal_en: "That's true. / You make a good point." },
  838:  { literal_en: "I'm a bit different." },
  839:  { literal_en: 'Have you been to ~?' },
  840:  { literal_en: 'You have to go.' },
  841:  { literal_en: 'When are you free?' },
  842:  { literal_en: 'What are you watching these days?' },
  843:  { literal_en: "I'm totally hooked." },
  844:  { literal_en: "I can't wait for the next episode." },
  845:  { literal_en: 'Do you know this song?' },
  846:  { literal_en: 'What do the lyrics mean?' },
  847:  { literal_en: "It's so addictive." },
  848:  { literal_en: 'How do you take care of your ~?' },
  849:  { literal_en: 'Is ~ effective?' },
  850:  { literal_en: 'The reviews are great.' },
  851:  { literal_en: 'How often do you do it?' },
  852:  { literal_en: "It's good for your health." },
  853:  { literal_en: "I've been keeping it up." },
  854:  { literal_en: 'Where in ~ do you live?' },
  855:  { literal_en: 'Do you live alone?' },
  856:  { literal_en: "What's near ~?" },

  // ── B: 예문 앞부분이 literal_en으로 잘못 들어간 항목 ─────────────────────
  887:  { literal_en: 'It was unfamiliar at first, but...' },
  915:  { literal_en: "I'm used to it now." },
  949:  { literal_en: "Don't push yourself too hard." },
  1024: { literal_en: 'Korean feels comfortable now.' },
  1034: { literal_en: 'That makes sense.' },
  1043: { literal_en: 'The feeling stays with me.' },
  1044: { literal_en: 'I get totally absorbed.' },
  1053: { literal_en: 'I learned so much thanks to you.' },

  // ── C: 패턴 앞머리만 남은 항목 ───────────────────────────────────────────
  904:  { literal_en: "I'm still in the middle of ~ing." },
  947:  { literal_en: "It's surprisingly ~." },
  958:  { literal_en: 'You absolutely have to ~.' },
  976:  { literal_en: 'For some reason, I feel ~.' },
  985:  { literal_en: "It's way ~ than I expected." },
  1014: { literal_en: "For now, let's ~." },

  // ── D: usage_en = "❌ 없음" + A 중복 ──────────────────────────────────────
  1235: {
    literal_en: 'How long does ~ take?',
    usage_en: 'Ask how long something will take — travel time, delivery, or preparation.',
  },
}

const data = JSON.parse(fs.readFileSync(EXPR_PATH, 'utf-8'))

let fixedCount = 0
const log = { A: [], B: [], C: [], D: [] }

for (const e of data) {
  const f = fixes[e.id]
  if (!f) continue

  let type = 'A'
  if ([887, 915, 949, 1024, 1034, 1043, 1044, 1053].includes(e.id)) type = 'B'
  else if ([904, 947, 958, 976, 985, 1014].includes(e.id)) type = 'C'
  else if (e.id === 1235) type = 'D'

  if (f.literal_en) {
    e.literal_en = f.literal_en
    log[type].push(e.id)
    fixedCount++
  }
  if (f.usage_en) {
    e.usage_en = f.usage_en
  }
}

fs.writeFileSync(EXPR_PATH, JSON.stringify(data, null, 2), 'utf-8')
console.log(`✓ 수정 완료: ${fixedCount}건`)
console.log(`  A (한국어 그대로): ${log.A.length}건`)
console.log(`  B (예문 잘림):     ${log.B.length}건`)
console.log(`  C (패턴 앞머리):   ${log.C.length}건`)
console.log(`  D (usage없음):     ${log.D.length}건`)

// ── 재검증 ─────────────────────────────────────────────────────────────────
const after = JSON.parse(fs.readFileSync(EXPR_PATH, 'utf-8'))
const allIds_A = new Set([...Array.from({length:813-798+1},(_,i)=>798+i),
  ...Array.from({length:826-816+1},(_,i)=>816+i),
  ...Array.from({length:831-828+1},(_,i)=>828+i),
  ...Array.from({length:856-833+1},(_,i)=>833+i), 1235])

let stillKorean = 0, stillExample = 0, stillPrefix = 0, stillNoUsage = 0

for (const e of after) {
  // A 잔여: literal_en이 아직 한국어 (한글 포함)
  if (allIds_A.has(e.id) && /[가-힣]/.test(e.literal_en)) {
    stillKorean++
    console.log(`  ⚠ A 잔여: ${e.id} "${e.literal_en}"`)
  }
  // B 잔여: literal_en에 쉼표+문장 패턴이 남음 (예문 형태)
  if ([887,915,949,1024,1034,1043,1044,1053].includes(e.id) && e.literal_en.endsWith(',')) {
    stillExample++
    console.log(`  ⚠ B 잔여: ${e.id} "${e.literal_en}"`)
  }
  // C 잔여: literal_en이 한글로 시작하거나 "~"로만 이루어짐
  if ([904,947,958,976,985,1014].includes(e.id) && /^[가-힣~]/.test(e.literal_en)) {
    stillPrefix++
    console.log(`  ⚠ C 잔여: ${e.id} "${e.literal_en}"`)
  }
  // D 잔여
  if (e.id === 1235 && e.usage_en === '❌ 없음') {
    stillNoUsage++
    console.log(`  ⚠ D 잔여: ${e.id}`)
  }
}

console.log('\n재검증 결과:')
console.log(`  A 잔여: ${stillKorean}건`)
console.log(`  B 잔여: ${stillExample}건`)
console.log(`  C 잔여: ${stillPrefix}건`)
console.log(`  D 잔여: ${stillNoUsage}건`)
