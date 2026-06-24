"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartNoAxesColumnIncreasing, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/learn", label: "학습", icon: BookOpen },
  { href: "/records", label: "기록", icon: ChartNoAxesColumnIncreasing },
  { href: "/settings", label: "설정", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E8F0FE] bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          const Icon = tab.icon;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold text-[#9EAEC8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8CFF]",
                active && "bg-[#DCEBFF] text-[#4F8CFF]",
              )}
              href={tab.href}
              key={tab.href}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
