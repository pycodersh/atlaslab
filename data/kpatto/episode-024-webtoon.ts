import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// EP24: 의견 나누기 — 2열 x 3행 레이아웃 (가로2분할 + 세로3컷)
// c1=좌상, c2=우상, c3=좌중, c4=우중, c5=좌하, c6=우하
const C1 = '/kpatto/ep-024/ep24_c1.png'
const C2 = '/kpatto/ep-024/ep24_c2.png'
const C3 = '/kpatto/ep-024/ep24_c3.png'
const C4 = '/kpatto/ep-024/ep24_c4.png'
const C5 = '/kpatto/ep-024/ep24_c5.png'
const C6 = '/kpatto/ep-024/ep24_c6.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_024_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-024',
  episode: 24,
  title: '의견 나누기',
  theme: '의견 / 음식 토론',
  sections: [
    // Row 1
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 74,
          korean: '에마야, 한국 음식 어때?',
          translation: 'Emma, what do you think of Korean food?',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 80,
          korean: '진짜 맛있어요! 특히 매운 거!',
          translation: 'It\'s really delicious! Especially the spicy stuff!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '특히 매운 거',
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // Row 2
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 6, widthPct: 76,
          korean: '저는 너무 매운 것 같아요...',
          translation: 'I think it\'s too spicy...',
          speaker: 'sophie', lines: 1, tail: tailR,
          highlight_text: '매운 것 같아요',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 76,
          korean: '제 생각에는 딱 좋아요!',
          translation: 'I think it\'s perfect!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '제 생각에는',
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // Row 3
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 6, widthPct: 72,
          korean: '한번 도전해 볼게요!',
          translation: 'I\'ll try it once!',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 62,
          korean: '잘 할 수 있어요!',
          translation: 'You can do it!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },
    { type: 'panel', id: 'cut-6', imageUrl: C6, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-024': EPISODE_024_WEBTOON }
