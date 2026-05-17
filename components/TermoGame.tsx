"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { PHASE_CONFIGS, TOTAL_PHASES } from "@/lib/game/constants";
import { GameStatus } from "@/components/GameStatus";
import { IntroModal } from "@/components/IntroModal";
import { NextPhaseModal } from "@/components/NextPhaseModal";
import { SuccessModal } from "@/components/SuccessModal";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import { useGameStore } from "@/stores/use-game-store";
import GridsContainer from "./GridsContainer";
import { Roulette } from "./Roulette";

export function TermoGame() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const currentPhaseIndex = useGameStore((state) => state.currentPhaseIndex);
  const phaseGrids = useGameStore((state) => state.phaseGrids);
  const attemptsUsed = useGameStore((state) => state.attemptsUsed);
  const effectiveWordLength = useGameStore((s) => s.effectiveWordLength);
  const effectiveMaxAttempts = useGameStore(
    (s) =>
      s.effectiveMaxAttempts ?? PHASE_CONFIGS[currentPhaseIndex].maxAttempts,
  );
  const appliedModifiers = useGameStore((s) => s.appliedModifiers);
  const isAwaitingNextPhase = useGameStore(
    (state) => state.isAwaitingNextPhase,
  );
  const isLoadingPhase = useGameStore((state) => state.isLoadingPhase);
  const isIntroModalOpen = useGameStore((state) => state.isIntroModalOpen);
  const isSuccessModalOpen = useGameStore((state) => state.isSuccessModalOpen);
  const initializeGame = useGameStore((state) => state.initializeGame);
  const appendLetter = useGameStore((state) => state.appendLetter);
  const removeLetter = useGameStore((state) => state.removeLetter);
  const moveActiveIndex = useGameStore((state) => state.moveActiveIndex);
  const submitGuess = useGameStore((state) => state.submitGuess);
  const advancePhase = useGameStore((state) => state.advancePhase);
  const closeSuccessModal = useGameStore((state) => state.closeSuccessModal);
  const closeIntroModal = useGameStore((state) => state.closeIntroModal);
  const resetGame = useGameStore((state) => state.resetGame);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const currentPhase = currentPhaseIndex + 1;
  const currentPhaseConfig = PHASE_CONFIGS[currentPhaseIndex];

  useEffect(() => {
    void initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    async function onKeyDown(event: KeyboardEvent) {
      if (isIntroModalOpen) {
        return;
      }

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
        const result = await submitGuess();
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
  }, [
    appendLetter,
    isIntroModalOpen,
    moveActiveIndex,
    removeLetter,
    submitGuess,
  ]);

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
    if (isLoadingPhase) {
      return "Carregando fase";
    }

    if (isAwaitingNextPhase) {
      return "Fase concluida";
    }

    if (gameStatus === "won") {
      return "Partida concluida";
    }

    if (gameStatus === "lost") {
      return "Sem tentativas restantes";
    }

    return "Descubra a palavra";
  }, [gameStatus, isAwaitingNextPhase, isLoadingPhase]);

  async function handleResetGame() {
    const result = await resetGame();
    if (result.reason) {
      setFeedbackMessage(result.reason);
    }
  }

  async function handleAdvancePhase() {
    const result = await advancePhase();
    if (result.reason) {
      setFeedbackMessage(result.reason);
    }
  }

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
            onClick={handleResetGame}
            className="rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/10"
          >
            Nova partida
          </button>
        </header>

        <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-400">
          <p>
            Fase {currentPhase}/{TOTAL_PHASES}
          </p>
          <p>{effectiveMaxAttempts} tentativas</p>
          <p>{currentPhaseConfig.words} palavra(s)</p>
          <p>{effectiveWordLength} letras</p>
          <p>
            {attemptsUsed}/{effectiveMaxAttempts}
          </p>
        </div>

        {appliedModifiers.length > 0 ? (
          <div className="mb-4 flex gap-2">
            {appliedModifiers.map((m) => (
              <span
                key={m.modifier}
                className="rounded-sm bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
              >
                {m.description}
              </span>
            ))}
          </div>
        ) : null}

        <GameStatus message={feedbackMessage} />
        <GridsContainer />
        <VirtualKeyboard />
      </motion.section>

      <NextPhaseModal
        open={isAwaitingNextPhase}
        phaseNumber={currentPhase + 1}
        onAdvance={handleAdvancePhase}
      />

      <SuccessModal
        open={isSuccessModalOpen}
        onClose={closeSuccessModal}
        onPlayAgain={handleResetGame}
        answers={phaseGrids.map((grid) => grid.answer)}
      />
      <IntroModal open={isIntroModalOpen} onStart={closeIntroModal} />
      <Roulette />
    </>
  );
}
