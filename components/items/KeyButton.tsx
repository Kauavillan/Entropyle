"use client";

import { motion } from "framer-motion";

import type { LetterState } from "@/lib/game/types";

type KeyButtonProps = {
  value: string;
  state?: LetterState;
  onClick: (value: string) => void;
};

const stateClassMap: Record<LetterState, string> = {
  empty: "bg-white/10 text-white hover:bg-white/20",
  correct: "bg-emerald-500 text-white",
  present: "bg-amber-400 text-zinc-900",
  absent: "bg-zinc-600 text-zinc-100",
};

export function KeyButton({ value, state = "empty", onClick }: KeyButtonProps) {
  const isActionKey = value === "ENTER" || value === "BACKSPACE";
  const label = value === "BACKSPACE" ? "Apagar" : value;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -1 }}
      onClick={() => onClick(value)}
      className={[
        "rounded-md px-3 py-3 text-sm font-semibold tracking-wide transition-colors",
        isActionKey ? "min-w-20" : "min-w-10",
        stateClassMap[state],
      ].join(" ")}
      type="button"
    >
      {label}
    </motion.button>
  );
}
