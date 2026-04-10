export type LetterState = "empty" | "correct" | "present" | "absent";

export type GuessEvaluation = {
  letter: string;
  state: LetterState;
};

export type SubmittedGuess = {
  word: string;
  evaluation: GuessEvaluation[];
};

export type GameStatus = "playing" | "won" | "lost";
