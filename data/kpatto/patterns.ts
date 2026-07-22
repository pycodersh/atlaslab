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
    korean: '~ 주세요',
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
    korean: '~ 뭐예요?',
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
  {
    id: 'kp-005',
    korean: '~이에요 / 예요',
    structure: '[명사] + 이에요 / 예요',
    translations: {
      en: 'It is ~',
      ja: '〜です',
      es: 'Es ~',
    },
    examples: [
      {
        korean: '이게 김치예요.',
        translations: {
          en: 'This is kimchi.',
          ja: 'これはキムチです。',
          es: 'Esto es kimchi.',
        },
      },
      {
        korean: '저는 학생이에요.',
        translations: {
          en: "I'm a student.",
          ja: '私は学生です。',
          es: 'Soy estudiante.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-006',
    korean: '~있어요 / 없어요',
    structure: '[명사] + 있어요 / 없어요',
    translations: {
      en: 'There is / There is no ~',
      ja: '〜があります / 〜がありません',
      es: 'Hay / No hay ~',
    },
    examples: [
      {
        korean: '자리 있어요?',
        translations: {
          en: 'Is there a seat?',
          ja: '席はありますか？',
          es: '¿Hay un asiento disponible?',
        },
      },
      {
        korean: '와이파이 있어요?',
        translations: {
          en: 'Is there Wi-Fi?',
          ja: 'Wi-Fiはありますか？',
          es: '¿Hay Wi-Fi?',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-007',
    korean: '~얼마예요?',
    structure: '[명사] + 얼마예요?',
    translations: {
      en: 'How much is ~?',
      ja: '〜はいくらですか？',
      es: '¿Cuánto cuesta ~?',
    },
    examples: [
      {
        korean: '이거 얼마예요?',
        translations: {
          en: 'How much is this?',
          ja: 'これはいくらですか？',
          es: '¿Cuánto cuesta esto?',
        },
      },
    ],
    level: 'beginner',
  },
]
