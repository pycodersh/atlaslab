import type { RawQuestion } from './challenge-pool-ep001'

export const EP006_POOL: RawQuestion[] = [
  // ── kp-ep-006-p001: ~좋아해요 / ~진짜 좋아해요 ──────────────────────
  {
    id: 'ep006-p001-mc1', type: 'mc', patternId: 'kp-ep-006-p001',
    prompt: '"I really love K-pop!"',
    answer: '케이팝 진짜 좋아해요!',
    distractors: ['케이팝 좋아요!', '케이팝 진짜 좋아!', '케이팝 너무 좋아요!'],
  },
  {
    id: 'ep006-p001-mc2', type: 'mc', patternId: 'kp-ep-006-p001',
    prompt: '"I like Korean food."',
    answer: '한국 음식 좋아해요.',
    distractors: ['한국 음식 좋아요.', '한국 음식 진짜 좋아!', '한국 음식 좋아해.'],
  },
  {
    id: 'ep006-p001-wb1', type: 'wb', patternId: 'kp-ep-006-p001',
    prompt: '"I really love this singer!"',
    answerBlocks: ['이 가수', '진짜', '좋아해요!'],
    extraBlocks: ['좋아요', '싫어해요', '알아요'],
  },

  // ── kp-ep-006-p002: 진짜요? / 대박! ────────────────────────────────
  {
    id: 'ep006-p002-mc1', type: 'mc', patternId: 'kp-ep-006-p002',
    prompt: '"Really?" — expressing surprise at good news',
    answer: '진짜요?',
    distractors: ['맞아요?', '그래요?', '알아요?'],
  },
  {
    id: 'ep006-p002-mc2', type: 'mc', patternId: 'kp-ep-006-p002',
    prompt: '"Amazing!" — excited reaction',
    answer: '대박!',
    distractors: ['진짜요!', '어때요!', '좋아요!'],
  },
  {
    id: 'ep006-p002-wb1', type: 'wb', patternId: 'kp-ep-006-p002',
    prompt: 'Emma is so good!! [React with] "Really?"',
    answerBlocks: ['에마', '잘한다!!', '진짜요?'],
    extraBlocks: ['대박', '맞아요', '어때요'],
  },

  // ── kp-ep-006-p003: 너무 ~해요 ──────────────────────────────────────
  {
    id: 'ep006-p003-mc1', type: 'mc', patternId: 'kp-ep-006-p003',
    prompt: '"I love this song so much!"',
    answer: '이 노래 너무 좋아요!!',
    distractors: ['이 노래 좋아해요!', '이 노래 진짜 좋아요!', '이 노래 너무 좋아!'],
  },
  {
    id: 'ep006-p003-mc2', type: 'mc', patternId: 'kp-ep-006-p003',
    prompt: '"It\'s so fun!"',
    answer: '너무 재미있어요!',
    distractors: ['진짜 재미있어요!', '너무 재미있어!', '아주 재미있어요!'],
  },
  {
    id: 'ep006-p003-wb1', type: 'wb', patternId: 'kp-ep-006-p003',
    prompt: '"I\'m so tired."',
    answerBlocks: ['너무', '피곤해요.'],
    extraBlocks: ['진짜요', '재미있어요', '좋아해요'],
  },

  // ── kp-ep-006-p004: ~잘해요 / 못해요 ───────────────────────────────
  {
    id: 'ep006-p004-mc1', type: 'mc', patternId: 'kp-ep-006-p004',
    prompt: '"Are you good at singing?"',
    answer: '노래 잘해요?',
    distractors: ['노래 좋아해요?', '노래 알아요?', '노래 해요?'],
  },
  {
    id: 'ep006-p004-mc2', type: 'mc', patternId: 'kp-ep-006-p004',
    prompt: '"I\'m not good at dancing."',
    answer: '춤 잘 못해요.',
    distractors: ['춤 못해요.', '춤 안 해요.', '춤 싫어해요.'],
  },
  {
    id: 'ep006-p004-wb1', type: 'wb', patternId: 'kp-ep-006-p004',
    prompt: '"Your Korean is great!"',
    answerBlocks: ['한국어', '잘해요!'],
    extraBlocks: ['좋아해요', '알아요', '있어요'],
  },

  // ── kp-ep-006-p005: 또 오고 싶어요 ─────────────────────────────────
  {
    id: 'ep006-p005-mc1', type: 'mc', patternId: 'kp-ep-006-p005',
    prompt: '"I want to come to noraebang again!"',
    answer: '노래방 또 오고 싶어요!',
    distractors: ['노래방 또 가고 싶어요!', '노래방 다시 오고 싶어요!', '노래방 또 오고 싶다!'],
  },
  {
    id: 'ep006-p005-mc2', type: 'mc', patternId: 'kp-ep-006-p005',
    prompt: '"I want to come to this restaurant again."',
    answer: '이 식당 또 오고 싶어요.',
    distractors: ['이 식당 또 가고 싶어요.', '이 식당 다시 오고 싶어요.', '이 식당 또 오고 싶다.'],
  },
  {
    id: 'ep006-p005-wb1', type: 'wb', patternId: 'kp-ep-006-p005',
    prompt: '"I want to come to Korea again!"',
    answerBlocks: ['한국', '또', '오고 싶어요!'],
    extraBlocks: ['가고 싶어요', '다시', '진짜요'],
  },
]
