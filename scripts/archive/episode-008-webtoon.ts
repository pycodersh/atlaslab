import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 8: 뷰티숍에서 (At the Beauty Shop)
// Characters: Emma (에마) + Sophie (소피) + Staff (직원)

const C1 = '/kpatto/ep08/ep08_c1.png'
const C2 = '/kpatto/ep08/ep08_c2.png'
const C3 = '/kpatto/ep08/ep08_c3.png'
const C4 = '/kpatto/ep08/ep08_c4.png'
const C5 = '/kpatto/ep08/ep08_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_008_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-008',
  episode: 8,
  title: '뷰티숍에서',
  theme: '일상 / K-뷰티',
  sections: [
    // ── Gap + CUT 1: K-뷰티숍 입장 ───────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 6, widthPct: 58,
          korean: '여기 진짜 좋아!\nK-뷰티 최고야!',
          translation: 'This place is great.\nK-beauty is the best!',
          speaker: 'sophie', lines: 2, tail: tailR,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 58, widthPct: 58,
          korean: '뭐가 좋아요? 다 신기해 보여요.',
          translation: "What's good here? Everything looks interesting.",
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 써봤어요? ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 6, widthPct: 58,
          korean: '이거 써봤어요? 진짜 좋아요!',
          translation: "Have you tried this? It's really good!",
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 58, widthPct: 46,
          korean: '아니요... 뭐예요?',
          translation: 'No... what is it?',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 피부 타입 추천 ───────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 62,
          korean: '제 피부 타입에 맞는 거\n추천해 주세요.',
          translation: 'Please recommend something\nfor my skin type.',
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 42, yPct: 58, widthPct: 54,
          korean: '피부가 건성이에요, 지성이에요?',
          translation: 'Is your skin dry or oily?',
          speaker: 'staff', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 선물하려고요 ─────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 62,
          korean: '이거... 친구한테 선물하려고요.\n어떤 게 좋아요?',
          translation: "This... I'm planning to give it as a gift.\nWhich one is good?",
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 44, yPct: 58, widthPct: 52,
          korean: '이게 제일 예뻐!',
          translation: 'This one is the prettiest!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: K-뷰티 최고! ─────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 62,
          korean: 'K-뷰티 진짜 좋아요!\n피부에 다 좋아요!',
          translation: "I really love K-beauty!\nEverything is good for your skin!",
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 42, yPct: 58, widthPct: 54,
          korean: '이제 K-뷰티 덕후 됐어!',
          translation: "You're now a K-beauty fan!",
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-bottom', heightRatio: 0.36, bubbles: [] },
  ],
}
