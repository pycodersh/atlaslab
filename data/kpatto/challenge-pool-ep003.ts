import type { RawQuestion } from './challenge-pool-ep001'

export const EP003_POOL: RawQuestion[] = [
  // ── kp-ep-003-p001: ~하고 싶어요 ─────────────────────────────────────
  {
    id: 'ep003-p001-mc1', type: 'mc', patternId: 'kp-ep-003-p001',
    prompt: 'I want to eat that!',
    answer: '저거 먹고 싶어요!',
    distractors: ['저거 먹을 수 있어요.', '저거 못 먹어요.', '저거 맛있어요?'],
  },
  {
    id: 'ep003-p001-mc2', type: 'mc', patternId: 'kp-ep-003-p001',
    prompt: 'I want to try it.',
    answer: '해보고 싶어요.',
    distractors: ['해봐도 돼요?', '못 해요.', '해봤어요?'],
  },
  {
    id: 'ep003-p001-wb1', type: 'wb', patternId: 'kp-ep-003-p001',
    prompt: 'I want to go to Korea.',
    answerBlocks: ['한국에', '가고', '싶어요.'],
    extraBlocks: ['못 가요', '있어요?', '맞아요'],
  },

  // ── kp-ep-003-p002: ~할 수 있어요 / 없어요 ──────────────────────────
  {
    id: 'ep003-p002-mc1', type: 'mc', patternId: 'kp-ep-003-p002',
    prompt: 'Can you eat spicy food?',
    answer: '매운 거 먹을 수 있어요?',
    distractors: ['매운 거 먹고 싶어요?', '매운 거 맛있어요?', '매운 거 못 먹어요?'],
  },
  {
    id: 'ep003-p002-mc2', type: 'mc', patternId: 'kp-ep-003-p002',
    prompt: 'I can use chopsticks.',
    answer: '젓가락 쓸 수 있어요.',
    distractors: ['젓가락 쓰고 싶어요.', '젓가락 못 써요.', '젓가락 있어요?'],
  },
  {
    id: 'ep003-p002-wb1', type: 'wb', patternId: 'kp-ep-003-p002',
    prompt: 'I can speak Korean.',
    answerBlocks: ['한국어', '할 수', '있어요.'],
    extraBlocks: ['하고 싶어요', '못 해요', '맞아요?'],
  },

  // ── kp-ep-003-p003: ~이/가 아니에요 ────────────────────────────────
  {
    id: 'ep003-p003-mc1', type: 'mc', patternId: 'kp-ep-003-p003',
    prompt: "I'm not a student.",
    answer: '저 학생 아니에요.',
    distractors: ['저 학생이에요.', '저 학생 맞아요?', '저 학생 못 해요.'],
  },
  {
    id: 'ep003-p003-mc2', type: 'mc', patternId: 'kp-ep-003-p003',
    prompt: "This isn't mine.",
    answer: '이거 제 거 아니에요.',
    distractors: ['이거 제 거예요.', '이거 뭐예요?', '이거 맞아요?'],
  },
  {
    id: 'ep003-p003-wb1', type: 'wb', patternId: 'kp-ep-003-p003',
    prompt: "This isn't tteokbokki.",
    answerBlocks: ['이게', '떡볶이', '아니에요.'],
    extraBlocks: ['맞아요?', '예요', '먹고 싶어요'],
  },

  // ── kp-ep-003-p004: ~못해요 ────────────────────────────────────────
  {
    id: 'ep003-p004-mc1', type: 'mc', patternId: 'kp-ep-003-p004',
    prompt: "I can't eat spicy food.",
    answer: '매운 거 못 먹어요.',
    distractors: ['매운 거 먹고 싶어요.', '매운 거 먹을 수 있어요?', '매운 거 아니에요.'],
  },
  {
    id: 'ep003-p004-mc2', type: 'mc', patternId: 'kp-ep-003-p004',
    prompt: "I can't drive.",
    answer: '운전 못 해요.',
    distractors: ['운전 할 수 있어요.', '운전 하고 싶어요.', '운전 맞아요?'],
  },
  {
    id: 'ep003-p004-wb1', type: 'wb', patternId: 'kp-ep-003-p004',
    prompt: "I can't swim.",
    answerBlocks: ['수영', '못 해요.'],
    extraBlocks: ['할 수 있어요', '하고 싶어요', '맞아요'],
  },

  // ── kp-ep-003-p005: ~맞아요? ────────────────────────────────────────
  {
    id: 'ep003-p005-mc1', type: 'mc', patternId: 'kp-ep-003-p005',
    prompt: 'Is this tteokbokki?',
    answer: '이게 떡볶이 맞아요?',
    distractors: ['이게 떡볶이예요?', '이게 떡볶이 있어요?', '이게 떡볶이 아니에요?'],
  },
  {
    id: 'ep003-p005-mc2', type: 'mc', patternId: 'kp-ep-003-p005',
    prompt: 'Is this Hongdae?',
    answer: '여기 홍대 맞아요?',
    distractors: ['여기 홍대예요?', '여기 홍대 있어요?', '여기 홍대 어디예요?'],
  },
  {
    id: 'ep003-p005-wb1', type: 'wb', patternId: 'kp-ep-003-p005',
    prompt: 'Is this the right place?',
    answerBlocks: ['여기', '맞아요?'],
    extraBlocks: ['어디예요', '있어요', '아니에요'],
  },
]
