// @ts-nocheck
"use client";

import { Heart } from "lucide-react";

import { useLearningProgress } from "@/hooks/useLearningProgress";
import {
  isFavoriteSentence,
  toggleFavoriteSentence,
} from "@/lib/learning-progress";
import { cn } from "@/lib/utils";
import type { FavoriteSentence } from "@/types/learning-progress";

type FavoriteButtonProps = {
  sentence: string;
  storyId: number;
  patternId: number;
  source: FavoriteSentence["source"];
};

export function FavoriteButton({
  sentence,
  storyId,
  patternId,
  source,
}: FavoriteButtonProps) {
  const { progress, setProgress } = useLearningProgress();
  const favorited = isFavoriteSentence(progress, sentence);

  return (
    <button
      aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      aria-pressed={favorited}
      className={cn(
        "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa6ff]",
        favorited
          ? "bg-[#ffe8ed] text-[#d84f6a]"
          : "bg-[#f4f7ff] text-[#8a93ad]",
      )}
      onClick={(event) => {
        event.stopPropagation();
        setProgress((current) =>
          toggleFavoriteSentence(current, sentence, storyId, patternId, source),
        );
      }}
      type="button"
    >
      <Heart
        aria-hidden="true"
        className={cn("h-4 w-4", favorited && "fill-current")}
      />
    </button>
  );
}
