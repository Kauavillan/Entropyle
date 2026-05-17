import type { ModifierKey } from "./types";

export function hasFirstGuessRevealModifier(
  appliedModifiers: ModifierKey[] = [],
): boolean {
  return appliedModifiers.includes("firstGuessReveal");
}

export function pickFirstGuessRevealIndex(wordLength: number): number | null {
  if (wordLength <= 0) {
    return null;
  }

  return Math.floor(Math.random() * wordLength);
}
