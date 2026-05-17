import { describe, expect, it } from "@jest/globals";

import { applyGuessModifier } from "./guessModifiers";
import { applyLengthModifier } from "./lengthModifiers";
import {
  buildWordRequestParams,
  computeEffectiveMaxAttempts,
  computeEffectiveWordLength,
  getModifierKeys,
  getWordRequestExtras,
  resolveDictionaryMode,
  resolveModifierApplication,
} from "./effects";

describe("modifier effects", () => {
  it("resolves the next dictionary mode from the selected modifier", () => {
    expect(resolveDictionaryMode("standard", "top100Words")).toBe("top100");
    expect(resolveDictionaryMode("top100", "plusGuess")).toBe("top100");
    expect(resolveDictionaryMode("top100", "top300Words")).toBe("top300");
  });

  it("computes effective values using the existing modifier primitives", () => {
    expect(computeEffectiveWordLength(5, ["plusLength"])).toBe(
      applyLengthModifier(5, ["plusLength"]),
    );
    expect(computeEffectiveMaxAttempts(6, ["plusGuess"])).toBe(
      applyGuessModifier(6, ["plusGuess"]),
    );
  });

  it("accumulates leftover attempts when requested", () => {
    expect(
      computeEffectiveMaxAttempts(6, ["accumulateAttempts"], {
        attemptsUsed: 2,
        previousEffectiveMaxAttempts: 7,
        phaseIndex: 1,
      }),
    ).toBe(11);
  });

  it("builds reverse validation extras when OSREVNI is active", () => {
    expect(getWordRequestExtras(["OSREVNI"])).toEqual({ reverse: "true" });
    expect(getWordRequestExtras(["plusGuess"])).toEqual({});
  });

  it("creates URL search params for word requests", () => {
    const params = buildWordRequestParams(5, "top100", { word: "CASA" });
    expect(params.get("length")).toBe("5");
    expect(params.get("icf")).toBe("true");
    expect(params.get("pool")).toBe("top100");
    expect(params.get("word")).toBe("CASA");
  });

  it("resolves the modifier application in one place", () => {
    const application = resolveModifierApplication({
      appliedModifiers: [
        { modifier: "plusGuess", description: "+1 tentativa" },
        { modifier: "accumulateAttempts", description: "Acumular tentativas" },
        { modifier: "OSREVNI", description: "OSREVNI — inverter palavra" },
      ],
      selectedModifier: "top300Words",
      currentDictionaryMode: "standard",
      baseAttempts: 6,
      attemptsUsed: 1,
      previousEffectiveMaxAttempts: 7,
      currentPhaseIndex: 1,
    });

    expect(application.appliedKeys).toEqual([
      "plusGuess",
      "accumulateAttempts",
      "OSREVNI",
    ]);
    expect(application.dictionaryMode).toBe("top300");
    expect(application.effectiveWordLength).toBe(5);
    expect(application.effectiveMaxAttempts).toBe(13);
    expect(application.requestExtras).toEqual({ reverse: "true" });
  });

  it("keeps modifier keys in the order they were applied", () => {
    expect(
      getModifierKeys([
        { modifier: "minusGuess", description: "-1 tentativa" },
        { modifier: "plusLength", description: "+1 letra na palavra" },
      ]),
    ).toEqual(["minusGuess", "plusLength"]);
  });
});
