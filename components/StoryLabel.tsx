'use client'

type StoryLabelProps = {
  storyNumber: number
  subtitle?: string
  onJump?: () => void
}

export function StoryLabel({ storyNumber, subtitle, onJump }: StoryLabelProps) {
  return (
    <button
      className="absolute left-4 top-4 z-10 flex flex-col items-start gap-[2px] text-left transition-opacity hover:opacity-60 active:opacity-40"
      onClick={(e) => { e.stopPropagation(); onJump?.() }}
      type="button"
    >
      <span
        style={{
          fontFamily: 'var(--font-jakarta), -apple-system, sans-serif',
          fontWeight: 800,
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.11em',
          color: '#7BAEF8',
          lineHeight: 1,
        }}
      >
        STORY {storyNumber}
      </span>
      {subtitle && (
        <span
          style={{
            fontFamily: 'var(--font-jakarta), -apple-system, sans-serif',
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: '0.01em',
            color: '#A8BED8',
            lineHeight: 1,
          }}
        >
          {subtitle}
        </span>
      )}
    </button>
  )
}
