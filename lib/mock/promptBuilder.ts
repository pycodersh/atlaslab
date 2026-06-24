// @ts-nocheck
import type { AgeGroup, InterestArea } from "@/types/learning-progress";
import type { Pattern, Story } from "@/types/story";

export type GenerationContext = {
  ageGroup: AgeGroup;
  interestArea: InterestArea;
  previousExamples: string[];
};

export function buildExamplePrompt(
  pattern: Pattern,
  context: GenerationContext,
) {
  return [
    `Generate 5 short English examples for the pattern: ${pattern.patternText}`,
    `Age group: ${context.ageGroup}`,
    `Interest: ${context.interestArea}`,
    "Rules:",
    "1. Keep the pattern structure unchanged.",
    "2. Use natural native-like English.",
    "3. Avoid difficult words.",
    "4. Avoid duplicates from previous examples.",
    "5. Return examples only.",
  ].join("\n");
}

export function buildMiniStoryPrompt(story: Story, context: GenerationContext) {
  const patterns = story.patterns
    .map((pattern) => `- ${pattern.patternText}`)
    .join("\n");

  return [
    "Generate a 5-8 sentence mini story.",
    `Age group: ${context.ageGroup}`,
    `Interest: ${context.interestArea}`,
    "Use every pattern exactly once or more:",
    patterns,
    "Keep sentences short, natural, and easy to say aloud.",
  ].join("\n");
}
