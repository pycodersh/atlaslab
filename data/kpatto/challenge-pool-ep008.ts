import type { RawQuestion } from './challenge-pool-ep001'

export const EP008_POOL: RawQuestion[] = [
  // ── PATTERN 001: 피부에 좋아요? ──────────────────────────────────────
  {
    id: 'ep008-p001-mc1', type: 'mc', patternId: 'kp-ep-008-p001',
    prompt: '"Is this good for skin?"',
    answer: '이거 피부에 좋아요?',
    distractors: ['이거 피부 뭐예요?', '이거 피부 있어요?', '이거 피부 써봤어요?'],
  },
  {
    id: 'ep008-p001-mc2', type: 'mc', patternId: 'kp-ep-008-p001',
    prompt: '"Is it good for sensitive skin?"',
    answer: '민감한 피부에 좋아요?',
    distractors: ['민감한 피부 뭐예요?', '민감한 피부 써봤어요?', '민감한 피부 추천해 주세요.'],
  },
  {
    id: 'ep008-p001-wb1', type: 'wb', patternId: 'kp-ep-008-p001',
    prompt: '"Is it good for dry skin?"',
    answerBlocks: ['건성 피부에', '좋아요?'],
    extraBlocks: ['써봤어요', '뭐예요', '추천해 주세요'],
  },

  // ── PATTERN 002: ~써봤어요? ───────────────────────────────────────────
  {
    id: 'ep008-p002-mc1', type: 'mc', patternId: 'kp-ep-008-p002',
    prompt: '"Have you tried this cream?"',
    answer: '이 크림 써봤어요?',
    distractors: ['이 크림 좋아요?', '이 크림 뭐예요?', '이 크림 피부에 좋아요?'],
  },
  {
    id: 'ep008-p002-mc2', type: 'mc', patternId: 'kp-ep-008-p002',
    prompt: '"Have you tried sheet masks?"',
    answer: '마스크팩 써봤어요?',
    distractors: ['마스크팩 좋아요?', '마스크팩 뭐예요?', '마스크팩 피부에 좋아요?'],
  },
  {
    id: 'ep008-p002-wb1', type: 'wb', patternId: 'kp-ep-008-p002',
    prompt: '"Have you tried this serum?"',
    answerBlocks: ['이 세럼', '써봤어요?'],
    extraBlocks: ['좋아요', '뭐예요', '피부에'],
  },

  // ── PATTERN 003: 어떤 게 좋아요? ─────────────────────────────────────
  {
    id: 'ep008-p003-mc1', type: 'mc', patternId: 'kp-ep-008-p003',
    prompt: '"Which one is good?"',
    answer: '어떤 게 좋아요?',
    distractors: ['뭐가 좋아요?', '어떤 게 있어요?', '어떤 게 뭐예요?'],
  },
  {
    id: 'ep008-p003-mc2', type: 'mc', patternId: 'kp-ep-008-p003',
    prompt: '"Which one is good as a gift?"',
    answer: '선물로 어떤 게 좋아요?',
    distractors: ['선물로 뭐예요?', '선물로 있어요?', '선물로 써봤어요?'],
  },
  {
    id: 'ep008-p003-wb1', type: 'wb', patternId: 'kp-ep-008-p003',
    prompt: '"Which is good for my skin type?"',
    answerBlocks: ['제 피부엔', '어떤 게', '좋아요?'],
    extraBlocks: ['써봤어요', '뭐예요', '피부에'],
  },

  // ── PATTERN 004: ~선물하려고요 ────────────────────────────────────────
  {
    id: 'ep008-p004-mc1', type: 'mc', patternId: 'kp-ep-008-p004',
    prompt: '"I\'m planning to give it to my friend."',
    answer: '친구한테 선물하려고요.',
    distractors: ['친구한테 주세요.', '친구한테 있어요.', '친구한테 써봤어요.'],
  },
  {
    id: 'ep008-p004-mc2', type: 'mc', patternId: 'kp-ep-008-p004',
    prompt: '"I\'m planning to give it to my mom."',
    answer: '엄마한테 선물하려고요.',
    distractors: ['엄마한테 주세요.', '엄마한테 있어요.', '엄마한테 좋아요?'],
  },
  {
    id: 'ep008-p004-wb1', type: 'wb', patternId: 'kp-ep-008-p004',
    prompt: '"I\'m planning to give it to my sister."',
    answerBlocks: ['언니한테', '선물하려고요.'],
    extraBlocks: ['주세요', '있어요', '써봤어요'],
  },

  // ── PATTERN 005: 제 피부 타입에 맞는 거 추천해 주세요 ─────────────────
  {
    id: 'ep008-p005-mc1', type: 'mc', patternId: 'kp-ep-008-p005',
    prompt: '"Please recommend something for my skin type."',
    answer: '제 피부 타입에 맞는 거 추천해 주세요.',
    distractors: ['제 피부 타입에 맞는 거 주세요.', '제 피부 타입이 뭐예요?', '제 피부 타입 써봤어요?'],
  },
  {
    id: 'ep008-p005-mc2', type: 'mc', patternId: 'kp-ep-008-p005',
    prompt: '"Please recommend something for dry skin."',
    answer: '건성 피부에 맞는 거 추천해 주세요.',
    distractors: ['건성 피부에 좋아요?', '건성 피부 뭐예요?', '건성 피부 써봤어요?'],
  },
  {
    id: 'ep008-p005-wb1', type: 'wb', patternId: 'kp-ep-008-p005',
    prompt: '"Please recommend something for sensitive skin."',
    answerBlocks: ['민감한 피부에', '맞는 거', '추천해 주세요.'],
    extraBlocks: ['좋아요', '써봤어요', '선물하려고요'],
  },
]
