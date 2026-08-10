/**
 * _tmp_categorize.mjs — 225개 신규 표현 카테고리 배정 분석
 * node scripts/_tmp_categorize.mjs
 *
 * 카테고리 7개:
 *   greeting          인사
 *   ordering-food     주문·음식
 *   getting-around    길찾기·교통
 *   shopping          쇼핑
 *   feelings-opinions 감정·의견
 *   hobbies-culture   취미·문화
 *   grammar-particles 문법·조사
 */
import { readFileSync } from 'fs'

const seo    = JSON.parse(readFileSync('C:/Users/msj15/Downloads/expressions-seo-325.json', 'utf-8'))
const allDb  = JSON.parse(readFileSync('./data/kpatto/source/expressions-all-325.json', 'utf-8'))

// id → db row (english, description, category from DB)
const dbMap  = Object.fromEntries(allDb.expressions.map(r => [r.id, r]))

// ── 기존 100건 카테고리 배정 (하드코딩 — expressions-config.ts 기준) ─────────
const EXISTING_CATS = {
  greeting: [790,791,789,787,824,825,826,796,797,819,854,855,805],
  'ordering-food': [770,771,772,776,793,794,795,782,801,802,778,785,817,816,820],
  'getting-around': [773,774,792,798,799,800,806,807,808,1375],
  shopping: [783,784,779,781,786,788,848,849,850,851,852,853],
  'feelings-opinions': [810,811,812,813,828,830,831,780,833,834,835,836,837,838,843,847,844],
  'hobbies-culture': [777,803,804,809,818,821,822,823,839,840,842,845,846],
  'grammar-particles': [896,1333,1334,1340,1344,1347,1355,1361,1362,1366,1367,1368,1372,1374,1377,1379,1380,1383,1384,1386],
}

// 기존 id → category
const existingCatMap = {}
for (const [cat, ids] of Object.entries(EXISTING_CATS)) {
  for (const id of ids) existingCatMap[id] = cat
}

// ── 신규 225건 자동 배정 규칙 ─────────────────────────────────────────────────
// slug·korean·english 패턴 매칭으로 1차 배정, 불확실하면 ambiguous에 넣기

