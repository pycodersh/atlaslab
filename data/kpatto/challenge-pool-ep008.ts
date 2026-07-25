import type { RawQuestion } from './challenge-pool-ep001'

export const EP008_POOL: RawQuestion[] = [
  // ── kp-ep-008-p001: ~추천해 주세요 ──────────────────────────────────
  {
    id: 'ep008-p001-mc1', type: 'mc', patternId: 'kp-ep-008-p001',
    prompt: '"Please recommend something for my skin type."',
    answer: '제 피부 타입에 맞는 거 추천해 주세요.',
    distractors: ['제 피부 타입에 맞는 거 주세요.', '제 피부 타입이 뭐예요?', '제 피부 타입 어때요?'],
  },
  {
    id: 'ep008-p001-mc2', type: 'mc', patternId: 'kp-ep-008-p001',
    prompt: '"Please recommend something good as a gift."',
    answer: '선물로 좋은 거 추천해 주세요.',
    distractors: ['선물로 좋은 거 주세요.', '선물로 좋은 거 있어요?', '선물로 좋은 거 어때요?'],
  },
  {
    id: 'ep008-p001-wb1', type: 'wb', patternId: 'kp-ep-008-p001',
    prompt: '"Please recommend something for a beginner."',
    answerBlocks: ['초보자한테', '맞는 거', '추천해', '주세요.'],
    extraBlocks: ['있어요', '어때요', '써봤어요'],
  },

  // ── kp-ep-008-p002: ~뭐 써요? ───────────────────────────────────────
  {
    id: 'ep008-p002-mc1', type: 'mc', patternId: 'kp-ep-008-p002',
    prompt: '"What sunscreen do you use?"',
    answer: '선크림 뭐 써요?',
    distractors: ['선크림 있어요?', '선크림 어때요?', '선크림 써봤어요?'],
  },
  {
    id: 'ep008-p002-mc2', type: 'mc', patternId: 'kp-ep-008-p002',
    prompt: '"What toner do you use?"',
    answer: '토너 뭐 써요?',
    distractors: ['토너 있어요?', '토너 어때요?', '토너 써봤어요?'],
  },
  {
    id: 'ep008-p002-wb1', type: 'wb', patternId: 'kp-ep-008-p002',
    prompt: '"What sheet mask do you use?"',
    answerBlocks: ['마스크팩', '뭐', '써요?'],
    extraBlocks: ['써봤어요', '있어요', '추천해 주세요'],
  },

  // ── kp-ep-008-p003: ~어떤 게 좋아요? ───────────────────────────────
  {
    id: 'ep008-p003-mc1', type: 'mc', patternId: 'kp-ep-008-p003',
    prompt: '"Which one is good for a friend as a gift?"',
    answer: '친구 선물로 어떤 게 좋아요?',
    distractors: ['친구 선물로 뭐예요?', '친구 선물로 있어요?', '친구 선물로 써봤어요?'],
  },
  {
    id: 'ep008-p003-mc2', type: 'mc', patternId: 'kp-ep-008-p003',
    prompt: '"Which one is good for dry skin?"',
    answer: '건성 피부엔 어떤 게 좋아요?',
    distractors: ['건성 피부엔 뭐예요?', '건성 피부엔 있어요?', '건성 피부엔 써봤어요?'],
  },
  {
    id: 'ep008-p003-wb1', type: 'wb', patternId: 'kp-ep-008-p003',
    prompt: '"Which one is popular these days?"',
    answerBlocks: ['요즘', '어떤 게', '인기', '있어요?'],
    extraBlocks: ['좋아요', '써봤어요', '추천해 주세요'],
  },

  // ── kp-ep-008-p004: ~써봤어요? ──────────────────────────────────────
  {
    id: 'ep008-p004-mc1', type: 'mc', patternId: 'kp-ep-008-p004',
    prompt: '"Have you tried this? It\'s really good!"',
    answer: '이거 써봤어요? 진짜 좋아요!',
    distractors: ['이거 있어요? 진짜 좋아요!', '이거 뭐예요? 진짜 좋아요!', '이거 어때요? 진짜 좋아요!'],
  },
  {
    id: 'ep008-p004-mc2', type: 'mc', patternId: 'kp-ep-008-p004',
    prompt: '"Have you tried this serum?"',
    answer: '이 세럼 써봤어요?',
    distractors: ['이 세럼 있어요?', '이 세럼 뭐예요?', '이 세럼 어때요?'],
  },
  {
    id: 'ep008-p004-wb1', type: 'wb', patternId: 'kp-ep-008-p004',
    prompt: '"Have you tried Korean cosmetics?"',
    answerBlocks: ['한국', '화장품', '써봤어요?'],
    extraBlocks: ['있어요', '뭐예요', '추천해 주세요'],
  },

  // ── kp-ep-008-p005: ~피부에 좋아요 ─────────────────────────────────
  {
    id: 'ep008-p005-mc1', type: 'mc', patternId: 'kp-ep-008-p005',
    prompt: '"K-beauty is all good for your skin!"',
    answer: 'K-뷰티 피부에 다 좋아요!',
    distractors: ['K-뷰티 피부에 있어요!', 'K-뷰티 피부에 어때요!', 'K-뷰티 피부에 맞아요!'],
  },
  {
    id: 'ep008-p005-mc2', type: 'mc', patternId: 'kp-ep-008-p005',
    prompt: '"This cream is really good for your skin."',
    answer: '이 크림 피부에 진짜 좋아요.',
    distractors: ['이 크림 피부에 있어요.', '이 크림 피부에 어때요.', '이 크림 피부에 맞아요.'],
  },
  {
    id: 'ep008-p005-wb1', type: 'wb', patternId: 'kp-ep-008-p005',
    prompt: '"Sheet masks are good for your skin."',
    answerBlocks: ['마스크팩이', '피부에', '좋아요.'],
    extraBlocks: ['있어요', '어때요', '써봤어요'],
  },
]
