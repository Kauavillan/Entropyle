import type { GuessEvaluation } from "@/lib/game/types";

export function evaluateGuess(
  guess: string,
  answer: string,
): GuessEvaluation[] {
  const guessChars = guess.split("");
  const answerChars = answer.split("");

  const result: GuessEvaluation[] = guessChars.map((letter) => ({
    letter,
    state: "absent",
  }));

  const letterCounts: Record<string, number> = {};

  answerChars.forEach((letter) => {
    letterCounts[letter] = (letterCounts[letter] ?? 0) + 1;
  });

  for (let index = 0; index < guessChars.length; index += 1) {
    if (guessChars[index] === answerChars[index]) {
      result[index].state = "correct";
      letterCounts[guessChars[index]] -= 1;
    }
  }

  for (let index = 0; index < guessChars.length; index += 1) {
    const currentLetter = guessChars[index];

    if (result[index].state === "correct") {
      continue;
    }

    if ((letterCounts[currentLetter] ?? 0) > 0) {
      result[index].state = "present";
      letterCounts[currentLetter] -= 1;
    }
  }

  return result;
}
