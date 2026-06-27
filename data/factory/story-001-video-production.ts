/**
 * PATTO Story 001 — AI Scene Video Production Package
 *
 * "The Last Train Home"
 *
 * 이 파일은 Story 1의 영상 제작 기준 문서다.
 * Storyboard, Video Prompt, Ambience Spec, Poster Prompt를 포함한다.
 * 향후 800개 Story 영상 제작의 골든 템플릿.
 *
 * ── 지원 AI 영상 도구 ──────────────────────────────────────
 * Runway Gen-3 Alpha / Gen-4     https://runwayml.com
 * Google Veo 2 / Veo 3           https://deepmind.google/veo
 * Kling 1.6 / 2.0                https://kling.kuaishou.com
 * Luma Dream Machine 2.0         https://lumalabs.ai
 * Pika 2.2                       https://pika.art
 * ──────────────────────────────────────────────────────────
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORY ANALYSIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const story001Analysis = {
  title: 'The Last Train Home',
  storyId: '001',

  emotionalArc: [
    { beat: 1, emotion: 'exhausted / peaceful',  paragraph: 'p1-1', intensity: 2 },
    { beat: 2, emotion: 'hesitation / curiosity', paragraph: 'p1-2', intensity: 4 },
    { beat: 3, emotion: 'decision / lightness',   paragraph: 'p1-3', intensity: 6 },
    { beat: 4, emotion: 'warmth / joy',           paragraph: 'p1-4', intensity: 9 },
    { beat: 5, emotion: 'bittersweet / content',  paragraph: 'p1-5', intensity: 7 },
  ],

  locationArc: [
    { scene: 1, location: 'Train carriage — heading outward (night)',   lighting: 'warm cabin + cool city glow' },
    { scene: 2, location: 'Train → platform → train heading inward',   lighting: 'fluorescent platform + phone screen glow' },
    { scene: 3, location: "Friend's apartment (warm) → last train (night)", lighting: 'golden interior → dark window with soft city lights' },
  ],

  timeArc: [
    { scene: 1, time: 'Friday evening, golden hour ending' },
    { scene: 2, time: 'Night — transition moment' },
    { scene: 3, time: 'Late night → empty train' },
  ],

  visualThemes: [
    'City lights blurring through train window',
    'Phone screen glow in dark carriage',
    'Warm apartment vs cool train exterior',
    'Quiet man, one decision, entire mood changes',
    'Reflection in dark window = self-awareness',
    'Last train: city looks softer, quieter — changed perspective',
  ],

  colorPalette: {
    scene1: { primary: '#C8A97B', secondary: '#1A2A4A', accent: '#F5E6C8' }, // warm amber + deep navy + soft cream
    scene2: { primary: '#E8ECF0', secondary: '#2D3748', accent: '#4FC3F7' }, // station white + dark + phone blue
    scene3a: { primary: '#D4A04A', secondary: '#8B4513', accent: '#FFF8E7' }, // golden party warmth
    scene3b: { primary: '#8FA8C8', secondary: '#0D1B2A', accent: '#C8D8E8' }, // cool soft night
  },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORYBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const story001Storyboard = [
  {
    sceneId: 's1-1',
    sceneNumber: 1,
    title: 'Friday Evening on the Train',
    titleKo: '금요일 저녁 기차 안',
    duration: '8 seconds',
    paragraphIds: ['p1-1'],

    // ── 시각 구성 ──────────────────────────────────────────────────
    subject: 'Young man (late 20s). Work bag on lap. Slightly rumpled business casual.',
    action: 'Leaning against the window. Eyes half-closed, distant. Watching city lights blur past. Occasional slow blink. Barely moving.',
    background: 'Train carriage interior. Mostly empty seats. Overhead warm amber lighting strips. Dark window with streaks of orange and white city light.',

    camera: {
      type: 'Slow Push-In',
      start: 'Medium shot — man + full seat context',
      end: 'Medium close-up — face and window behind him',
      movement: 'Barely perceptible forward drift, 8 seconds total',
      angle: 'Eye level, slightly below — looking up at him',
    },

    lighting: {
      key: 'Warm overhead carriage lighting (amber, 2700K)',
      fill: 'Cool blue-white city light through window, intermittent and moving',
      mood: 'Cinematic warm-cool contrast. Face: amber. Side nearest window: cool flicker.',
      note: 'Every 1–2 seconds, a flash of brighter city light crosses his face — creates natural rhythm',
    },

    mood: 'Exhausted but peaceful. End-of-week quiet. No urgency.',
    colorGrade: 'Warm amber interior with occasional cool flicker. Slight desaturation. Film grain.',

    loopPoint: 'His eyes re-focus toward window → city light passes → back to distant gaze',
    transitionOut: 'Hold on his face as phone vibrates on his lap (Scene 2 begins)',
  },

  {
    sceneId: 's1-2',
    sceneNumber: 2,
    title: 'The Text — Changing Direction',
    titleKo: '문자 한 통 — 방향을 바꾸다',
    duration: '8 seconds',
    paragraphIds: ['p1-2', 'p1-3'],

    subject: 'Same young man. More alert now. Something shifted.',
    action: 'Beat 1 (0–3s): Looks down at buzzing phone. Reads. Hesitation — micro-pause. Then: slow, genuine smile spreads naturally.\nBeat 2 (3–6s): Looks up. Decision. Stands. Grabs bag.\nBeat 3 (6–8s): Steps off train onto platform. Looks at the platform sign. Then at the departures board. A quiet, purposeful turn.',

    background: 'Beat 1: Same train interior as Scene 1.\nBeat 2–3: Night station platform. Fluorescent platform lights. City sounds bleeding in. Other commuters passing. The original train departs behind him.',

    camera: {
      type: 'Follow + Pull Back',
      start: 'Tight on phone screen (phone light fills frame)',
      mid: 'Pull back to medium as he stands — reveal space around him',
      end: 'Side angle on platform as he steps off and turns',
      movement: 'Organic handheld-feel. Slight breathe in the frame.',
    },

    lighting: {
      key: 'Phone screen glow (cool blue-white) in dark carriage → platform fluorescent (neutral)',
      transition: 'Warm carriage amber → bright station white as he steps out',
      mood: 'Sharp, present. The drowsiness is gone.',
      note: 'Phone screen should be the brightest source in the train portion — key visual beat',
    },

    mood: 'Surprise → hesitation → the click of a decision. Quiet energy.',
    colorGrade: 'Cool phone-blue contrasting with warm carriage. Station: neutral clean white. Night platform at the end.',

    loopPoint: 'Phone buzzes → loop back. Or: man on platform turning → loop to phone buzz',
    transitionOut: 'He turns and looks toward the camera (or upward at the departure board) — sense of forward motion',
  },

  {
    sceneId: 's1-3',
    sceneNumber: 3,
    title: 'The Party — Last Train Home',
    titleKo: '파티 — 마지막 기차',
    duration: '8 seconds (4s party + 4s last train)',
    paragraphIds: ['p1-4', 'p1-5'],

    structure: 'TWO-PART SCENE with cross-dissolve at 4s mark',

    partA: {
      label: 'The Party (0–4s)',
      subject: 'Group of 6–8 friends. Mixed ages, 20s–30s. Casual and warm.',
      action: 'Laughing, talking. Someone pours a drink. Two people lean in to share something funny. The protagonist is visible, slightly side-on — genuinely smiling, not posed.',
      background: "Friend's apartment living room. Low ceiling, warm pendant lights, bookshelves, plants. Small table with food and drinks.",
      camera: { type: 'Slow Rack Focus', movement: 'Drift from foreground person to background group, then settle on protagonist' },
      lighting: { key: 'Warm golden pendant lamps (2400K)', fill: 'Spill from adjacent rooms', mood: 'Intimate, alive, golden' },
      mood: 'Joy. The kind that sneaks up on you. Exactly right.',
    },

    partB: {
      label: 'Last Train Home (4–8s)',
      subject: 'The same young man. Now alone. But differently — content, not lonely.',
      action: 'Sitting by the dark window. Looking out. A quiet, private smile — he is replaying the night. Eyes close slowly at the very end.',
      background: 'Near-empty late-night train. One or two passengers far back, out of focus.',
      camera: { type: 'Slow Push-In (mirror of Scene 1)', movement: 'Same camera movement as Scene 1 — intentional callback — but mood is completely different' },
      lighting: { key: 'Same warm carriage amber as Scene 1', fill: 'City lights outside — but now softer, slower (less traffic late at night)', mood: 'Peaceful. Bittersweet. Complete.' },
      mood: 'Bittersweet contentment. The night is over. But it stays with you.',
    },

    crossDissolve: {
      point: '4 second mark',
      type: 'Slow dissolve (12–20 frames), not a hard cut',
      matchCut: 'Party warm light dissolves into train warm light — color match bridges the two worlds',
    },

    colorGrade: 'Part A: rich golden amber. Part B: same amber but quieter — city lights shifted to softer blue-white.',
    loopPoint: 'Train scene → dissolve to party → dissolve back to train (infinite emotional loop)',
  },
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI VIDEO PROMPTS — PRODUCTION GRADE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 모든 AI 영상 도구(Runway, Kling, Veo, Luma, Pika)에 바로 붙여넣을 수 있도록
// 자기완결형 프롬프트로 작성.

export const story001VideoPrompts = {

  scene1: {
    sceneId: 's1-1',
    tool_universal: `Cinematic 8-second clip. A young man in his late 20s sits alone by the window in a quiet train carriage at night. He wears smart casual clothes, work bag on his lap. Warm amber overhead carriage lighting. Cool blue-white city light flickering intermittently through the dark window behind him — blurred streaks of orange, white, and gold. He leans his head slightly against the window. His eyes are distant, half-lidded, exhausted but peacefully empty. Natural, subtle breathing motion. A slow blink every few seconds. Camera: very slow push-in, barely perceptible — starts medium shot and ends medium close-up on his face over 8 seconds. Shallow depth of field. Warm amber tones with cool blue rim light from the window. Film grain overlay. No text, no dialogue, no music, no subtitles. Seamless loop. Aspect ratio 16:9. Cinematic color grade. High quality, realistic human motion.`,

    tool_runway: `[Runway Gen-3 / Gen-4]
Subject: Young man, late 20s, alone on night train
Action: Still, leaning against window, distant gaze out at blurred city lights
Camera: Slow push-in, barely perceptible, 8s total
Lighting: Warm amber cabin + cool blue window flicker
Mood: Exhausted, peaceful, end-of-week quiet
Style: Cinematic, film grain, shallow DOF, warm-cool color contrast
Duration: 8 seconds, seamless loop
No dialogue, no text, no music`,

    tool_kling: `[Kling 1.6 / 2.0]
A tired young man sits alone in a night train, leaning against the dark window. City lights streak and blur outside. Warm amber overhead light. His expression is calm and distant — end-of-long-week quiet. Barely any movement: slow breathing, occasional blink, eyes drifting. Camera slowly pushes in over 8 seconds. Film grain. Warm interior vs cool window light. Seamless 8-second loop. No dialogue.`,

    tool_veo: `[Google Veo 2 / Veo 3]
Cinematic scene. Night train interior. A young professional man sits alone, watching blurred city lights through the dark window. Amber cabin glow. His posture is relaxed, slightly tired. Eyes half-closed, faraway expression. Very subtle camera push-in movement. Warm vs cool lighting contrast. Film grain. 8-second seamless loop. Realistic. No speech, no text.`,
  },

  scene2: {
    sceneId: 's1-2',
    tool_universal: `Cinematic 8-second clip in two beats. Beat 1 (0–3s): The same young man from the train scene now looks down at his vibrating phone. Phone screen glow lights his face in the dark carriage — cool blue-white light against warm amber. He reads. A micro-beat of hesitation. Then a slow, genuine, natural smile spreads across his face — not performed, it arrives. He looks up. A quiet decision behind his eyes. Beat 2 (3–8s): He stands, grabs his bag with calm purpose. The train slows. Doors slide open. He steps onto a night station platform under bright fluorescent lights. He glances at the platform sign, then turns his body with quiet confidence — as if the night has just changed direction. Camera: starts tight on phone (phone light fills lower frame), pulls back naturally as he stands, follows him to the door, holds on him on the platform. Organic, naturalistic movement. Shallow depth of field. No dialogue. No music. Station ambient sound implied. 8 seconds. Seamless loop point: back to phone buzz. Cinematic. Film grain. High quality.`,

    tool_runway: `[Runway]
Two-beat scene. Beat 1: Man on night train, phone buzzes, he reads, genuine smile. Beat 2: He stands, steps off train, arrives on night platform with quiet purpose.
Camera: tight on phone → pull back → follow to door → hold on platform
Lighting: Phone screen glow in dark carriage → bright station fluorescent
Mood: Surprise → hesitation → quiet decision
Duration: 8 seconds, loop at phone buzz
No dialogue. Cinematic grain.`,

    tool_kling: `[Kling]
Young man on a night train. His phone buzzes. He looks down — phone light on his face. He reads something. Pauses. Then smiles — naturally, slowly. He stands up. Steps off at the next station. On the platform now, he looks around with quiet confidence. Camera follows him naturally. Warm carriage → bright platform. 8 seconds, seamless loop. No dialogue.`,

    tool_veo: `[Veo]
A young man receives a text on a night train. His phone lights his face. He reads. A real smile — not performed. He makes a decision and gets off at the next station. Platform fluorescent light. He pauses, then turns with purpose. Camera: close on phone, pulls back as he moves, holds on platform. 8 seconds. Cinematic. No speech.`,
  },

  scene3: {
    sceneId: 's1-3',
    tool_universal: `Cinematic 8-second clip with cross-dissolve transition at the 4-second mark. Part A (0–4s): A warm apartment living room at night. 6–8 young adults in their 20s and 30s — talking, laughing, someone pouring a drink, two people leaning in to share something funny. The protagonist is visible slightly off-center — genuinely smiling, present in the moment. Warm golden pendant lighting (2400K). Soft ambient party music at low volume, natural laughter, the clink of glasses. Camera drifts slowly, rack focus from foreground to protagonist. Intimate and alive. Part B (4–8s): Cross-dissolve — the warm gold party light bleeds into warm amber train light. The same young man now sits alone on a nearly empty late-night train. He looks out the dark window at softer, slower city lights — fewer cars, quieter streets. His expression is peaceful, content, quietly moved. A private smile: he is still with the night. His eyes close very slowly at the very end. Camera mirrors Scene 1 push-in — intentional visual callback. The city lights outside are gentler than before. Cross-dissolve at 4s bridges the two spaces with a color match — golden party warmth into golden train amber. Seamless loop. No dialogue. No music. Cinematic. Film grain. High quality.`,

    tool_runway: `[Runway]
Two-part scene with dissolve.
Part A (0–4s): Warm apartment party. Friends laughing, talking, drinks. Golden pendant light. Protagonist genuinely smiling in background.
Part B (4–8s): DISSOLVE to — same man, late-night train, soft city lights, peaceful private smile, eyes slowly close.
Camera A: slow rack focus drift. Camera B: slow push-in (mirrors Scene 1).
Color match dissolve — golden party → golden carriage amber.
Seamless loop. No dialogue. Cinematic grain.`,

    tool_kling: `[Kling]
Part 1: Warm apartment. A group of friends laughing and talking under golden lights. The protagonist smiles genuinely in the scene.
Cross-dissolve at 4 seconds.
Part 2: Late-night train. Same man. Alone. Soft city lights out the window. Peaceful expression — still carrying the warmth of the night. Camera slowly pushes in. His eyes close at the end.
8 seconds total. Seamless loop. Film grain. No dialogue.`,

    tool_veo: `[Veo]
Scene begins at a warm apartment gathering — friends, laughter, golden light. At 4 seconds, a soft cross-dissolve transitions to a quiet late-night train: the same man sits alone, looking out at soft blurred city lights, a quiet smile of contentment. Camera mirrors the opening train scene. The city outside looks gentler, softer. Eyes close slowly. 8 seconds. Cinematic. No dialogue.`,
  },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AMBIENCE SPECIFICATIONS — PER SCENE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const story001AmbienceSpecs = {

  scene1: {
    sceneId: 's1-1',
    label: 'Evening Train (Outbound)',
    volume: 0.22,
    elements: [
      { sound: 'Train wheels on tracks',           role: 'base layer',  volume: 'medium-low', note: 'Rhythmic clacking — 약 3박자 패턴' },
      { sound: 'Engine hum',                       role: 'sub-bass',    volume: 'very low',   note: 'Constant low-frequency underpinning' },
      { sound: 'Air conditioning / cabin fan',     role: 'white noise', volume: 'very low',   note: 'Fills silence naturally' },
      { sound: 'Distant passenger murmur',         role: 'ambient',     volume: 'barely',     note: '1–2 people very far away — indistinct' },
      { sound: 'Occasional station PA chime',      role: 'punctuation', volume: 'low',        note: 'Every 15–30 seconds, distant and echoed' },
    ],
    mood: 'Steady, rhythmic, private. The sound of being in transit and alone with your thoughts.',
    generationPrompt: `Ambient train interior sound. Evening commuter train. Steady rhythmic wheel clacking on rails at 60–70 km/h pace. Low engine hum underneath. Very soft air conditioning fan. Barely audible distant voices — two or three passengers, completely indistinct. Occasional PA station chime echoing faintly. No music. No announcements. Peaceful and steady. Volume: low. Loop: seamless 30-second or longer. High quality audio, no artifacts.`,
  },

  scene2: {
    sceneId: 's1-2',
    label: 'Phone → Platform (Transition)',
    volume: 0.25,
    elements: [
      { sound: 'Phone vibration buzz',             role: 'trigger cue',    volume: 'medium',     note: 'Short, 1-second. Unmistakable.' },
      { sound: 'Train decelerating',               role: 'scene transition', volume: 'medium-low', note: 'Slight squeal and change in rhythm' },
      { sound: 'Train doors sliding open (chime)', role: 'punctuation',    volume: 'medium',     note: 'Dinging chime + pneumatic door sound' },
      { sound: 'Platform footsteps on concrete',   role: 'active',         volume: 'medium-low', note: 'His footsteps — confident pace' },
      { sound: 'Station ambient crowd',            role: 'ambient',        volume: 'low',        note: 'Evening station — moderate foot traffic, not crowded' },
      { sound: 'City sounds bleeding in',          role: 'spatial cue',    volume: 'very low',   note: 'Traffic, wind from outside entrances' },
    ],
    mood: 'Energized. A decision made. Motion. The world opening up.',
    generationPrompt: `Urban train station platform ambience, evening. Transition: train wheels slowing and stopping. Train door chime — pneumatic slide. Footsteps on concrete platform. Medium-density crowd ambient — not rush hour, but active. Distant PA echo. Faint city sounds from outside station entrance — traffic, wind. Purposeful energy. Volume: medium-low. Seamless loop start and end at quiet crowd ambient. High quality.`,
  },

  scene3a: {
    sceneId: 's1-3a',
    label: 'The Party (Apartment)',
    volume: 0.20,
    elements: [
      { sound: 'Friends talking and laughing',     role: 'base layer',    volume: 'medium',     note: '6–8 voices. Overlapping. Natural. Warm room echo.' },
      { sound: 'Soft background music',            role: 'atmosphere',    volume: 'very low',   note: 'Acoustic or lo-fi. Just recognizable as music. Not dominant.' },
      { sound: 'Glasses/bottles clinking',         role: 'punctuation',   volume: 'low',        note: 'Once every 5–10 seconds. Warm clink.' },
      { sound: 'Kitchen sounds in background',     role: 'depth',         volume: 'barely',     note: 'Someone opening fridge, plates — creates spatial depth' },
    ],
    mood: 'Warm. Alive. Spontaneous. The sound of an unplanned good night.',
    generationPrompt: `Small house party / apartment gathering ambience. 6–8 people. Warm room acoustics. Natural overlapping conversation and laughter — genuine, not staged. Very low-volume soft background music (acoustic or lo-fi chill — instrumental only). Occasional glass or bottle clink. Faint kitchen sounds from adjacent room. No individual voices intelligible. Intimate warmth. Volume: medium-low. Loop: seamless. High quality.`,
  },

  scene3b: {
    sceneId: 's1-3b',
    label: 'Last Train Home (Late Night)',
    volume: 0.18,
    elements: [
      { sound: 'Train wheels — quieter pace',      role: 'base layer',    volume: 'low',        note: 'Same rhythm as Scene 1 but slightly slower — late night, fewer stops' },
      { sound: 'Engine hum',                       role: 'sub-bass',      volume: 'very low',   note: 'Same as Scene 1 — intentional audio callback' },
      { sound: 'Near-empty carriage air',          role: 'silence fill',  volume: 'barely',     note: 'The silence is louder than Scene 1 — emptiness has a sound' },
      { sound: 'Distant single passenger',         role: 'loneliness cue', volume: 'barely',    note: 'One person. A cough or page turn. Very distant.' },
    ],
    mood: 'Quieter than Scene 1. More space. The night has reached its fullness and now it breathes slowly.',
    generationPrompt: `Late-night nearly-empty train interior. Same wheel rhythm as an earlier scene but slightly slower, quieter pace. Near-empty carriage — the absence of crowd creates its own acoustic texture. Very faint single distant passenger. Low engine hum. No PA. No music. The peaceful silence of a train at the end of its journey. Volume: very low. Seamless loop. High quality.`,
  },

  // Combined playback order for Story Reader
  playbackSequence: [
    { sceneId: 's1-1', ambienceId: 'scene1',  crossfadeDuration: 0 },
    { sceneId: 's1-2', ambienceId: 'scene2',  crossfadeDuration: 1.5 },  // 1.5s crossfade at scene change
    { sceneId: 's1-3', ambienceId: 'scene3a', crossfadeDuration: 1.5 },  // party first
    // scene3b played after scene3a automatically — cross-fade handled in player
  ],
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POSTER IMAGE PROMPTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const story001PosterPrompts = {

  primary: {
    label: 'Main Poster — Train Window (Hero)',
    aspectRatios: ['9:16 (vertical / mobile)', '16:9 (horizontal / wide)', '4:3 (reader card)'],

    prompt: `Magazine-quality editorial photograph. A young man in his late 20s sits alone at a train window at night, photographed from outside the train looking in through the window — or from inside slightly side-on. His face is reflected faintly in the dark glass. Beyond him: blurred streaks of orange, amber, and white city lights rushing past. The composition divides horizontally: top half — dark sky + blurred light streaks; bottom half — warm amber carriage glow + his profile. His expression is calm, introspective, quietly alive. He is not sad. He is simply present. Film photography aesthetic. Grain. Kodak Portra 400 feel. Warm amber + deep navy color palette. No text, no overlay, no UI. High resolution. Usable as a story cover image.`,

    verticalFocus: 'Face centered, city lights as vertical streaks framing both sides. Strong vertical composition.',
    horizontalFocus: 'Man on left third (rule of thirds). City lights blurring across right two-thirds. Cinematic letterbox.',
  },

  alternative: {
    label: 'Alternative Poster — Party to Train Diptych',
    prompt: `Split-composition editorial photograph. Left half: warm golden apartment interior — blurred silhouettes of people gathered under pendant lights, glasses raised, movement implied. Right half: same young man on a dark train at night, peaceful expression, city lights soft behind him. The dividing line between the two worlds is clean but the color bleeds slightly at the edge — warm gold meets cool dark. Film photography style. No text. Cinematic.`,
  },

  minimal: {
    label: 'Minimal Poster — City Lights Abstract',
    prompt: `Abstract editorial photograph. Looking out of a moving train window at night. Complete bokeh — city lights become long blurred streaks of orange, white, amber, and occasional blue. No subject visible. Pure light and motion. Magazine abstract photography. Film grain. Warm palette. A lone pale reflection — barely a face — visible at bottom edge of frame. No text. Could be used as a background or moodboard image.`,
  },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRODUCTION SPECIFICATIONS — VIDEO FILES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const story001VideoSpecs = {
  format: 'MP4 (H.264 or H.265)',
  resolution: '1920×1080 minimum / 2560×1440 preferred',
  frameRate: '24fps (cinematic) or 30fps',
  duration: { scene1: '8s', scene2: '8s', scene3: '8s', total: '~24s' },
  loop: 'Seamless — last frame matches first frame within 2-frame tolerance',
  audio: 'No embedded audio in video file — ambience provided separately',
  colorSpace: 'sRGB for web delivery',
  compression: 'Target < 8MB per scene for web streaming',

  filePaths: {
    scene1: '/videos/story001-s1-1.mp4',
    scene2: '/videos/story001-s1-2.mp4',
    scene3: '/videos/story001-s1-3.mp4',
    combined: '/videos/story001-scene.mp4',   // optional: pre-edited 24s version
    poster:  '/images/story001-poster.jpg',
  },

  deliverables: [
    'story001-s1-1.mp4  — Scene 1, 8s, seamless loop',
    'story001-s1-2.mp4  — Scene 2, 8s, seamless loop',
    'story001-s1-3.mp4  — Scene 3, 8s (party → dissolve → train), seamless loop',
    'story001-poster.jpg — 1200×800 minimum, hero poster',
    'story001-ambience-train.mp3   — Scene 1 + Scene 3b ambience',
    'story001-ambience-platform.mp3 — Scene 2 ambience',
    'story001-ambience-party.mp3   — Scene 3a ambience',
  ],
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUBMIT KIT — AI 도구에 바로 제출 가능한 패키지
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 사용법: 도구별 prompt를 복사하여 AI 영상 생성 도구에 붙여넣기
// 생성된 MP4를 public/videos/story001-scene.mp4 로 저장 후
// npm run link-video -- --story 1 실행

export const story001SubmitKit = {
  storyId: '001',
  title: 'The Last Train Home',
  targetFile: 'public/videos/story001-scene.mp4',
  duration: '24 seconds (3 scenes × 8s)',
  status: 'prompt-ready',

  // ── 도구 선택 가이드 ────────────────────────────────────────────────────
  tools: {
    runway: {
      name: 'Runway Gen-3 Alpha / Gen-4',
      url: 'https://runwayml.com',
      strength: '카메라 움직임, 인물 모션, 연속성',
      scene1: story001VideoPrompts.scene1.tool_runway,
      scene2: story001VideoPrompts.scene2.tool_runway,
      scene3: story001VideoPrompts.scene3.tool_runway,
    },
    kling: {
      name: 'Kling 1.6 / 2.0',
      url: 'https://kling.kuaishou.com',
      strength: '한국/동아시아 인물, 감성 연출, 접근성',
      scene1: story001VideoPrompts.scene1.tool_kling,
      scene2: story001VideoPrompts.scene2.tool_kling,
      scene3: story001VideoPrompts.scene3.tool_kling,
    },
    veo: {
      name: 'Google Veo 2 / Veo 3',
      url: 'https://deepmind.google/veo',
      strength: '최고 품질, 현실감, 조명 품질',
      scene1: story001VideoPrompts.scene1.tool_veo,
      scene2: story001VideoPrompts.scene2.tool_veo,
      scene3: story001VideoPrompts.scene3.tool_veo,
    },
  },

  // ── 제출 체크리스트 ─────────────────────────────────────────────────────
  checklist: [
    '[ ] Scene 1 생성 완료 (8s seamless loop)',
    '[ ] Scene 2 생성 완료 (8s seamless loop)',
    '[ ] Scene 3 생성 완료 (8s — party → dissolve → train)',
    '[ ] 3개 Scene을 순서대로 편집하여 24초 MP4로 합치기',
    '[ ] public/videos/story001-scene.mp4 로 저장',
    '[ ] npm run link-video -- --story 1 실행',
    '[ ] /stories/1 에서 영상 재생 확인',
  ],

  // ── 편집 참고 ────────────────────────────────────────────────────────────
  editingNotes: {
    sceneOrder: 'Scene1 → Scene2 → Scene3 (순서 고정)',
    transition12: '하드 컷 — Scene 2 시작 직전 Scene 1의 전화 진동 소리와 맞추기',
    transition23: '크로스 디졸브 금지 — Scene 3 내부에서만 4초 지점에 디졸브',
    audio: '영상 파일에 오디오 임베드 금지 — 앱이 별도로 ambience 재생',
    format: 'MP4 H.264, 1920×1080 이상, 24fps, 8MB 이하',
  },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOLDEN TEMPLATE RULES
// 이 Story 1을 기준으로 향후 800개 Story에 적용할 영상 제작 표준
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const pattoVideoGoldenRules = {
  version: 'v1 — based on Story 001',
  establishedAt: '2026-06-27',

  rules: [
    {
      id: 'VR-01',
      rule: 'Story를 설명하지 않는다. Story를 시각적으로 표현한다.',
      detail: '영상은 스토리 내용을 요약하거나 자막처럼 보여주는 것이 아니다. 감정과 분위기를 전달한다.',
    },
    {
      id: 'VR-02',
      rule: '각 Scene은 독립적으로 완결되는 8초 루프여야 한다.',
      detail: '개별 Scene을 독립 재생해도 매끄러워야 한다. 루프 포인트는 시각적으로 자연스러워야 한다.',
    },
    {
      id: 'VR-03',
      rule: '카메라는 항상 천천히 움직인다.',
      detail: '빠른 컷, 줌, 패닝 금지. Slow push-in, slow rack focus, barely-perceptible drift만 허용.',
    },
    {
      id: 'VR-04',
      rule: '대사, 텍스트, 자막을 영상 안에 넣지 않는다.',
      detail: '영어 음성은 별도 TTS로 제공. 영상은 비주얼과 환경음만.',
    },
    {
      id: 'VR-05',
      rule: '감정 흐름과 조명이 일치해야 한다.',
      detail: 'Scene 1 (지침/평온) = 따뜻한 amber. Scene 3b (복귀/충만) = 같은 amber지만 더 부드럽고 조용하게.',
    },
    {
      id: 'VR-06',
      rule: 'Scene 3는 두 세계를 cross-dissolve로 연결한다.',
      detail: '하드 컷 금지. 파티 → 기차 전환은 color-matched dissolve로 연결해야 한다.',
    },
    {
      id: 'VR-07',
      rule: '환경음은 Scene별로 독립 트랙으로 제공한다.',
      detail: '영상 파일에 오디오를 임베드하지 않는다. 앱에서 볼륨을 제어해야 한다.',
    },
    {
      id: 'VR-08',
      rule: '포스터는 세로/가로 모두 사용 가능한 구도로 제작한다.',
      detail: '9:16 세로 (모바일 커버), 16:9 가로 (wide 뷰) 모두 커버되어야 한다.',
    },
    {
      id: 'VR-09',
      rule: '영상의 주인공은 특정 국적/인종이 명시되지 않아야 한다.',
      detail: '한국 학습자가 자신을 투영할 수 있도록. "young professional" 수준의 묘사로 충분.',
    },
    {
      id: 'VR-10',
      rule: '품질 기준: 실제 영화 B-roll 수준 이상.',
      detail: 'SNS 리일스나 유튜브 브이로그 느낌이 아닌, 단편영화 또는 광고 수준의 촬영/연출 품질.',
    },
  ],
}
