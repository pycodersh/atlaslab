/**
 * MOCK 예문 생성기
 * 실제 AI API 호출이 아닌 하드코딩 배열에서 예문을 선택합니다.
 * DB에 실제 예문 데이터가 채워지면 이 파일은 사용되지 않습니다.
 */
import type { AgeGroup, InterestArea } from '@/types/learning-progress'

type MockExampleInput = {
  patternOrder: number  // 패턴 order_index (1~5 범위의 mock 데이터만 지원)
  ageGroup: AgeGroup
  interestArea: InterestArea
  previousExamples: string[]
}

const ageExamples: Record<AgeGroup, Record<number, string[]>> = {
  elementary: {
    1: ['I want to play soccer.', 'I want to eat pizza.', 'I want to play with my friends.'],
    2: ["I'm thinking about drawing a picture.", "I'm thinking about riding my bike."],
    3: ["There's a chance that I will win.", "There's a chance that it will rain."],
    4: ['The reason is that I like games.', 'The reason is that it is fun.'],
    5: ['It turns out that I can do it.', 'It turns out that practice helps.'],
  },
  middle: {
    1: ['I want to improve my grades.', 'I want to join the school club.'],
    2: ["I'm thinking about joining a study group.", "I'm thinking about reading more books."],
    3: ["There's a chance that the test will be hard.", "There's a chance that I will make new friends."],
    4: ['The reason is that I need better habits.', 'The reason is that I want to grow.'],
    5: ['It turns out that studying early helps.', 'It turns out that I enjoy science.'],
  },
  high: {
    1: ['I want to get into a good university.', 'I want to improve my English skills.'],
    2: ["I'm thinking about choosing a major.", "I'm thinking about preparing for interviews."],
    3: ["There's a chance that I will feel pressure.", "There's a chance that my plan will change."],
    4: ['The reason is that my goals are clear.', 'The reason is that time matters.'],
    5: ['It turns out that effort adds up.', 'It turns out that feedback is useful.'],
  },
  worker: {
    1: ['I want to improve my skills.', 'I want to change jobs.', 'I want to get promoted.'],
    2: ["I'm thinking about taking a course.", "I'm thinking about changing teams."],
    3: ["There's a chance that the project will grow.", "There's a chance that I will need more time."],
    4: ['The reason is that my role is changing.', 'The reason is that clear work matters.'],
    5: ['It turns out that small habits work.', 'It turns out that communication matters.'],
  },
}

const interestExamples: Record<InterestArea, Record<number, string[]>> = {
  daily: {
    1: ['I want to sleep earlier.', 'I want to drink more water.', 'I want to clean my room.'],
    2: ["I'm thinking about cooking dinner.", "I'm thinking about walking after work."],
    3: ["There's a chance that I will be busy.", "There's a chance that my day will change."],
    4: ['The reason is that routines help me.', 'The reason is that I feel better.'],
    5: ['It turns out that simple plans work.', 'It turns out that rest is important.'],
  },
  investment: {
    1: ['I want to reduce my risk.', 'I want to buy more shares.'],
    2: ["I'm thinking about investing more money.", "I'm thinking about reviewing my portfolio."],
    3: ["There's a chance that the market will recover.", "There's a chance that prices will fall."],
    4: ['The reason is that I want long-term growth.', 'The reason is that risk control matters.'],
    5: ['It turns out that patience matters.', 'It turns out that timing is difficult.'],
  },
  business: {
    1: ['I want to expand my business.', 'I want to improve customer satisfaction.'],
    2: ["I'm thinking about launching a new product.", "I'm thinking about meeting new clients."],
    3: ["There's a chance that sales will improve.", "There's a chance that customers will respond well."],
    4: ['The reason is that customers need trust.', 'The reason is that good service matters.'],
    5: ['It turns out that feedback helps.', 'It turns out that simple offers work.'],
  },
  travel: {
    1: ['I want to visit Japan.', 'I want to travel across Europe.'],
    2: ["I'm thinking about booking a flight.", "I'm thinking about learning travel English."],
    3: ["There's a chance that the trip will be expensive.", "There's a chance that I will meet new people."],
    4: ['The reason is that travel opens my mind.', 'The reason is that I need a break.'],
    5: ['It turns out that planning saves money.', 'It turns out that short trips are refreshing.'],
  },
  game: {
    1: ['I want to reach the next level.', 'I want to improve my strategy.'],
    2: ["I'm thinking about trying a new character.", "I'm thinking about joining a team."],
    3: ["There's a chance that I will lose.", "There's a chance that the match will be close."],
    4: ['The reason is that teamwork matters.', 'The reason is that practice improves timing.'],
    5: ['It turns out that strategy beats speed.', 'It turns out that calm players win.'],
  },
  it: {
    1: ['I want to learn TypeScript.', 'I want to build a mobile app.'],
    2: ["I'm thinking about building a small project.", "I'm thinking about learning React."],
    3: ["There's a chance that the bug will return.", "There's a chance that the app will grow."],
    4: ['The reason is that clean code saves time.', 'The reason is that users need speed.'],
    5: ['It turns out that testing helps.', 'It turns out that simple design works.'],
  },
}

function unique(items: string[]) {
  return Array.from(new Set(items))
}

export function generateMockExamples({ patternOrder, ageGroup, interestArea, previousExamples }: MockExampleInput) {
  const used = new Set(previousExamples.map((e) => e.toLowerCase()))
  const candidates = unique([
    ...(interestExamples[interestArea][patternOrder] ?? []),
    ...(ageExamples[ageGroup][patternOrder] ?? []),
  ])
  const fresh = candidates.filter((c) => !used.has(c.toLowerCase()))
  return (fresh.length >= 5 ? fresh : [...fresh, ...candidates]).slice(0, 5)
}
