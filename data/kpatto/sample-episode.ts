import type { KPattoStory, KPattoVocabulary } from './types'

// Episode 1 — 샘플. 실제 웹툰 이미지 없이 전체 흐름 확인용.
export const SAMPLE_EPISODE_1: KPattoStory = {
  id: 'kp-ep-001',
  episode: 1,
  title: '카페에서',
  level: 'beginner',
  theme: '일상 / 카페',
  tags: ['kp-001', 'kp-002'],
  vocabulary_ids: ['kp-v-001', 'kp-v-002', 'kp-v-003'],
  thumbnail_url: undefined,
  panels: [
    {
      id: 'panel-1',
      image_url: undefined, // placeholder — actual webtoon image goes here
      dialogues: [
        {
          id: 'd-1-1',
          character: '지민',
          korean: '안녕하세요! 뭐 드시겠어요?',
          translations: {
            en: 'Hello! What would you like?',
            ja: 'いらっしゃいませ！何にしますか？',
            'zh-cn': '你好！您想要什么？',
            es: '¡Hola! ¿Qué desea?',
          },
          audio_url: undefined,
        },
      ],
    },
    {
      id: 'panel-2',
      image_url: undefined,
      dialogues: [
        {
          id: 'd-2-1',
          character: '손님',
          korean: '아메리카노 마시고 싶어요.',
          translations: {
            en: 'I want to drink an Americano.',
            ja: 'アメリカーノが飲みたいです。',
            'zh-cn': '我想喝美式咖啡。',
            es: 'Quiero tomar un americano.',
          },
          audio_url: undefined,
          pattern_id: 'kp-001',
        },
      ],
      // Pattern card shown after this panel
      pattern_card: { pattern_id: 'kp-001' },
    },
    {
      id: 'panel-3',
      image_url: undefined,
      dialogues: [
        {
          id: 'd-3-1',
          character: '지민',
          korean: '케이크도 한번 먹어 보세요. 오늘 새로 나왔어요!',
          translations: {
            en: 'Try the cake too. It just came out today!',
            ja: 'ケーキも食べてみてください。今日の新作ですよ！',
            'zh-cn': '也试试蛋糕吧，今天刚出炉的！',
            es: 'También prueba el pastel. ¡Salió hoy!',
          },
          audio_url: undefined,
          pattern_id: 'kp-002',
        },
      ],
    },
    {
      id: 'panel-4',
      image_url: undefined,
      dialogues: [
        {
          id: 'd-4-1',
          character: '손님',
          korean: '정말요? 그럼 같이 주세요!',
          translations: {
            en: 'Really? Then please give me both!',
            ja: '本当ですか？じゃあ一緒にください！',
            'zh-cn': '真的吗？那一起来一个吧！',
            es: '¿De verdad? ¡Entonces deme los dos!',
          },
          audio_url: undefined,
        },
      ],
      pattern_card: { pattern_id: 'kp-002' },
    },
  ],
}

export const SAMPLE_VOCABULARY: KPattoVocabulary[] = [
  {
    id: 'kp-v-001',
    korean: '아메리카노',
    translations: {
      en: 'Americano (coffee)',
      ja: 'アメリカーノ',
      'zh-cn': '美式咖啡',
      es: 'Americano',
    },
    category: '음료',
    level: 'beginner',
  },
  {
    id: 'kp-v-002',
    korean: '케이크',
    translations: {
      en: 'Cake',
      ja: 'ケーキ',
      'zh-cn': '蛋糕',
      es: 'Pastel',
    },
    category: '음식',
    level: 'beginner',
  },
  {
    id: 'kp-v-003',
    korean: '카페',
    translations: {
      en: 'Café',
      ja: 'カフェ',
      'zh-cn': '咖啡厅',
      es: 'Cafetería',
    },
    category: '장소',
    level: 'beginner',
  },
]

export const ALL_STORIES: KPattoStory[] = [SAMPLE_EPISODE_1]
