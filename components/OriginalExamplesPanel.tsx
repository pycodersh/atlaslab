// @ts-nocheck
import { X } from "lucide-react";

import { FavoriteButton } from "@/components/FavoriteButton";
import type { Pattern } from "@/types/story";

type OriginalExamplesPanelProps = {
  pattern: Pattern;
  storyId: number;
  onClose: () => void;
};

export function OriginalExamplesPanel({
  pattern,
  storyId,
  onClose,
}: OriginalExamplesPanelProps) {
  return (
    <div className="glass-card fixed inset-x-4 bottom-24 z-30 mx-auto max-w-md rounded-[28px] p-5 shadow-[0_24px_80px_rgba(79,94,145,0.22)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#8E8E93]">Original Examples</p>
          <h2 className="text-2xl font-bold text-[#1C1C1E]">
            {pattern.patternText}
          </h2>
        </div>
        <button
          aria-label="원본 예문 닫기"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f4f7ff] text-[#66708f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa6ff]"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          type="button"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      <ul className="space-y-3">
        {pattern.originalExamples.map((example) => (
          <li className="flex items-start gap-3" key={example}>
            <span className="flex-1 text-base font-semibold leading-relaxed text-[#3A3A3C]">
              {example}
            </span>
            <FavoriteButton
              patternId={pattern.patternId}
              sentence={example}
              source="original"
              storyId={storyId}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
