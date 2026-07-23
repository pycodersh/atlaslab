import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 6: 노래방에서 (At the Noraebang)
// Characters: Emma (에마) + Sophie (소피) + Jisu (지수)

const C1 = '/kpatto/ep06/ep06_c1.png'
const C2 = '/kpatto/ep06/ep06_c2.png'
const C3 = '/kpatto/ep06/ep06_c3.png'
const C4 = '/kpatto/ep06/ep06_c4.png'
const C5 = '/kpatto/ep06/ep06_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_006_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-006',
  episode: 6,
  title: '노래방에서',
  theme: '일상 / 노래방',
  sections: [
    // ── Gap + CUT 1: 노래방 입장 ─────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 56,
          korean: '노래방 처음이에요!',
          translation: "It's my first time at a noraebang!",
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 42, yPct: 58, widthPct: 54,
          korean: '나는 열 번도 넘게 왔어!',
          translation: "I've been here more than ten times!",
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 한국 노래 알아요? ───────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 58,
          korean: '소피, 한국 노래 알아요?',
          translation: 'Sophie, do you know Korean songs?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 40, yPct: 58, widthPct: 56,
          korean: '당연하죠! 다 알아요!',
          translation: 'Of course! I know them all!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 같이 불러도 돼요? ───────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 58,
          korean: '저도 같이 불러도 돼요?',
          translation: 'Can I sing along too?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 42, yPct: 58, widthPct: 54,
          korean: '물론이죠! 가르쳐 줄게요!',
          translation: "Of course! I'll teach you!",
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 이 노래 너무 좋아요! ───────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 58,
          korean: '이 노래 너무 좋아요!!',
          translation: 'I love this song so much!!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 46, yPct: 58, widthPct: 50,
          korean: '에마 잘한다!!',
          translation: 'Emma is so good!!',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 케이팝 진짜 좋아해요! ─────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 60,
          korean: '케이팝 진짜 좋아해요!\n또 오고 싶어요!',
          translation: 'I really love K-pop!\nI want to come again!',
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 58, widthPct: 58,
          korean: '나도 케이팝 너무 좋아요!',
          translation: 'I love K-pop so much too!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-bottom', heightRatio: 0.36, bubbles: [] },
  ],
}
