// @ts-nocheck
"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { updateUserSettings } from "@/lib/learning-progress";
import type { AgeGroup, InterestArea } from "@/types/learning-progress";
import type { Difficulty } from "@/types/pattern";

const ageOptions: Array<{ label: string; value: AgeGroup }> = [
  { label: "초등학생", value: "elementary" },
  { label: "중학생", value: "middle" },
  { label: "고등학생", value: "high" },
  { label: "직장인", value: "worker" },
];

const interestOptions: Array<{ label: string; value: InterestArea }> = [
  { label: "일상", value: "daily" },
  { label: "투자", value: "investment" },
  { label: "비즈니스", value: "business" },
  { label: "여행", value: "travel" },
  { label: "게임", value: "game" },
  { label: "IT", value: "it" },
];

const difficultyOptions: Array<{ label: string; sub: string; value: Difficulty }> = [
  { label: "Normal",   sub: "기본 예문",       value: "normal"   },
  { label: "Advanced", sub: "실전 표현",        value: "advanced" },
  { label: "Native",   sub: "원어민 수준",      value: "native"   },
];

export function SettingsPanel() {
  const { progress, setProgress } = useLearningProgress();
  const settings = progress.settings;

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="space-y-1 pt-1">
          <p className="text-sm font-semibold text-[#9EAEC8]">Patto</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#1F2937]">설정</h1>
        </header>

        {/* 기본 예문 난이도 */}
        <Card className="border-[#E8F0FE] shadow-none">
          <CardContent className="p-5">
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-bold text-[#1F2937]">기본 예문 난이도</h2>
                <p className="mt-0.5 text-xs text-[#9EAEC8]">모든 카드의 예문 기본값으로 사용됩니다</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {difficultyOptions.map((option) => (
                  <button
                    className={[
                      "flex flex-col items-center gap-1 rounded-2xl py-3 px-2 text-sm font-bold transition-colors",
                      settings.difficulty === option.value
                        ? "bg-[#4F8CFF] text-white"
                        : "bg-[#F5F8FF] text-[#6B7280] hover:bg-[#DCEBFF] hover:text-[#4F8CFF]",
                    ].join(" ")}
                    key={option.value}
                    onClick={() =>
                      setProgress((current) =>
                        updateUserSettings(current, { difficulty: option.value }),
                      )
                    }
                    type="button"
                  >
                    <span>{option.label}</span>
                    <span className={[
                      "text-[10px] font-medium",
                      settings.difficulty === option.value ? "text-white/80" : "text-[#9EAEC8]",
                    ].join(" ")}>
                      {option.sub}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>

        {/* 학습 수준 + 관심 분야 */}
        <Card className="border-[#E8F0FE] shadow-none">
          <CardContent className="space-y-5 p-5">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-[#1F2937]">학습 수준</h2>
              <div className="grid grid-cols-2 gap-2">
                {ageOptions.map((option) => (
                  <button
                    className={[
                      "min-h-11 rounded-2xl px-3 text-sm font-bold transition-colors",
                      settings.ageGroup === option.value
                        ? "bg-[#4F8CFF] text-white"
                        : "bg-[#F5F8FF] text-[#6B7280] hover:bg-[#DCEBFF] hover:text-[#4F8CFF]",
                    ].join(" ")}
                    key={option.value}
                    onClick={() =>
                      setProgress((current) =>
                        updateUserSettings(current, { ageGroup: option.value }),
                      )
                    }
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-[#1F2937]">관심 분야</h2>
              <div className="grid grid-cols-3 gap-2">
                {interestOptions.map((option) => (
                  <button
                    className={[
                      "min-h-11 rounded-2xl px-3 text-sm font-bold transition-colors",
                      settings.interestArea === option.value
                        ? "bg-[#4F8CFF] text-white"
                        : "bg-[#F5F8FF] text-[#6B7280] hover:bg-[#DCEBFF] hover:text-[#4F8CFF]",
                    ].join(" ")}
                    key={option.value}
                    onClick={() =>
                      setProgress((current) =>
                        updateUserSettings(current, {
                          interestArea: option.value,
                        }),
                      )
                    }
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F5F8FF] p-4">
                <p className="text-xs font-semibold text-[#9EAEC8]">하루 Story 수</p>
                <p className="mt-1 text-2xl font-bold text-[#1F2937]">
                  {settings.dailyStoryCount}개
                </p>
              </div>
              <div className="rounded-2xl bg-[#F5F8FF] p-4">
                <p className="text-xs font-semibold text-[#9EAEC8]">음성 속도</p>
                <p className="mt-1 text-2xl font-bold text-[#1F2937]">보통</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
