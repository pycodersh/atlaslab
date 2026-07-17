const en = {
  scene1: {
    words: ['know', 'go', 'have', 'take', 'always', 'want', 'think'],
    question1: "You studied English, but",
    question2: "why can't you speak?",
  },
  scene2: {
    text: [
      'You know the words,',
      "but without pattern connections,",
      "speech doesn't come out.",
    ],
    cards: [
      'Memorizing words in isolation',
      'Connections keep breaking down',
      "Words don't flow out naturally",
    ],
  },
  scene3: {
    text: [
      'PATTO',
      'links patterns together',
      'through repetition,',
      'so speech becomes automatic.',
    ],
    cards: [
      '3-step learning: listen, repeat, remember',
      '100 stories × 5 patterns = 500 core patterns',
      'Scientific 5-repetition system',
      'Consistent repetition builds natural speech.',
    ],
    method: {
      title: 'PATTO Method',
      steps: ['Listen', 'Speak', 'Remember'],
    },
  },
  scene4: {
    title: [
      'Repetition builds confidence,',
      'patterns become your words.',
    ],
    stats: ['Speaking Speed UP ↑', 'Accuracy UP ↑', 'Confidence UP ↑'],
    speak: ['I can speak', 'naturally!'],
  },
  scene5: {
    lines: [
      'Start your journey',
      'to natural English',
      'with PATTO today.',
    ],
  },
  ep2: {
    scene1: {
      words: ['study', 'go', 'important', 'tiny', 'hard', 'try'],
      sceneLabel: 'SCENE 1',
      title: 'Problem',
      subtitle: ["No matter how many words you study,", "you still can't speak?"],
      body: ['Knowing words', 'and speaking are different.'],
      headline: "I know it... but why can't I speak?",
    },
    scene2: {
      sceneLabel: 'SCENE 2',
      title: 'Why',
      subtitle: ['We learned words,', 'but natives speak in patterns.'],
      body: ['Know the pattern,', 'sentences come out instantly.'],
      leftLabel: 'Word unit',
      leftWords: ['I', 'am', 'going', 'to', 'leave'],
      leftNote: 'Too slow — need to combine.',
      rightLabel: 'Pattern unit',
      rightSentence: "I'm about to leave.",
      rightNote: 'Instant recall from memory!',
    },
    scene3: {
      sceneLabel: 'SCENE 3',
      title: 'Solution',
      subtitle: ['PATTO selects only', 'essential patterns for repetition.'],
      body: ['The more you repeat,', 'the more natural it becomes.'],
      patternLabel: "Today's Pattern",
      pattern: 'be about to',
      patternMeaning: 'be on the verge of doing something',
      exampleLabel: 'Example',
      example: "I'm about to leave.",
    },
    scene4: {
      sceneLabel: 'SCENE 4',
      title: 'Learn by Example',
      subtitle: ['One pattern,', 'countless situations.'],
      body: ['More patterns,', 'better English.'],
      situationLabels: ['① Appointment', '② Departure', '③ Starting'],
      sentences: [
        "I'm about to meet my friend.",
        "We're about to leave now.",
        "She's about to start the class.",
      ],
    },
    scene5: {
      sceneLabel: 'SCENE 5',
      title: 'With PATTO',
      subtitle: ['Repeat patterns,', 'and English becomes yours.'],
      body: 'Start speaking in patterns today!',
      cta: 'Repeat patterns, build fluency.',
      stepLabels: ['Listen', 'Speak', 'Remember'],
      stepSubs: ['Hear & understand', 'Say it aloud', 'Recall & apply'],
      bannerValues: ['500+', '5-step', '100', '500+'],
      bannerLabels: ['Patterns', 'Repetition', 'Stories', 'Examples'],
    },
  },
  ep3: {
    scene1: {
      title: 'PATTO teaches in patterns.',
      subtitle: 'Scattered words come together as patterns.',
      words: ['want', 'to', 'go', 'I', 'need', 'have', 'like', 'try'],
    },
    scene2: {
      title: 'Words become one chunk',
      subtitle: 'One pattern creates hundreds of sentences.',
      chunkLabel: 'Core Pattern',
      chunk: 'want to go',
      meaning: 'desire to go somewhere',
    },
    scene3: {
      title: 'One pattern, endless sentences',
      subtitle: 'Only the variable part changes — the pattern stays.',
      sentences: [
        'I __want to go__ to the park.',
        'She __want to go__ home early.',
        'We __want to go__ on a trip.',
      ],
      changeLabels: ['to the park', 'home early', 'on a trip'],
    },
    scene4: {
      title: '3-step pattern learning',
      subtitle: 'Listen → Speak → Remember. Done.',
      steps: ['Listen', 'Speak', 'Remember'],
      stepDescs: ['Hear & understand the pattern', 'Say it aloud to build muscle memory', 'Recall & apply naturally'],
    },
    scene5: {
      title: 'PATTO',
      slogan1: 'Repeat Patterns.',
      slogan2: 'Build Fluency.',
      sub: 'Master English through pattern repetition.',
    },
  },
} as const

export default en
