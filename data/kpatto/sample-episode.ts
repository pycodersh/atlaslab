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
  thumbnail_url: '/kpatto/banners/ep1.png',
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
  tags: ['kp-ep-002-p001', 'kp-ep-002-p002', 'kp-ep-002-p003', 'kp-ep-002-p004', 'kp-ep-002-p005'],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep2.png',
  panels: [],
}

export const SAMPLE_EPISODE_3: KPattoStory = {
  id: 'kp-ep-003',
  episode: 3,
  title: '떡볶이 가게에서',
  level: 'beginner',
  theme: '일상 / 분식',
  tags: ['kp-ep-003-p001', 'kp-ep-003-p002', 'kp-ep-003-p003', 'kp-ep-003-p004', 'kp-ep-003-p005'],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep3.png',
  panels: [],
}

export const SAMPLE_EPISODE_4: KPattoStory = {
  id: 'kp-ep-004',
  episode: 4,
  title: '편의점에서',
  level: 'beginner',
  theme: '일상 / 편의점',
  tags: ['kp-ep-004-p001', 'kp-ep-004-p002', 'kp-ep-004-p003', 'kp-ep-004-p004', 'kp-ep-004-p005'],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep4.png',
  panels: [],
}

export const SAMPLE_EPISODE_5: KPattoStory = {
  id: 'kp-ep-005',
  episode: 5,
  title: '식당에서',
  level: 'beginner',
  theme: '일상 / 한식당',
  tags: ['kp-ep-005-p001', 'kp-ep-005-p002', 'kp-ep-005-p003', 'kp-ep-005-p004', 'kp-ep-005-p005'],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep5.png',
  panels: [],
}

export const SAMPLE_EPISODE_6: KPattoStory = {
  id: 'kp-ep-006',
  episode: 6,
  title: '노래방에서',
  level: 'beginner',
  theme: '일상 / 노래방',
  tags: ['kp-ep-006-p001', 'kp-ep-006-p002', 'kp-ep-006-p003', 'kp-ep-006-p004', 'kp-ep-006-p005'],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep6.png',
  panels: [],
}

export const SAMPLE_EPISODE_7: KPattoStory = {
  id: 'kp-ep-007',
  episode: 7,
  title: '시장에서',
  level: 'beginner',
  theme: '일상 / 전통시장',
  tags: ['kp-ep-007-p001', 'kp-ep-007-p002', 'kp-ep-007-p003', 'kp-ep-007-p004', 'kp-ep-007-p005'],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep7.png',
  panels: [],
}

export const SAMPLE_EPISODE_8: KPattoStory = {
  id: 'kp-ep-008',
  episode: 8,
  title: '뷰티숍에서',
  level: 'beginner',
  theme: '일상 / K-뷰티',
  tags: ['kp-ep-008-p001', 'kp-ep-008-p002', 'kp-ep-008-p003', 'kp-ep-008-p004', 'kp-ep-008-p005'],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep8.png',
  panels: [],
}

export const SAMPLE_EPISODE_9: KPattoStory = {
  id: 'kp-ep-009',
  episode: 9,
  title: '한강에서',
  level: 'beginner',
  theme: '일상 / 한강 피크닉',
  tags: ['kp-ep-009-p001', 'kp-ep-009-p002', 'kp-ep-009-p003', 'kp-ep-009-p004', 'kp-ep-009-p005'],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep9.png',
  panels: [],
}

export const SAMPLE_EPISODE_10: KPattoStory = {
  id: 'kp-ep-010',
  episode: 10,
  title: '학교에서',
  level: 'beginner',
  theme: '일상 / 대학교',
  tags: ['kp-ep-010-p001', 'kp-ep-010-p002', 'kp-ep-010-p003', 'kp-ep-010-p004', 'kp-ep-010-p005'],
  vocabulary_ids: [],
  thumbnail_url: '/kpatto/banners/ep10.png',
  panels: [],
}

