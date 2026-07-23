import type { RawQuestion } from './challenge-pool-ep001'

export const EP004_POOL: RawQuestion[] = [
  // ── kp-ep-004-p001: ~해도 돼요? ──────────────────────────────────────
  {
    id: 'ep004-p001-mc1', type: 'mc', patternId: 'kp-ep-004-p001',
    prompt: 'Is it okay to eat here?',
    answer: '여기서 먹어도 돼요?',
    distractors: ['여기서 먹으면 안 돼요?', '여기서 먹고 싶어요.', '여기서 먹을게요.'],
  },
  {
    id: 'ep004-p001-mc2', type: 'mc', patternId: 'kp-ep-004-p001',
    prompt: 'May I take a photo here?',
    answer: '여기서 사진 찍어도 돼요?',
    distractors: ['여기서 사진 찍으면 안 돼요.', '여기서 사진 찍고 싶어요.', '여기서 사진 찍을게요.'],
  },
  {
    id: 'ep004-p001-wb1', type: 'wb', patternId: 'kp-ep-004-p001',
    prompt: 'Is it okay to sit here?',
    answerBlocks: ['여기', '앉아도', '돼요?'],
    extraBlocks: ['안 돼요', '앉고 싶어요', '할게요'],
  },

  // ── kp-ep-004-p002: ~하면 안 돼요 ───────────────────────────────────
  {
    id: 'ep004-p002-mc1', type: 'mc', patternId: 'kp-ep-004-p002',
    prompt: 'You cannot smoke here.',
    answer: '여기서 담배 피우면 안 돼요.',
    distractors: ['여기서 담배 피워도 돼요?', '여기서 담배 피우고 싶어요.', '여기서 담배 피울게요.'],
  },
  {
    id: 'ep004-p002-mc2', type: 'mc', patternId: 'kp-ep-004-p002',
    prompt: 'You cannot take photos here.',
    answer: '여기서 사진 찍으면 안 돼요.',
    distractors: ['여기서 사진 찍어도 돼요?', '여기서 사진 찍고 싶어요.', '여기서 사진 찍을게요.'],
  },
  {
    id: 'ep004-p002-wb1', type: 'wb', patternId: 'kp-ep-004-p002',
    prompt: 'You cannot run here.',
    answerBlocks: ['여기서', '뛰면', '안 돼요.'],
    extraBlocks: ['뛰어도 돼요?', '뛰고 싶어요', '할게요'],
  },

  // ── kp-ep-004-p003: ~는/은 어때요? ──────────────────────────────────
  {
    id: 'ep004-p003-mc1', type: 'mc', patternId: 'kp-ep-004-p003',
    prompt: 'How about this? (referring to an item)',
    answer: '이거 어때요?',
    distractors: ['이거 뭐예요?', '이거 얼마예요?', '이거 있어요?'],
  },
  {
    id: 'ep004-p003-mc2', type: 'mc', patternId: 'kp-ep-004-p003',
    prompt: 'How about triangle gimbap and ramen?',
    answer: '삼각김밥이랑 라면은 어때요?',
    distractors: ['삼각김밥이랑 라면 주세요.', '삼각김밥이랑 라면 맞아요?', '삼각김밥이랑 라면 있어요?'],
  },
  {
    id: 'ep004-p003-wb1', type: 'wb', patternId: 'kp-ep-004-p003',
    prompt: "How about this café?",
    answerBlocks: ['이 카페', '어때요?'],
    extraBlocks: ['뭐예요?', '얼마예요?', '주세요'],
  },

  // ── kp-ep-004-p004: ~로 할게요 ───────────────────────────────────────
  {
    id: 'ep004-p004-mc1', type: 'mc', patternId: 'kp-ep-004-p004',
    prompt: "I'll pay by card.",
    answer: '카드로 할게요.',
    distractors: ['카드로 해도 돼요?', '카드로 주세요.', '카드 있어요?'],
  },
  {
    id: 'ep004-p004-mc2', type: 'mc', patternId: 'kp-ep-004-p004',
    prompt: "I'll go with that (the set).",
    answer: '그걸로 할게요.',
    distractors: ['그거 주세요.', '그게 뭐예요?', '그거 어때요?'],
  },
  {
    id: 'ep004-p004-wb1', type: 'wb', patternId: 'kp-ep-004-p004',
    prompt: "I'll pay in cash.",
    answerBlocks: ['현금으로', '할게요.'],
    extraBlocks: ['해도 돼요?', '어때요?', '주세요'],
  },

  // ── kp-ep-004-p005: ~얼마나 걸려요? ─────────────────────────────────
  {
    id: 'ep004-p005-mc1', type: 'mc', patternId: 'kp-ep-004-p005',
    prompt: 'How long does delivery take?',
    answer: '배달 얼마나 걸려요?',
    distractors: ['배달 얼마예요?', '배달 언제예요?', '배달 있어요?'],
  },
  {
    id: 'ep004-p005-mc2', type: 'mc', patternId: 'kp-ep-004-p005',
    prompt: 'How long does it take to get to Hongdae?',
    answer: '홍대까지 얼마나 걸려요?',
    distractors: ['홍대까지 얼마예요?', '홍대 어디예요?', '홍대 어떻게 가요?'],
  },
  {
    id: 'ep004-p005-wb1', type: 'wb', patternId: 'kp-ep-004-p005',
    prompt: 'How long does it take by subway?',
    answerBlocks: ['지하철로', '얼마나', '걸려요?'],
    extraBlocks: ['얼마예요?', '어디예요?', '할게요'],
  },
]
