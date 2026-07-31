import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

const C1 = '/kpatto/ep-029/ep29_c1.png'
const C2 = '/kpatto/ep-029/ep29_c2.png'
const C3 = '/kpatto/ep-029/ep29_c3.png'
const C4 = '/kpatto/ep-029/ep29_c4.png'
const C5 = '/kpatto/ep-029/ep29_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_029_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-029',
  episode: 29,
  title: '건강과 운동',
  theme: '건강 / 운동',
  sections: [
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 6, widthPct: 74,
          korean: '에마 씨, 운동 좋아해요?',
          translation: 'Emma, do you like exercising?',
          speaker: 'minjun', lines: 1, tail: tailR,
          highlight_text: '운동 좋아해요',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 80,
          korean: '네! 요가 해요. 달리기도 해요.',
          translation: 'Yes! I do yoga. I also run.',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 6, widthPct: 72,
          korean: '한국에서 뭐 해요?',
          translation: 'What do you do in Korea?',
          speaker: 'minjun', lines: 1, tail: tailR,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 76,
          korean: '한강에서 자전거 타요!',
          translation: 'I ride a bike at the Hangang River!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '자전거 타요',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 6, widthPct: 76,
          korean: '건강이 제일 중요해요!',
          translation: 'Health is the most important thing!',
          speaker: 'minjun', lines: 1, tail: tailR,
          highlight_text: '제일 중요해요',
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 68,
          korean: '맞아요! 같이 운동해요!',
          translation: 'That\'s right! Let\'s exercise together!',
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
          xPct: 18, yPct: 6, widthPct: 76,
          korean: '주말에 등산 어때요?',
          translation: 'How about hiking on the weekend?',
          speaker: 'minjun', lines: 1, tail: tailR,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 72,
          korean: '좋아요! 어느 산이에요?',
          translation: 'Sounds good! Which mountain?',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 6, widthPct: 68,
          korean: '북한산은 어때요?',
          translation: 'How about Bukhansan?',
          speaker: 'minjun', lines: 1, tail: tailR,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 76,
          korean: '완전 좋아요! 기대돼요!',
          translation: 'Sounds perfect! I\'m looking forward to it!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-029': EPISODE_029_WEBTOON }
