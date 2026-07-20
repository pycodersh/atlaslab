export type OnboardingLanguage =
  | 'ko' | 'en' | 'es' | 'ja' | 'zh-cn' | 'zh-tw' | 'fr' | 'de'

type SlideCopy = { title: string; body: string }
type OnboardingCopy = {
  slide1: SlideCopy
  slide2: SlideCopy
  slide3: SlideCopy
  slide4: SlideCopy
  start: string
}

export const ONBOARDING_COPY: Record<OnboardingLanguage, OnboardingCopy> = {
  ko: {
    slide1: { title: '영어는 단어가 아니라\n패턴으로 익혀야 합니다.', body: '실제 대화에서 반복되는 표현을 익히면\n영어가 더 자연스럽게 나옵니다.' },
    slide2: { title: '100개의 스토리.\n500개의 패턴.', body: '일상부터 특별한 순간까지,\n스토리 속에서 핵심 패턴을 익혀보세요.' },
    slide3: { title: '5번 듣고.\n10번 읽으세요.', body: '들을수록, 읽을수록\n패턴은 자연스러운 말하기가 됩니다.' },
    slide4: { title: 'Challenge.\nStrengthen.\nSpeak naturally.', body: '듣고, 읽고, 직접 완성하면서\n배운 패턴을 내 영어로 만드세요.' },
    start: 'PATTO 시작하기',
  },
  en: {
    slide1: { title: 'English is\nbuilt in patterns.', body: 'Master real patterns\nand speak naturally.' },
    slide2: { title: '100 stories.\n500 patterns.', body: 'From daily life to special moments,\nlearn step by step.' },
    slide3: { title: 'Listen 5 times.\nRead 10 times.', body: 'The more you listen and read,\nthe more natural it becomes.' },
    slide4: { title: 'Challenge.\nStrengthen.\nSpeak naturally.', body: 'Practice, review, and speak out.\nMake it yours.' },
    start: 'Start PATTO',
  },
  es: {
    slide1: { title: 'El inglés se aprende\ncon patrones.', body: 'Domina patrones reales\ny habla con naturalidad.' },
    slide2: { title: '100 historias.\n500 patrones.', body: 'De la vida diaria a momentos especiales,\naprende paso a paso.' },
    slide3: { title: 'Escucha 5 veces.\nLee 10 veces.', body: 'Cuanto más escuches y leas,\nmás natural será.' },
    slide4: { title: 'Desafía.\nRefuerza.\nHabla con naturalidad.', body: 'Practica, repasa y habla.\nHazlo tuyo.' },
    start: 'Empezar PATTO',
  },
  ja: {
    slide1: { title: '英語は単語ではなく\nパターンで身につける。', body: '実際の会話で使うパターンを覚えて\n自然に話せるように。' },
    slide2: { title: '100のストーリー。\n500のパターン。', body: '日常から特別な場面まで、\nストーリーで少しずつ学びます。' },
    slide3: { title: '5回聞く。\n10回読む。', body: '聞いて読むほど\n自然な英語に変わっていきます。' },
    slide4: { title: 'Challenge.\nStrengthen.\nSpeak naturally.', body: '聞いて、読んで、挑戦して\n学んだパターンを自分の英語に。' },
    start: 'PATTOを始める',
  },
  'zh-cn': {
    slide1: { title: '英语不是背单词，\n而是掌握表达模式。', body: '掌握真实会话中的常用表达，\n说英语会更自然。' },
    slide2: { title: '100个故事。\n500个表达模式。', body: '从日常到特别时刻，\n在故事中一步步学习。' },
    slide3: { title: '听5遍。\n读10遍。', body: '听得越多、读得越多，\n表达就越自然。' },
    slide4: { title: '挑战。\n巩固。\n自然表达。', body: '听、读、完成挑战，\n把学到的表达变成你的英语。' },
    start: '开始 PATTO',
  },
  'zh-tw': {
    slide1: { title: '英語不是背單字，\n而是掌握表達模式。', body: '掌握真實對話中的常用表達，\n說英語會更自然。' },
    slide2: { title: '100個故事。\n500個表達模式。', body: '從日常到特別時刻，\n在故事中一步步學習。' },
    slide3: { title: '聽5遍。\n讀10遍。', body: '聽得越多、讀得越多，\n表達就越自然。' },
    slide4: { title: '挑戰。\n鞏固。\n自然表達。', body: '聽、讀、完成挑戰，\n把學到的表達變成你的英語。' },
    start: '開始 PATTO',
  },
  fr: {
    slide1: { title: "L'anglais se construit\navec des patterns.", body: 'Maîtrisez de vraies structures\net parlez naturellement.' },
    slide2: { title: '100 histoires.\n500 patterns.', body: 'Du quotidien aux moments spéciaux,\napprenez pas à pas.' },
    slide3: { title: 'Écoutez 5 fois.\nLisez 10 fois.', body: 'Plus vous écoutez et lisez,\nplus cela devient naturel.' },
    slide4: { title: 'Challenge.\nRenforcez.\nParlez naturellement.', body: 'Pratiquez, révisez et parlez.\nFaites-les vôtres.' },
    start: 'Commencer PATTO',
  },
  de: {
    slide1: { title: 'Englisch lernt man\nin Mustern.', body: 'Lerne echte Sprachmuster\nund sprich natürlicher.' },
    slide2: { title: '100 Stories.\n500 Muster.', body: 'Vom Alltag bis zu besonderen Momenten,\nSchritt für Schritt.' },
    slide3: { title: '5-mal hören.\n10-mal lesen.', body: 'Je öfter du hörst und liest,\ndesto natürlicher wird es.' },
    slide4: { title: 'Challenge.\nFestigen.\nNatürlich sprechen.', body: 'Üben, wiederholen und sprechen.\nMach es zu deinem.' },
    start: 'PATTO starten',
  },
}
