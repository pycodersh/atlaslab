import type { KPattoPattern } from './types'

export const KPATTO_PATTERNS: KPattoPattern[] = [
  {
    id: 'kp-001',
    korean: '~하고 싶어요',
    structure: '동사 어간 + 고 싶어요',
    translations: {
      en: 'I want to ~',
      ja: '〜したいです',
      es: 'Quiero ~',
    },
    examples: [
      {
        korean: '커피 마시고 싶어요.',
        translations: {
          en: 'I want to drink coffee.',
          ja: 'コーヒーを飲みたいです。',
          es: 'Quiero tomar café.',
        },
      },
      {
        korean: '집에 가고 싶어요.',
        translations: {
          en: 'I want to go home.',
          ja: '家に帰りたいです。',
          es: 'Quiero ir a casa.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-002',
    korean: '~어/아 보세요',
    structure: '동사 어간 + 아/어 보세요',
    translations: {
      en: 'Try ~ing',
      ja: '〜してみてください',
      es: 'Intenta ~',
    },
    examples: [
      {
        korean: '먹어 보세요.',
        translations: {
          en: 'Try eating it.',
          ja: '食べてみてください。',
          es: 'Pruébalo.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-003',
    korean: 'N 주세요',
    structure: '명사 + 주세요',
    translations: {
      en: 'Please give me N',
      ja: 'Nをください',
      es: 'Por favor, deme N',
    },
    examples: [
      {
        korean: '카페라떼 주세요.',
        translations: {
          en: 'Café latte, please.',
          ja: 'カフェラテをください。',
          es: 'Un café con leche, por favor.',
        },
      },
      {
        korean: '물 주세요.',
        translations: {
          en: 'Water, please.',
          ja: 'お水をください。',
          es: 'Agua, por favor.',
        },
      },
      {
        korean: '메뉴 주세요.',
        translations: {
          en: 'The menu, please.',
          ja: 'メニューをください。',
          es: 'El menú, por favor.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-004',
    korean: '이거 뭐예요?',
    structure: '이거 / 저거 + 뭐예요?',
    translations: {
      en: 'What is this?',
      ja: 'これは何ですか？',
      es: '¿Qué es esto?',
    },
    examples: [
      {
        korean: '이거 뭐예요?',
        translations: {
          en: 'What is this?',
          ja: 'これは何ですか？',
          es: '¿Qué es esto?',
        },
      },
      {
        korean: '저거 뭐예요?',
        translations: {
          en: 'What is that?',
          ja: 'あれは何ですか？',
          es: '¿Qué es eso?',
        },
      },
      {
        korean: '이름이 뭐예요?',
        translations: {
          en: "What's your name?",
          ja: 'お名前は何ですか？',
          es: '¿Cuál es tu nombre?',
        },
      },
    ],
    level: 'beginner',
  },
]
