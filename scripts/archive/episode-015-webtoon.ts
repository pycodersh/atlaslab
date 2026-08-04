import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 15: 드라마 추천 (Drama Recommendation)
// Characters: Emma (에마) + Sophie (소피)

const C1 = '/kpatto/ep-015/ep15_c1.png'
const C2 = '/kpatto/ep-015/ep15_c2.png'
const C3 = '/kpatto/ep-015/ep15_c3.png'
const C4 = '/kpatto/ep-015/ep15_c4.png'
const C5 = '/kpatto/ep-015/ep15_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_015_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-015',
  episode: 15,
  title: '드라마 추천',
  theme: 'K-드라마 / 추천',
  sections: [
    // ── Gap + CUT 1: 카페 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 74,
          korean: '에마, 요즘 드라마 봐?',
          translation: 'Emma, are you watching any dramas lately?',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 56,
          korean: '네! 이거 봤어?',
          translation: 'Yes! Have you seen this one?',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '봤어',
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 추천 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 56,
          korean: '진짜 강추야!',
          translation: 'I highly recommend it!',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '강추야',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 40, widthPct: 52,
          korean: '재미있어?',
          translation: 'Is it good?',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
        {
          id: 'b-1-3', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 68, widthPct: 60,
          korean: '너무 재미있어!',
          translation: 'It\'s so fun!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '재미있어',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 시청 방법 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 68,
          korean: '어디서 볼 수 있어?',
          translation: 'Where can I watch it?',
          speaker: 'sophie', lines: 1, tail: tailR,
          highlight_text: '어디서 볼 수 있어',
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 76,
          korean: '넷플릭스에서 볼 수 있어요.',
          translation: 'You can watch it on Netflix.',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 방영 시간 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 16, yPct: 6, widthPct: 76,
          korean: '몇 시에 새 화 올라와?',
          translation: 'What time do new episodes come out?',
          speaker: 'sophie', lines: 1, tail: tailR,
          highlight_text: '몇 시에 새 화 올라와',
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 70,
          korean: '매주 금요일 밤 9시!',
          translation: 'Every Friday at 9pm!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 반응 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 16, yPct: 6, widthPct: 78,
          korean: '어젯밤에 다 봤어!',
          translation: 'I watched it all last night!',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 54,
          korean: '진짜? 대박!',
          translation: 'Really? Awesome!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-5', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-015': EPISODE_015_WEBTOON }
