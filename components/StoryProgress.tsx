type StoryProgressProps = {
  storyNumber: number
  totalStories: number
  currentCard: number
  totalCards: number
  title?: string
  isMiniStory?: boolean
  onJump?: () => void
}

export function StoryProgress({
  storyNumber,
  totalStories,
  currentCard,
  totalCards,
  title,
  isMiniStory = false,
  onJump,
}: StoryProgressProps) {
  const progress = isMiniStory ? 100 : (currentCard / totalCards) * 100

  return (
    <header className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        {/* 클릭 시 Story Jump Sheet 열기 */}
        <button
          className="min-w-0 truncate text-left text-sm font-bold text-[#6B7280] transition-colors hover:text-[#4F8CFF] active:text-[#4F8CFF]"
          onClick={onJump}
          type="button"
        >
          Story {storyNumber}/{totalStories}
          {title && (
            <span className="font-medium text-[#B0BCCE]"> · {title}</span>
          )}
        </button>
        <span className="shrink-0 text-sm font-bold text-[#1F2937]">
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
