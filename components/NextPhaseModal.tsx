"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type NextPhaseModalProps = {
  open: boolean;
  phaseNumber: number;
  onAdvance: () => void;
};

export function NextPhaseModal({
  open,
  phaseNumber,
  onAdvance,
}: NextPhaseModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (open) {
      timer = setTimeout(() => setVisible(true), 1000);
    } else {
      // hide immediately when `open` becomes false
      setVisible(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="w-full max-w-md rounded-3xl border border-emerald-300/30 bg-zinc-950 p-6 text-zinc-50 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Fase concluída
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Você avançou de fase
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Excelente. A próxima etapa já está pronta para começar. Avance
              para a fase {phaseNumber} para continuar a partida.
            </p>

            <button
              type="button"
              onClick={onAdvance}
              className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              Ir para a fase {phaseNumber}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
