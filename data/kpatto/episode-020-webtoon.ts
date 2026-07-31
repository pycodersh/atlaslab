import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 20: 오랜만에 만남 (Long Time No See)
// Characters: Emma (에마) + Sophie (소피)

const C1 = '/kpatto/ep-020/ep20_c1.png'
const C2 = '/kpatto/ep-020/ep20_c2.png'
const C3 = '/kpatto/ep-020/ep20_c3.png'
const C4 = '/kpatto/ep-020/ep20_c4.png'
const C5 = '/kpatto/ep-020/ep20_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_020_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-020',
  episode: 20,
  title: '오랜만에 만남',
  theme: '만남 / 안부',
  sections: [
    // ── Gap + CUT 1: 카페 앞 ──────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 58,
          korean: '소피! 오랜만이야!',
          translation: 'Sophie! Long time no see!',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '오랜만이야',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 24, yPct: 56, widthPct: 70,
          korean: '에마! 정말 오랜만이야!',
          translation: 'Emma! It\'s been so long!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 안부 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 6, widthPct: 58,
          korean: '잘 지냈어?',
          translation: 'Have you been well?',
          speaker: 'sophie', lines: 1, tail: tailR,
          highlight_text: '잘 지냈어',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 56,
          korean: '네! 요즘 바빠?',
          translation: 'Yes! Are you busy lately?',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 근황 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 6, widthPct: 60,
          korean: '많이 변했어?',
          translation: 'Have I changed a lot?',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 66,
          korean: '하나도 안 변했어!',
          translation: 'You haven\'t changed at all!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '하나도 안 변했어',
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 대화 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 6, widthPct: 68,
          korean: '요즘 어떻게 지내?',
          translation: 'How have you been doing lately?',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 52, widthPct: 82,
          korean: '한국어 공부 열심히 하고 있어!',
          translation: 'I\'ve been studying Korean hard!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 헤어짐 ───────────────────────────────────────────
    {
      type: 'gap', id: 'gap-5', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-5-1', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 6, widthPct: 62,
          korean: '다음에 또 봐!',
          translation: 'See you again next time!',
          speaker: 'sophie', lines: 1, tail: tailR,
          highlight_text: '다음에 또 봐',
        },
        {
          id: 'b-5-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 62,
          korean: '연락해요, 꼭!',
          translation: 'Let\'s stay in touch, for sure!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-020': EPISODE_020_WEBTOON }
