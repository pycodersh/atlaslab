'use client'

import Link from 'next/link'

interface LessonCompleteProps {
  lessonId: number
  passed: boolean
  score?: number
  total?: number
  onRetry?: () => void
  onContinue: () => void
}

export function LessonComplete({ lessonId, passed, score, total, onRetry, onContinue }: LessonCompleteProps) {
  const isStoryUnlock = lessonId === 6 && passed
  const hasQuiz = total !== undefined && total > 0

  return (
    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
      {/* Particle emojis */}
      {passed && (
        <div style={{ fontSize: 32, marginBottom: 16, animation: 'kp-bounce 0.6s ease' }}>
          {isStoryUnlock ? '🎊' : '🎉'}
        </div>
      )}
      {!passed && (
        <div style={{ fontSize: 32, marginBottom: 16 }}>😅</div>
      )}

      {/* Score */}
      {hasQuiz && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 4,
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: passed ? '#4CAF50' : '#EF5350' }}>
            {score}
          </span>
          <span style={{ fontSize: 22, color: 'var(--pm)' }}>/ {total}</span>
        </div>
      )}

      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--pt)' }}>
        {passed
          ? isStoryUnlock ? '한글 마스터! 🇰🇷' : '레슨 완료!'
          : '아쉬워요, 다시 도전해요!'}
      </h2>

      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--pm)', lineHeight: 1.6 }}>
        {passed
          ? isStoryUnlock
            ? '레슨 1~6을 완료했어요!\n이제 한글을 읽을 수 있어요. 스토리 1화를 시작해봐요!'
            : '잘 했어요! 다음 레슨으로 넘어가요.'
          : `${total}문제 중 ${score}개 정답 — ${hasQuiz ? `${total! - (score ?? 0)}개`  : ''} 더 맞혀야 해요.`}
      </p>

      {/* CTA buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
        {isStoryUnlock && (
          <Link
            href="/kpatto/story/kp-ep-001?welcome=1"
            style={{
              display: 'block',
              background: 'linear-gradient(135deg, #FF6B8C, #FF8C6B)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              padding: '14px 20px',
              borderRadius: 14,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            🎬 스토리 1화 시작하기
          </Link>
        )}

        {passed && !isStoryUnlock && (
          <button
            onClick={onContinue}
            style={{
              background: 'linear-gradient(135deg, #FF6B8C, #FF8C6B)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              padding: '14px 20px',
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            다음 레슨으로 →
          </button>
        )}

        {!passed && onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: 'linear-gradient(135deg, #FF6B8C, #FF8C6B)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              padding: '14px 20px',
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            다시 도전하기 🔄
          </button>
        )}

        <button
          onClick={onContinue}
          style={{
            background: 'none',
            border: '1.5px solid var(--border, rgba(0,0,0,0.1))',
            borderRadius: 14,
            padding: '12px 20px',
            cursor: 'pointer',
            color: 'var(--pm)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          레슨 목록으로
        </button>
      </div>

      <style>{`
        @keyframes kp-bounce {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
