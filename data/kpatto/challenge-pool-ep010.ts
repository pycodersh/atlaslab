import type { RawQuestion } from './challenge-pool-ep001'

export const EP010_POOL: RawQuestion[] = [
  // ── kp-ep-010-p001: ~에서 왔어요 ────────────────────────────────────
  {
    id: 'ep010-p001-mc1', type: 'mc', patternId: 'kp-ep-010-p001',
    prompt: '"I\'m from America."',
    answer: '미국에서 왔어요.',
    distractors: ['미국에 왔어요.', '미국이에요.', '미국에 가고 싶어요.'],
  },
  {
    id: 'ep010-p001-mc2', type: 'mc', patternId: 'kp-ep-010-p001',
    prompt: '"Where are you from?"',
    answer: '어디에서 왔어요?',
    distractors: ['어디예요?', '어디에 가요?', '어디에서 살아요?'],
  },
  {
    id: 'ep010-p001-wb1', type: 'wb', patternId: 'kp-ep-010-p001',
    prompt: '"Are you from Seoul?"',
    answerBlocks: ['서울에서', '왔어요?'],
    extraBlocks: ['서울이에요', '가고 싶어요', '어디예요'],
  },

  // ── kp-ep-010-p002: ~전공이에요 ─────────────────────────────────────
  {
    id: 'ep010-p002-mc1', type: 'mc', patternId: 'kp-ep-010-p002',
    prompt: '"My major is business."',
    answer: '경영학 전공이에요.',
    distractors: ['경영학이에요.', '경영학 해요.', '경영학 좋아요.'],
  },
  {
    id: 'ep010-p002-mc2', type: 'mc', patternId: 'kp-ep-010-p002',
    prompt: '"What\'s your major?"',
    answer: '뭐 전공이에요?',
    distractors: ['뭐예요?', '뭐 해요?', '뭐 좋아요?'],
  },
  {
    id: 'ep010-p002-wb1', type: 'wb', patternId: 'kp-ep-010-p002',
    prompt: '"My major is Korean language."',
    answerBlocks: ['한국어', '전공이에요.'],
    extraBlocks: ['이에요', '해요', '좋아요'],
  },

  // ── kp-ep-010-p003: 잘 부탁드려요 ──────────────────────────────────
  {
    id: 'ep010-p003-mc1', type: 'mc', patternId: 'kp-ep-010-p003',
    prompt: '"Please take care of me." — formal self-introduction closing',
    answer: '잘 부탁드려요.',
    distractors: ['잘 있어요.', '잘 해요.', '잘 가요.'],
  },
  {
    id: 'ep010-p003-mc2', type: 'mc', patternId: 'kp-ep-010-p003',
    prompt: '"I\'m Emma. I\'m from America. My major is business. Please take care of me!"',
    answer: '저는 에마예요. 미국에서 왔어요. 경영학 전공이에요. 잘 부탁드려요!',
    distractors: ['저는 에마예요. 미국에서 왔어요. 경영학 전공이에요. 잘 있어요!', '저는 에마예요. 미국에서 왔어요. 경영학 전공이에요. 잘 가요!', '저는 에마예요. 미국에서 왔어요. 경영학 전공이에요. 감사해요!'],
  },
  {
    id: 'ep010-p003-wb1', type: 'wb', patternId: 'kp-ep-010-p003',
    prompt: '"Nice to meet you. Please take care of me."',
    answerBlocks: ['처음', '뵙겠습니다.', '잘', '부탁드려요.'],
    extraBlocks: ['잘 있어요', '감사합니다', '어떻게'],
  },

  // ── kp-ep-010-p004: 떨려요 ──────────────────────────────────────────
  {
    id: 'ep010-p004-mc1', type: 'mc', patternId: 'kp-ep-010-p004',
    prompt: '"I\'m a little nervous."',
    answer: '조금 떨려요.',
    distractors: ['조금 피곤해요.', '조금 무서워요.', '조금 이상해요.'],
  },
  {
    id: 'ep010-p004-mc2', type: 'mc', patternId: 'kp-ep-010-p004',
    prompt: '"Today is my first class. I\'m a little nervous."',
    answer: '오늘 첫 수업이에요. 조금 떨려요.',
    distractors: ['오늘 첫 수업이에요. 조금 피곤해요.', '오늘 첫 수업이에요. 조금 무서워요.', '오늘 첫 수업이에요. 조금 설레요.'],
  },
  {
    id: 'ep010-p004-wb1', type: 'wb', patternId: 'kp-ep-010-p004',
    prompt: '"I\'m so nervous about the presentation."',
    answerBlocks: ['발표가', '너무', '떨려요.'],
    extraBlocks: ['피곤해요', '무서워요', '어려워요'],
  },

  // ── kp-ep-010-p005: 할 수 있었어요 ─────────────────────────────────
  {
    id: 'ep010-p005-mc1', type: 'mc', patternId: 'kp-ep-010-p005',
    prompt: '"I did it. In Korean."',
    answer: '할 수 있었어요. 한국어로요.',
    distractors: ['할 수 있어요. 한국어로요.', '했어요. 한국어로요.', '할 거예요. 한국어로요.'],
  },
  {
    id: 'ep010-p005-mc2', type: 'mc', patternId: 'kp-ep-010-p005',
    prompt: '"I was able to do it by myself!"',
    answer: '혼자서 할 수 있었어요!',
    distractors: ['혼자서 할 수 있어요!', '혼자서 했어요!', '혼자서 할 거예요!'],
  },
  {
    id: 'ep010-p005-wb1', type: 'wb', patternId: 'kp-ep-010-p005',
    prompt: '"I was finally able to do it."',
    answerBlocks: ['드디어', '할 수', '있었어요.'],
    extraBlocks: ['할 거예요', '했어요', '할 수 있어요'],
  },
]
