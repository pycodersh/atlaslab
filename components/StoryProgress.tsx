type StoryProgressProps = {
  storyNumber: number
  totalStories: number
  currentCard: number
  totalCards: number
  title?: string
  isMiniStory?: boolean
}

export function StoryProgress({
  storyNumber,
  totalStories,
  currentCard,
  totalCards,
  title,
  isMiniStory = false,
}: StoryProgressProps) {
  const progress = isMiniStory ? 100 : (currentCard / totalCards) * 100

  return (
    <header className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[0.7rem] font-semibold text-[#9EAEC8]">
          Story {storyNumber}/{totalStories}
          {title && (
            <span className="text-[#B0BCCE]"> · {title}</span>
          )}
        </p>
        <span className="shrink-0 rounded-full bg-[#DCEBFF] px-3 py-0.5 text-[10px] font-bold text-[#4F8CFF]">
          {isMiniStory ? 'Mini Story' : `${currentCard} / ${totalCards}`}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#E8F0FE]">
        <div
          className="h-full rounded-full bg-[#4F8CFF] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  )
}
