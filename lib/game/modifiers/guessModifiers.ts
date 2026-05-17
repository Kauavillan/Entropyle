import type { ModifierKey } from "./types";

export function applyGuessModifier(
  baseAttempts: number,
  appliedModifiers: ModifierKey[] = [],
): number {
  let result = baseAttempts;

  if (appliedModifiers.includes("plusGuess")) {
    result += 1;
  }

  if (appliedModifiers.includes("minusGuess")) {
    result = Math.max(1, result - 1);
  }

  return result;
}
