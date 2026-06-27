/**
 * PATTO Magazine Stories
 *
 * Story 1, 2: StoryPackage (pattoLibrary) → packageToStory() 어댑터를 통해 자동 생성
 * Story 3~: StoryPackage 미완성 — 임시 legacy 데이터 (향후 패키지 등록 후 제거)
 *
 * Reader는 이 파일을 그대로 읽지만,
 * 실제 데이터 원본은 data/factory/story-*-package.ts 이다.
 */

import type { MagazineStory } from '@/types/magazine'
import { pattoLibrary } from '@/data/library'
import { packageToStory } from '@/lib/adapters/packageToStory'

// ── StoryPackage 기반 스토리 (Single Source of Truth) ─────────────────────────
const packagedStories: MagazineStory[] = pattoLibrary.packages.map(packageToStory)

// ── Legacy 스토리 (StoryPackage 미등록 — 임시) ────────────────────────────────
// TODO: Story 3~5도 StoryPackage로 마이그레이션 후 아래 삭제
const legacyStories: MagazineStory[] = [
  {
    id: 3,
    title: 'Coffee Before Work',
    ambienceId: 'cafe',
    imagePool: [
      { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', alt: 'A warm cup of coffee on a café table in the morning' },
      { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', alt: 'Espresso shot on a wooden café table' },
      { url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80', alt: 'Latte art in a white cup before the workday begins' },
    ],
    subtitleKo: '출근 전 커피 한 잔',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'A warm cup of coffee on a café table in the morning',
    storyNote: '작은 루틴 하나가 하루 전체를 바꿀 수 있어요.',
    highlightPhrases: [
      "I'm supposed to be at the office",
      'I need to order quickly',
      "I'm trying to be patient",
      "I don't feel like trying something new",
      'It turns out the extra five minutes',
    ],
    paragraphs: [
      {
        id: 'p3-1',
        english: "I'm supposed to be at the office by nine. But every morning, I stop at the same café on the corner. It's a small habit, but it means a lot to me.",
        koreanTranslation: '아홉 시까지 사무실에 있어야 한다. 하지만 매일 아침, 길모퉁이 같은 카페에 들른다. 작은 습관이지만 나에게는 큰 의미가 있다.',
        keyExpressions: ["I'm supposed to ~", 'a small habit'],
      },
      {
        id: 'p3-2',
        english: "I need to order quickly today. The line is longer than usual. I'm trying to be patient, but I keep checking my phone.",
        koreanTranslation: '오늘은 빠르게 주문해야 한다. 평소보다 줄이 길다. 참으려고 하지만 자꾸 핸드폰을 확인하게 된다.',
        keyExpressions: ['I need to ~', "I'm trying to ~"],
      },
      {
        id: 'p3-3',
        english: "The barista knows my name. She always smiles and says, \"The usual?\" I don't feel like trying something new today. I'll take my regular order.",
        koreanTranslation: "바리스타는 내 이름을 안다. 그녀는 항상 미소 지으며 '언제나처럼요?'라고 말한다. 오늘은 새로운 걸 시도하고 싶지 않다. 평소 주문을 받을 것이다.",
        keyExpressions: ["I don't feel like ~ing", 'The usual?'],
      },
      {
        id: 'p3-4',
        english: "I'm trying to get here earlier next week. But this morning rush is real. Every second counts when you're late.",
        koreanTranslation: '다음 주에는 더 일찍 오려고 한다. 하지만 아침 러시아워는 정말 심하다. 늦었을 때는 1초 1초가 소중하다.',
        keyExpressions: ["I'm trying to ~", 'Every second counts'],
      },
      {
        id: 'p3-5',
        english: 'It turns out the extra five minutes are worth it. My coffee is perfect. I walk to the office feeling calm. The day always starts better with a good cup.',
        koreanTranslation: '여분의 5분은 결국 그만한 가치가 있다. 커피는 완벽하다. 차분한 기분으로 사무실까지 걷는다. 좋은 커피 한 잔이 있으면 하루는 언제나 더 좋게 시작된다.',
        keyExpressions: ['It turns out ~', 'worth it'],
      },
    ],
    patterns: [
      {
        id: 'pt3-1',
        pattern: "I'm supposed to ~.",
        meaningKo: '~하기로 되어 있다',
        storySentence: "I'm supposed to be at the office by nine.",
        storySentenceKo: '아홉 시까지 사무실에 있어야 한다.',
        variationSentence: "I'm supposed to call her back by three.",
        variationSentenceKo: '세 시까지 그녀에게 다시 전화해야 한다.',
      },
      {
        id: 'pt3-2',
        pattern: 'I need to ~.',
        meaningKo: '~해야 한다 / ~할 필요가 있다',
        storySentence: 'I need to order quickly today.',
        storySentenceKo: '오늘은 빠르게 주문해야 한다.',
        variationSentence: 'I need to finish this report before noon.',
        variationSentenceKo: '점심 전에 이 보고서를 끝내야 한다.',
      },
      {
        id: 'pt3-3',
        pattern: "I'm trying to ~.",
        meaningKo: '~하려고 노력 중이다',
        storySentence: "I'm trying to be patient, but I keep checking my phone.",
        storySentenceKo: '참으려고 하지만 자꾸 핸드폰을 확인하게 된다.',
        variationSentence: "I'm trying to eat healthier this month.",
        variationSentenceKo: '이번 달에는 더 건강하게 먹으려고 노력 중이다.',
      },
      {
        id: 'pt3-4',
        pattern: "I don't feel like ~ing.",
        meaningKo: '~하고 싶지 않다',
        storySentence: "I don't feel like trying something new today.",
        storySentenceKo: '오늘은 새로운 걸 시도하고 싶지 않다.',
        variationSentence: "I don't feel like cooking tonight.",
        variationSentenceKo: '오늘 밤은 요리하고 싶지 않다.',
      },
      {
        id: 'pt3-5',
        pattern: 'It turns out ~.',
        meaningKo: '알고 보니 ~이다',
        storySentence: 'It turns out the extra five minutes are worth it.',
        storySentenceKo: '알고 보니 여분의 5분은 그만한 가치가 있다.',
        variationSentence: 'It turns out she already knew about the plan.',
        variationSentenceKo: '알고 보니 그녀는 이미 그 계획을 알고 있었다.',
      },
    ],
  },
  {
    id: 4,
    title: 'At the Airport',
    subtitleKo: '공항에서',
    ambienceId: 'city',
    imagePool: [
      { url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80', alt: 'View from an airplane window before takeoff' },
      { url: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=800&q=80', alt: 'Airport terminal with departing passengers' },
      { url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80', alt: 'A bright airport departure hall with travelers' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'View from an airplane window before takeoff',
    storyNote: '여행은 목적지보다 출발하는 순간이 더 설레는 것 같아요.',
    highlightPhrases: [
      "I'm looking forward to seeing",
      'I forgot to charge my phone',
      "I'm not sure if the weather",
      'Could you watch my bag',
      'Let me take one last photo',
    ],
    paragraphs: [
      {
        id: 'p4-1',
        english: "I'm looking forward to seeing my friend in Busan. I haven't seen her in almost a year. The gate opens in thirty minutes.",
        koreanTranslation: '부산에서 친구를 만날 생각에 설렌다. 거의 1년 만에 보는 것이다. 탑승구는 30분 후에 열린다.',
        keyExpressions: ["I'm looking forward to ~ing", 'almost a year'],
      },
      {
        id: 'p4-2',
        english: 'I forgot to charge my phone last night. It\'s at twelve percent. I need to find a charging station before we board.',
        koreanTranslation: '어젯밤에 폰 충전하는 걸 깜빡했다. 배터리가 12퍼센트다. 탑승 전에 충전 장소를 찾아야 한다.',
        keyExpressions: ['I forgot to ~', 'before we board'],
      },
      {
        id: 'p4-3',
        english: "I'm not sure if the weather in Busan will be good. I checked the forecast, but it was unclear. I packed an umbrella just in case.",
        koreanTranslation: '부산 날씨가 좋을지 모르겠다. 예보를 확인했지만 불분명했다. 혹시 몰라 우산을 챙겼다.',
        keyExpressions: ["I'm not sure if ~", 'just in case'],
      },
      {
        id: 'p4-4',
        english: '"Could you watch my bag for a moment?" I asked the woman sitting next to me. She smiled and nodded. Airports feel friendlier when strangers help each other.',
        koreanTranslation: '"잠깐 가방 좀 봐주실 수 있나요?" 나는 옆에 앉은 여성에게 물었다. 그녀는 미소 지으며 고개를 끄덕였다. 낯선 사람들이 서로 도울 때 공항은 더 친근하게 느껴진다.',
        keyExpressions: ['Could you ~?', 'strangers help each other'],
      },
      {
        id: 'p4-5',
        english: 'Let me take one last photo before we board. The terminal is beautiful at this hour, with the light coming through the big windows. Travel always fills me with energy.',
        koreanTranslation: '탑승 전에 마지막 사진 한 장 찍어야겠다. 큰 창문으로 빛이 들어오는 이 시간의 터미널은 아름답다. 여행은 언제나 나에게 에너지를 준다.',
        keyExpressions: ['Let me ~', 'fills me with energy'],
      },
    ],
    patterns: [
      {
        id: 'pt4-1',
        pattern: "I'm looking forward to ~ing.",
        meaningKo: '~하는 것을 기대하다',
        storySentence: "I'm looking forward to seeing my friend in Busan.",
        storySentenceKo: '부산에서 친구를 만날 생각에 설렌다.',
        variationSentence: "I'm looking forward to starting my new job.",
        variationSentenceKo: '새 직장을 시작할 날이 기대된다.',
      },
      {
        id: 'pt4-2',
        pattern: 'I forgot to ~.',
        meaningKo: '~하는 것을 깜빡했다',
        storySentence: 'I forgot to charge my phone last night.',
        storySentenceKo: '어젯밤에 폰 충전하는 걸 깜빡했다.',
        variationSentence: 'I forgot to bring my umbrella.',
        variationSentenceKo: '우산 챙기는 걸 깜빡했다.',
      },
      {
        id: 'pt4-3',
        pattern: "I'm not sure if ~.",
        meaningKo: '~인지 잘 모르겠다',
        storySentence: "I'm not sure if the weather in Busan will be good.",
        storySentenceKo: '부산 날씨가 좋을지 모르겠다.',
        variationSentence: "I'm not sure if I locked the door.",
        variationSentenceKo: '문을 잠갔는지 모르겠다.',
      },
      {
        id: 'pt4-4',
        pattern: 'Could you ~?',
        meaningKo: '~해주실 수 있나요?',
        storySentence: 'Could you watch my bag for a moment?',
        storySentenceKo: '잠깐 제 가방 좀 봐주실 수 있나요?',
        variationSentence: 'Could you send me the file again?',
        variationSentenceKo: '파일을 다시 보내주실 수 있나요?',
      },
      {
        id: 'pt4-5',
        pattern: 'Let me ~.',
        meaningKo: '내가 ~할게요',
        storySentence: 'Let me take one last photo before we board.',
        storySentenceKo: '탑승 전에 마지막 사진 한 장 찍을게.',
        variationSentence: 'Let me check the schedule first.',
        variationSentenceKo: '일정을 먼저 확인해볼게.',
      },
    ],
  },
  {
    id: 5,
    title: 'A Walk with Max',
    subtitleKo: '맥스와 산책',
    ambienceId: 'forest',
    imagePool: [
      { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80', alt: 'Golden retriever dog in a green park on a sunny evening' },
      { url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4a?auto=format&fit=crop&w=800&q=80', alt: 'A happy dog running through a field on a walk' },
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80', alt: 'Dog on a leash enjoying a peaceful nature walk' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Golden retriever dog in a green park on a sunny evening',
    storyNote: '강아지와 함께하는 시간은 언제나 현재에 집중하게 해줘요.',
    highlightPhrases: [
      'I used to walk him every morning',
      "I'm getting used to taking longer routes",
      "I can't help smiling",
      'reminds me of the walks',
      'I wish I could slow time down',
    ],
    paragraphs: [
      {
        id: 'p5-1',
        english: 'Max is my golden retriever. I used to walk him every morning before work. Those were some of the best parts of my day.',
        koreanTranslation: '맥스는 나의 골든 리트리버다. 예전에는 출근 전 매일 아침 산책을 시켰다. 그 시간이 하루 중 가장 좋은 부분이었다.',
        keyExpressions: ['I used to ~', 'the best parts of my day'],
      },
      {
        id: 'p5-2',
        english: "I'm getting used to taking longer routes now. Since I work from home, I have more time. Max loves the park by the river.",
        koreanTranslation: '요즘은 더 긴 코스로 산책하는 것에 익숙해지고 있다. 재택근무를 하게 되면서 시간이 더 생겼다. 맥스는 강가 공원을 좋아한다.',
        keyExpressions: ["I'm getting used to ~ing", 'work from home'],
      },
      {
        id: 'p5-3',
        english: "I can't help smiling when I watch him run. He chases everything — birds, leaves, other dogs. His joy is completely pure.",
        koreanTranslation: '맥스가 뛰는 걸 보면 저절로 미소가 지어진다. 새든, 낙엽이든, 다른 강아지든 뭐든 쫓아다닌다. 그의 기쁨은 완전히 순수하다.',
        keyExpressions: ["I can't help ~ing", 'completely pure'],
      },
      {
        id: 'p5-4',
        english: 'The evening light today reminds me of the walks we took when he was still a puppy. He was so small back then. Time really goes by fast.',
        koreanTranslation: '오늘 저녁 빛이 맥스가 아직 강아지였을 때 함께 했던 산책을 떠올리게 한다. 그땐 정말 작았는데. 시간은 정말 빠르게 지나간다.',
        keyExpressions: ['reminds me of ~', 'goes by fast'],
      },
      {
        id: 'p5-5',
        english: 'I wish I could slow time down. I wish Max could stay this happy forever. For now, I\'ll enjoy every walk we take together.',
        koreanTranslation: '시간을 늦출 수 있다면 좋겠다. 맥스가 영원히 이렇게 행복할 수 있다면 좋겠다. 지금은 함께하는 모든 산책을 즐기겠다.',
        keyExpressions: ['I wish I could ~', 'enjoy every moment'],
      },
    ],
    patterns: [
      {
        id: 'pt5-1',
        pattern: 'I used to ~.',
        meaningKo: '예전에는 ~하곤 했다',
        storySentence: 'I used to walk him every morning before work.',
        storySentenceKo: '예전에는 출근 전 매일 아침 산책을 시켰다.',
        variationSentence: 'I used to live near the ocean.',
        variationSentenceKo: '예전에는 바다 근처에 살았다.',
      },
      {
        id: 'pt5-2',
        pattern: "I'm getting used to ~ing.",
        meaningKo: '~하는 것에 익숙해지고 있다',
        storySentence: "I'm getting used to taking longer routes now.",
        storySentenceKo: '요즘은 더 긴 코스로 산책하는 것에 익숙해지고 있다.',
        variationSentence: "I'm getting used to waking up early.",
        variationSentenceKo: '일찍 일어나는 것에 익숙해지고 있다.',
      },
      {
        id: 'pt5-3',
        pattern: "I can't help ~ing.",
        meaningKo: '~하지 않을 수가 없다',
        storySentence: "I can't help smiling when I watch him run.",
        storySentenceKo: '맥스가 뛰는 걸 보면 저절로 미소가 지어진다.',
        variationSentence: "I can't help thinking about it.",
        variationSentenceKo: '그것에 대해 자꾸 생각하게 된다.',
      },
      {
        id: 'pt5-4',
        pattern: 'It reminds me of ~.',
        meaningKo: '그것이 ~을 떠올리게 한다',
        storySentence: 'The evening light today reminds me of the walks we took when he was still a puppy.',
        storySentenceKo: '오늘 저녁 빛이 맥스가 아직 강아지였을 때 함께 했던 산책을 떠올리게 한다.',
        variationSentence: 'This song reminds me of our trip to Jeju.',
        variationSentenceKo: '이 노래는 우리의 제주 여행을 떠올리게 한다.',
      },
      {
        id: 'pt5-5',
        pattern: 'I wish I could ~.',
        meaningKo: '~할 수 있으면 좋겠다',
        storySentence: 'I wish I could slow time down.',
        storySentenceKo: '시간을 늦출 수 있다면 좋겠다.',
        variationSentence: 'I wish I could speak Spanish fluently.',
        variationSentenceKo: '스페인어를 유창하게 할 수 있으면 좋겠다.',
      },
    ],
  },
]

// ── 최종 스토리 목록 (id 오름차순 정렬) ──────────────────────────────────────────
export const magazineStories: MagazineStory[] = [
  ...packagedStories,
  ...legacyStories,
].sort((a, b) => a.id - b.id)
