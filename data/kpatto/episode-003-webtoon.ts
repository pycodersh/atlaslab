import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 3: 떡볶이 가게에서 (At the Tteokbokki Shop)

const C1 = '/kpatto/ep03/ep03_c1.png'
const C2 = '/kpatto/ep03/ep03_c2.png'
const C3 = '/kpatto/ep03/ep03_c3.png'
const C4 = '/kpatto/ep03/ep03_c4.png'
const C5 = '/kpatto/ep03/ep03_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_003_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-003',
  episode: 3,
  title: '떡볶이 가게에서',
  theme: '일상 / 분식',
  sections: [
    // ── Gap + CUT 1: 길거리 분식 가게, 에마와 지수 ───────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.56,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 8, widthPct: 44,
          korean: '와, 저거 뭐예요?',
          translation: 'Wow, what\'s that?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 56, yPct: 8, widthPct: 40,
          korean: '떡볶이야!\n진짜 맛있어.',
          translation: 'That\'s tteokbokki!\nIt\'s really delicious.',
          speaker: 'jisu', lines: 2, tail: tailR,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 에마가 떡볶이 먹을지 고민 ───────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.72,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 8, widthPct: 48,
          korean: '저거 먹고 싶어요!\n근데 매워요?',
          translation: 'I want to eat that!\nBut is it spicy?',
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 54, yPct: 8, widthPct: 42,
          korean: '매운 거\n먹을 수 있어요?',
          translation: 'Can you eat\nspicy food?',
          speaker: 'jisu', lines: 2, tail: tailR,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 에마가 한 입 먹고 매워서 당황 ───────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.72,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 80,
          korean: '으악... 매워요!!',
          translation: 'Oh no... it\'s spicy!!',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 16, yPct: 60, widthPct: 70,
          korean: '괜찮아요?',
          translation: 'Are you okay?',
          speaker: 'jisu', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 에마가 아주머니한테 주문 ────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.72,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 80,
          korean: '이게 떡볶이 맞아요?',
          translation: 'Is this tteokbokki?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 16, yPct: 60, widthPct: 70,
          korean: '맞아요, 맞아!',
          translation: 'That\'s right, that\'s right!',
          speaker: 'vendor', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 둘이 나란히 먹으며 행복한 장면 ─────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.72,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 8, widthPct: 46,
          korean: '매운 거 못 먹어요...\n근데 맛있어요!!',
          translation: 'I can\'t eat spicy food...\nbut it\'s delicious!!',
          speaker: 'emma', lines: 2, tail: tailL,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 56, yPct: 8, widthPct: 40,
          korean: '그게 바로\n떡볶이 마법이야.',
          translation: 'That\'s the\ntteokbokki magic.',
          speaker: 'jisu', lines: 2, tail: tailR,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-bottom', heightRatio: 0.36, bubbles: [] },
  ],
}
