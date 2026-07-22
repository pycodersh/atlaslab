import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 2: 지하철에서 (At the Subway)
// 개별 크롭 PNG 사용 (ep02_c1~5.png)

const C1 = '/kpatto/ep02/ep02_c1.png'
const C2 = '/kpatto/ep02/ep02_c2.png'
const C3 = '/kpatto/ep02/ep02_c3.png'
const C4 = '/kpatto/ep02/ep02_c4.png'
const C5 = '/kpatto/ep02/ep02_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_002_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-002',
  episode: 2,
  title: '지하철에서',
  theme: '일상 / 지하철',
  sections: [
    // ── Gap + CUT 1: 지하철역 입구 ─────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.56,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 10, yPct: 20, widthPct: 68,
          korean: '와... 사람이 너무 많다!',
          translation: 'Wow... there are so many people!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 노선도 앞 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.72,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 6, yPct: 14, widthPct: 65,
          korean: '저기요, 홍대\n어떻게 가요?',
          translation: 'Excuse me, how do\nI get to Hongdae?',
          speaker: 'emma', lines: 2, tail: tailL,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 지수 등장 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 6, widthPct: 64,
          korean: '지수야! 홍대\n가고 싶어요... 어디예요?',
          translation: 'Jisu! I want to go\nto Hongdae... where is it?',
          speaker: 'emma', lines: 2, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 6, yPct: 54, widthPct: 56,
          korean: '에마야!\n여기서 뭐 해?',
          translation: 'Emma! What are\nyou doing here?',
          speaker: 'jisu', lines: 2, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 티켓 기계 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.72,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 6, yPct: 14, widthPct: 62,
          korean: '표 두 장 주세요!',
          translation: 'Two tickets, please!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 34, yPct: 56, widthPct: 52,
          korean: '완벽해!',
          translation: 'Perfect!',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 지하철 안, 서울 야경 ─────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.72,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 16, widthPct: 52,
          korean: '와, 서울 진짜 좋아요!',
          translation: 'Wow, I really like Seoul!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 42, yPct: 54, widthPct: 52,
          korean: '그치? 나도 좋아!',
          translation: 'Right? Me too!',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-bottom', heightRatio: 0.36, bubbles: [] },
  ],
}

