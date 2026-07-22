import { BottomNav } from "@/components/bottom-nav";

type AppShellProps = {
  children: React.ReactNode
  hideNav?: boolean
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  return (
    <div className="min-h-dvh text-[var(--pt)]">
      <main
        className={hideNav
          ? "mx-auto min-h-dvh w-full max-w-md px-5 pb-6"
          : "mx-auto min-h-dvh w-full max-w-md px-5 pb-32"
        }
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
