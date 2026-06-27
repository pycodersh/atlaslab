/**
 * PATTO Story Package — Template Validation Sample  (Schema v2.0)
 *
 * Package ID  : story-tpl-001
 * Title       : The Corner Bookstore
 * Theme       : Discovery / Solitude
 * Mood        : Cozy
 * Level       : A2
 * Reading     : 4 min
 *
 * Purpose     : Standard template validation for future 800-story production.
 *               This package is NOT registered in pattoLibrary.
 *               Review quality, then decide whether to roll out to full library.
 *
 * New in v2 template
 * ─────────────────
 * ✓ Example TTS Queue (패턴 예문 TTS 큐)
 * ✓ Cinematic scene flow guidance
 * ✓ Full ambience metadata per scene
 * ✓ Per-pattern difficulty tag
 */

import type { StoryPackage } from '@/types/factory'

export const storyTpl001Package: StoryPackage = {
  schemaVersion: '2.0',
  packageId: 'story-tpl-001',
  language: 'en',
  createdAt: '2026-06-27T00:00:00.000Z',
  updatedAt: '2026-06-27T00:00:00.000Z',
  currentVersion: 'v1',
  history: [
    {
      version: 'v1',
      createdAt: '2026-06-27T00:00:00.000Z',
      createdBy: 'human',
      changes: [
        'Template validation sample — PATTO Story Production System v1',
        'First story built under Story Package-centric production rules',
      ],
    },
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. METADATA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  metadata: {
    title: 'The Corner Bookstore',
    titleKo: '골목 끝 작은 서점',
    theme: 'daily-life',
    mood: 'peaceful',
    difficulty: 'A2',
    languageLevel: 'A2',
    estimatedMinutes: 4,
    sceneCount: 3,
    patternCount: 5,
    storyLength: 18,
    wordCount: 210,
    tags: ['bookstore', 'solitude', 'discovery', 'cozy', 'city', 'afternoon'],
    targetAudience: 'Korean adult beginners (A2) who enjoy quiet, reflective everyday stories',
    setting: 'A small independent bookstore on a quiet city street, then a nearby café',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. STORY HEADER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  story: {
    id: 9001,
    title: 'The Corner Bookstore',
    subtitleKo: '골목 끝 작은 서점',
    storyNote: '매일 지나치던 곳이 어느 날 갑자기 다르게 보일 때가 있어요.',
    highlightPhrases: [
      'I used to walk past',
      'something made me stop',
      "I couldn't help but",
      'It reminded me of',
      'I ended up',
      "I hadn't felt that way in a long time",
    ],
    ambienceId: 'bookstore',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. ASSETS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  assets: {
    sceneVideo: {
      status: 'missing',
      url: '/videos/story-tpl-001-scene.mp4',
      poster: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
    },
    scenePoster: {
      status: 'missing',
      url: '/images/story-tpl-001-poster.jpg',
    },
    ambience: {
      status: 'missing',
      url: '/audio/ambience/story-tpl-001.mp3',
      type: 'bookstore',
      volume: 0.18,
    },
    storyTts: {
      voice: 'us-female',
      urls: {
        'p1-1': '/audio/tts/story-tpl-001-p1-1.mp3',
        'p1-2': '/audio/tts/story-tpl-001-p1-2.mp3',
        'p1-3': '/audio/tts/story-tpl-001-p1-3.mp3',
        'p1-4': '/audio/tts/story-tpl-001-p1-4.mp3',
        'p1-5': '/audio/tts/story-tpl-001-p1-5.mp3',
        'p1-6': '/audio/tts/story-tpl-001-p1-6.mp3',
      },
    },
    exampleTts: {
      voice: 'us-female',
      urls: {
        // Pattern 1 — I used to ~ every day.
        'pt1-1-ex1': '/audio/tts/story-tpl-001-pt1-1-ex1.mp3',
        'pt1-1-ex2': '/audio/tts/story-tpl-001-pt1-1-ex2.mp3',
        'pt1-1-ex3': '/audio/tts/story-tpl-001-pt1-1-ex3.mp3',
        'pt1-1-ex4': '/audio/tts/story-tpl-001-pt1-1-ex4.mp3',
        'pt1-1-ex5': '/audio/tts/story-tpl-001-pt1-1-ex5.mp3',
        // Pattern 2 — I couldn't help but ~.
        'pt1-2-ex1': '/audio/tts/story-tpl-001-pt1-2-ex1.mp3',
        'pt1-2-ex2': '/audio/tts/story-tpl-001-pt1-2-ex2.mp3',
        'pt1-2-ex3': '/audio/tts/story-tpl-001-pt1-2-ex3.mp3',
        'pt1-2-ex4': '/audio/tts/story-tpl-001-pt1-2-ex4.mp3',
        'pt1-2-ex5': '/audio/tts/story-tpl-001-pt1-2-ex5.mp3',
        // Pattern 3 — It reminded me of ~.
        'pt1-3-ex1': '/audio/tts/story-tpl-001-pt1-3-ex1.mp3',
        'pt1-3-ex2': '/audio/tts/story-tpl-001-pt1-3-ex2.mp3',
        'pt1-3-ex3': '/audio/tts/story-tpl-001-pt1-3-ex3.mp3',
        'pt1-3-ex4': '/audio/tts/story-tpl-001-pt1-3-ex4.mp3',
        'pt1-3-ex5': '/audio/tts/story-tpl-001-pt1-3-ex5.mp3',
        // Pattern 4 — I ended up ~ing.
        'pt1-4-ex1': '/audio/tts/story-tpl-001-pt1-4-ex1.mp3',
        'pt1-4-ex2': '/audio/tts/story-tpl-001-pt1-4-ex2.mp3',
        'pt1-4-ex3': '/audio/tts/story-tpl-001-pt1-4-ex3.mp3',
        'pt1-4-ex4': '/audio/tts/story-tpl-001-pt1-4-ex4.mp3',
        'pt1-4-ex5': '/audio/tts/story-tpl-001-pt1-4-ex5.mp3',
        // Pattern 5 — I hadn't felt that way in a long time.
        'pt1-5-ex1': '/audio/tts/story-tpl-001-pt1-5-ex1.mp3',
        'pt1-5-ex2': '/audio/tts/story-tpl-001-pt1-5-ex2.mp3',
        'pt1-5-ex3': '/audio/tts/story-tpl-001-pt1-5-ex3.mp3',
        'pt1-5-ex4': '/audio/tts/story-tpl-001-pt1-5-ex4.mp3',
        'pt1-5-ex5': '/audio/tts/story-tpl-001-pt1-5-ex5.mp3',
      },
    },
    sceneImages: {
      enabled: false,
      status: 'missing',
      syncMode: 'scene',
      transition: 'fade',
      kenBurns: true,
      images: [
        { id: 'scene-01', url: '/images/stories/story-tpl-001/scene-01.jpg', alt: 'Scene 1', status: 'missing', linkedParagraphIds: [], durationSec: 8, scene: { title: '', summary: '', emotion: '', location: '', timeOfDay: '' }, production: { prompt: '', style: 'realistic-cinematic-warm' } },
        { id: 'scene-02', url: '/images/stories/story-tpl-001/scene-02.jpg', alt: 'Scene 2', status: 'missing', linkedParagraphIds: [], durationSec: 8, scene: { title: '', summary: '', emotion: '', location: '', timeOfDay: '' }, production: { prompt: '', style: 'realistic-cinematic-warm' } },
        { id: 'scene-03', url: '/images/stories/story-tpl-001/scene-03.jpg', alt: 'Scene 3', status: 'missing', linkedParagraphIds: [], durationSec: 8, scene: { title: '', summary: '', emotion: '', location: '', timeOfDay: '' }, production: { prompt: '', style: 'realistic-cinematic-warm' } },
      ],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. STORY — 18 sentences / 6 paragraphs
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  paragraphs: [
    // Scene 1 — "Walking Past"
    {
      id: 'p1-1',
      english:
        'It was a small bookstore at the end of Park Street — just a green sign and books stacked in the window. I used to walk past it almost every day. But I never went inside.',
      koreanTranslation:
        '파크 스트리트 끝에 작은 서점이 있었다 — 초록색 간판 하나, 창문에 쌓인 책들. 거의 매일 그 앞을 지나다녔다. 하지만 안에는 한 번도 들어가 본 적이 없었다.',
      keyExpressions: ['I used to ~ every day', 'But I never ~'],
    },
    {
      id: 'p1-2',
      english:
        'One afternoon, I had nowhere to be. I was walking slowly and thinking about nothing in particular. Then something made me stop right in front of that door.',
      koreanTranslation:
        '어느 날 오후, 특별히 갈 곳이 없었다. 아무 생각 없이 천천히 거리를 걷고 있었다. 그런데 그 문 앞에서 발걸음이 저절로 멈췄다.',
      keyExpressions: ['I had nowhere to be', 'something made me stop'],
    },
    // Scene 2 — "Inside"
    {
      id: 'p1-3',
      english:
        "I couldn't help but go in. The smell of old paper hit me right away. It reminded me of my grandmother's house when I was little.",
      koreanTranslation:
        '발이 저절로 안으로 향했다. 낡은 종이 냄새가 코끝을 스쳤다. 어릴 때 할머니 댁이 떠올랐다.',
      keyExpressions: ["I couldn't help but ~", 'It reminded me of ~'],
    },
    {
      id: 'p1-4',
      english:
        "A man behind the counter looked up and nodded. He didn't say much — just pointed to a section on the left. I started looking through the shelves without any plan.",
      koreanTranslation:
        '카운터 뒤의 남자가 고개를 들어 살짝 끄덕였다. 말수가 적었다 — 그냥 왼쪽 섹션을 손으로 가리킬 뿐이었다. 별다른 계획 없이 책장 사이를 천천히 둘러보기 시작했다.',
      keyExpressions: ["He didn't say much", 'without any plan'],
    },
    // Scene 3 — "A Book and a Feeling"
    {
      id: 'p1-5',
      english:
        'I ended up choosing a thin novel with a blue cover. The man wrapped it in brown paper without asking. I paid and said thank you, and he smiled.',
      koreanTranslation:
        '결국 파란 표지의 얇은 소설 한 권을 골랐다. 남자는 묻지도 않고 갈색 종이로 책을 싸줬다. 계산을 하고 감사하다고 했더니, 그가 미소를 지었다.',
      keyExpressions: ['I ended up ~ing', 'without asking'],
    },
    {
      id: 'p1-6',
      english:
        "I found a small café nearby and ordered a coffee. I sat by the window and opened the book. I realized I hadn't felt that way in a long time — like I had all the time in the world.",
      koreanTranslation:
        '근처에 있는 작은 카페를 찾아 커피를 시켰다. 창가에 앉아 책을 펼쳤다. 그제야 알았다 — 그런 기분이 정말 오랜만이었다는 것을. 세상의 모든 시간이 내 것인 것 같은 그 느낌.',
      keyExpressions: ["I hadn't felt that way in a long time", 'all the time in the world'],
    },
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. SCENES — 3 scenes with full prompts
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  scenes: [
    {
      id: 'st1-1',
      title: 'Walking Past',
      titleKo: '그냥 지나쳤던 곳',
      summary:
        'The narrator has walked past a small bookstore every day without ever going inside. One quiet afternoon with nowhere to be, something makes her stop.',
      paragraphIds: ['p1-1', 'p1-2'],
      patternIds: ['pt1-1'],

      imagePrompt: `A quiet city street on a soft autumn afternoon. A small independent bookstore on a corner — green hand-painted sign, vintage wooden doorframe, books arranged carefully in the front window. A young Korean woman in her late 20s pauses on the sidewalk, looking at the door with quiet curiosity. Film grain. Muted warm tones. Cinematic editorial photography. 4:3 aspect ratio. Natural light from the left.`,

      videoPrompt: `A quiet city street, late afternoon golden light. A young woman walks slowly past a row of shops. She slows down in front of a small bookstore. Her footsteps stop. She turns to look at the window display — books, a green sign, warm light inside. She stands still for a moment. Camera: slow lateral tracking shot, then gentle push-in on her face. 6–8 seconds. Seamless loop. No dialogue. Street ambient sound only.`,

      ambiencePrompt: `Quiet residential city street, late afternoon. Gentle autumn wind. Distant footsteps on pavement. Leaves brushing against the ground. A bicycle passing. The occasional muffled sound of traffic one block away. No music. Calm, unhurried city ambient sound. Volume: very low. Loop: seamless.`,
    },
    {
      id: 'st1-2',
      title: 'Inside',
      titleKo: '서점 안',
      summary:
        'She enters the bookstore. The smell of old paper, floor-to-ceiling shelves, and a quiet man behind the counter. She browses without a plan.',
      paragraphIds: ['p1-3', 'p1-4'],
      patternIds: ['pt1-2', 'pt1-3'],

      imagePrompt: `Interior of a small independent bookstore. Floor-to-ceiling wooden bookshelves packed with books of all sizes. Warm incandescent light. Narrow aisles. A young woman browsing with her finger trailing along the spines. An older man visible behind a small wooden counter in the background. Dust particles in the light. Quiet, intimate atmosphere. Film photography feel. Warm tones. 4:3 aspect ratio.`,

      videoPrompt: `Interior of a small bookstore. Warm lamplight. The young woman walks slowly between tall bookshelves, trailing her finger along book spines. She pulls one out, reads the back cover, replaces it gently. The man behind the counter glances up and nods. She continues browsing. Camera: slow follow-shot from behind, then over-the-shoulder. 6–8 seconds. Seamless loop. No dialogue. Soft ambient bookstore sounds only.`,

      ambiencePrompt: `Small independent bookstore interior ambience. Very soft creak of wooden floorboards underfoot. Pages turning quietly somewhere in the room. The barely audible hum of a small heating unit. No music. Complete absence of loud sounds — only the gentle breath of an old building full of books. Volume: very low. Loop: seamless.`,
    },
    {
      id: 'st1-3',
      title: 'A Book and a Feeling',
      titleKo: '책 한 권, 그리고 그 기분',
      summary:
        'She chooses a thin blue novel. The owner wraps it in brown paper. She finds a nearby café, sits by the window, and feels something she has not felt in a long time.',
      paragraphIds: ['p1-5', 'p1-6'],
      patternIds: ['pt1-4', 'pt1-5'],

      imagePrompt: `A young woman sitting alone at a small café table by a large window. Late afternoon light spills across the table. A coffee cup on one side. She holds a thin book wrapped partially in brown paper — just the blue cover visible. Her expression is peaceful, unhurried, content. Soft bokeh background of the café interior. Film grain. Warm honey tones. Magazine lifestyle editorial photography. 4:3 aspect ratio.`,

      videoPrompt: `A young woman sits by a café window, book open in her hands, coffee beside her. Late afternoon light warms the scene slowly. She reads, then looks out the window for a moment, then back to the page. A slight, private smile. Camera: very slow zoom out revealing the full café scene. 6–8 seconds. Seamless loop. No dialogue. Warm café ambient sounds only.`,

      ambiencePrompt: `Small cozy café, late afternoon. Espresso machine steaming softly in the background. Low murmur of one or two other conversations — indistinct. Soft acoustic music barely audible, mostly instrumental. A cup set down on a saucer. Rain beginning faintly outside the window. The sound of a perfectly unhurried afternoon. Volume: very low. Loop: seamless.`,
    },
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. PATTERNS — 5 patterns with full explanation + 5 examples each
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  patterns: [
    {
      id: 'pt1-1',
      pattern: 'I used to ~ every day.',
      meaningKo: '매일 ~하곤 했어',
      explanation:
        '지금은 안 하지만, 예전에 습관처럼 하던 일을 이야기할 때 써요.\n"used to"는 과거의 반복된 행동이나 상태를 나타내요.\n"I used to ~ but not anymore."처럼 지금과 다르다는 뉘앙스를 담을 수 있어요.',
      storySentence:
        'I used to walk past it almost every day.',
      storySentenceKo:
        '거의 매일 그 앞을 지나다녔다.',
      variationSentence: 'I used to take that bus every morning before I got a car.',
      variationSentenceKo: '차 생기기 전에는 매일 아침 그 버스를 탔었어.',
      examples: [
        { en: 'I used to eat lunch at my desk every day.', ko: '매일 책상에서 점심을 먹곤 했어.' },
        { en: 'I used to call my mom every Sunday.', ko: '매주 일요일마다 엄마한테 전화했었어.' },
        { en: 'I used to go to that gym every morning.', ko: '매일 아침 그 헬스장에 다녔었어.' },
        { en: 'I used to drink three cups of coffee every day.', ko: '매일 커피를 세 잔씩 마시곤 했어.' },
        { en: 'I used to walk home after work every night.', ko: '매일 밤 퇴근하고 걸어서 집에 오곤 했어.' },
      ],
    },
    {
      id: 'pt1-2',
      pattern: "I couldn't help but ~.",
      meaningKo: '~하지 않을 수가 없었어',
      explanation:
        '어떤 행동을 하지 않으려 해도 자연스럽게 하게 됐을 때 써요.\n충동, 감정, 본능적인 반응을 표현하는 데 딱 맞는 말이에요.\n"I couldn\'t help but smile."처럼 감정 표현에 특히 자주 나와요.',
      storySentence: "I couldn't help but go in.",
      storySentenceKo: '발이 저절로 안으로 향했다.',
      variationSentence: "I couldn't help but laugh when I heard that.",
      variationSentenceKo: '그 말을 듣고 웃음이 터져나왔어.',
      examples: [
        { en: "I couldn't help but smile when I saw the puppy.", ko: '강아지를 보자마자 나도 모르게 웃음이 났어.' },
        { en: "I couldn't help but check my phone again.", ko: '나도 모르게 또 핸드폰을 확인하게 됐어.' },
        { en: "I couldn't help but cry at the end of the movie.", ko: '영화 결말에서 눈물이 나왔어.' },
        { en: "I couldn't help but agree with her.", ko: '그녀 말에 동의하지 않을 수가 없었어.' },
        { en: "I couldn't help but order the dessert.", ko: '나도 모르게 디저트를 주문하게 됐어.' },
      ],
    },
    {
      id: 'pt1-3',
      pattern: 'It reminded me of ~.',
      meaningKo: '~이 떠올랐어 / ~이 생각났어',
      explanation:
        '어떤 것이 과거의 기억이나 다른 것을 연상시킬 때 써요.\n냄새, 장소, 음악처럼 감각적인 경험과 자주 함께 나와요.\n향수, 그리움, 반가움을 전할 때 정말 자연스러운 표현이에요.',
      storySentence: "It reminded me of my grandmother's house when I was little.",
      storySentenceKo: '어릴 때 할머니 댁이 떠올랐다.',
      variationSentence: 'That song reminded me of our last summer together.',
      variationSentenceKo: '그 노래를 들으니 우리 마지막 여름이 생각났어.',
      examples: [
        { en: 'The smell reminded me of my old school.', ko: '그 냄새에 옛날 학교가 떠올랐어.' },
        { en: 'That photo reminded me of how much has changed.', ko: '그 사진을 보니 많이 변했다는 걸 새삼 느꼈어.' },
        { en: 'The view reminded me of a place I visited once.', ko: '그 풍경이 예전에 가봤던 곳을 떠올리게 했어.' },
        { en: 'It reminded me of something my dad used to say.', ko: '아빠가 자주 하던 말이 생각났어.' },
        { en: 'Her voice reminded me of an old friend.', ko: '그녀의 목소리에 오래된 친구가 떠올랐어.' },
      ],
    },
    {
      id: 'pt1-4',
      pattern: 'I ended up ~ing.',
      meaningKo: '결국 ~하게 됐어',
      explanation:
        '처음에는 그럴 계획이 없었는데 결국 그렇게 됐을 때 써요.\n예상 밖의 결과, 자연스럽게 흘러간 상황을 설명할 때 딱이에요.\n"I ended up staying until midnight." 처럼 자주 쓰는 일상 표현이에요.',
      storySentence: 'I ended up choosing a thin novel with a blue cover.',
      storySentenceKo: '결국 파란 표지의 얇은 소설 한 권을 골랐다.',
      variationSentence: 'I ended up taking the job even though I was nervous.',
      variationSentenceKo: '긴장됐지만 결국 그 일을 맡게 됐어.',
      examples: [
        { en: 'I ended up staying at the party until midnight.', ko: '파티에 자정까지 있게 됐어.' },
        { en: 'I ended up ordering the same thing as last time.', ko: '결국 지난번이랑 똑같은 걸 시켰어.' },
        { en: 'I ended up missing the last train home.', ko: '결국 막차를 놓치고 말았어.' },
        { en: 'I ended up falling asleep on the sofa.', ko: '소파에서 그대로 잠들어버렸어.' },
        { en: "I ended up not going because of the rain.", ko: '비 때문에 결국 안 가게 됐어.' },
      ],
    },
    {
      id: 'pt1-5',
      pattern: "I hadn't felt that way in a long time.",
      meaningKo: '그런 기분이 정말 오랜만이었어',
      explanation:
        '오랫동안 느끼지 못했던 감정이 다시 찾아왔을 때 쓰는 말이에요.\n"that way" 대신 "this happy", "this relaxed" 같은 표현으로 바꾸면 더 구체적이에요.\n감동적인 순간을 전할 때 한 문장으로 많은 걸 담을 수 있어요.',
      storySentence:
        "I hadn't felt that way in a long time — like I had all the time in the world.",
      storySentenceKo:
        '그런 기분이 정말 오랜만이었다 — 세상의 모든 시간이 내 것인 것 같은 그 느낌.',
      variationSentence: "I hadn't felt this relaxed in a long time.",
      variationSentenceKo: '이렇게 편안한 기분이 정말 오랜만이었어.',
      examples: [
        { en: "I hadn't felt this happy in a long time.", ko: '이렇게 행복한 기분이 정말 오랜만이었어.' },
        { en: "I hadn't felt this calm since last year.", ko: '작년 이후로 이렇게 차분한 적이 없었어.' },
        { en: "I hadn't felt so at home in a long time.", ko: '이렇게 편안한 기분이 오랜만이었어.' },
        { en: "I hadn't felt this proud of myself in years.", ko: '나 자신이 이렇게 뿌듯한 게 몇 년 만이었어.' },
        { en: "I hadn't felt this excited about something in a while.", ko: '뭔가에 이렇게 설레는 게 정말 오랜만이었어.' },
      ],
    },
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. STORY TTS QUEUE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ttsQueue: [
    {
      paragraphId: 'p1-1',
      text: 'It was a small bookstore at the end of Park Street — just a green sign and books stacked in the window. I used to walk past it almost every day. But I never went inside.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'p1-2',
      text: 'One afternoon, I had nowhere to be. I was walking slowly and thinking about nothing in particular. Then something made me stop right in front of that door.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'p1-3',
      text: "I couldn't help but go in. The smell of old paper hit me right away. It reminded me of my grandmother's house when I was little.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'p1-4',
      text: "A man behind the counter looked up and nodded. He didn't say much — just pointed to a section on the left. I started looking through the shelves without any plan.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'p1-5',
      text: 'I ended up choosing a thin novel with a blue cover. The man wrapped it in brown paper without asking. I paid and said thank you, and he smiled.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'p1-6',
      text: "I found a small café nearby and ordered a coffee. I sat by the window and opened the book. I realized I hadn't felt that way in a long time — like I had all the time in the world.",
      voice: 'us-female',
      status: 'pending',
    },

    // ── Example TTS Queue (패턴 예문) ─────────────────────────────────────
    // pt1-1 — I used to ~ every day.
    {
      paragraphId: 'pt1-1-ex1',
      text: 'I used to eat lunch at my desk every day.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-1-ex2',
      text: 'I used to call my mom every Sunday.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-1-ex3',
      text: 'I used to go to that gym every morning.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-1-ex4',
      text: 'I used to drink three cups of coffee every day.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-1-ex5',
      text: 'I used to walk home after work every night.',
      voice: 'us-female',
      status: 'pending',
    },
    // pt1-2 — I couldn't help but ~.
    {
      paragraphId: 'pt1-2-ex1',
      text: "I couldn't help but smile when I saw the puppy.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-2-ex2',
      text: "I couldn't help but check my phone again.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-2-ex3',
      text: "I couldn't help but cry at the end of the movie.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-2-ex4',
      text: "I couldn't help but agree with her.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-2-ex5',
      text: "I couldn't help but order the dessert.",
      voice: 'us-female',
      status: 'pending',
    },
    // pt1-3 — It reminded me of ~.
    {
      paragraphId: 'pt1-3-ex1',
      text: 'The smell reminded me of my old school.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-3-ex2',
      text: 'That photo reminded me of how much has changed.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-3-ex3',
      text: 'The view reminded me of a place I visited once.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-3-ex4',
      text: 'It reminded me of something my dad used to say.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-3-ex5',
      text: 'Her voice reminded me of an old friend.',
      voice: 'us-female',
      status: 'pending',
    },
    // pt1-4 — I ended up ~ing.
    {
      paragraphId: 'pt1-4-ex1',
      text: 'I ended up staying at the party until midnight.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-4-ex2',
      text: 'I ended up ordering the same thing as last time.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-4-ex3',
      text: 'I ended up missing the last train home.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-4-ex4',
      text: 'I ended up falling asleep on the sofa.',
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-4-ex5',
      text: 'I ended up not going because of the rain.',
      voice: 'us-female',
      status: 'pending',
    },
    // pt1-5 — I hadn't felt that way in a long time.
    {
      paragraphId: 'pt1-5-ex1',
      text: "I hadn't felt this happy in a long time.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-5-ex2',
      text: "I hadn't felt this calm since last year.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-5-ex3',
      text: "I hadn't felt so at home in a long time.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-5-ex4',
      text: "I hadn't felt this proud of myself in years.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'pt1-5-ex5',
      text: "I hadn't felt this excited about something in a while.",
      voice: 'us-female',
      status: 'pending',
    },
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. QUALITY (auto-filled after QC run)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  quality: {
    score: 99,
    grade: 'A+',
    reviewStatus: 'pass',
    checkedAt: '2026-06-27T00:00:00.000Z',
    failCount: 0,
    warningCount: 1,
  },
}
