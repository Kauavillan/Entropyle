"use client";

import { motion } from "framer-motion";

import type { LetterState } from "@/lib/game/types";

type LetterCellProps = {
  letter?: string;
  state?: LetterState;
  reveal?: boolean;
  index?: number;
  active?: boolean;
  selectable?: boolean;
  onClick?: () => void;
};

const stateClassMap: Record<LetterState, string> = {
  empty: "border-white/25 bg-white/5 text-white",
  correct: "border-emerald-300/70 bg-emerald-500 text-white",
  present: "border-amber-300/70 bg-amber-400 text-zinc-900",
  absent: "border-white/25 bg-white/5 text-white",
};

export function LetterCell({
  letter = "",
  state = "empty",
  reveal = false,
  index = 0,
  active = false,
  selectable = false,
  onClick,
}: LetterCellProps) {
  return (
    <motion.button
      type="button"
      initial={false}
      animate={{
        scale: active ? 1.03 : 1,
        rotateX: reveal ? [0, 90, 0] : 0,
      }}
      transition={{
        duration: reveal ? 0.45 : 0.2,
        delay: reveal ? index * 0.09 : 0,
      }}
      onClick={onClick}
      className={[
        "flex h-14 w-14 items-center justify-center rounded-lg border-2",
        "text-2xl font-bold uppercase shadow-[0_6px_24px_rgba(0,0,0,0.2)]",
        selectable ? "cursor-pointer" : "cursor-default",
        stateClassMap[state],
      ].join(" ")}
    >
      {letter}
    </motion.button>
  );
}
