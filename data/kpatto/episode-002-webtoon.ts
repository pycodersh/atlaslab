import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 2: 지하철에서 (At the Subway)
//
// Source image: /kpatto/ep-002/kpatto_ep02.png — 1024×1536, aspect 1.5
// Layout: 2×2 grid + 1 full-width bottom panel
//
// Crop map (% of image dimensions):
//   Cut 1 (subway station, looking around) : left=0,  top=0,   w=50, h=32
//   Cut 2 (girl + boy at subway map)       : left=50, top=0,   w=50, h=32
//   Cut 3 (two girls meet)                 : left=0,  top=32,  w=50, h=33
//   Cut 4 (ticket machine)                 : left=50, top=32,  w=50, h=33
//   Cut 5 (train at night, city lights)    : left=0,  top=65,  w=100,h=35

const IMG  = '/kpatto/ep-002/kpatto_ep02.png'
const ASPT = 1.5  // 1536/1024

const tailL:    BubbleTailData = { anchor: 0.28, tipX: 0.15, tipY:  0.97, baseWidth: 0.09 }
const tailR:    BubbleTailData = { anchor: 0.22, tipX: 0.85, tipY:  0.97, baseWidth: 0.09 }
const tailLTop: BubbleTailData = { anchor: 0.72, tipX: 0.15, tipY: -0.20, baseWidth: 0.09 }
const tailRTop: BubbleTailData = { anchor: 0.78, tipX: 0.85, tipY: -0.20, baseWidth: 0.09 }

export const EPISODE_002_WEBTOON: WebtoonEpisodeData = {
  id: 'kp-ep-002',
  episode: 2,
  title: '지하철에서',
  theme: '일상 / 지하철',
  sections: [
    // ── Top space ──────────────────────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-top',
      heightRatio: 0.18,
      bubbles: [],
    },

    // ── Cut 1: Emma at subway station ──────────────────────────────────────
    {
      type: 'crop-panel',
      id: 'cut-1',
      imageUrl: IMG,
      imageAspect: ASPT,
      cropLeftPct: 0,
      cropTopPct: 0,
      cropWidthPct: 50,
      cropHeightPct: 32,
    },

    // ── Gap 1: Emma is lost ────────────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-1',
      heightRatio: 0.72,
      bubbles: [
        {
          id: 'b-1-1',
          bubbleKey: 'bubble-oval',
          xPct: 10,
          yPct: 12,
          widthPct: 65,
          korean: '지하철역이 어디예요?',
          translation: 'Where is the subway station?',
          speaker: 'emma',
          lines: 1,
          tail: tailL,
        },
      ],
    },

    // ── Cut 2: Emma + boy at map ───────────────────────────────────────────
    {
      type: 'crop-panel',
      id: 'cut-2',
      imageUrl: IMG,
      imageAspect: ASPT,
      cropLeftPct: 50,
      cropTopPct: 0,
      cropWidthPct: 50,
      cropHeightPct: 32,
    },

    // ── Gap 2: boy helps with map ──────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-2',
      heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1',
          bubbleKey: 'bubble-oval',
          xPct: 28,
          yPct: 10,
          widthPct: 60,
          korean: '어디 가세요?',
          translation: 'Where are you going?',
          speaker: 'boy',
          lines: 1,
          tail: tailR,
        },
        {
          id: 'b-2-2',
          bubbleKey: 'bubble-oval',
          xPct: 10,
          yPct: 45,
          widthPct: 60,
          korean: '강남역이요.',
          translation: 'Gangnam Station.',
          speaker: 'emma',
          lines: 1,
          tail: tailLTop,
        },
        {
          id: 'b-2-3',
          bubbleKey: 'bubble-oval',
          xPct: 28,
          yPct: 72,
          widthPct: 60,
          korean: '2호선이에요.',
          translation: 'It\'s Line 2.',
          speaker: 'boy',
          lines: 1,
          tail: tailR,
        },
      ],
    },

    // ── Cut 3: Emma meets Soyeon ───────────────────────────────────────────
    {
      type: 'crop-panel',
      id: 'cut-3',
      imageUrl: IMG,
      imageAspect: ASPT,
      cropLeftPct: 0,
      cropTopPct: 32,
      cropWidthPct: 50,
      cropHeightPct: 33,
    },

    // ── Gap 3: introductions ───────────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-3',
      heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1',
          bubbleKey: 'bubble-oval',
          xPct: 28,
          yPct: 10,
          widthPct: 60,
          korean: '안녕하세요! 저는 소연이에요.',
          translation: 'Hello! I\'m Soyeon.',
          speaker: 'soyeon',
          lines: 2,
          tail: tailR,
        },
        {
          id: 'b-3-2',
          bubbleKey: 'bubble-oval',
          xPct: 10,
          yPct: 55,
          widthPct: 60,
          korean: '저는 에마예요.',
          translation: 'I\'m Emma.',
          speaker: 'emma',
          lines: 1,
          tail: tailLTop,
        },
      ],
    },

    // ── Cut 4: ticket machine ──────────────────────────────────────────────
    {
      type: 'crop-panel',
      id: 'cut-4',
      imageUrl: IMG,
      imageAspect: ASPT,
      cropLeftPct: 50,
      cropTopPct: 32,
      cropWidthPct: 50,
      cropHeightPct: 33,
    },

    // ── Gap 4: buying ticket ───────────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-4',
      heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1',
          bubbleKey: 'bubble-oval',
          xPct: 28,
          yPct: 10,
          widthPct: 60,
          korean: '표가 있어요?',
          translation: 'Do you have a ticket?',
          speaker: 'soyeon',
          lines: 1,
          tail: tailR,
        },
        {
          id: 'b-4-2',
          bubbleKey: 'bubble-oval',
          xPct: 10,
          yPct: 48,
          widthPct: 60,
          korean: '아니요, 없어요.',
          translation: 'No, I don\'t.',
          speaker: 'emma',
          lines: 1,
          tail: tailLTop,
        },
        {
          id: 'b-4-3',
          bubbleKey: 'bubble-oval',
          xPct: 28,
          yPct: 74,
          widthPct: 60,
          korean: '여기서 사세요!',
          translation: 'Buy it here!',
          speaker: 'soyeon',
          lines: 1,
          tail: tailR,
        },
      ],
    },

    // ── Cut 5: train at night ──────────────────────────────────────────────
    {
      type: 'crop-panel',
      id: 'cut-5',
      imageUrl: IMG,
      imageAspect: ASPT,
      cropLeftPct: 0,
      cropTopPct: 65,
      cropWidthPct: 100,
      cropHeightPct: 35,
    },

    // ── Gap 5: conversation on train ───────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-5',
      heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-5-1',
          bubbleKey: 'bubble-oval',
          xPct: 28,
          yPct: 10,
          widthPct: 60,
          korean: '서울이 어때요?',
          translation: 'How is Seoul?',
          speaker: 'soyeon',
          lines: 1,
          tail: tailR,
        },
        {
          id: 'b-5-2',
          bubbleKey: 'bubble-oval',
          xPct: 10,
          yPct: 52,
          widthPct: 62,
          korean: '너무 좋아요! 감사합니다.',
          translation: 'I love it! Thank you.',
          speaker: 'emma',
          lines: 1,
          tail: tailLTop,
        },
      ],
    },

    // ── Bottom space ───────────────────────────────────────────────────────
    {
      type: 'gap',
      id: 'gap-bottom',
      heightRatio: 0.36,
      bubbles: [],
    },
  ],
}
