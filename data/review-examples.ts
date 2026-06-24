export const reviewExamplesByPatternId: Record<number, string[]> = {
  1: [
    "I want to improve my skills.",
    "I want to reduce my risk.",
    "I want to visit Japan.",
    "I want to buy more shares.",
    "I want to spend more time with my family.",
  ],
  2: [
    "I'm thinking about joining a gym.",
    "I'm thinking about saving more money.",
    "I'm thinking about reading every morning.",
    "I'm thinking about taking a short trip.",
    "I'm thinking about meeting new people.",
  ],
  3: [
    "There's a chance that I will learn faster.",
    "There's a chance that the plan will work.",
    "There's a chance that I will need help.",
    "There's a chance that the market will change.",
    "There's a chance that I will enjoy the process.",
  ],
  4: [
    "The reason is that I need more practice.",
    "The reason is that my time is limited.",
    "The reason is that clear goals help me.",
    "The reason is that habits are powerful.",
    "The reason is that confidence grows slowly.",
  ],
  5: [
    "It turns out that I was ready.",
    "It turns out that the idea was simple.",
    "It turns out that small wins matter.",
    "It turns out that I can stay consistent.",
    "It turns out that practice changes everything.",
  ],
};

export function getReviewExamples(patternId: number) {
  return reviewExamplesByPatternId[patternId] ?? [];
}
