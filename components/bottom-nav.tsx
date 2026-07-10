"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartNoAxesColumnIncreasing, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  const tabs = [
    { href: "/learn",    label: t('tab_story'),    icon: BookOpen },
    { href: "/records",  label: t('tab_progress'), icon: ChartNoAxesColumnIncreasing },
    { href: "/settings", label: t('tab_settings'), icon: Settings },
  ];

  return (
    <nav className="glass-nav fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          const Icon = tab.icon;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold text-[#8E8E93] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8CFF]",
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
