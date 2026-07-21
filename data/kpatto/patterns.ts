import type { KPattoPattern } from './types'

export const KPATTO_PATTERNS: KPattoPattern[] = [
  {
    id: 'kp-001',
    korean: '~하고 싶어요',
    structure: '동사 어간 + 고 싶어요',
    translations: {
      en: 'I want to ~',
      ja: '〜したいです',
      'zh-cn': '想要〜',
      'zh-tw': '想要〜',
      es: 'Quiero ~',
    },
    examples: [
      {
        korean: '커피 마시고 싶어요.',
        translations: {
          en: 'I want to drink coffee.',
          ja: 'コーヒーを飲みたいです。',
          'zh-cn': '我想喝咖啡。',
          es: 'Quiero tomar café.',
        },
        audio_url: undefined,
      },
      {
        korean: '집에 가고 싶어요.',
        translations: {
          en: 'I want to go home.',
          ja: '家に帰りたいです。',
          'zh-cn': '我想回家。',
          es: 'Quiero ir a casa.',
        },
        audio_url: undefined,
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
      'zh-cn': '试试〜',
      'zh-tw': '試試〜',
      es: 'Intenta ~',
    },
    examples: [
      {
        korean: '먹어 보세요.',
        translations: {
          en: 'Try eating it.',
          ja: '食べてみてください。',
          'zh-cn': '试着吃吃看。',
          es: 'Pruébalo.',
        },
        audio_url: undefined,
      },
    ],
    level: 'beginner',
  },
]
