import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

const C1 = '/kpatto/ep-027/ep27_c1.png'
const C2 = '/kpatto/ep-027/ep27_c2.png'
const C3 = '/kpatto/ep-027/ep27_c3.png'
const C4 = '/kpatto/ep-027/ep27_c4.png'
const C5 = '/kpatto/ep-027/ep27_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_027_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-027',
  episode: 27,
  title: 'K-POP',
  theme: 'K-POP / 음악',
  sections: [
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 74,
          korean: '어떤 케이팝 좋아요?',
          translation: 'What K-pop do you like?',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 68,
          korean: '저는 BTS 팬이에요!',
          translation: 'I\'m a BTS fan!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: 'BTS 팬이에요',
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
          korean: '이 노래 들어 봤어요?',
          translation: 'Have you heard this song?',
          speaker: 'jisu', lines: 1, tail: tailR,
          highlight_text: '들어 봤어요',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 82,
          korean: '이 가사 무슨 뜻이에요?',
          translation: 'What does this lyric mean?',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '무슨 뜻이에요',
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
          korean: '그리워는 I miss you예요!',
          translation: '"그리워" means "I miss you"!',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 72,
          korean: '정말요? 너무 예쁜 말이에요.',
          translation: 'Really? That\'s such a beautiful phrase.',
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
          xPct: 4, yPct: 6, widthPct: 84,
          korean: '콘서트 같이 가고 싶어요!',
          translation: 'I want to go to a concert together!',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '같이 가고 싶어요',
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 66,
          korean: '진짜? 같이 가자!',
          translation: 'Really? Let\'s go together!',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 72,
          korean: '티켓 언제 사요?',
          translation: 'When do we buy tickets?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 70,
          korean: '오픈되면 바로 사자!',
          translation: 'Let\'s buy them right when they open!',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-027': EPISODE_027_WEBTOON }
