// @ts-nocheck
"use client";

import { BookOpenCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { stories } from "@/data/stories";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { getTodayKey } from "@/lib/learning-progress";
import { cn } from "@/lib/utils";

function getMonthDays(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const key = getTodayKey(new Date(year, month, day));

    return { day, key };
  });
}

export function LearningRecords() {
  const { progress } = useLearningProgress();
  const monthDays = getMonthDays();
  const todayRecord = progress.dailyRecords[getTodayKey()];
  const currentStory =
    stories.find((story) => story.storyId === progress.currentStoryId) ??
    stories[0];
  const totalCards = currentStory.patterns.length;
  const currentPosition =
    progress.currentCardIndex >= totalCards
      ? "Mini Story"
      : `Card ${progress.currentCardIndex + 1} / ${totalCards}`;

  return (
    <div className="space-y-6">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-[#8E8E93]">Patto</p>
        <h1 className="text-3xl font-bold tracking-normal">학습 기록</h1>
      </header>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#5b6ee1]">
            <BookOpenCheck aria-hidden="true" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#6E6E73]">현재 학습 위치</p>
            <p className="text-lg font-bold text-[#1C1C1E]">
              Story {progress.currentStoryId} · {currentPosition}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-[#6E6E73]">연속 학습</p>
            <p className="text-3xl font-bold text-[#1C1C1E]">
              {progress.streakDays}일
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-[#6E6E73]">Story 완료</p>
            <p className="text-3xl font-bold text-[#1C1C1E]">
              {progress.completedStoryIds.length} / 100
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-[#6E6E73]">오늘 신규</p>
            <p className="text-3xl font-bold text-[#1C1C1E]">
              {todayRecord?.storyCompleted ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-[#6E6E73]">
              오늘 다시 만나기
            </p>
            <p className="text-3xl font-bold text-[#1C1C1E]">
              {todayRecord?.reviewCompleted ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1C1C1E]">이번 달 기록</h2>
            <span className="rounded-full bg-[#e8f5ed] px-3 py-1 text-xs font-bold text-[#357a52]">
              저장됨
            </span>
          </div>

          <div className="grid grid-cols-7 gap-3 rounded-3xl bg-[#f7f9ff] p-4">
            {monthDays.map(({ day, key }) => {
              const record = progress.dailyRecords[key];
              const studied = record?.studied ?? false;

              return (
                <div
                  aria-label={
                    studied
                      ? `${day}일 학습 완료, 낭독 ${record?.readCount ?? 0}회`
                      : `${day}일 학습 없음`
                  }
                  className="flex flex-col items-center gap-1"
                  key={key}
                  title={
                    studied
                      ? `${key} · 낭독 ${record?.readCount ?? 0}회`
                      : `${key}`
                  }
                >
                  <span className="text-[11px] font-semibold text-[#8E8E93]">
                    {day}
                  </span>
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full",
                      studied ? "bg-[#5b6ee1]" : "bg-[#d8dfef]",
                    )}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
