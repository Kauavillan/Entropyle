"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { MAX_ATTEMPTS, WORD_LENGTH } from "@/lib/game/constants";
import { GameGrid } from "@/components/GameGrid";
import { GameStatus } from "@/components/GameStatus";
import { SuccessModal } from "@/components/SuccessModal";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import { useGameStore } from "@/stores/use-game-store";

export function TermoGame() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const isSuccessModalOpen = useGameStore((state) => state.isSuccessModalOpen);
  const guesses = useGameStore((state) => state.guesses);
  const appendLetter = useGameStore((state) => state.appendLetter);
  const removeLetter = useGameStore((state) => state.removeLetter);
  const moveActiveIndex = useGameStore((state) => state.moveActiveIndex);
  const submitGuess = useGameStore((state) => state.submitGuess);
  const closeSuccessModal = useGameStore((state) => state.closeSuccessModal);
  const resetGame = useGameStore((state) => state.resetGame);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key;

      if (key === "ArrowLeft") {
        event.preventDefault();
        moveActiveIndex(-1);
        return;
      }

      if (key === "ArrowRight") {
        event.preventDefault();
        moveActiveIndex(1);
        return;
      }

      if (key === "Enter") {
        const result = submitGuess();
        if (result.reason) {
          setFeedbackMessage(result.reason);
        }
        return;
      }

      if (key === "Backspace") {
        removeLetter();
        return;
      }

      if (/^[a-zA-Z]$/.test(key)) {
        appendLetter(key);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [appendLetter, moveActiveIndex, removeLetter, submitGuess]);

  useEffect(() => {
    if (!feedbackMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedbackMessage(null);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [feedbackMessage]);

  const titleMessage = useMemo(() => {
    if (gameStatus === "won") {
      return "Partida concluida";
    }

    if (gameStatus === "lost") {
      return "Sem tentativas restantes";
    }

    return "Descubra a palavra";
  }, [gameStatus]);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-3xl rounded-3xl border border-white/15 bg-zinc-900/65 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-8"
      >
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-50">
              ENTROPYLE
            </h1>
            <p className="text-sm text-zinc-300">{titleMessage}</p>
          </div>

          <button
            type="button"
            onClick={resetGame}
            className="rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/10"
          >
            Nova palavra
          </button>
        </header>

        <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-400">
          <p>{MAX_ATTEMPTS} tentativas</p>
          <p>{WORD_LENGTH} letras</p>
          <p>
            {guesses.length}/{MAX_ATTEMPTS}
          </p>
        </div>

        <GameStatus message={feedbackMessage} />
        <GameGrid />
        <VirtualKeyboard />
      </motion.section>

      <SuccessModal
        open={isSuccessModalOpen}
        onClose={closeSuccessModal}
        onPlayAgain={resetGame}
      />
    </>
  );
}