function classify(row) {
  const slug = (row.slug ?? '').toLowerCase()
  const en   = (row.english ?? '').toLowerCase()
  const ko   = (row.korean ?? '')

  // grammar-particles: 문법 종결어미·조사 패턴
  if (/^[~\-]?(아|어|야|여|나|니|지|죠|거나|거든|면서|는데|더니|다가|려고|도록|으면|고서|고도|만약|비록|을수록|-(으)로서|을뿐만|ㄹ지라도)/.test(ko)
   || /\b(particle|grammar|tense|ending|suffix|clause|conjugat|formal)\b/.test(en)
   || /-(고|서|면|든|지|니까|는데|더니|만|뿐|도록|려고|아서|어서|으니|을수록)$/.test(slug)) {
    return 'grammar-particles'
  }

  // greeting: 처음 만남, 안부, 작별, 연락
  if (/(처음|반갑|오래간만|오랜만|안녕|잘 지내|수고|다음에|또 봐|헤어|goodbye|nice to meet|long time|farewell|how are you|see you|take care|bye|first time|let.s meet|contact|연락해|전화해|문자해|카카오)/i.test(en + ' ' + ko)
   || /(oraenman|cheoeumieonneunde|pallouhaedo|kakaotok|eonjedeunji-yeollak)/i.test(slug)) {
    return 'greeting'
  }

  // ordering-food: 음식, 카페, 식당, 배달
  if (/(음식|먹|드시|주문|카페|식당|배달|메뉴|맛|음료|커피|빵|포장|가져가|냉면|삼겹|치킨|피자|burger|coffee|cafe|food|eat|order|delivery|restaurant|hungry|taste|flavor|menu|takeout|chicken|pizza|noodle|ramen|bbq)/i.test(en + ' ' + ko)
   || /(baedal|meog|meok|sikyeo|jega-salgeyo|bap-hanbeon|deochipei)/i.test(slug)) {
    return 'ordering-food'
  }

  // getting-around: 교통, 지하철, 버스, 길, 위치
  if (/(지하철|버스|택시|기차|비행기|공항|역|정류장|길|방향|어디|몇 번|환승|subway|bus|taxi|train|airport|station|direction|where is|how far|transfer|exit|platform|navigate|lost)/i.test(en + ' ' + ko)
   || /(gayo|ga-juseyo|tayo|naeryeo|kkaji-ga|subway|station|direction|exit)/i.test(slug)) {
    return 'getting-around'
  }

  // shopping: 가격, 쇼핑, 물건 구매, 사이즈
  if (/(얼마|사다|사줘|쇼핑|가격|세일|할인|영수증|카드|현금|size|fit|buy|shop|price|cost|discount|sale|receipt|exchange|refund|brand|wear|color|how much)/i.test(en + ' ' + ko)
   || /(ibeo-bwasseo|ipeo|eolma|sayo|salja|sageul|shopping|haggle|size)/i.test(slug)) {
    return 'shopping'
  }

  // hobbies-culture: 드라마, K팝, 여행, 운동, 취미
  if (/(드라마|영화|노래|음악|공연|여행|운동|헬스|독서|게임|춤|사진|SNS|인스타|유튜브|drama|movie|song|music|concert|travel|sport|exercise|game|dance|photo|instagram|youtube|hobby|culture|webtoon|manhwa)/i.test(en + ' ' + ko)
   || /(drama|movie|song|music|travel|sport|game|dance|photo|instagram|youtube)/i.test(slug)) {
    return 'hobbies-culture'
  }

  // feelings-opinions: 감정, 생각, 의견
  if (/(기분|감정|행복|슬프|화나|설레|무서|불안|걱정|기대|외로|힘들|피곤|좋아|싫어|생각|의견|느낌|seem|feel|happy|sad|angry|nervous|excited|scared|tired|lonely|think|opinion|emotion|mood|miss|love|hate|bored|fun|boring|interesting|weird|cute)/i.test(en + ' ' + ko)) {
    return 'feelings-opinions'
  }

  return null  // 분류 불가
}

// ── 배정 수행 ─────────────────────────────────────────────────────────────────
const newRows  = seo.filter(r => r.is_new_slug)
const result   = {}
const ambiguous = []

for (const row of newRows) {
  const db  = dbMap[row.id] ?? {}
  const cat = classify({ ...row, english: db.english ?? row.english, korean: db.korean ?? row.korean ?? row.korean })
  if (cat) {
    if (!result[cat]) result[cat] = []
    result[cat].push({ id: row.id, slug: row.slug, korean: db.korean, english: db.english, episode: row.episode })
  } else {
    ambiguous.push({ id: row.id, slug: row.slug, korean: db.korean, english: db.english, episode: row.episode })
  }
}

// ── 보고 ─────────────────────────────────────────────────────────────────────
console.log('\n=== 신규 225건 카테고리 배정 결과 ===\n')
let total = 0
for (const [cat, rows] of Object.entries(result)) {
  console.log(`${cat}: ${rows.length}건`)
  for (const r of rows) console.log(`  id=${r.id} ep=${r.episode} "${r.korean}" / ${r.english}`)
  total += rows.length
  console.log()
}

console.log(`\n=== 애매한 항목 (${ambiguous.length}건) ===`)
for (const r of ambiguous) {
  console.log(`  id=${r.id} ep=${r.episode} slug="${r.slug}" | "${r.korean}" / ${r.english}`)
}

console.log(`\n총 자동 배정: ${total}건 / 애매: ${ambiguous.length}건 / 합계: ${total + ambiguous.length}건`)
