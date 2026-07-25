import type { RawQuestion } from './challenge-pool-ep001'

export const EP007_POOL: RawQuestion[] = [
  // ── kp-ep-007-p001: 좀 깎아 주세요 ─────────────────────────────────
  {
    id: 'ep007-p001-mc1', type: 'mc', patternId: 'kp-ep-007-p001',
    prompt: '"Please give me a discount."',
    answer: '좀 깎아 주세요.',
    distractors: ['조금만 더 주세요.', '다 해서 얼마예요?', '싸게 주세요.'],
  },
  {
    id: 'ep007-p001-mc2', type: 'mc', patternId: 'kp-ep-007-p001',
    prompt: '"Excuse me... please give me a discount!"',
    answer: '저기요... 좀 깎아 주세요!',
    distractors: ['저기요... 조금만 더 주세요!', '저기요... 얼마예요?', '저기요... 싸게 해 주세요!'],
  },
  {
    id: 'ep007-p001-wb1', type: 'wb', patternId: 'kp-ep-007-p001',
    prompt: '"Please give me a discount if I buy two."',
    answerBlocks: ['두 개', '사면', '깎아 주세요.'],
    extraBlocks: ['조금만 더', '얼마예요', '주세요'],
  },

  // ── kp-ep-007-p002: 다 해서 얼마예요? ──────────────────────────────
  {
    id: 'ep007-p002-mc1', type: 'mc', patternId: 'kp-ep-007-p002',
    prompt: '"How much is it all together?"',
    answer: '다 해서 얼마예요?',
    distractors: ['이거 얼마예요?', '다 주세요.', '깎아 주세요.'],
  },
  {
    id: 'ep007-p002-mc2', type: 'mc', patternId: 'kp-ep-007-p002',
    prompt: '"How much for both?"',
    answer: '두 개 다 해서 얼마예요?',
    distractors: ['두 개 얼마예요?', '두 개 주세요.', '두 개 깎아 주세요.'],
  },
  {
    id: 'ep007-p002-wb1', type: 'wb', patternId: 'kp-ep-007-p002',
    prompt: '"How much is this and that together?"',
    answerBlocks: ['이거랑', '저거', '다 해서', '얼마예요?'],
    extraBlocks: ['깎아 주세요', '조금만', '더 주세요'],
  },

  // ── kp-ep-007-p003: 조금만 더 주세요 ───────────────────────────────
  {
    id: 'ep007-p003-mc1', type: 'mc', patternId: 'kp-ep-007-p003',
    prompt: '"A little more, please."',
    answer: '조금만 더 주세요.',
    distractors: ['더 주세요.', '조금 주세요.', '많이 주세요.'],
  },
  {
    id: 'ep007-p003-mc2', type: 'mc', patternId: 'kp-ep-007-p003',
    prompt: '"Thank you! It\'s delicious! A little more, please!"',
    answer: '감사합니다! 맛있어요! 조금만 더 주세요!',
    distractors: ['감사합니다! 맛있어요! 더 주세요!', '감사합니다! 맛있어요! 조금만 주세요!', '감사합니다! 맛있어요! 많이 주세요!'],
  },
  {
    id: 'ep007-p003-wb1', type: 'wb', patternId: 'kp-ep-007-p003',
    prompt: '"Just a little more sauce, please."',
    answerBlocks: ['소스', '조금만', '더', '주세요.'],
    extraBlocks: ['많이', '깎아', '얼마예요'],
  },

  // ── kp-ep-007-p004: 맛봐요! ─────────────────────────────────────────
  {
    id: 'ep007-p004-mc1', type: 'mc', patternId: 'kp-ep-007-p004',
    prompt: '"Try it, try it!" — encouraging someone to taste',
    answer: '맛봐요, 맛봐!',
    distractors: ['먹어요, 먹어!', '봐요, 봐!', '해봐요, 해봐!'],
  },
  {
    id: 'ep007-p004-mc2', type: 'mc', patternId: 'kp-ep-007-p004',
    prompt: '"Give it a taste!"',
    answer: '한번 맛봐요!',
    distractors: ['한번 먹어요!', '한번 봐요!', '한번 해봐요!'],
  },
  {
    id: 'ep007-p004-wb1', type: 'wb', patternId: 'kp-ep-007-p004',
    prompt: '"Try this! It\'s really delicious."',
    answerBlocks: ['이거', '맛봐요!', '진짜', '맛있어요.'],
    extraBlocks: ['먹어요', '어때요', '신기해요'],
  },

  // ── kp-ep-007-p005: 신기해요 ─────────────────────────────────────────
  {
    id: 'ep007-p005-mc1', type: 'mc', patternId: 'kp-ep-007-p005',
    prompt: '"This is so interesting / unique!"',
    answer: '이거 신기해요!',
    distractors: ['이거 재미있어요!', '이거 맛있어요!', '이거 좋아요!'],
  },
  {
    id: 'ep007-p005-mc2', type: 'mc', patternId: 'kp-ep-007-p005',
    prompt: '"What\'s this? That\'s interesting too!"',
    answer: '이거 뭐예요? 저거도 신기해요!',
    distractors: ['이거 뭐예요? 저거도 맛있어요!', '이거 뭐예요? 저거도 좋아요!', '이거 뭐예요? 저거도 뭐예요?'],
  },
  {
    id: 'ep007-p005-wb1', type: 'wb', patternId: 'kp-ep-007-p005',
    prompt: '"Korean traditional markets are really fascinating!"',
    answerBlocks: ['한국', '전통 시장', '진짜', '신기해요!'],
    extraBlocks: ['재미있어요', '맛있어요', '좋아요'],
  },
]
