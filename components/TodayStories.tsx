// @ts-nocheck
import { StoryCardEngine } from "@/components/StoryCardEngine";
import { stories } from "@/data/stories";

export function TodayStories() {
  return <StoryCardEngine story={stories[0]} />;
}
