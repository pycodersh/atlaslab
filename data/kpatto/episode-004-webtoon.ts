import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 4: 편의점에서 (At the Convenience Store)
// Characters: Emma (에마) + Minjun (민준) — Jisu's older brother

const C1 = '/kpatto/ep04/ep04_c1.png'
const C2 = '/kpatto/ep04/ep04_c2.png'
const C3 = '/kpatto/ep04/ep04_c3.png'
const C4 = '/kpatto/ep04/ep04_c4.png'
const C5 = '/kpatto/ep04/ep04_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_004_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-004',
  episode: 4,
  title: '편의점에서',
  theme: '일상 / 편의점',
  sections: [
    // ── Gap + CUT 1: 편의점 입장, 에마 혼자 ─────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.64,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 8, widthPct: 60,
          korean: '와, 편의점이 이렇게 커요?',
          translation: 'Wow, the convenience store is this big?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 에마, 민준 첫 만남 ─────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 55,
          korean: '어? 혹시... 지수 오빠예요?',
          translation: "Oh? Are you... Jisu's brother?",
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 48, yPct: 54, widthPct: 50,
          korean: '응, 나 민준이야.\n에마 맞지?',
          translation: "Yes, I'm Minjun.\nYou're Emma, right?",
          speaker: 'minjun', lines: 2, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 편의점 자리에서 먹어도 돼요? ────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 52,
          korean: '여기서 먹어도 돼요?',
          translation: 'Is it okay to eat here?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 44, yPct: 54, widthPct: 44,
          korean: '응, 돼.\n한국 편의점은 다 이래.',
          translation: "Yeah. All Korean\nconvenience stores are like this.",
          speaker: 'minjun', lines: 2, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 민준이 삼각김밥+라면 추천 ──────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 48, yPct: 6, widthPct: 54,
          korean: '이거 어때요?\n삼각김밥이랑 라면!',
          translation: 'How about this?\nTriangle gimbap and ramen!',
          speaker: 'minjun', lines: 2, tail: tailR,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 56,
          korean: '오! 그걸로 할게요.\n카드로 해도 돼요?',
          translation: "Oh! I'll go with that.\nIs it okay to pay by card?",
          speaker: 'emma', lines: 2, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 맛있어! 한국 편의점 최고 ───────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 52,
          korean: '진짜 맛있어요!\n한국 편의점 너무 좋아요.',
          translation: "It's really delicious!\nI love Korean convenience stores.",
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 44, yPct: 54, widthPct: 44,
          korean: '이제 시작이야.',
          translation: "This is just the beginning.",
          speaker: 'minjun', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-bottom', heightRatio: 0.36, bubbles: [] },
  ],
}
