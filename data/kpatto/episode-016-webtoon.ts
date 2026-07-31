import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 16: 날씨 이야기 (Talking About the Weather)
// Characters: Emma (에마) + Jisu (지수)

const C1 = '/kpatto/ep-016/ep16_c1.png'
const C2 = '/kpatto/ep-016/ep16_c2.png'
const C3 = '/kpatto/ep-016/ep16_c3.png'
const C4 = '/kpatto/ep-016/ep16_c4.png'
const C5 = '/kpatto/ep-016/ep16_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_016_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-016',
  episode: 16,
  title: '날씨 이야기',
  theme: '날씨 / 계절',
  sections: [
    // ── Gap + CUT 1: 아침 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 74,
          korean: '에마야, 오늘 날씨 어때?',
          translation: 'Emma, what\'s the weather like today?',
          speaker: 'jisu', lines: 1, tail: tailR,
          highlight_text: '날씨 어때',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 56,
          korean: '엄청 추워요!',
          translation: 'It\'s really cold!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 날씨 예보 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 70,
          korean: '오늘 눈 올 것 같아요.',
          translation: 'I think it\'ll snow today.',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '올 것 같아요',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 56, widthPct: 72,
          korean: '진짜? 우산 챙겨야겠다!',
          translation: 'Really? I should bring an umbrella!',
          speaker: 'jisu', lines: 1, tail: tailRTop,
          highlight_text: '챙겨야겠다',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 점심 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 76,
          korean: '날씨 좋네요! 산책할까요?',
          translation: 'The weather\'s nice! Shall we take a walk?',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '날씨 좋네요',
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 56, widthPct: 44,
          korean: '좋아!',
          translation: 'Sure!',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 오후 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 30, yPct: 6, widthPct: 60,
          korean: '너무 더워졌다!',
          translation: 'It\'s gotten so hot!',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 78,
          korean: '한국 날씨 진짜 신기해요.',
          translation: 'Korean weather is really interesting.',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 저녁 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 70,
          korean: '내일 거기 날씨 어때요?',
          translation: 'What\'s the weather like there tomorrow?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 30, yPct: 56, widthPct: 56,
          korean: '맑을 거야!',
          translation: 'It\'ll be clear!',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-5', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-016': EPISODE_016_WEBTOON }
