'use client'

import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/useT";

type ReadCounterProps = {
  count: number;
  goal: number;
  onIncrement: () => void;
};

export function ReadCounter({ count, goal, onIncrement }: ReadCounterProps) {
  const complete = count >= goal;
  const t = useT();

  return (
    <section className="glass-card space-y-4 rounded-[28px] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#7a839f]">{t('read_mission')}</p>
          <p className="text-3xl font-bold text-[#26315e]">
            {Math.min(count, goal)} / {goal}
          </p>
        </div>
        {complete ? (
          <div className="rounded-full bg-[#e8f5ed] px-4 py-2 text-sm font-bold text-[#357a52]">
            {t('read_mission_done')}
          </div>
        ) : null}
      </div>
      <Button className="w-full" disabled={complete} onClick={onIncrement}>
        {t('read_btn')}
      </Button>
    </section>
  );
}
