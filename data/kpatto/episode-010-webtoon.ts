import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 10: 학교에서 (At School)
// Characters: Emma (에마) + Jisu (지수) + Professor (교수님) + Students (학생들)

const C1 = '/kpatto/ep10/ep10_c1.png'
const C2 = '/kpatto/ep10/ep10_c2.png'
const C3 = '/kpatto/ep10/ep10_c3.png'
const C4 = '/kpatto/ep10/ep10_c4.png'
const C5 = '/kpatto/ep10/ep10_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_010_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-010',
  episode: 10,
  title: '학교에서',
  theme: '일상 / 대학교',
  sections: [
    // ── Gap + CUT 1: 첫 수업 ─────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 38, yPct: 6, widthPct: 58,
          korean: '에마야, 할 수 있어!',
          translation: 'Emma, you can do it!',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 58, widthPct: 60,
          korean: '오늘 첫 수업이에요.\n조금 떨려요.',
          translation: "Today is my first class.\nI'm a little nervous.",
          speaker: 'emma', lines: 2, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 교수님 자기소개 요청 ─────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 76,
          korean: '새로 온 학생이죠?\n자기소개 해볼까요?',
          translation: "You're the new student, right?\nWould you like to introduce yourself?",
          speaker: 'professor', lines: 2, tail: tailR,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 68, widthPct: 32,
          korean: '네...',
          translation: 'Yes...',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 자기소개 ─────────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 76,
          korean: '저는 에마예요. 미국에서 왔어요.\n경영학 전공이에요. 잘 부탁드려요!',
          translation: "I'm Emma. I'm from America.\nMy major is business. Please take care of me!",
          speaker: 'emma', lines: 2, tail: tailL,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 학생들 반응 ──────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 58,
          korean: '와~ 한국어 잘한다!',
          translation: 'Wow~ Your Korean is great!',
          speaker: 'students', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 44, yPct: 58, widthPct: 44,
          korean: '최고야!',
          translation: "You're the best!",
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 에마의 감동 ──────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 62,
          korean: '할 수 있었어요. 한국어로요.',
          translation: 'I did it. In Korean.',
          speaker: 'emma', lines: 1, tail: tailL,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-bottom', heightRatio: 0.36, bubbles: [] },
  ],
}
