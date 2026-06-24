import { BottomNav } from "@/components/bottom-nav";

type AppShellProps = {
  children: React.ReactNode
  hideNav?: boolean
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-[#F5F8FF] text-[#1F2937]">
      <main className={hideNav
        ? "mx-auto min-h-dvh w-full max-w-md px-5 pb-6 pt-6"
        : "mx-auto min-h-dvh w-full max-w-md px-5 pb-28 pt-6"
      }>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
