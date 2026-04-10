"use client";

import { AnimatePresence, motion } from "framer-motion";

type SuccessModalProps = {
  open: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
};

export function SuccessModal({
  open,
  onClose,
  onPlayAgain,
}: SuccessModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="w-full max-w-md rounded-2xl border border-emerald-300/30 bg-zinc-950 p-6 text-zinc-50 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            <h2 className="text-2xl font-bold">Voce acertou!</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Excelente. A palavra foi descoberta com sucesso.
            </p>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-zinc-500/60 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={onPlayAgain}
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
              >
                Jogar novamente
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
