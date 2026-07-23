import type { RawQuestion } from './challenge-pool-ep001'

export const EP010_POOL: RawQuestion[] = [
  // ── PATTERN 001: 저는 ~이에요/예요 ───────────────────────────────────
  {
    id: 'ep010-p001-mc1', type: 'mc', patternId: 'kp-ep-010-p001',
    prompt: '"I\'m Emma."',
    answer: '저는 에마예요.',
    distractors: ['저는 에마이에요.', '나는 에마예요.', '에마예요.'],
  },
  {
    id: 'ep010-p001-mc2', type: 'mc', patternId: 'kp-ep-010-p001',
    prompt: '"I\'m a student."',
    answer: '저는 학생이에요.',
    distractors: ['저는 학생예요.', '나는 학생이에요.', '학생이에요.'],
  },
  {
    id: 'ep010-p001-wb1', type: 'wb', patternId: 'kp-ep-010-p001',
    prompt: '"I\'m American."',
    answerBlocks: ['저는', '미국 사람이에요.'],
    extraBlocks: ['나는', '미국 사람예요', '에서 왔어요'],
  },

  // ── PATTERN 002: ~에서 왔어요 ─────────────────────────────────────────
  {
    id: 'ep010-p002-mc1', type: 'mc', patternId: 'kp-ep-010-p002',
    prompt: '"I\'m from America."',
    answer: '미국에서 왔어요.',
    distractors: ['미국에 왔어요.', '미국이에요.', '미국에 가고 싶어요.'],
  },
  {
    id: 'ep010-p002-mc2', type: 'mc', patternId: 'kp-ep-010-p002',
    prompt: '"Where are you from?"',
    answer: '어디에서 왔어요?',
    distractors: ['어디예요?', '어디에 가요?', '어디에서 살아요?'],
  },
  {
    id: 'ep010-p002-wb1', type: 'wb', patternId: 'kp-ep-010-p002',
    prompt: '"Are you from Seoul?"',
    answerBlocks: ['서울에서', '왔어요?'],
    extraBlocks: ['서울이에요', '가고 싶어요', '어디예요'],
  },

  // ── PATTERN 003: ~전공이에요 ──────────────────────────────────────────
  {
    id: 'ep010-p003-mc1', type: 'mc', patternId: 'kp-ep-010-p003',
    prompt: '"My major is business."',
    answer: '경영학 전공이에요.',
    distractors: ['경영학이에요.', '경영학 해요.', '경영학 좋아요.'],
  },
  {
    id: 'ep010-p003-mc2', type: 'mc', patternId: 'kp-ep-010-p003',
    prompt: '"What\'s your major?"',
    answer: '뭐 전공이에요?',
    distractors: ['뭐예요?', '뭐 해요?', '뭐 좋아요?'],
  },
  {
    id: 'ep010-p003-wb1', type: 'wb', patternId: 'kp-ep-010-p003',
    prompt: '"My major is Korean."',
    answerBlocks: ['한국어', '전공이에요.'],
    extraBlocks: ['이에요', '해요', '좋아요'],
  },

  // ── PATTERN 004: 잘 부탁드려요 ───────────────────────────────────────
  {
    id: 'ep010-p004-mc1', type: 'mc', patternId: 'kp-ep-010-p004',
    prompt: '"Please take care of me."',
    answer: '잘 부탁드려요.',
    distractors: ['잘 있어요.', '잘 해요.', '잘 가요.'],
  },
  {
    id: 'ep010-p004-mc2', type: 'mc', patternId: 'kp-ep-010-p004',
    prompt: '"I look forward to working with you."',
    answer: '앞으로 잘 부탁드려요.',
    distractors: ['앞으로 잘 있어요.', '앞으로 잘 가요.', '앞으로 잘 해요.'],
  },
  {
    id: 'ep010-p004-wb1', type: 'wb', patternId: 'kp-ep-010-p004',
    prompt: '"Nice to meet you. Please take care of me."',
    answerBlocks: ['처음 뵙겠습니다.', '잘 부탁드려요.'],
    extraBlocks: ['잘 있어요', '잘 가요', '감사합니다'],
  },

  // ── PATTERN 005: 한국어로 천천히 말해줄 수 있어요? ──────────────────
  {
    id: 'ep010-p005-mc1', type: 'mc', patternId: 'kp-ep-010-p005',
    prompt: '"Can you speak Korean slowly?"',
    answer: '한국어로 천천히 말해줄 수 있어요?',
    distractors: ['한국어로 말해주세요.', '천천히 주세요.', '한국어 알아요?'],
  },
  {
    id: 'ep010-p005-mc2', type: 'mc', patternId: 'kp-ep-010-p005',
    prompt: '"Please speak slowly."',
    answer: '천천히 말해주세요.',
    distractors: ['천천히 가주세요.', '천천히 주세요.', '천천히 해도 돼요?'],
  },
  {
    id: 'ep010-p005-wb1', type: 'wb', patternId: 'kp-ep-010-p005',
    prompt: '"Can you say that again?"',
    answerBlocks: ['다시 한번', '말해줄 수', '있어요?'],
    extraBlocks: ['천천히', '주세요', '한국어로'],
  },
]
