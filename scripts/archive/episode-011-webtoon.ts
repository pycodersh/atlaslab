import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 11: 지하철에서 (On the Subway)
// Characters: Emma (에마) + Jisu (지수) + Driver (기사)

const C1 = '/kpatto/ep-011/ep11_c1.png'
const C2 = '/kpatto/ep-011/ep11_c2.png'
const C3 = '/kpatto/ep-011/ep11_c3.png'
const C4 = '/kpatto/ep-011/ep11_c4.png'
const C5 = '/kpatto/ep-011/ep11_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_011_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-011',
  episode: 11,
  title: '지하철에서',
  theme: '교통 / 이동',
  sections: [
    // ── Gap + CUT 1: 지하철역 입구 ────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 6, widthPct: 58,
          korean: '2호선 타면 돼!',
          translation: 'Take Line 2!',
          speaker: 'jisu', lines: 1, tail: tailR,
          highlight_text: '타면 돼',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 58, widthPct: 52,
          korean: '2호선이요?',
          translation: 'Line 2?',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 노선도 앞 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 52,
          korean: '갈아타요?',
          translation: 'Do I transfer?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 30, yPct: 56, widthPct: 66,
          korean: '응, 신촌역에서 갈아타!',
          translation: 'Yes, transfer at Sinchon Station!',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 지하철 안 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 56,
          korean: '얼마나 걸려요?',
          translation: 'How long does it take?',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '얼마나 걸려요',
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 42, widthPct: 48,
          korean: '한 5분?',
          translation: 'About 5 minutes?',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-3', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 72, widthPct: 52,
          korean: '와, 빠르다!',
          translation: 'Wow, that\'s fast!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 홍대입구역 하차 ─────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 6, widthPct: 56,
          korean: '여기서 내려!',
          translation: 'Get off here!',
          speaker: 'jisu', lines: 1, tail: tailR,
          highlight_text: '여기서 내려',
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 54, widthPct: 78,
          korean: '다음엔 혼자 탈 수 있을 것 같아요!',
          translation: 'I think I can ride it alone next time!',
          speaker: 'emma', lines: 2, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 택시 앞 ──────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 70,
          korean: '홍대까지 가 주세요!',
          translation: 'Please take me to Hongdae!',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '까지 가 주세요',
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 44, yPct: 58, widthPct: 44,
          korean: '네~',
          translation: 'Sure~',
          speaker: 'driver', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-5', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-011': EPISODE_011_WEBTOON }
