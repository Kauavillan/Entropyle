import { describe, expect, it } from "@jest/globals";

import { countWordVowels, hasVowelCountModifier } from "./vowelCount";

describe("vowelCount", () => {
  it("counts vowels in a word", () => {
    expect(countWordVowels("amigo")).toBe(3);
    expect(countWordVowels("brisa")).toBe(2);
    expect(countWordVowels("crwth")).toBe(0);
  });

  it("detects the vowel count modifier", () => {
    expect(hasVowelCountModifier(["vowelCount"])).toBe(true);
    expect(hasVowelCountModifier(["plusGuess"])).toBe(false);
  });
});
