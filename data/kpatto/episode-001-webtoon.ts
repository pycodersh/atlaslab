import type { WebtoonEpisodeData } from './webtoon-types'

// Episode 1: 카페에서 (At the Café)
// Gap heights in px at CW=430; heightRatio = height/430
// Bubble positions: xPct/widthPct relative to container width, yPct relative to gap height

export const EPISODE_001_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-001',
  episode: 1,
  title: '카페에서',
  theme: '일상 / 카페',
  sections: [
    // ── gap-top (260px) ─────────────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-top',
      heightRatio: 260 / 430,
      bubbles: [
        {
          id: 'g0-b1',
          bubbleKey: 'bubble-02-oval-bottom-center',
          xPct: 14, yPct: 18, widthPct: 72,
          rotation: -1,
          korean: '와, 예쁘다!',
          translation: "Wow, it's so pretty!",
          speaker: 'emma',
          lines: 1,
        },
      ],
    },

    // ── cut-1 (wide) ─────────────────────────────────────────────────────
    { type: 'panel', id: 'panel-1', imageUrl: '/kpatto/ep-001/cut-1.jpg', layout: 'wide' },

    // ── gap-1 (320px) ────────────────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-1',
      heightRatio: 320 / 430,
      bubbles: [
        {
          id: 'g1-b1',
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 10, yPct: 6, widthPct: 76,
          korean: '어서 오세요!\n주문하시겠어요?',
          translation: 'Welcome!\nCan I take your order?',
          speaker: 'jisoo',
          lines: 2,
        },
        {
          id: 'g1-b2',
          bubbleKey: 'bubble-06-oval-top-right',
          xPct: 10, yPct: 56, widthPct: 68,
          korean: '저기요...\n이거 뭐예요?',
          translation: "Excuse me...\nWhat's this?",
          speaker: 'emma',
          lines: 2,
        },
      ],
    },

    // ── cut-2 (medium-right) ─────────────────────────────────────────────
    { type: 'panel', id: 'panel-2', imageUrl: '/kpatto/ep-001/cut-2.jpg', layout: 'medium-right' },

    // ── gap-2 (380px) ────────────────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-2',
      heightRatio: 380 / 430,
      bubbles: [
        {
          id: 'g2-b1',
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 12, yPct: 6, widthPct: 63,
          korean: '이건 아메리카노예요.',
          translation: 'This is an Americano.',
          speaker: 'jisoo',
          lines: 1,
        },
        {
          id: 'g2-b2',
          bubbleKey: 'bubble-03-oval-bottom-right',
          xPct: 36, yPct: 38, widthPct: 53,
          korean: '달고나 라떼...\n뭐예요?',
          translation: 'Dalgona latte...\nWhat is that?',
          speaker: 'emma',
          lines: 2,
        },
        {
          id: 'g2-b3',
          bubbleKey: 'bubble-05-oval-top-center',
          xPct: 18, yPct: 70, widthPct: 62,
          korean: '달달하고 맛있어요.',
          translation: "It's sweet and delicious.",
          speaker: 'jisoo',
          lines: 1,
        },
      ],
    },

    // ── cut-3 (wide) ─────────────────────────────────────────────────────
    { type: 'panel', id: 'panel-3', imageUrl: '/kpatto/ep-001/cut-3.jpg', layout: 'wide' },

    // ── gap-3 (300px) — 4 bubbles, 2-column arrangement ─────────────────
    {
      type: 'gap',
      id: 'gap-3',
      heightRatio: 300 / 430,
      bubbles: [
        {
          id: 'g3-b1',
          bubbleKey: 'bubble-02-oval-bottom-center',
          xPct: 5, yPct: 4, widthPct: 56,
          korean: '달고나 라떼 주세요!',
          translation: 'Dalgona latte, please!',
          speaker: 'emma',
          lines: 1,
        },
        {
          id: 'g3-b2',
          bubbleKey: 'bubble-06-oval-top-right',
          xPct: 55, yPct: 6, widthPct: 40,
          korean: '사이즈는요?',
          translation: 'What size?',
          speaker: 'jisoo',
          lines: 1,
        },
        {
          id: 'g3-b3',
          bubbleKey: 'bubble-07-wide',
          xPct: 6, yPct: 50, widthPct: 66,
          korean: '큰 거 주세요.\n와이파이 있어요?',
          translation: 'Large, please.\nDo you have Wi-Fi?',
          speaker: 'emma',
          lines: 2,
        },
        {
          id: 'g3-b4',
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 56, yPct: 66, widthPct: 38,
          korean: '네, 있어요!',
          translation: 'Yes, we do!',
          speaker: 'jisoo',
          lines: 1,
        },
      ],
    },

    // ── cut-4 (medium-left) ───────────────────────────────────────────────
    { type: 'panel', id: 'panel-4', imageUrl: '/kpatto/ep-001/cut-4.jpg', layout: 'medium-left' },

    // ── gap-4 (360px) — 4 bubbles ────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-4',
      heightRatio: 360 / 430,
      bubbles: [
        {
          id: 'g4-b1',
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 5, yPct: 5, widthPct: 47,
          korean: '이거 얼마예요?',
          translation: 'How much is this?',
          speaker: 'emma',
          lines: 1,
        },
        {
          id: 'g4-b2',
          bubbleKey: 'bubble-07-wide',
          xPct: 18, yPct: 30, widthPct: 68,
          korean: '오천오백 원이에요.',
          translation: "It's 5,500 won.",
          speaker: 'jisoo',
          lines: 1,
        },
        {
          id: 'g4-b3',
          bubbleKey: 'bubble-05-oval-top-center',
          xPct: 15, yPct: 54, widthPct: 68,
          korean: '너무 맛있어요!',
          translation: "It's so delicious!",
          speaker: 'emma',
          lines: 1,
        },
        {
          id: 'g4-b4',
          bubbleKey: 'bubble-03-oval-bottom-right',
          xPct: 45, yPct: 74, widthPct: 46,
          korean: '감사합니다.\n또 오세요.',
          translation: 'Thank you.\nPlease come again!',
          speaker: 'jisoo',
          lines: 2,
        },
      ],
    },

    // ── cut-5 (wide) ─────────────────────────────────────────────────────
    { type: 'panel', id: 'panel-5', imageUrl: '/kpatto/ep-001/cut-5.jpg', layout: 'wide' },

    // ── gap-bottom — spacer only ──────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-bottom',
      heightRatio: 80 / 430,
      bubbles: [],
    },
  ],
}

// Registry: id → webtoon data (for multi-episode lookup)
export const WEBTOON_EPISODES: Record<string, WebtoonEpisodeData> = {
  'kp-ep-001': EPISODE_001_WEBTOON,
}
