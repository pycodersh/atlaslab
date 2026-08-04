import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 12: 식당에서 심화 (At the Restaurant – Advanced)
// Characters: Emma (에마) + Minjun (민준) + Staff (직원)

const C1 = '/kpatto/ep-012/ep12_c1.png'
const C2 = '/kpatto/ep-012/ep12_c2.png'
const C3 = '/kpatto/ep-012/ep12_c3.png'
const C4 = '/kpatto/ep-012/ep12_c4.png'
const C5 = '/kpatto/ep-012/ep12_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_012_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-012',
  episode: 12,
  title: '식당에서 (심화)',
  theme: '음식 / 주문',
  sections: [
    // ── Gap + CUT 1: 식당 입구 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 72,
          korean: '여기 순두부찌개 맛집이야.',
          translation: 'This place is famous for sundubu jjigae.',
          speaker: 'minjun', lines: 1, tail: tailR,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 58, widthPct: 64,
          korean: '와, 냄새 너무 좋아요!',
          translation: 'Wow, it smells amazing!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 주문 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 68,
          korean: '순두부찌개로 할게요!',
          translation: 'I\'ll have the sundubu jjigae!',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '로 할게요',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 40, yPct: 42, widthPct: 50,
          korean: '맵기는요?',
          translation: 'How spicy?',
          speaker: 'staff', lines: 1, tail: tailRTop,
        },
        {
          id: 'b-1-3', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 68, widthPct: 64,
          korean: '덜 맵게 해 주세요.',
          translation: 'Can you make it less spicy?',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '덜 맵게 해 주세요',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 식사 중 ──────────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 70,
          korean: '이거 뭐가 들어가 있어요?',
          translation: 'What\'s in this?',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '뭐가 들어가 있어요',
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 30, yPct: 42, widthPct: 60,
          korean: '두부, 조개, 달걀.',
          translation: 'Tofu, clams, and egg.',
          speaker: 'minjun', lines: 1, tail: tailRTop,
        },
        {
          id: 'b-2-3', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 68, widthPct: 74,
          korean: '아, 조개가 들어가 있어요?',
          translation: 'Oh, there are clams in it?',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 반찬 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 72,
          korean: '이 반찬 리필 돼요?',
          translation: 'Can I get a refill on these side dishes?',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '리필 돼요',
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 72,
          korean: '네, 자유롭게 드세요!',
          translation: 'Yes, help yourself!',
          speaker: 'staff', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 식사 후 ──────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 60,
          korean: '너무 맛있었어요!',
          translation: 'It was so delicious!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 52, widthPct: 76,
          korean: '포장도 돼. 다음엔 포장해 가.',
          translation: 'You can get it to go. Take some next time.',
          speaker: 'minjun', lines: 1, tail: tailRTop,
          highlight_text: '포장해 가',
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-5', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-012': EPISODE_012_WEBTOON }
