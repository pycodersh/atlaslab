import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 5: 식당에서 (At the Restaurant)
// Characters: Emma (에마) + Jisu (지수) + Minjun (민준) + Staff (직원)

const C1 = '/kpatto/ep05/ep05_c1.png'
const C2 = '/kpatto/ep05/ep05_c2.png'
const C3 = '/kpatto/ep05/ep05_c3.png'
const C4 = '/kpatto/ep05/ep05_c4.png'
const C5 = '/kpatto/ep05/ep05_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_005_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-005',
  episode: 5,
  title: '식당에서',
  theme: '일상 / 한식당',
  sections: [
    // ── Gap + CUT 1: 한식당 입장, 삼겹살 경험 있어요? ───────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 6, widthPct: 60,
          korean: '여기 진짜 맛있어.\n삼겹살 먹어 본 적 있어요?',
          translation: 'This place is great.\nHave you ever had samgyeopsal?',
          speaker: 'jisu', lines: 2, tail: tailR,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 58, widthPct: 46,
          korean: '아니요! 처음이에요!',
          translation: "No! It's my first time!",
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 메뉴판, 에마가 추천 요청 ───────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 58,
          korean: '뭐가 맛있어요?\n추천해 주세요!',
          translation: "What's delicious?\nPlease recommend something!",
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 46, yPct: 58, widthPct: 50,
          korean: '여기는 삼겹살이 유명해.',
          translation: 'The samgyeopsal is famous here.',
          speaker: 'minjun', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 에마가 직원에게 천천히 말해달라고 부탁 ─────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 58,
          korean: '천천히 말해주실 수 있어요?\n한국어 공부 중이에요.',
          translation: "Could you speak slowly?\nI'm studying Korean.",
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 56, yPct: 6, widthPct: 40,
          korean: '네, 물론이죠!',
          translation: 'Yes, of course!',
          speaker: 'staff', lines: 1, tail: tailR,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 삼겹살 굽기 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 54, yPct: 6, widthPct: 42,
          korean: '에마야, 뒤집어!',
          translation: 'Emma, flip it!',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 58, widthPct: 40,
          korean: '이렇게요?',
          translation: 'Like this?',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 셋이 웃으며 식사 ───────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 54,
          korean: '진짜 너무 맛있어요!!',
          translation: 'This is so incredibly delicious!!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 48, yPct: 6, widthPct: 48,
          korean: '이제 한국 사람 다 됐네.',
          translation: "You're basically Korean now.",
          speaker: 'jisu', lines: 1, tail: tailR,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-bottom', heightRatio: 0.36, bubbles: [] },
  ],
}
