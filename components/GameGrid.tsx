"use client";

import { PHASE_CONFIGS } from "@/lib/game/constants";
import { LetterCell } from "@/components/items/LetterCell";
import { useGameStore } from "@/stores/use-game-store";

type GameGridProps = {
  gridIndex: number;
};

export function GameGrid({ gridIndex }: GameGridProps) {
  const currentPhaseIndex = useGameStore((state) => state.currentPhaseIndex);
  const phaseGrids = useGameStore((state) => state.phaseGrids);
  const attemptsUsed = useGameStore((state) => state.attemptsUsed);
  const currentGuess = useGameStore((state) => state.currentGuess);
  const activeIndex = useGameStore((state) => state.activeIndex);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const isAwaitingNextPhase = useGameStore(
    (state) => state.isAwaitingNextPhase,
  );
  const setActiveIndex = useGameStore((state) => state.setActiveIndex);

  const phaseConfig = PHASE_CONFIGS[currentPhaseIndex];
  const grid = phaseGrids[gridIndex];
  const effectiveWordLength = useGameStore((s) => s.effectiveWordLength);
  const effectiveMaxAttempts = useGameStore((s) => s.effectiveMaxAttempts ?? phaseConfig.maxAttempts);

  if (!grid) {
    return null;
  }

  return (
    <div className="grid gap-2 sm:gap-3">
      {Array.from({ length: effectiveMaxAttempts }, (_, rowIndex) => {
        const submitted = grid.guesses[rowIndex];
        const hasAttemptsLeft = attemptsUsed < phaseConfig.maxAttempts;
        const isCurrentRow =
          rowIndex === attemptsUsed &&
          !submitted &&
          !grid.solved &&
          hasAttemptsLeft &&
          gameStatus === "playing" &&
          !isAwaitingNextPhase;

        const letters = submitted
          ? submitted.word.split("")
          : isCurrentRow
            ? currentGuess
            : [];

        return (
          <div key={`row-${rowIndex}`} className="flex gap-2 sm:gap-3">
            {Array.from({ length: effectiveWordLength }, (_, colIndex) => {
              const letter = letters[colIndex] ?? "";
              const evaluationState =
                submitted?.evaluation[colIndex]?.state ?? "empty";
              const shouldReveal = Boolean(submitted);
              const activeCell = isCurrentRow && colIndex === activeIndex;

              return (
                <LetterCell
                  key={`cell-${rowIndex}-${colIndex}`}
                  letter={letter}
                  state={evaluationState}
                  reveal={shouldReveal}
                  index={colIndex}
                  active={activeCell}
                  selectable={isCurrentRow}
                  onClick={
                    isCurrentRow ? () => setActiveIndex(colIndex) : undefined
                  }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
