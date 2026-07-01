// ── Editor's Notes — PATTO ────────────────────────────────────────────────────
// 30 editorial essays on language acquisition and PATTO's philosophy.
// Written as a connected small book: read 1–30 to understand how language works.

export type IllustrationType =
  | 'lightbulb'
  | 'coffee'
  | 'book'
  | 'brain'
  | 'pattern'
  | 'speech'
  | 'pen'
  | 'wave'
  | 'eye'
  | 'clock'

export type ResearchRef = {
  author: string
  title: string
  year: number
  brief: string
}

export type EditorNote = {
  id: number
  part: 1 | 2 | 3
  partTitle: string
  title: string
  readTimeSec: number
  illustration: IllustrationType
  body: string[]         // editorial paragraphs
  research: ResearchRef[]
  oneThingToRemember: string
}

export const EDITOR_NOTES: EditorNote[] = [

  // ── PART 1: The Nature of Language ────────────────────────────────────────

  {
    id: 1,
    part: 1,
    partTitle: 'The Nature of Language',
    title: 'Why Translation Slows You Down',
    readTimeSec: 40,
    illustration: 'brain',
    body: [
      'When you hear the word "apple," what happens? If you\'re a native English speaker, nothing much. The word arrives, and you understand it. There is no gap, no middle step.',
      'But for most language learners, something else happens. The word arrives in English, gets converted into your native language, and then you understand it. That conversion is the problem.',
      'This extra step — translation — is not just slow. It\'s exhausting. Every sentence becomes a math equation you have to solve. And by the time you\'ve solved one, the speaker has moved on to the next.',
      'Research in cognitive psychology calls this processing load. The more cognitive resources you spend on converting language, the fewer you have for actually understanding what\'s being said. Translation doesn\'t help you comprehend faster. It keeps you permanently one step behind.',
      'Native speakers don\'t translate because they never had to. They learned English by experiencing it directly. A dog was always "dog." Coffee was always "coffee." The concept and the word arrived together, as a single unit.',
      'This is what PATTO is built on. Not translation. Direct recognition. When you read a pattern enough times in context, it stops being foreign. It becomes familiar. And familiarity is where fluency lives.',
    ],
    research: [
      {
        author: 'John Sweller',
        title: 'Cognitive Load Theory',
        year: 1988,
        brief: 'Mental resources are finite. Translation uses up resources that should be used for comprehension.',
      },
      {
        author: 'Stephen Krashen',
        title: 'The Input Hypothesis',
        year: 1982,
        brief: 'Acquisition happens when we receive input we understand directly — not through conscious translation.',
      },
    ],
    oneThingToRemember: "Don't translate. Recognize.",
  },

  {
    id: 2,
    part: 1,
    partTitle: 'The Nature of Language',
    title: 'English Isn\'t Mathematics',
    readTimeSec: 35,
    illustration: 'pattern',
    body: [
      'We were taught English as if it were a system of rules. Subject + verb + object. Add -ed for past tense. Use "a" before consonants, "an" before vowels.',
      'Then we discovered exceptions. "I went," not "I goed." "An hour," not "a hour." And we assumed we hadn\'t learned enough rules yet.',
      'But language doesn\'t work that way. Rules in language are descriptions of what people tend to do — not laws of what they must do. The "rules" of English are someone\'s attempt to describe patterns that evolved over a thousand years without any designer in charge.',
      'Mathematics has proofs. Language has tendencies. Mathematics is closed. Language is alive.',
      'This matters because it changes what you should practice. In math, you master a rule and apply it. In language, you encounter a pattern so many times that it becomes instinct. You don\'t apply "I went" — you simply know it. The knowing comes from exposure, not from memorizing an exception list.',
      'When you stop looking for the rule behind every sentence and start noticing what feels natural, something shifts. You stop solving and start sensing. That shift is the beginning of real fluency.',
    ],
    research: [
      {
        author: 'Paul Nation',
        title: 'Learning Vocabulary in Another Language',
        year: 2001,
        brief: 'Frequency of exposure, not rule memorization, determines how well vocabulary and patterns are retained.',
      },
    ],
    oneThingToRemember: 'Learn what\'s common, not what\'s correct.',
  },

  {
    id: 3,
    part: 1,
    partTitle: 'The Nature of Language',
    title: 'Patterns Before Grammar',
    readTimeSec: 35,
    illustration: 'pattern',
    body: [
      'A child learning their first language never studies grammar. No one sits a three-year-old down and explains verb conjugation. Yet by age four, most children are using language with remarkable accuracy.',
      'How? Patterns. Children hear "I go," "she goes," "they go" hundreds of times before they ever learn that this is called subject-verb agreement. They feel the pattern before they can name it.',
      'This is not a coincidence. It is how the human brain acquires language. The brain is a pattern-recognition machine. It extracts regularities from input without being explicitly taught what to look for.',
      '"I don\'t know what I\'m doing" is one pattern. "What are you talking about?" is another. You don\'t need to analyze them. You need to encounter them — repeatedly, in context — until they feel like your own.',
      'Grammar comes after patterns, not before them. Grammar is what linguists write after observing what speakers actually do. It is a description of the patterns, not the source of them.',
      'This is why PATTO leads with stories and patterns, not grammar tables. Not because grammar is wrong. But because for the brain, patterns come first. Always.',
    ],
    research: [
      {
        author: 'Nick Ellis',
        title: 'Frequency Effects in Language Processing',
        year: 2002,
        brief: 'Language acquisition is fundamentally statistical. The brain tracks frequency and extracts patterns automatically.',
      },
    ],
    oneThingToRemember: 'Trust the pattern. Question the rule.',
  },

  {
    id: 4,
    part: 1,
    partTitle: 'The Nature of Language',
    title: 'Why Stories Matter',
    readTimeSec: 40,
    illustration: 'book',
    body: [
      'Consider two ways to learn the phrase "I couldn\'t help but notice." One: write it in a notebook twenty times. Two: read a story where a character says it to someone they\'ve been quietly watching.',
      'The second one stays.',
      'This is not a matter of preference. It is a matter of how memory works. The brain stores information in networks. When a phrase is embedded in a story — in a scene, with characters, with emotion — it connects to dozens of other stored memories. Those connections make retrieval effortless.',
      'A flashcard is an island. A story is a map. Every phrase in a story is connected to the phrases around it, to the situation, to the feeling of the moment. When you encounter that phrase again in real life, the whole map activates at once.',
      'Language was born in stories. Before writing existed, humans transmitted knowledge, culture, and identity through narrative. The brain did not evolve for flashcards. It evolved to understand and remember stories.',
      'Every story you read in PATTO is not just a vehicle for patterns. It is the pattern\'s natural home. You are not studying language. You are living it for a few minutes at a time.',
    ],
    research: [
      {
        author: 'Jerome Bruner',
        title: 'Actual Minds, Possible Worlds',
        year: 1986,
        brief: 'Narrative is one of the two fundamental modes of human thought. It is also the most powerful memory structure we have.',
      },
      {
        author: 'Gordon Bower',
        title: 'Mood and Memory',
        year: 1981,
        brief: 'Emotional context dramatically improves memory encoding. Stories create emotion; lists do not.',
      },
    ],
    oneThingToRemember: 'A story remembered is a lesson learned.',
  },

  {
    id: 5,
    part: 1,
    partTitle: 'The Nature of Language',
    title: 'Language Is Experience',
    readTimeSec: 38,
    illustration: 'coffee',
    body: [
      'Close your eyes and think of the word "coffee." What comes up? For most people, it\'s not a definition. It\'s something closer to a sensation — warmth, a smell, a morning, a feeling.',
      'Language is not a code for reality. Language is tied to experience. Every word carries the weight of every time you\'ve encountered what it represents.',
      'This is why translation is never perfect. When you translate "커피" into "coffee," you\'re not moving between two identical containers. The word "coffee" carries decades of English-speaking culture inside it. Morning rituals. Coffee shop conversations. The smell of a New York diner. "커피" carries something different.',
      'You don\'t learn the full meaning of an English word by reading its definition. You learn it by encountering it in context, repeatedly, across different situations, until it starts to carry its own weight in your memory.',
      'This is also why immersion works. Not because you hear more English — but because you start having experiences in English. Emotions, reactions, thoughts in the language. The language stops being foreign when it starts carrying your experiences.',
      'Every story in PATTO is a small experience. A moment. A scene. The goal is not to teach you what words mean. It\'s to give you memories in English.',
    ],
    research: [
      {
        author: 'Eleanor Rosch',
        title: 'Cognitive Representations of Semantic Categories',
        year: 1975,
        brief: 'Words are not stored as definitions. They are stored as prototypes — mental images built from experience.',
      },
    ],
    oneThingToRemember: 'Experience English. Don\'t study it.',
  },

  {
    id: 6,
    part: 1,
    partTitle: 'The Nature of Language',
    title: 'The Grammar Illusion',
    readTimeSec: 35,
    illustration: 'pen',
    body: [
      'There is a widely shared belief about language learning: if you understand the grammar, you can speak the language. Study enough rules, pass enough tests, and fluency will follow.',
      'It doesn\'t.',
      'We know this because we can observe people who score perfectly on grammar tests but can\'t hold a five-minute conversation. And we can observe native speakers who couldn\'t pass a grammar test but speak fluidly and precisely.',
      'Understanding grammar is like understanding how an engine works. Useful knowledge. But it doesn\'t mean you can drive. Driving requires a different kind of knowing — muscle memory, spatial intuition, automatic response — built through hours of practice, not hours of studying car manuals.',
      'Grammar tells you what\'s possible. Experience tells you what\'s natural. "It is I" is grammatically correct. "It\'s me" is what everyone says. If your goal is to communicate, the second matters more.',
      'Studying grammar gives you a map. But you learn a city by walking its streets, not by memorizing its layout. At some point, the map has to become something you no longer need to look at.',
    ],
    research: [
      {
        author: 'Stephen Krashen',
        title: 'Principles and Practice in Second Language Acquisition',
        year: 1982,
        brief: 'Consciously learned grammar rules play a limited role in actual language production. Acquisition comes from input, not instruction.',
      },
    ],
    oneThingToRemember: 'Stop correcting. Start feeling.',
  },

  {
    id: 7,
    part: 1,
    partTitle: 'The Nature of Language',
    title: 'A Word Is Never Just a Word',
    readTimeSec: 38,
    illustration: 'speech',
    body: [
      'Open any English-Korean dictionary and look up the word "sorry." You\'ll find a translation. But what you won\'t find is everything else that word carries.',
      'In English, "sorry" can mean sympathy ("I\'m sorry for your loss"), apology ("I\'m sorry I was late"), surprise ("Sorry?"), or refusal ("Sorry, I can\'t"). The same word, said differently, means four completely different things.',
      'Vocabulary is an iceberg. The definition is the part above the water. Below it: tone, register, cultural context, implied meaning, what it signals about the speaker, when it\'s appropriate, when it\'s not.',
      'This is why learning vocabulary from lists fails so reliably. You learn the definition. You miss the iceberg. You use the word, and something feels slightly wrong, and you don\'t know why.',
      'Context doesn\'t just help you remember a word. It teaches you the whole word — the part below the surface. When you read "sorry" in different situations, across different stories, used by different characters, you begin to feel its full range. And that feeling is what makes language natural.',
      'Every vocabulary word you know from a list is a word you half-know. Every word you know from a story is a word you actually know.',
    ],
    research: [
      {
        author: 'Paul Nation',
        title: 'High Frequency Vocabulary and Reading',
        year: 2006,
        brief: 'Full knowledge of a word — including its collocations, register, and connotations — requires multiple encounters in varied contexts.',
      },
    ],
    oneThingToRemember: 'Learn words in context. Always.',
  },

  {
    id: 8,
    part: 1,
    partTitle: 'The Nature of Language',
    title: 'What a Pattern Really Is',
    readTimeSec: 36,
    illustration: 'pattern',
    body: [
      'When a native speaker hears "What do you think about —", they don\'t hear five separate words. They hear one unit. The words have merged into a single chunk, stored and retrieved together.',
      'This is what a pattern is. Not a collection of words. A compressed unit of meaning that the brain treats as a single piece.',
      'George Miller, a cognitive psychologist, famously showed that working memory can hold about seven items at once — plus or minus two. The trick is that a "chunk" counts as one item, regardless of its actual length.',
      '"What do you think about that?" is one chunk. "I\'m not sure what you mean" is one chunk. Fluent speakers are not processing more words per second than beginners. They are processing more chunks. And chunks compress the load.',
      'This is why native speakers can carry on a conversation while making coffee, or thinking about something else. Most of what they\'re saying is retrieved, not constructed. The patterns are already assembled.',
      'When you practice a pattern until it becomes automatic, you are building a chunk. You are compressing something that used to require effort into something that requires none. This is not repetition for the sake of repetition. It is the actual mechanism of fluency.',
    ],
    research: [
      {
        author: 'George Miller',
        title: 'The Magical Number Seven, Plus or Minus Two',
        year: 1956,
        brief: 'Working memory is limited in capacity, but chunking allows us to hold more information by grouping it into meaningful units.',
      },
    ],
    oneThingToRemember: 'One pattern is worth ten vocabulary words.',
  },

  {
    id: 9,
    part: 1,
    partTitle: 'The Nature of Language',
    title: 'Reading Without Thinking',
    readTimeSec: 34,
    illustration: 'book',
    body: [
      'There is a particular experience that readers in their native language know well. You are deep in a book and you suddenly realize you\'ve been reading for two hours without noticing. You were not aware of the words. You were only aware of the story.',
      'That is what fluency feels like from the inside.',
      'When you first learn to drive, every action is conscious. Mirror, signal, brake, gear. You think about every move. Then, years later, you arrive at your destination and barely remember the drive. The mechanics became automatic.',
      'Language fluency works the same way. In the beginning, you notice the language. You decode each sentence. Over time, with enough exposure, the decoding becomes invisible. You stop noticing the words and start noticing only what they mean.',
      'This shift — from noticing language to noticing meaning — is the most significant threshold in language acquisition. It doesn\'t happen through a single study session. It happens gradually, through thousands of hours of comprehensible input, until the processing becomes automatic.',
      'Every story you read in PATTO is practice in this direction. Not studying English. Reading in English — and one day, reading without thinking about English at all.',
    ],
    research: [
      {
        author: 'David LaBerge & S. Jay Samuels',
        title: 'Toward a Theory of Automatic Information Processing in Reading',
        year: 1974,
        brief: 'Reading fluency develops when decoding becomes automatic, freeing cognitive resources for comprehension.',
      },
    ],
    oneThingToRemember: 'Read until you forget you\'re reading.',
  },

  {
    id: 10,
    part: 1,
    partTitle: 'The Nature of Language',
    title: 'The Voice in Your Head',
    readTimeSec: 37,
    illustration: 'brain',
    body: [
      'Right now, as you read this, there is a voice in your head. It is probably reading in Korean. And that voice — that internal narrator — is one of the most significant barriers between you and English fluency.',
      'Language learners often describe a specific moment of breakthrough: the first time they had a dream in English, or the first time they caught themselves thinking in English before translating. These moments feel remarkable because they are. They signal that the internal voice has started to shift.',
      'The internal voice is not just a quirk of consciousness. It shapes how we process everything. When your internal voice speaks Korean, you are fundamentally operating in Korean — translating in and out of English as needed. That is tiring, slow, and always one step removed.',
      'The shift doesn\'t happen by trying to "think in English." That effort is usually forced and awkward. It happens through enough exposure that English starts to feel like a natural channel for thought — not a foreign one you switch into.',
      'Start small. When you see a color, name it in English. When you think of an object, try the English word first. Not as a translation exercise — but as a tiny attempt to let English become part of how you see the world.',
      'The voice follows the experience. Give it enough English experiences, and it starts reaching for English on its own.',
    ],
    research: [
      {
        author: 'François Grosjean',
        title: 'Bilingual: Life and Reality',
        year: 2010,
        brief: 'Bilinguals shift dominant language based on context. The more comfortable the context, the more natural the switch.',
      },
    ],
    oneThingToRemember: 'Change the voice. Change the language.',
  },

  // ── PART 2: How the Brain Learns ──────────────────────────────────────────

  {
    id: 11,
    part: 2,
    partTitle: 'How the Brain Learns',
    title: 'Why Repetition Isn\'t Enough',
    readTimeSec: 38,
    illustration: 'clock',
    body: [
      'Most people assume that the more times you encounter something, the better you remember it. This is true — but only partially. What matters is not just how often you repeat something, but how you repeat it.',
      'Passive repetition — reading the same flashcard, hearing the same audio, scrolling through the same word list — creates familiarity, not memory. You know you\'ve seen it before. But when you need to retrieve it, nothing comes.',
      'Cognitive scientists call this the "fluency illusion." Something feels familiar, so we assume we know it. But familiarity and retrievability are completely different things. You might recognize a word but still fail to produce it when you need it.',
      'The key distinction is between recognition and retrieval. Recognition is passive — it fires when you see something again. Retrieval is active — it fires when you need to produce something from scratch. Fluency requires retrieval.',
      'To build retrievable memory, you need to practice retrieving it. Close the book and try to recall. Answer a question before you see the answer. The effort of retrieval — even when you fail — is what makes memory durable.',
      'This is why PATTO\'s review system asks you to recall before showing the answer. The difficulty is not a flaw. It is the mechanism.',
    ],
    research: [
      {
        author: 'Henry Roediger & Jeffrey Karpicke',
        title: 'Test-Enhanced Learning',
        year: 2006,
        brief: 'Retrieval practice produces greater long-term retention than repeated study, even when initial performance looks the same.',
      },
    ],
    oneThingToRemember: "Don't review. Recall.",
  },

  {
    id: 12,
    part: 2,
    partTitle: 'How the Brain Learns',
    title: 'Active Recall',
    readTimeSec: 36,
    illustration: 'brain',
    body: [
      'Here is a counterintuitive finding from memory research: being tested on material improves retention far more than reading that material again. Not slightly more. Dramatically more.',
      'This is called the testing effect, or retrieval practice effect. And it works even when you get the answer wrong. The act of attempting retrieval — of searching for an answer — strengthens the memory trace more than passive review.',
      'Why? Because retrieval is reconstruction. Every time you pull a memory out of storage, you rebuild it slightly. That rebuilding process makes it stronger, more interconnected, more retrievable in the future.',
      'The implication for language learning is significant. Reading through vocabulary lists, even carefully, leaves weak traces. Trying to remember a word before checking, even imperfectly, builds strong ones.',
      'This is also why the difficulty of recall is not a problem to be reduced. The effort is the point. Cognitive scientists call this a "desirable difficulty" — harder to do in the moment, but dramatically better in the long run.',
      'When you review in PATTO and have to think before you see the answer, you are not struggling because you haven\'t learned enough. You are struggling because that struggle is what learning is.',
    ],
    research: [
      {
        author: 'Robert Bjork',
        title: 'Memory and Metamemory Considerations in the Training of Human Beings',
        year: 1994,
        brief: 'Desirable difficulties — challenges that slow learning in the short term — dramatically improve long-term retention.',
      },
    ],
    oneThingToRemember: 'Close the book. Try to remember.',
  },

  {
    id: 13,
    part: 2,
    partTitle: 'How the Brain Learns',
    title: 'Context Beats Memorization',
    readTimeSec: 37,
    illustration: 'book',
    body: [
      'There is a research finding that surprises almost everyone who hears it: learning vocabulary from word lists is significantly less effective than learning the same words in context.',
      'Not slightly less effective. Paul Nation\'s research suggests words learned in rich contexts are retained at roughly three times the rate of words learned in isolation. Three times.',
      'The reason is how memory actually works. The brain doesn\'t store isolated pieces of information. It stores networks. Every memory is a node connected to other nodes — to the context in which it was learned, to the emotions present at the time, to the other information encountered simultaneously.',
      'A word on a list has one connection: its definition. A word in a story has dozens: the scene, the character, the emotion, the surrounding sentences, the word before and after it. That network is what retrieval pulls on.',
      'Think of it like anchoring a boat. One anchor holds reasonably well. Five anchors in different directions, and nothing is moving that boat. Context is what provides the extra anchors.',
      'When you read a story in PATTO and encounter a pattern in a scene — not on a list — you are building a network, not planting a single flag. That network is what survives.',
    ],
    research: [
      {
        author: 'Paul Nation',
        title: 'Learning Vocabulary in Another Language',
        year: 2001,
        brief: 'Contextual vocabulary acquisition is significantly more effective than decontextualized word learning.',
      },
    ],
    oneThingToRemember: 'Context creates memory. Lists don\'t.',
  },

  {
    id: 14,
    part: 2,
    partTitle: 'How the Brain Learns',
    title: 'Spaced Repetition',
    readTimeSec: 39,
    illustration: 'clock',
    body: [
      'In 1885, Hermann Ebbinghaus charted what happens to a memory over time. Without review, memory declines rapidly — 50% gone within an hour, 70% within a day. He called this the forgetting curve.',
      'But Ebbinghaus also found something more useful: every time you successfully recall something before it disappears completely, the forgetting curve resets — and becomes shallower. The memory lasts longer before the next review is needed.',
      'This is the logic of spaced repetition. Review something once, and it lasts a day. Review it again, and it lasts a week. Again, a month. The intervals grow with each successful recall, until the memory becomes near-permanent.',
      'The critical detail: the timing matters. Reviewing immediately after learning produces little benefit. Reviewing just before you forget produces the maximum benefit. The ideal moment to review is the moment you\'re on the edge of forgetting.',
      'This is what PATTO\'s SRS system calculates. It is not scheduling reviews arbitrarily. It is finding the precise moment when retrieval is difficult enough to strengthen memory, but not so late that the memory is already gone.',
      'The result feels harder in the short term. You sometimes struggle to recall things you thought you knew. That struggle is not failure. It is the system working exactly as designed.',
    ],
    research: [
      {
        author: 'Hermann Ebbinghaus',
        title: 'Über das Gedächtnis (Memory: A Contribution to Experimental Psychology)',
        year: 1885,
        brief: 'The forgetting curve and the spacing effect — foundational research showing that spaced review dramatically outperforms massed practice.',
      },
    ],
    oneThingToRemember: 'Review before you forget completely.',
  },

  {
    id: 15,
    part: 2,
    partTitle: 'How the Brain Learns',
    title: 'Why Images Help Memory',
    readTimeSec: 36,
    illustration: 'lightbulb',
    body: [
      'When you encounter the phrase "the sun was setting behind the mountains," your brain doesn\'t just store the words. It generates an image — light, color, silhouette. That image is stored separately from the words, in a different part of the brain.',
      'This is the basis of dual coding theory, developed by Allan Paivio in the 1970s. Language is encoded verbally. But it is also encoded visually, emotionally, spatially. The more encoding channels activated, the stronger and more durable the memory.',
      'This is one reason why reading stories is more effective than studying word lists. Stories generate mental images. They activate the visual encoding channel that lists leave dormant. Every scene you picture is another layer of encoding.',
      'It also explains why abstract language is harder to retain. "Ambiguity" is harder to picture than "rain." "Conceptual" resists imagery in a way that "brick wall" does not. Abstract concepts need to be anchored to concrete images before they stick.',
      'When you read in PATTO and notice that you\'ve formed a mental picture of the scene — a character in a coffee shop, a conversation in a car — that picture is not a distraction. It is your brain building a second memory system for the same content.',
      'Read visually. See the story as you read it. The image and the language will reinforce each other.',
    ],
    research: [
      {
        author: 'Allan Paivio',
        title: 'Dual Coding Theory and Education',
        year: 1991,
        brief: 'Information stored in both verbal and visual codes is recalled more reliably than information stored in one code alone.',
      },
    ],
    oneThingToRemember: 'See the word. Don\'t just read it.',
  },

  {
    id: 16,
    part: 2,
    partTitle: 'How the Brain Learns',
    title: 'Why Speaking Changes Memory',
    readTimeSec: 37,
    illustration: 'wave',
    body: [
      'Reading and speaking use different parts of the brain. This is not a minor distinction. It is the reason why people who can read English well still struggle to speak it — and why reading alone is never enough.',
      'When you speak, you are doing something different from when you read. You are producing language, not just recognizing it. And production reveals gaps that recognition conceals.',
      'Merrill Swain, a Canadian applied linguist, called this the output hypothesis. Her research showed that learners who were only exposed to input — reading, listening — acquired some language naturally. But learners who also had to produce output — speak, write — acquired more, and retained it longer.',
      'The act of production forces your brain to do something recognition never requires: retrieve the pattern under pressure, assemble it in real time, and notice when it doesn\'t come. That noticing — the gap between what you wanted to say and what you could say — is itself a learning signal.',
      'This is why reading a pattern silently and reading it aloud are not equivalent. Saying "I was wondering if you could..." out loud activates motor memory, auditory feedback, and production circuits that silent reading never touches.',
      'Read aloud when you can. Not because it\'s more serious. Because it\'s more complete.',
    ],
    research: [
      {
        author: 'Merrill Swain',
        title: 'The Output Hypothesis: Theory and Research',
        year: 1995,
        brief: 'Language output — speaking and writing — produces acquisition that input alone does not, by forcing learners to process language more deeply.',
      },
    ],
    oneThingToRemember: 'Say it out loud. Something changes.',
  },

  {
    id: 17,
    part: 2,
    partTitle: 'How the Brain Learns',
    title: 'Emotion and Memory',
    readTimeSec: 35,
    illustration: 'lightbulb',
    body: [
      'Think back to the most vivid memory you have from five years ago. Chances are, it involves a strong emotion — surprise, joy, fear, or loss. The memory is clear not despite the emotion, but because of it.',
      'The amygdala — the brain\'s emotional processing center — flags emotionally significant events for enhanced encoding. It signals the hippocampus to pay extra attention and store this more deeply. Emotion is the brain\'s natural highlighter.',
      'This matters for language learning because it means that boring material is not just unpleasant — it is harder to remember. Content that engages you emotionally, that surprises you, that moves you, gets encoded more deeply and retrieved more reliably.',
      'This is one of the strongest arguments for learning through stories rather than through exercises. Exercises are emotionally neutral. Stories are not. A well-written scene carries tension, humor, longing, regret. That emotional charge is what makes the language in it stick.',
      'It also means that what you find interesting matters. If you force yourself to read content you find completely dull, you are working against your own neurology. Finding material you actually care about is not a luxury. It is a learning strategy.',
      'Engagement is not a reward for learning. It is a condition for it.',
    ],
    research: [
      {
        author: 'James McGaugh',
        title: 'Memory and Emotion: The Making of Lasting Memories',
        year: 2003,
        brief: 'Emotionally arousing experiences are remembered better because the amygdala modulates memory consolidation in the hippocampus.',
      },
    ],
    oneThingToRemember: "If it moves you, you'll remember it.",
  },

  {
    id: 18,
    part: 2,
    partTitle: 'How the Brain Learns',
    title: 'The Testing Effect',
    readTimeSec: 34,
    illustration: 'pen',
    body: [
      'In 2006, Roediger and Karpicke ran an experiment. They had students study a passage in two different ways. Group A read the passage four times. Group B read it once, then was tested on it three times.',
      'A week later, Group B remembered 50% more.',
      'This result was striking enough that it changed how psychologists think about memory. The act of retrieval — of pulling something out of memory — is not a neutral measurement of what you know. It is itself a powerful act of learning.',
      'Every time you retrieve a memory, you rebuild it. You pull the pattern out, examine it briefly, and put it back — slightly stronger, slightly more connected. The retrieval process is also the reinforcement process.',
      'This has an uncomfortable implication: studying for an exam by reading your notes is far less effective than being tested on them. The test is not something you do after you\'ve learned. The test is how you learn.',
      'In PATTO, every review session is a testing event. You are not checking what you know. You are building what you know. The difficulty you feel when trying to recall is not a sign that the system is too hard. It is the sign that the system is working.',
    ],
    research: [
      {
        author: 'Henry Roediger & Jeffrey Karpicke',
        title: 'The Power of Testing Memory',
        year: 2006,
        brief: 'Retrieval practice produces more durable long-term memory than restudying the same material.',
      },
    ],
    oneThingToRemember: 'The test IS the study.',
  },

  {
    id: 19,
    part: 2,
    partTitle: 'How the Brain Learns',
    title: 'Sleep and Language',
    readTimeSec: 36,
    illustration: 'wave',
    body: [
      'There is a moment in language learning that many people report: they go to sleep having struggled with a concept, and wake up the next morning finding it somehow clearer. This is not magical thinking. It is neuroscience.',
      'During sleep — particularly during slow-wave and REM sleep — the brain consolidates the day\'s learning. New memories, still fragile and unstable after initial encoding, are replayed, reorganized, and transferred into long-term storage. Sleep is not the absence of learning. It is part of the learning process.',
      'Matthew Walker\'s research showed that sleep-deprived subjects retained approximately 40% less than those who slept adequately. Not a modest difference. Almost half the learning was lost.',
      'For language learning specifically, this matters because patterns need consolidation to become automatic. You can practice a phrase until it feels almost natural during a session. But the final step — from almost natural to truly automatic — happens during sleep.',
      'This also means that late-night cramming is one of the least efficient ways to study. You are encoding material at a time when consolidation will be poorest, and you are depleting the sleep that would have reinforced that morning\'s learning.',
      'Short, consistent daily practice followed by adequate sleep beats long, exhausting sessions every time.',
    ],
    research: [
      {
        author: 'Matthew Walker',
        title: 'Why We Sleep',
        year: 2017,
        brief: 'Sleep plays an active role in memory consolidation. Sleep deprivation reduces memory retention by approximately 40%.',
      },
    ],
    oneThingToRemember: 'Sleep is part of the lesson.',
  },

  {
    id: 20,
    part: 2,
    partTitle: 'How the Brain Learns',
    title: 'How Mistakes Help',
    readTimeSec: 37,
    illustration: 'brain',
    body: [
      'There is a particular kind of moment that feels terrible but turns out to be one of the most powerful learning events possible: making a confident prediction, and being wrong.',
      'When the brain predicts and the prediction fails, it generates what neuroscientists call a prediction error signal. This signal doesn\'t just log the failure. It activates a learning response — a cascade of neural activity that updates the model, adjusts the expectation, and tags the information for stronger encoding.',
      'Mistakes only feel like failures because we\'ve been trained to avoid them in school. But from the brain\'s perspective, a corrected mistake is significantly more memorable than something you got right on the first try. The surprise of being wrong creates the very conditions the brain needs to learn.',
      'This explains a finding that puzzles most learners: trying to answer a question before studying the material, even when you\'re almost certain to get it wrong, improves retention of the correct answer more than studying first and answering after.',
      'The attempt generates a prediction. The mismatch generates a learning signal. The correction provides the new information into a brain that is now primed to receive it.',
      'You are not supposed to get everything right in PATTO review sessions. You are supposed to try, fail sometimes, and be corrected. Each correction is memory in the process of forming.',
    ],
    research: [
      {
        author: 'Nate Kornell et al.',
        title: 'Unsuccessful Retrieval Attempts Enhance Subsequent Learning',
        year: 2009,
        brief: 'Failing to retrieve an answer before studying it can enhance subsequent memory for that information more than successful retrieval.',
      },
    ],
    oneThingToRemember: 'Every mistake is a memory forming.',
  },

  // ── PART 3: Native Thinking ───────────────────────────────────────────────

  {
    id: 21,
    part: 3,
    partTitle: 'Native Thinking',
    title: 'Chunking',
    readTimeSec: 38,
    illustration: 'pattern',
    body: [
      'Imagine you are watching a basketball game. A beginner watches individual players — who has the ball, who is running, who is open. An experienced fan watches something different: plays unfolding, formations, strategies. They have chunked the information.',
      'Language works the same way. A beginner in English hears "I was just wondering if you might be able to help me" as nine separate words, each requiring processing. A native speaker hears it as a single polite request formula. One chunk.',
      'This difference is not vocabulary size. The beginner might know every word in that sentence. But they\'ve never stored the sentence as a unit. They process it from scratch every time.',
      'Chunking is the difference between driving a car and thinking about driving a car. Chunked information is automatic. Unchunked information requires effort. In the time it takes a learner to process one chunk word-by-word, a native speaker has processed five.',
      'You build chunks through repetition in context. The first time you encounter "I was just wondering if..." you process it slowly. After twenty encounters in stories and conversations, it starts to become one piece. After a hundred, it is.',
      'Every pattern in PATTO is a chunk waiting to be formed. The review sessions are building the chunks. The stories are the context that makes them meaningful. Together, they are assembling the unit library that fluency runs on.',
    ],
    research: [
      {
        author: 'George Miller',
        title: 'The Magical Number Seven, Plus or Minus Two',
        year: 1956,
        brief: 'Working memory is limited in units, but chunking allows large amounts of information to function as a single unit.',
      },
    ],
    oneThingToRemember: 'Learn phrases. Not words.',
  },

  {
    id: 22,
    part: 3,
    partTitle: 'Native Thinking',
    title: 'Why Native Speakers Sound Fast',
    readTimeSec: 37,
    illustration: 'wave',
    body: [
      'Korean learners of English almost universally report the same experience: native speakers talk too fast. Movies require subtitles. Phone calls are stressful. Real conversations leave them several sentences behind.',
      'Here is the thing: native speakers are usually not talking unusually fast. The typical conversational speech rate in English — about 130 to 150 words per minute — is the same it has always been. What\'s changed is the listener.',
      'Processing speed is not about how fast sound enters the ear. It\'s about how quickly the brain can identify patterns, assign meaning, and clear space for the next input. A listener who processes word-by-word will always struggle to keep up, regardless of how slowly the speaker talks.',
      'When you know "I\'d love to, but I can\'t make it" as a chunk — as a single unit — you process it in the same time a learner needs to process "I\'d." When you have enough chunks, the speech rate problem largely disappears.',
      'This is why exposure to natural-speed English matters so much. Slowed-down audio trains your brain to process slowed-down audio. Natural-speed audio trains your brain to process natural-speed audio. The brain adapts to what it practices on.',
      'The goal is not to ask speakers to slow down. The goal is to build enough chunks that their normal speed becomes your normal speed.',
    ],
    research: [
      {
        author: 'David Segalowitz',
        title: 'Automaticity and Second Languages',
        year: 2003,
        brief: 'Fluency in spoken language processing depends on automatization — developing rapid, effortless recognition of familiar patterns.',
      },
    ],
    oneThingToRemember: "They don't speak fast. You hear slow.",
  },

  {
    id: 23,
    part: 3,
    partTitle: 'Native Thinking',
    title: 'Linking',
    readTimeSec: 36,
    illustration: 'speech',
    body: [
      'Listen closely to natural English and you\'ll notice something that textbooks almost never teach: words don\'t end. They flow into each other.',
      '"Did you eat?" becomes "Dijeat?" "What are you doing?" becomes "Whadarya doing?" "I\'ll give it to him" becomes "I\'ll givit timm." This is not sloppy speech. It is natural speech. It has been this way for centuries.',
      'Linguists call this connected speech. When words are spoken at natural speed, the end of one word merges with the beginning of the next. Consonants link to vowels. Similar sounds collapse into each other. Unstressed syllables disappear entirely.',
      'For listeners, this creates a problem: the speech you actually hear sounds nothing like the words you see on a page. You\'ve memorized "I\'m going to" but what hits your ears is "I\'m gonna." You understand the written form but miss the spoken form.',
      'The solution is exposure to natural speech in context — not slowed-down audio engineered to match the written form, but real English as it\'s actually spoken. Your brain will eventually learn to segment the stream correctly, the same way native speaker children do.',
      'Linking is not an exception to English. It is English, spoken at the speed it was designed for.',
    ],
    research: [
      {
        author: 'Michael Rost',
        title: 'Teaching and Researching Listening',
        year: 2002,
        brief: 'Connected speech phenomena — linking, assimilation, elision — are central to natural listening comprehension and are often undertaught.',
      },
    ],
    oneThingToRemember: "Words don't end. They flow.",
  },

  {
    id: 24,
    part: 3,
    partTitle: 'Native Thinking',
    title: 'Reduction',
    readTimeSec: 35,
    illustration: 'wave',
    body: [
      'English textbooks teach "I am going to the store." Native speakers say "I\'m gonna go to the store." Textbooks say "Do you want to?" Native speakers say "Wanna?"',
      'These are not casual shortcuts that educated speakers avoid. They are the normal, standard forms of spoken English used by everyone, including presidents, professors, and poets reading aloud.',
      'This disconnect — between taught English and spoken English — is one of the most persistent sources of listening comprehension failure. Learners who have only studied written forms can produce perfect English on a page and still find themselves unable to follow a conversation.',
      'Reduction in English is systematic, not random. Function words — and, but, to, of, for — are routinely compressed in natural speech. Content words — the ones carrying meaning — are stressed and clear. The pattern is predictable once you know it.',
      'Understanding this changes what you should listen for. Don\'t focus on the reduced words; they carry less meaning anyway. Focus on the stressed content words. The meaning is there. The grammar is in the rhythm.',
      'The casual form is not a lazy version of the real thing. It is the real thing.',
    ],
    research: [
      {
        author: 'Gillian Brown',
        title: 'Listening to Spoken English',
        year: 1990,
        brief: 'Reduced forms in spontaneous speech are rule-governed and predictable, not arbitrary, and are essential to natural listening comprehension.',
      },
    ],
    oneThingToRemember: 'The casual form IS the correct form.',
  },

  {
    id: 25,
    part: 3,
    partTitle: 'Native Thinking',
    title: 'Rhythm',
    readTimeSec: 37,
    illustration: 'wave',
    body: [
      'English is a stress-timed language. Korean is a syllable-timed language. This difference is more significant than most learners realize.',
      'In a syllable-timed language like Korean, each syllable takes roughly the same amount of time. In a stress-timed language like English, the stressed syllables occur at roughly regular intervals — and the unstressed syllables squeeze in between, however many there are.',
      '"Cats eat fish" and "The cats have been eating the fish" take almost the same amount of time to say in natural English. The stressed syllables (CATS, EAT, FISH) hit at the same rhythm; everything else shrinks to fit.',
      'This rhythmic skeleton is what gives English its characteristic sound. It is also what makes Korean accents in English immediately recognizable: when every syllable is given equal time and weight, the rhythm disappears, and the listener hears something that sounds mechanical.',
      'You cannot learn English rhythm by thinking about it. You absorb it by listening to enormous amounts of natural English at natural speed, until the rhythm becomes something you feel rather than something you calculate.',
      'The stress is where the meaning lives. The rhythm is the frame. When you get both right, everything else — pronunciation, comprehension, naturalness — begins to follow.',
    ],
    research: [
      {
        author: 'Peter Roach',
        title: 'English Phonetics and Phonology',
        year: 2000,
        brief: 'English is stress-timed, with stressed syllables occurring at roughly equal intervals and unstressed syllables compressed to fit.',
      },
    ],
    oneThingToRemember: 'Feel the beat. Then the words follow.',
  },

  {
    id: 26,
    part: 3,
    partTitle: 'Native Thinking',
    title: 'Thinking in English',
    readTimeSec: 38,
    illustration: 'brain',
    body: [
      'The phrase "thinking in English" is often used as a goal without anyone quite explaining what it means. It sounds like talking to yourself in English. But it is something more subtle — and more fundamental — than that.',
      'When a child learns their first language, the language and the thought develop together. There is no separation between "the concept" and "the word." The word is the concept. Later, learning a second language usually means learning words for concepts you already have in your first language.',
      'Thinking in English means eventually having some concepts that live in English — not translated from Korean, but native to English. Idioms, jokes, turns of phrase that simply don\'t have equivalents. A relationship to certain words that is emotional and direct, not processed.',
      'This transition doesn\'t happen by trying. It happens through enough exposure that English begins to feel like a natural channel rather than a foreign one. First you think in Korean and translate. Then you sometimes think in English fragments — a phrase, a sentence. Then, in some contexts, you stop translating entirely.',
      'Start with small, low-stakes contexts. Name objects around you in English. Think through a task step by step in English. Not as a translation exercise, but as an experiment in switching channels.',
      'The goal is not to abandon Korean thought. It is to become someone who can think in two languages — and know, intuitively, which one fits the moment.',
    ],
    research: [
      {
        author: 'François Grosjean',
        title: 'Bilingualism: A Short Introduction',
        year: 2010,
        brief: 'Bilinguals develop language-specific conceptual associations over time. True fluency involves direct concept-to-word access in L2, not translation.',
      },
    ],
    oneThingToRemember: 'Think in feelings first. Words follow.',
  },

  {
    id: 27,
    part: 3,
    partTitle: 'Native Thinking',
    title: 'Fluency Is Recognition',
    readTimeSec: 36,
    illustration: 'eye',
    body: [
      'We tend to imagine fluency as a kind of speed — speaking faster, responding faster, understanding faster. But speed is a symptom, not the cause. The cause is something more specific: recognition.',
      'Fluency is the ability to recognize — not decode, but recognize — language as it arrives. Fluent readers don\'t sound out letters, combine them into words, and look up definitions. They see a word and understand it in the same instant.',
      'This recognition is what separates a fluent speaker from a proficient one. A proficient speaker knows a lot of English and can use it accurately. A fluent speaker has internalized enough patterns that language production and comprehension happen below the level of conscious effort.',
      'You cannot aim directly at fluency. You can only build the conditions for it. More patterns recognized. More chunks automated. More contexts encountered. More retrieval practiced. And then, gradually, across hundreds of sessions, fluency begins to arrive — not as a sudden gift, but as the natural result of enough practice.',
      'The experience of fluency is the experience of effortlessness. Not that the language is simple, but that processing it no longer requires effort. You stopped learning to ride a bicycle and started riding one.',
      'Every session in PATTO is building the recognition database — the internal library that fluency runs on. You may not feel it happening. But it is.',
    ],
    research: [
      {
        author: 'David LaBerge & S. Jay Samuels',
        title: 'Toward a Theory of Automatic Information Processing in Reading',
        year: 1974,
        brief: 'Automaticity in reading — recognizing language without conscious effort — is the foundation of fluent comprehension.',
      },
    ],
    oneThingToRemember: 'Practice until you stop trying.',
  },

  {
    id: 28,
    part: 3,
    partTitle: 'Native Thinking',
    title: 'The Pause Before Speaking',
    readTimeSec: 35,
    illustration: 'clock',
    body: [
      'Many language learners are acutely aware of the pause before they speak. The moment between deciding what to say and actually saying it. To them, this pause feels like a failure — evidence of inadequacy.',
      'But pause is normal. Native speakers pause too. The difference is what happens during the pause, and how long it lasts.',
      'When a native speaker pauses, they are retrieving a chunk — pulling a pre-formed unit from memory and slotting it into position. The retrieval is fast because the chunk is already built. When a learner pauses, they are often constructing from scratch — assembling words into a phrase they haven\'t stored as a unit yet.',
      'Willem Levelt\'s model of speech production shows that fluent speakers are not composing language in real time. They are retrieving it. The retrieval of whole chunks dramatically reduces production time compared to composing word-by-word.',
      'This is directly why pattern practice matters for speaking. Each pattern you internalize is one less thing you have to construct from scratch. The pause shrinks not because you\'re trying to speak faster, but because the retrieval becomes faster.',
      'The goal is not to eliminate the pause. It is to fill the pause with retrieval instead of construction.',
    ],
    research: [
      {
        author: 'Willem Levelt',
        title: 'Speaking: From Intention to Articulation',
        year: 1989,
        brief: 'Fluent speech relies on retrieval of pre-formed lexical chunks, not real-time word-by-word construction.',
      },
    ],
    oneThingToRemember: 'The pause shrinks when chunks grow.',
  },

  {
    id: 29,
    part: 3,
    partTitle: 'Native Thinking',
    title: 'When You Stop Counting Words',
    readTimeSec: 37,
    illustration: 'eye',
    body: [
      'There is a stage in language learning where you become very aware of your own language. You notice which words you used correctly and which felt uncertain. You replay conversations to evaluate them. You listen to yourself as you speak.',
      'Stephen Krashen called this the affective filter — the internal monitor that watches, evaluates, and critiques your language production. In moderate amounts, this awareness is useful. It helps you notice patterns and correct errors.',
      'But at high levels, it becomes an obstacle. When you are preoccupied with monitoring your language, you have fewer cognitive resources available for actually thinking about what you\'re saying. Anxiety about correctness becomes itself a barrier to comprehension and fluency.',
      'You have probably noticed this in your own experience. In low-stakes situations — talking to a friend, or quietly reading — your English flows more naturally. In high-stakes situations — an important meeting, a phone call with a stranger — it tightens up.',
      'The filter can be lowered. Not by trying not to care, but by accumulating enough positive experiences in the language that your baseline anxiety decreases. More exposure. More success. More moments where English worked for you.',
      'Eventually, you stop counting words. You stop evaluating each sentence. You arrive in conversation, and the language is just there, doing its job, unnoticed.',
    ],
    research: [
      {
        author: 'Stephen Krashen',
        title: 'The Affective Filter Hypothesis',
        year: 1982,
        brief: 'High anxiety and low confidence raise the affective filter, blocking input from reaching the language acquisition device. Low filter = high acquisition.',
      },
    ],
    oneThingToRemember: 'Stop watching yourself speak.',
  },

  {
    id: 30,
    part: 3,
    partTitle: 'Native Thinking',
    title: 'Language Never Ends',
    readTimeSec: 40,
    illustration: 'book',
    body: [
      'Native speakers are still learning their language. Every day, they encounter a word they haven\'t seen, a usage they hadn\'t considered, a construction they find elegant in a new way. Language is not something you finish. It is something you inhabit.',
      'This is worth holding on to, especially when language learning feels endless. It doesn\'t end because it was never designed to. The size of any living language — its vocabulary, its patterns, its cultural connotations — far exceeds what any individual could fully acquire in a lifetime. And yet people communicate beautifully with their partial acquisition.',
      'The question is never "Am I done?" The question is "Am I better than I was?" And almost always, the answer is yes — even when it doesn\'t feel that way, even when a conversation goes poorly, even when a review session feels harder than expected.',
      'You began reading this collection to understand how language works. What we\'ve covered — from translation to chunking, from spaced repetition to the voice in your head — is not a syllabus to be memorized. It is a different way of thinking about what you\'re doing when you learn English.',
      'Language acquisition is not studying. It is the slow, patient, often invisible process of building a new way of experiencing the world. It is not separate from who you are. It is becoming part of who you are.',
      'Keep going. Not because fluency is around the corner, but because the journey is the point. Every story you read, every pattern you practice, every session you complete is the language, working on you.',
    ],
    research: [
      {
        author: 'David Crystal',
        title: 'The Cambridge Encyclopedia of Language',
        year: 2010,
        brief: 'Living languages are never fully acquired, even by native speakers. Language development is a lifelong process.',
      },
      {
        author: 'Stephen Krashen',
        title: 'The Input Hypothesis',
        year: 1982,
        brief: 'Language acquisition continues as long as we receive comprehensible input. There is no endpoint — only more language.',
      },
    ],
    oneThingToRemember: 'The journey is the language.',
  },
]

export const TOTAL_NOTES = EDITOR_NOTES.length  // 30
