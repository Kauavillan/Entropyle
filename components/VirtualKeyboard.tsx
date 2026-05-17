"use client";

import { KEYBOARD_ROWS } from "@/lib/game/constants";
import { KeyButton } from "@/components/items/KeyButton";
import { useGameStore } from "@/stores/use-game-store";

type VirtualKeyboardProps = {
  onFeedback: (message: string) => void;
};

export function VirtualKeyboard({ onFeedback }: VirtualKeyboardProps) {
  const keyboardState = useGameStore((state) => state.keyboardState);
  const appendLetter = useGameStore((state) => state.appendLetter);
  const removeLetter = useGameStore((state) => state.removeLetter);
  const submitGuess = useGameStore((state) => state.submitGuess);

  async function onKeyPress(value: string) {
    if (value === "ENTER") {
      const result = await submitGuess();
      if (result.reason) {
        onFeedback(result.reason);
      }
      return;
    }

    if (value === "BACKSPACE") {
      removeLetter();
      return;
    }

    appendLetter(value);
  }

  return (
    <div className="mt-6 grid gap-2 sm:gap-3">
      {KEYBOARD_ROWS.map((row) => (
        <div
          key={row.join("")}
          className="flex justify-center gap-1.5 sm:gap-2"
        >
          {row.map((key) => (
            <KeyButton
              key={key}
              value={key}
              state={keyboardState[key]}
              onClick={onKeyPress}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
