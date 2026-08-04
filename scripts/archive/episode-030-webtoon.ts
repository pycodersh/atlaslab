import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

const C1 = '/kpatto/ep-030/ep30_c1.png'
const C2 = '/kpatto/ep-030/ep30_c2.png'
const C3 = '/kpatto/ep-030/ep30_c3.png'
const C4 = '/kpatto/ep-030/ep30_c4.png'
const C5 = '/kpatto/ep-030/ep30_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_030_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-030',
  episode: 30,
  title: '어디 살아요?',
  theme: '거주 / 동네 소개',
  sections: [
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 68,
          korean: '에마는 어디 살아요?',
          translation: 'Emma, where do you live?',
          speaker: 'jisu', lines: 1, tail: tailR,
          highlight_text: '어디 살아요',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 76,
          korean: '홍대 근처에 살아요! 원룸이에요.',
          translation: 'I live near Hongdae! It\'s a studio apartment.',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '홍대 근처에 살아요',
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 68,
          korean: '학교에서 가까워요?',
          translation: 'Is it close to school?',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 76,
          korean: '네, 걸어서 10분이에요.',
          translation: 'Yes, it\'s a 10-minute walk.',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '걸어서 10분이에요',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 74,
          korean: '홍대 정말 좋은 동네야!',
          translation: 'Hongdae is really a great neighborhood!',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 52, widthPct: 88,
          korean: '맞아요! 카페도 많고, 맛집도 많아요.',
          translation: 'Right! There are many cafés and great restaurants.',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '카페도 많고',
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 72,
          korean: '나중에 놀러 가도 돼요?',
          translation: 'Can I come visit later?',
          speaker: 'jisu', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 68,
          korean: '물론이죠! 언제든지 와요.',
          translation: 'Of course! Come anytime.',
          speaker: 'emma', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 72,
          korean: '동네 구경시켜 줘요!',
          translation: 'Show me around the neighborhood!',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 64,
          korean: '좋아요! 같이 가요.',
          translation: 'Sounds good! Let\'s go together.',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-030': EPISODE_030_WEBTOON }
