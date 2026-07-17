const ko = {
  scene1: {
    words: ['know', 'go', 'have', 'take', 'always', 'want', 'think'],
    question1: '왜 영어는 배웠는데',
    question2: '말이 안 나올까?',
  },
  scene2: {
    text: [
      '단어는 아는데',
      '패턴으로 연결되지 않으면',
      '말이 나오지 않아요.',
    ],
    cards: [
      '단어를 따로따로 기억',
      '연결이 끊어짐',
      '입에서 바로 나오지 않음',
    ],
  },
  scene3: {
    text: [
      'PATTO는',
      '패턴을 연결하고',
      '반복하여',
      '자동으로 말하게 합니다.',
    ],
    cards: [
      '3단계 반복 학습',
      '100개 스토리, 500개 핵심 패턴',
      '과학적인 5회 반복 시스템',
      '자연스러운 영어를 만드는 꾸준한 반복',
    ],
    method: {
      title: 'PATTO Method',
      steps: ['Listen', 'Speak', 'Remember'],
    },
  },
  scene4: {
    title: [
      '반복은 자신감을 만들고,',
      '패턴은 당신의 말이 됩니다.',
    ],
    stats: ['말하기 속도 UP ↑', '정확도 UP ↑', '자신감 UP ↑'],
    speak: ['I can speak', 'naturally!'],
  },
  scene5: {
    lines: [
      '지금, PATTO와 함께',
      '자연스러운 영어의',
      '첫 걸음을 시작하세요.',
    ],
  },
  ep2: {
    scene1: {
      words: ['study', 'go', 'important', 'tiny', 'hard', 'try'],
      sceneLabel: 'SCENE 1',
      title: '문제',
      subtitle: ['단어를 아무리 외워도', '말이 나오지 않나요?'],
      body: ['많이 아는 것과', '말할 수 있는 것은 달라요.'],
      headline: '아는데... 왜 말이 안 나올까?',
    },
    scene2: {
      sceneLabel: 'SCENE 2',
      title: '이유',
      subtitle: ['우리는 단어를 배웠지만,', '원어민은 패턴으로 말해요.'],
      body: ['패턴을 알면,', '순식간에 문장이 나옵니다.'],
      leftLabel: '단어 단위',
      leftWords: ['I', 'am', 'going', 'to', 'leave'],
      leftNote: '조합해야 해서 느려요.',
      rightLabel: '패턴 단위',
      rightSentence: "I'm about to leave.",
      rightNote: '패턴으로 기억해서 바로 나와요!',
    },
    scene3: {
      sceneLabel: 'SCENE 3',
      title: '해결책',
      subtitle: ['PATTO는 꼭 필요한', '패턴만 골라 반복 학습합니다.'],
      body: ['반복할수록 자연스럽게', '입에 붙습니다.'],
      patternLabel: '오늘의 패턴',
      pattern: 'be about to',
      patternMeaning: '~하려고 하다 (바로 ~할 참이다)',
      exampleLabel: '예문',
      example: "I'm about to leave.",
    },
    scene4: {
      sceneLabel: 'SCENE 4',
      title: '예문으로 익히기',
      subtitle: ['하나의 패턴으로', '다양한 상황을 말할 수 있어요.'],
      body: ['패턴이 늘어날수록', '당신의 영어가 달라집니다.'],
      situationLabels: ['상황 ❶ 약속', '상황 ❷ 출발', '상황 ❸ 시작'],
      sentences: [
        "I'm about to meet my friend.",
        "We're about to leave now.",
        "She's about to start the class.",
      ],
    },
    scene5: {
      sceneLabel: 'SCENE 5',
      title: 'PATTO와 함께',
      subtitle: ['패턴을 반복하면,', '영어가 당신의 것이 됩니다.'],
      body: '오늘부터, 패턴으로 말해보세요!',
      cta: 'Repeat patterns, build fluency.',
      stepLabels: ['Listen', 'Speak', 'Remember'],
      stepSubs: ['듣고 이해하고', '따라 말하고', '기억하고 활용하고'],
      bannerValues: ['500+', '5단계', '100', '500+'],
      bannerLabels: ['핵심 패턴', '반복 학습', 'Stories', 'Patterns'],
    },
  },
  ep3: {
    scene1: {
      title: 'PATTO는 패턴으로 가르칩니다.',
      subtitle: '흩어진 단어들이 패턴으로 모입니다.',
      words: ['want', 'to', 'go', 'I', 'need', 'have', 'like', 'try'],
    },
    scene2: {
      title: '단어들이 하나의 덩어리로',
      subtitle: '패턴 하나로 수백 가지 문장이 만들어져요.',
      chunkLabel: '핵심 패턴',
      chunk: 'want to go',
      meaning: '가고 싶다',
    },
    scene3: {
      title: '하나의 패턴, 무한한 문장',
      subtitle: '바꾸는 부분만 다를 뿐, 패턴은 그대로.',
      sentences: [
        'I __want to go__ to the park.',
        'She __want to go__ home early.',
        'We __want to go__ on a trip.',
      ],
      changeLabels: ['to the park', 'home early', 'on a trip'],
    },
    scene4: {
      title: '3단계로 완성하는 패턴 학습',
      subtitle: '듣고 → 말하고 → 기억하면 끝.',
      steps: ['Listen', 'Speak', 'Remember'],
      stepDescs: ['패턴을 듣고 이해한다', '따라 말하며 입에 익힌다', '기억하고 활용한다'],
    },
    scene5: {
      title: 'PATTO',
      slogan1: 'Repeat Patterns.',
      slogan2: 'Build Fluency.',
      sub: '패턴 반복으로 영어가 완성됩니다.',
    },
  },
} as const

export default ko
