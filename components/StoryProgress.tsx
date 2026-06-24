type StoryProgressProps = {
  storyNumber: number;
  totalStories: number;
  currentCard: number;
  totalCards: number;
  isMiniStory?: boolean;
};

export function StoryProgress({
  storyNumber,
  totalStories,
  currentCard,
  totalCards,
  isMiniStory = false,
}: StoryProgressProps) {
  const progress = isMiniStory ? 100 : (currentCard / totalCards) * 100;

  return (
    <header className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#6f7895]">Patto</p>
          <h1 className="text-2xl font-bold tracking-normal text-[#202842]">
            Story {storyNumber} / {totalStories}
          </h1>
        </div>
        <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[#4f5fd7] shadow-sm">
          {isMiniStory ? "Mini Story" : `Card ${currentCard} / ${totalCards}`}
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full bg-[#5b6ee1] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
