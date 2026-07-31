import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 13: 약속 잡기 (Making Plans)
// Characters: Emma (에마) + Jisu (지수) + Sophie (소피)

const C1 = '/kpatto/ep-013/ep13_c1.png'
const C2 = '/kpatto/ep-013/ep13_c2.png'
const C3 = '/kpatto/ep-013/ep13_c3.png'
const C4 = '/kpatto/ep-013/ep13_c4.png'
const C5 = '/kpatto/ep-013/ep13_c5.png'
const C6 = '/kpatto/ep-013/ep13_c6.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_013_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-013',
  episode: 13,
  title: '약속 잡기',
  theme: '약속 / 일정',
  sections: [
    // ── Gap + CUT 1: 카카오톡 화면 ───────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 74,
          korean: '에마야, 주말에 뭐 해?',
          translation: 'Emma, what are you doing this weekend?',
          speaker: 'jisu', lines: 1, tail: tailR,
          highlight_text: '주말에 뭐 해',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 58, widthPct: 68,
          korean: '아직 아무것도 없어요!',
          translation: 'I have nothing planned yet!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 약속 제안 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 76,
          korean: '소피랑 같이 영화 볼래?',
          translation: 'Want to watch a movie with Sophie?',
          speaker: 'jisu', lines: 1, tail: tailR,
          highlight_text: '같이 영화 볼래',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 54, widthPct: 76,
          korean: '좋아요! 몇 시에 만날까요?',
          translation: 'Sure! What time should we meet?',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 장소 정하기 ──────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 72,
          korean: '홍대 카페에서 만나!',
          translation: 'Let\'s meet at a café in Hongdae!',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 54, widthPct: 76,
          korean: '저 조금 늦을 것 같아요...',
          translation: 'I might be a little late...',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '늦을 것 같아요',
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 당일 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 66,
          korean: '미안해요, 10분만요!',
          translation: 'Sorry, just 10 more minutes!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 54, widthPct: 68,
          korean: '괜찮아, 천천히 와.',
          translation: 'It\'s okay, take your time.',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 만남 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 84,
          korean: '다음엔 제가 절대 안 늦을게요!',
          translation: 'I\'ll never be late next time!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 72,
          korean: '다음에 해요, 다음에!',
          translation: 'Save it for next time!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    // ── Gap + CUT 6: 마무리 ───────────────────────────────────────────
    {
      type: 'gap', id: 'gap-5', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-5-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 84,
          korean: '오늘 진짜 재미있었어요!',
          translation: 'Today was really fun!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-5-2', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 56, widthPct: 72,
          korean: '다음엔 뭐 할까?',
          translation: 'What should we do next time?',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-6', imageUrl: C6, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-013': EPISODE_013_WEBTOON }
