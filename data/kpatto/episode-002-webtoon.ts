import type { WebtoonEpisodeData, BubbleTailData } from './webtoon-types'

// Episode 2: 지하철에서 (At the Subway)
//
// Source image : /kpatto/ep-002/kpatto_ep02.png  (1024 × 1536)
// Layout       : 2×2 grid (rows 1–2) + full-width bottom panel (row 3)
//
// Exact crop regions (original pixels, borders excluded):
//   CUT 1  x=8,   y=8,    w=500, h=510   (top-left)
//   CUT 2  x=518, y=8,    w=498, h=510   (top-right)
//   CUT 3  x=8,   y=528,  w=472, h=502   (mid-left)
//   CUT 4  x=490, y=528,  w=526, h=502   (mid-right)
//   CUT 5  x=8,   y=1040, w=1008,h=488   (bottom full-width)

const IMG  = '/kpatto/ep-002/kpatto_ep02.png'
const SRCW = 1024

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
    { type: 'gap', id: 'gap-top', heightRatio: 0.18, bubbles: [] },

    // ── CUT 1: Emma at subway station (top-left) ───────────────────────────
    { type: 'crop-panel', id: 'cut-1', imageUrl: IMG, srcW: SRCW,
      cropX: 8, cropY: 8, cropW: 500, cropH: 510 },

    // ── Gap 1 ─────────────────────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-1', heightRatio: 0.72,
      bubbles: [
        {
          id: 'b-1-1', bubbleKey: 'bubble-oval',
          xPct: 10, yPct: 12, widthPct: 65,
          korean: '지하철역이 어디예요?',
          translation: 'Where is the subway station?',
          speaker: 'emma', lines: 1, tail: tailL,
        },
      ],
    },

    // ── CUT 2: Emma + boy at subway map (top-right) ────────────────────────
    { type: 'crop-panel', id: 'cut-2', imageUrl: IMG, srcW: SRCW,
      cropX: 518, cropY: 8, cropW: 498, cropH: 510 },

    // ── Gap 2 ─────────────────────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-2', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-2-1', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 10, widthPct: 60,
          korean: '어디 가세요?',
          translation: 'Where are you going?',
          speaker: 'boy', lines: 1, tail: tailR,
        },
        {
          id: 'b-2-2', bubbleKey: 'bubble-oval',
          xPct: 10, yPct: 45, widthPct: 60,
          korean: '강남역이요.',
          translation: 'Gangnam Station.',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
        {
          id: 'b-2-3', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 72, widthPct: 60,
          korean: '2호선이에요.',
          translation: "It's Line 2.",
          speaker: 'boy', lines: 1, tail: tailR,
        },
      ],
    },

    // ── CUT 3: Emma meets Soyeon (mid-left) ───────────────────────────────
    { type: 'crop-panel', id: 'cut-3', imageUrl: IMG, srcW: SRCW,
      cropX: 8, cropY: 528, cropW: 472, cropH: 502 },

    // ── Gap 3 ─────────────────────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-3', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-3-1', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 10, widthPct: 60,
          korean: '안녕하세요! 저는 소연이에요.',
          translation: "Hello! I'm Soyeon.",
          speaker: 'soyeon', lines: 2, tail: tailR,
        },
        {
          id: 'b-3-2', bubbleKey: 'bubble-oval',
          xPct: 10, yPct: 55, widthPct: 60,
          korean: '저는 에마예요.',
          translation: "I'm Emma.",
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },

    // ── CUT 4: Ticket machine (mid-right) ─────────────────────────────────
    { type: 'crop-panel', id: 'cut-4', imageUrl: IMG, srcW: SRCW,
      cropX: 490, cropY: 528, cropW: 526, cropH: 502 },

    // ── Gap 4 ─────────────────────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-4', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-4-1', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 10, widthPct: 60,
          korean: '표가 있어요?',
          translation: 'Do you have a ticket?',
          speaker: 'soyeon', lines: 1, tail: tailR,
        },
        {
          id: 'b-4-2', bubbleKey: 'bubble-oval',
          xPct: 10, yPct: 48, widthPct: 60,
          korean: '아니요, 없어요.',
          translation: "No, I don't.",
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
        {
          id: 'b-4-3', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 74, widthPct: 60,
          korean: '여기서 사세요!',
          translation: 'Buy it here!',
          speaker: 'soyeon', lines: 1, tail: tailR,
        },
      ],
    },

    // ── CUT 5: Train at night, full-width ─────────────────────────────────
    { type: 'crop-panel', id: 'cut-5', imageUrl: IMG, srcW: SRCW,
      cropX: 8, cropY: 1040, cropW: 1008, cropH: 488 },

    // ── Gap 5 ─────────────────────────────────────────────────────────────
    {
      type: 'gap', id: 'gap-5', heightRatio: 0.88,
      bubbles: [
        {
          id: 'b-5-1', bubbleKey: 'bubble-oval',
          xPct: 28, yPct: 10, widthPct: 60,
          korean: '서울이 어때요?',
          translation: 'How is Seoul?',
          speaker: 'soyeon', lines: 1, tail: tailR,
        },
        {
          id: 'b-5-2', bubbleKey: 'bubble-oval',
          xPct: 10, yPct: 52, widthPct: 62,
          korean: '너무 좋아요! 감사합니다.',
          translation: 'I love it! Thank you.',
          speaker: 'emma', lines: 1, tail: tailLTop,
        },
      ],
    },

    // ── Bottom space ───────────────────────────────────────────────────────
    { type: 'gap', id: 'gap-bottom', heightRatio: 0.36, bubbles: [] },
  ],
}
