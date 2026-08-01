/**
 * K-PATTO Pattern Popup — Literal Meaning, Usage, Examples
 * 사용자 최종 검토 완료 데이터 (P001~P020)
 *
 * 필드 → DB kp_expressions 컬럼 매핑:
 *   literalMeaning → english
 *   usage          → description
 *   examples       → examples (Array<{ko, en}>)
 *
 * DB seed 준비용 — DB 직접 수정 금지 (migration 실행 전까지)
 */

export interface KPattoPopupPattern {
  id: string
  korean: string
  literalMeaning: string
  usage: string
  examples: Array<{ ko: string; en: string }>
}

export const KPATTO_POPUP_PATTERNS: KPattoPopupPattern[] = [
  {
    id: 'P001',
    korean: '~뭐예요?',
    literalMeaning: 'What is ~?',
    usage: 'Used to ask what something is when you don\'t know its name or identity.',
    examples: [
      { ko: '이거 뭐예요?', en: 'What is this?' },
      { ko: '저 음식 뭐예요?', en: 'What is that food?' },
      { ko: '이 단어 뭐예요?', en: 'What is this word?' },
    ],
  },
  {
    id: 'P002',
    korean: '~주세요',
    literalMeaning: 'Give me ~, please.',
    usage: 'Used to politely request something or place an order.',
    examples: [
      { ko: '물 주세요.', en: 'Water, please.' },
      { ko: '메뉴판 주세요.', en: 'Please give me the menu.' },
      { ko: '영수증 주세요.', en: 'Please give me the receipt.' },
    ],
  },
  {
    id: 'P003',
    korean: '~있어요?',
    literalMeaning: 'Is there ~? / Do you have ~?',
    usage: 'Used to ask whether something exists or is available.',
    examples: [
      { ko: '와이파이 있어요?', en: 'Is there Wi-Fi?' },
      { ko: '영어 메뉴 있어요?', en: 'Do you have an English menu?' },
      { ko: '빈자리 있어요?', en: 'Is there an empty seat?' },
    ],
  },
  {
    id: 'P004',
    korean: '~가고 싶어요',
    literalMeaning: 'I want to go to ~.',
    usage: 'Used to say that you want to go to a place.',
    examples: [
      { ko: '한강에 가고 싶어요.', en: 'I want to go to the Han River.' },
      { ko: '부산에 가고 싶어요.', en: 'I want to go to Busan.' },
      { ko: '집에 가고 싶어요.', en: 'I want to go home.' },
    ],
  },
  {
    id: 'P005',
    korean: '~어떻게 가요?',
    literalMeaning: 'How do I get to ~?',
    usage: 'Used to ask for directions to a place.',
    examples: [
      { ko: '서울역 어떻게 가요?', en: 'How do I get to Seoul Station?' },
      { ko: '시청 어떻게 가요?', en: 'How do I get to City Hall?' },
      { ko: '공항 어떻게 가요?', en: 'How do I get to the airport?' },
    ],
  },
  {
    id: 'P006',
    korean: '어디서 타요?',
    literalMeaning: 'Where do I get on?',
    usage: 'Used to ask where to board a bus, subway, or other transportation.',
    examples: [
      { ko: '어디서 타요?', en: 'Where do I get on?' },
      { ko: '2호선 어디서 타요?', en: 'Where do I take Line 2?' },
      { ko: '버스 어디서 타요?', en: 'Where do I catch the bus?' },
    ],
  },
  {
    id: 'P007',
    korean: '~먹고 싶어요',
    literalMeaning: 'I want to eat ~.',
    usage: 'Used to express what food you want to eat.',
    examples: [
      { ko: '떡볶이 먹고 싶어요.', en: 'I want to eat tteokbokki.' },
      { ko: '라면 먹고 싶어요.', en: 'I want to eat ramen.' },
      { ko: '김밥 먹고 싶어요.', en: 'I want to eat gimbap.' },
    ],
  },
  {
    id: 'P008',
    korean: '~못 먹어요',
    literalMeaning: 'I can\'t eat ~.',
    usage: 'Used to say that you cannot eat or do not eat a certain food.',
    examples: [
      { ko: '매운 거 못 먹어요.', en: 'I can\'t eat spicy food.' },
      { ko: '해산물 못 먹어요.', en: 'I can\'t eat seafood.' },
      { ko: '너무 단 거 못 먹어요.', en: 'I can\'t eat very sweet food.' },
    ],
  },
  {
    id: 'P009',
    korean: '~로 할게요',
    literalMeaning: 'I\'ll go with ~.',
    usage: 'Used to make a choice or confirm an order.',
    examples: [
      { ko: '이걸로 할게요.', en: 'I\'ll go with this.' },
      { ko: '아메리카노로 할게요.', en: 'I\'ll have an Americano.' },
      { ko: '카드로 할게요.', en: 'I\'ll pay by card.' },
    ],
  },
  {
    id: 'P010',
    korean: '~해도 돼요?',
    literalMeaning: 'Can I ~? / May I ~?',
    usage: 'Used to ask for permission politely.',
    examples: [
      { ko: '여기서 먹어도 돼요?', en: 'Can I eat here?' },
      { ko: '사진 찍어도 돼요?', en: 'May I take a photo?' },
      { ko: '앉아도 돼요?', en: 'May I sit here?' },
    ],
  },
  {
    id: 'P011',
    korean: '~좋아해요',
    literalMeaning: 'I like ~.',
    usage: 'Used to say what you like or enjoy.',
    examples: [
      { ko: '저는 커피를 좋아해요.', en: 'I like coffee.' },
      { ko: '한국 음식을 좋아해요.', en: 'I like Korean food.' },
      { ko: '여행을 좋아해요.', en: 'I like traveling.' },
    ],
  },
  {
    id: 'P012',
    korean: '~싫어해요',
    literalMeaning: 'I don\'t like ~.',
    usage: 'Used to say what you dislike.',
    examples: [
      { ko: '저는 벌레를 싫어해요.', en: 'I don\'t like bugs.' },
      { ko: '추운 날씨를 싫어해요.', en: 'I don\'t like cold weather.' },
      { ko: '너무 매운 음식을 싫어해요.', en: 'I don\'t like very spicy food.' },
    ],
  },
  {
    id: 'P013',
    korean: '얼마예요?',
    literalMeaning: 'How much is it?',
    usage: 'Used to ask the price of something.',
    examples: [
      { ko: '이거 얼마예요?', en: 'How much is this?' },
      { ko: '이 티셔츠 얼마예요?', en: 'How much is this T-shirt?' },
      { ko: '입장료 얼마예요?', en: 'How much is the admission fee?' },
    ],
  },
  {
    id: 'P014',
    korean: '~추천해 주세요',
    literalMeaning: 'Please recommend ~.',
    usage: 'Used to ask someone for a recommendation.',
    examples: [
      { ko: '메뉴 추천해 주세요.', en: 'Please recommend a menu item.' },
      { ko: '맛집 추천해 주세요.', en: 'Please recommend a good restaurant.' },
      { ko: '관광지 추천해 주세요.', en: 'Please recommend a tourist attraction.' },
    ],
  },
  {
    id: 'P015',
    korean: '~같이 갈까요?',
    literalMeaning: 'Shall we go together?',
    usage: 'Used to suggest going somewhere together.',
    examples: [
      { ko: '같이 갈까요?', en: 'Shall we go together?' },
      { ko: '카페 같이 갈까요?', en: 'Shall we go to a café together?' },
      { ko: '지하철로 같이 갈까요?', en: 'Shall we take the subway together?' },
    ],
  },
  {
    id: 'P016',
    korean: '~부터 ~까지',
    literalMeaning: 'From ~ to ~',
    usage: 'Used to indicate a starting point and an ending point in time or place.',
    examples: [
      { ko: '아홉 시부터 다섯 시까지예요.', en: 'It\'s from 9 a.m. to 5 p.m.' },
      { ko: '서울부터 부산까지 갔어요.', en: 'I traveled from Seoul to Busan.' },
      { ko: '월요일부터 금요일까지 일해요.', en: 'I work from Monday to Friday.' },
    ],
  },
  {
    id: 'P017',
    korean: '얼마나 걸려요?',
    literalMeaning: 'How long does it take?',
    usage: 'Used to ask about the amount of time required.',
    examples: [
      { ko: '얼마나 걸려요?', en: 'How long does it take?' },
      { ko: '서울까지 얼마나 걸려요?', en: 'How long does it take to get to Seoul?' },
      { ko: '걸어서 얼마나 걸려요?', en: 'How long does it take on foot?' },
    ],
  },
  {
    id: 'P018',
    korean: '~입어 봐도 돼요?',
    literalMeaning: 'Can I try on ~?',
    usage: 'Used when asking for permission to try on clothes.',
    examples: [
      { ko: '이거 입어 봐도 돼요?', en: 'Can I try this on?' },
      { ko: '저 자켓 입어 봐도 돼요?', en: 'Can I try on that jacket?' },
      { ko: '탈의실 어디예요? 입어 봐도 돼요?', en: 'Where is the fitting room? Can I try it on?' },
    ],
  },
  {
    id: 'P019',
    korean: '어때요?',
    literalMeaning: 'How is it? / What do you think?',
    usage: 'Used to ask for someone\'s opinion or impression.',
    examples: [
      { ko: '이 옷 어때요?', en: 'How is this outfit?' },
      { ko: '한국 음식 어때요?', en: 'What do you think of Korean food?' },
      { ko: '제 발음 어때요?', en: 'How\'s my pronunciation?' },
    ],
  },
  {
    id: 'P020',
    korean: '카드 돼요?',
    literalMeaning: 'Can I pay by card?',
    usage: 'Used to ask whether card payment is accepted.',
    examples: [
      { ko: '카드 돼요?', en: 'Can I pay by card?' },
      { ko: '신용카드 돼요?', en: 'Do you accept credit cards?' },
      { ko: '해외 카드도 돼요?', en: 'Do you accept international cards?' },
    ],
  },
]
