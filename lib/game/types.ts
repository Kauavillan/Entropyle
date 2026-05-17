export type LetterState =
  | "empty"
  | "correct"
  | "correct-hint"
  | "present"
  | "absent";

export type GuessEvaluation = {
  letter: string;
  state: LetterState;
};

export type SubmittedGuess = {
  word: string;
  evaluation: GuessEvaluation[];
};

export type PhaseGridState = {
  answer: string;
  guesses: SubmittedGuess[];
  solved: boolean;
  firstGuessRevealIndex: number | null;
};

export type GameStatus = "playing" | "won" | "lost";
