import { ChevronRight } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";

const settings = [
  { label: "학습 수준", value: "입문" },
  { label: "관심 분야", value: "일상" },
  { label: "하루 Story 수", value: "1개" },
  { label: "음성 속도", value: "보통" },
  { label: "다크모드", value: "끔" },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <header className="space-y-2 pt-1">
          <p className="text-sm font-semibold text-[#6f7895]">Patto</p>
          <h1 className="text-3xl font-bold tracking-normal">설정</h1>
        </header>

        <Card>
          <CardContent className="divide-y divide-[#e7edf9] p-0">
            {settings.map((item) => (
              <button
                className="flex min-h-16 w-full cursor-pointer items-center justify-between px-5 text-left transition-colors hover:bg-[#f7f9ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8fa6ff]"
                key={item.label}
                type="button"
              >
                <span className="text-base font-semibold text-[#26315e]">
                  {item.label}
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold text-[#7a839f]">
                  {item.value}
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
