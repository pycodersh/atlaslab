/**
 * 누락된 53개 Focus Pattern을 kp_expressions에 INSERT하고
 * 해당 에피소드 대사와 kp_dialogue_expressions(role='focus')로 연결
 *
 * 규칙:
 *  - kp_expressions.korean 동일 값이 없는 경우에만 INSERT
 *  - ~(으)ㄹ 줄 몰랐어요: 1회 INSERT, EP81 + EP86 양쪽 연결
 *  - 기존 레코드 수정·삭제 금지
 *
 * 실행: npx tsx scripts/insert-missing-patterns.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

interface PatternDef {
  korean: string
  english: string
  description: string
  examples: Array<{ ko: string; en: string }>
  episodes: number[]      // 에피소드 번호 (숫자)
  searchTerms: string[]   // kp_dialogues.text_ko 검색어 (우선순위 순)
}

const PATTERNS: PatternDef[] = [
  {
    korean: '~먹을 수 있어요?',
    english: 'Can you eat ~?',
    description: 'Used to ask whether someone can eat a certain food, often because it may be spicy or cause an allergy.',
    examples: [
      { ko: '매운 음식 먹을 수 있어요?', en: 'Can you eat spicy food?' },
      { ko: '해산물 먹을 수 있어요?', en: 'Can you eat seafood?' },
      { ko: '땅콩 먹을 수 있어요?', en: 'Can you eat peanuts?' },
    ],
    episodes: [3],
    searchTerms: ['먹을 수 있어요'],
  },
  {
    korean: '~아/어야 할지 모르겠어요',
    english: "I don't know what I should ~.",
    description: 'Used when you are unsure what to do, choose, buy, or say.',
    examples: [
      { ko: '뭘 사야 할지 모르겠어요.', en: "I don't know what I should buy." },
      { ko: '어디로 가야 할지 모르겠어요.', en: "I don't know where I should go." },
      { ko: '뭐라고 말해야 할지 모르겠어요.', en: "I don't know what I should say." },
    ],
    episodes: [8],
    searchTerms: ['할지 모르겠어요', '야 할지 모르겠어요'],
  },
  {
    korean: '~이/가 들어가 있어요?',
    english: 'Does it contain ~?',
    description: 'Used to ask whether a food, drink, or product contains a certain ingredient.',
    examples: [
      { ko: '이 음식에 고기가 들어가 있어요?', en: 'Does this dish contain meat?' },
      { ko: '우유가 들어가 있어요?', en: 'Does it contain milk?' },
      { ko: '땅콩이 들어가 있어요?', en: 'Does it contain peanuts?' },
    ],
    episodes: [12],
    searchTerms: ['들어가 있어요', '들어가 있'],
  },
  {
    korean: '~아/어야겠다',
    english: 'I should ~. / I\'d better ~.',
    description: 'Used when you realize or decide that you should do something.',
    examples: [
      { ko: '우산을 챙겨야겠다.', en: 'I should take an umbrella.' },
      { ko: '이제 가야겠다.', en: 'I should go now.' },
      { ko: '오늘 일찍 자야겠다.', en: 'I should go to bed early today.' },
    ],
    episodes: [16],
    searchTerms: ['야겠다', '아야겠다', '어야겠다'],
  },
  {
    korean: '~이/가 아파요',
    english: 'My ~ hurts.',
    description: 'Used to say which part of your body hurts.',
    examples: [
      { ko: '머리가 아파요.', en: 'My head hurts.' },
      { ko: '배가 아파요.', en: 'My stomach hurts.' },
      { ko: '목이 아파요.', en: 'My throat hurts.' },
    ],
    episodes: [17],
    searchTerms: ['가 아파요', '이 아파요', '아파요'],
  },
  {
    korean: '~었어/았어',
    english: 'I did ~. / It was ~.',
    description: 'Used in casual speech to talk about a completed action or past situation.',
    examples: [
      { ko: '어제 영화를 봤어.', en: 'I watched a movie yesterday.' },
      { ko: '친구를 만났어.', en: 'I met a friend.' },
      { ko: '한강에 갔어.', en: 'I went to the Han River.' },
    ],
    episodes: [21],
    searchTerms: ['었어', '았어', '봤어'],
  },
  {
    korean: '~ㄹ/을 거야',
    english: 'I will ~. / It will ~.',
    description: 'Used in casual speech to talk about a future plan, prediction, or intention.',
    examples: [
      { ko: '내일 갈 거야.', en: "I'm going tomorrow." },
      { ko: '곧 비가 올 거야.', en: 'It will rain soon.' },
      { ko: '저녁에 전화할 거야.', en: "I'll call you this evening." },
    ],
    episodes: [22],
    searchTerms: ['거야', '올 거야', '갈 거야'],
  },
  {
    korean: '한국 친구를 사귀고 싶어요',
    english: 'I want to make Korean friends.',
    description: 'Used to express a desire to make Korean friends.',
    examples: [
      { ko: '한국 친구를 사귀고 싶어요.', en: 'I want to make Korean friends.' },
      { ko: '학교에서 새 친구를 사귀고 싶어요.', en: 'I want to make new friends at school.' },
      { ko: '다양한 나라의 친구를 사귀고 싶어요.', en: 'I want to make friends from different countries.' },
    ],
    episodes: [33],
    searchTerms: ['사귀고 싶어요', '친구를 사귀'],
  },
  {
    korean: '~거든요',
    english: 'You see, ~. / Because ~.',
    description: 'Used to give background information or explain a reason the listener may not know.',
    examples: [
      { ko: '저는 한국어를 배우거든요.', en: "You see, I'm learning Korean." },
      { ko: '오늘 약속이 있거든요.', en: 'I have plans today, you see.' },
      { ko: '이 식당에 자주 오거든요.', en: 'I come to this restaurant often, you see.' },
    ],
    episodes: [41],
    searchTerms: ['거든요'],
  },
  {
    korean: '~더라고요',
    english: 'I noticed that ~. / It turned out that ~.',
    description: 'Used to share something you personally noticed or experienced.',
    examples: [
      { ko: '생각보다 맛있더라고요.', en: 'I found it tastier than expected.' },
      { ko: '사람이 정말 많더라고요.', en: 'I noticed there were a lot of people.' },
      { ko: '밤에는 춥더라고요.', en: 'I found that it was cold at night.' },
    ],
    episodes: [41],
    searchTerms: ['더라고요'],
  },
  {
    korean: '~아/어 줄게요',
    english: "I'll ~ for you.",
    description: 'Used to offer to do something for another person.',
    examples: [
      { ko: '제가 도와줄게요.', en: "I'll help you." },
      { ko: '사진 찍어 줄게요.', en: "I'll take a picture for you." },
      { ko: '나중에 알려 줄게요.', en: "I'll tell you later." },
    ],
    episodes: [45],
    searchTerms: ['줄게요', '어 줄게요', '아 줄게요'],
  },
  {
    korean: '~이/가 제일 좋아',
    english: 'I like ~ the most.',
    description: 'Used in casual speech to say which person, thing, or activity you like best.',
    examples: [
      { ko: '나는 봄이 제일 좋아.', en: 'I like spring the most.' },
      { ko: '이 노래가 제일 좋아.', en: 'I like this song the most.' },
      { ko: '한국 음식 중에는 불고기가 제일 좋아.', en: 'I like bulgogi the most among Korean foods.' },
    ],
    episodes: [50],
    searchTerms: ['이 제일 좋아', '가 제일 좋아', '제일 좋아'],
  },
  {
    korean: '~ㄹ/을 거예요',
    english: "I will ~. / I'm going to ~.",
    description: 'Used to talk politely about a future plan, intention, or prediction.',
    examples: [
      { ko: '내일 공부할 거예요.', en: "I'm going to study tomorrow." },
      { ko: '주말에 여행할 거예요.', en: "I'm going to travel this weekend." },
      { ko: '다음 달에 한국에 갈 거예요.', en: "I'm going to Korea next month." },
    ],
    episodes: [51],
    searchTerms: ['ㄹ 거예요', '할 거예요', '갈 거예요', '거예요'],
  },
  {
    korean: '~어/아 봤어?',
    english: 'Have you tried ~?',
    description: 'Used in casual speech to ask whether someone has tried or experienced something.',
    examples: [
      { ko: '김치 먹어 봤어?', en: 'Have you tried kimchi?' },
      { ko: '한복 입어 봤어?', en: 'Have you tried wearing hanbok?' },
      { ko: '제주도에 가 봤어?', en: 'Have you been to Jeju Island?' },
    ],
    episodes: [53],
    searchTerms: ['봤어', '먹어 봤어', '가 봤어'],
  },
  {
    korean: '~가르쳐 줄 수 있어?',
    english: 'Can you teach me ~?',
    description: 'Used in casual speech to ask someone to teach or show you how to do something.',
    examples: [
      { ko: '영어 가르쳐 줄 수 있어?', en: 'Can you teach me English?' },
      { ko: '이 춤 가르쳐 줄 수 있어?', en: 'Can you teach me this dance?' },
      { ko: '사용법을 가르쳐 줄 수 있어?', en: 'Can you show me how to use it?' },
    ],
    episodes: [54],
    searchTerms: ['가르쳐 줄 수 있어', '가르쳐 줄'],
  },
  {
    korean: '~어떻게 해요?',
    english: 'How do you say/do ~?',
    description: 'Used to ask how to say something or how to do something.',
    examples: [
      { ko: '이거 한국어로 어떻게 해요?', en: 'How do you say this in Korean?' },
      { ko: '주문은 어떻게 해요?', en: 'How do I order?' },
      { ko: '이 앱은 어떻게 사용해요?', en: 'How do I use this app?' },
    ],
    episodes: [54],
    searchTerms: ['어떻게 해요', '어떻게 하'],
  },
  {
    korean: '~해봤어요?',
    english: 'Have you tried ~? / Have you ever done ~?',
    description: 'Used to ask politely whether someone has tried or experienced an activity.',
    examples: [
      { ko: '카페에서 일해봤어요?', en: 'Have you worked at a café?' },
      { ko: '혼자 여행해봤어요?', en: 'Have you traveled alone?' },
      { ko: '한국 음식을 만들어봤어요?', en: 'Have you made Korean food?' },
    ],
    episodes: [57],
    searchTerms: ['해봤어요', '봤어요'],
  },
  {
    korean: '어땠어요?',
    english: 'How was it?',
    description: "Used to ask about someone's opinion or experience after something happened.",
    examples: [
      { ko: '여행 어땠어요?', en: 'How was the trip?' },
      { ko: '첫 수업 어땠어요?', en: 'How was your first class?' },
      { ko: '새 직장 어땠어요?', en: 'How was your new job?' },
    ],
    episodes: [57],
    searchTerms: ['어땠어요'],
  },
  {
    korean: '도전해 볼게요',
    english: "I'll give it a try.",
    description: 'Used when you decide to try something new or difficult.',
    examples: [
      { ko: '저도 도전해 볼게요.', en: "I'll give it a try too." },
      { ko: '이번에는 혼자 도전해 볼게요.', en: "I'll try it by myself this time." },
      { ko: '어려워도 도전해 볼게요.', en: "I'll give it a try even if it's difficult." },
    ],
    episodes: [57],
    searchTerms: ['도전해 볼게요', '도전'],
  },
  {
    korean: '나쁘지 않은데요',
    english: "It's not bad.",
    description: 'Used to give a mild or careful positive opinion without sounding too enthusiastic.',
    examples: [
      { ko: '이 디자인 나쁘지 않은데요.', en: "This design isn't bad." },
      { ko: '맛이 나쁘지 않은데요.', en: "The taste isn't bad." },
      { ko: '생각보다 나쁘지 않은데요.', en: "It's not as bad as I expected." },
    ],
    episodes: [61],
    searchTerms: ['나쁘지 않은데요', '나쁘지 않'],
  },
  {
    korean: '저도 그렇게 생각해요',
    english: 'I think so too.',
    description: "Used to politely agree with another person's opinion.",
    examples: [
      { ko: '저도 그렇게 생각해요.', en: 'I think so too.' },
      { ko: '좋은 생각이에요. 저도 그렇게 생각해요.', en: "That's a good idea. I think so too." },
      { ko: '맞아요. 저도 그렇게 생각해요.', en: "That's right. I think so too." },
    ],
    episodes: [61],
    searchTerms: ['그렇게 생각해요', '저도 그렇게'],
  },
  {
    korean: '~이/가 이렇게 ~해요?',
    english: 'Is ~ this ...?',
    description: 'Used to express surprise that something has a quality to such a strong degree.',
    examples: [
      { ko: '한국 봄이 이렇게 예뻐요?', en: 'Is spring in Korea this beautiful?' },
      { ko: '이 음식이 이렇게 매워요?', en: 'Is this food this spicy?' },
      { ko: '지하철이 이렇게 빨라요?', en: 'Is the subway this fast?' },
    ],
    episodes: [67],
    searchTerms: ['이렇게 예뻐요', '이렇게 매워요', '이렇게 빨라요', '이렇게'],
  },
  {
    korean: '이때가 제일 좋아요',
    english: 'I like this time the most.',
    description: 'Used to say that a certain time, season, or moment is your favorite.',
    examples: [
      { ko: '벚꽃이 필 때가 제일 좋아요.', en: 'I like it most when the cherry blossoms bloom.' },
      { ko: '저는 아침 이때가 제일 좋아요.', en: 'I like this time in the morning the most.' },
      { ko: '날씨가 선선한 이때가 제일 좋아요.', en: 'I like this cool time of year the most.' },
    ],
    episodes: [67],
    searchTerms: ['이때가 제일 좋아요', '제일 좋아요', '이때가 제일'],
  },
  {
    korean: '~은/는 어때요?',
    english: 'How about ~? / What is ~ like?',
    description: "Used to ask about a topic, option, season, place, or person's opinion.",
    examples: [
      { ko: '여름은 어때요?', en: 'What is summer like?' },
      { ko: '이 음식은 어때요?', en: 'How is this food?' },
      { ko: '주말은 어때요?', en: 'How about the weekend?' },
    ],
    episodes: [67],
    searchTerms: ['은 어때요', '는 어때요', '어때요'],
  },
  {
    korean: '제가 잘못했어요',
    english: 'It was my fault.',
    description: 'Used to admit politely that you made a mistake.',
    examples: [
      { ko: '제가 잘못했어요.', en: 'It was my fault.' },
      { ko: '정말 미안해요. 제가 잘못했어요.', en: "I'm really sorry. It was my fault." },
      { ko: '이번 일은 제가 잘못했어요.', en: 'This was my mistake.' },
    ],
    episodes: [68],
    searchTerms: ['잘못했어요', '제가 잘못'],
  },
  {
    korean: '~려고 할게요',
    english: "I'll try to ~.",
    description: 'Used to promise that you will make an effort to do something.',
    examples: [
      { ko: '다음에는 일찍 오려고 할게요.', en: "I'll try to come early next time." },
      { ko: '더 자주 연락하려고 할게요.', en: "I'll try to contact you more often." },
      { ko: '상대방을 이해하려고 할게요.', en: "I'll try to understand the other person." },
    ],
    episodes: [68],
    searchTerms: ['려고 할게요', '하려고 할게요'],
  },
  {
    korean: '~어디에 버려요?',
    english: 'Where do I throw away ~?',
    description: 'Used to ask where a certain type of trash or item should be discarded.',
    examples: [
      { ko: '이 병은 어디에 버려요?', en: 'Where do I throw away this bottle?' },
      { ko: '음식물 쓰레기는 어디에 버려요?', en: 'Where do I throw away food waste?' },
      { ko: '종이는 어디에 버려요?', en: 'Where do I throw away paper?' },
    ],
    episodes: [70],
    searchTerms: ['어디에 버려요', '버려요'],
  },
  {
    korean: '~철저히 해요?',
    english: 'Do you do ~ strictly?',
    description: 'Used to ask whether a rule or practice is followed carefully and thoroughly.',
    examples: [
      { ko: '분리수거를 철저히 해요?', en: 'Do you sort recycling carefully?' },
      { ko: '위생 관리를 철저히 해요?', en: 'Do you manage hygiene strictly?' },
      { ko: '보안 검사를 철저히 해요?', en: 'Do you carry out security checks thoroughly?' },
    ],
    episodes: [70],
    searchTerms: ['철저히 해요', '철저히'],
  },
  {
    korean: '~신경 써야겠어요',
    english: 'I should pay attention to ~.',
    description: 'Used when you realize that you need to be more careful about something.',
    examples: [
      { ko: '분리수거에 신경 써야겠어요.', en: 'I should pay more attention to recycling.' },
      { ko: '건강에 신경 써야겠어요.', en: 'I should pay more attention to my health.' },
      { ko: '발음에 더 신경 써야겠어요.', en: 'I should pay more attention to my pronunciation.' },
    ],
    episodes: [70],
    searchTerms: ['신경 써야겠어요', '신경 써야'],
  },
  {
    korean: '뭔가 설레요',
    english: 'Something feels exciting.',
    description: 'Used when you feel excited or pleasantly nervous without knowing exactly why.',
    examples: [
      { ko: '오늘은 뭔가 설레요.', en: 'Something feels exciting today.' },
      { ko: '여행 전날이라 뭔가 설레요.', en: "I feel excited because it's the day before the trip." },
      { ko: '이곳에 오니까 뭔가 설레요.', en: 'Being here makes me feel excited.' },
    ],
    episodes: [71],
    searchTerms: ['설레요', '뭔가 설레'],
  },
  {
    korean: '이런 순간이 소중해요',
    english: 'Moments like this are precious.',
    description: 'Used to express appreciation for a meaningful or special moment.',
    examples: [
      { ko: '이런 순간이 소중해요.', en: 'Moments like this are precious.' },
      { ko: '친구들과 함께하는 이런 순간이 소중해요.', en: 'Moments like this with friends are precious.' },
      { ko: '평범하지만 이런 순간이 소중해요.', en: "It's ordinary, but moments like this are precious." },
    ],
    episodes: [71],
    searchTerms: ['이런 순간이 소중해요', '소중해요', '순간이 소중'],
  },
  {
    korean: '오해가 있었던 것 같아요',
    english: 'I think there was a misunderstanding.',
    description: 'Used to gently explain that people may have misunderstood each other.',
    examples: [
      { ko: '우리 사이에 오해가 있었던 것 같아요.', en: 'I think there was a misunderstanding between us.' },
      { ko: '제 말에 오해가 있었던 것 같아요.', en: 'I think there was a misunderstanding about what I said.' },
      { ko: '서로 오해가 있었던 것 같아요.', en: 'I think we misunderstood each other.' },
    ],
    episodes: [72],
    searchTerms: ['오해가 있었던', '오해가'],
  },
  {
    korean: '~뜻이 아니었어요',
    english: "I didn't mean ~.",
    description: 'Used to clarify that your words or actions were understood differently from what you intended.',
    examples: [
      { ko: '그런 뜻이 아니었어요.', en: "I didn't mean that." },
      { ko: '무시하려는 뜻이 아니었어요.', en: "I didn't mean to ignore you." },
      { ko: '화내려는 뜻이 아니었어요.', en: "I didn't mean to get angry." },
    ],
    episodes: [72],
    searchTerms: ['뜻이 아니었어요', '그런 뜻이 아니'],
  },
  {
    korean: '충분히 이해해요',
    english: 'I completely understand.',
    description: 'Used to reassure someone that you understand their feelings or situation.',
    examples: [
      { ko: '무슨 말인지 충분히 이해해요.', en: 'I completely understand what you mean.' },
      { ko: '그 마음 충분히 이해해요.', en: 'I completely understand how you feel.' },
      { ko: '상황을 충분히 이해해요.', en: 'I fully understand the situation.' },
    ],
    episodes: [72],
    searchTerms: ['충분히 이해해요', '충분히 이해'],
  },
  {
    korean: '~지 않길 잘했어요',
    english: "I'm glad I didn't ~.",
    description: 'Used to say that not doing something was the right decision.',
    examples: [
      { ko: '포기하지 않길 잘했어요.', en: "I'm glad I didn't give up." },
      { ko: '약속을 취소하지 않길 잘했어요.', en: "I'm glad I didn't cancel the plan." },
      { ko: '너무 일찍 가지 않길 잘했어요.', en: "I'm glad I didn't leave too early." },
    ],
    episodes: [73],
    searchTerms: ['않길 잘했어요', '지 않길'],
  },
  {
    korean: '알고 보면 ~해요',
    english: 'Once you understand it, it is ~.',
    description: 'Used to say that something is different or easier after you understand it better.',
    examples: [
      { ko: '한국어도 알고 보면 쉬워요.', en: 'Korean is easy once you understand it.' },
      { ko: '이 규칙도 알고 보면 간단해요.', en: 'This rule is simple once you understand it.' },
      { ko: '그 사람도 알고 보면 친절해요.', en: 'That person is kind once you get to know them.' },
    ],
    episodes: [76],
    searchTerms: ['알고 보면'],
  },
  {
    korean: '~차이가 뭐예요?',
    english: 'What is the difference between ~?',
    description: 'Used to ask how two things, words, or ideas are different.',
    examples: [
      { ko: '이 두 단어의 차이가 뭐예요?', en: 'What is the difference between these two words?' },
      { ko: '존댓말과 반말의 차이가 뭐예요?', en: 'What is the difference between polite and casual speech?' },
      { ko: '이 두 메뉴의 차이가 뭐예요?', en: 'What is the difference between these two menu items?' },
    ],
    episodes: [76],
    searchTerms: ['차이가 뭐예요', '차이가 뭐'],
  },
  {
    korean: '이게 포인트예요',
    english: 'This is the key point.',
    description: 'Used to emphasize the most important part of an explanation.',
    examples: [
      { ko: '이게 포인트예요.', en: 'This is the key point.' },
      { ko: '발음에서는 이게 포인트예요.', en: 'This is the key point in pronunciation.' },
      { ko: '이 부분이 가장 중요해요. 이게 포인트예요.', en: 'This part is the most important. This is the key point.' },
    ],
    episodes: [76],
    searchTerms: ['포인트예요', '이게 포인트'],
  },
  {
    korean: '~고 싶긴 해요',
    english: 'I do want to ~, though.',
    description: 'Used to admit that you want something while suggesting there is a concern or contrast.',
    examples: [
      { ko: '한국에 더 있고 싶긴 해요.', en: 'I do want to stay in Korea longer, though.' },
      { ko: '같이 가고 싶긴 해요.', en: 'I do want to go together, though.' },
      { ko: '사고 싶긴 해요.', en: 'I do want to buy it, though.' },
    ],
    episodes: [78],
    searchTerms: ['싶긴 해요', '고 싶긴', '싶긴'],
  },
  {
    korean: '~을/를 위해 ~할 거예요',
    english: 'I will ~ for ~.',
    description: 'Used to state what you plan to do for a goal, person, or purpose.',
    examples: [
      { ko: '꿈을 위해 열심히 공부할 거예요.', en: 'I will study hard for my dream.' },
      { ko: '건강을 위해 운동할 거예요.', en: 'I will exercise for my health.' },
      { ko: '가족을 위해 최선을 다할 거예요.', en: 'I will do my best for my family.' },
    ],
    episodes: [78],
    searchTerms: ['꿈을 위해', '를 위해', '을 위해', '위해'],
  },
  {
    korean: '~다고 하던데요',
    english: 'I heard that ~.',
    description: 'Used to mention information you heard from another person or source.',
    examples: [
      { ko: '이 식당이 맛있다고 하던데요.', en: 'I heard that this restaurant is good.' },
      { ko: '내일 비가 온다고 하던데요.', en: 'I heard that it will rain tomorrow.' },
      { ko: '그 영화가 재미있다고 하던데요.', en: 'I heard that the movie is interesting.' },
    ],
    episodes: [81],
    searchTerms: ['다고 하던데요', '하던데요'],
  },
  {
    korean: '~다더라고요',
    english: 'I heard that ~. / I found out that ~.',
    description: 'Used to pass along something you heard or learned, often with a sense of discovery.',
    examples: [
      { ko: '그 카페가 좋다더라고요.', en: 'I heard that café is good.' },
      { ko: '주말에는 사람이 많다더라고요.', en: "I heard that it's crowded on weekends." },
      { ko: '한국 겨울이 춥다더라고요.', en: 'I heard that Korean winters are cold.' },
    ],
    episodes: [81],
    searchTerms: ['다더라고요'],
  },
  {
    // 특수: EP81 + EP86 양쪽 연결
    korean: '~(으)ㄹ 줄 몰랐어요',
    english: "I didn't know that ~ would/could happen.",
    description: 'Used to express surprise about something you did not expect or know.',
    examples: [
      { ko: '이렇게 맛있을 줄 몰랐어요.', en: "I didn't know it would be this delicious." },
      { ko: '사람이 이렇게 많을 줄 몰랐어요.', en: "I didn't know there would be so many people." },
      { ko: '한국어로 대화할 수 있을 줄 몰랐어요.', en: "I didn't know I would be able to have a conversation in Korean." },
    ],
    episodes: [81, 86],
    searchTerms: ['줄 몰랐어요', 'ㄹ 줄 몰랐어요', '을 줄 몰랐어요'],
  },
  {
    korean: '흔한 일이에요?',
    english: 'Is that common?',
    description: 'Used to ask whether an event or situation happens often.',
    examples: [
      { ko: '이런 일이 흔한 일이에요?', en: 'Is this kind of thing common?' },
      { ko: '지하철이 늦는 게 흔한 일이에요?', en: 'Is it common for the subway to be late?' },
      { ko: '겨울에 눈이 많이 오는 게 흔한 일이에요?', en: 'Is heavy snow common in winter?' },
    ],
    episodes: [86],
    searchTerms: ['흔한 일이에요', '흔한 일'],
  },
  {
    korean: '생각보다 훨씬 ~해요',
    english: 'It is much more ~ than expected.',
    description: 'Used to emphasize that something is far beyond what you expected.',
    examples: [
      { ko: '생각보다 훨씬 맛있어요.', en: "It's much tastier than I expected." },
      { ko: '생각보다 훨씬 가까워요.', en: "It's much closer than I expected." },
      { ko: '생각보다 훨씬 어려워요.', en: "It's much harder than I expected." },
    ],
    episodes: [86],
    searchTerms: ['생각보다 훨씬', '훨씬'],
  },
  {
    korean: '좀 그렇긴 한데요',
    english: "It's a little ..., though.",
    description: 'Used to express a negative or hesitant opinion in a softer, more polite way.',
    examples: [
      { ko: '디자인은 좀 그렇긴 한데요.', en: 'The design is a little questionable, though.' },
      { ko: '가격이 좀 그렇긴 한데요.', en: "The price is a bit much, though." },
      { ko: '맛은 좀 그렇긴 한데요.', en: "The taste isn't quite for me, though." },
    ],
    episodes: [91],
    searchTerms: ['그렇긴 한데요', '좀 그렇긴'],
  },
  {
    korean: '아니라고 할 순 없죠',
    english: "I can't say that's not true.",
    description: "Used to partly agree with a statement, even if you do not agree completely.",
    examples: [
      { ko: '아니라고 할 순 없죠.', en: "I can't say that's not true." },
      { ko: "비싸다는 말을 아니라고 할 순 없죠.", en: "I can't say it isn't expensive." },
      { ko: "조금 어렵다는 건 아니라고 할 순 없죠.", en: "I can't deny that it's a little difficult." },
    ],
    episodes: [91],
    searchTerms: ['아니라고 할 순 없죠', '할 순 없죠'],
  },
  {
    korean: '꼭 그런 건 아니에요',
    english: "That's not always the case.",
    description: 'Used to politely say that a general statement is not true in every situation.',
    examples: [
      { ko: '꼭 그런 건 아니에요.', en: "That's not always the case." },
      { ko: '한국 음식이 모두 매운 건 아니에요.', en: 'Not all Korean food is spicy.' },
      { ko: '비싸다고 꼭 좋은 건 아니에요.', en: 'Expensive things are not always good.' },
    ],
    episodes: [91],
    searchTerms: ['꼭 그런 건 아니에요', '그런 건 아니에요'],
  },
  {
    korean: '상대방 입장에서 생각해 봐요',
    english: "Try thinking from the other person's point of view.",
    description: "Used to advise someone to consider another person's feelings or situation.",
    examples: [
      { ko: '상대방 입장에서 생각해 봐요.', en: "Try thinking from the other person's point of view." },
      { ko: '친구 입장에서 한번 생각해 봐요.', en: "Try thinking from your friend's point of view." },
      { ko: '부모님 입장에서도 생각해 봐요.', en: "Try thinking from your parents' point of view too." },
    ],
    episodes: [94],
    searchTerms: ['상대방 입장에서', '입장에서 생각해'],
  },
  {
    korean: '제가 옆에 있을게요',
    english: "I'll be by your side.",
    description: 'Used to comfort someone and promise to support them.',
    examples: [
      { ko: '제가 옆에 있을게요.', en: "I'll be by your side." },
      { ko: '힘들 때 제가 옆에 있을게요.', en: "I'll be by your side when things are hard." },
      { ko: '걱정하지 마세요. 제가 옆에 있을게요.', en: "Don't worry. I'll be by your side." },
    ],
    episodes: [94],
    searchTerms: ['옆에 있을게요', '제가 옆에'],
  },
  {
    korean: '제 ~은/는 이제 시작이에요',
    english: 'My ~ is just beginning.',
    description: 'Used to say that a journey, goal, or new stage has only just started.',
    examples: [
      { ko: '제 한국어 공부는 이제 시작이에요.', en: 'My Korean studies are just beginning.' },
      { ko: '제 새로운 도전은 이제 시작이에요.', en: 'My new challenge is just beginning.' },
      { ko: '제 한국 생활은 이제 시작이에요.', en: 'My life in Korea is just beginning.' },
    ],
    episodes: [100],
    searchTerms: ['이제 시작이에요', '시작이에요'],
  },
  {
    korean: '~로 꿈을 이룰 거예요',
    english: 'I will achieve my dream through ~.',
    description: 'Used to say what skill, method, or path you will use to achieve your dream.',
    examples: [
      { ko: '한국어로 꿈을 이룰 거예요.', en: 'I will achieve my dream through Korean.' },
      { ko: '음악으로 꿈을 이룰 거예요.', en: 'I will achieve my dream through music.' },
      { ko: '꾸준한 노력으로 꿈을 이룰 거예요.', en: 'I will achieve my dream through steady effort.' },
    ],
    episodes: [100],
    searchTerms: ['꿈을 이룰 거예요', '꿈을 이룰'],
  },
  {
    korean: '~은/는 계속돼요',
    english: '~ continues.',
    description: 'Used to say that a journey, story, activity, or relationship is continuing.',
    examples: [
      { ko: '한국어 여정은 계속돼요.', en: 'The Korean journey continues.' },
      { ko: '우리의 이야기는 계속돼요.', en: 'Our story continues.' },
      { ko: '배움은 계속돼요.', en: 'Learning continues.' },
    ],
    episodes: [100],
    searchTerms: ['계속돼요', '계속돼'],
  },
]

// ── 헬퍼: 에피소드 번호 → DB id 맵 ──────────────────────────────────────────
async function fetchEpisodeMap(): Promise<Map<number, number>> {
  const { data, error } = await sb.from('kp_episodes').select('id, episode_num')
  if (error || !data) throw new Error(`kp_episodes 조회 실패: ${error?.message}`)
  const map = new Map<number, number>()
  for (const e of data) map.set(e.episode_num as number, e.id as number)
  return map
}

// ── 헬퍼: 에피소드 id의 모든 대사 조회 ─────────────────────────────────────
async function fetchDialogues(episodeId: number): Promise<Array<{ id: number; text_ko: string }>> {
  const { data, error } = await sb
    .from('kp_dialogues')
    .select('id, text_ko')
    .eq('episode_id', episodeId)
    .order('id')
  if (error || !data) {
    console.warn(`  kp_dialogues ep_id=${episodeId} 조회 실패: ${error?.message}`)
    return []
  }
  return data as Array<{ id: number; text_ko: string }>
}

// ── 헬퍼: 대사 검색 (우선순위 순) ─────────────────────────────────────────
function findDialogue(
  dialogues: Array<{ id: number; text_ko: string }>,
  searchTerms: string[]
): number | null {
  for (const term of searchTerms) {
    for (const d of dialogues) {
      if (d.text_ko && d.text_ko.includes(term)) return d.id
    }
  }
  return null
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('── K-PATTO 누락 패턴 53개 INSERT 시작 ──\n')

  // 1. 에피소드 번호 → id 맵
  const epMap = await fetchEpisodeMap()
  console.log(`kp_episodes 로드: ${epMap.size}개\n`)

  // 2. 현재 kp_expressions.korean 목록 (중복 체크용)
  const { data: existingExprs, error: exprErr } = await sb
    .from('kp_expressions')
    .select('id, korean')
  if (exprErr || !existingExprs) throw new Error(`kp_expressions 조회 실패: ${exprErr?.message}`)
  const existingMap = new Map<string, number>()
  for (const e of existingExprs) existingMap.set(e.korean as string, e.id as number)
  console.log(`기존 kp_expressions: ${existingMap.size}개 로드\n`)

  // 3. 결과 추적
  let inserted = 0
  let skipped = 0
  let linked = 0
  let noDialogue = 0

  for (const [idx, pat] of PATTERNS.entries()) {
    const label = `[${String(idx + 1).padStart(2, '0')}] ${pat.korean}`
    console.log(label)

    // ── 3a. kp_expressions INSERT 또는 기존 id 사용 ───────────────────────
    let exprId: number

    if (existingMap.has(pat.korean)) {
      exprId = existingMap.get(pat.korean)!
      console.log(`  SKIP (이미 존재 id=${exprId})`)
      skipped++
    } else {
      const { data: newExpr, error: insErr } = await sb
        .from('kp_expressions')
        .insert({
          korean: pat.korean,
          english: pat.english,
          description: pat.description,
          examples: pat.examples,
          category: 'focus',
          first_episode: null,
        })
        .select('id')
        .single()

      if (insErr || !newExpr) {
        console.error(`  ❌ INSERT 실패: ${insErr?.message}`)
        continue
      }
      exprId = (newExpr as { id: number }).id
      existingMap.set(pat.korean, exprId)
      console.log(`  ✅ INSERT → id=${exprId}`)
      inserted++
    }

    // ── 3b. 각 에피소드와 kp_dialogue_expressions 연결 ────────────────────
    for (const epNum of pat.episodes) {
      const epId = epMap.get(epNum)
      if (!epId) {
        console.warn(`  ⚠️  EP${epNum}: epMap에 없음, 건너뜀`)
        continue
      }

      const dialogues = await fetchDialogues(epId)
      const dialogueId = findDialogue(dialogues, pat.searchTerms)

      if (!dialogueId) {
        console.warn(`  ⚠️  EP${epNum}: 대사 검색 실패 (terms: ${pat.searchTerms.join(', ')})`)
        noDialogue++
        continue
      }

      // 중복 체크
      const { data: existing, error: chkErr } = await sb
        .from('kp_dialogue_expressions')
        .select('id')
        .eq('dialogue_id', dialogueId)
        .eq('expression_id', exprId)
        .eq('role', 'focus')
        .maybeSingle()

      if (chkErr) {
        console.error(`  ❌ 중복 체크 실패 EP${epNum}: ${chkErr.message}`)
        continue
      }

      if (existing) {
        console.log(`  EP${epNum}: 이미 연결됨 (dialogue_id=${dialogueId})`)
        continue
      }

      const { error: linkErr } = await sb
        .from('kp_dialogue_expressions')
        .insert({ dialogue_id: dialogueId, expression_id: exprId, role: 'focus' })

      if (linkErr) {
        console.error(`  ❌ kp_dialogue_expressions 연결 실패 EP${epNum}: ${linkErr.message}`)
      } else {
        console.log(`  EP${epNum}: 연결 ✅ (dialogue_id=${dialogueId})`)
        linked++
      }
    }
    console.log()
  }

  // ── 최종 요약 ────────────────────────────────────────────────────────────
  console.log('══════════════════════════════')
  console.log(`총 패턴: ${PATTERNS.length}개`)
  console.log(`  INSERT 완료: ${inserted}개`)
  console.log(`  이미 존재 (SKIP): ${skipped}개`)
  console.log(`  dialogue 연결 완료: ${linked}건`)
  console.log(`  dialogue 검색 실패: ${noDialogue}건`)
  console.log('══════════════════════════════')
}

main().catch(console.error)
