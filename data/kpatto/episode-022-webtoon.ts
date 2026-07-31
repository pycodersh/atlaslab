import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

const C1 = '/kpatto/ep-022/ep22_c1.png'
const C2 = '/kpatto/ep-022/ep22_c2.png'
const C3 = '/kpatto/ep-022/ep22_c3.png'
const C4 = '/kpatto/ep-022/ep22_c4.png'
const C5 = '/kpatto/ep-022/ep22_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_022_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-022',
  episode: 22,
  title: '추측하기',
  theme: '추측 / 맛집',
  sections: [
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 74,
          korean: '이 집 유명한 것 같아요.',
          translation: 'This place seems famous.',
          speaker: 'minjun', lines: 1, tail: tailR,
          highlight_text: '유명한 것 같아요',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 68,
          korean: '맛있을 것 같아요!',
          translation: 'It seems like it\'ll be delicious!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '맛있을 것 같아요',
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
          korean: '뭐 시킬 것 같아요?',
          translation: 'What do you think you\'ll order?',
          speaker: 'minjun', lines: 1, tail: tailR,
          highlight_text: '시킬 것 같아요',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 74,
          korean: '삼겹살 시킬 것 같아요.',
          translation: 'I think I\'ll order samgyeopsal.',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 72,
          korean: '줄이 긴 것 같은데...',
          translation: 'The line seems long...',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 74,
          korean: '기다릴 만한 것 같아요!',
          translation: 'It seems worth the wait!',
          speaker: 'minjun', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 62,
          korean: '드디어 들어가요!',
          translation: 'We\'re finally going in!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 56, widthPct: 62,
          korean: '분위기 좋을 것 같아!',
          translation: 'The atmosphere seems nice!',
          speaker: 'minjun', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 76,
          korean: '역시 맛있을 것 같았어요!',
          translation: 'It was delicious just as I thought!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 66,
          korean: '또 오고 싶다!',
          translation: 'I want to come again!',
          speaker: 'minjun', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-022': EPISODE_022_WEBTOON }
