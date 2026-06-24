type StoryProgressProps = {
  storyNumber: number
  currentCard: number
  totalCards: number
  isMiniStory?: boolean
  onJump?: () => void
}

export function StoryProgress({
  storyNumber,
  currentCard,
  totalCards,
  isMiniStory = false,
  onJump,
}: StoryProgressProps) {
  const progress = isMiniStory ? 100 : (currentCard / totalCards) * 100

  return (
    <header className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <button
          className="text-sm font-bold text-[#6B7280] transition-colors hover:text-[#4F8CFF] active:text-[#4F8CFF]"
          onClick={onJump}
          type="button"
        >
          Story {storyNumber}
        </button>
        {isMiniStory && (
          <span className="text-xs font-semibold text-[#B0BCCE]">Mini Story</span>
        )}
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
