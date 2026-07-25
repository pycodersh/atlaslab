import type { RawQuestion } from './challenge-pool-ep001'

export const EP009_POOL: RawQuestion[] = [
  // ── kp-ep-009-p001: 날씨 너무 좋다 ─────────────────────────────────
  {
    id: 'ep009-p001-mc1', type: 'mc', patternId: 'kp-ep-009-p001',
    prompt: '"Today\'s weather is so great!"',
    answer: '오늘 날씨 너무 좋다!',
    distractors: ['오늘 날씨 좋아요!', '오늘 좋다!', '오늘 너무 좋아요!'],
  },
  {
    id: 'ep009-p001-mc2', type: 'mc', patternId: 'kp-ep-009-p001',
    prompt: '"The weather is really great today!"',
    answer: '오늘 날씨 진짜 좋다!',
    distractors: ['오늘 날씨 진짜 좋아요!', '오늘 진짜 좋다!', '오늘 날씨 너무 좋아요!'],
  },
  {
    id: 'ep009-p001-wb1', type: 'wb', patternId: 'kp-ep-009-p001',
    prompt: '"The weather is great today! Let\'s go to Hangang."',
    answerBlocks: ['오늘', '날씨', '좋다!', '한강', '가자.'],
    extraBlocks: ['너무', '좋아요', '어때요'],
  },

  // ── kp-ep-009-p002: 배달 돼요? ──────────────────────────────────────
  {
    id: 'ep009-p002-mc1', type: 'mc', patternId: 'kp-ep-009-p002',
    prompt: '"Delivery is this fast?!"',
    answer: '배달이 이렇게 빨라요?!',
    distractors: ['배달이 이렇게 빠른가요?!', '배달이 이렇게 빠르다?!', '배달이 이렇게 빨라?!'],
  },
  {
    id: 'ep009-p002-mc2', type: 'mc', patternId: 'kp-ep-009-p002',
    prompt: '"Can they deliver here too?"',
    answer: '여기도 배달 돼요?',
    distractors: ['여기도 배달 있어요?', '여기도 배달 해요?', '여기도 배달 와요?'],
  },
  {
    id: 'ep009-p002-wb1', type: 'wb', patternId: 'kp-ep-009-p002',
    prompt: '"How long does delivery take?"',
    answerBlocks: ['배달', '얼마나', '걸려요?'],
    extraBlocks: ['빨라요', '돼요', '있어요'],
  },

  // ── kp-ep-009-p003: 생각보다 ~해요 ─────────────────────────────────
  {
    id: 'ep009-p003-mc1', type: 'mc', patternId: 'kp-ep-009-p003',
    prompt: '"It\'s more delicious than I expected."',
    answer: '생각보다 맛있어요.',
    distractors: ['생각보다 맛없어요.', '생각보다 좋아요.', '생각보다 있어요.'],
  },
  {
    id: 'ep009-p003-mc2', type: 'mc', patternId: 'kp-ep-009-p003',
    prompt: '"Korean chicken is really more delicious than I expected!!"',
    answer: '한국 치킨 생각보다 진짜 맛있어요!!',
    distractors: ['한국 치킨 생각보다 맛있어요!!', '한국 치킨 생각보다 진짜 좋아요!!', '한국 치킨 생각보다 진짜 맛없어요!!'],
  },
  {
    id: 'ep009-p003-wb1', type: 'wb', patternId: 'kp-ep-009-p003',
    prompt: '"It\'s much faster than you expected, right?"',
    answerBlocks: ['생각보다', '훨씬', '빠르지?'],
    extraBlocks: ['느려요', '맛있어요', '좋아요'],
  },

  // ── kp-ep-009-p004: 다 같이 있어서 좋아요 ───────────────────────────
  {
    id: 'ep009-p004-mc1', type: 'mc', patternId: 'kp-ep-009-p004',
    prompt: '"I love that we\'re all here together."',
    answer: '다 같이 있어서 좋아요.',
    distractors: ['다 같이 있어요.', '다 같이 좋아요.', '같이 있어서 좋아요.'],
  },
  {
    id: 'ep009-p004-mc2', type: 'mc', patternId: 'kp-ep-009-p004',
    prompt: '"I love this kind of thing. I love that we\'re all here together."',
    answer: '이런 거 너무 좋아요. 다 같이 있어서 좋아요.',
    distractors: ['이런 거 너무 좋아요. 다 같이 있어요.', '이런 거 너무 좋아요. 같이 있어서 좋아요.', '이런 거 너무 좋아요. 다 같이 좋아요.'],
  },
  {
    id: 'ep009-p004-wb1', type: 'wb', patternId: 'kp-ep-009-p004',
    prompt: '"I\'m so happy we\'re all together."',
    answerBlocks: ['다 같이', '있어서', '너무', '행복해요.'],
    extraBlocks: ['좋아요', '있어요', '생각보다'],
  },

  // ── kp-ep-009-p005: 이미 ~해요 ──────────────────────────────────────
  {
    id: 'ep009-p005-mc1', type: 'mc', patternId: 'kp-ep-009-p005',
    prompt: '"I already ate it all."',
    answer: '이미 다 먹었어요.',
    distractors: ['벌써 다 먹었어요.', '다 먹었어요.', '아직 다 먹었어요.'],
  },
  {
    id: 'ep009-p005-mc2', type: 'mc', patternId: 'kp-ep-009-p005',
    prompt: '"I haven\'t been in Korea long, but I already love it so much."',
    answer: '한국에 온 지 얼마 안 됐는데 이미 너무 좋아요.',
    distractors: ['한국에 온 지 얼마 안 됐는데 벌써 너무 좋아요.', '한국에 온 지 얼마 안 됐는데 아직 너무 좋아요.', '한국에 온 지 얼마 안 됐는데 이미 좋아요.'],
  },
  {
    id: 'ep009-p005-wb1', type: 'wb', patternId: 'kp-ep-009-p005',
    prompt: '"I already knew."',
    answerBlocks: ['이미', '알고', '있었어요.'],
    extraBlocks: ['벌써', '아직', '생각보다'],
  },
]
