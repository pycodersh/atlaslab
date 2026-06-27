/**
 * PATTO Story Package — Story 002  (Schema v2.0)
 *
 * Title      : A Surprise Invitation
 * Theme      : Friendship
 * Mood       : Warm
 * Level      : A2
 * Reading    : 4 min
 * QC Score   : (see quality field)
 */

import type { StoryPackage } from '@/types/factory'

export const story002Package: StoryPackage = {
  schemaVersion: '2.0',
  packageId: 'story-002',
  language: 'en',
  createdAt: '2026-06-27T00:00:00.000Z',
  updatedAt: '2026-06-27T00:00:00.000Z',
  currentVersion: 'v1',
  history: [
    {
      version: 'v1',
      createdAt: '2026-06-27T00:00:00.000Z',
      createdBy: 'human',
      changes: ['Initial package created — PATTO Story Production System v1'],
    },
  ],

  metadata: {
    title: 'A Surprise Invitation',
    titleKo: '뜻밖의 초대',
    theme: 'friendship',
    mood: 'warm',
    difficulty: 'A2',
    languageLevel: 'A2',
    estimatedMinutes: 4,
    sceneCount: 3,
    patternCount: 5,
    storyLength: 22,
    wordCount: 230,
    tags: ['friendship', 'cafe', 'reunion', 'saturday', 'invitation', 'warm'],
    targetAudience: 'Korean adult beginners (A2) who enjoy warm, everyday friendship stories',
    setting: "A quiet apartment on a Saturday morning, then a small café near the river",
  },

  story: {
    id: 2,
    title: 'A Surprise Invitation',
    subtitleKo: '뜻밖의 초대',
    storyNote: '가끔 먼저 연락하지 않아도, 누군가 기억해주는 사람이 있어요.',
    highlightPhrases: [
      'I was just sitting',
      "I hadn't seen her in",
      "I wasn't sure if",
      'Would you like to',
      "It's been so long",
      "I'm so glad",
    ],
    ambienceId: 'cafe',
  },

  assets: {
    sceneVideo: {
      status: 'missing',
      url: '/videos/story002-scene.mp4',
      poster: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
    },
    scenePoster: {
      status: 'missing',
      url: '/images/story002-poster.jpg',
    },
    ambience: {
      status: 'missing',
      url: '/audio/ambience/story002.mp3',
      type: 'cafe',
      volume: 0.22,
    },
    storyTts: {
      voice: 'us-female',
      urls: {
        'p2-1': '/audio/tts/story002-p2-1.mp3',
        'p2-2': '/audio/tts/story002-p2-2.mp3',
        'p2-3': '/audio/tts/story002-p2-3.mp3',
        'p2-4': '/audio/tts/story002-p2-4.mp3',
        'p2-5': '/audio/tts/story002-p2-5.mp3',
        'p2-6': '/audio/tts/story002-p2-6.mp3',
      },
    },
    sceneImages: {
      enabled: true,
      status: 'missing',
      syncMode: 'tts-paragraph',
      transition: 'fade',
      kenBurns: true,
      images: [
        {
          id: 'scene-01',
          url: '/images/stories/story-002/scene-01.jpg',
          alt: '조용한 토요일 아침 — 소파에서 커피 한 잔과 함께 여유로운 시간',
          status: 'missing',
          linkedParagraphIds: ['p2-1'],
          durationSec: 8,
          scene: {
            title: 'Saturday Morning Coffee',
            summary: 'A young woman enjoys a slow Saturday morning alone on her sofa, warm coffee mug in both hands, no plans, no rush — just quiet contentment.',
            emotion: 'content',
            location: 'Home Living Room',
            timeOfDay: 'Saturday Morning',
          },
          production: {
            prompt: `Subject: A young Korean woman in her late 20s curled up on a comfortable sofa, holding a warm ceramic coffee mug with both hands, looking completely relaxed — no phone, no hurry, just morning stillness.
Environment: Clean, minimal modern apartment living room, sheer white curtains filtering soft morning light, a few plants, books nearby, cozy weekend atmosphere.
Lighting: Soft diffused natural morning light through curtains, no harsh shadows, gentle and even — quiet morning glow.
Mood: Peaceful contentment, unhurried weekend morning, quiet solitude before the day begins.
Camera Composition: Medium shot, subject slightly off-center, sofa and room visible to establish environment, coffee mug prominent in frame.
Style: Cinematic realistic photography, fine film grain, 16:9 ratio.
Color Tone: Soft warm whites and cream tones, morning light palette, gentle desaturation with warm push on wood and fabric surfaces.`,
            style: 'realistic-cinematic-warm',
          },
        },
        {
          id: 'scene-02',
          url: '/images/stories/story-002/scene-02.jpg',
          alt: '오래된 친구 Mia에게서 뜻밖의 초대 메시지 — 놀라움과 기쁨이 담긴 표정',
          status: 'missing',
          linkedParagraphIds: ['p2-2', 'p2-3'],
          durationSec: 8,
          scene: {
            title: 'An Unexpected Message',
            summary: 'A text from an old university friend breaks the quiet Saturday morning — a surprise lunch invitation that sparks both shock and warm delight.',
            emotion: 'surprised',
            location: 'Home Living Room',
            timeOfDay: 'Saturday Morning',
          },
          production: {
            prompt: `Subject: A young Korean woman in her late 20s holding a smartphone in both hands, face partially visible above the screen — eyes slightly wide with pleasant surprise, a small genuine smile beginning to form.
Environment: Bright Saturday morning living room interior, same sofa setting as scene-01, morning light from window, coffee mug visible nearby.
Lighting: Warm natural morning light as key, soft smartphone screen glow contributing secondary warm light on her face.
Mood: Surprise turning to delight, a quiet morning interrupted by something unexpectedly wonderful.
Camera Composition: Close-up to medium, hands and phone occupy lower two-thirds of frame, face in upper third, soft background blur.
Style: Cinematic realistic photography, fine film grain, 16:9 ratio, no text visible on phone screen.
Color Tone: Warm morning whites and creams, slightly brighter and more saturated than scene-01 to reflect the emotional lift.`,
            style: 'realistic-cinematic-warm',
          },
        },
        {
          id: 'scene-03',
          url: '/images/stories/story-002/scene-03.jpg',
          alt: '강가 근처 작은 카페에서 오랜 친구 Mia와 재회 — 3년 만의 만남',
          status: 'missing',
          linkedParagraphIds: ['p2-4', 'p2-5'],
          durationSec: 8,
          scene: {
            title: 'Café Reunion',
            summary: 'Two old university friends meet face-to-face for the first time in three years at a cozy riverside café, their conversation picking up exactly where it left off.',
            emotion: 'warm',
            location: 'Small Riverside Café',
            timeOfDay: 'Saturday Afternoon',
          },
          production: {
            prompt: `Subject: Two young Korean women in their late 20s sitting across from each other at a small wooden café table near a large window — mid-conversation, genuine warm smiles, leaning slightly forward, clearly happy to be reunited after years apart.
Environment: Intimate riverside café, small wooden tables, warm interior, afternoon natural light streaming through the window, two coffee cups on the table, café plants and soft décor visible.
Lighting: Afternoon window light as key — warm natural fill with soft café interior ambient lighting.
Mood: Warm reconnection, the ease of a long friendship instantly revived, joy in rediscovery.
Camera Composition: Medium two-shot, both women visible in frame, table between them, window light from one side, shallow depth of field on background.
Style: Cinematic realistic photography, fine film grain, 16:9 ratio.
Color Tone: Warm golden-amber café tones, natural wood and cream palette, soft afternoon light saturation.`,
            style: 'realistic-cinematic-warm',
          },
        },
        {
          id: 'scene-04',
          url: '/images/stories/story-002/scene-04.jpg',
          alt: '몇 시간째 이야기가 이어지는 카페 — 케이크를 나누며 웃는 두 사람',
          status: 'missing',
          linkedParagraphIds: ['p2-6'],
          durationSec: 8,
          scene: {
            title: 'Friends Forever',
            summary: 'Hours have passed but neither wants to leave. Sharing a slice of cake, laughing, the afternoon stretching on — some friendships never really fade.',
            emotion: 'joyful',
            location: 'Small Riverside Café',
            timeOfDay: 'Saturday Afternoon',
          },
          production: {
            prompt: `Subject: Two young Korean women in their late 20s sharing a slice of cake at the same café table — laughing openly, animated, one gesturing mid-story, the other leaning back in laughter.
Environment: Same cozy riverside café, table now showing more time spent — empty coffee cups, cake plates, small crumbs, late afternoon light softer than earlier.
Lighting: Softer late-afternoon window light, slightly warmer and lower angle than scene-03, golden-hour indoor quality.
Mood: Uninhibited joy, the pure pleasure of old friendship, time passing unnoticed.
Camera Composition: Medium shot, both subjects in frame, cake and table prominently visible in foreground, loose and natural framing to capture the spontaneity of the moment.
Style: Cinematic realistic photography, fine film grain, 16:9 ratio.
Color Tone: Richer and warmer than scene-03 — late afternoon gold, deeper amber tones, slightly higher saturation to match the elevated emotion.`,
            style: 'realistic-cinematic-warm',
          },
        },
      ],
    },
  },

  paragraphs: [
    {
      id: 'p2-1',
      english: "It was a quiet Saturday morning. I was just sitting on my sofa with a cup of coffee when my phone buzzed. I didn't expect anyone to message me so early.",
      koreanTranslation: "조용한 토요일 아침이었다. 소파에 앉아 막 커피 한 잔을 마시고 있었는데, 그때 휴대폰이 울렸다. 이렇게 일찍 메시지가 올 거라곤 생각지도 못했다.",
      keyExpressions: ['I was just ~ing', "I didn't expect ~"],
    },
    {
      id: 'p2-2',
      english: "It was a message from my old friend Mia. We went to university together, but I hadn't seen her in over three years. I wasn't sure if she still lived in the city.",
      koreanTranslation: "오랜 친구 미아에게서 온 메시지였다. 우리는 대학 동기였지만, 만난 지 3년이 넘었다. 그녀가 아직 같은 도시에 살고 있는지도 몰랐다.",
      keyExpressions: ["I hadn't ~ed in ~", "I wasn't sure if ~"],
    },
    {
      id: 'p2-3',
      english: "Her message said: 'Hey! I'm in town this weekend. Would you like to meet for lunch?' I read it twice. I felt surprised and happy at the same time.",
      koreanTranslation: "메시지에는 이렇게 적혀 있었다: '야! 나 이번 주말에 거기 있어. 점심 같이 할래?' 두 번이나 읽었다. 놀랍기도 하고 기쁘기도 했다.",
      keyExpressions: ['Would you like to ~?', 'at the same time'],
    },
    {
      id: 'p2-4',
      english: "I replied right away and started getting ready. I took the subway to the small café she suggested near the river. I hadn't been to that part of the city in a long time.",
      koreanTranslation: "바로 답장을 보내고 서둘러 준비했다. 그녀가 알려준 강 근처의 작은 카페로 지하철을 타고 갔다. 그쪽 동네는 정말 오랜만이었다.",
      keyExpressions: ["I hadn't been to ~ in a long time", 'started getting ready'],
    },
    {
      id: 'p2-5',
      english: "When I walked in, I saw Mia right away. She looked exactly the same, but her smile was even warmer. 'It's been so long!' she said, and pulled me into a hug. I'm so glad we made this happen.",
      koreanTranslation: "안으로 들어서자마자 미아가 눈에 들어왔다. 예전 모습 그대로였지만, 미소는 더 따뜻해진 것 같았다. '정말 오랜만이다!' 그녀가 말하며 나를 꼭 안아줬다. 이렇게 만나게 되어 정말 기뻤다.",
      keyExpressions: ["It's been so long!", "I'm so glad ~"],
    },
    {
      id: 'p2-6',
      english: "We talked for hours about everything and nothing. We ordered more coffee and a piece of cake to share. Walking home later, I thought — some friendships never really fade.",
      koreanTranslation: "우리는 몇 시간이나 이것저것 이야기를 나눴다. 커피도 더 시키고, 케이크도 나눠 먹었다. 집으로 걸어오면서 생각했다 — 어떤 우정은 절대 사라지지 않는다.",
      keyExpressions: ['I thought —', 'never really fade'],
    },
  ],

  scenes: [
    {
      id: 's2-1',
      title: 'A Quiet Saturday Morning',
      titleKo: '조용한 토요일 아침',
      summary: 'The narrator relaxes at home on a Saturday morning with coffee. An unexpected message arrives from an old friend she has not seen in years.',
      paragraphIds: ['p2-1', 'p2-2'],
      patternIds: ['pt2-1', 'pt2-2', 'pt2-4'],
      imagePrompt: `A young Korean woman in her late 20s sitting alone on a light sofa on a Saturday morning. Holding a warm ceramic coffee mug in both hands. Soft natural morning light through sheer curtains. Cozy, minimal home interior. Relaxed and content expression. Film grain. Warm-neutral tones. Magazine lifestyle editorial photography. 4:3 aspect ratio.`,
      videoPrompt: `A young woman sits on a sofa, cradling a coffee mug. Morning light fills the room through white curtains. She glances down as her phone buzzes on the cushion beside her. She picks it up. Her expression shifts from peaceful to quietly surprised. Camera: gentle slow push-in. 5–8 seconds. Seamless loop. No dialogue. Soft ambient morning sounds only.`,
      ambiencePrompt: `Quiet Saturday morning apartment ambience. Soft air conditioner hum. Clock ticking very faintly. Distant city traffic barely audible through the window. Occasional bird chirping outside. Coffee maker finishing in the background kitchen. Still, warm, unhurried morning. Volume: very low. Loop: seamless.`,
    },
    {
      id: 's2-2',
      title: 'The Invitation',
      titleKo: '초대장 한 통',
      summary: 'The narrator reads the invitation, feels a mix of surprise and happiness, and gets ready to meet her friend at a café near the river.',
      paragraphIds: ['p2-3', 'p2-4'],
      patternIds: ['pt2-3'],
      imagePrompt: `Young woman in casual weekend clothes standing near a bright window, reading her phone with a warm, surprised smile. Soft diffused daylight. Cozy home interior visible behind her. Candid, natural moment. Magazine editorial photography. Natural light. Warm color palette. Shallow depth of field.`,
      videoPrompt: `A young woman reads a message on her phone near a sunlit window. A slow, genuine smile spreads across her face. She moves through her apartment — picking up a jacket, checking herself in the mirror, stepping out the door. Camera follows softly. 6–8 seconds. Cinematic, seamless loop. No dialogue. Light, purposeful energy.`,
      ambiencePrompt: `Indoor apartment transitioning to outdoor city ambience. Light footsteps on flooring. Drawer opening and closing. Door clicking shut softly. Then: outdoor city sounds — light street traffic, footsteps on pavement, distant voices. Subway platform ambient hum in the distance. Bright, purposeful, calm movement sound. Volume: low-medium. Loop: seamless.`,
    },
    {
      id: 's2-3',
      title: 'A Warm Reunion',
      titleKo: '따뜻한 재회',
      summary: 'At the café, the two old friends reunite with a hug and spend hours talking. The afternoon disappears without them noticing.',
      paragraphIds: ['p2-5', 'p2-6'],
      patternIds: ['pt2-5'],
      imagePrompt: `Two young women sitting across from each other at a small wooden café table. Warm afternoon light through the window. Coffee cups and a shared slice of cake between them. Both smiling and talking. Intimate and candid atmosphere. Film photography feel. Warm bokeh background. Lifestyle editorial photography. 4:3 aspect ratio.`,
      videoPrompt: `Two friends sit at a small café table by the window. Afternoon light streams in softly. They talk and laugh. One reaches over to share a fork of cake. Cups are refilled. The light shifts subtly warmer as time passes. Camera: slow, barely perceptible zoom out. 6–8 seconds. Seamless loop. No dialogue. Warm café ambient sounds only.`,
      ambiencePrompt: `Small cozy café afternoon ambience. Espresso machine steaming gently in the background. Soft murmur of conversation from nearby tables. Acoustic or soft jazz music at very low volume. Cups and saucers clinking gently. Warm indoor room echo. The ambient sound of an unhurried afternoon shared between two people. Volume: low. Loop: seamless.`,
    },
  ],

  patterns: [
    {
      id: 'pt2-1',
      pattern: 'I was just ~ing.',
      meaningKo: '막 ~하고 있었어',
      explanation: '다른 일을 하고 있다가 갑자기 무슨 일이 생겼을 때 써요.\n"막 ~하고 있었는데 갑자기…" 이런 상황에서 정말 자연스러운 표현이에요.\n일상 대화에서 상황을 생생하게 전달할 때 자주 씁니다.',
      storySentence: 'I was just sitting on my sofa with a cup of coffee when my phone buzzed.',
      storySentenceKo: '소파에 앉아 막 커피 한 잔을 마시고 있었는데, 그때 휴대폰이 울렸다.',
      variationSentence: 'I was just thinking about you when you called.',
      variationSentenceKo: '막 네 생각을 하고 있었는데 전화가 왔어.',
      examples: [
        { en: "I was just about to call you.", ko: "막 너한테 전화하려던 참이었어." },
        { en: "I was just reading when the doorbell rang.", ko: "막 책을 읽고 있었는데 초인종이 울렸어." },
        { en: "I was just making dinner when my friend arrived.", ko: "막 저녁을 만들고 있었는데 친구가 왔어." },
        { en: "I was just leaving when I got your message.", ko: "막 나가려던 참에 네 문자를 받았어." },
        { en: "I was just thinking the same thing.", ko: "나도 막 같은 생각을 하고 있었어." },
      ],
    },
    {
      id: 'pt2-2',
      pattern: "I hadn't ~ed in ~.",
      meaningKo: '~한 지 ~이 됐다',
      explanation: '오랫동안 하지 못한 일을 이야기할 때 써요.\n"in a long time", "in years", "in months" 같은 표현과 자주 함께 써요.\n그리움이나 오랜 공백을 자연스럽게 전달하는 표현이에요.',
      storySentence: "I hadn't seen her in over three years.",
      storySentenceKo: "만난 지 3년이 넘었다.",
      variationSentence: "I hadn't eaten pizza in months.",
      variationSentenceKo: "피자를 먹은 지 몇 달이 됐어.",
      examples: [
        { en: "I hadn't been to the gym in weeks.", ko: "헬스장을 간 지 몇 주가 됐어." },
        { en: "I hadn't slept that well in a long time.", ko: "그렇게 잘 잔 게 오랜만이었어." },
        { en: "I hadn't talked to him in years.", ko: "그 사람이랑 연락한 지 몇 년이 됐어." },
        { en: "I hadn't read a book in so long.", ko: "책을 읽은 지 정말 오래됐어." },
        { en: "I hadn't visited my hometown in over a year.", ko: "고향에 간 지 1년이 넘었어." },
      ],
    },
    {
      id: 'pt2-3',
      pattern: 'Would you like to ~?',
      meaningKo: '~하시겠어요? / ~할래요?',
      explanation: '누군가를 무언가에 초대하거나 제안할 때 정중하게 쓰는 표현이에요.\n"Do you want to ~?"보다 한 단계 더 공손한 느낌이에요.\n친구에게도, 처음 만난 사람에게도 자연스럽게 쓸 수 있어요.',
      storySentence: 'Would you like to meet for lunch?',
      storySentenceKo: '점심 같이 할래?',
      variationSentence: 'Would you like to come over for dinner this weekend?',
      variationSentenceKo: '이번 주말에 저녁 먹으러 우리 집에 올래요?',
      examples: [
        { en: "Would you like to try some?", ko: "좀 드셔볼래요?" },
        { en: "Would you like to join us?", ko: "같이 하실래요?" },
        { en: "Would you like to take a seat?", ko: "앉으시겠어요?" },
        { en: "Would you like to order now?", ko: "지금 주문하시겠어요?" },
        { en: "Would you like to go for a walk?", ko: "같이 산책할래요?" },
      ],
    },
    {
      id: 'pt2-4',
      pattern: "I wasn't sure if ~.",
      meaningKo: '~인지 확실하지 않았어 / ~인지 몰랐어',
      explanation: '뭔가를 잘 몰라서 확신이 없었을 때 쓰는 표현이에요.\n상대방 상황을 모르거나 어떻게 해야 할지 모를 때 자연스럽게 나와요.\n"I didn\'t know if ~"와 비슷하지만 더 자연스럽게 들리는 경우가 많아요.',
      storySentence: "I wasn't sure if she still lived in the city.",
      storySentenceKo: "그녀가 아직 같은 도시에 살고 있는지도 몰랐다.",
      variationSentence: "I wasn't sure if the café would be open on Sunday.",
      variationSentenceKo: "그 카페가 일요일에 열었는지 몰랐어.",
      examples: [
        { en: "I wasn't sure if he was joking.", ko: "그게 농담인지 아닌지 몰랐어." },
        { en: "I wasn't sure if I had the right address.", ko: "주소가 맞는지 확신이 없었어." },
        { en: "I wasn't sure if you wanted to come.", ko: "네가 오고 싶은 건지 몰랐어." },
        { en: "I wasn't sure if the meeting was today or tomorrow.", ko: "회의가 오늘인지 내일인지 몰랐어." },
        { en: "I wasn't sure if I made the right decision.", ko: "내가 맞는 결정을 한 건지 확신이 없었어." },
      ],
    },
    {
      id: 'pt2-5',
      pattern: "I'm so glad ~.",
      meaningKo: '~해서 정말 기뻐 / ~해서 다행이야',
      explanation: '뭔가 잘 됐거나 기쁜 일이 있을 때 진심을 담아 표현하는 말이에요.\n"so"가 들어가서 감정이 더 강하게 전달돼요.\n친구에게 감사함을 전할 때도, 안도감을 표현할 때도 자주 써요.',
      storySentence: "I'm so glad we made this happen.",
      storySentenceKo: "이렇게 만나게 되어 정말 기뻤다.",
      variationSentence: "I'm so glad you told me about that place.",
      variationSentenceKo: "그 곳을 알려줘서 정말 고마워.",
      examples: [
        { en: "I'm so glad you came.", ko: "와줘서 정말 기뻐." },
        { en: "I'm so glad to hear that.", ko: "그 말을 들으니 정말 다행이야." },
        { en: "I'm so glad everything worked out.", ko: "모든 게 잘 풀려서 정말 기뻐." },
        { en: "I'm so glad we finally met.", ko: "드디어 만나게 되어서 정말 기뻐." },
        { en: "I'm so glad you enjoyed it.", ko: "네가 즐거웠다니 정말 기뻐." },
      ],
    },
  ],

  ttsQueue: [
    {
      paragraphId: 'p2-1',
      text: "It was a quiet Saturday morning. I was just sitting on my sofa with a cup of coffee when my phone buzzed. I didn't expect anyone to message me so early.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'p2-2',
      text: "It was a message from my old friend Mia. We went to university together, but I hadn't seen her in over three years. I wasn't sure if she still lived in the city.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'p2-3',
      text: "Her message said: 'Hey! I'm in town this weekend. Would you like to meet for lunch?' I read it twice. I felt surprised and happy at the same time.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'p2-4',
      text: "I replied right away and started getting ready. I took the subway to the small café she suggested near the river. I hadn't been to that part of the city in a long time.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'p2-5',
      text: "When I walked in, I saw Mia right away. She looked exactly the same, but her smile was even warmer. 'It's been so long!' she said, and pulled me into a hug. I'm so glad we made this happen.",
      voice: 'us-female',
      status: 'pending',
    },
    {
      paragraphId: 'p2-6',
      text: "We talked for hours about everything and nothing. We ordered more coffee and a piece of cake to share. Walking home later, I thought — some friendships never really fade.",
      voice: 'us-female',
      status: 'pending',
    },
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
