import { WORD_LENGTH } from "@/lib/game/constants";

import { applyGuessModifier } from "./guessModifiers";
import { applyLengthModifier } from "./lengthModifiers";
import type { DictionaryMode, Modifier, ModifierKey } from "./types";

type AttemptContext = {
  attemptsUsed: number;
  previousEffectiveMaxAttempts: number;
  phaseIndex?: number;
};

export type ModifierApplication = {
  appliedKeys: ModifierKey[];
  effectiveWordLength: number;
  effectiveMaxAttempts: number;
  dictionaryMode: DictionaryMode;
  requestExtras: Record<string, string>;
};

export function getModifierKeys(modifiers: Modifier[] = []): ModifierKey[] {
  return modifiers.map((modifier) => modifier.modifier);
}

export function resolveDictionaryMode(
  currentDictionaryMode: DictionaryMode,
  selectedModifier: ModifierKey,
): DictionaryMode {
  if (selectedModifier === "top100Words") {
    return "top100";
  }

  if (selectedModifier === "top300Words") {
    return "top300";
  }

  return currentDictionaryMode;
}

export function computeEffectiveWordLength(
  baseLength: number,
  appliedModifiers: ModifierKey[] = [],
): number {
  return applyLengthModifier(baseLength, appliedModifiers);
}

export function computeEffectiveMaxAttempts(
  baseAttempts: number,
  appliedModifiers: ModifierKey[] = [],
  context?: Partial<AttemptContext>,
): number {
  let result = applyGuessModifier(baseAttempts, appliedModifiers);

  if (appliedModifiers.includes("accumulateAttempts")) {
    const phaseIndex = context?.phaseIndex ?? 0;
    const previousEffectiveMaxAttempts =
      context?.previousEffectiveMaxAttempts ?? baseAttempts;
    const attemptsUsed = context?.attemptsUsed ?? 0;

    if (phaseIndex === 0) {
      // On the first phase, accumulateAttempts only grants +1 attempt
      result += 1;
    } else {
      // On later phases, preserve previous behavior (add leftover)
      result += Math.max(0, previousEffectiveMaxAttempts - attemptsUsed);
    }
  }

  return result;
}

export function getWordRequestExtras(
  appliedModifiers: ModifierKey[] = [],
): Record<string, string> {
  return appliedModifiers.includes("OSREVNI") ? { reverse: "true" } : {};
}

export function buildWordRequestParams(
  length: number,
  dictionaryMode: DictionaryMode,
  extraParams: Record<string, string> = {},
) {
  const params = new URLSearchParams({
    length: String(length),
    ...extraParams,
  });

  if (dictionaryMode !== "standard") {
    params.set("icf", "true");
    params.set("pool", dictionaryMode);
  } else {
    params.set("icf", "false");
  }

  return params;
}

export function resolveModifierApplication({
  appliedModifiers,
  selectedModifier,
  currentDictionaryMode,
  baseLength = WORD_LENGTH,
  baseAttempts,
  attemptsUsed,
  previousEffectiveMaxAttempts,
  currentPhaseIndex = 0,
}: {
  appliedModifiers: Modifier[];
  selectedModifier: ModifierKey;
  currentDictionaryMode: DictionaryMode;
  baseLength?: number;
  baseAttempts: number;
  attemptsUsed: number;
  previousEffectiveMaxAttempts: number;
  currentPhaseIndex?: number;
}): ModifierApplication {
  const appliedKeys = getModifierKeys(appliedModifiers);

  return {
    appliedKeys,
    effectiveWordLength: computeEffectiveWordLength(baseLength, appliedKeys),
    effectiveMaxAttempts: computeEffectiveMaxAttempts(
      baseAttempts,
      appliedKeys,
      {
        attemptsUsed,
        previousEffectiveMaxAttempts,
        phaseIndex: currentPhaseIndex,
      },
    ),
    dictionaryMode: resolveDictionaryMode(
      currentDictionaryMode,
      selectedModifier,
    ),
    requestExtras: getWordRequestExtras(appliedKeys),
  };
}
