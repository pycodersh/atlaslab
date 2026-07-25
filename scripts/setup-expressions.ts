/**
 * STEP 2: kp_expressions 46개 INSERT
 * STEP 3: kp_bubbles.expression_id 연결 (highlight_text 매칭)
 *
 * 실행 전: Supabase SQL Editor에서 setup-expressions-ddl.sql 먼저 실행
 * 사용법: npx tsx scripts/setup-expressions.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function ok(msg: string) { console.log(`  ✓ ${msg}`) }
function fail(msg: string): never { console.error(`  ✗ ${msg}`); process.exit(1) }

// ── STEP 2 Data ──────────────────────────────────────────────────────────────

const EXPRESSIONS = [
  // EP01 카페
  { korean: '~주세요', english: '"Give me ~"', description: 'Use this when you want something given to you.', structure: '[thing you want] + 주세요', category: '요청', examples: [{ ko: '물 주세요', en: 'Water, please.' }, { ko: '메뉴 주세요', en: 'Menu, please.' }, { ko: '영수증 주세요', en: 'Receipt, please.' }], tip: "Put what you want in front. That's it!", first_episode: 1 },
  { korean: '~뭐예요?', english: '"What is ~?"', description: 'Point at anything and ask what it is.', structure: '[thing] + 뭐예요?', category: '질문', examples: [{ ko: '이거 뭐예요?', en: 'What is this?' }, { ko: '저거 뭐예요?', en: 'What is that?' }, { ko: '이름이 뭐예요?', en: "What's your name?" }], tip: 'Point at anything and add 뭐예요? Done.', first_episode: 1 },
  { korean: '~이에요/예요', english: '"This is ~" / "I am ~"', description: 'Use this to describe what something is.', structure: '[noun] + 이에요/예요', category: '기타', examples: [{ ko: '이건 김치예요', en: 'This is kimchi.' }, { ko: '저는 학생이에요', en: "I'm a student." }, { ko: '여기 카페예요', en: "This is a café." }], tip: 'Ends in vowel → 예요. Ends in consonant → 이에요.', first_episode: 1 },
  { korean: '~있어요?', english: '"Do you have ~?" / "Is there ~?"', description: 'Ask if something exists or is available.', structure: '[thing] + 있어요?', category: '질문', examples: [{ ko: '자리 있어요?', en: 'Is there a seat?' }, { ko: '와이파이 있어요?', en: 'Do you have Wi-Fi?' }, { ko: '물 있어요?', en: 'Do you have water?' }], tip: 'Use this to ask if something exists or is available.', first_episode: 1 },
  { korean: '~얼마예요?', english: '"How much is ~?"', description: 'The easiest way to ask the price of anything.', structure: '[thing] + 얼마예요?', category: '질문', examples: [{ ko: '이거 얼마예요?', en: 'How much is this?' }, { ko: '다 해서 얼마예요?', en: 'How much is it all together?' }, { ko: '하루에 얼마예요?', en: 'How much per day?' }], tip: 'The easiest way to ask the price of anything.', first_episode: 1 },
  // EP02 지하철
  { korean: '~어떻게 가요?', english: '"How do I get to ~?"', description: 'Ask for directions to any place.', structure: '[place] + 어떻게 가요?', category: '질문', examples: [{ ko: '홍대 어떻게 가요?', en: 'How do I get to Hongdae?' }, { ko: '공항 어떻게 가요?', en: 'How do I get to the airport?' }, { ko: '여기 어떻게 가요?', en: 'How do I get here?' }], tip: 'Say the place + 어떻게 가요? and someone will help.', first_episode: 2 },
  { korean: '~가고 싶어요', english: '"I want to go to ~"', description: 'Say where you want to go.', structure: '[place] + 가고 싶어요', category: '희망', examples: [{ ko: '홍대 가고 싶어요', en: 'I want to go to Hongdae.' }, { ko: '한강 가고 싶어요', en: 'I want to go to Hangang.' }, { ko: '제주도 가고 싶어요', en: 'I want to go to Jeju.' }], tip: 'Say where you want to go + 가고 싶어요.', first_episode: 2 },
  { korean: '~어디예요?', english: '"Where is ~?"', description: 'The fastest way to find anything.', structure: '[place/thing] + 어디예요?', category: '질문', examples: [{ ko: '화장실 어디예요?', en: 'Where is the bathroom?' }, { ko: '출구 어디예요?', en: 'Where is the exit?' }, { ko: '홍대 어디예요?', en: 'Where is Hongdae?' }], tip: 'The fastest way to find anything. Just say the place + 어디예요?', first_episode: 2 },
  { korean: '~좋아요', english: '"I like ~" / "~ is great"', description: 'Express that you like something.', structure: '[thing] + 좋아요', category: '감정', examples: [{ ko: '서울 좋아요', en: 'I like Seoul.' }, { ko: '한국 음식 좋아요', en: 'Korean food is great.' }, { ko: '날씨 좋아요', en: 'The weather is nice.' }], tip: 'Simple and positive. Use it freely!', first_episode: 2 },
  // EP03 떡볶이
  { korean: '~하고 싶어요', english: '"I want to ~"', description: 'Say what action you want to do.', structure: '[action] + 고 싶어요', category: '희망', examples: [{ ko: '먹고 싶어요', en: 'I want to eat.' }, { ko: '가고 싶어요', en: 'I want to go.' }, { ko: '쉬고 싶어요', en: 'I want to rest.' }], tip: 'Add any action before 고 싶어요 to say what you want to do.', first_episode: 3 },
  { korean: '~할 수 있어요?', english: '"Can you ~?" / "Can I ~?"', description: 'Ask about ability or permission.', structure: '[action] + ㄹ/을 수 있어요?', category: '가능', examples: [{ ko: '매운 거 먹을 수 있어요?', en: 'Can you eat spicy food?' }, { ko: '한국어 할 수 있어요?', en: 'Can you speak Korean?' }, { ko: '여기서 앉을 수 있어요?', en: 'Can I sit here?' }], tip: 'Great for asking about ability or permission.', first_episode: 3 },
  { korean: '~못해요', english: '"I can\'t ~"', description: 'Say what you are not able to do.', structure: '못 + [action]', category: '가능', examples: [{ ko: '매운 거 못 먹어요', en: "I can't eat spicy food." }, { ko: '수영 못해요', en: "I can't swim." }, { ko: '운전 못해요', en: "I can't drive." }], tip: '못 goes before the action. Quick and honest!', first_episode: 3 },
  { korean: '~맞아요?', english: '"Is this ~ right?"', description: 'Confirm if something is correct.', structure: '[thing/place] + 맞아요?', category: '확인', examples: [{ ko: '여기 홍대 맞아요?', en: 'Is this Hongdae?' }, { ko: '이게 떡볶이 맞아요?', en: 'Is this tteokbokki?' }, { ko: '3번 출구 맞아요?', en: 'Is this exit 3?' }], tip: 'Use when you want to confirm something.', first_episode: 3 },
  // EP04 편의점
  { korean: '~해도 돼요?', english: '"Is it okay to ~?" / "Can I ~?"', description: 'Politely ask for permission.', structure: '[action] + 아/어도 돼요?', category: '가능', examples: [{ ko: '여기서 먹어도 돼요?', en: 'Is it okay to eat here?' }, { ko: '사진 찍어도 돼요?', en: 'Can I take a photo?' }, { ko: '앉아도 돼요?', en: 'Can I sit here?' }], tip: 'Polite way to ask for permission.', first_episode: 4 },
  { korean: '~어때요?', english: '"How about ~?" / "What do you think?"', description: 'Make suggestions or ask for opinions.', structure: '[thing/plan] + 어때요?', category: '질문', examples: [{ ko: '이거 어때요?', en: 'How about this?' }, { ko: '내일 어때요?', en: 'How about tomorrow?' }, { ko: '삼겹살 어때요?', en: 'What do you think of samgyeopsal?' }], tip: 'Perfect for suggestions and getting opinions.', first_episode: 4 },
  { korean: '~로 할게요', english: '"I\'ll go with ~" / "I\'ll take ~"', description: 'Use when making a decision or choice.', structure: '[choice] + 로/으로 할게요', category: '기타', examples: [{ ko: '그걸로 할게요', en: "I'll go with that." }, { ko: '카드로 할게요', en: "I'll pay by card." }, { ko: '이걸로 할게요', en: "I'll take this one." }], tip: 'Use when making a decision or choice.', first_episode: 4 },
  { korean: '~얼마나 걸려요?', english: '"How long does ~ take?"', description: 'Ask about time for anything.', structure: '[thing] + 얼마나 걸려요?', category: '질문', examples: [{ ko: '배달 얼마나 걸려요?', en: 'How long does delivery take?' }, { ko: '거기까지 얼마나 걸려요?', en: 'How long to get there?' }, { ko: '컵라면 얼마나 걸려요?', en: 'How long for cup ramen?' }], tip: 'Ask about time for anything — travel, cooking, waiting.', first_episode: 4 },
  // EP05 식당
  { korean: '~해 본 적 있어요?', english: '"Have you ever ~?"', description: "Ask about someone's experience.", structure: '[action] + 아/어 본 적 있어요?', category: '경험', examples: [{ ko: '삼겹살 먹어 본 적 있어요?', en: 'Have you ever had samgyeopsal?' }, { ko: '한국 와 본 적 있어요?', en: 'Have you ever been to Korea?' }, { ko: '노래방 가 본 적 있어요?', en: 'Have you ever been to a noraebang?' }], tip: 'Great for starting conversations about experiences.', first_episode: 5 },
  { korean: '~추천해 주세요', english: '"Please recommend ~"', description: 'Ask locals for recommendations.', structure: '[thing] + 추천해 주세요', category: '요청', examples: [{ ko: '메뉴 추천해 주세요', en: 'Please recommend something.' }, { ko: '맛집 추천해 주세요', en: 'Please recommend a restaurant.' }, { ko: '카페 추천해 주세요', en: 'Please recommend a café.' }], tip: 'Locals love helping. Just say what you need + 추천해 주세요.', first_episode: 5 },
  { korean: '~살 수 있어요?', english: '"Where can I buy ~?"', description: 'Ask where to find anything you want to buy.', structure: '[thing] + 어디서 살 수 있어요?', category: '질문', examples: [{ ko: '이거 어디서 살 수 있어요?', en: 'Where can I buy this?' }, { ko: '한국 마트에서 살 수 있어요?', en: 'Can I buy it at a Korean mart?' }, { ko: '온라인에서 살 수 있어요?', en: 'Can I buy it online?' }], tip: 'Ask where to find anything you want to buy.', first_episode: 5 },
  { korean: '~주실 수 있어요?', english: '"Could you ~, please?"', description: 'More polite than 주세요. Use with staff or strangers.', structure: '[action] + 주실 수 있어요?', category: '요청', examples: [{ ko: '천천히 말해주실 수 있어요?', en: 'Could you speak slowly?' }, { ko: '다시 한번 말해주실 수 있어요?', en: 'Could you say that again?' }, { ko: '물 더 주실 수 있어요?', en: 'Could you bring more water?' }], tip: 'More polite than 주세요. Use with staff or strangers.', first_episode: 5 },
  { korean: '~맛있어요', english: '"It\'s delicious!"', description: 'Express that food is delicious.', structure: '[food] + 맛있어요', category: '감정', examples: [{ ko: '진짜 너무 맛있어요', en: "It's really delicious!" }, { ko: '생각보다 맛있어요', en: 'More delicious than I expected.' }, { ko: '한국 음식 맛있어요', en: 'Korean food is delicious.' }], tip: 'Koreans love hearing this. Say it freely!', first_episode: 5 },
  // EP06 노래방
  { korean: '~좋아해요', english: '"I love ~" / "I like ~"', description: 'Express that you personally like something.', structure: '[thing] + 좋아해요', category: '감정', examples: [{ ko: '케이팝 좋아해요', en: 'I like K-pop.' }, { ko: '한국 음식 좋아해요', en: 'I like Korean food.' }, { ko: '이 가수 좋아해요', en: 'I like this singer.' }], tip: '좋아요 = something is good. 좋아해요 = you personally like it.', first_episode: 6 },
  { korean: '너무 ~해요', english: '"So ~!" / "Really ~!"', description: 'Make any expression stronger.', structure: '너무 + [adjective/verb]', category: '감정', examples: [{ ko: '너무 맛있어요', en: "It's so delicious!" }, { ko: '너무 재미있어요', en: "It's so fun!" }, { ko: '너무 예뻐요', en: "It's so pretty!" }], tip: 'Add 너무 before anything to make it stronger.', first_episode: 6 },
  { korean: '~잘해요', english: '"~ is great!" / "You\'re good at ~"', description: 'Give someone a compliment on their skill.', structure: '[skill] + 잘해요', category: '감정', examples: [{ ko: '노래 잘해요', en: "You're great at singing!" }, { ko: '한국어 잘해요', en: 'Your Korean is great!' }, { ko: '춤 잘해요', en: "You're good at dancing!" }], tip: 'A great compliment. Koreans will love hearing this.', first_episode: 6 },
  { korean: '진짜요? / 대박!', english: '"Really?" / "No way!" / "Amazing!"', description: 'React with surprise or excitement.', structure: '진짜요? / 대박!', category: '감정', examples: [{ ko: '진짜요?', en: 'Really?' }, { ko: '대박!', en: 'No way! / Amazing!' }, { ko: '진짜요? 대박!', en: 'Really? No way!' }], tip: 'Two expressions Koreans use all the time. Very natural!', first_episode: 6 },
  { korean: '~또 오고 싶어요', english: '"I want to come back!"', description: 'Say you want to return somewhere.', structure: '[place] + 또 오고 싶어요', category: '희망', examples: [{ ko: '노래방 또 오고 싶어요', en: 'I want to come back to noraebang!' }, { ko: '한국 또 오고 싶어요', en: 'I want to come back to Korea!' }, { ko: '여기 또 오고 싶어요', en: 'I want to come back here!' }], tip: "A lovely thing to say when you've had a great time.", first_episode: 6 },
  // EP07 시장
  { korean: '신기해요', english: '"It\'s so fascinating!" / "How unique!"', description: 'Express surprise or amazement at something new.', structure: '[thing] + 신기해요', category: '감정', examples: [{ ko: '한국 시장 진짜 신기해요', en: 'Korean markets are so fascinating!' }, { ko: '이거 신기해요', en: 'This is so unique!' }, { ko: '한국 문화 신기해요', en: 'Korean culture is so interesting!' }], tip: 'Use when something surprises or amazes you.', first_episode: 7 },
  { korean: '맛봐요!', english: '"Try it!" / "Have a taste!"', description: 'Invite someone to taste something.', structure: '맛봐요! / 한번 맛봐요!', category: '기타', examples: [{ ko: '맛봐요!', en: 'Try it!' }, { ko: '이거 맛봐요', en: 'Try this!' }, { ko: '한번 맛봐요', en: 'Give it a taste!' }], tip: 'Vendors say this all the time. It means free samples!', first_episode: 7 },
  { korean: '~더 주세요', english: '"More ~, please"', description: 'Ask for more of anything.', structure: '[thing] + 더 주세요', category: '요청', examples: [{ ko: '조금만 더 주세요', en: 'A little more, please.' }, { ko: '김치 더 주세요', en: 'More kimchi, please.' }, { ko: '소스 더 주세요', en: 'More sauce, please.' }], tip: 'Add 더 to ask for more of anything.', first_episode: 7 },
  { korean: '~깎아 주세요', english: '"Give me a discount, please"', description: 'Ask for a discount at traditional markets.', structure: '좀 깎아 주세요', category: '요청', examples: [{ ko: '좀 깎아 주세요', en: 'Please give me a discount.' }, { ko: '조금만 깎아 주세요', en: 'Just a small discount, please.' }, { ko: '두 개 사면 깎아 주세요', en: 'Discount if I buy two.' }], tip: 'Try this at traditional markets. It often works!', first_episode: 7 },
  { korean: '다 해서 얼마예요?', english: '"How much is it all together?"', description: 'Ask for the total price when buying multiple things.', structure: '다 해서 얼마예요?', category: '질문', examples: [{ ko: '다 해서 얼마예요?', en: 'How much is it all together?' }, { ko: '이거랑 저거 다 해서 얼마예요?', en: 'How much for this and that?' }, { ko: '세 개 다 해서 얼마예요?', en: 'How much for all three?' }], tip: 'Use when buying multiple things to get the total price.', first_episode: 7 },
  // EP08 K-뷰티
  { korean: '~써봤어요?', english: '"Have you tried ~?"', description: 'Ask if someone has tried a product.', structure: '[product] + 써봤어요?', category: '경험', examples: [{ ko: '이거 써봤어요?', en: 'Have you tried this?' }, { ko: '이 세럼 써봤어요?', en: 'Have you tried this serum?' }, { ko: '한국 화장품 써봤어요?', en: 'Have you tried Korean cosmetics?' }], tip: 'Great for asking about products. 써봤어요 = tried using.', first_episode: 8 },
  { korean: '~어떤 게 좋아요?', english: '"Which one is good for ~?"', description: 'Ask for specific recommendations.', structure: '[situation] + 어떤 게 좋아요?', category: '질문', examples: [{ ko: '건성 피부엔 어떤 게 좋아요?', en: 'Which is good for dry skin?' }, { ko: '선물로 어떤 게 좋아요?', en: 'Which is good as a gift?' }, { ko: '요즘 어떤 게 인기 있어요?', en: 'Which is popular these days?' }], tip: 'Ask for specific recommendations based on your needs.', first_episode: 8 },
  { korean: '~뭐 써요?', english: '"What do you use for ~?"', description: 'Ask anyone for their product recommendations.', structure: '[product type] + 뭐 써요?', category: '질문', examples: [{ ko: '선크림 뭐 써요?', en: 'What sunscreen do you use?' }, { ko: '토너 뭐 써요?', en: 'What toner do you use?' }, { ko: '샴푸 뭐 써요?', en: 'What shampoo do you use?' }], tip: 'Ask anyone for their product recommendations.', first_episode: 8 },
  // EP09 한강
  { korean: '날씨 너무 좋다!', english: '"The weather is so great!"', description: 'Express how great the weather is.', structure: '날씨 너무 좋다! / 날씨 너무 좋아요!', category: '감정', examples: [{ ko: '오늘 날씨 너무 좋다!', en: "Today's weather is so great!" }, { ko: '날씨 좋다, 나가자!', en: "Great weather, let's go out!" }, { ko: '날씨가 너무 좋아요', en: 'The weather is so nice.' }], tip: '좋다 is casual. With friends, drop the 요!', first_episode: 9 },
  { korean: '배달 돼요?', english: '"Do you deliver?" / "Is delivery available?"', description: 'Ask if delivery is available.', structure: '배달 돼요? / 여기도 배달 돼요?', category: '질문', examples: [{ ko: '여기도 배달 돼요?', en: 'Do you deliver here too?' }, { ko: '배달 얼마나 걸려요?', en: 'How long does delivery take?' }, { ko: '배달이 이렇게 빨라요?!', en: 'Delivery is this fast?!' }], tip: 'Korea has the fastest delivery in the world. Use this often!', first_episode: 9 },
  { korean: '생각보다 ~해요', english: '"More ~ than I expected"', description: 'Express surprise about something.', structure: '생각보다 + [adjective]해요', category: '감정', examples: [{ ko: '생각보다 맛있어요', en: 'More delicious than I expected.' }, { ko: '생각보다 빨라요', en: 'Faster than I expected.' }, { ko: '생각보다 어려워요', en: 'Harder than I expected.' }], tip: 'A natural way to express surprise about something.', first_episode: 9 },
  { korean: '다 같이 있어서 좋아요', english: '"I love that we\'re all here together"', description: 'Express happiness about being together.', structure: '다 같이 있어서 좋아요', category: '감정', examples: [{ ko: '다 같이 있어서 좋아요', en: "I love that we're all here together." }, { ko: '다 같이 먹어서 더 맛있어요', en: "It's better because we're eating together." }, { ko: '다 같이 있어서 너무 행복해요', en: "I'm so happy we're all together." }], tip: 'A warm expression Koreans use with close friends.', first_episode: 9 },
  { korean: '이미 ~해요', english: '"Already ~"', description: 'Say that something has already happened.', structure: '이미 + [verb/adjective]', category: '기타', examples: [{ ko: '이미 너무 좋아요', en: 'I already love it so much.' }, { ko: '이미 다 먹었어요', en: 'I already ate it all.' }, { ko: '이미 알고 있었어요', en: 'I already knew.' }], tip: 'Add 이미 before anything to say it already happened.', first_episode: 9 },
  // EP10 학교
  { korean: '떨려요', english: '"I\'m nervous" / "I\'m excited (nervous)"', description: 'Express nervous or excited feelings.', structure: '조금 떨려요 / 너무 떨려요', category: '감정', examples: [{ ko: '조금 떨려요', en: "I'm a little nervous." }, { ko: '너무 떨려요', en: "I'm so nervous." }, { ko: '설레고 떨려요', en: "I'm excited and nervous." }], tip: 'Koreans use 떨려요 for both nervous and excited feelings.', first_episode: 10 },
  { korean: '~에서 왔어요', english: '"I\'m from ~"', description: 'Say where you are from.', structure: '[country/city] + 에서 왔어요', category: '자기소개', examples: [{ ko: '미국에서 왔어요', en: "I'm from the US." }, { ko: '영국에서 왔어요', en: "I'm from the UK." }, { ko: '어디에서 왔어요?', en: 'Where are you from?' }], tip: 'The first thing people ask in Korea. Be ready!', first_episode: 10 },
  { korean: '잘 부탁드려요', english: '"Please take care of me" / "Nice to meet you"', description: 'Say this whenever you meet someone new in Korea.', structure: '잘 부탁드려요', category: '자기소개', examples: [{ ko: '잘 부탁드려요', en: 'Please take care of me.' }, { ko: '앞으로 잘 부탁드려요', en: 'I look forward to working with you.' }, { ko: '처음 뵙겠습니다, 잘 부탁드려요', en: 'Nice to meet you, please take care of me.' }], tip: 'No direct English translation — but say this whenever you meet someone new.', first_episode: 10 },
  { korean: '할 수 있었어요', english: '"I did it!" / "I was able to ~"', description: 'Express achievement or success.', structure: '[action] + ㄹ/을 수 있었어요', category: '감정', examples: [{ ko: '할 수 있었어요!', en: 'I did it!' }, { ko: '혼자서 할 수 있었어요', en: 'I was able to do it by myself!' }, { ko: '드디어 할 수 있었어요', en: 'I was finally able to do it!' }], tip: 'Say this when you achieve something. Very satisfying!', first_episode: 10 },
]

// ── Matching helpers ──────────────────────────────────────────────────────────

function getExprParts(korean: string): string[] {
  return korean
    .replace(/~/g, '')
    .replace(/[?!？！]/g, '')
    .trim()
    .split('/')
    .map(p => p.trim())
    .filter(Boolean)
}

function scoreMatch(exprKorean: string, highlight: string): number {
  const parts = getExprParts(exprKorean)
  let best = -1
  for (const part of parts) {
    if (part === highlight) {
      best = Math.max(best, 1000 + part.length)            // exact match
    } else if (highlight.endsWith(part)) {
      best = Math.max(best, 100 + part.length)             // expr is suffix of highlight
    } else if (part.endsWith(highlight)) {
      best = Math.max(best, highlight.length)              // highlight is suffix of expr
    }
  }
  return best
}

// ── STEP 2: INSERT ────────────────────────────────────────────────────────────

async function step2InsertExpressions() {
  console.log('\n[STEP 2] kp_expressions 46개 INSERT')

  // Check if already populated
  const { count } = await supabase
    .from('kp_expressions')
    .select('id', { count: 'exact', head: true })
  if (count && count > 0) {
    console.log(`  ⚠️  이미 ${count}개 존재. 스킵합니다. (초기화 후 재실행하려면 수동으로 DELETE)`)
    return
  }

  const { data, error } = await supabase
    .from('kp_expressions')
    .insert(EXPRESSIONS)
    .select('id')
  if (error) fail(`INSERT 실패: ${error.message}`)
  ok(`${data?.length ?? 0}개 INSERT 완료`)
}

// ── STEP 3: Link expression_id ────────────────────────────────────────────────

async function step3LinkExpressions() {
  console.log('\n[STEP 3] kp_bubbles.expression_id 연결')

  // Fetch all expressions
  const { data: exprs, error: e1 } = await supabase
    .from('kp_expressions')
    .select('id, korean')
  if (e1 || !exprs) fail(`expressions fetch 실패: ${e1?.message}`)

  // Fetch EP01~10 episode IDs
  const { data: eps, error: e2 } = await supabase
    .from('kp_episodes')
    .select('id, episode_num')
    .lte('episode_num', 10)
    .gte('episode_num', 1)
  if (e2 || !eps) fail(`episodes fetch 실패: ${e2?.message}`)
  const epIds = eps.map(e => e.id)

  // Fetch all bubbles with highlight_text
  const { data: bubbles, error: e3 } = await supabase
    .from('kp_bubbles')
    .select('id, highlight_text, expression_id')
    .in('episode_id', epIds)
    .not('highlight_text', 'is', null)
  if (e3 || !bubbles) fail(`bubbles fetch 실패: ${e3?.message}`)

  let matched = 0
  let skipped = 0
  const unmatched: string[] = []

  for (const bubble of bubbles) {
    if (bubble.expression_id) { skipped++; continue } // already linked

    const ht = bubble.highlight_text as string
    let bestExpr: { id: number; korean: string } | null = null
    let bestScore = -1

    for (const expr of exprs) {
      const score = scoreMatch(expr.korean, ht)
      if (score > bestScore) { bestScore = score; bestExpr = expr }
    }

    if (!bestExpr || bestScore < 0) {
      unmatched.push(ht)
      continue
    }

    const { error: eu } = await supabase
      .from('kp_bubbles')
      .update({ expression_id: bestExpr.id })
      .eq('id', bubble.id)
    if (eu) { console.log(`  ⚠️  update id=${bubble.id}: ${eu.message}`); continue }
    ok(`"${ht}" → "${bestExpr.korean}"`)
    matched++
  }

  if (skipped) console.log(`  ℹ️  ${skipped}개 이미 연결됨 (스킵)`)
  ok(`총 ${matched}개 연결 완료`)

  if (unmatched.length) {
    console.log(`\n  ⚠️  연결 안 된 highlight_text (${unmatched.length}개):`)
    unmatched.forEach(h => console.log(`       - "${h}"`))
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  await step2InsertExpressions()
  await step3LinkExpressions()
  console.log('\n✓ setup-expressions 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
