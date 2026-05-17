import { describe, expect, it } from "@jest/globals";

import { applyGuessModifier } from "./guessModifiers";

describe("applyGuessModifier", () => {
  it("increments attempts when plusGuess is applied", () => {
    expect(applyGuessModifier(6, ["plusGuess"])).toBe(7);
  });

  it("decrements attempts when minusGuess is applied", () => {
    expect(applyGuessModifier(6, ["minusGuess"])).toBe(5);
  });

  it("keeps at least one attempt", () => {
    expect(applyGuessModifier(1, ["minusGuess"])).toBe(1);
  });

  it("ignores unknown modifiers", () => {
    expect(applyGuessModifier(4, ["unknown" as any])).toBe(4);
  });
});
