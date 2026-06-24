// @ts-nocheck
import { generateExamples } from "@/lib/ai/exampleGenerator";
import type { AgeGroup, InterestArea } from "@/types/learning-progress";
import type { Story } from "@/types/story";

type StoryGeneratorInput = {
  story: Story;
  ageGroup: AgeGroup;
  interestArea: InterestArea;
  previousExamples: string[];
};

export function generateMiniStory({
  story,
  ageGroup,
  interestArea,
  previousExamples,
}: StoryGeneratorInput) {
  const sentences = story.patterns.map((pattern) => {
    const [example] = generateExamples({
      pattern,
      ageGroup,
      interestArea,
      previousExamples,
    });

    return example;
  });

  return sentences.join(" ");
}
