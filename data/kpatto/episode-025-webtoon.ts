import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

const C1 = '/kpatto/ep-025/ep25_c1.png'
const C2 = '/kpatto/ep-025/ep25_c2.png'
const C3 = '/kpatto/ep-025/ep25_c3.png'
const C4 = '/kpatto/ep-025/ep25_c4.png'
const C5 = '/kpatto/ep-025/ep25_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_025_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-025',
  episode: 25,
  title: '경험 이야기',
  theme: '경험 / 여행',
  sections: [
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 68,
          korean: '제주도 가 봤어요?',
          translation: 'Have you been to Jeju?',
          speaker: 'minjun', lines: 1, tail: tailR,
          highlight_text: '가 봤어요',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 72,
          korean: '아직 못 가 봤어요.',
          translation: 'I haven\'t been there yet.',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '못 가 봤어요',
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 70,
          korean: '제주도 진짜 예뻐요!',
          translation: 'Jeju is really beautiful!',
          speaker: 'minjun', lines: 1, tail: tailR,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 80,
          korean: '한라산도 올라가 봤어요?',
          translation: 'Have you climbed Hallasan too?',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '올라가 봤어요',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 10, yPct: 6, widthPct: 82,
          korean: '네, 올라가 봤어요. 힘들었지만 좋았어요.',
          translation: 'Yes, I\'ve climbed it. It was tough but great.',
          speaker: 'minjun', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 68,
          korean: '저도 가고 싶어요!',
          translation: 'I want to go too!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 86,
          korean: '제주도에서 해산물 먹어 봤어요?',
          translation: 'Have you eaten seafood in Jeju?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 16, yPct: 56, widthPct: 78,
          korean: '물론이죠! 회 먹어 봤어요.',
          translation: 'Of course! I\'ve had sashimi.',
          speaker: 'minjun', lines: 1, tail: tailRTop,
          highlight_text: '먹어 봤어요',
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 80,
          korean: '같이 가 봐요, 언젠가!',
          translation: 'Let\'s go together, someday!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 56, widthPct: 64,
          korean: '좋아요! 약속해요.',
          translation: 'Sounds good! It\'s a promise.',
          speaker: 'minjun', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-025': EPISODE_025_WEBTOON }
