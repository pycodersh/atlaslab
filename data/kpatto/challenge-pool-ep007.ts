import type { ChallengeQuestion } from './types'

export const EP007_POOL: ChallengeQuestion[] = [
  // ── PATTERN 001: 조금만 더 주세요 ────────────────────────────────────
  {
    id: 'ep007-p001-mc1', type: 'mc', patternId: 'kp-ep-007-p001',
    prompt: '"A little more, please."',
    answer: '조금만 더 주세요.',
    distractors: ['더 주세요.', '조금 주세요.', '많이 주세요.'],
  },
  {
    id: 'ep007-p001-mc2', type: 'mc', patternId: 'kp-ep-007-p001',
    prompt: '"A little more kimchi, please."',
    answer: '김치 조금만 더 주세요.',
    distractors: ['김치 더 주세요.', '김치 주세요.', '김치 조금 주세요.'],
  },
  {
    id: 'ep007-p001-wb1', type: 'wb', patternId: 'kp-ep-007-p001',
    prompt: '"Just a little more of this, please."',
    answerBlocks: ['이거', '조금만', '더', '주세요.'],
    extraBlocks: ['많이', '깎아', '다 해서'],
  },

  // ── PATTERN 002: ~깎아 주세요 ────────────────────────────────────────
  {
    id: 'ep007-p002-mc1', type: 'mc', patternId: 'kp-ep-007-p002',
    prompt: '"Please give me a discount."',
    answer: '좀 깎아 주세요.',
    distractors: ['조금만 더 주세요.', '다 해서 얼마예요?', '싸게 주세요.'],
  },
  {
    id: 'ep007-p002-mc2', type: 'mc', patternId: 'kp-ep-007-p002',
    prompt: '"Just a small discount, please."',
    answer: '조금만 깎아 주세요.',
    distractors: ['많이 깎아 주세요.', '조금만 더 주세요.', '다 해서 얼마예요?'],
  },
  {
    id: 'ep007-p002-wb1', type: 'wb', patternId: 'kp-ep-007-p002',
    prompt: '"Please give me a bigger discount."',
    answerBlocks: ['더', '깎아', '주세요.'],
    extraBlocks: ['조금만', '다 해서', '얼마예요'],
  },

  // ── PATTERN 003: 같이 ~해요 ───────────────────────────────────────────
  {
    id: 'ep007-p003-mc1', type: 'mc', patternId: 'kp-ep-007-p003',
    prompt: '"Let\'s eat together."',
    answer: '같이 먹어요.',
    distractors: ['같이 먹어도 돼요?', '같이 먹고 싶어요.', '먹어요.'],
  },
  {
    id: 'ep007-p003-mc2', type: 'mc', patternId: 'kp-ep-007-p003',
    prompt: '"Let\'s go together."',
    answer: '같이 가요.',
    distractors: ['같이 가도 돼요?', '같이 가고 싶어요.', '가요.'],
  },
  {
    id: 'ep007-p003-wb1', type: 'wb', patternId: 'kp-ep-007-p003',
    prompt: '"Let\'s look around together."',
    answerBlocks: ['같이', '구경해요.'],
    extraBlocks: ['가도 돼요', '싶어요', '먹어요'],
  },

  // ── PATTERN 004: ~신기해요! ───────────────────────────────────────────
  {
    id: 'ep007-p004-mc1', type: 'mc', patternId: 'kp-ep-007-p004',
    prompt: '"This is so interesting/unique!"',
    answer: '이거 신기해요!',
    distractors: ['이거 재미있어요!', '이거 좋아요!', '이거 맛있어요!'],
  },
  {
    id: 'ep007-p004-mc2', type: 'mc', patternId: 'kp-ep-007-p004',
    prompt: '"Korean markets are so unique!"',
    answer: '한국 시장 신기해요!',
    distractors: ['한국 시장 재미있어요!', '한국 시장 좋아요!', '한국 시장 멋있어요!'],
  },
  {
    id: 'ep007-p004-wb1', type: 'wb', patternId: 'kp-ep-007-p004',
    prompt: '"It\'s really fascinating!"',
    answerBlocks: ['진짜', '신기해요!'],
    extraBlocks: ['재미있어요', '맛있어요', '좋아요'],
  },

  // ── PATTERN 005: 다 해서 얼마예요? ───────────────────────────────────
  {
    id: 'ep007-p005-mc1', type: 'mc', patternId: 'kp-ep-007-p005',
    prompt: '"How much is it all together?"',
    answer: '다 해서 얼마예요?',
    distractors: ['이거 얼마예요?', '다 주세요.', '깎아 주세요.'],
  },
  {
    id: 'ep007-p005-mc2', type: 'mc', patternId: 'kp-ep-007-p005',
    prompt: '"How much for both?"',
    answer: '두 개 다 해서 얼마예요?',
    distractors: ['두 개 얼마예요?', '두 개 주세요.', '두 개 깎아 주세요.'],
  },
  {
    id: 'ep007-p005-wb1', type: 'wb', patternId: 'kp-ep-007-p005',
    prompt: '"How much is all of this?"',
    answerBlocks: ['이거', '다 해서', '얼마예요?'],
    extraBlocks: ['깎아 주세요', '조금만', '더 주세요'],
  },
]
