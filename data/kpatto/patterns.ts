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

  // ── EP06 (노래방) ─────────────────────────────────────────────────────
  {
    id: 'kp-ep-006-p001',
    korean: '~좋아해요 / ~진짜 좋아해요',
    structure: '[명사] + 좋아해요 / 진짜 좋아해요',
    translations: {
      en: 'I like ~ / I really love ~',
      ja: '〜好きです / 〜本当に好きです',
      es: 'Me gusta ~ / Me encanta ~',
    },
    examples: [
      {
        korean: '케이팝 진짜 좋아해요!',
        translations: {
          en: 'I really love K-pop!',
          ja: 'ケーポップが本当に好きです！',
          es: '¡Me encanta el K-pop de verdad!',
        },
      },
      {
        korean: '한국 음식 좋아해요.',
        translations: {
          en: 'I like Korean food.',
          ja: '韓国料理が好きです。',
          es: 'Me gusta la comida coreana.',
        },
      },
      {
        korean: '이 가수 진짜 좋아해요!',
        translations: {
          en: 'I really love this singer!',
          ja: 'この歌手が本当に好きです！',
          es: '¡Me encanta este cantante de verdad!',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-006-p002',
    korean: '진짜요? / 대박!',
    structure: '진짜요? (Really?) / 대박! (Amazing!)',
    translations: {
      en: 'Really? / No way! / Amazing!',
      ja: '本当ですか？/ すごい！',
      es: '¿De verdad? / ¡Increíble!',
    },
    examples: [
      {
        korean: '에마 잘한다!! 진짜요?',
        translations: {
          en: "Emma is so good!! Really?",
          ja: 'エマ、上手だ！！本当ですか？',
          es: '¡Emma lo hace muy bien!! ¿De verdad?',
        },
      },
      {
        korean: '공짜예요? 대박!',
        translations: {
          en: "It's free? No way!",
          ja: '無料ですか？すごい！',
          es: '¿Es gratis? ¡Increíble!',
        },
      },
      {
        korean: '한국어 잘해요? 진짜요?',
        translations: {
          en: 'You speak Korean well? Really?',
          ja: '韓国語が上手ですか？本当ですか？',
          es: '¿Hablas bien coreano? ¿De verdad?',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-006-p003',
    korean: '너무 ~해요',
    structure: '너무 + [형용사/동사]',
    translations: {
      en: 'So ~ / Too ~',
      ja: 'とても〜 / すごく〜',
      es: 'Muy ~ / Demasiado ~',
    },
    examples: [
      {
        korean: '이 노래 너무 좋아요!!',
        translations: {
          en: 'I love this song so much!!',
          ja: 'この歌がとても好きです！！',
          es: '¡¡Me encanta esta canción!!',
        },
      },
      {
        korean: '너무 재미있어요!',
        translations: {
          en: "It's so fun!",
          ja: 'とても楽しいです！',
          es: '¡Es muy divertido!',
        },
      },
      {
        korean: '너무 피곤해요.',
        translations: {
          en: "I'm so tired.",
          ja: 'とても疲れています。',
          es: 'Estoy muy cansado/a.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-006-p004',
    korean: '~잘해요 / 못해요',
    structure: '[동사/명사] + 잘해요 / 못해요',
    translations: {
      en: "~ well / can't ~ well",
      ja: '〜が上手です / 〜が下手です',
      es: 'Soy bueno/a en ~ / No soy bueno/a en ~',
    },
    examples: [
      {
        korean: '노래 잘해요?',
        translations: {
          en: 'Are you good at singing?',
          ja: '歌が上手ですか？',
          es: '¿Cantas bien?',
        },
      },
      {
        korean: '춤 잘 못해요.',
        translations: {
          en: "I'm not good at dancing.",
          ja: 'ダンスが得意じゃないです。',
          es: 'No soy bueno/a bailando.',
        },
      },
      {
        korean: '한국어 잘해요!',
        translations: {
          en: 'Your Korean is great!',
          ja: '韓国語が上手ですね！',
          es: '¡Hablas muy bien coreano!',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-006-p005',
    korean: '또 오고 싶어요',
    structure: '또 + [장소/활동] + 오고 싶어요',
    translations: {
      en: 'I want to come again',
      ja: 'またここに来たいです',
      es: 'Quiero volver',
    },
    examples: [
      {
        korean: '노래방 또 오고 싶어요!',
        translations: {
          en: 'I want to come to noraebang again!',
          ja: 'またカラオケに来たいです！',
          es: '¡Quiero volver al noraebang!',
        },
      },
      {
        korean: '이 식당 또 오고 싶어요.',
        translations: {
          en: 'I want to come to this restaurant again.',
          ja: 'このレストランにまた来たいです。',
          es: 'Quiero volver a este restaurante.',
        },
      },
      {
        korean: '한국 또 오고 싶어요!',
        translations: {
          en: 'I want to come to Korea again!',
          ja: 'また韓国に来たいです！',
          es: '¡Quiero volver a Corea!',
        },
      },
    ],
    level: 'beginner',
  },

  // ── EP07 (전통시장) ───────────────────────────────────────────────────
  {
    id: 'kp-ep-007-p001',
    korean: '좀 깎아 주세요',
    structure: '좀 깎아 주세요 / 조금만 깎아 주세요',
    translations: {
      en: 'Please give me a discount',
      ja: '少し安くしてください',
      es: 'Por favor, hágame un descuento',
    },
    examples: [
      {
        korean: '저기요... 좀 깎아 주세요!',
        translations: {
          en: 'Excuse me... please give me a discount!',
          ja: 'すみません…少し安くしてください！',
          es: 'Disculpe... ¡por favor hágame un descuento!',
        },
      },
      {
        korean: '조금만 깎아 주세요.',
        translations: {
          en: 'Just a small discount, please.',
          ja: 'ちょっとだけ安くしてください。',
          es: 'Solo un pequeño descuento, por favor.',
        },
      },
      {
        korean: '두 개 사면 깎아 주세요.',
        translations: {
          en: 'Please give me a discount if I buy two.',
          ja: '二つ買ったら安くしてください。',
          es: 'Por favor hágame descuento si compro dos.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-007-p002',
    korean: '다 해서 얼마예요?',
    structure: '다 해서 얼마예요?',
    translations: {
      en: 'How much is it all together?',
      ja: '全部でいくらですか？',
      es: '¿Cuánto es todo junto?',
    },
    examples: [
      {
        korean: '다 해서 얼마예요?',
        translations: {
          en: 'How much is it all together?',
          ja: '全部でいくらですか？',
          es: '¿Cuánto es todo junto?',
        },
      },
      {
        korean: '이거랑 저거 다 해서 얼마예요?',
        translations: {
          en: 'How much is this and that together?',
          ja: 'これとあれで全部でいくらですか？',
          es: '¿Cuánto es esto y aquello juntos?',
        },
      },
      {
        korean: '세 개 다 해서 얼마예요?',
        translations: {
          en: 'How much for all three?',
          ja: '三つ全部でいくらですか？',
          es: '¿Cuánto por los tres?',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-007-p003',
    korean: '조금만 더 주세요',
    structure: '[명사] + 조금만 더 주세요',
    translations: {
      en: 'A little more, please',
      ja: 'もう少しください',
      es: 'Un poco más, por favor',
    },
    examples: [
      {
        korean: '감사합니다! 맛있어요! 조금만 더 주세요!',
        translations: {
          en: 'Thank you! It\'s delicious! A little more, please!',
          ja: 'ありがとうございます！美味しい！もう少しください！',
          es: '¡Gracias! ¡Está delicioso! ¡Un poco más, por favor!',
        },
      },
      {
        korean: '이거 조금만 더 주세요.',
        translations: {
          en: 'Just a little more of this, please.',
          ja: 'これをもう少しください。',
          es: 'Un poco más de esto, por favor.',
        },
      },
      {
        korean: '소스 조금만 더 주세요.',
        translations: {
          en: 'A little more sauce, please.',
          ja: 'ソースをもう少しください。',
          es: 'Un poco más de salsa, por favor.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-007-p004',
    korean: '맛봐요!',
    structure: '맛봐요! / 맛봐, 맛봐!',
    translations: {
      en: 'Try it! / Have a taste!',
      ja: '味見してみて！',
      es: '¡Pruébalo! / ¡Prueba, prueba!',
    },
    examples: [
      {
        korean: '맛봐요, 맛봐!',
        translations: {
          en: 'Try it, try it!',
          ja: '味見して、味見して！',
          es: '¡Prueba, prueba!',
        },
      },
      {
        korean: '이거 맛봐요! 진짜 맛있어요.',
        translations: {
          en: 'Try this! It\'s really delicious.',
          ja: 'これ、味見してみて！本当においしいよ。',
          es: '¡Prueba esto! Está realmente delicioso.',
        },
      },
      {
        korean: '한번 맛봐요!',
        translations: {
          en: 'Give it a taste!',
          ja: 'ちょっと味見してみてください！',
          es: '¡Dale un bocado!',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-007-p005',
    korean: '신기해요',
    structure: '[명사] + 신기해요 / 진짜 신기해요',
    translations: {
      en: "It's so interesting / fascinating / unique",
      ja: '不思議ですね / 面白いですね',
      es: 'Es muy curioso / fascinante / único',
    },
    examples: [
      {
        korean: '이거 뭐예요? 저거도 신기해요!',
        translations: {
          en: "What's this? That's interesting too!",
          ja: 'これは何ですか？あれも不思議ですね！',
          es: '¿Qué es esto? ¡Eso también es curioso!',
        },
      },
      {
        korean: '한국 전통 시장 진짜 신기해요!',
        translations: {
          en: 'Korean traditional markets are really fascinating!',
          ja: '韓国の伝統市場、本当に不思議ですね！',
          es: '¡Los mercados tradicionales coreanos son realmente fascinantes!',
        },
      },
      {
        korean: '이 문화 너무 신기해요.',
        translations: {
          en: 'This culture is so unique.',
          ja: 'この文化、とても不思議ですね。',
          es: 'Esta cultura es muy única.',
        },
      },
    ],
    level: 'beginner',
  },

  // ── EP08 (K-뷰티) ─────────────────────────────────────────────────────
  {
    id: 'kp-ep-008-p001',
    korean: '~추천해 주세요',
    structure: '[명사/조건] + 추천해 주세요',
    translations: {
      en: 'Please recommend ~',
      ja: '〜をおすすめしてください',
      es: 'Por favor recomiéndame ~',
    },
    examples: [
      {
        korean: '제 피부 타입에 맞는 거 추천해 주세요.',
        translations: {
          en: 'Please recommend something for my skin type.',
          ja: '私の肌タイプに合うものをおすすめしてください。',
          es: 'Por favor recomiéndame algo para mi tipo de piel.',
        },
      },
      {
        korean: '초보자한테 맞는 거 추천해 주세요.',
        translations: {
          en: 'Please recommend something for a beginner.',
          ja: '初心者向けのものをおすすめしてください。',
          es: 'Por favor recomiéndame algo para principiantes.',
        },
      },
      {
        korean: '선물로 좋은 거 추천해 주세요.',
        translations: {
          en: 'Please recommend something good as a gift.',
          ja: 'プレゼントに良いものをおすすめしてください。',
          es: 'Por favor recomiéndame algo bueno como regalo.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-008-p002',
    korean: '~뭐 써요?',
    structure: '[제품 종류] + 뭐 써요?',
    translations: {
      en: 'What do you use for ~?',
      ja: '〜は何を使っていますか？',
      es: '¿Qué usas para ~?',
    },
    examples: [
      {
        korean: '선크림 뭐 써요?',
        translations: {
          en: 'What sunscreen do you use?',
          ja: '日焼け止めは何を使っていますか？',
          es: '¿Qué protector solar usas?',
        },
      },
      {
        korean: '토너 뭐 써요?',
        translations: {
          en: 'What toner do you use?',
          ja: '化粧水は何を使っていますか？',
          es: '¿Qué tónico usas?',
        },
      },
      {
        korean: '마스크팩 뭐 써요?',
        translations: {
          en: 'What sheet mask do you use?',
          ja: 'マスクパックは何を使っていますか？',
          es: '¿Qué mascarilla usas?',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-008-p003',
    korean: '~어떤 게 좋아요?',
    structure: '[상황/목적] + 어떤 게 좋아요?',
    translations: {
      en: 'Which one is good for ~?',
      ja: '〜にはどれがいいですか？',
      es: '¿Cuál es bueno para ~?',
    },
    examples: [
      {
        korean: '친구 선물로 어떤 게 좋아요?',
        translations: {
          en: 'Which one is good as a gift for a friend?',
          ja: '友達へのプレゼントにはどれがいいですか？',
          es: '¿Cuál es bueno como regalo para un amigo?',
        },
      },
      {
        korean: '건성 피부엔 어떤 게 좋아요?',
        translations: {
          en: 'Which one is good for dry skin?',
          ja: '乾燥肌にはどれがいいですか？',
          es: '¿Cuál es bueno para la piel seca?',
        },
      },
      {
        korean: '요즘 어떤 게 인기 있어요?',
        translations: {
          en: 'Which one is popular these days?',
          ja: '最近どれが人気ですか？',
          es: '¿Cuál es popular hoy en día?',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-008-p004',
    korean: '~써봤어요?',
    structure: '[제품] + 써봤어요?',
    translations: {
      en: 'Have you tried (using) ~?',
      ja: '〜を使ってみましたか？',
      es: '¿Has probado ~?',
    },
    examples: [
      {
        korean: '이거 써봤어요? 진짜 좋아요!',
        translations: {
          en: "Have you tried this? It's really good!",
          ja: 'これ、使ってみましたか？本当に良いですよ！',
          es: '¿Has probado esto? ¡Es realmente bueno!',
        },
      },
      {
        korean: '이 세럼 써봤어요?',
        translations: {
          en: 'Have you tried this serum?',
          ja: 'このセラム、使ってみましたか？',
          es: '¿Has probado este sérum?',
        },
      },
      {
        korean: '한국 화장품 써봤어요?',
        translations: {
          en: 'Have you tried Korean cosmetics?',
          ja: '韓国コスメ、使ってみましたか？',
          es: '¿Has probado los cosméticos coreanos?',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-008-p005',
    korean: '~피부에 좋아요',
    structure: '[제품/성분] + 피부에 좋아요',
    translations: {
      en: '~ is good for your skin',
      ja: '〜は肌に良いです',
      es: '~ es bueno para la piel',
    },
    examples: [
      {
        korean: 'K-뷰티 피부에 다 좋아요!',
        translations: {
          en: 'K-beauty is all good for your skin!',
          ja: 'K-コスメは全部肌に良いです！',
          es: '¡Todos los productos de K-beauty son buenos para la piel!',
        },
      },
      {
        korean: '이 크림 피부에 진짜 좋아요.',
        translations: {
          en: 'This cream is really good for your skin.',
          ja: 'このクリームは本当に肌に良いです。',
          es: 'Esta crema es realmente buena para la piel.',
        },
      },
      {
        korean: '마스크팩이 피부에 좋아요.',
        translations: {
          en: 'Sheet masks are good for your skin.',
          ja: 'マスクパックは肌に良いです。',
          es: 'Las mascarillas son buenas para la piel.',
        },
      },
    ],
    level: 'beginner',
  },

  // ── EP09 (한강) ───────────────────────────────────────────────────────
  {
    id: 'kp-ep-009-p001',
    korean: '날씨 너무 좋다',
    structure: '날씨 + 너무 좋다 (casual) / 너무 좋아요 (polite)',
    translations: {
      en: 'The weather is so great!',
      ja: '天気がとても良い！',
      es: '¡El clima está muy bien!',
    },
    examples: [
      {
        korean: '오늘 날씨 너무 좋다!',
        translations: {
          en: "Today's weather is so great!",
          ja: '今日の天気はとても良い！',
          es: '¡El clima de hoy está muy bien!',
        },
      },
      {
        korean: '날씨가 너무 좋아요. 나가고 싶어요.',
        translations: {
          en: "The weather is so nice. I want to go out.",
          ja: '天気がとても良いです。外に出たいです。',
          es: 'El clima está muy bien. Quiero salir.',
        },
      },
      {
        korean: '오늘 날씨 좋다! 한강 가자.',
        translations: {
          en: "The weather's great today! Let's go to Hangang.",
          ja: '今日いい天気だね！漢江に行こう。',
          es: '¡Hoy hace buen tiempo! Vamos al Han Gang.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-009-p002',
    korean: '배달 돼요?',
    structure: '[장소/서비스] + 배달 돼요? / 배달이 이렇게 빨라요?',
    translations: {
      en: 'Do you deliver? / Is delivery this fast?',
      ja: '配達できますか？/ こんなに早いですか？',
      es: '¿Hacen delivery? / ¿El delivery es tan rápido?',
    },
    examples: [
      {
        korean: '배달이 이렇게 빨라요?!',
        translations: {
          en: 'Delivery is this fast?!',
          ja: '配達がこんなに早いですか？！',
          es: '¿El delivery es tan rápido?!',
        },
      },
      {
        korean: '여기도 배달 돼요?',
        translations: {
          en: 'Can they deliver here too?',
          ja: 'ここにも配達できますか？',
          es: '¿También hacen delivery aquí?',
        },
      },
      {
        korean: '배달 얼마나 걸려요?',
        translations: {
          en: 'How long does delivery take?',
          ja: '配達どのくらいかかりますか？',
          es: '¿Cuánto tarda el delivery?',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-009-p003',
    korean: '생각보다 ~해요',
    structure: '생각보다 + [형용사]해요',
    translations: {
      en: '~ than I expected',
      ja: '思ったより〜です',
      es: 'Más ~ de lo que esperaba',
    },
    examples: [
      {
        korean: '생각보다 진짜 맛있어요!!',
        translations: {
          en: "It's really more delicious than I expected!!",
          ja: '思ったより本当においしいです！！',
          es: '¡¡Está mucho más delicioso de lo que esperaba!!',
        },
      },
      {
        korean: '생각보다 훨씬 빠르지?',
        translations: {
          en: "It's much faster than you expected, right?",
          ja: '思ったよりずっと早いでしょう？',
          es: '¿Es mucho más rápido de lo que esperabas, verdad?',
        },
      },
      {
        korean: '한국어 생각보다 어려워요.',
        translations: {
          en: 'Korean is harder than I expected.',
          ja: '韓国語は思ったより難しいです。',
          es: 'El coreano es más difícil de lo que esperaba.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-009-p004',
    korean: '다 같이 있어서 좋아요',
    structure: '다 같이 + [동사/상태] + 어서/아서 좋아요',
    translations: {
      en: "I love that we're all here together",
      ja: 'みんな一緒にいられて嬉しいです',
      es: 'Me alegra que todos estemos juntos',
    },
    examples: [
      {
        korean: '이런 거 너무 좋아요. 다 같이 있어서 좋아요.',
        translations: {
          en: "I love this kind of thing. I love that we're all here together.",
          ja: 'こういうのが好きです。みんな一緒にいられて嬉しいです。',
          es: 'Me encanta esto. Me alegra que todos estemos juntos.',
        },
      },
      {
        korean: '다 같이 먹어서 더 맛있어요.',
        translations: {
          en: 'It tastes even better because we\'re all eating together.',
          ja: 'みんなで食べるとさらにおいしいです。',
          es: 'Está más rico porque comemos todos juntos.',
        },
      },
      {
        korean: '다 같이 있어서 너무 행복해요.',
        translations: {
          en: "I'm so happy we're all together.",
          ja: 'みんな一緒にいられてとても幸せです。',
          es: 'Estoy muy feliz de que estemos todos juntos.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-009-p005',
    korean: '이미 ~해요',
    structure: '이미 + [형용사/동사]해요',
    translations: {
      en: 'Already ~',
      ja: 'もう〜です',
      es: 'Ya ~',
    },
    examples: [
      {
        korean: '한국에 온 지 얼마 안 됐는데 이미 너무 좋아요.',
        translations: {
          en: "I haven't been in Korea long but I already love it so much.",
          ja: '韓国に来てまだ日が浅いのに、もうとても好きです。',
          es: 'No llevo mucho tiempo en Corea pero ya me encanta.',
        },
      },
      {
        korean: '이미 다 먹었어요.',
        translations: {
          en: 'I already ate it all.',
          ja: 'もう全部食べました。',
          es: 'Ya me lo comí todo.',
        },
      },
      {
        korean: '이미 알고 있었어요.',
        translations: {
          en: 'I already knew.',
          ja: 'もう知っていました。',
          es: 'Ya lo sabía.',
        },
      },
    ],
    level: 'beginner',
  },

  // ── EP10 (첫 수업) ────────────────────────────────────────────────────
  {
    id: 'kp-ep-010-p001',
    korean: '~에서 왔어요',
    structure: '[나라/도시] + 에서 왔어요',
    translations: {
      en: "I'm from ~",
      ja: '〜から来ました',
      es: 'Soy de ~',
    },
    examples: [
      {
        korean: '미국에서 왔어요.',
        translations: {
          en: "I'm from the United States.",
          ja: 'アメリカから来ました。',
          es: 'Soy de Estados Unidos.',
        },
      },
      {
        korean: '어디에서 왔어요?',
        translations: {
          en: 'Where are you from?',
          ja: 'どこから来ましたか？',
          es: '¿De dónde eres?',
        },
      },
      {
        korean: '영국에서 왔어요.',
        translations: {
          en: "I'm from the UK.",
          ja: 'イギリスから来ました。',
          es: 'Soy del Reino Unido.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-010-p002',
    korean: '~전공이에요',
    structure: '[전공 분야] + 전공이에요',
    translations: {
      en: 'My major is ~',
      ja: '〜専攻です',
      es: 'Mi especialidad es ~',
    },
    examples: [
      {
        korean: '경영학 전공이에요.',
        translations: {
          en: 'My major is business administration.',
          ja: '経営学専攻です。',
          es: 'Mi especialidad es administración de empresas.',
        },
      },
      {
        korean: '한국어 전공이에요.',
        translations: {
          en: 'My major is Korean language.',
          ja: '韓国語専攻です。',
          es: 'Mi especialidad es coreano.',
        },
      },
      {
        korean: '전공이 뭐예요?',
        translations: {
          en: "What's your major?",
          ja: '専攻は何ですか？',
          es: '¿Cuál es tu especialidad?',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-010-p003',
    korean: '잘 부탁드려요',
    structure: '잘 부탁드려요 (formal) / 잘 부탁해요 (casual)',
    translations: {
      en: 'Please take care of me / Nice to meet you',
      ja: 'よろしくお願いします',
      es: 'Encantado/a, espero que me traten bien',
    },
    examples: [
      {
        korean: '저는 에마예요. 잘 부탁드려요!',
        translations: {
          en: "I'm Emma. Please take care of me!",
          ja: '私はエマです。よろしくお願いします！',
          es: 'Soy Emma. ¡Encantada, espero que me traten bien!',
        },
      },
      {
        korean: '앞으로 잘 부탁드려요.',
        translations: {
          en: 'I look forward to working with you.',
          ja: 'これからよろしくお願いします。',
          es: 'Espero que trabajemos bien juntos.',
        },
      },
      {
        korean: '처음 뵙겠습니다. 잘 부탁드려요.',
        translations: {
          en: 'Nice to meet you. Please take care of me.',
          ja: 'はじめまして。よろしくお願いします。',
          es: 'Encantado/a de conocerle. Espero que me trate bien.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-010-p004',
    korean: '떨려요',
    structure: '조금 떨려요 / 너무 떨려요',
    translations: {
      en: "I'm nervous / I'm trembling",
      ja: 'ドキドキします / 緊張します',
      es: 'Estoy nervioso/a',
    },
    examples: [
      {
        korean: '오늘 첫 수업이에요. 조금 떨려요.',
        translations: {
          en: "Today is my first class. I'm a little nervous.",
          ja: '今日は初めての授業です。少しドキドキします。',
          es: 'Hoy es mi primera clase. Estoy un poco nervioso/a.',
        },
      },
      {
        korean: '발표가 너무 떨려요.',
        translations: {
          en: "I'm so nervous about the presentation.",
          ja: '発表がとても緊張します。',
          es: 'Estoy muy nervioso/a por la presentación.',
        },
      },
      {
        korean: '처음이라 떨려요.',
        translations: {
          en: "I'm nervous because it's my first time.",
          ja: '初めてなのでドキドキします。',
          es: 'Estoy nervioso/a porque es la primera vez.',
        },
      },
    ],
    level: 'beginner',
  },
  {
    id: 'kp-ep-010-p005',
    korean: '할 수 있었어요',
    structure: '[동사 어간] + ㄹ/을 수 있었어요',
    translations: {
      en: 'I was able to ~ / I did it!',
      ja: '〜できました / やった！',
      es: 'Pude ~ / ¡Lo logré!',
    },
    examples: [
      {
        korean: '할 수 있었어요. 한국어로요.',
        translations: {
          en: 'I did it. In Korean.',
          ja: 'できました。韓国語で。',
          es: 'Lo logré. En coreano.',
        },
      },
      {
        korean: '혼자서 할 수 있었어요!',
        translations: {
          en: 'I was able to do it by myself!',
          ja: '一人でできました！',
          es: '¡Pude hacerlo yo solo/a!',
        },
      },
      {
        korean: '드디어 할 수 있었어요.',
        translations: {
          en: 'I was finally able to do it.',
          ja: 'ついにできました。',
          es: 'Por fin pude lograrlo.',
        },
      },
    ],
    level: 'beginner',
  },
]