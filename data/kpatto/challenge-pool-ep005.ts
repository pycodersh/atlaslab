import type { RawQuestion } from './challenge-pool-ep001'

export const EP005_POOL: RawQuestion[] = [
  // ── kp-ep-005-p001: ~주실 수 있어요? ─────────────────────────────────
  {
    id: 'ep005-p001-mc1', type: 'mc', patternId: 'kp-ep-005-p001',
    prompt: 'Could you speak slowly?',
    answer: '천천히 말해주실 수 있어요?',
    distractors: ['천천히 말해 주세요.', '천천히 말해도 돼요?', '천천히 말하면 안 돼요?'],
  },
  {
    id: 'ep005-p001-mc2', type: 'mc', patternId: 'kp-ep-005-p001',
    prompt: 'Could you bring more water?',
    answer: '물 더 주실 수 있어요?',
    distractors: ['물 더 주세요.', '물 더 있어요?', '물 더 어때요?'],
  },
  {
    id: 'ep005-p001-wb1', type: 'wb', patternId: 'kp-ep-005-p001',
    prompt: 'Could you say that again?',
    answerBlocks: ['다시 한번', '말해주실', '수 있어요?'],
    extraBlocks: ['주세요', '해도 돼요', '어때요'],
  },

  // ── kp-ep-005-p002: ~추천해 주세요 ──────────────────────────────────
  {
    id: 'ep005-p002-mc1', type: 'mc', patternId: 'kp-ep-005-p002',
    prompt: 'Please recommend a menu item.',
    answer: '메뉴 추천해 주세요.',
    distractors: ['메뉴 주세요.', '메뉴 어때요?', '메뉴 있어요?'],
  },
  {
    id: 'ep005-p002-mc2', type: 'mc', patternId: 'kp-ep-005-p002',
    prompt: 'Please recommend something delicious.',
    answer: '맛있는 거 추천해 주세요.',
    distractors: ['맛있는 거 주세요.', '맛있는 거 있어요?', '맛있는 거 어때요?'],
  },
  {
    id: 'ep005-p002-wb1', type: 'wb', patternId: 'kp-ep-005-p002',
    prompt: 'Please recommend a café nearby.',
    answerBlocks: ['이 근처 카페', '추천해', '주세요.'],
    extraBlocks: ['있어요', '어때요', '주실 수 있어요'],
  },

  // ── kp-ep-005-p003: ~해 본 적 있어요? ───────────────────────────────
  {
    id: 'ep005-p003-mc1', type: 'mc', patternId: 'kp-ep-005-p003',
    prompt: 'Have you ever had samgyeopsal?',
    answer: '삼겹살 먹어 본 적 있어요?',
    distractors: ['삼겹살 먹어도 돼요?', '삼겹살 먹고 싶어요.', '삼겹살 맛있어요?'],
  },
  {
    id: 'ep005-p003-mc2', type: 'mc', patternId: 'kp-ep-005-p003',
    prompt: 'Have you ever been to Korea?',
    answer: '한국 와 본 적 있어요?',
    distractors: ['한국 가고 싶어요.', '한국 좋아요?', '한국 어떻게 가요?'],
  },
  {
    id: 'ep005-p003-wb1', type: 'wb', patternId: 'kp-ep-005-p003',
    prompt: 'Have you ever been to a noraebang?',
    answerBlocks: ['노래방', '가 본 적', '있어요?'],
    extraBlocks: ['가고 싶어요', '어때요', '좋아요'],
  },

  // ── kp-ep-005-p004: ~어디서 살 수 있어요? ───────────────────────────
  {
    id: 'ep005-p004-mc1', type: 'mc', patternId: 'kp-ep-005-p004',
    prompt: 'Where can I buy this?',
    answer: '이거 어디서 살 수 있어요?',
    distractors: ['이거 얼마예요?', '이거 있어요?', '이거 어디예요?'],
  },
  {
    id: 'ep005-p004-mc2', type: 'mc', patternId: 'kp-ep-005-p004',
    prompt: 'Where can I buy kimchi?',
    answer: '김치 어디서 살 수 있어요?',
    distractors: ['김치 얼마예요?', '김치 있어요?', '김치 어때요?'],
  },
  {
    id: 'ep005-p004-wb1', type: 'wb', patternId: 'kp-ep-005-p004',
    prompt: 'Where can I buy this book?',
    answerBlocks: ['이 책', '어디서', '살 수 있어요?'],
    extraBlocks: ['얼마예요', '있어요', '어때요'],
  },

  // ── kp-ep-005-p005: ~맛있어요 / 맛없어요 ────────────────────────────
  {
    id: 'ep005-p005-mc1', type: 'mc', patternId: 'kp-ep-005-p005',
    prompt: "It's really delicious!",
    answer: '진짜 맛있어요!',
    distractors: ['진짜 좋아요!', '진짜 있어요!', '진짜 어때요?'],
  },
  {
    id: 'ep005-p005-mc2', type: 'mc', patternId: 'kp-ep-005-p005',
    prompt: "It's not as good as I expected.",
    answer: '생각보다 맛없어요.',
    distractors: ['생각보다 없어요.', '생각보다 어때요.', '생각보다 싫어요.'],
  },
  {
    id: 'ep005-p005-wb1', type: 'wb', patternId: 'kp-ep-005-p005',
    prompt: "It's so delicious!",
    answerBlocks: ['너무', '맛있어요!'],
    extraBlocks: ['좋아요', '맛없어요', '있어요'],
  },
]
