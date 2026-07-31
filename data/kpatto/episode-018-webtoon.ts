import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 18: 취미 이야기 (Talking About Hobbies)
// Characters: Emma (에마) + Minjun (민준)

const C1 = '/kpatto/ep-018/ep18_c1.png'
const C2 = '/kpatto/ep-018/ep18_c2.png'
const C3 = '/kpatto/ep-018/ep18_c3.png'
const C4 = '/kpatto/ep-018/ep18_c4.png'
const C5 = '/kpatto/ep-018/ep18_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_018_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-018',
  episode: 18,
  title: '취미 이야기',
  theme: '취미 / 관심사',
  sections: [
    // ── Gap + CUT 1: 카페 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 24, yPct: 6, widthPct: 66,
          korean: '에마야, 취미가 뭐야?',
          translation: 'Emma, what\'s your hobby?',
          speaker: 'minjun', lines: 1, tail: tailR,
          highlight_text: '취미가 뭐야',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 74,
          korean: '사진 찍는 거요! 오빠는요?',
          translation: 'Taking photos! What about you?',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 공통점 ───────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 6, widthPct: 66,
          korean: '나도 사진 좋아해!',
          translation: 'I like photography too!',
          speaker: 'minjun', lines: 1, tail: tailR,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 44,
          korean: '저도요!',
          translation: 'Me too!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '저도요',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 차이점 ───────────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 6, widthPct: 68,
          korean: '난 필름 카메라 좋아해.',
          translation: 'I like film cameras.',
          speaker: 'minjun', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 52, widthPct: 84,
          korean: '저는 폰 카메라 별로예요.\n미러리스 써요.',
          translation: 'I don\'t really like phone cameras.\nI use a mirrorless.',
          speaker: 'emma', lines: 2, tail: tailLTop,
          highlight_text: '별로예요',
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 관심사 ───────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 84,
          korean: '요즘 한국 카페 사진에 빠져 있어요.',
          translation: 'I\'ve been obsessed with taking photos of Korean cafés lately.',
          speaker: 'emma', lines: 2, tail: tailL,
          highlight_text: '빠져 있어요',
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 62, widthPct: 70,
          korean: '완전 내 스타일이네!',
          translation: 'That\'s totally my style!',
          speaker: 'minjun', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 약속 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 10, yPct: 6, widthPct: 82,
          korean: '다음엔 같이 카페 투어 하자.',
          translation: 'Let\'s do a café tour together next time.',
          speaker: 'minjun', lines: 1, tail: tailR,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 60,
          korean: '완전 좋아요!',
          translation: 'That sounds perfect!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-5', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-018': EPISODE_018_WEBTOON }
