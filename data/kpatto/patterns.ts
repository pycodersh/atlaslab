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
  // ── EP02 패턴 ─────────────────────────────────────────────────────────────
  {
    id: 'kp-ep-002-p001',
    korean: '~어디예요?',
    structure: '[장소] + 어디예요?',
    translations: { en: 'Where is ~?' },
    examples: [
      { korean: '화장실 어디예요?', translations: { en: 'Where is the bathroom?' } },
      { korean: '출구 어디예요?',   translations: { en: 'Where is the exit?' } },
      { korean: '홍대 어디예요?',   translations: { en: 'Where is Hongdae?' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-002-p002',
    korean: '~에 가고 싶어요',
    structure: '[장소] + 에 가고 싶어요',
    translations: { en: 'I want to go to ~' },
    examples: [
      { korean: '홍대에 가고 싶어요.',  translations: { en: 'I want to go to Hongdae.' } },
      { korean: '명동에 가고 싶어요.',  translations: { en: 'I want to go to Myeongdong.' } },
      { korean: '한강에 가고 싶어요.',  translations: { en: 'I want to go to Hangang.' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-002-p003',
    korean: '~어떻게 가요?',
    structure: '[장소] + 어떻게 가요?',
    translations: { en: 'How do I get to ~?' },
    examples: [
      { korean: '홍대 어떻게 가요?', translations: { en: 'How do I get to Hongdae?' } },
      { korean: '여기 어떻게 가요?', translations: { en: 'How do I get here?' } },
      { korean: '공항 어떻게 가요?', translations: { en: 'How do I get to the airport?' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-002-p004',
    korean: '[수량] ~ 주세요',
    structure: '[수량] + [명사] + 주세요',
    translations: { en: '[quantity] ~, please' },
    examples: [
      { korean: '표 두 장 주세요.',  translations: { en: 'Two tickets, please.' } },
      { korean: '물 한 병 주세요.',  translations: { en: 'One bottle of water, please.' } },
      { korean: '봉투 하나 주세요.', translations: { en: 'One bag, please.' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-002-p005',
    korean: '~좋아요',
    structure: '[명사] + 좋아요',
    translations: { en: 'I like ~ / ~ is good' },
    examples: [
      { korean: '서울 좋아요.',   translations: { en: 'I like Seoul.' } },
      { korean: '지하철 좋아요.', translations: { en: 'I like the subway.' } },
      { korean: '한국 좋아요.',   translations: { en: 'I like Korea.' } },
    ],
    level: 'beginner',
  },
  // ── EP03 패턴 ─────────────────────────────────────────────────────────────
  {
    id: 'kp-ep-003-p001',
    korean: '~하고 싶어요',
    structure: '[동사 어간] + 고 싶어요',
    translations: { en: 'I want to ~' },
    examples: [
      { korean: '먹고 싶어요.',    translations: { en: 'I want to eat.' } },
      { korean: '해보고 싶어요.',  translations: { en: 'I want to try it.' } },
      { korean: '가고 싶어요.',    translations: { en: 'I want to go.' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-003-p002',
    korean: '~할 수 있어요 / 없어요',
    structure: '[동사 어간] + ㄹ/을 수 있어요/없어요',
    translations: { en: 'I can / can\'t ~' },
    examples: [
      { korean: '매운 거 먹을 수 있어요?', translations: { en: 'Can you eat spicy food?' } },
      { korean: '젓가락 쓸 수 있어요.',    translations: { en: 'I can use chopsticks.' } },
      { korean: '한국어 할 수 있어요.',     translations: { en: 'I can speak Korean.' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-003-p003',
    korean: '~이/가 아니에요',
    structure: '[명사] + 이/가 아니에요',
    translations: { en: 'It\'s not ~' },
    examples: [
      { korean: '이거 제 거 아니에요.',  translations: { en: 'This isn\'t mine.' } },
      { korean: '저 학생 아니에요.',      translations: { en: 'I\'m not a student.' } },
      { korean: '이게 떡볶이 아니에요.', translations: { en: 'This isn\'t tteokbokki.' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-003-p004',
    korean: '~못해요',
    structure: '못 + [동사]',
    translations: { en: 'I can\'t ~' },
    examples: [
      { korean: '매운 거 못 먹어요.', translations: { en: 'I can\'t eat spicy food.' } },
      { korean: '운전 못 해요.',      translations: { en: 'I can\'t drive.' } },
      { korean: '수영 못 해요.',      translations: { en: 'I can\'t swim.' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-003-p005',
    korean: '~맞아요?',
    structure: '[명사/장소] + 맞아요?',
    translations: { en: 'Is this ~ right?' },
    examples: [
      { korean: '이게 떡볶이 맞아요?', translations: { en: 'Is this tteokbokki?' } },
      { korean: '여기 홍대 맞아요?',   translations: { en: 'Is this Hongdae?' } },
      { korean: '이거 맞아요?',        translations: { en: 'Is this right?' } },
    ],
    level: 'beginner',
  },

  // ── EP04 ──────────────────────────────────────────────────────────────
  {
    id: 'kp-ep-004-p001',
    korean: '~해도 돼요?',
    structure: '[동사 어간] + 아/어도 돼요?',
    translations: { en: 'Is it okay to ~?' },
    examples: [
      { korean: '여기서 먹어도 돼요?',     translations: { en: 'Is it okay to eat here?' } },
      { korean: '사진 찍어도 돼요?',       translations: { en: 'May I take a photo?' } },
      { korean: '카드로 해도 돼요?',       translations: { en: 'Is it okay to pay by card?' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-004-p002',
    korean: '~하면 안 돼요',
    structure: '[동사 어간] + 으면/면 안 돼요',
    translations: { en: 'You cannot ~' },
    examples: [
      { korean: '여기서 담배 피우면 안 돼요.', translations: { en: 'You cannot smoke here.' } },
      { korean: '사진 찍으면 안 돼요.',        translations: { en: 'You cannot take photos.' } },
      { korean: '여기서 뛰면 안 돼요.',        translations: { en: 'You cannot run here.' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-004-p003',
    korean: '~는/은 어때요?',
    structure: '[명사] + 는/은 어때요?',
    translations: { en: 'How about ~?' },
    examples: [
      { korean: '이거 어때요?',                  translations: { en: 'How about this?' } },
      { korean: '삼각김밥이랑 라면은 어때요?',   translations: { en: 'How about triangle gimbap and ramen?' } },
      { korean: '이 카페 어때요?',               translations: { en: 'How about this café?' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-004-p004',
    korean: '~로 할게요',
    structure: '[명사] + 로/으로 할게요',
    translations: { en: "I'll go with ~" },
    examples: [
      { korean: '카드로 할게요.',   translations: { en: "I'll pay by card." } },
      { korean: '그걸로 할게요.',   translations: { en: "I'll go with that." } },
      { korean: '현금으로 할게요.', translations: { en: "I'll pay in cash." } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-004-p005',
    korean: '~얼마나 걸려요?',
    structure: '[대상] + 얼마나 걸려요?',
    translations: { en: 'How long does ~ take?' },
    examples: [
      { korean: '배달 얼마나 걸려요?',    translations: { en: 'How long does delivery take?' } },
      { korean: '홍대까지 얼마나 걸려요?', translations: { en: 'How long does it take to get to Hongdae?' } },
      { korean: '지하철로 얼마나 걸려요?', translations: { en: 'How long does it take by subway?' } },
    ],
    level: 'beginner',
  },

  // ── EP05 ──────────────────────────────────────────────────────────────
  {
    id: 'kp-ep-005-p001',
    korean: '~주실 수 있어요?',
    structure: '[동사 어간] + 주실 수 있어요?',
    translations: { en: 'Could you ~, please?' },
    examples: [
      { korean: '천천히 말해주실 수 있어요?',   translations: { en: 'Could you speak slowly?' } },
      { korean: '물 더 주실 수 있어요?',         translations: { en: 'Could you bring more water?' } },
      { korean: '다시 한번 말해주실 수 있어요?', translations: { en: 'Could you say that again?' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-005-p002',
    korean: '~추천해 주세요',
    structure: '[명사] + 추천해 주세요',
    translations: { en: 'Please recommend ~' },
    examples: [
      { korean: '메뉴 추천해 주세요.',         translations: { en: 'Please recommend a menu item.' } },
      { korean: '맛있는 거 추천해 주세요.',     translations: { en: 'Please recommend something delicious.' } },
      { korean: '이 근처 카페 추천해 주세요.',  translations: { en: 'Please recommend a café nearby.' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-005-p003',
    korean: '~해 본 적 있어요?',
    structure: '[동사 어간] + 아/어 본 적 있어요?',
    translations: { en: 'Have you ever ~?' },
    examples: [
      { korean: '삼겹살 먹어 본 적 있어요?', translations: { en: 'Have you ever had samgyeopsal?' } },
      { korean: '한국 와 본 적 있어요?',      translations: { en: 'Have you ever been to Korea?' } },
      { korean: '노래방 가 본 적 있어요?',    translations: { en: 'Have you ever been to a noraebang?' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-005-p004',
    korean: '~어디서 살 수 있어요?',
    structure: '[명사] + 어디서 살 수 있어요?',
    translations: { en: 'Where can I buy ~?' },
    examples: [
      { korean: '이거 어디서 살 수 있어요?',  translations: { en: 'Where can I buy this?' } },
      { korean: '김치 어디서 살 수 있어요?',  translations: { en: 'Where can I buy kimchi?' } },
      { korean: '이 책 어디서 살 수 있어요?', translations: { en: 'Where can I buy this book?' } },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-005-p005',
    korean: '~맛있어요 / 맛없어요',
    structure: '[음식] + 맛있어요 / 맛없어요',
    translations: { en: "It's delicious / not good" },
    examples: [
      { korean: '진짜 맛있어요!',     translations: { en: "It's really delicious!" } },
      { korean: '생각보다 맛없어요.', translations: { en: "It's not as good as I expected." } },
      { korean: '너무 맛있어요!',     translations: { en: "It's so delicious!" } },
    ],
    level: 'beginner',
  },
]