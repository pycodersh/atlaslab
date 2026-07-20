export type OnboardingLanguage =
  | 'ko'
  | 'en'
  | 'es'
  | 'ja'
  | 'zh-cn'
  | 'zh-tw'
  | 'fr'
  | 'de'

type SlideCopy = {
  title: string
  body: string
}

type OnboardingCopy = {
  slide1: SlideCopy
  slide2: SlideCopy
  slide3: SlideCopy
  slide4: SlideCopy
  next: string
  start: string
  skip: string
}

export const ONBOARDING_COPY: Record<OnboardingLanguage, OnboardingCopy> = {
  ko: {
    slide1: {
      title: '영어는 단어가 아니라\n패턴으로 익혀야 합니다.',
      body: '자주 쓰이는 단어의 조합을 익히면\n영어가 더 자연스럽게 나옵니다.',
    },
    slide2: {
      title: '100개의 스토리.\n500개의 패턴.',
      body: '실제 대화 흐름 속에서\n핵심 회화 패턴을 익혀보세요.',
    },
    slide3: {
      title: '5번 듣고.\n10번 읽으세요.',
      body: '반복할수록 패턴은 기억이 아니라\n자연스러운 말하기가 됩니다.',
    },
    slide4: {
      title: 'Challenge로\n내 것으로 만드세요.',
      body: '듣고, 읽고, 직접 완성하면서\n500개의 패턴을 내 영어로 만드세요.',
    },
    next: '다음',
    start: 'PATTO 시작하기',
    skip: '건너뛰기',
  },

  en: {
    slide1: {
      title: 'English is built\nin patterns.',
      body: 'Master common word combinations\nand speak more naturally.',
    },
    slide2: {
      title: '100 stories.\n500 patterns.',
      body: 'Learn essential conversation patterns\ninside real-life story contexts.',
    },
    slide3: {
      title: 'Listen 5 times.\nRead 10 times.',
      body: 'Repeat until patterns become\npart of the way you speak.',
    },
    slide4: {
      title: 'Challenge.\nMake it yours.',
      body: 'Listen, read, and complete challenges\nto turn patterns into fluency.',
    },
    next: 'Next',
    start: 'Start PATTO',
    skip: 'Skip',
  },

  es: {
    slide1: {
      title: 'El inglés se aprende\ncon patrones.',
      body: 'Domina combinaciones frecuentes\ny habla con más naturalidad.',
    },
    slide2: {
      title: '100 historias.\n500 patrones.',
      body: 'Aprende patrones esenciales\ndentro de historias cotidianas.',
    },
    slide3: {
      title: 'Escucha 5 veces.\nLee 10 veces.',
      body: 'Repite hasta que los patrones\nformen parte de tu manera de hablar.',
    },
    slide4: {
      title: 'Reto.\nHazlo tuyo.',
      body: 'Escucha, lee y completa retos\npara convertir patrones en fluidez.',
    },
    next: 'Siguiente',
    start: 'Empezar PATTO',
    skip: 'Omitir',
  },

  ja: {
    slide1: {
      title: '英語は単語ではなく\nパターンで身につける。',
      body: 'よく使う言葉の組み合わせを覚えると\n自然に話しやすくなります。',
    },
    slide2: {
      title: '100のストーリー。\n500のパターン。',
      body: 'リアルな会話の流れの中で\n重要な表現パターンを学びます。',
    },
    slide3: {
      title: '5回聞く。\n10回読む。',
      body: '繰り返すほどパターンが\n自然な発話へ変わります。',
    },
    slide4: {
      title: 'Challengeで\n自分のものに。',
      body: '聞いて、読んで、完成させながら\n500のパターンを定着させます。',
    },
    next: '次へ',
    start: 'PATTOを始める',
    skip: 'スキップ',
  },

  'zh-cn': {
    slide1: {
      title: '英语不是背单词，\n而是掌握表达模式。',
      body: '掌握常用词语组合，\n让英语表达更自然。',
    },
    slide2: {
      title: '100个故事。\n500个表达模式。',
      body: '在真实对话情境中\n学习核心口语表达。',
    },
    slide3: {
      title: '听5遍。\n读10遍。',
      body: '持续重复，让表达模式\n变成自然说出口的英语。',
    },
    slide4: {
      title: '通过挑战，\n真正掌握。',
      body: '听、读、完成挑战，\n把500个表达模式变成你的英语。',
    },
    next: '下一步',
    start: '开始 PATTO',
    skip: '跳过',
  },

  'zh-tw': {
    slide1: {
      title: '英語不是背單字，\n而是掌握表達模式。',
      body: '掌握常用詞語組合，\n讓英語表達更自然。',
    },
    slide2: {
      title: '100個故事。\n500個表達模式。',
      body: '在真實對話情境中\n學習核心口語表達。',
    },
    slide3: {
      title: '聽5遍。\n讀10遍。',
      body: '持續重複，讓表達模式\n變成自然說出口的英語。',
    },
    slide4: {
      title: '透過挑戰，\n真正掌握。',
      body: '聽、讀、完成挑戰，\n把500個表達模式變成你的英語。',
    },
    next: '下一步',
    start: '開始 PATTO',
    skip: '跳過',
  },

  fr: {
    slide1: {
      title: "L'anglais se construit\navec des patterns.",
      body: 'Maîtrisez les combinaisons fréquentes\npour parler plus naturellement.',
    },
    slide2: {
      title: '100 histoires.\n500 patterns.',
      body: 'Apprenez les structures essentielles\ndans des situations de conversation.',
    },
    slide3: {
      title: 'Écoutez 5 fois.\nLisez 10 fois.',
      body: 'Répétez jusqu’à ce que les patterns\ndeviennent naturels à l’oral.',
    },
    slide4: {
      title: 'Challenge.\nFaites-les vôtres.',
      body: 'Écoutez, lisez et relevez les défis\npour gagner en fluidité.',
    },
    next: 'Suivant',
    start: 'Commencer PATTO',
    skip: 'Passer',
  },

  de: {
    slide1: {
      title: 'Englisch lernt man\nin Mustern.',
      body: 'Lerne häufige Wortkombinationen\nund sprich natürlicher.',
    },
    slide2: {
      title: '100 Stories.\n500 Muster.',
      body: 'Lerne wichtige Gesprächsmuster\nin alltagsnahen Geschichten.',
    },
    slide3: {
      title: '5-mal hören.\n10-mal lesen.',
      body: 'Wiederhole, bis die Muster\nzu deiner natürlichen Sprache werden.',
    },
    slide4: {
      title: 'Challenge.\nMach es zu deinem.',
      body: 'Hören, lesen und Aufgaben lösen –\nso werden 500 Muster zu deinem Englisch.',
    },
    next: 'Weiter',
    start: 'PATTO starten',
    skip: 'Überspringen',
  },
}
