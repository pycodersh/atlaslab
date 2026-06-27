/**
 * PATTO Story Package — Story 001  (Schema v2.0)
 *
 * Story Factory가 생성하는 StoryPackage의 완성 예시.
 * buildPackage() 출력물 형태.
 *
 * 사용:
 *   import { story001Package } from '@/data/factory/story-001-package'
 */

import type { StoryPackage } from '@/types/factory'

export const story001Package: StoryPackage = {
  schemaVersion: '2.0',
  packageId: 'story-001',
  language: 'en',
  createdAt: '2026-06-27T00:00:00.000Z',
  updatedAt: '2026-06-27T00:00:00.000Z',
  currentVersion: 'v1',
  history: [
    {
      version: 'v1',
      createdAt: '2026-06-27T00:00:00.000Z',
      createdBy: 'human',
      changes: ['Initial package created'],
    },
  ],

  metadata: {
    title: 'The Last Train Home',
    titleKo: '마지막 기차로 돌아오다',
    theme: 'friendship',
    mood: 'bittersweet',
    difficulty: 'B1',
    languageLevel: 'B1',
    estimatedMinutes: 3,
    sceneCount: 3,
    patternCount: 5,
    storyLength: 20,
    wordCount: 260,
    tags: ['train', 'friday-night', 'spontaneous', 'friends', 'city', 'late-night'],
    targetAudience: 'Korean adults at B1 level who enjoy slice-of-life stories set in urban environments',
    setting: "A city train and a friend's apartment on a Friday night",
  },

  story: {
    id: 1,
    title: 'The Last Train Home',
    subtitleKo: '마지막 기차로 돌아오다',
    storyNote: '가장 좋은 밤은 계획하지 않아도 찾아올 때가 있어요.',
    highlightPhrases: [
      'all I wanted was to',
      'You in?',
      'I could be there by eight',
      "I'm on my way",
      "I didn't want to leave",
      'I have to get up early',
    ],
    ambienceId: 'train',
  },

  assets: {
    sceneVideo: {
      status: 'ready',
      source: 'test',
      url: '/videos/story001-test.mp4',
      poster: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      prompt: `A cinematic realistic short film about a tired office worker riding the last train home on a Friday evening. City lights blur outside the train window. Their phone buzzes with a text invitation from a friend. They hesitate, then smile and change direction back toward the city. The scene transitions to a warm apartment gathering with friends laughing, eating, and talking. Later, they ride the quiet last train home again, looking out at the softer city lights. Warm natural lighting, realistic human motion, gentle camera movement, cozy evening mood, no dialogue, no text on screen, ambient sound only, 24 seconds.`,
    },
    scenePoster: {
      status: 'missing',
      url: '/images/story001-poster.jpg',
    },
    ambience: {
      status: 'missing',
      url: '/audio/ambience/story001.mp3',
      type: 'train',
      volume: 0.25,
    },
    storyTts: {
      voice: 'us-female',
      urls: {
        'p1-1': '/audio/tts/story001-p1-1.mp3',
        'p1-2': '/audio/tts/story001-p1-2.mp3',
        'p1-3': '/audio/tts/story001-p1-3.mp3',
        'p1-4': '/audio/tts/story001-p1-4.mp3',
        'p1-5': '/audio/tts/story001-p1-5.mp3',
      },
    },
    sceneImages: [
      { sceneId: 's1-1', status: 'missing', url: '/images/story001-s1-1.jpg' },
      { sceneId: 's1-2', status: 'missing', url: '/images/story001-s1-2.jpg' },
      { sceneId: 's1-3', status: 'missing', url: '/images/story001-s1-3.jpg' },
    ],
  },

  videoProduction: {
    status: 'prompt-ready',
    targetFile: 'public/videos/story001-scene.mp4',
    duration: 24,
    recommendedTool: 'runway',
    promptFile: 'data/factory/story-001-video-production.ts',
  },

  paragraphs: [
    {
      id: 'p1-1',
      english: "It was a Friday evening. I was on the train home, watching the city lights blur past the window. I had a long week at work and all I wanted was to get home, make some tea, and do nothing.",
      koreanTranslation: "금요일 저녁이었다. 나는 집으로 가는 기차 안에서 창밖으로 흐릿하게 지나가는 도시의 불빛을 바라보고 있었다. 직장에서 긴 한 주를 보냈고, 집에 돌아가 차 한 잔 마시며 아무것도 하지 않는 것만 바랐다.",
      keyExpressions: ['all I wanted was to ~', 'watching the city lights'],
    },
    {
      id: 'p1-2',
      english: 'Then my phone buzzed. A text from my friend Jisu: "We\'re having a little get-together tonight. You in?" I stared at the message. I didn\'t really feel like going out. But something made me pause.',
      koreanTranslation: "그때 내 휴대폰이 울렸다. 친구 지수에게서 온 문자였다: \"오늘 밤 작은 모임이 있어. 올 거야?\" 메시지를 멍하니 바라봤다. 딱히 나가고 싶지 않았다. 하지만 무언가가 나를 멈추게 했다.",
      keyExpressions: ['A text from ~', 'You in?'],
    },
    {
      id: 'p1-3',
      english: "I got off at the next stop and switched directions. I texted Jisu back: \"I'm on my way. I could be there by eight.\" The train was going the other way now, back into the city. I just smiled at my own reflection in the dark window.",
      koreanTranslation: "나는 다음 역에서 내려 방향을 바꿨다. 지수에게 답장을 보냈다: \"가고 있어. 여덟 시까지는 갈 수 있을 것 같아.\" 기차는 이제 반대 방향으로, 도시 안쪽으로 달리고 있었다. 어두운 창문에 비친 내 모습을 보며 그냥 미소를 지었다.",
      keyExpressions: ["I could be there by ~", "I'm on my way"],
    },
    {
      id: 'p1-4',
      english: "When I arrived, the apartment was warm and full of laughter. There were more people than I expected, but the feeling was exactly right. We talked, we ate, and time passed faster than it should have.",
      koreanTranslation: "도착하니 아파트는 따뜻하고 웃음소리로 가득했다. 예상보다 사람이 많았지만, 분위기는 딱 맞았다. 우리는 이야기를 나누고 함께 먹었고, 시간은 있어야 할 것보다 훨씬 빨리 흘러갔다.",
      keyExpressions: ['more ~ than I expected', 'exactly right'],
    },
    {
      id: 'p1-5',
      english: "I took the last train home. I didn't want to leave, but I have to get up early tomorrow. The city looked different on the way back — quieter, softer. I can still hear everyone laughing as I close my eyes.",
      koreanTranslation: "나는 마지막 기차를 타고 집으로 향했다. 떠나기 싫었지만, 내일 일찍 일어나야 했다. 돌아오는 길에 도시는 다르게 보였다 — 더 조용하고, 더 부드러웠다. 눈을 감으면 아직도 모두의 웃음소리가 들리는 것 같다.",
      keyExpressions: ["I didn't want to leave", 'I have to get up early'],
    },
  ],

  scenes: [
    {
      id: 's1-1',
      title: 'Friday Evening on the Train',
      titleKo: '금요일 저녁 기차 안',
      summary: 'Tired after a long week, the narrator rides the train home and just wants to rest. The city blurs past the window.',
      paragraphIds: ['p1-1'],
      patternIds: ['pt1-1'],
      imagePrompt: `Tired young professional in a moving train carriage at night. Looking out the window at blurred city lights. Soft overhead cabin lighting. Slightly melancholy but peaceful expression. Cinematic composition. Film grain texture. Magazine photography quality. 4:3 aspect ratio.`,
      videoPrompt: `Cinematic 8-second clip. A young man in his late 20s sits alone by the window in a quiet train carriage at night. Work bag on his lap, smart casual clothes. Warm amber overhead carriage lighting. Cool blue-white city light flickering through the dark window — blurred streaks of orange, white, and gold. He leans his head slightly against the window. Eyes distant, half-lidded, exhausted but peacefully empty. Natural breathing motion, a slow blink every few seconds. Camera: very slow push-in, barely perceptible — starts medium shot and ends medium close-up on his face over 8 seconds. Shallow depth of field. Warm amber tones with cool blue rim from window. Film grain. No text, no dialogue, no music. Seamless loop. 16:9. Cinematic color grade. High quality, realistic human motion.`,
      ambiencePrompt: `Ambient train interior sound. Evening commuter train. Steady rhythmic wheel clacking on rails. Low engine hum underneath. Very soft air conditioning fan. Barely audible distant voices — two or three passengers, completely indistinct. Occasional PA station chime echoing faintly in the distance. No music. No announcements. Peaceful and steady. Volume: low. Loop: seamless 30-second or longer.`,
    },
    {
      id: 's1-2',
      title: 'The Text — Changing Direction',
      titleKo: '문자 한 통 — 방향을 바꾸다',
      summary: 'A text from Jisu changes everything. The narrator gets off at the next stop, switches direction, and heads back into the city.',
      paragraphIds: ['p1-2', 'p1-3'],
      patternIds: ['pt1-4', 'pt1-5'],
      imagePrompt: `Young man on a night train, looking down at his glowing phone screen with a quiet smile. Warm screen light on his face. Other passengers slightly out of focus in background. Candid street photography style. Shallow depth of field. Cinematic grain.`,
      videoPrompt: `Cinematic 8-second clip, two beats. Beat 1 (0–3s): The same young man on the train looks down at his vibrating phone. Phone screen glow — cool blue-white light — illuminates his face in the dark carriage. He reads. A micro-beat of hesitation. Then a slow, genuine smile spreads naturally. He looks up: a quiet decision. Beat 2 (3–8s): He stands, grabs his bag with calm purpose. Doors slide open. He steps onto a night station platform under bright fluorescent lights. He glances at the platform sign, then turns with quiet confidence — as if the night has just changed direction. Camera: starts tight on phone, pulls back as he stands, follows him to the door, holds on him on the platform. Organic movement. No dialogue. 8 seconds. Seamless loop at phone buzz. Film grain. Cinematic.`,
      ambiencePrompt: `Urban train station platform ambience, evening. Train wheels slowing and stopping. Train door chime — pneumatic slide. Footsteps on concrete platform. Medium-density crowd ambient — not rush hour, but active. Distant PA echo. Faint city sounds from outside station entrance — traffic, wind. Purposeful, transitional energy. Volume: medium-low. Seamless loop.`,
    },
    {
      id: 's1-3',
      title: 'The Party — Last Train Home',
      titleKo: '파티 — 마지막 기차',
      summary: 'A warm apartment full of laughter. Then the quiet last train home, the city softer and slower at night.',
      paragraphIds: ['p1-4', 'p1-5'],
      patternIds: ['pt1-2', 'pt1-3'],
      imagePrompt: `Cozy apartment living room filled with friends laughing and talking at night. Warm golden pendant lighting. Drinks in hand. Joyful candid atmosphere. Bokeh background. Film photography feel. Intimate and alive.`,
      videoPrompt: `Cinematic 8-second clip with cross-dissolve at 4-second mark. Part A (0–4s): A warm apartment living room at night. 6–8 young adults talking, laughing, someone pouring a drink, two people leaning in sharing something funny. The protagonist visible slightly off-center — genuinely smiling, present. Warm golden pendant lighting (2400K). Camera slow rack focus from foreground to protagonist. Part B (4–8s): Cross-dissolve — golden party light bleeds into warm amber train light. Same young man on a near-empty late-night train. He looks out at softer, slower city lights. A private smile. Eyes close slowly at the very end. Camera mirrors Scene 1 push-in — intentional visual callback. Color-matched dissolve: golden party → golden train amber. Seamless loop. No dialogue. Film grain. Cinematic.`,
      ambiencePrompt: `Two-part ambient audio with crossfade. Part A: Small apartment gathering — 6–8 people, natural overlapping conversation and laughter, very low-volume soft instrumental background music, occasional glass clink, warm room acoustics. Part B (crossfades at midpoint): Late-night near-empty train — same wheel rhythm as opening scene but slightly slower and quieter, near-empty carriage air, barely one distant passenger. The contrast: warm alive sound → peaceful quiet. Volume: low. Loop: seamless.`,
    },
  ],

  patterns: [
    {
      id: 'pt1-1',
      pattern: 'all I wanted was to ~.',
      meaningKo: '내가 원했던 건 오직 ~뿐이었다',
      explanation: '지금 얼마나 지치고 단순한 바람만 남아 있는지 표현할 때 써요.\n"I just wanted to ~"보다 감정이 더 강조돼요.\n특별히 힘들었던 날 이야기할 때 자연스럽게 쓸 수 있어요.',
      storySentence: 'all I wanted was to get home, make some tea, and do nothing.',
      storySentenceKo: '내가 원했던 건 집에 돌아가 차 한 잔 마시며 아무것도 하지 않는 것뿐이었다.',
      variationSentence: 'After the meeting, all I wanted was to sit down and breathe.',
      variationSentenceKo: '회의 끝나고 나서 내가 원했던 건 그냥 앉아서 숨 좀 쉬는 것뿐이었어.',
      examples: [
        { en: "After the exam, all I wanted was to sleep for twelve hours.", ko: "시험이 끝나고 나서 내가 원했던 건 12시간 자는 것뿐이었어." },
        { en: "It was raining outside, and all I wanted was to stay in.", ko: "밖에 비가 왔고, 내가 원했던 건 그냥 집 안에 있는 것뿐이었어." },
        { en: "All I wanted was to hear her voice one more time.", ko: "내가 원했던 건 그냥 그녀의 목소리를 한 번 더 듣는 것뿐이었어." },
        { en: "On my birthday, all I wanted was a quiet dinner with family.", ko: "생일에 내가 원했던 건 가족과 조용한 저녁 식사뿐이었어." },
        { en: "After the long trip, all I wanted was a hot shower.", ko: "긴 여행 후에 내가 원했던 건 뜨거운 샤워뿐이었어." },
      ],
    },
    {
      id: 'pt1-2',
      pattern: 'I have to ~.',
      meaningKo: '나는 ~해야 한다',
      explanation: '의무나 필요성을 나타내는 가장 기본적인 패턴이에요.\n"I need to ~"나 "I must ~"와 비슷하지만 가장 자연스럽게 쓰여요.\n일상 회화에서 가장 많이 쓰이는 표현 중 하나예요.',
      storySentence: 'I have to get up early tomorrow.',
      storySentenceKo: '나는 내일 일찍 일어나야 해.',
      variationSentence: 'I have to finish this report before Friday.',
      variationSentenceKo: '나는 금요일 전에 이 보고서를 마쳐야 해.',
      examples: [
        { en: "I have to call my mom before she goes to sleep.", ko: "엄마 주무시기 전에 전화해야 해." },
        { en: "I have to renew my passport this month.", ko: "이번 달에 여권을 갱신해야 해." },
        { en: "I have to be at the airport by six in the morning.", ko: "아침 여섯 시까지 공항에 가야 해." },
        { en: "I have to study more if I want to pass the test.", ko: "시험에 통과하려면 더 공부해야 해." },
        { en: "I have to apologize — I said the wrong thing earlier.", ko: "사과해야 해 — 아까 잘못 말했어." },
      ],
    },
    {
      id: 'pt1-3',
      pattern: "I didn't ~.",
      meaningKo: '나는 ~하지 않았다 / ~하지 않았어',
      explanation: '과거에 하지 않은 행동을 말할 때 써요.\n"I don\'t ~"(현재)와 구별해서 사용하는 게 중요해요.\n일상 대화에서 자기 행동을 설명하거나 후회를 표현할 때 자주 써요.',
      storySentence: "I didn't want to leave.",
      storySentenceKo: "나는 떠나고 싶지 않았다.",
      variationSentence: "I didn't know the coffee shop would be closed on Sunday.",
      variationSentenceKo: "그 카페가 일요일에 문을 닫는지 몰랐어.",
      examples: [
        { en: "I didn't sleep well last night.", ko: "어젯밤에 잠을 잘 못 잤어." },
        { en: "I didn't bring an umbrella, so I got soaked.", ko: "우산을 안 가져와서 흠뻑 젖었어." },
        { en: "I didn't expect to enjoy the movie so much.", ko: "그 영화를 이렇게 재밌게 볼 줄 몰랐어." },
        { en: "I didn't say anything because I wasn't sure.", ko: "확신이 없어서 아무 말도 하지 않았어." },
        { en: "I didn't realize how late it was until I looked at my phone.", ko: "핸드폰을 보고 나서야 얼마나 늦었는지 알았어." },
      ],
    },
    {
      id: 'pt1-4',
      pattern: 'I just ~.',
      meaningKo: '나는 그냥 ~했다 / ~했을 뿐이야',
      explanation: '행동을 가볍게, 자연스럽게 표현할 때 써요.\n\"대단한 건 아니고 그냥~\" 이라는 뉘앙스가 있어요.\n설명하기 어려운 감정이나 충동적인 결정을 표현할 때 특히 자연스러워요.',
      storySentence: 'I just smiled at my own reflection in the dark window.',
      storySentenceKo: '나는 그냥 어두운 창문에 비친 내 모습을 보며 미소를 지었다.',
      variationSentence: 'I just wanted to see how the story ended.',
      variationSentenceKo: '나는 그냥 이야기가 어떻게 끝나는지 보고 싶었을 뿐이야.',
      examples: [
        { en: "I just needed five more minutes.", ko: "나는 그냥 5분만 더 필요했어." },
        { en: "I just laughed because I didn't know what else to do.", ko: "달리 어떻게 해야 할지 몰라서 그냥 웃었어." },
        { en: "I just sent her a quick message to say hi.", ko: "그냥 인사하려고 짧은 문자 보냈어." },
        { en: "I just wanted to make sure you were okay.", ko: "그냥 네가 괜찮은지 확인하고 싶었어." },
        { en: "I just ordered the first thing that looked good.", ko: "그냥 맛있어 보이는 첫 번째 걸 주문했어." },
      ],
    },
    {
      id: 'pt1-5',
      pattern: 'I can still ~.',
      meaningKo: '나는 아직도 ~할 수 있다 / 여전히 ~이 느껴진다',
      explanation: '과거의 느낌이나 경험이 아직 남아 있음을 표현해요.\n기억이나 감각이 생생하게 남아 있을 때 자연스럽게 쓸 수 있어요.\n\"still\"이 핵심 — 시간이 지났어도 사라지지 않은 무언가를 말해요.',
      storySentence: 'I can still hear everyone laughing as I close my eyes.',
      storySentenceKo: '눈을 감으면 아직도 모두의 웃음소리가 들리는 것 같다.',
      variationSentence: 'I can still taste the ramen we had after the movie.',
      variationSentenceKo: '영화 보고 먹은 라면 맛이 아직도 느껴져.',
      examples: [
        { en: "I can still remember the smell of her perfume.", ko: "그녀의 향수 냄새가 아직도 기억나." },
        { en: "I can still feel how cold the water was.", ko: "물이 얼마나 차가웠는지 아직도 느껴져." },
        { en: "I can still hear his laugh when I think about that day.", ko: "그날을 생각하면 아직도 그의 웃음소리가 들려." },
        { en: "I can still picture the view from the top of the hill.", ko: "언덕 꼭대기에서 본 풍경이 아직도 눈에 선해." },
        { en: "I can still feel the excitement from that night.", ko: "그날 밤의 설렘이 아직도 느껴져." },
      ],
    },
  ],

  ttsQueue: [
    { paragraphId: 'p1-1', text: "It was a Friday evening. I was on the train home, watching the city lights blur past the window. I had a long week at work and all I wanted was to get home, make some tea, and do nothing.", voice: 'us-female', status: 'pending' },
    { paragraphId: 'p1-2', text: 'Then my phone buzzed. A text from my friend Jisu: "We\'re having a little get-together tonight. You in?" I stared at the message. I didn\'t really feel like going out. But something made me pause.', voice: 'us-female', status: 'pending' },
    { paragraphId: 'p1-3', text: "I got off at the next stop and switched directions. I texted Jisu back: \"I'm on my way. I could be there by eight.\" The train was going the other way now, back into the city. I just smiled at my own reflection in the dark window.", voice: 'us-female', status: 'pending' },
    { paragraphId: 'p1-4', text: "When I arrived, the apartment was warm and full of laughter. There were more people than I expected, but the feeling was exactly right. We talked, we ate, and time passed faster than it should have.", voice: 'us-female', status: 'pending' },
    { paragraphId: 'p1-5', text: "I took the last train home. I didn't want to leave, but I have to get up early tomorrow. The city looked different on the way back — quieter, softer. I can still hear everyone laughing as I close my eyes.", voice: 'us-female', status: 'pending' },
  ],

  quality: {
    score: 99,
    grade: 'A+',
    reviewStatus: 'pass',
    checkedAt: '2026-06-27T00:00:00.000Z',
    failCount: 0,
    warningCount: 1,
  },
}
