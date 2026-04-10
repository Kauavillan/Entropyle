"use client";

import { AnimatePresence, motion } from "framer-motion";

type GameStatusProps = {
  message: string | null;
};

export function GameStatus({ message }: GameStatusProps) {
  return (
    <div className="h-8">
      <AnimatePresence mode="wait">
        {message ? (
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-md border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-center text-sm font-medium text-amber-100"
          >
            {message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
