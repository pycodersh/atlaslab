import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 17: 약국에서 (At the Pharmacy)
// Characters: Emma (에마) + Jisu (지수) + Pharmacist (약사)

const C1 = '/kpatto/ep-017/ep17_c1.png'
const C2 = '/kpatto/ep-017/ep17_c2.png'
const C3 = '/kpatto/ep-017/ep17_c3.png'
const C4 = '/kpatto/ep-017/ep17_c4.png'
const C5 = '/kpatto/ep-017/ep17_c5.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_017_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-017',
  episode: 17,
  title: '약국에서',
  theme: '건강 / 약국',
  sections: [
    // ── Gap + CUT 1: 약국 앞 ──────────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 68,
          korean: '지수야, 나 많이 아파...',
          translation: 'Jisu, I\'m really sick...',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '많이 아파',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 32, yPct: 56, widthPct: 58,
          korean: '약국 가봐!',
          translation: 'Go to the pharmacy!',
          speaker: 'jisu', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 약국 안 ──────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 16, yPct: 6, widthPct: 60,
          korean: '어디 아파요?',
          translation: 'Where does it hurt?',
          speaker: 'pharmacist', lines: 1, tail: tailR,
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 54, widthPct: 76,
          korean: '머리가 아파요. 열도 나요.',
          translation: 'My head hurts. And I have a fever.',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '머리가 아파요',
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 약 요청 ──────────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 58,
          korean: '두통약 있어요?',
          translation: 'Do you have headache medicine?',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '두통약 있어요',
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 16, yPct: 56, widthPct: 68,
          korean: '네, 이거 드세요.',
          translation: 'Yes, take this.',
          speaker: 'pharmacist', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 조언 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 10, yPct: 6, widthPct: 80,
          korean: '매운 거 안 먹는 게 나아요.',
          translation: 'It\'s better not to eat spicy food.',
          speaker: 'pharmacist', lines: 1, tail: tailR,
          highlight_text: '안 먹는 게 나아요',
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 58,
          korean: '네, 알겠어요.',
          translation: 'Okay, I understand.',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: 회복 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 30, yPct: 6, widthPct: 54,
          korean: '괜찮아?',
          translation: 'Are you okay?',
          speaker: 'jisu', lines: 1, tail: tailR,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 52, widthPct: 78,
          korean: '응, 푹 쉬었더니 나았어!',
          translation: 'Yeah, I got plenty of rest and got better!',
          speaker: 'emma', lines: 1, tail: tailLTop,
          highlight_text: '푹 쉬었더니 나았어',
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    { type: 'gap', id: 'gap-5', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-017': EPISODE_017_WEBTOON }
