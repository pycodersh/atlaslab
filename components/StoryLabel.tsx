'use client'

type StoryLabelProps = {
  storyNumber: number
  className?: string
  onJump?: () => void
}

export function StoryLabel({ storyNumber, className = 'mb-4', onJump }: StoryLabelProps) {
  return (
    <div className={`relative self-start ${className}`}>
      <button
        className="flex items-center gap-1 transition-opacity hover:opacity-60 active:opacity-40"
        onClick={(e) => { e.stopPropagation(); onJump?.() }}
        type="button"
      >
        <span style={{ color: '#4F8CFF', fontSize: '0.42rem', lineHeight: 1 }}>✦</span>
        <span style={{
          fontFamily: 'var(--font-jakarta), -apple-system, sans-serif',
          fontWeight: 800,
          fontSize: '0.72rem',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.10em',
          color: '#4F8CFF',
          lineHeight: 1.2,
        }}>
          Story {storyNumber}
        </span>
        <span style={{ color: '#4F8CFF', fontSize: '0.42rem', lineHeight: 1 }}>✦</span>
      </button>

      {/* SVG wavy underline — 브라우저 무관하게 동일 렌더링 */}
      <svg
        className="absolute left-0 w-full overflow-visible"
        preserveAspectRatio="none"
        style={{ bottom: '-4px', height: '5px' }}
        viewBox="0 0 60 5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,3.5 Q7.5,0.5 15,3.5 Q22.5,6.5 30,3.5 Q37.5,0.5 45,3.5 Q52.5,6.5 60,3.5"
          fill="none"
          opacity="0.65"
          stroke="#4F8CFF"
          strokeLinecap="round"
          strokeWidth="1.4"
        />
      </svg>
    </div>
  )
}
