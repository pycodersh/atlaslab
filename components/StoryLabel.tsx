'use client'

type StoryLabelProps = {
  storyNumber: number
  onJump?: () => void
}

export function StoryLabel({ storyNumber, onJump }: StoryLabelProps) {
  return (
    <button
      className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-opacity hover:opacity-75 active:opacity-50"
      style={{
        fontFamily: 'var(--font-baloo), -apple-system, sans-serif',
        fontWeight: 800,
        color: '#4A90E2',
        backgroundColor: '#EEF4FF',
      }}
      onClick={(e) => { e.stopPropagation(); onJump?.() }}
      type="button"
    >
      ✦ STORY {storyNumber} ✦
    </button>
  )
}
