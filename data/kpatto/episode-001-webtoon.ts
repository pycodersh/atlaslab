import type { WebtoonEpisodeData } from './webtoon-types'

// Episode 1: 카페에서 (At the Café)
//
// 화자 위치 규칙:
//   에마(emma)   → 화면 왼쪽 → bubble-01-oval-bottom-left  (꼬리 아래왼쪽)
//   직원(jisoo)  → 화면 오른쪽 → bubble-03-oval-bottom-right (꼬리 아래오른쪽)
//
// 좌/우 버블은 x축으로 완전히 분리(에마 x=2~46%, 직원 x=54~98%)되므로
// 같은 gap 안에서 수직 위치가 겹치더라도 시각적 충돌이 없다.
// 읽기 순서는 상단→하단 원칙을 yPct 값으로 보장한다.
//
// xPct / yPct : 각각 gap 컨테이너 너비, 높이에 대한 %
// widthPct    : gap 컨테이너 너비에 대한 %
// heightRatio : gap 높이(px) / 430  — padding-bottom % trick 으로 비율 유지

export const EPISODE_001_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-001',
  episode: 1,
  title: '카페에서',
  theme: '일상 / 카페',
  sections: [
    // ── gap-top (260px) ─────────────────────────────────────────────────
    // 컷-1(카페 외관) 위 여백 → 꼬리가 컷-1의 에마(왼쪽)를 가리킴
    {
      type: 'gap',
      id: 'gap-top',
      heightRatio: 260 / 430,
      bubbles: [
        {
          id: 'g0-b1',
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 3,  yPct: 14,  widthPct: 62,
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
    // 컷-2 위 여백 → 직원(오른쪽)·에마(왼쪽) 각각 OBR/OBL
    // 직원 먼저(yPct 더 작음) → 에마 나중(yPct 더 큼) : 읽기 순서 ↓
    {
      type: 'gap',
      id: 'gap-1',
      heightRatio: 320 / 430,
      bubbles: [
        {
          id: 'g1-b1',
          bubbleKey: 'bubble-03-oval-bottom-right',
          xPct: 46,  yPct: 4,   widthPct: 51,
          korean: '어서 오세요!\n주문하시겠어요?',
          translation: 'Welcome!\nCan I take your order?',
          speaker: 'jisoo',
          lines: 2,
        },
        {
          id: 'g1-b2',
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 3,   yPct: 52,  widthPct: 52,
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
    // 컷-3 위 여백 → 직원·에마·직원 3연속
    // 직원1/직원2 는 x=56~98% 트랙, 에마는 x=2~46% 트랙 → 수평 비충돌
    {
      type: 'gap',
      id: 'gap-2',
      heightRatio: 380 / 430,
      bubbles: [
        {
          id: 'g2-b1',
          bubbleKey: 'bubble-03-oval-bottom-right',
          xPct: 54,  yPct: 3,   widthPct: 44,
          korean: '이건 아메리카노예요.',
          translation: 'This is an Americano.',
          speaker: 'jisoo',
          lines: 1,
        },
        {
          id: 'g2-b2',
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 2,   yPct: 36,  widthPct: 44,
          korean: '달고나 라떼...\n뭐예요?',
          translation: 'Dalgona latte...\nWhat is that?',
          speaker: 'emma',
          lines: 2,
        },
        {
          id: 'g2-b3',
          bubbleKey: 'bubble-03-oval-bottom-right',
          xPct: 54,  yPct: 69,  widthPct: 44,
          korean: '달달하고 맛있어요.',
          translation: "It's sweet and delicious.",
          speaker: 'jisoo',
          lines: 1,
        },
      ],
    },

    // ── cut-3 (wide) ─────────────────────────────────────────────────────
    { type: 'panel', id: 'panel-3', imageUrl: '/kpatto/ep-001/cut-3.jpg', layout: 'wide' },

    // ── gap-3 (300px) — 4 bubbles, 2×2 지그재그 ─────────────────────────
    // 에마(L)/직원(R) 가 수평 완전 분리(에마 ends ~43%, 직원 starts ~58%)
    // 같은 행 pair는 에마가 미세하게 높아 읽기 순서 에마→직원 유도
    {
      type: 'gap',
      id: 'gap-3',
      heightRatio: 300 / 430,
      bubbles: [
        {
          id: 'g3-b1',
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 3,   yPct: 2,   widthPct: 40,
          korean: '달고나 라떼 주세요!',
          translation: 'Dalgona latte, please!',
          speaker: 'emma',
          lines: 1,
        },
        {
          id: 'g3-b2',
          bubbleKey: 'bubble-03-oval-bottom-right',
          xPct: 54,  yPct: 8,   widthPct: 44,
          korean: '사이즈는요?',
          translation: 'What size?',
          speaker: 'jisoo',
          lines: 1,
        },
        {
          id: 'g3-b3',
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 3,   yPct: 50,  widthPct: 42,
          korean: '큰 거 주세요.\n와이파이 있어요?',
          translation: 'Large, please.\nDo you have Wi-Fi?',
          speaker: 'emma',
          lines: 2,
        },
        {
          id: 'g3-b4',
          bubbleKey: 'bubble-03-oval-bottom-right',
          xPct: 54,  yPct: 58,  widthPct: 44,
          korean: '네, 있어요!',
          translation: 'Yes, we do!',
          speaker: 'jisoo',
          lines: 1,
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
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 3,   yPct: 2,   widthPct: 42,
          korean: '이거 얼마예요?',
          translation: 'How much is this?',
          speaker: 'emma',
          lines: 1,
        },
        {
          id: 'g4-b2',
          bubbleKey: 'bubble-03-oval-bottom-right',
          xPct: 54,  yPct: 8,   widthPct: 44,
          korean: '오천오백 원이에요.',
          translation: "It's 5,500 won.",
          speaker: 'jisoo',
          lines: 1,
        },
        {
          id: 'g4-b3',
          bubbleKey: 'bubble-01-oval-bottom-left',
          xPct: 3,   yPct: 50,  widthPct: 42,
          korean: '너무 맛있어요!',
          translation: "It's so delicious!",
          speaker: 'emma',
          lines: 1,
        },
        {
          id: 'g4-b4',
          bubbleKey: 'bubble-03-oval-bottom-right',
          xPct: 54,  yPct: 57,  widthPct: 44,
          korean: '감사합니다.\n또 오세요.',
          translation: 'Thank you.\nPlease come again!',
          speaker: 'jisoo',
          lines: 2,
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

export const WEBTOON_EPISODES: Record<string, WebtoonEpisodeData> = {
  'kp-ep-001': EPISODE_001_WEBTOON,
}
