type StoryProgressProps = {
  storyNumber: number
  onJump?: () => void
}

export function StoryProgress({ storyNumber, onJump }: StoryProgressProps) {
  return (
    <header className="flex items-center justify-center py-2">
      <button
        className="tracking-[0.10em] text-[#4F8CFF] transition-opacity hover:opacity-70 active:opacity-50"
        onClick={onJump}
        style={{
          fontFamily: 'var(--font-jakarta), -apple-system, sans-serif',
          fontWeight: 800,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
        }}
        type="button"
      >
        Story {storyNumber}
      </button>
    </header>
  )
}
