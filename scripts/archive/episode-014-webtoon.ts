import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 14: 길 잃은 에마 (Emma Gets Lost)
// Characters: Emma (에마) + Stranger (행인)

const C1 = '/kpatto/ep-014/ep14_c1.png'
const C2 = '/kpatto/ep-014/ep14_c2.png'
const C3 = '/kpatto/ep-014/ep14_c3.png'
const C4 = '/kpatto/ep-014/ep14_c4.png'
const C5 = '/kpatto/ep-014/ep14_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_014_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-014',
  episode: 14,
  title: '길 잃은 에마',
  theme: '길 찾기 / 방향',
  sections: [
    // ── Gap + CUT 1: 골목 앞 ──────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 68,
          korean: '어...? 길을 잃었어요.',
          translation: 'Hm...? I\'m lost.',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '길을 잃었어요',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 56, widthPct: 64,
          korean: '어디 찾으세요?',
          translation: 'Are you looking for somewhere?',
          speaker: 'stranger', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 도움 요청 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 66,
          korean: '경복궁 어떻게 가요?',
          translation: 'How do I get to Gyeongbokgung?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 56, widthPct: 60,
          korean: '쭉 가면 돼요!',
          translation: 'Just go straight!',
          speaker: 'stranger', lines: 1, tail: tailRTop,
          highlight_text: '쭉 가면 돼요',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 방향 안내 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 16, yPct: 6, widthPct: 80,
          korean: '저기서 오른쪽으로 꺾으면 돼요.',
          translation: 'Turn right over there.',
          speaker: 'stranger', lines: 1, tail: tailR,
          highlight_text: '오른쪽으로 꺾으면 돼요',
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 66,
          korean: '오른쪽이요? 감사해요!',
          translation: 'Right? Thank you!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 확인 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 68,
          korean: '걸어서 얼마나 걸려요?',
          translation: 'How long does it take on foot?',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '걸어서 얼마나 걸려요',
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 16, yPct: 54, widthPct: 76,
          korean: '한 10분 정도 걸려요.',
          translation: 'It takes about 10 minutes.',
          speaker: 'stranger', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 도착 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 76,
          korean: '지도 없이도 할 수 있었어요!',
          translation: 'I managed even without a map!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 54, widthPct: 88,
          korean: '다음엔 지도 보여달라고 해야지.',
          translation: 'Next time I should ask to see the map.',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-5', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-014': EPISODE_014_WEBTOON }
