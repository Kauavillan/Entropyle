import { normalizeWord } from "@/lib/game/helpers";

import type { ModifierKey } from "./types";

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export function countWordVowels(word: string): number {
  return normalizeWord(word)
    .split("")
    .reduce((count, letter) => count + (VOWELS.has(letter) ? 1 : 0), 0);
}

export function hasVowelCountModifier(
  appliedModifiers: ModifierKey[] = [],
): boolean {
  return appliedModifiers.includes("vowelCount");
}
