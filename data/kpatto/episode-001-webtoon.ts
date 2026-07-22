import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 1: 카페에서 (At the Café)
//
// ── 말풍선 배치 규칙 ────────────────────────────────────────────────────
// 모든 말풍선 본체: "bubble-oval" (body-only SVG + 동적 꼬리)
//
// 화자 위치 및 꼬리 기본값:
//   에마(emma)  → 화면 왼쪽 → tailL (anchor=0.28, tipX=0.15, tipY=0.97)
//   직원(jisoo) → 화면 오른쪽 → tailR (anchor=0.22, tipX=0.85, tipY=0.97)
//
// anchor: 타원 둘레 위치 (0=오른쪽, 0.25=아래, 0.5=왼쪽, 0.75=위)
//   0.28 ≈ 101° → 아래왼쪽  (Emma OBL)
//   0.22 ≈ 79°  → 아래오른쪽 (Jisoo OBR)
//
// xPct / yPct : gap 컨테이너 너비·높이에 대한 %
// widthPct    : gap 컨테이너 너비에 대한 %
// heightRatio : gap 높이(px) / 430

// 아래쪽 꼬리 (화자가 말풍선 아래에 위치)
const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
// 위쪽 꼬리 (화자가 말풍선 위에 위치)
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

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
          bubbleKey: 'bubble-oval',
          xPct: 3,  yPct: 14,  widthPct: 62,
          korean: '와, 예쁘다!',
          translation: "Wow, it's so pretty!",
          speaker: 'emma',
          lines: 1,
          tail: tailL,
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
          bubbleKey: 'bubble-oval',
          xPct: 46,  yPct: 4,   widthPct: 51,
          korean: '어서 오세요!\n주문하시겠어요?',
          translation: 'Welcome!\nCan I take your order?',
          speaker: 'jisoo',
          lines: 2,
          tail: tailR,
        },
        {
          id: 'g1-b2',
          bubbleKey: 'bubble-oval',
          xPct: 3,   yPct: 52,  widthPct: 52,
          korean: '저기요...\n이거 뭐예요?',
          translation: "Excuse me...\nWhat's this?",
          speaker: 'emma',
          lines: 2,
          tail: tailL,
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
          bubbleKey: 'bubble-oval',
          xPct: 54,  yPct: 3,   widthPct: 44,
          korean: '이건 아메리카노예요.',
          translation: 'This is an Americano.',
          speaker: 'jisoo',
          lines: 1,
          tail: tailR,
        },
        {
          id: 'g2-b2',
          bubbleKey: 'bubble-oval',
          xPct: 2,   yPct: 36,  widthPct: 44,
          korean: '달고나 라떼...\n뭐예요?',
          translation: 'Dalgona latte...\nWhat is that?',
          speaker: 'emma',
          lines: 2,
          tail: tailL,
        },
        {
          id: 'g2-b3',
          bubbleKey: 'bubble-oval',
          xPct: 54,  yPct: 69,  widthPct: 44,
          korean: '달달하고 맛있어요.',
          translation: "It's sweet and delicious.",
          speaker: 'jisoo',
          lines: 1,
          tail: tailR,
        },
      ],
    },

    // ── cut-3 (wide) ─────────────────────────────────────────────────────
    { type: 'panel', id: 'panel-3', imageUrl: '/kpatto/ep-001/cut-3.jpg', layout: 'wide' },

    // ── gap-3 (300px) — 4 bubbles, 2×2 지그재그 ─────────────────────────
    {
      type: 'gap',
      id: 'gap-3',
      heightRatio: 300 / 430,
      bubbles: [
        {
          id: 'g3-b1',
          bubbleKey: 'bubble-oval',
          xPct: 3,   yPct: 2,   widthPct: 40,
          korean: '달고나 라떼 주세요!',
          translation: 'Dalgona latte, please!',
          speaker: 'emma',
          lines: 1,
          tail: tailL,
        },
        {
          id: 'g3-b2',
          bubbleKey: 'bubble-oval',
          xPct: 54,  yPct: 8,   widthPct: 44,
          korean: '사이즈는요?',
          translation: 'What size?',
          speaker: 'jisoo',
          lines: 1,
          tail: tailR,
        },
        {
          id: 'g3-b3',
          bubbleKey: 'bubble-oval',
          xPct: 3,   yPct: 50,  widthPct: 42,
          korean: '큰 거 주세요.\n와이파이 있어요?',
          translation: 'Large, please.\nDo you have Wi-Fi?',
          speaker: 'emma',
          lines: 2,
          tail: tailL,
        },
        {
          id: 'g3-b4',
          bubbleKey: 'bubble-oval',
          xPct: 54,  yPct: 58,  widthPct: 44,
          korean: '네, 있어요!',
          translation: 'Yes, we do!',
          speaker: 'jisoo',
          lines: 1,
          tail: tailR,
        },
      ],
    },

    // ── cut-4 (medium-left) ───────────────────────────────────────────────
    { type: 'panel', id: 'panel-4', imageUrl: '/kpatto/ep-001/cut-4.jpg', layout: 'medium-left' },

    // ── gap-4 (360px) — 4 bubbles, 2×2 지그재그 ─────────────────────────
    {
      type: 'gap',
      id: 'gap-4',
      heightRatio: 360 / 430,
      bubbles: [
        {
          id: 'g4-b1',
          bubbleKey: 'bubble-oval',
          xPct: 3,   yPct: 2,   widthPct: 42,
          korean: '이거 얼마예요?',
          translation: 'How much is this?',
          speaker: 'emma',
          lines: 1,
          tail: tailL,
        },
        {
          id: 'g4-b2',
          bubbleKey: 'bubble-oval',
          xPct: 54,  yPct: 8,   widthPct: 44,
          korean: '오천오백 원이에요.',
          translation: "It's 5,500 won.",
          speaker: 'jisoo',
          lines: 1,
          tail: tailR,
        },
        {
          id: 'g4-b3',
          bubbleKey: 'bubble-oval',
          xPct: 3,   yPct: 50,  widthPct: 42,
          korean: '너무 맛있어요!',
          translation: "It's so delicious!",
          speaker: 'emma',
          lines: 1,
          tail: tailL,
        },
        {
          id: 'g4-b4',
          bubbleKey: 'bubble-oval',
          xPct: 54,  yPct: 57,  widthPct: 44,
          korean: '감사합니다.\n또 오세요.',
          translation: 'Thank you.\nPlease come again!',
          speaker: 'jisoo',
          lines: 2,
          tail: tailR,
        },
      ],
    },

    // ── cut-5 (wide) ─────────────────────────────────────────────────────
    { type: 'panel', id: 'panel-5', imageUrl: '/kpatto/ep-001/cut-5.jpg', layout: 'wide' },

    // ── gap-bottom — spacer ───────────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-bottom',
      heightRatio: 80 / 430,
      bubbles: [],
    },
  ],
}

import { EPISODE_002_WEBTOON } from './episode-002-webtoon'

export const WEBTOON_EPISODES: Record<string, WebtoonEpisodeData> = {
  'kp-ep-001': EPISODE_001_WEBTOON,
  'kp-ep-002': EPISODE_002_WEBTOON,
}
