import type { ModifierKey } from "./types";

const MIN_LENGTH = 3;
const MAX_LENGTH = 7;

export function applyLengthModifier(
  baseLength: number,
  appliedModifiers: ModifierKey[] = [],
): number {
  let result = baseLength;

  if (appliedModifiers.includes("plusLength")) {
    result += 1;
  }

  if (appliedModifiers.includes("minusLength")) {
    result = Math.max(MIN_LENGTH, result - 1);
  }

  if (result < MIN_LENGTH) result = MIN_LENGTH;
  if (result > MAX_LENGTH) result = MAX_LENGTH;

  return result;
}
