import type { RawQuestion } from './challenge-pool-ep001'

export const EP009_POOL: RawQuestion[] = [
  // ── PATTERN 001: 같이 ~해요 ───────────────────────────────────────────
  {
    id: 'ep009-p001-mc1', type: 'mc', patternId: 'kp-ep-009-p001',
    prompt: '"Let\'s eat together!"',
    answer: '같이 먹어요!',
    distractors: ['같이 먹어도 돼요?', '같이 먹고 싶어요.', '먹어요!'],
  },
  {
    id: 'ep009-p001-mc2', type: 'mc', patternId: 'kp-ep-009-p001',
    prompt: '"Let\'s go together!"',
    answer: '같이 가요!',
    distractors: ['같이 가도 돼요?', '같이 가고 싶어요.', '가요!'],
  },
  {
    id: 'ep009-p001-wb1', type: 'wb', patternId: 'kp-ep-009-p001',
    prompt: '"Let\'s sit together!"',
    answerBlocks: ['같이', '앉아요!'],
    extraBlocks: ['앉아도 돼요', '가고 싶어요', '좋아요'],
  },

  // ── PATTERN 002: 날씨 좋다! ───────────────────────────────────────────
  {
    id: 'ep009-p002-mc1', type: 'mc', patternId: 'kp-ep-009-p002',
    prompt: '"The weather is great!"',
    answer: '날씨 좋다!',
    distractors: ['날씨 좋아요!', '날씨 있어요!', '날씨 어때요?'],
  },
  {
    id: 'ep009-p002-mc2', type: 'mc', patternId: 'kp-ep-009-p002',
    prompt: '"Today\'s weather is so nice!"',
    answer: '오늘 날씨 너무 좋다!',
    distractors: ['오늘 날씨 좋아요!', '오늘 좋다!', '오늘 너무 좋아요!'],
  },
  {
    id: 'ep009-p002-wb1', type: 'wb', patternId: 'kp-ep-009-p002',
    prompt: '"The weather is really great!"',
    answerBlocks: ['날씨', '진짜', '좋다!'],
    extraBlocks: ['좋아요', '어때요', '있어요'],
  },

  // ── PATTERN 003: 생각보다 ~ ───────────────────────────────────────────
  {
    id: 'ep009-p003-mc1', type: 'mc', patternId: 'kp-ep-009-p003',
    prompt: '"It\'s more delicious than I expected."',
    answer: '생각보다 맛있어요.',
    distractors: ['생각보다 맛없어요.', '생각보다 좋아요.', '생각보다 있어요.'],
  },
  {
    id: 'ep009-p003-mc2', type: 'mc', patternId: 'kp-ep-009-p003',
    prompt: '"It\'s bigger than I expected."',
    answer: '생각보다 넓어요.',
    distractors: ['생각보다 작아요.', '생각보다 좋아요.', '생각보다 많아요.'],
  },
  {
    id: 'ep009-p003-wb1', type: 'wb', patternId: 'kp-ep-009-p003',
    prompt: '"It\'s faster than I expected."',
    answerBlocks: ['생각보다', '빨라요.'],
    extraBlocks: ['느려요', '좋아요', '맛있어요'],
  },

  // ── PATTERN 004: ~처음이에요 ──────────────────────────────────────────
  {
    id: 'ep009-p004-mc1', type: 'mc', patternId: 'kp-ep-009-p004',
    prompt: '"It\'s my first Han River picnic."',
    answer: '한강 피크닉 처음이에요.',
    distractors: ['한강 피크닉 좋아요.', '한강 피크닉 있어요.', '한강 피크닉 어때요?'],
  },
  {
    id: 'ep009-p004-mc2', type: 'mc', patternId: 'kp-ep-009-p004',
    prompt: '"It\'s my first time in Korea."',
    answer: '한국 처음이에요.',
    distractors: ['한국 좋아요.', '한국 있어요.', '한국 어때요?'],
  },
  {
    id: 'ep009-p004-wb1', type: 'wb', patternId: 'kp-ep-009-p004',
    prompt: '"It\'s my first Korean fried chicken."',
    answerBlocks: ['한국 치킨', '처음이에요.'],
    extraBlocks: ['맛있어요', '좋아요', '생각보다'],
  },

  // ── PATTERN 005: 이런 거 너무 좋아요 ─────────────────────────────────
  {
    id: 'ep009-p005-mc1', type: 'mc', patternId: 'kp-ep-009-p005',
    prompt: '"I love this kind of thing."',
    answer: '이런 거 너무 좋아요.',
    distractors: ['이런 거 좋아요.', '이런 거 있어요.', '이런 거 어때요?'],
  },
  {
    id: 'ep009-p005-mc2', type: 'mc', patternId: 'kp-ep-009-p005',
    prompt: '"I love moments like this."',
    answer: '이런 순간 너무 좋아요.',
    distractors: ['이런 순간 좋아요.', '이런 순간 있어요.', '이런 순간 처음이에요.'],
  },
  {
    id: 'ep009-p005-wb1', type: 'wb', patternId: 'kp-ep-009-p005',
    prompt: '"I love days like this."',
    answerBlocks: ['이런 날', '너무', '좋아요.'],
    extraBlocks: ['처음이에요', '생각보다', '좋다'],
  },
]
