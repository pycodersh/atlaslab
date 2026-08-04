import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

const C1 = '/kpatto/ep-021/ep21_c1.png'
const C2 = '/kpatto/ep-021/ep21_c2.png'
const C3 = '/kpatto/ep-021/ep21_c3.png'
const C4 = '/kpatto/ep-021/ep21_c4.png'
const C5 = '/kpatto/ep-021/ep21_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_021_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-021',
  episode: 21,
  title: '어제 뭐 했어?',
  theme: '과거 / 일상 대화',
  sections: [
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 6, widthPct: 66,
          korean: '에마야, 어제 뭐 했어?',
          translation: 'Emma, what did you do yesterday?',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 70,
          korean: '한강에 갔어요! 사진 찍었어요.',
          translation: 'I went to the Hangang River! I took photos.',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '한강에 갔어요',
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 66,
          korean: '재미있었어?',
          translation: 'Was it fun?',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 78,
          korean: '네! 치킨도 먹었어요.',
          translation: 'Yes! I ate chicken too.',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '치킨도 먹었어요',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 6, widthPct: 70,
          korean: '한강 치킨은 진짜 맛있지!',
          translation: 'Hangang chicken is really delicious!',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 78,
          korean: '또 가고 싶어요!',
          translation: 'I want to go again!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '또 가고 싶어요',
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 74,
          korean: '나도 한강 자주 가고 싶어.',
          translation: 'I want to go to Hangang often too.',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 56, widthPct: 66,
          korean: '그럼 같이 가자!',
          translation: 'Then let\'s go together!',
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
          korean: '이번 주말에 가요!',
          translation: 'Let\'s go this weekend!',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '이번 주말에 가요',
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 26, yPct: 56, widthPct: 60,
          korean: '좋아! 약속이야.',
          translation: 'Deal! It\'s a promise.',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-021': EPISODE_021_WEBTOON }
