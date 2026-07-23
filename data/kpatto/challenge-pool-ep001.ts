export type RawMC = {
  id: string; type: 'mc'; patternId: string
  prompt: string; answer: string; distractors: [string, string, string]
}
export type RawWB = {
  id: string; type: 'wb'; patternId: string
  prompt: string; answerBlocks: string[]; extraBlocks: string[]
}
export type RawQuestion = RawMC | RawWB

export const EP001_POOL: RawQuestion[] = [
  // ── Pattern 001: ~이에요 / 예요 ──────────────────────────────────────────
  {
    id: 'ep001-p001-mc1', type: 'mc', patternId: 'kp-ep-001-p001',
    prompt: 'This is kimchi.',
    answer: '이게 김치예요.',
    distractors: ['이게 김치 있어요.', '이게 김치 주세요.', '이게 김치 뭐예요?'],
  },
  {
    id: 'ep001-p001-mc2', type: 'mc', patternId: 'kp-ep-001-p001',
    prompt: "I'm a student.",
    answer: '저는 학생이에요.',
    distractors: ['저는 학생 있어요.', '저는 학생 주세요.', '저는 학생 뭐예요?'],
  },
  {
    id: 'ep001-p001-wb', type: 'wb', patternId: 'kp-ep-001-p001',
    prompt: "It's a dalgona latte.",
    answerBlocks: ['달고나', '라떼', '예요'],
    extraBlocks: ['주세요', '있어요', '뭐'],
  },

  // ── Pattern 002: ~주세요 ────────────────────────────────────────────────
  {
    id: 'ep001-p002-mc1', type: 'mc', patternId: 'kp-ep-001-p002',
    prompt: 'Water, please.',
    answer: '물 주세요.',
    distractors: ['물 있어요.', '물 뭐예요?', '물 얼마예요?'],
  },
  {
    id: 'ep001-p002-mc2', type: 'mc', patternId: 'kp-ep-001-p002',
    prompt: 'The menu, please.',
    answer: '메뉴 주세요.',
    distractors: ['메뉴 있어요.', '메뉴 뭐예요?', '메뉴 얼마예요?'],
  },
  {
    id: 'ep001-p002-wb', type: 'wb', patternId: 'kp-ep-001-p002',
    prompt: 'Dalgona latte, please!',
    answerBlocks: ['달고나', '라떼', '주세요'],
    extraBlocks: ['있어요', '예요', '뭐'],
  },

  // ── Pattern 003: ~뭐예요? ───────────────────────────────────────────────
  {
    id: 'ep001-p003-mc1', type: 'mc', patternId: 'kp-ep-001-p003',
    prompt: 'What is this?',
    answer: '이거 뭐예요?',
    distractors: ['이거 있어요?', '이거 주세요.', '이거 얼마예요?'],
  },
  {
    id: 'ep001-p003-mc2', type: 'mc', patternId: 'kp-ep-001-p003',
    prompt: "What's your name?",
    answer: '이름이 뭐예요?',
    distractors: ['이름이 있어요?', '이름이 주세요.', '이름이 얼마예요?'],
  },
  {
    id: 'ep001-p003-wb', type: 'wb', patternId: 'kp-ep-001-p003',
    prompt: 'What is that?',
    answerBlocks: ['저거', '뭐예요'],
    extraBlocks: ['주세요', '있어요', '얼마'],
  },

  // ── Pattern 004: ~있어요 / 없어요 ──────────────────────────────────────
  {
    id: 'ep001-p004-mc1', type: 'mc', patternId: 'kp-ep-001-p004',
    prompt: 'Do you have Wi-Fi?',
    answer: '와이파이 있어요?',
    distractors: ['와이파이 뭐예요?', '와이파이 주세요.', '와이파이 얼마예요?'],
  },
  {
    id: 'ep001-p004-mc2', type: 'mc', patternId: 'kp-ep-001-p004',
    prompt: 'Is there a seat?',
    answer: '자리 있어요?',
    distractors: ['자리 뭐예요?', '자리 주세요.', '자리 얼마예요?'],
  },
  {
    id: 'ep001-p004-wb', type: 'wb', patternId: 'kp-ep-001-p004',
    prompt: 'Yes, we do!',
    answerBlocks: ['네', '있어요'],
    extraBlocks: ['주세요', '없어요', '뭐예요'],
  },

  // ── Pattern 005: ~얼마예요? ─────────────────────────────────────────────
  {
    id: 'ep001-p005-mc1', type: 'mc', patternId: 'kp-ep-001-p005',
    prompt: 'How much is this?',
    answer: '이거 얼마예요?',
    distractors: ['이거 뭐예요?', '이거 있어요?', '이거 주세요.'],
  },
  {
    id: 'ep001-p005-mc2', type: 'mc', patternId: 'kp-ep-001-p005',
    prompt: 'How much is the latte?',
    answer: '라떼 얼마예요?',
    distractors: ['라떼 뭐예요?', '라떼 있어요?', '라떼 주세요.'],
  },
  {
    id: 'ep001-p005-wb', type: 'wb', patternId: 'kp-ep-001-p005',
    prompt: "It's 5,500 won.",
    answerBlocks: ['오천오백', '원이에요'],
    extraBlocks: ['주세요', '얼마', '없어요'],
  },
]
