"use client";

import { PHASE_CONFIGS } from "@/lib/game/constants";
import {
  countWordVowels,
  hasVowelCountModifier,
} from "@/lib/game/modifiers/vowelCount";
import { hasFirstGuessRevealModifier } from "@/lib/game/modifiers/firstGuessReveal";
import { LetterCell } from "@/components/items/LetterCell";
import { useGameStore } from "@/stores/use-game-store";

type GameGridProps = {
  gridIndex: number;
};

const cellSizeClassByWordCount: Record<number, string> = {
  // Mobile-first sizes (sm: overrides for larger screens)
  1: "h-12 w-12 text-xl sm:h-14 sm:w-14 sm:text-2xl",
  2: "h-10 w-10 text-lg sm:h-12 sm:w-12 sm:text-xl",
  3: "h-9 w-9 text-sm sm:h-11 sm:w-11 sm:text-lg",
  4: "h-8 w-8 text-sm sm:h-10 sm:w-10 sm:text-base",
};

export function GameGrid({ gridIndex }: GameGridProps) {
  const currentPhaseIndex = useGameStore((state) => state.currentPhaseIndex);
  const phaseGrids = useGameStore((state) => state.phaseGrids);
  const attemptsUsed = useGameStore((state) => state.attemptsUsed);
  const currentGuess = useGameStore((state) => state.currentGuess);
  const activeIndex = useGameStore((state) => state.activeIndex);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const appliedModifiers = useGameStore((state) => state.appliedModifiers);
  const isAwaitingNextPhase = useGameStore(
    (state) => state.isAwaitingNextPhase,
  );
  const setActiveIndex = useGameStore((state) => state.setActiveIndex);

  const phaseConfig = PHASE_CONFIGS[currentPhaseIndex];
  const grid = phaseGrids[gridIndex];
  const effectiveWordLength = useGameStore((s) => s.effectiveWordLength);
  const effectiveMaxAttempts = useGameStore(
    (s) => s.effectiveMaxAttempts ?? phaseConfig.maxAttempts,
  );
  const appliedModifierKeys = appliedModifiers.map(
    (modifier) => modifier.modifier,
  );
  const showVowelCount = hasVowelCountModifier(appliedModifierKeys);
  const showFirstGuessReveal = hasFirstGuessRevealModifier(appliedModifierKeys);
  const vowelCount = showVowelCount ? countWordVowels(grid.answer) : null;
  const cellSizeClass =
    cellSizeClassByWordCount[phaseConfig.words] ?? cellSizeClassByWordCount[1];

  if (!grid) {
    return null;
  }

  return (
    <div className="grid gap-2 sm:gap-3">
      {showVowelCount ? (
        <div className="flex justify-center pb-1">
          <span className="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
            {vowelCount} voga{vowelCount === 1 ? "l" : "is"}
          </span>
        </div>
      ) : null}
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
              const revealHint =
                showFirstGuessReveal &&
                !submitted &&
                grid.firstGuessRevealIndex === colIndex &&
                !currentGuess[colIndex];

              const letter = revealHint
                ? (grid.answer[colIndex] ?? "")
                : (letters[colIndex] ?? "");

              const evaluationState =
                submitted?.evaluation[colIndex]?.state ??
                (revealHint ? "correct-hint" : "empty");

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
                  sizeClass={cellSizeClass}
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
