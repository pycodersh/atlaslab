// PATTO Onboarding Motion Constants

export const COLORS = {
  background: ['#eef5ff', '#f8fbff', '#ffffff'] as const,

  text: {
    primary: '#1c2c4a',
    accent:  '#1A73EB',
    muted:   '#8aabcf',
    pattern: '#dc2626',
  },

  orb: {
    gradient: ['#eaf3ff', '#c8ddff', '#a8c8fc', '#80aef5', '#6094ea'] as const,
    eye:      '#1a3570',
    glow:     'rgba(26,115,235,0.10)',
    ring1:    'rgba(26,115,235,0.10)',
    ring2:    'rgba(26,115,235,0.06)',
  },

  card: {
    background: 'rgba(255,255,255,0.62)',
    border:     'rgba(220,235,255,0.90)',
  },

  button: {
    primaryFrom: '#2d86f5',
    primaryMid:  '#1A73EB',
    primaryTo:   '#1558c0',
    laterBg:     'rgba(240,245,255,0.80)',
    laterBorder: 'rgba(200,220,255,0.60)',
    laterText:   '#8aabcf',
    orbFrom:     '#a8c8fc',
    orbMid1:     '#7aabf5',
    orbMid2:     '#4a88e8',
    orbTo:       '#2d6fd4',
  },

  blob: {
    top:    'rgba(180,210,255,0.40)',
    bottom: 'rgba(200,225,255,0.30)',
  },
} as const

export const SCENE_TRANSITION = {
  duration:    550,
  exitScale:   0.96,
  exitY:       -10,
  enterScale:  1.03,
  enterY:      14,
  easing:      [0.4, 0, 0.2, 1] as const,
} as const

export const TEXT_FADE = {
  duration: 600,
  fromY:    10,
  easing:   [0.25, 0.46, 0.45, 0.94] as const,
} as const

export const S1 = {
  floatAmplitude: 8,
  floatDurations: [4200, 5100, 3800, 4800, 4400, 5300, 3900],

  blockA: { in: 400,  out: 3000 },
  blockB: { in: 3300, out: 6000 },
  blockC: { in: 6300 },

  crossFadeDuration: 700,

  words: [
    { text: 'go',     top: '9%',  left: '8%',   right: undefined },
    { text: 'know',   top: '6%',  left: '52%',  right: undefined },
    { text: 'have',   top: '14%', left: '68%',  right: undefined },
    { text: 'take',   top: '22%', left: '5%',   right: undefined },
    { text: 'always', top: '20%', left: undefined, right: '5%'  },
    { text: 'want',   top: '30%', left: '12%',  right: undefined },
    { text: 'think',  top: '28%', left: undefined, right: '8%'  },
  ],
} as const

export const S2 = {
  orbSize:       96,
  orbFadeIn:     { start: 400, duration: 700 },
  orbRingOnAt:   1200,

  extraFadeInAt:   600,
  patternFadeInAt: 900,
  floatStartAt:    1800,
  floatAmplitude:  6,
  floatDuration:   2600,

  assembleAt:       4300,
  assembleDuration: 900,
  assembleEasing:   [0.4, 0, 0.2, 1] as const,
  assembleStagger:  80,
  colorChangeDelay: 320,

  glowAt:       5500,
  bottomCopyAt: 6000,

  patternWords: [
    { text: 'She',   isPattern: false },
    { text: 'came',  isPattern: true  },
    { text: 'up',    isPattern: true  },
    { text: 'with',  isPattern: true  },
    { text: 'a',     isPattern: false },
    { text: 'great', isPattern: false },
    { text: 'idea.', isPattern: false },
  ],

  extraWords: ['know', 'go', 'take', 'think', 'want', 'speak', 'always'],

  scatterPositions: [
    { x: 24,  y: 280 },
    { x: 240, y: 235 },
    { x: 108, y: 355 },
    { x: 248, y: 370 },
    { x: 28,  y: 430 },
    { x: 208, y: 445 },
    { x: 118, y: 480 },
  ],

  extraPositions: [
    { x: 20,  y: 215 },
    { x: 282, y: 265 },
    { x: 148, y: 235 },
    { x: 52,  y: 360 },
    { x: 272, y: 408 },
    { x: 132, y: 465 },
    { x: 268, y: 472 },
  ],

  wordWidths: [38, 54, 28, 50, 22, 50, 50],
  assembleGap: 6,
  assembleY:   450,
  screenWidth: 390,
} as const

export const S3 = {
  cardEntranceDuration: 550,
  cardEntranceDelay:    120,
  cardFromScale:        0.97,
  cardFromY:            12,

  pattern: {
    tag:     "TODAY'S PATTERN",
    text:    'came up with',
    example: {
      parts: ['She ', 'came up with', ' a great idea.'],
      redIndex: 1,
    },
    translation: '→ 그녀는 훌륭한 아이디어를 생각해냈습니다.',
  },
} as const

export const S4 = {
  orbSize:           108,
  orbAuraDuration:   3500,

  cardPrompt: '세션을 시작할까요?',

  decoOrb: {
    size:          52,
    bottom:        -18,
    right:         -10,
    entranceDelay: 900,
  },
} as const

export const ORB = {
  floatAmplitude: 10,
  floatDuration:  6000,
  auraDuration:   5000,
  auraScale:      1.15,
  eyeSize:        10,
  eyeGap:         16,
} as const
