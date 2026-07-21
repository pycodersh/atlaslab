import type { LessonConfig } from './types'

export const LESSONS: LessonConfig[] = [
  // ── LESSON 1 ──────────────────────────────────────────────────────────────
  {
    id: 1,
    required: true,
    duration: '3분',
    title: { en: 'What is Hangul?', ko: '한글이란?' },
    subtitle: { en: 'The world\'s most learnable writing system', ko: '세계에서 가장 배우기 쉬운 문자예요' },
    steps: [
      {
        type: 'info',
        emoji: '👋',
        body: {
          en: 'When you learn English, you start with the alphabet.\nFor Korean, you start with Hangul.\nYou can learn to read Hangul in one day!',
          ko: '영어를 배울 때 알파벳을 먼저 배우죠?\n한국어는 한글을 먼저 배워요.\n한글은 하루면 읽을 수 있어요.',
        },
      },
      {
        type: 'info',
        emoji: '👑',
        title: { en: 'King Sejong, 1443', ko: '세종대왕, 1443년' },
        body: {
          en: 'King Sejong created Hangul so that everyone could easily read and write. It\'s a scientific writing system based on the shape of the mouth.',
          ko: '세종대왕이 누구나 쉽게 읽고 쓸 수 있도록 만들었어요. 입 모양을 본뜬 과학적인 문자예요.',
        },
      },
      {
        type: 'combine-anim',
        explanation: {
          en: 'Hangul works by combining consonants and vowels into syllable blocks.\nThat\'s all there is to it!',
          ko: '자음과 모음을 합쳐서 글자를 만들어요.\n딱 이것만 알면 돼요!',
        },
        pairs: [
          { consonant: 'ㄱ', vowel: 'ㅏ', result: '가' },
          { consonant: 'ㄴ', vowel: 'ㅏ', result: '나' },
          { consonant: 'ㄷ', vowel: 'ㅏ', result: '다' },
        ],
      },
      {
        type: 'roadmap',
        title: { en: 'Your 6-lesson path to reading Korean', ko: '한글을 읽기까지 6레슨' },
        items: [
          { num: 1, title: { en: 'What is Hangul?', ko: '한글이란?' }, required: true },
          { num: 2, title: { en: 'Basic Vowels', ko: '기본 모음' }, required: true },
          { num: 3, title: { en: 'Basic Consonants', ko: '기본 자음' }, required: true },
          { num: 4, title: { en: 'Combining', ko: '자음+모음 결합' }, required: true },
          { num: 5, title: { en: 'Diphthongs', ko: '이중모음' }, required: true },
          { num: 6, title: { en: 'Final Consonants', ko: '받침' }, required: true },
        ],
      },
      {
        type: 'info',
        emoji: '🚀',
        body: {
          en: 'Ready? Let\'s start with vowels!',
          ko: '준비됐어요? 모음부터 시작해요!',
        },
      },
    ],
    // No quiz — lesson 1 just requires reading through
  },

  // ── LESSON 2 ──────────────────────────────────────────────────────────────
  {
    id: 2,
    required: true,
    duration: '7분',
    title: { en: 'Basic Vowels', ko: '기본 모음 8개' },
    subtitle: { en: 'The backbone of Hangul', ko: '한글의 뼈대, 모음부터 시작해요' },
    steps: [
      {
        type: 'info',
        emoji: '🔵',
        body: {
          en: 'Korean has 8 basic vowels. Vowels are the core of every syllable.\nHangul vowels were inspired by heaven (·), earth (ㅡ), and human (ㅣ).',
          ko: '한글 모음은 8개예요. 모음은 소리의 핵심이에요.\n하늘(·), 땅(ㅡ), 사람(ㅣ)을 본떠 만들었어요.',
        },
      },
      {
        type: 'card-flip-grid',
        title: { en: 'Group 1 — Core 4 vowels', ko: '그룹 1 — 핵심 4개' },
        note: { en: 'Tap each card to see the pronunciation', ko: '탭하면 발음을 확인할 수 있어요' },
        cards: [
          { front: 'ㅏ', back: 'a', sub: 'like "a" in father' },
          { front: 'ㅓ', back: 'eo', sub: 'open mouth wide → "uh"' },
          { front: 'ㅗ', back: 'o', sub: 'like "o" in note' },
          { front: 'ㅜ', back: 'u', sub: 'like "u" in moon' },
        ],
      },
      {
        type: 'card-flip-grid',
        title: { en: 'Group 2 — Next 4 vowels', ko: '그룹 2 — 나머지 4개' },
        note: { en: 'ㅡ and ㅓ have no English equivalent — listen and copy!', ko: 'ㅡ와 ㅓ는 영어에 없는 소리예요 — 듣고 따라해요!' },
        cards: [
          { front: 'ㅡ', back: 'eu', sub: 'spread lips sideways → "eu"' },
          { front: 'ㅣ', back: 'i', sub: 'like "ee" in see' },
          { front: 'ㅐ', back: 'e', sub: 'like "e" in bed' },
          { front: 'ㅔ', back: 'e', sub: 'same sound as ㅐ' },
        ],
      },
      {
        type: 'combine-anim',
        explanation: {
          en: 'When a vowel stands alone, add the silent consonant ㅇ in front.',
          ko: '모음만 쓸 때는 앞에 소리 없는 ㅇ을 붙여요.',
        },
        pairs: [
          { consonant: 'ㅇ', vowel: 'ㅏ', result: '아' },
          { consonant: 'ㅇ', vowel: 'ㅓ', result: '어' },
          { consonant: 'ㅇ', vowel: 'ㅗ', result: '오' },
          { consonant: 'ㅇ', vowel: 'ㅜ', result: '우' },
        ],
      },
      {
        type: 'word-practice',
        title: { en: 'Read these words!', ko: '이 단어들을 읽어봐요!' },
        words: [
          { korean: '아이', meaning: { en: 'child', ko: '아이' } },
          { korean: '우유', meaning: { en: 'milk', ko: '우유' } },
          { korean: '오이', meaning: { en: 'cucumber', ko: '오이' } },
        ],
      },
    ],
    quiz: {
      passingScore: 3,
      questions: [
        {
          question: { en: 'Which vowel sounds like "a" in "father"?', ko: '"father"의 "a" 소리는 어떤 모음인가요?' },
          options: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ'],
          correct: 0,
          explanation: { en: 'ㅏ (a) — open your mouth wide and say "ah"', ko: 'ㅏ는 입을 크게 벌리고 "아"' },
        },
        {
          question: { en: 'What silent consonant goes before a vowel when it stands alone?', ko: '모음이 단독으로 쓰일 때 앞에 오는 소리 없는 자음은?' },
          options: ['ㄱ', 'ㅇ', 'ㄴ', 'ㅎ'],
          correct: 1,
          explanation: { en: 'ㅇ is silent at the start of a syllable', ko: 'ㅇ은 글자 처음에 오면 소리가 없어요' },
        },
        {
          question: { en: 'Which vowel sounds like "u" in "moon"?', ko: '"moon"의 "u" 소리는 어떤 모음인가요?' },
          options: ['ㅗ', 'ㅣ', 'ㅜ', 'ㅡ'],
          correct: 2,
          explanation: { en: 'ㅜ (u) — round your lips', ko: 'ㅜ — 입술을 동그랗게 만들어요' },
        },
        {
          question: { en: '아이 (child) — what vowel is in 아?', ko: '아이(child)에서 "아"의 모음은?' },
          options: ['ㅓ', 'ㅐ', 'ㅗ', 'ㅏ'],
          correct: 3,
          explanation: { en: '아 = ㅇ (silent) + ㅏ', ko: '아 = ㅇ(소리 없음) + ㅏ' },
        },
        {
          question: { en: 'Which vowel has no English equivalent and sounds like "eu"?', ko: '영어에 없는 "으" 소리는 어떤 모음인가요?' },
          options: ['ㅣ', 'ㅐ', 'ㅔ', 'ㅡ'],
          correct: 3,
          explanation: { en: 'ㅡ (eu) — spread lips sideways', ko: 'ㅡ — 입술을 옆으로 벌려요' },
        },
      ],
    },
  },

  // ── LESSON 3 ──────────────────────────────────────────────────────────────
  {
    id: 3,
    required: true,
    duration: '8분',
    title: { en: 'Basic Consonants', ko: '기본 자음 14개' },
    subtitle: { en: 'The start of every sound', ko: '자음은 소리의 시작이에요' },
    steps: [
      {
        type: 'info',
        emoji: '🔤',
        body: {
          en: 'Korean has 14 basic consonants — far fewer than English\'s 26 letters!\nWe\'ll split them into 2 groups.',
          ko: '한글 자음은 14개예요 — 영어 알파벳 26개보다 훨씬 적어요!\n2그룹으로 나눠서 배울게요.',
        },
      },
      {
        type: 'stroke-grid',
        title: { en: 'Group 1 — Basic sounds (9 consonants)', ko: '그룹 1 — 평음 9개' },
        note: { en: 'Tap each consonant to see how it combines with ㅏ', ko: '탭하면 ㅏ와 결합하는 예시를 볼 수 있어요' },
        groups: [
          {
            label: { en: 'Basic (평음)', ko: '평음' },
            color: '#4F8CFF',
            consonants: [
              { char: 'ㄱ', romanization: 'g/k', example: '가' },
              { char: 'ㄴ', romanization: 'n', example: '나' },
              { char: 'ㄷ', romanization: 'd/t', example: '다' },
              { char: 'ㄹ', romanization: 'r/l', example: '라' },
              { char: 'ㅁ', romanization: 'm', example: '마' },
              { char: 'ㅂ', romanization: 'b/p', example: '바' },
              { char: 'ㅅ', romanization: 's', example: '사' },
              { char: 'ㅈ', romanization: 'j', example: '자' },
              { char: 'ㅇ', romanization: 'silent/ng', example: '아' },
            ],
          },
        ],
      },
      {
        type: 'stroke-grid',
        title: { en: 'Group 2 — Aspirated sounds (5 consonants)', ko: '그룹 2 — 격음 5개' },
        note: { en: 'Put your hand in front of your mouth — you\'ll feel a puff of air!', ko: '손을 입 앞에 대보세요 — 바람이 느껴져요!' },
        groups: [
          {
            label: { en: 'Aspirated (격음)', ko: '격음' },
            color: '#FF8C6B',
            consonants: [
              { char: 'ㅋ', romanization: 'k', example: '카' },
              { char: 'ㅌ', romanization: 't', example: '타' },
              { char: 'ㅍ', romanization: 'p', example: '파' },
              { char: 'ㅊ', romanization: 'ch', example: '차' },
              { char: 'ㅎ', romanization: 'h', example: '하' },
            ],
          },
        ],
      },
      {
        type: 'word-practice',
        title: { en: 'Read these words!', ko: '읽어봐요!' },
        words: [
          { korean: '나비', meaning: { en: 'butterfly', ko: '나비' } },
          { korean: '바나나', meaning: { en: 'banana', ko: '바나나' } },
          { korean: '가방', meaning: { en: 'bag', ko: '가방' } },
          { korean: '모자', meaning: { en: 'hat', ko: '모자' } },
          { korean: '사진', meaning: { en: 'photo', ko: '사진' } },
        ],
      },
    ],
    quiz: {
      passingScore: 4,
      questions: [
        {
          question: { en: 'Which consonant sounds like g/k?', ko: 'g/k 소리가 나는 자음은?' },
          options: ['ㄴ', 'ㅁ', 'ㄱ', 'ㅅ'],
          correct: 2,
          explanation: { en: 'ㄱ (g/k) — soft at the start of a word', ko: 'ㄱ은 단어 처음에서 부드럽게 발음돼요' },
        },
        {
          question: { en: 'Which of these is NOT an aspirated consonant?', ko: '다음 중 격음이 아닌 것은?' },
          options: ['ㅋ', 'ㅌ', 'ㄷ', 'ㅍ'],
          correct: 2,
          explanation: { en: 'ㄷ is a basic (평음) consonant, not aspirated', ko: 'ㄷ은 평음이에요, 격음이 아니에요' },
        },
        {
          question: { en: 'How do you describe the sound of ㄹ?', ko: 'ㄹ의 소리를 가장 잘 설명한 것은?' },
          options: ['Exactly like English "r"', 'Between r and l', 'Exactly like English "l"', 'Silent'],
          correct: 1,
          explanation: { en: 'ㄹ is unique — between r and l, flick your tongue', ko: 'ㄹ은 r과 l 사이 소리예요, 혀끝을 살짝 튕겨요' },
        },
        {
          question: { en: 'Aspirated consonants produce a puff of air. Which group are they?', ko: '격음의 특징은?' },
          options: ['No sound at all', 'Strong puff of air', 'Double sound', 'Nasal sound'],
          correct: 1,
          explanation: { en: 'Aspirated (격음) = strong breath when pronounced', ko: '격음 = 발음할 때 숨이 강하게 나와요' },
        },
        {
          question: { en: 'ㅇ at the START of a syllable sounds like...?', ko: '글자 처음에 오는 ㅇ의 소리는?' },
          options: ['ng', 'n', 'silent', 'g'],
          correct: 2,
          explanation: { en: 'ㅇ is silent at the start — 아 = "a", not "nga"', ko: '글자 처음 ㅇ은 소리가 없어요' },
        },
      ],
    },
  },

  // ── LESSON 4 ──────────────────────────────────────────────────────────────
  {
    id: 4,
    required: true,
    duration: '8분',
    title: { en: 'Consonant + Vowel', ko: '자음 + 모음 결합' },
    subtitle: { en: 'Now let\'s build syllables', ko: '이제 글자를 만들어요' },
    steps: [
      {
        type: 'info',
        emoji: '✨',
        body: {
          en: 'Just two rules let you build every Korean syllable.\nThe shape of the vowel decides where the consonant goes.',
          ko: '딱 두 가지 규칙만 알면 모든 글자를 만들 수 있어요.\n모음 모양을 보면 자음이 어디 갈지 알 수 있어요.',
        },
      },
      {
        type: 'combine-anim',
        explanation: {
          en: 'Rule 1 — Vertical vowels (ㅏ ㅓ ㅣ ㅐ ㅔ): consonant goes on the LEFT',
          ko: '규칙 1 — 세로 모음 (ㅏ ㅓ ㅣ ㅐ ㅔ): 자음이 왼쪽으로',
        },
        pairs: [
          { consonant: 'ㄱ', vowel: 'ㅏ', result: '가' },
          { consonant: 'ㄴ', vowel: 'ㅓ', result: '너' },
          { consonant: 'ㅂ', vowel: 'ㅣ', result: '비' },
        ],
      },
      {
        type: 'combine-anim',
        explanation: {
          en: 'Rule 2 — Horizontal vowels (ㅗ ㅜ ㅡ): consonant goes on TOP',
          ko: '규칙 2 — 가로 모음 (ㅗ ㅜ ㅡ): 자음이 위쪽으로',
        },
        pairs: [
          { consonant: 'ㄱ', vowel: 'ㅗ', result: '고' },
          { consonant: 'ㄴ', vowel: 'ㅜ', result: '누' },
          { consonant: 'ㅂ', vowel: 'ㅡ', result: '브' },
        ],
      },
      {
        type: 'interactive-combine',
        title: { en: 'Build your own syllables!', ko: '직접 글자를 만들어봐요!' },
        body: { en: 'Pick a consonant and a vowel — tap to combine', ko: '자음과 모음을 하나씩 선택해요 — 탭해서 결합' },
        consonants: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅈ'],
        vowels: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'],
      },
      {
        type: 'word-practice',
        title: { en: 'Read these words!', ko: '읽어봐요!' },
        words: [
          { korean: '고기', meaning: { en: 'meat', ko: '고기' } },
          { korean: '도시', meaning: { en: 'city', ko: '도시' } },
          { korean: '커피', meaning: { en: 'coffee', ko: '커피' } },
          { korean: '기차', meaning: { en: 'train', ko: '기차' } },
          { korean: '버스', meaning: { en: 'bus', ko: '버스' } },
        ],
      },
    ],
    quiz: {
      passingScore: 4,
      questions: [
        {
          question: { en: 'ㄱ + ㅏ = ?', ko: 'ㄱ + ㅏ = ?' },
          options: ['거', '가', '고', '그'],
          correct: 1,
        },
        {
          question: { en: 'With vertical vowels, where does the consonant go?', ko: '세로 모음일 때 자음은 어디에 오나요?' },
          options: ['Right', 'Below', 'Left', 'Above'],
          correct: 2,
          explanation: { en: 'Vertical vowels → consonant on the LEFT', ko: '세로 모음 → 자음이 왼쪽' },
        },
        {
          question: { en: 'ㅗ is a _____ vowel', ko: 'ㅗ는 어떤 종류의 모음인가요?' },
          options: ['vertical', 'horizontal', 'diphthong', 'coda'],
          correct: 1,
          explanation: { en: 'ㅗ is horizontal → consonant goes on top', ko: 'ㅗ는 가로 모음 → 자음이 위로' },
        },
        {
          question: { en: 'ㄴ + ㅓ = ?', ko: 'ㄴ + ㅓ = ?' },
          options: ['노', '느', '나', '너'],
          correct: 3,
        },
        {
          question: { en: 'With horizontal vowels, where does the consonant go?', ko: '가로 모음일 때 자음은 어디에 오나요?' },
          options: ['Left', 'Right', 'Below', 'Above'],
          correct: 3,
          explanation: { en: 'Horizontal vowels → consonant on TOP', ko: '가로 모음 → 자음이 위쪽' },
        },
      ],
    },
  },

  // ── LESSON 5 ──────────────────────────────────────────────────────────────
  {
    id: 5,
    required: true,
    duration: '8분',
    title: { en: 'Diphthongs', ko: '이중모음 11개' },
    subtitle: { en: 'When vowels combine, new sounds emerge', ko: '모음이 합쳐지면 새로운 소리가 나요' },
    steps: [
      {
        type: 'info',
        emoji: '🌀',
        body: {
          en: 'Some vowels combine to make new sounds.\nDon\'t overthink it — just say the two sounds fast together!',
          ko: '모음끼리 합쳐지면 새로운 소리가 나요.\n어렵게 생각하지 말고, 두 소리를 빠르게 이어서 읽으면 돼요.',
        },
      },
      {
        type: 'diphthong-grid',
        title: { en: 'Core diphthongs (9)', ko: '핵심 이중모음 9개' },
        note: { en: 'ㅘ = ㅗ+ㅏ, ㅝ = ㅜ+ㅓ — say them fast!', ko: 'ㅘ = ㅗ+ㅏ, ㅝ = ㅜ+ㅓ — 빠르게 이어서 읽어요!' },
        primary: [
          { char: 'ㅑ', romanization: 'ya' },
          { char: 'ㅕ', romanization: 'yeo' },
          { char: 'ㅛ', romanization: 'yo' },
          { char: 'ㅠ', romanization: 'yu' },
          { char: 'ㅘ', romanization: 'wa', composition: 'ㅗ+ㅏ' },
          { char: 'ㅝ', romanization: 'wo', composition: 'ㅜ+ㅓ' },
          { char: 'ㅢ', romanization: 'ui' },
          { char: 'ㅚ', romanization: 'we' },
          { char: 'ㅟ', romanization: 'wi' },
        ],
        secondary: [
          { char: 'ㅒ', romanization: 'yae' },
          { char: 'ㅖ', romanization: 'ye' },
          { char: 'ㅙ', romanization: 'wae' },
          { char: 'ㅞ', romanization: 'we' },
        ],
      },
      {
        type: 'word-practice',
        title: { en: 'Read these words!', ko: '읽어봐요!' },
        words: [
          { korean: '야구', meaning: { en: 'baseball', ko: '야구' } },
          { korean: '여자', meaning: { en: 'woman', ko: '여자' } },
          { korean: '요리', meaning: { en: 'cooking', ko: '요리' } },
          { korean: '유리', meaning: { en: 'glass', ko: '유리' } },
          { korean: '와이파이', meaning: { en: 'Wi-Fi', ko: '와이파이' } },
          { korean: '의사', meaning: { en: 'doctor', ko: '의사' } },
        ],
      },
    ],
    quiz: {
      passingScore: 4,
      questions: [
        {
          question: { en: 'ㅑ sounds like...?', ko: 'ㅑ의 발음은?' },
          options: ['a', 'ya', 'yo', 'yu'],
          correct: 1,
        },
        {
          question: { en: 'ㅘ is a combination of...?', ko: 'ㅘ는 어느 두 모음의 결합인가요?' },
          options: ['ㅜ+ㅓ', 'ㅗ+ㅏ', 'ㅏ+ㅓ', 'ㅗ+ㅜ'],
          correct: 1,
          explanation: { en: 'ㅘ = ㅗ + ㅏ → say "o" then "a" fast', ko: 'ㅘ = ㅗ+ㅏ → "오"와 "아"를 빠르게' },
        },
        {
          question: { en: '야구 (baseball) — what diphthong is in 야?', ko: '야구(baseball)에서 야의 모음은?' },
          options: ['ㅏ', 'ㅕ', 'ㅑ', 'ㅛ'],
          correct: 2,
        },
        {
          question: { en: 'ㅢ in 의사 (doctor) is read as...?', ko: '의사(doctor)에서 의의 발음은?' },
          options: ['이', '에', '의', '으'],
          correct: 2,
          explanation: { en: 'ㅢ at the start of a word is read as "ui" → [의]', ko: '단어 첫 글자 ㅢ는 [의]로 읽어요' },
        },
        {
          question: { en: 'Which diphthong sounds like "yo"?', ko: '"yo" 소리가 나는 이중모음은?' },
          options: ['ㅛ', 'ㅜ', 'ㅐ', 'ㅕ'],
          correct: 0,
        },
      ],
    },
  },

  // ── LESSON 6 ──────────────────────────────────────────────────────────────
  {
    id: 6,
    required: true,
    duration: '8분',
    title: { en: 'Final Consonants (받침)', ko: '받침' },
    subtitle: { en: 'The consonant at the bottom of a syllable', ko: '글자 아래에 자음이 오면 받침이에요' },
    steps: [
      {
        type: 'info',
        emoji: '🏗️',
        body: {
          en: 'Korean syllables can have up to 3 layers:\n① Consonant\n② Vowel\n③ Final consonant (받침)\n\n받침 is the consonant at the bottom.',
          ko: '한글 글자는 최대 3층 구조예요:\n① 자음\n② 모음\n③ 받침\n\n받침은 3층에 오는 자음이에요.',
        },
      },
      {
        type: 'stack-anim',
        title: { en: 'Watch the 3-layer structure', ko: '3층 구조를 확인해봐요' },
        body: { en: 'The coda (받침) slides in below the vowel', ko: '받침이 모음 아래로 내려와요' },
        examples: [
          { consonant: 'ㄱ', vowel: 'ㅏ', coda: 'ㄹ', result: '갈', coda_sound: 'l' },
          { consonant: 'ㄴ', vowel: 'ㅏ', coda: 'ㅁ', result: '남', coda_sound: 'm' },
        ],
        codas: [
          { char: 'ㄱ', sound: 'k', example: '국', meaning: { en: 'soup', ko: '국' } },
          { char: 'ㄴ', sound: 'n', example: '한', meaning: { en: 'Korean', ko: '한국의' } },
          { char: 'ㄹ', sound: 'l', example: '말', meaning: { en: 'speech', ko: '말' } },
          { char: 'ㅁ', sound: 'm', example: '봄', meaning: { en: 'spring', ko: '봄' } },
          { char: 'ㅂ', sound: 'p', example: '밥', meaning: { en: 'rice', ko: '밥' } },
          { char: 'ㅅ', sound: 't', example: '맛', meaning: { en: 'taste', ko: '맛' } },
          { char: 'ㅇ', sound: 'ng', example: '강', meaning: { en: 'river', ko: '강' } },
        ],
      },
      {
        type: 'word-practice',
        title: { en: 'Read with final consonants!', ko: '받침 있는 단어를 읽어봐요!' },
        words: [
          { korean: '한국', meaning: { en: 'Korea', ko: '한국' } },
          { korean: '밥', meaning: { en: 'rice / meal', ko: '밥' } },
          { korean: '물', meaning: { en: 'water', ko: '물' } },
          { korean: '맛', meaning: { en: 'taste', ko: '맛' } },
          { korean: '강남', meaning: { en: 'Gangnam (Seoul)', ko: '강남' } },
          { korean: '봄', meaning: { en: 'spring', ko: '봄' } },
          { korean: '일', meaning: { en: 'work / day', ko: '일' } },
        ],
      },
    ],
    quiz: {
      passingScore: 6,
      questions: [
        {
          question: { en: 'The coda (받침) is on which layer of a Korean syllable?', ko: '받침은 글자의 몇 층에 오나요?' },
          options: ['1st layer', '2nd layer', '3rd layer', '4th layer'],
          correct: 2,
          explanation: { en: 'Syllable structure: ① consonant ② vowel ③ coda', ko: '① 자음 ② 모음 ③ 받침' },
        },
        {
          question: { en: 'What is the coda in 밥 (rice)?', ko: '밥(rice)의 받침은?' },
          options: ['ㄱ', 'ㄹ', 'ㅅ', 'ㅂ'],
          correct: 3,
        },
        {
          question: { en: 'What sound does the ㅇ coda make?', ko: 'ㅇ 받침의 소리는?' },
          options: ['silent', 'n', 'ng', 'k'],
          correct: 2,
          explanation: { en: 'ㅇ as a coda = ng (like "song")', ko: 'ㅇ 받침 = ng 소리 (예: 강, 방)' },
        },
        {
          question: { en: 'What is the coda in 말 (speech)?', ko: '말(speech)의 받침은?' },
          options: ['ㅁ', 'ㄴ', 'ㄹ', 'ㅂ'],
          correct: 2,
        },
        {
          question: { en: 'The ㅅ coda sounds like...?', ko: 'ㅅ 받침의 대표 소리는?' },
          options: ['s', 'n', 't', 'k'],
          correct: 2,
          explanation: { en: 'ㅅ coda → t sound (맛, 옷)', ko: 'ㅅ 받침 → t 소리 (맛, 옷)' },
        },
        {
          question: { en: 'What is the coda in 한 (Korean)?', ko: '한(Korean)의 받침은?' },
          options: ['ㄱ', 'ㄴ', 'ㄹ', 'ㅅ'],
          correct: 1,
        },
        {
          question: { en: 'What is the coda in 봄 (spring)?', ko: '봄(spring)의 받침은?' },
          options: ['ㄴ', 'ㄹ', 'ㅂ', 'ㅁ'],
          correct: 3,
        },
      ],
    },
  },

  // ── LESSON 7 ──────────────────────────────────────────────────────────────
  {
    id: 7,
    required: false,
    duration: '7분',
    title: { en: 'Reading Practice', ko: '단어로 읽기 연습' },
    subtitle: { en: 'Real Korean words you already know', ko: '이미 알고 있는 한국어 단어를 읽어요' },
    steps: [
      {
        type: 'info',
        emoji: '📖',
        body: {
          en: 'You already know some Korean words! Let\'s read them in Hangul.',
          ko: '이미 알고 있는 한국어 단어들을 한글로 읽어봐요.',
        },
      },
      {
        type: 'word-practice',
        title: { en: 'K-Food', ko: '음식' },
        words: [
          { korean: '김치', meaning: { en: 'Kimchi', ko: '김치' } },
          { korean: '비빔밥', meaning: { en: 'Bibimbap', ko: '비빔밥' } },
          { korean: '삼겹살', meaning: { en: 'Samgyeopsal', ko: '삼겹살' } },
          { korean: '라면', meaning: { en: 'Ramen', ko: '라면' } },
          { korean: '치킨', meaning: { en: 'Fried chicken', ko: '치킨' } },
          { korean: '불고기', meaning: { en: 'Bulgogi', ko: '불고기' } },
        ],
      },
      {
        type: 'word-practice',
        title: { en: 'K-Culture', ko: 'K-문화' },
        words: [
          { korean: '아이돌', meaning: { en: 'Idol', ko: '아이돌' } },
          { korean: '오빠', meaning: { en: 'Oppa (older brother / term of endearment)', ko: '오빠' } },
          { korean: '대박', meaning: { en: 'Awesome! / Jackpot!', ko: '대박' } },
          { korean: '화이팅', meaning: { en: 'Fighting! (go for it!)', ko: '화이팅' } },
          { korean: '드라마', meaning: { en: 'K-drama', ko: '드라마' } },
          { korean: '웹툰', meaning: { en: 'Webtoon', ko: '웹툰' } },
        ],
      },
      {
        type: 'word-practice',
        title: { en: 'Places & Greetings', ko: '장소 & 인사' },
        words: [
          { korean: '서울', meaning: { en: 'Seoul', ko: '서울' } },
          { korean: '강남', meaning: { en: 'Gangnam', ko: '강남' } },
          { korean: '지하철', meaning: { en: 'Subway', ko: '지하철' } },
          { korean: '편의점', meaning: { en: 'Convenience store', ko: '편의점' } },
          { korean: '안녕', meaning: { en: 'Hello / Bye', ko: '안녕' } },
          { korean: '감사', meaning: { en: 'Thank you', ko: '감사' } },
        ],
      },
    ],
  },

  // ── LESSON 8 ──────────────────────────────────────────────────────────────
  {
    id: 8,
    required: false,
    duration: '6분',
    title: { en: 'Pronunciation Rule 1', ko: '발음 규칙 1 — 연음' },
    subtitle: { en: 'When letters blend across syllables', ko: '글자대로 읽으면 안 될 때가 있어요' },
    steps: [
      {
        type: 'info',
        emoji: '🔗',
        body: {
          en: 'In Korean, written form and spoken form can differ.\nWhen a coda meets a vowel, the coda moves to the next syllable.',
          ko: '한국어는 쓰는 것과 읽는 것이 조금 달라요.\n받침 뒤에 모음이 오면 받침이 다음 글자로 넘어가요.',
        },
      },
      {
        type: 'liaison-demo',
        title: { en: 'Liaison (연음) in action', ko: '연음 현상' },
        body: {
          en: 'The coda slides into the next vowel syllable',
          ko: '받침이 다음 모음 글자의 첫소리로 넘어가요',
        },
        examples: [
          { written: '한국어', pronounced: '[한구거]', note: { en: 'ㄱ moves from 국 to 어 → han-gu-geo', ko: 'ㄱ이 국→어로 이동 → 한구거' } },
          { written: '먹어요', pronounced: '[머거요]', note: { en: 'ㄱ moves from 먹 to 어 → meo-geo-yo', ko: 'ㄱ이 먹→어로 이동 → 머거요' } },
          { written: '밥을', pronounced: '[바블]', note: { en: 'ㅂ moves from 밥 to 을 → ba-beul', ko: 'ㅂ이 밥→을로 이동 → 바블' } },
          { written: '있어요', pronounced: '[이써요]', note: { en: 'ㅅ moves from 있 to 어 → i-sseo-yo', ko: 'ㅅ이 있→어로 이동 → 이써요' } },
        ],
      },
    ],
    quiz: {
      passingScore: 3,
      questions: [
        {
          question: { en: '한국어 is pronounced as...?', ko: '한국어의 발음은?' },
          options: ['[한국어]', '[한구거]', '[한구어]', '[하국어]'],
          correct: 1,
        },
        {
          question: { en: 'Liaison happens when a coda is followed by...?', ko: '연음이 일어나는 조건은?' },
          options: ['another coda', 'a vowel', 'ㅎ', 'nothing'],
          correct: 1,
          explanation: { en: 'Coda + vowel = the coda moves to the next syllable', ko: '받침 + 모음 = 받침이 다음 글자로 이동' },
        },
        {
          question: { en: '먹어요 is pronounced as...?', ko: '먹어요의 발음은?' },
          options: ['[먹어요]', '[머거요]', '[멍어요]', '[먹여요]'],
          correct: 1,
        },
        {
          question: { en: 'In 밥을, the ㅂ coda moves to...?', ko: '밥을에서 ㅂ 받침은 어디로 이동하나요?' },
          options: ['stays in 밥', 'moves to 을', 'disappears', 'doubles'],
          correct: 1,
        },
      ],
    },
  },

  // ── LESSON 9 ──────────────────────────────────────────────────────────────
  {
    id: 9,
    required: false,
    duration: '6분',
    title: { en: 'Pronunciation Rule 2', ko: '발음 규칙 2 — 격음화·ㅎ 약화' },
    subtitle: { en: 'ㅎ changes the sounds around it', ko: 'ㅎ이 옆 소리를 바꿔요' },
    steps: [
      {
        type: 'info',
        emoji: '💨',
        body: {
          en: 'ㅎ is a special consonant — it transforms nearby sounds.\nNo need to memorize — you\'ll pick it up as you listen!',
          ko: 'ㅎ은 옆에 오는 자음을 바꾸는 특별한 소리예요.\n외울 필요 없어요, 들으면서 익히면 돼요.',
        },
      },
      {
        type: 'info',
        emoji: '🔀',
        title: { en: 'Aspiration (격음화)', ko: '격음화' },
        body: {
          en: 'ㄱ + ㅎ → [ㅋ]  예: 축하 → [추카]\nㄷ + ㅎ → [ㅌ]  예: 좋다 → [조타]\nㅂ + ㅎ → [ㅍ]  예: 입학 → [이팍]\nㅈ + ㅎ → [ㅊ]  예: 좋지 → [조치]',
          ko: 'ㄱ + ㅎ → [ㅋ]  예: 축하 → [추카]\nㄷ + ㅎ → [ㅌ]  예: 좋다 → [조타]\nㅂ + ㅎ → [ㅍ]  예: 입학 → [이팍]\nㅈ + ㅎ → [ㅊ]  예: 좋지 → [조치]',
        },
      },
      {
        type: 'info',
        emoji: '🌫️',
        title: { en: 'ㅎ weakening', ko: 'ㅎ 약화/탈락' },
        body: {
          en: 'When ㅎ appears between vowels, it weakens or disappears:\n좋아요 → [조아요]\n많아요 → [마나요]',
          ko: '모음과 모음 사이 ㅎ은 소리가 약해지거나 사라져요:\n좋아요 → [조아요]\n많아요 → [마나요]',
        },
      },
    ],
    quiz: {
      passingScore: 3,
      questions: [
        {
          question: { en: '축하 is pronounced as...?', ko: '축하의 발음은?' },
          options: ['[축하]', '[추카]', '[추하]', '[축카]'],
          correct: 1,
        },
        {
          question: { en: '좋아요 is pronounced as...?', ko: '좋아요의 발음은?' },
          options: ['[조아요]', '[좋아요]', '[조하요]', '[죠아요]'],
          correct: 0,
        },
        {
          question: { en: 'ㄱ + ㅎ becomes...?', ko: 'ㄱ + ㅎ은 어떤 소리가 되나요?' },
          options: ['ㄱ', 'ㄲ', 'ㅋ', 'ㅎ'],
          correct: 2,
        },
        {
          question: { en: 'Between two vowels, ㅎ tends to...?', ko: '두 모음 사이에서 ㅎ은?' },
          options: ['get stronger', 'weaken or disappear', 'become ㄱ', 'stay the same'],
          correct: 1,
        },
      ],
    },
  },

  // ── LESSON 10 ─────────────────────────────────────────────────────────────
  {
    id: 10,
    required: false,
    duration: '9분',
    title: { en: 'Real-World Reading', ko: '실전 읽기' },
    subtitle: { en: 'Read Korean in the wild', ko: '한국 거리에서 바로 읽어봐요' },
    steps: [
      {
        type: 'info',
        emoji: '🏙️',
        body: {
          en: 'Time to take Hangul into the real world!\nCafé menus, subway signs, K-pop album covers — let\'s go!',
          ko: '이제 한국 거리로 나가봐요!\n카페 메뉴판, 지하철 역명, K-pop 앨범까지!',
        },
      },
      {
        type: 'scene',
        title: { en: 'Café Menu', ko: '카페 메뉴판' },
        scene: 'cafe',
        items: [
          { korean: '아메리카노', meaning: { en: 'Americano', ko: '아메리카노' } },
          { korean: '카페라떼', meaning: { en: 'Café latte', ko: '카페라떼' } },
          { korean: '녹차', meaning: { en: 'Green tea', ko: '녹차' } },
          { korean: '딸기', meaning: { en: 'Strawberry', ko: '딸기' } },
          { korean: '바닐라', meaning: { en: 'Vanilla', ko: '바닐라' } },
        ],
      },
      {
        type: 'scene',
        title: { en: 'Subway Stations', ko: '지하철 역명' },
        scene: 'subway',
        items: [
          { korean: '강남', meaning: { en: 'Gangnam', ko: '강남' } },
          { korean: '홍대입구', meaning: { en: 'Hongik Univ.', ko: '홍대입구' } },
          { korean: '명동', meaning: { en: 'Myeongdong', ko: '명동' } },
          { korean: '서울역', meaning: { en: 'Seoul Station', ko: '서울역' } },
          { korean: '신촌', meaning: { en: 'Sinchon', ko: '신촌' } },
        ],
      },
      {
        type: 'info',
        emoji: '🎵',
        title: { en: 'Consonant cluster hint (겹받침)', ko: '겹받침 맛보기' },
        body: {
          en: 'Some words have TWO final consonants — only one is pronounced:\n닭 → [닥] (chicken)\n삶 → [삼] (life)\n읽다 → [익따] (to read)\n\nTip: When in doubt, pronounce the first one!',
          ko: '어떤 글자는 받침이 두 개예요 — 하나만 발음해요:\n닭 → [닥]\n삶 → [삼]\n읽다 → [익따]\n\n헷갈리면 첫 번째 받침을 발음해요!',
        },
      },
    ],
    quiz: {
      passingScore: 7,
      questions: [
        { question: { en: 'ㄱ + ㅏ = ?', ko: 'ㄱ + ㅏ = ?' }, options: ['나', '다', '가', '바'], correct: 2 },
        { question: { en: 'Which is a horizontal vowel?', ko: '가로 모음은?' }, options: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅣ'], correct: 2 },
        { question: { en: 'When a coda meets a vowel, it...', ko: '받침 뒤에 모음이 오면?' }, options: ['disappears', 'doubles', 'moves to next syllable', 'stays'], correct: 2 },
        { question: { en: '밥 (rice) — what is the coda?', ko: '밥의 받침은?' }, options: ['ㄱ', 'ㅂ', 'ㄹ', 'ㄴ'], correct: 1 },
        { question: { en: 'ㅗ + ㅏ together make which diphthong?', ko: 'ㅗ + ㅏ의 결합은?' }, options: ['ㅘ', 'ㅝ', 'ㅢ', 'ㅚ'], correct: 0 },
        { question: { en: '한국어 is pronounced as?', ko: '한국어의 발음은?' }, options: ['[한국어]', '[한구거]', '[항국어]', '[한구어]'], correct: 1 },
        { question: { en: 'ㅇ as a coda sounds like?', ko: 'ㅇ 받침 소리는?' }, options: ['silent', 'n', 'ng', 'g'], correct: 2 },
        { question: { en: 'ㄴ + ㅜ = ?', ko: 'ㄴ + ㅜ = ?' }, options: ['나', '노', '누', '느'], correct: 2 },
        { question: { en: '축하 is pronounced as?', ko: '축하의 발음은?' }, options: ['[추카]', '[축하]', '[추하]', '[쭈카]'], correct: 0 },
        { question: { en: 'ㅡ (eu) — how do you make this sound?', ko: 'ㅡ를 어떻게 발음하나요?' }, options: ['Round lips', 'Spread lips sideways', 'Open mouth wide', 'Touch tongue to teeth'], correct: 1 },
      ],
    },
  },
]
