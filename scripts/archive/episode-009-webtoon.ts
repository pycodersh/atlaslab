import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 9: 한강에서 (At Hangang)
// Characters: Emma (에마) + Jisu (지수) + Sophie (소피)

const C1 = '/kpatto/ep09/ep09_c1.png'
const C2 = '/kpatto/ep09/ep09_c2.png'
const C3 = '/kpatto/ep09/ep09_c3.png'
const C4 = '/kpatto/ep09/ep09_c4.png'
const C5 = '/kpatto/ep09/ep09_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_009_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-009',
  episode: 9,
  title: '한강에서',
  theme: '일상 / 한강 피크닉',
  sections: [
    // ── Gap + CUT 1: 한강 도착 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 56,
          korean: '와, 한강! 처음이에요!',
          translation: "Wow, Hangang! It's my first time here!",
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 42, yPct: 58, widthPct: 54,
          korean: '오늘 날씨 너무 좋다!',
          translation: 'The weather today is so great!',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 배달 도착 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 58,
          korean: '배달이 이렇게 빨라요?!',
          translation: 'Delivery is this fast?!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 40, yPct: 58, widthPct: 56,
          korean: '생각보다 훨씬 빠르지?',
          translation: "It's faster than you expected, right?",
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 치킨 맛있어요! ──────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 64,
          korean: '한국 치킨...\n생각보다 진짜 맛있어요!!',
          translation: "Korean fried chicken...\nit's really more delicious than I expected!!",
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 46, yPct: 58, widthPct: 50,
          korean: '이제 알았지?',
          translation: 'Now you know, right?',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 다 같이 있어서 좋아요 ───────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 62,
          korean: '이런 거 너무 좋아요.\n다 같이 있어서 좋아요.',
          translation: "I love this kind of thing.\nI love that we're all here together.",
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 48, yPct: 58, widthPct: 48,
          korean: '나도요!',
          translation: 'Me too!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 이미 너무 좋아요 ────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 66,
          korean: '한국에 온 지 얼마 안 됐는데...\n이미 너무 좋아요.',
          translation: "I haven't been in Korea long...\nbut I already love it so much.",
          speaker: 'emma', lines: 2, tail: tailL,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-bottom', heightRatio: 0.36, bubbles: [] },
  ],
}
