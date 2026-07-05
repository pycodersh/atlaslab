'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

export function CompletionScreen() {
  const router = useRouter()

  return (
    <div className="flex min-h-[calc(100dvh-8.5rem)] flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-4">
        <p className="text-6xl">🎉</p>
        <h1 className="text-3xl font-bold text-[#1C1C1E]">모든 스토리 완료!</h1>
        <p className="text-base leading-relaxed text-[#6E6E73]">
          Level 1의 모든 패턴을 학습했습니다.
          <br />
          복습을 통해 패턴을 확실히 익혀보세요.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Button className="w-full" onClick={() => router.push('/learn/1')} type="button">
          처음부터 다시 학습
        </Button>
        <Button
          className="w-full"
          onClick={() => router.push('/records')}
          type="button"
          variant="secondary"
        >
          학습 기록 보기
        </Button>
      </div>
    </div>
  )
}
