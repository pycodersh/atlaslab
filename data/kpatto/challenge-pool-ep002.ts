import type { RawQuestion } from './challenge-pool-ep001'

export const EP002_POOL: RawQuestion[] = [
  // ── Pattern 001: ~어디예요? ─────────────────────────────────────────────
  {
    id: 'ep002-p001-mc1', type: 'mc', patternId: 'kp-ep-002-p001',
    prompt: 'Where is the bathroom?',
    answer: '화장실 어디예요?',
    distractors: ['화장실 주세요.', '화장실 있어요?', '화장실 얼마예요?'],
  },
  {
    id: 'ep002-p001-mc2', type: 'mc', patternId: 'kp-ep-002-p001',
    prompt: 'Where is the exit?',
    answer: '출구 어디예요?',
    distractors: ['출구 주세요.', '출구 있어요?', '출구 어떻게 가요?'],
  },
  {
    id: 'ep002-p001-wb', type: 'wb', patternId: 'kp-ep-002-p001',
    prompt: 'Where is Hongdae?',
    answerBlocks: ['홍대', '어디예요'],
    extraBlocks: ['주세요', '있어요', '얼마예요'],
  },

  // ── Pattern 002: ~에 가고 싶어요 ────────────────────────────────────────
  {
    id: 'ep002-p002-mc1', type: 'mc', patternId: 'kp-ep-002-p002',
    prompt: 'I want to go to Hongdae.',
    answer: '홍대에 가고 싶어요.',
    distractors: ['홍대 어디예요?', '홍대 어떻게 가요?', '홍대 좋아요.'],
  },
  {
    id: 'ep002-p002-mc2', type: 'mc', patternId: 'kp-ep-002-p002',
    prompt: 'I want to go to Myeongdong.',
    answer: '명동에 가고 싶어요.',
    distractors: ['명동 어디예요?', '명동 어떻게 가요?', '명동 좋아요.'],
  },
  {
    id: 'ep002-p002-wb', type: 'wb', patternId: 'kp-ep-002-p002',
    prompt: 'I want to go to Hangang.',
    answerBlocks: ['한강에', '가고', '싶어요'],
    extraBlocks: ['어디예요', '좋아요', '주세요'],
  },

  // ── Pattern 003: ~어떻게 가요? ─────────────────────────────────────────
  {
    id: 'ep002-p003-mc1', type: 'mc', patternId: 'kp-ep-002-p003',
    prompt: 'How do I get to Hongdae?',
    answer: '홍대 어떻게 가요?',
    distractors: ['홍대 어디예요?', '홍대에 가고 싶어요.', '홍대 좋아요.'],
  },
  {
    id: 'ep002-p003-mc2', type: 'mc', patternId: 'kp-ep-002-p003',
    prompt: 'How do I get to the airport?',
    answer: '공항 어떻게 가요?',
    distractors: ['공항 어디예요?', '공항에 가고 싶어요.', '공항 좋아요.'],
  },
  {
    id: 'ep002-p003-wb', type: 'wb', patternId: 'kp-ep-002-p003',
    prompt: 'How do I get here?',
    answerBlocks: ['여기', '어떻게', '가요'],
    extraBlocks: ['어디예요', '싶어요', '좋아요'],
  },

  // ── Pattern 004: [수량] ~ 주세요 ────────────────────────────────────────
  {
    id: 'ep002-p004-mc1', type: 'mc', patternId: 'kp-ep-002-p004',
    prompt: 'Two tickets, please.',
    answer: '표 두 장 주세요.',
    distractors: ['표 두 장 있어요?', '표 두 장 어디예요?', '표 두 장 얼마예요?'],
  },
  {
    id: 'ep002-p004-mc2', type: 'mc', patternId: 'kp-ep-002-p004',
    prompt: 'One bottle of water, please.',
    answer: '물 한 병 주세요.',
    distractors: ['물 한 병 있어요?', '물 한 병 어디예요?', '물 한 병 얼마예요?'],
  },
  {
    id: 'ep002-p004-wb', type: 'wb', patternId: 'kp-ep-002-p004',
    prompt: 'One bag, please.',
    answerBlocks: ['봉투', '하나', '주세요'],
    extraBlocks: ['있어요', '어디예요', '두 장'],
  },

  // ── Pattern 005: ~좋아요 ────────────────────────────────────────────────
  {
    id: 'ep002-p005-mc1', type: 'mc', patternId: 'kp-ep-002-p005',
    prompt: 'I like Seoul.',
    answer: '서울 좋아요.',
    distractors: ['서울 어디예요?', '서울에 가고 싶어요.', '서울 어떻게 가요?'],
  },
  {
    id: 'ep002-p005-mc2', type: 'mc', patternId: 'kp-ep-002-p005',
    prompt: 'I like the subway.',
    answer: '지하철 좋아요.',
    distractors: ['지하철 어디예요?', '지하철에 가고 싶어요.', '지하철 어떻게 가요?'],
  },
  {
    id: 'ep002-p005-wb', type: 'wb', patternId: 'kp-ep-002-p005',
    prompt: 'I like Korea.',
    answerBlocks: ['한국', '좋아요'],
    extraBlocks: ['어디예요', '싶어요', '어떻게'],
  },
]
