import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 7: 시장에서 (At the Market)
// Characters: Emma (에마) + Minjun (민준) + Vendor (상인)

const C1 = '/kpatto/ep07/ep07_c1.png'
const C2 = '/kpatto/ep07/ep07_c2.png'
const C3 = '/kpatto/ep07/ep07_c3.png'
const C4 = '/kpatto/ep07/ep07_c4.png'
const C5 = '/kpatto/ep07/ep07_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_007_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-007',
  episode: 7,
  title: '시장에서',
  theme: '일상 / 전통시장',
  sections: [
    // ── Gap + CUT 1: 시장 입장 ─────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 58,
          korean: '와, 여기 진짜 신기해요!',
          translation: 'Wow, this place is so interesting!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 40, yPct: 58, widthPct: 56,
          korean: '한국 전통 시장이야.\n뭐든 다 있어.',
          translation: 'This is a Korean traditional market.\nThey have everything.',
          speaker: 'minjun', lines: 2, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 구경하기 ─────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 60,
          korean: '이거 뭐예요?\n저거도 신기해요!',
          translation: "What's this?\nThat's interesting too!",
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 42, yPct: 58, widthPct: 54,
          korean: '천천히 봐. 다 구경해.',
          translation: 'Look slowly. Browse everything.',
          speaker: 'minjun', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 시식 & 조금만 더 ────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 42, yPct: 6, widthPct: 54,
          korean: '맛봐요, 맛봐!',
          translation: 'Try it, try it!',
          speaker: 'vendor', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 58, widthPct: 62,
          korean: '감사합니다! 맛있어요!\n조금만 더 주세요!',
          translation: "Thank you! It's delicious!\nA little more, please!",
          speaker: 'emma', lines: 2, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 흥정 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 6, widthPct: 58,
          korean: '자, 해봐. "좀 깎아 주세요"',
          translation: 'Go ahead. Say "Please give me a discount."',
          speaker: 'minjun', lines: 1, tail: tailR,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 58, widthPct: 56,
          korean: '저기요... 좀 깎아 주세요!',
          translation: 'Excuse me... please give me a discount!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 총 가격 ──────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 62,
          korean: '다 해서 얼마예요?\n이제 알아요!',
          translation: 'I now know how to ask\n"How much for all of it"!',
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 42, yPct: 58, widthPct: 54,
          korean: '이제 시장 고수네.',
          translation: "You're a market expert now.",
          speaker: 'minjun', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-bottom', heightRatio: 0.36, bubbles: [] },
  ],
}
