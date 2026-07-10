// @ts-nocheck
"use client";

import { BookOpenCheck, Heart, Sparkles } from "lucide-react";

import { FavoriteButton } from "@/components/FavoriteButton";
import { Card, CardContent } from "@/components/ui/card";
import { stories } from "@/data/stories";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { useT } from "@/hooks/useT";

function getStoryStatusLabel(
  completed: boolean,
  status: { mastered: boolean; currentStage: number } | undefined,
  reviewPending: string,
  notStarted: string,
) {
  if (status?.mastered) {
    return "Mastered";
  }

  if (status && status.currentStage > 0) {
    return `Review Stage ${status.currentStage} / 6`;
  }

  return completed ? reviewPending : notStarted;
}

export function StoryLibrary() {
  const { progress } = useLearningProgress();
  const t = useT();

  return (
    <div className="space-y-6">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-[#6f7895]">Patto</p>
        <h1 className="text-3xl font-bold tracking-normal">Story Library</h1>
      </header>

      <section className="space-y-4">
        {stories.map((story) => {
          const completed = progress.completedStoryIds.includes(story.storyId);
          const status = progress.storyReviewStatuses[story.storyId];
          const storyAiExamples = progress.generatedExamples.filter(
            (example) => example.storyId === story.storyId,
          );
          const storyFavorites = progress.favorites.filter(
            (favorite) => favorite.storyId === story.storyId,
          );
          const aiMiniStory = progress.generatedMiniStories
            .filter((miniStory) => miniStory.storyId === story.storyId)
            .slice(-1)[0];

          return (
            <Card key={story.storyId}>
              <CardContent className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#7a839f]">
                      Story {story.storyId}
                    </p>
                    <h2 className="text-xl font-bold text-[#26315e]">
                      {story.title}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-bold text-[#4f5fd7]">
                    {getStoryStatusLabel(completed, status, t('story_review_pending'), t('story_not_started'))}
                  </span>
                </div>

                <section className="space-y-3">
                  <h3 className="text-base font-bold text-[#26315e]">
                    Original Examples
                  </h3>
                  {story.patterns.map((pattern) => (
                    <div
                      className="rounded-3xl bg-[#f7f9ff] p-4"
                      key={pattern.patternId}
                    >
                      <p className="mb-3 text-lg font-bold text-[#26315e]">
                        {pattern.patternText}
                      </p>
                      <ul className="space-y-2">
                        {pattern.originalExamples.map((example) => (
                          <li className="flex items-start gap-2" key={example}>
                            <span className="flex-1 text-sm font-semibold leading-relaxed text-[#3f4867]">
                              {example}
                            </span>
                            <FavoriteButton
                              patternId={pattern.patternId}
                              sentence={example}
                              source="original"
                              storyId={story.storyId}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>

                <section className="rounded-3xl bg-white/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#5b6ee1]">
                    <Sparkles aria-hidden="true" className="h-4 w-4" />
                    <h3 className="text-sm font-bold">AI Examples</h3>
                  </div>
                  {storyAiExamples.length > 0 ? (
                    <ul className="space-y-2">
                      {storyAiExamples.slice(-15).map((example) => (
                        <li
                          className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-[#3f4867]"
                          key={`${example.patternId}-${example.text}`}
                        >
                          <span className="flex-1">{example.text}</span>
                          <FavoriteButton
                            patternId={example.patternId}
                            sentence={example.text}
                            source="ai"
                            storyId={story.storyId}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-semibold text-[#7a839f]">
                      다시 만나기 카드에서 새 AI 예문이 쌓입니다.
                    </p>
                  )}
                </section>

                <section className="rounded-3xl bg-white/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#5b6ee1]">
                    <BookOpenCheck aria-hidden="true" className="h-4 w-4" />
                    <h3 className="text-sm font-bold">Mini Story</h3>
                  </div>
                  <p className="text-base font-semibold leading-relaxed text-[#3f4867]">
                    {aiMiniStory?.text ?? story.miniStory}
                  </p>
                </section>

                <section className="rounded-3xl bg-[#fff7fa] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#d84f6a]">
                    <Heart aria-hidden="true" className="h-4 w-4" />
                    <h3 className="text-sm font-bold">Favorites</h3>
                  </div>
                  {storyFavorites.length > 0 ? (
                    <ul className="space-y-2">
                      {storyFavorites.map((favorite) => (
                        <li
                          className="text-sm font-semibold leading-relaxed text-[#3f4867]"
                          key={favorite.id}
                        >
                          {favorite.sentence}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-semibold text-[#7a839f]">
                      마음에 드는 문장 옆의 하트를 누르면 저장됩니다.
                    </p>
                  )}
                </section>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
