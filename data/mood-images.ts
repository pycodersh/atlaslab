// ── PATTO Mood Image System ─────────────────────────────────────────────────────
//
// 에디토리얼 매거진 철학: 스토리 내용을 설명하는 이미지가 아니라,
// 스토리를 읽고 싶게 만드는 이미지. 분위기(Mood)로 선택.
//
// 이미지 스타일 원칙:
//   ✓ 자연광 · Editorial Photography · Lifestyle · Minimal · Warm Tone · Film 느낌
//   ✓ 카페/커피, 책/노트, 창가/햇살, 거리/골목, 여행, 꽃, 디저트, 뒷모습/실루엣
//   ✗ 동물 클로즈업, 과도한 AI/3D, 만화, 네온, 과장된 표정, 저품질 스톡

import type { StorySlideImage } from '@/types/magazine'

export type MoodKey =
  | 'morning'      // 아침 햇살, 커피, 노트, 일기
  | 'cafe'         // 카페 인테리어, 커피, 대화, 따뜻한 빛
  | 'study'        // 밤 책상, 노트북, 조명, 집중
  | 'rain'         // 창가, 빗소리, 사색, 젖은 거리
  | 'reflection'   // 사색, 결정, 감정, 혼자인 순간
  | 'mountains'    // 산길, 숲, 호수, 자연 트레일
  | 'home'         // 집, 식탁, 따뜻한 식사, 생활
  | 'travel'       // 여행, 해변, 공항, 지도, 여권
  | 'work'         // 사무실, 회의, 도시 야경, 노트북
  | 'weekend'      // 주말 여유, 책, 따뜻한 음료, 휴식
  | 'city-walk'    // 도시 거리, 골목, 황혼, 도시 풍경
  | 'nature'       // 공원, 숲, 자연광, 계절

