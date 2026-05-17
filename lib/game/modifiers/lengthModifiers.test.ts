import { describe, expect, it } from "@jest/globals";

import { applyLengthModifier } from "./lengthModifiers";

describe("applyLengthModifier", () => {
  it("increments word length when plusLength is applied", () => {
    expect(applyLengthModifier(5, ["plusLength"])).toBe(6);
  });

  it("decrements word length when minusLength is applied", () => {
    expect(applyLengthModifier(5, ["minusLength"])).toBe(4);
  });

  it("keeps the minimum length at 3", () => {
    expect(applyLengthModifier(3, ["minusLength"])).toBe(3);
    expect(applyLengthModifier(2, ["minusLength"])).toBe(3);
  });

  it("keeps the maximum length at 7", () => {
    expect(applyLengthModifier(7, ["plusLength"])).toBe(7);
    expect(applyLengthModifier(8, [])).toBe(7);
  });

  it("applies both modifiers without leaving the allowed range", () => {
    expect(applyLengthModifier(5, ["plusLength", "minusLength"])).toBe(5);
  });

  it("ignores unknown modifiers", () => {
    expect(applyLengthModifier(5, ["unknown"])).toBe(5);
  });
});