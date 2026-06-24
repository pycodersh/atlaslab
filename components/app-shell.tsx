import { BottomNav } from "@/components/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F5F8FF] text-[#1F2937]">
      <main className="mx-auto min-h-dvh w-full max-w-md px-5 pb-28 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
