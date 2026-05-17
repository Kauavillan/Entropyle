export type DictionaryMode = "standard" | "top100" | "top300";

export type ModifierKey =
  | "minusGuess"
  | "plusGuess"
  | "minusLength"
  | "plusLength"
  | "top100Words"
  | "top300Words"
  | "accumulateAttempts"
  | "vowelCount"
  | "firstGuessReveal"
  | "OSREVNI";

export type Modifier = {
  modifier: ModifierKey;
  description: string;
};
