"use client";

import { AnimatePresence, motion } from "framer-motion";

type ExampleCardProps = {
  word: string;
  letters: Array<{
    letter: string;
    state: "correct" | "present" | "absent" | "empty";
  }>;
  description: string;
};

const exampleStateClasses: Record<
  ExampleCardProps["letters"][number]["state"],
  string
> = {
  empty: "border-white/20 bg-white/5 text-white/70",
  correct: "border-emerald-300/70 bg-emerald-500 text-white",
  present: "border-amber-300/70 bg-amber-400 text-zinc-950",
  absent: "border-zinc-700 bg-zinc-900 text-zinc-200",
};

function ExampleCard({ word, letters, description }: ExampleCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap gap-2">
        {word.split("").map((fallbackLetter, index) => {
          const cell = letters[index] ?? {
            letter: fallbackLetter,
            state: "empty" as const,
          };

          return (
            <div
              key={`${word}-${index}`}
              className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 text-lg font-black uppercase ${exampleStateClasses[cell.state]}`}
            >
              {cell.letter}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-300">{description}</p>
    </div>
  );
}

type IntroModalProps = {
  open: boolean;
  onStart: () => void;
};

export function IntroModal({ open, onStart }: IntroModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/65 px-4 py-6 sm:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="w-full max-w-lg max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-3xl border border-amber-300/30 bg-zinc-950 p-6 text-zinc-50 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:max-h-[calc(100dvh-4rem)] sm:p-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Regras básicas
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Antes de começar
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
              <p>
                Escreva uma palavra para tentar descobrir a resposta de cada
                fase.
              </p>
              <p>
                Se uma letra não existir na palavra, o fundo continua com a
                mesma cor.
              </p>
              <p>
                Se a letra existir, ela fica amarela quando estiver na posição
                errada e verde quando estiver na posição correta.
              </p>
              <p>
                Também existe uma roleta que adiciona modificadores ao jogo e
                altera a partida a cada fase.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <ExampleCard
                word="TURMA"
                letters={[
                  { letter: "C", state: "correct" },
                  { letter: "A", state: "absent" },
                  { letter: "R", state: "absent" },
                  { letter: "T", state: "absent" },
                  { letter: "A", state: "absent" },
                ]}
                description="Se a letra existe e está na posição certa, ela fica verde."
              />
              <ExampleCard
                word="VIOLA"
                letters={[
                  { letter: "P", state: "absent" },
                  { letter: "E", state: "absent" },
                  { letter: "I", state: "absent" },
                  { letter: "X", state: "present" },
                  { letter: "E", state: "absent" },
                ]}
                description="Se a letra existe, mas está em outra posição, ela fica amarela."
              />
              <ExampleCard
                word="PULGA"
                letters={[
                  { letter: "P", state: "absent" },
                  { letter: "U", state: "absent" },
                  { letter: "L", state: "absent" },
                  { letter: "G", state: "absent" },
                  { letter: "A", state: "absent" },
                ]}
                description="Se a letra não existe na palavra, ela mantém a aparência neutra do fundo."
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
              Dica: observe o padrão das cores para ajustar seus próximos
              palpites.
            </div>

            <button
              type="button"
              onClick={onStart}
              className="mt-6 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-zinc-950 shadow-[0_12px_30px_rgba(251,191,36,0.3)] transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              Entendi, começar
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
