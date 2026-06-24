import { Play } from "lucide-react";
import type { MouseEvent } from "react";

import { Button } from "@/components/ui/button";

type AudioButtonProps = {
  label?: string;
  onClick?: () => void;
};

export function AudioButton({ label = "전체 듣기", onClick }: AudioButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onClick?.();
  }

  return (
    <Button
      aria-label={label}
      className="w-full gap-2"
      onClick={handleClick}
      type="button"
      variant="secondary"
    >
      <Play
        aria-hidden="true"
        className="h-4 w-4 fill-[#5b6ee1] text-[#5b6ee1]"
      />
      {label}
    </Button>
  );
}
