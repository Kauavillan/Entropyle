"use client";

import { motion } from "framer-motion";

import type { LetterState } from "@/lib/game/types";

import { FaBackspace } from "react-icons/fa";

type KeyButtonProps = {
  value: string;
  state?: LetterState;
  onClick: (value: string) => void;
};

const stateClassMap: Record<LetterState, string> = {
  empty: "bg-white/10 text-white hover:bg-white/20",
  correct: "bg-emerald-500 text-white",
  "correct-hint": "bg-emerald-500 text-white",
  present: "bg-amber-400 text-zinc-900",
  absent: "bg-zinc-600 text-zinc-100",
};

export function KeyButton({ value, state = "empty", onClick }: KeyButtonProps) {
  const isActionKey = value === "ENTER" || value === "BACKSPACE";
  const label =
    value === "BACKSPACE" ? <FaBackspace aria-hidden="true" /> : value;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -1 }}
      onClick={() => onClick(value)}
      className={[
        "rounded-md px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm font-semibold tracking-wide transition-colors flex-1 min-w-[28px]",
        isActionKey
          ? "flex-[1.6] sm:flex-none sm:min-w-[88px] rounded-xl border border-white/25 bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
          : "",
        isActionKey ? "" : stateClassMap[state],
      ].join(" ")}
      type="button"
      aria-label={value === "BACKSPACE" ? "Apagar" : value}
    >
      {label}
    </motion.button>
  );
}
