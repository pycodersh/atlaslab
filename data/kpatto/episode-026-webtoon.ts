import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

const C1 = '/kpatto/ep-026/ep26_c1.png'
const C2 = '/kpatto/ep-026/ep26_c2.png'
const C3 = '/kpatto/ep-026/ep26_c3.png'
const C4 = '/kpatto/ep-026/ep26_c4.png'
const C5 = '/kpatto/ep-026/ep26_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_026_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-026',
  episode: 26,
  title: 'K-드라마 이야기',
  theme: '드라마 / 관심사',
  sections: [
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 72,
          korean: '요즘 무슨 드라마 봐?',
          translation: 'What drama are you watching lately?',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 52, widthPct: 80,
          korean: '이상한 변호사 우영우 봐요!',
          translation: 'I\'m watching Extraordinary Attorney Woo!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '이상한 변호사 우영우',
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 6, widthPct: 74,
          korean: '나도 봤어! 정말 재미있지?',
          translation: 'I watched it too! It\'s really fun, right?',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 74,
          korean: '네! 완전 빠져 있어요!',
          translation: 'Yes! I\'m completely hooked!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '빠져 있어요',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 6, widthPct: 72,
          korean: '시즌2 언제 나와요?',
          translation: 'When does season 2 come out?',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '언제 나와요',
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 72,
          korean: '모르겠어. 기대돼!',
          translation: 'I don\'t know. I\'m looking forward to it!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 80,
          korean: '다른 드라마도 추천해 줘!',
          translation: 'Recommend other dramas to me too!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 56, widthPct: 76,
          korean: '오징어 게임 봤어 봤어요?',
          translation: 'Have you seen Squid Game?',
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
          xPct: 4, yPct: 6, widthPct: 76,
          korean: '네! 정말 충격적이었어요.',
          translation: 'Yes! It was really shocking.',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 66,
          korean: '맞아! 최고였지!',
          translation: 'Right! It was the best!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-026': EPISODE_026_WEBTOON }
