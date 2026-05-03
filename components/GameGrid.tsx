"use client";

import { WORD_LENGTH, MAX_ATTEMPTS } from "@/lib/game/constants";
import { LetterCell } from "@/components/items/LetterCell";
import { useGameStore } from "@/stores/use-game-store";

export function GameGrid() {
  const guesses = useGameStore((state) => state.guesses);
  const currentGuess = useGameStore((state) => state.currentGuess);
  const activeIndex = useGameStore((state) => state.activeIndex);
  const setActiveIndex = useGameStore((state) => state.setActiveIndex);

  return (
    <div className="grid gap-2 sm:gap-3">
      {Array.from({ length: MAX_ATTEMPTS }, (_, rowIndex) => {
        const submitted = guesses[rowIndex];
        const isCurrentRow = rowIndex === guesses.length;

        const letters = submitted
          ? submitted.word.split("")
          : isCurrentRow
            ? currentGuess
            : [];

        return (
          <div key={`row-${rowIndex}`} className="flex gap-2 sm:gap-3">
            {Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
              const letter = letters[colIndex] ?? "";
              const evaluationState =
                submitted?.evaluation[colIndex]?.state ?? "empty";
              const shouldReveal = Boolean(submitted);
              // Active apenas se for a linha atual E o índice for igual ao activeIndex
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
