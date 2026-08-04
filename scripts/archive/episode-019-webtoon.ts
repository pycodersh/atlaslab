import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 19: 경복궁 여행 (Gyeongbokgung Trip)
// Characters: Emma (에마) + Sophie (소피)

const C1 = '/kpatto/ep-019/ep19_c1.png'
const C2 = '/kpatto/ep-019/ep19_c2.png'
const C3 = '/kpatto/ep-019/ep19_c3.png'
const C4 = '/kpatto/ep-019/ep19_c4.png'
const C5 = '/kpatto/ep-019/ep19_c5.png'
const C6 = '/kpatto/ep-019/ep19_c6.png'

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_019_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-019',
  episode: 19,
  title: '경복궁 여행',
  theme: '관광 / 문화',
  sections: [
    // ── Gap + CUT 1: 경복궁 입구 ──────────────────────────────────────
    {
      type: 'gap', id: 'gap-0', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-0-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 70,
          korean: '여기서 유명한 게 뭐야?',
          translation: 'What\'s famous here?',
          speaker: 'sophie', lines: 1, tail: tailR,
          highlight_text: '유명한 게 뭐야',
        },
        {
          id: 'b-0-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 74,
          korean: '한복 입고 사진 찍는 거!',
          translation: 'Wearing hanbok and taking photos!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-1', imageUrl: C1, layout: 'wide' },

    // ── Gap + CUT 2: 사진 ─────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 60,
          korean: '같이 사진 찍어!',
          translation: 'Let\'s take a photo together!',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '같이 사진 찍어',
        },
        {
          id: 'b-1-2', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 56, widthPct: 64,
          korean: '좋아! 잘 나왔어?',
          translation: 'Sure! Did it turn out well?',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-2', imageUrl: C2, layout: 'wide' },

    // ── Gap + CUT 3: 기념품 가게 ──────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 66,
          korean: '선물로 뭐가 좋을까?',
          translation: 'What would be good as a gift?',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '선물로 뭐가 좋을까',
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 18, yPct: 56, widthPct: 74,
          korean: '한국 전통 과자 어때?',
          translation: 'How about traditional Korean sweets?',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-3', imageUrl: C3, layout: 'wide' },

    // ── Gap + CUT 4: 마무리 ───────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 20, yPct: 6, widthPct: 68,
          korean: '여기 또 오고 싶어!',
          translation: 'I want to come here again!',
          speaker: 'sophie', lines: 1, tail: tailR,
          highlight_text: '또 오고 싶어',
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 64,
          korean: '저도! 진짜 예쁘다.',
          translation: 'Me too! It\'s really beautiful.',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-4', imageUrl: C4, layout: 'wide' },

    // ── Gap + CUT 5: SNS ──────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 6, widthPct: 72,
          korean: '사진이 진짜 잘 나왔어!',
          translation: 'The photos turned out so well!',
          speaker: 'emma', lines: 1, tail: tailL,
          highlight_text: '잘 나왔어',
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 26, yPct: 56, widthPct: 60,
          korean: '인스타에 올려!',
          translation: 'Post them on Instagram!',
          speaker: 'sophie', lines: 1, tail: tailRTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-5', imageUrl: C5, layout: 'wide' },

    // ── Gap + CUT 6: 다음 약속 ────────────────────────────────────────
    {
      type: 'gap', id: 'gap-5', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-5-1', bubbleKey: 'bubble-oval',
          xPct: 22, yPct: 6, widthPct: 74,
          korean: '인스타 좋아요가 엄청 많아!',
          translation: 'So many Instagram likes!',
          speaker: 'sophie', lines: 1, tail: tailR,
        },
        {
          id: 'b-5-2', bubbleKey: 'bubble-oval',
          xPct: 4, yPct: 56, widthPct: 82,
          korean: '다음엔 창덕궁도 가자!',
          translation: 'Let\'s go to Changdeokgung next time!',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },
    { type: 'panel', id: 'cut-6', imageUrl: C6, layout: 'wide' },

    { type: 'gap', id: 'gap-6', heightRatio: 0.55, bubbles: [] },
  ],
}

export const WEBTOON_EPISODES = { 'kp-ep-019': EPISODE_019_WEBTOON }
