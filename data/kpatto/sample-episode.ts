import type { KPattoStory, KPattoVocabulary } from './types'

const STRIP = '/kpatto/ep-001/strip.png'
const ASPECT = '5/2'

export const SAMPLE_EPISODE_1: KPattoStory = {
  id: 'kp-ep-001',
  episode: 1,
  title: '카페에서',
  level: 'beginner',
  theme: '일상 / 카페',
  tags: ['kp-005', 'kp-003', 'kp-004', 'kp-006', 'kp-007'],
  vocabulary_ids: ['kp-v-001', 'kp-v-002', 'kp-v-003'],
  thumbnail_url: undefined,
  panels: [
    // ── CUT 1 ─ 카페 앞 ──────────────────────────────────────────────
    {
      id: 'panel-1',
      strip_url: STRIP,
      strip_index: 0,
      strip_total: 5,
      panel_aspect: ASPECT,
      speech_bubbles: [
        {
          speaker: 'emma',
          korean: '여기 카페예요?',
          x: 7, y: 8, width: 34,
          tailDirection: 'bottom-right',
          tailTarget: { x: 33, y: 50 },
        },
      ],
      dialogues: [
        {
          id: 'd-1-1',
          character: 'Emma',
          korean: '여기 카페예요?',
          translations: {
            en: 'Is this a café?',
            ja: 'ここはカフェですか？',
            es: '¿Aquí hay un café?',
          },
        },
      ],
    },

    // ── CUT 2 ─ 첫 만남 ──────────────────────────────────────────────
    {
      id: 'panel-2',
      strip_url: STRIP,
      strip_index: 1,
      strip_total: 5,
      panel_aspect: ASPECT,
      speech_bubbles: [
        {
          speaker: 'jisoo',
          korean: '어서 오세요.',
          x: 58, y: 8, width: 30,
          tailDirection: 'bottom-left',
          tailTarget: { x: 68, y: 42 },
        },
        {
          speaker: 'emma',
          korean: '안녕하세요.',
          x: 7, y: 54, width: 28,
          tailDirection: 'top-right',
          tailTarget: { x: 34, y: 49 },
        },
      ],
      dialogues: [
        {
          id: 'd-2-1',
          character: 'Jisoo',
          korean: '어서 오세요.',
          translations: {
            en: 'Welcome.',
            ja: 'いらっしゃいませ。',
            es: 'Bienvenida.',
          },
        },
        {
          id: 'd-2-2',
          character: 'Emma',
          korean: '안녕하세요.',
          translations: {
            en: 'Hello.',
            ja: 'こんにちは。',
            es: 'Hola.',
          },
        },
      ],
    },

    // ── CUT 3 ─ 메뉴를 보며 질문 ─────────────────────────────────────
    {
      id: 'panel-3',
      strip_url: STRIP,
      strip_index: 2,
      strip_total: 5,
      panel_aspect: ASPECT,
      speech_bubbles: [
        {
          speaker: 'emma',
          korean: '이거 뭐예요?',
          x: 55, y: 8, width: 36,
          tailDirection: 'bottom-left',
          tailTarget: { x: 54, y: 51 },
        },
      ],
      dialogues: [
        {
          id: 'd-3-1',
          character: 'Emma',
          korean: '이거 뭐예요?',
          translations: {
            en: 'What is this?',
            ja: 'これは何ですか？',
            es: '¿Qué es esto?',
          },
          pattern_id: 'kp-004',
        },
      ],
      pattern_card: { pattern_id: 'kp-004' },
    },

    // ── CUT 4 ─ 주문하기 ──────────────────────────────────────────────
    {
      id: 'panel-4',
      strip_url: STRIP,
      strip_index: 3,
      strip_total: 5,
      panel_aspect: ASPECT,
      speech_bubbles: [
        {
          speaker: 'emma',
          korean: '카페라떼 주세요.',
          x: 4, y: 8, width: 36,
          tailDirection: 'bottom-right',
          tailTarget: { x: 34, y: 48 },
        },
        {
          speaker: 'jisoo',
          korean: '네, 알겠습니다.',
          x: 60, y: 10, width: 32,
          tailDirection: 'bottom-left',
          tailTarget: { x: 67, y: 45 },
        },
      ],
      dialogues: [
        {
          id: 'd-4-1',
          character: 'Emma',
          korean: '카페라떼 주세요.',
          translations: {
            en: 'Café latte, please.',
            ja: 'カフェラテをください。',
            es: 'Un café con leche, por favor.',
          },
          pattern_id: 'kp-003',
        },
        {
          id: 'd-4-2',
          character: 'Jisoo',
          korean: '네, 알겠습니다.',
          translations: {
            en: 'Sure, got it!',
            ja: 'はい、かしこまりました。',
            es: 'Sí, de acuerdo.',
          },
        },
      ],
      pattern_card: { pattern_id: 'kp-003' },
    },

    // ── CUT 5 ─ 음료를 마신 후 ───────────────────────────────────────
    {
      id: 'panel-5',
      strip_url: STRIP,
      strip_index: 4,
      strip_total: 5,
      panel_aspect: ASPECT,
      speech_bubbles: [
        {
          speaker: 'emma',
          korean: '맛있어요!',
          x: 56, y: 8, width: 30,
          tailDirection: 'bottom-left',
          tailTarget: { x: 57, y: 47 },
        },
      ],
      dialogues: [
        {
          id: 'd-5-1',
          character: 'Emma',
          korean: '맛있어요!',
          translations: {
            en: "It's delicious!",
            ja: 'おいしい！',
            es: '¡Está delicioso!',
          },
        },
      ],
    },
  ],
}

export const SAMPLE_VOCABULARY: KPattoVocabulary[] = [
  {
    id: 'kp-v-001',
    korean: '카페라떼',
    translations: {
      en: 'Café latte',
      ja: 'カフェラテ',
      es: 'Café con leche',
    },
    category: '음료',
    level: 'beginner',
  },
  {
    id: 'kp-v-002',
    korean: '카페',
    translations: {
      en: 'Café',
      ja: 'カフェ',
      es: 'Cafetería',
    },
    category: '장소',
    level: 'beginner',
  },
  {
    id: 'kp-v-003',
    korean: '맛있어요',
    translations: {
      en: 'It\'s delicious',
      ja: 'おいしい',
      es: 'Está delicioso',
    },
    category: '형용사',
    level: 'beginner',
  },
]

export const SAMPLE_EPISODE_2: KPattoStory = {
  id: 'kp-ep-002',
  episode: 2,
  title: '지하철에서',
  level: 'beginner',
  theme: '일상 / 지하철',
  tags: ['kp-005', 'kp-003', 'kp-006'],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep2.png',
  panels: [],
}

export const SAMPLE_EPISODE_3: KPattoStory = {
  id: 'kp-ep-003',
  episode: 3,
  title: '편의점에서',
  level: 'beginner',
  theme: '일상 / 편의점',
  tags: [],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep3.png',
  panels: [],
}

export const ALL_STORIES: KPattoStory[] = [SAMPLE_EPISODE_1, SAMPLE_EPISODE_2, SAMPLE_EPISODE_3]
