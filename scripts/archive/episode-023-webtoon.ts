import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

const C1 = '/kpatto/ep-023/ep23_c1.png'
const C2 = '/kpatto/ep-023/ep23_c2.png'
const C3 = '/kpatto/ep-023/ep23_c3.png'
const C4 = '/kpatto/ep-023/ep23_c4.png'
const C5 = '/kpatto/ep-023/ep23_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_023_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-023',
  episode: 23,
  title: '해야 해요',
  theme: '의무 / 도서관',
  sections: [
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 60,
          korean: '시험이 언제야?',
          translation: 'When is the exam?',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 74,
          korean: '다음 주예요. 공부해야 해요!',
          translation: 'It\'s next week. I have to study!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '공부해야 해요',
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
          korean: '나도 리포트 써야 해.',
          translation: 'I have to write a report too.',
          speaker: 'jisu', lines: 1, tail: tailR,
          highlight_text: '써야 해',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 64,
          korean: '집중해야 해요!',
          translation: 'I have to concentrate!',
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
          xPct: 20, yPct: 6, widthPct: 72,
          korean: '핸드폰 보면 안 돼.',
          translation: 'You can\'t look at your phone.',
          speaker: 'jisu', lines: 1, tail: tailR,
          highlight_text: '보면 안 돼',
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 60,
          korean: '알았어요!',
          translation: 'Okay!',
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
          xPct: 4, yPct: 6, widthPct: 70,
          korean: '조금만 쉬어야 해요...',
          translation: 'I need to rest a little...',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 56, widthPct: 66,
          korean: '조금만 더 해야 해!',
          translation: 'You have to do a little more!',
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
          xPct: 4, yPct: 6, widthPct: 68,
          korean: '드디어 다 했어요!',
          translation: 'I finally finished everything!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 56, widthPct: 64,
          korean: '잘했어! 이제 쉬어.',
          translation: 'Well done! Rest now.',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-023': EPISODE_023_WEBTOON }
