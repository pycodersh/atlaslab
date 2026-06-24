'use client'

import { Volume2 } from 'lucide-react'

import { useSpeech } from '@/hooks/useSpeech'
import { cn } from '@/lib/utils'
import type { MiniStoryContent } from '@/types/story'

type MiniStoryProps = {
  content: MiniStoryContent
  totalCards: number
}

export function MiniStory({ content, totalCards }: MiniStoryProps) {
  const enParagraphs = content.en.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
  const koParagraphs = content.ko.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)

  // TTS는 영어 원문만 재생
  const enSentences = enParagraphs.flatMap(
    (p) => p.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [p],
  )
  const { speakAll, isSpeaking, stop } = useSpeech()

  function handleSpeakAll(e: React.MouseEvent) {
    e.stopPropagation()
    if (isSpeaking) { stop(); return }
    speakAll(enSentences)
  }

  return (
    <div className="absolute inset-0 flex flex-col rounded-[28px] border border-[#E8F0FE] bg-white p-6 shadow-[0_8px_40px_rgba(79,140,255,0.10)]">

      {/* 상단: 도트 (카드 전체 완료) + TTS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalCards }, (_, i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-[#4F8CFF]" />
          ))}
        </div>
        <button
          aria-label={isSpeaking ? '정지' : '전체 듣기'}
          className={cn(
            'shrink-0 rounded-full p-2 transition-colors',
            isSpeaking
              ? 'bg-[#FFE8E8] text-[#FF6B6B]'
              : 'bg-[#DCEBFF] text-[#4F8CFF] hover:bg-[#C8DCFF]',
          )}
          onClick={handleSpeakAll}
          type="button"
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>

      {/* 영어 + 한국어 단락 페어 */}
      <div className="mt-5 flex-1 space-y-5 overflow-y-auto">
        {enParagraphs.map((enPara, i) => (
          <div key={i} className="space-y-1">
            {/* 영어: 크고 진하게 */}
            <p className="text-[1rem] font-semibold leading-relaxed text-[#1F2937]">
              {enPara}
            </p>
            {/* 한국어: 작고 연한 회색 */}
            {koParagraphs[i] && (
              <p className="text-[0.8rem] font-normal leading-relaxed text-[#9EAEC8]">
                {koParagraphs[i]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