// Unsplash URL 빌더
const U = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`

// Mood별 Unsplash 이미지 Pool
// 모든 ID는 기존 magazine-stories.ts에서 실제 사용 중인 확인된 ID
const MOOD_POOLS: Record<MoodKey, string[]> = {
  morning: [
    '1506784983877-45594efa4cbe', // planner and coffee on desk
    '1525610553991-2bede1a236e2', // bright kitchen in morning light
    '1564890369478-c89ca6d9cde9', // warm cup of tea
    '1484723091739-30a097e8f929', // simple breakfast on kitchen table
    '1484480974693-6ca0a78fb36b', // soft morning light filling quiet room
    '1531346878377-a5be20888e57', // hand writing first lines on fresh page
    '1456513080510-7bf3a84b82f8', // open notebook ready for first entry
    '1571934811356-5cc061b6821f', // warm drink during calm morning
    '1517021897933-0e0319cfbc28', // morning light through window
    '1512820790803-83ca734da794', // quiet desk with open book at dawn
  ],

  cafe: [
    '1543007630-9710e4a00a20',    // two friends at cafe table
    '1554118811-1e0d58224f24',    // warm interior of quiet cafe
    '1447933601403-0c6688de566e', // two cups of coffee shared across table
    '1521017432531-fbd92d768814', // friends talking closely over coffee
    '1530103862676-de8c9debad1d', // easy instant connection
    '1493663284031-b7e3aefcae8e', // warm easy moment between friends
    '1524678606370-a47ad25cb82a', // quiet seat by cafe window
    '1497366754035-f200968a6e72', // tidy cafe table
    '1551183053-bf91a1d81141',    // espresso and light
    '1488477181946-6428a0291777', // dessert on cafe table
  ],

  study: [
    '1531538606174-0f90ff5dce83', // desk with notes the night before
    '1488190211105-8b0e65b80b4e', // reviewing slides late on laptop
    '1508057198894-247b23fe5ade', // alarm clock set for early morning
    '1497366754035-f200968a6e72', // tidy desk ready for tomorrow
    '1544716278-ca5e3f4abd8c',    // warm lamp-lit desk at night
    '1517842645767-c639042777db', // calm notebook for thinking
    '1512820790803-83ca734da794', // quiet desk with open book
    '1524995997946-a1c2e315a42f', // calm desk for breaking work into phases
    '1456513080510-7bf3a84b82f8', // open notebook
    '1531346878377-a5be20888e57', // hand writing on fresh page
  ],

  rain: [
    '1428592953211-077101b2021b', // rainy window on a hard day
    '1524678606370-a47ad25cb82a', // sitting quietly by window in evening
    '1517021897933-0e0319cfbc28', // thoughtful moment looking out window
    '1571934811356-5cc061b6821f', // warm drink during calm reflective night
    '1444653614773-995cb1ef9efa', // quiet street on a grey day
    '1493663284031-b7e3aefcae8e', // cozy room on rainy day
    '1512820790803-83ca734da794', // quiet desk with book on rainy afternoon
    '1507003211169-0a1dd7228f2d', // thoughtful face by window
  ],

  reflection: [
    '1524678606370-a47ad25cb82a', // sitting quietly by window in evening
    '1517021897933-0e0319cfbc28', // thoughtful moment looking out window
    '1454165804606-c3d57bc86b40', // handwritten list weighing a decision
    '1499209974431-9dddcece7f88', // sitting in thought trying to decide
    '1507003211169-0a1dd7228f2d', // thoughtful face after honest moment
    '1476994230281-1448088947db', // path that splits into two directions
    '1571934811356-5cc061b6821f', // warm drink during calm reflective night
    '1512820790803-83ca734da794', // quiet desk with open book
    '1517842645767-c639042777db', // calm notebook for thinking it through
    '1531346878377-a5be20888e57', // a hand writing slowly
  ],

  mountains: [
    '1441974231531-c6227db76b6e', // quiet forest path in autumn
    '1518562180175-34a163b1a9a6', // steep trail winding up through trees
    '1501785888041-af3ef285b470', // calm lake seen from the trail
    '1470071459604-3b5ec3a7fe05', // wide mountain view from the top
    '1476994230281-1448088947db', // path through nature
    '1517248135467-4c7edcad34c4', // warm light through forest canopy
  ],

  home: [
    '1414235077428-338989a2e8c0', // restaurant table set by window
    '1551183053-bf91a1d81141',    // a plate of pasta — chef's special
    '1488477181946-6428a0291777', // dessert to share at end of meal
    '1517248135467-4c7edcad34c4', // warm evening with friends
    '1493663284031-b7e3aefcae8e', // relaxed moment at home
    '1600518464441-9154a4dea21b', // cardboard moving boxes
    '1502672260266-1c1ef2d93688', // empty apartment becoming home
    '1607344645866-009c320b63e0', // last boxes ready for the move
    '1484723091739-30a097e8f929', // fresh bread on kitchen table
    '1571934811356-5cc061b6821f', // warm drink on the couch
  ],

  travel: [
    '1488646953014-85cb44e25828', // map and notes spread out for trip
    '1488085061387-422e29b40080', // passport ready for the coast trip
    '1507525428034-b723cf961d3e', // beach waiting at end of the journey
    '1505228395891-9a51e7e86bf6', // quiet coastline to explore
    '1444723121867-7a241cacace9', // new city skyline waiting ahead
    '1517248135467-4c7edcad34c4', // warm evening in a foreign city
    '1531538606174-0f90ff5dce83', // travel notes and planning
    '1476994230281-1448088947db', // a path that leads somewhere new
  ],

  work: [
    '1486406146926-c627a92ad1ab', // city lights through office window at dusk
    '1519389950473-47ba0277781c', // team meeting in progress
    '1531973576160-7125cd663d86', // learning the system on first afternoon
    '1497366754035-f200968a6e72', // tidy desk ready for the day
    '1531538606174-0f90ff5dce83', // desk buried in notes and deadlines
    '1488190211105-8b0e65b80b4e', // laptop open for a long work session
    '1508057198894-247b23fe5ade', // clock counting down to deadline
    '1524995997946-a1c2e315a42f', // calm desk for breaking work into phases
    '1517842645767-c639042777db', // notebook with structured plan
    '1444723121867-7a241cacace9', // city skyline from office perspective
  ],

  weekend: [
    '1493663284031-b7e3aefcae8e', // cozy living room on a rainy Sunday
    '1484723091739-30a097e8f929', // fresh bread imagined for a slow morning
    '1571934811356-5cc061b6821f', // warm drink and couch instead of going out
    '1444653614773-995cb1ef9efa', // avoiding the crowded street outside
    '1512820790803-83ca734da794', // quiet reading on a lazy afternoon
    '1524678606370-a47ad25cb82a', // sitting by window with tea
    '1456513080510-7bf3a84b82f8', // journal open on a slow day
    '1488477181946-6428a0291777', // dessert on a weekend afternoon
  ],

  'city-walk': [
    '1444723121867-7a241cacace9', // new city skyline ahead
    '1486406146926-c627a92ad1ab', // city lights at dusk
    '1476994230281-1448088947db', // a path through the city
    '1556656793-08538906a9f8',    // texting while walking
    '1444653614773-995cb1ef9efa', // city street scene
    '1530103862676-de8c9debad1d', // city connection moment
    '1524678606370-a47ad25cb82a', // window to city life
    '1488085061387-422e29b40080', // city destination ahead
  ],

  nature: [
    '1441974231531-c6227db76b6e', // quiet forest path in autumn
    '1501785888041-af3ef285b470', // calm lake reflecting the sky
    '1470071459604-3b5ec3a7fe05', // wide open view in nature
    '1518562180175-34a163b1a9a6', // trail winding through the trees
    '1476994230281-1448088947db', // path leading into nature
    '1507525428034-b723cf961d3e', // coastline in gentle light
    '1505228395891-9a51e7e86bf6', // quiet natural scenery
    '1517248135467-4c7edcad34c4', // warm natural light through leaves
  ],
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * 지정된 Mood Pool에서 `count`장을 랜덤으로 섞어 반환합니다.
 * StoryPage 클라이언트 컴포넌트의 useMemo 안에서 호출하세요.
 * (story.id를 dep로 주면 스토리 이동 시마다 새 이미지, 동일 스토리 중에는 고정)
 */
export function getMoodImages(mood: MoodKey, count = 4): StorySlideImage[] {
  const pool = MOOD_POOLS[mood]
  if (!pool || pool.length === 0) return []
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((id) => ({
    url: U(id),
    alt: '',           // mood 기반 이미지는 generic alt
    status: 'ready' as const,
  }))
}