const EP11: KPattoStory = { id: 'kp-ep-011', episode: 11, title: '지하철에서',      level: 'beginner', theme: '교통 / 지하철',    tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-011/ep11_c1.png', panels: [] }
const EP12: KPattoStory = { id: 'kp-ep-012', episode: 12, title: '식당에서 (심화)', level: 'beginner', theme: '음식 / 한식당',    tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-012/ep12_c1.png', panels: [] }
const EP13: KPattoStory = { id: 'kp-ep-013', episode: 13, title: '약속 잡기',       level: 'beginner', theme: '약속 / 대화',      tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-013/ep13_c1.png', panels: [] }
const EP14: KPattoStory = { id: 'kp-ep-014', episode: 14, title: '길 잃은 에마',    level: 'beginner', theme: '길 안내 / 인사동',  tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-014/ep14_c1.png', panels: [] }
const EP15: KPattoStory = { id: 'kp-ep-015', episode: 15, title: '드라마 추천',     level: 'beginner', theme: '드라마 / 추천',    tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-015/ep15_c1.png', panels: [] }
const EP16: KPattoStory = { id: 'kp-ep-016', episode: 16, title: '날씨 이야기',     level: 'beginner', theme: '날씨 / 계절',      tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-016/ep16_c1.png', panels: [] }
const EP17: KPattoStory = { id: 'kp-ep-017', episode: 17, title: '약국에서',        level: 'beginner', theme: '건강 / 약국',      tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-017/ep17_c1.png', panels: [] }
const EP18: KPattoStory = { id: 'kp-ep-018', episode: 18, title: '취미 이야기',     level: 'beginner', theme: '취미 / 관심사',    tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-018/ep18_c1.png', panels: [] }
const EP19: KPattoStory = { id: 'kp-ep-019', episode: 19, title: '경복궁 여행',     level: 'beginner', theme: '관광 / 문화',      tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-019/ep19_c1.png', panels: [] }
const EP20: KPattoStory = { id: 'kp-ep-020', episode: 20, title: '오랜만에 만남',   level: 'beginner', theme: '만남 / 안부',      tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-020/ep20_c1.png', panels: [] }
const EP21: KPattoStory = { id: 'kp-ep-021', episode: 21, title: '어제 뭐 했어?',  level: 'beginner', theme: '과거 / 일상 대화',  tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-021/ep21_c1.png', panels: [] }
const EP22: KPattoStory = { id: 'kp-ep-022', episode: 22, title: '추측하기',        level: 'beginner', theme: '추측 / 맛집',      tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-022/ep22_c1.png', panels: [] }
const EP23: KPattoStory = { id: 'kp-ep-023', episode: 23, title: '해야 해요',       level: 'beginner', theme: '의무 / 도서관',    tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-023/ep23_c1.png', panels: [] }
const EP24: KPattoStory = { id: 'kp-ep-024', episode: 24, title: '의견 나누기',     level: 'beginner', theme: '의견 / 음식 토론',  tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-024/ep24_c1.png', panels: [] }
const EP25: KPattoStory = { id: 'kp-ep-025', episode: 25, title: '경험 이야기',     level: 'beginner', theme: '경험 / 여행',      tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-025/ep25_c1.png', panels: [] }
const EP26: KPattoStory = { id: 'kp-ep-026', episode: 26, title: 'K-드라마 이야기', level: 'beginner', theme: '드라마 / 관심사',  tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-026/ep26_c1.png', panels: [] }
const EP27: KPattoStory = { id: 'kp-ep-027', episode: 27, title: 'K-POP',          level: 'beginner', theme: 'K-POP / 음악',    tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-027/ep27_c1.png', panels: [] }
const EP28: KPattoStory = { id: 'kp-ep-028', episode: 28, title: 'K-뷰티 쇼핑',    level: 'beginner', theme: '쇼핑 / K-뷰티',   tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-028/ep28_c1.png', panels: [] }
const EP29: KPattoStory = { id: 'kp-ep-029', episode: 29, title: '건강과 운동',     level: 'beginner', theme: '건강 / 운동',      tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-029/ep29_c1.png', panels: [] }
const EP30: KPattoStory = { id: 'kp-ep-030', episode: 30, title: '어디 살아요?',    level: 'beginner', theme: '거주 / 동네 소개',  tags: [], vocabulary_ids: [], thumbnail_url: '/kpatto/ep-030/ep30_c1.png', panels: [] }

export const ALL_STORIES: KPattoStory[] = [
  SAMPLE_EPISODE_1, SAMPLE_EPISODE_2, SAMPLE_EPISODE_3, SAMPLE_EPISODE_4, SAMPLE_EPISODE_5,
  SAMPLE_EPISODE_6, SAMPLE_EPISODE_7, SAMPLE_EPISODE_8, SAMPLE_EPISODE_9, SAMPLE_EPISODE_10,
  EP11, EP12, EP13, EP14, EP15, EP16, EP17, EP18, EP19, EP20,
  EP21, EP22, EP23, EP24, EP25, EP26, EP27, EP28, EP29, EP30,
]
