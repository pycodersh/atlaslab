'use client'

import { Volume2 } from 'lucide-react'

import { ReadCounter } from '@/components/ReadCounter'
import { Button } from '@/components/ui/button'
import { useSpeech } from '@/hooks/useSpeech'
import { cn } from '@/lib/utils'

type MiniStoryProps = {
  text: string
  readCount: number
  readGoal: number
  onRead: () => void
  onPrevious: () => void
  onComplete: () => void
  isLastStory?: boolean
}

export function MiniStory({
  text,
  readCount,
  readGoal,
  onRead,
  onPrevious,
  onComplete,
  isLastStory = false,
}: MiniStoryProps) {
  const sentences = text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [text]
  const isComplete = readCount >= readGoal
  const { speakAll, stop, isSpeaking } = useSpeech()

  function handleSpeakAll(e: React.MouseEvent) {
    e.stopPropagation()
    if (isSpeaking) { stop(); return }
    speakAll(sentences)
  }

  return (
    <div className="flex min-h-[calc(100dvh-13rem)] flex-col gap-5 pt-6">
      <section className="rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-[0_22px_70px_rgba(79,94,145,0.14)]">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-[#26315e]">Mini Story</h2>
        </div>
        <div className="space-y-4 text-xl font-semibold leading-relaxed text-[#303a5e]">
          {sentences.map((sentence) => (
            <p key={sentence}>{sentence}</p>
          ))}
        </div>
      </section>

      <Button className="w-full gap-2" onClick={handleSpeakAll} type="button" variant="secondary">
        <Volume2 className={cn('h-4 w-4', isSpeaking ? 'text-[#e05b5b]' : 'text-[#5b6ee1]')} />
        {isSpeaking ? '정지' : '전체 듣기'}
      </Button>

      <ReadCounter count={readCount} goal={readGoal} onIncrement={onRead} />

      <div className="mt-auto grid grid-cols-2 gap-3">
        <Button onClick={onPrevious} type="button" variant="secondary">
          이전 카드로
        </Button>
        <Button disabled={!isComplete} onClick={onComplete} type="button">
          {isLastStory ? '학습 완료 🎉' : '다음 스토리 →'}
        </Button>
      </div>
    </div>
  )
}
