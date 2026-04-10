"use client";

import { create } from "zustand";

import { evaluateGuess } from "@/lib/game/evaluate-guess";
import { MAX_ATTEMPTS, WORD_BANK, WORD_LENGTH } from "@/lib/game/constants";
import {
  isValidDictionaryWord,
  normalizeWord,
  randomWord,
} from "@/lib/game/helpers";
import type { GameStatus, LetterState, SubmittedGuess } from "@/lib/game/types";

type SubmitResult = {
  ok: boolean;
  reason?: string;
};

type GuessLetters = string[];

type GameStore = {
  answer: string;
  currentGuess: GuessLetters;
  activeIndex: number;
  guesses: SubmittedGuess[];
  gameStatus: GameStatus;
  isSuccessModalOpen: boolean;
  keyboardState: Record<string, LetterState>;
  setActiveIndex: (index: number) => void;
  moveActiveIndex: (direction: -1 | 1) => void;
  appendLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => SubmitResult;
  closeSuccessModal: () => void;
  resetGame: () => void;
};

const letterPriority: Record<LetterState, number> = {
  empty: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

function mergeLetterState(
  current: LetterState | undefined,
  incoming: LetterState,
): LetterState {
  const safeCurrent = current ?? "empty";
  return letterPriority[incoming] > letterPriority[safeCurrent]
    ? incoming
    : safeCurrent;
}

function createEmptyGuess(): GuessLetters {
  return Array.from({ length: WORD_LENGTH }, () => "");
}

function clampIndex(index: number) {
  return Math.max(0, Math.min(WORD_LENGTH - 1, index));
}

function createInitialState() {
  return {
    answer: randomWord(),
    currentGuess: createEmptyGuess(),
    activeIndex: 0,
    guesses: [],
    gameStatus: "playing" as GameStatus,
    isSuccessModalOpen: false,
    keyboardState: {},
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  setActiveIndex: (index) => {
    const { gameStatus } = get();

    if (gameStatus !== "playing") {
      return;
    }

    set({ activeIndex: clampIndex(index) });
  },

  moveActiveIndex: (direction) => {
    const { gameStatus, activeIndex } = get();

    if (gameStatus !== "playing") {
      return;
    }

    set({ activeIndex: clampIndex(activeIndex + direction) });
  },

  appendLetter: (letter) => {
    const value = normalizeWord(letter);

    if (!/^[A-Z]$/.test(value)) {
      return;
    }

    const { gameStatus, currentGuess, activeIndex } = get();

    if (gameStatus !== "playing") {
      return;
    }

    const nextGuess = [...currentGuess];
    nextGuess[activeIndex] = value;

    let nextActiveIndex = activeIndex;
    for (let index = activeIndex + 1; index < WORD_LENGTH; index += 1) {
      if (!nextGuess[index]) {
        nextActiveIndex = index;
        break;
      }
    }

    set({ currentGuess: nextGuess, activeIndex: nextActiveIndex });
  },

  removeLetter: () => {
    const { gameStatus, currentGuess, activeIndex } = get();

    if (gameStatus !== "playing") {
      return;
    }

    const nextGuess = [...currentGuess];

    if (nextGuess[activeIndex]) {
      nextGuess[activeIndex] = "";
      set({ currentGuess: nextGuess });
      return;
    }

    for (let index = activeIndex - 1; index >= 0; index -= 1) {
      if (nextGuess[index]) {
        nextGuess[index] = "";
        set({ currentGuess: nextGuess, activeIndex: index });
        return;
      }
    }
  },

  submitGuess: () => {
    const { answer, guesses, currentGuess, keyboardState, gameStatus } = get();

    if (gameStatus !== "playing") {
      return {
        ok: false,
        reason: "A partida terminou. Reinicie para jogar novamente.",
      };
    }

    if (currentGuess.some((letter) => !letter)) {
      return {
        ok: false,
        reason: `A palavra precisa ter ${WORD_LENGTH} letras.`,
      };
    }

    const normalizedGuess = normalizeWord(currentGuess.join(""));

    if (!isValidDictionaryWord(normalizedGuess)) {
      return { ok: false, reason: "Palavra fora do dicionario atual." };
    }

    const evaluation = evaluateGuess(normalizedGuess, answer);
    const nextGuesses = [...guesses, { word: normalizedGuess, evaluation }];
    const didWin = normalizedGuess === answer;
    const didLose = !didWin && nextGuesses.length >= MAX_ATTEMPTS;

    const nextKeyboardState = { ...keyboardState };
    evaluation.forEach(({ letter, state }) => {
      nextKeyboardState[letter] = mergeLetterState(
        nextKeyboardState[letter],
        state,
      );
    });

    set({
      guesses: nextGuesses,
      currentGuess: createEmptyGuess(),
      activeIndex: 0,
      keyboardState: nextKeyboardState,
      gameStatus: didWin ? "won" : didLose ? "lost" : "playing",
      isSuccessModalOpen: didWin,
    });

    if (didLose) {
      return { ok: true, reason: `Fim de jogo. A palavra era ${answer}.` };
    }

    return { ok: true };
  },

  closeSuccessModal: () => {
    set({ isSuccessModalOpen: false });
  },

  resetGame: () => {
    const nextAnswer = randomWord();

    if (!WORD_BANK.includes(nextAnswer)) {
      throw new Error("Palavra sorteada invalida.");
    }

    set({
      answer: nextAnswer,
      currentGuess: createEmptyGuess(),
      activeIndex: 0,
      guesses: [],
      keyboardState: {},
      gameStatus: "playing",
      isSuccessModalOpen: false,
    });
  },
}));
