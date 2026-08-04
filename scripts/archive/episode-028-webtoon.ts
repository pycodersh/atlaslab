import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

const C1 = '/kpatto/ep-028/ep28_c1.png'
const C2 = '/kpatto/ep-028/ep28_c2.png'
const C3 = '/kpatto/ep-028/ep28_c3.png'
const C4 = '/kpatto/ep-028/ep28_c4.png'
const C5 = '/kpatto/ep-028/ep28_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_028_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-028',
  episode: 28,
  title: 'K-뷰티 쇼핑',
  theme: '쇼핑 / K-뷰티',
  sections: [
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 68,
          korean: '이 크림 써 봐도 돼요?',
          translation: 'Can I try this cream?',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '써 봐도 돼요',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 24, yPct: 56, widthPct: 60,
          korean: '네, 물론이에요!',
          translation: 'Yes, of course!',
          speaker: 'staff', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 72,
          korean: '이 제품 효과 있어요?',
          translation: 'Is this product effective?',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '효과 있어요',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 14, yPct: 56, widthPct: 78,
          korean: '네, 수분 공급에 정말 좋아요.',
          translation: 'Yes, it\'s really good for hydration.',
          speaker: 'staff', lines: 1, tail: tailRTop,
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
          korean: '이거 어때? 피부에 맞을 것 같아.',
          translation: 'What about this? It seems like it\'ll suit your skin.',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 66,
          korean: '좋아요! 이거 살게요.',
          translation: 'I like it! I\'ll buy this.',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '살게요',
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 72,
          korean: '소피야, 이것도 써 봐!',
          translation: 'Sophie, try this too!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 72,
          korean: '와, 피부가 촉촉해!',
          translation: 'Wow, my skin feels so moisturized!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 84,
          korean: 'K-뷰티 진짜 최고예요!',
          translation: 'K-beauty is really the best!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 56, widthPct: 76,
          korean: '더 많이 사고 싶어!',
          translation: 'I want to buy more!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-028': EPISODE_028_WEBTOON }
