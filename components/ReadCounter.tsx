import { Button } from "@/components/ui/button";

type ReadCounterProps = {
  count: number;
  goal: number;
  onIncrement: () => void;
};

export function ReadCounter({ count, goal, onIncrement }: ReadCounterProps) {
  const complete = count >= goal;

  return (
    <section className="space-y-4 rounded-[28px] bg-white/80 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#7a839f]">오늘의 낭독 미션</p>
          <p className="text-3xl font-bold text-[#26315e]">
            {Math.min(count, goal)} / {goal}
          </p>
        </div>
        {complete ? (
          <div className="rounded-full bg-[#e8f5ed] px-4 py-2 text-sm font-bold text-[#357a52]">
            오늘 낭독 완료
          </div>
        ) : null}
      </div>
      <Button className="w-full" disabled={complete} onClick={onIncrement}>
        +1회 읽었어요
      </Button>
    </section>
  );
}
