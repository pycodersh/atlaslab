import type { RawQuestion } from './challenge-pool-ep001'

export const EP006_POOL: RawQuestion[] = [
  // ── PATTERN 001: ~좋아해요 / 싫어해요 ────────────────────────────────
  {
    id: 'ep006-p001-mc1', type: 'mc', patternId: 'kp-ep-006-p001',
    prompt: '"I like K-pop."',
    answer: '케이팝 좋아해요.',
    distractors: ['케이팝 좋아요.', '케이팝 알아요?', '케이팝 너무 좋아요!'],
  },
  {
    id: 'ep006-p001-mc2', type: 'mc', patternId: 'kp-ep-006-p001',
    prompt: '"I don\'t like spicy food."',
    answer: '매운 거 싫어해요.',
    distractors: ['매운 거 좋아해요.', '매운 거 없어요.', '매운 거 어때요?'],
  },
  {
    id: 'ep006-p001-wb1', type: 'wb', patternId: 'kp-ep-006-p001',
    prompt: '"I like Korean."',
    answerBlocks: ['한국어', '좋아해요.'],
    extraBlocks: ['싫어해요', '알아요', '좋아요'],
  },

  // ── PATTERN 002: ~알아요? ─────────────────────────────────────────────
  {
    id: 'ep006-p002-mc1', type: 'mc', patternId: 'kp-ep-006-p002',
    prompt: '"Do you know this song?"',
    answer: '이 노래 알아요?',
    distractors: ['이 노래 좋아해요?', '이 노래 뭐예요?', '이 노래 있어요?'],
  },
  {
    id: 'ep006-p002-mc2', type: 'mc', patternId: 'kp-ep-006-p002',
    prompt: '"Do you know this singer?"',
    answer: '이 가수 알아요?',
    distractors: ['이 가수 좋아해요?', '이 가수 뭐예요?', '이 가수 있어요?'],
  },
  {
    id: 'ep006-p002-wb1', type: 'wb', patternId: 'kp-ep-006-p002',
    prompt: '"Do you know Korea?"',
    answerBlocks: ['한국', '알아요?'],
    extraBlocks: ['좋아해요', '뭐예요', '있어요'],
  },

  // ── PATTERN 003: ~가르쳐 주세요 ──────────────────────────────────────
  {
    id: 'ep006-p003-mc1', type: 'mc', patternId: 'kp-ep-006-p003',
    prompt: '"Please teach me this song."',
    answer: '이 노래 가르쳐 주세요.',
    distractors: ['이 노래 주세요.', '이 노래 알아요?', '이 노래 좋아해요?'],
  },
  {
    id: 'ep006-p003-mc2', type: 'mc', patternId: 'kp-ep-006-p003',
    prompt: '"Please teach me Korean."',
    answer: '한국어 가르쳐 주세요.',
    distractors: ['한국어 주세요.', '한국어 알아요?', '한국어 추천해 주세요.'],
  },
  {
    id: 'ep006-p003-wb1', type: 'wb', patternId: 'kp-ep-006-p003',
    prompt: '"Please teach me this."',
    answerBlocks: ['이거', '가르쳐', '주세요.'],
    extraBlocks: ['알아요', '좋아해요', '주실 수 있어요'],
  },

  // ── PATTERN 004: 같이 ~해도 돼요? ────────────────────────────────────
  {
    id: 'ep006-p004-mc1', type: 'mc', patternId: 'kp-ep-006-p004',
    prompt: '"Can we sing together?"',
    answer: '같이 불러도 돼요?',
    distractors: ['같이 불러요.', '같이 불러 주세요.', '불러도 돼요?'],
  },
  {
    id: 'ep006-p004-mc2', type: 'mc', patternId: 'kp-ep-006-p004',
    prompt: '"Can I come with you?"',
    answer: '같이 가도 돼요?',
    distractors: ['같이 가요.', '가도 돼요?', '같이 가르쳐 주세요.'],
  },
  {
    id: 'ep006-p004-wb1', type: 'wb', patternId: 'kp-ep-006-p004',
    prompt: '"Can we eat together?"',
    answerBlocks: ['같이', '먹어도', '돼요?'],
    extraBlocks: ['가르쳐', '주세요', '알아요'],
  },

  // ── PATTERN 005: ~너무 좋아요! ───────────────────────────────────────
  {
    id: 'ep006-p005-mc1', type: 'mc', patternId: 'kp-ep-006-p005',
    prompt: '"I love this song so much!"',
    answer: '이 노래 너무 좋아요!',
    distractors: ['이 노래 좋아해요!', '이 노래 알아요?', '이 노래 좋아요!'],
  },
  {
    id: 'ep006-p005-mc2', type: 'mc', patternId: 'kp-ep-006-p005',
    prompt: '"I love Korea so much!"',
    answer: '한국 너무 좋아요!',
    distractors: ['한국 좋아해요!', '한국 좋아요!', '한국 알아요?'],
  },
  {
    id: 'ep006-p005-wb1', type: 'wb', patternId: 'kp-ep-006-p005',
    prompt: '"I love noraebang so much!"',
    answerBlocks: ['노래방', '너무', '좋아요!'],
    extraBlocks: ['좋아해요', '알아요', '싫어해요'],
  },
]
