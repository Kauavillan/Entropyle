import { describe, expect, it, jest } from "@jest/globals";

import {
  hasFirstGuessRevealModifier,
  pickFirstGuessRevealIndex,
} from "./firstGuessReveal";

describe("firstGuessReveal", () => {
  it("detects the modifier key", () => {
    expect(hasFirstGuessRevealModifier(["firstGuessReveal"])).toBe(true);
    expect(hasFirstGuessRevealModifier(["plusGuess"])).toBe(false);
  });

  it("picks an index within the word length", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.6);

    expect(pickFirstGuessRevealIndex(5)).toBe(3);

    jest.restoreAllMocks();
  });
});
