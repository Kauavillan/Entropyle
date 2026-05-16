"use client";

import { create } from "zustand";

import { evaluateGuess } from "@/lib/game/evaluate-guess";
import { PHASE_CONFIGS, TOTAL_PHASES, WORD_LENGTH } from "@/lib/game/constants";
import { normalizeWord, randomWord } from "@/lib/game/helpers";
import { applyGuessModifier } from "@/lib/game/modifiers/guessModifiers";
import { applyLengthModifier } from "@/lib/game/modifiers/lengthModifiers";
import type { GameStatus, LetterState, PhaseGridState } from "@/lib/game/types";

type SubmitResult = {
  ok: boolean;
  reason?: string;
};

type GuessLetters = string[];

export type Modifier = { modifier: string; description: string };

type DictionaryMode = "standard" | "top100" | "top300";

type GameStore = {
  currentPhaseIndex: number;
  phaseGrids: PhaseGridState[];
  currentGuess: GuessLetters;
  boardRevision: number;
  activeIndex: number;
  attemptsUsed: number;
  gameStatus: GameStatus;
  isAwaitingNextPhase: boolean;
  isLoadingPhase: boolean;
  hasInitialized: boolean;
  isSuccessModalOpen: boolean;
  isIntroModalOpen: boolean;
  keyboardState: Record<string, LetterState>;
  initializeGame: () => Promise<void>;
  setActiveIndex: (index: number) => void;
  moveActiveIndex: (direction: -1 | 1) => void;
  appendLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => Promise<SubmitResult>;
  advancePhase: () => Promise<SubmitResult>;
  closeSuccessModal: () => void;
  closeIntroModal: () => Promise<void>;
  resetGame: () => Promise<SubmitResult>;
  // Modifiers
  appliedModifiers: Modifier[];
  showRoulette: boolean;
  pendingPhaseIndex: number | null;
  dictionaryMode: DictionaryMode;
  setModifier: (modifier: Modifier) => Promise<SubmitResult>;
  startPhaseRoulette: (phaseIndex: number) => void;
  // Derived values
  effectiveWordLength: number;
  effectiveMaxAttempts: number;
};

const INTRO_SESSION_STORAGE_KEY = "entropyle:intro-seen";

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

function createEmptyGuess(length = WORD_LENGTH): GuessLetters {
  return Array.from({ length }, () => "");
}

function buildWordRequestParams(
  length: number,
  dictionaryMode: DictionaryMode,
  extraParams: Record<string, string> = {},
) {
  const params = new URLSearchParams({
    length: String(length),
    ...extraParams,
  });

  if (dictionaryMode !== "standard") {
    params.set("icf", "true");
    params.set("pool", dictionaryMode);
  } else {
    params.set("icf", "false");
  }

  return params;
}

function clampIndex(index: number, length = WORD_LENGTH) {
  return Math.max(0, Math.min(length - 1, index));
}

function getPhaseConfig(phaseIndex: number) {
  const safeIndex = Math.max(0, Math.min(phaseIndex, TOTAL_PHASES - 1));
  return PHASE_CONFIGS[safeIndex];
}

function createPhaseGrids(answers: string[]): PhaseGridState[] {
  return answers.map((answer) => ({
    answer,
    guesses: [],
    solved: false,
  }));
}

async function fetchPhaseAnswers(
  phaseIndex: number,
  length = WORD_LENGTH,
  dictionaryMode: DictionaryMode = "standard",
  extraParams: Record<string, string> = {},
): Promise<string[]> {
  const config = getPhaseConfig(phaseIndex);
  const searchParams = buildWordRequestParams(length, dictionaryMode, {
    count: String(config.words),
    ...extraParams,
  });

  const response = await fetch(`/api/words?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as palavras da fase.");
  }

  const data: { words?: string[] } = await response.json();
  const words = (data.words ?? [])
    .map((word) => normalizeWord(word))
    .filter((word) => word.length === length);

  if (words.length < config.words) {
    throw new Error("Quantidade insuficiente de palavras para a fase.");
  }

  return words.slice(0, config.words);
}

function createFallbackAnswers(
  phaseIndex: number,
  length = WORD_LENGTH,
): string[] {
  const config = getPhaseConfig(phaseIndex);

  const words: string[] = [];

  for (let i = 0; i < config.words; i += 1) {
    let picked = normalizeWord(randomWord());
    if (picked.length !== length) {
      let attempts = 0;
      while (attempts < 8 && picked.length !== length) {
        picked = normalizeWord(randomWord());
        attempts += 1;
      }

      if (picked.length !== length) {
        if (picked.length > length) picked = picked.slice(0, length);
        else picked = picked.padEnd(length, "A");
      }
    }

    words.push(picked);
  }

  return words;
}

function createInitialState(): Omit<
  GameStore,
  | "initializeGame"
  | "setActiveIndex"
  | "moveActiveIndex"
  | "appendLetter"
  | "removeLetter"
  | "submitGuess"
  | "advancePhase"
  | "closeSuccessModal"
  | "closeIntroModal"
  | "resetGame"
  | "setModifier"
  | "startPhaseRoulette"
> {
  return {
    currentPhaseIndex: 0,
    phaseGrids: [] as PhaseGridState[],
    boardRevision: 0,
    currentGuess: createEmptyGuess(),
    activeIndex: 0,
    attemptsUsed: 0,
    gameStatus: "playing" as GameStatus,
    isAwaitingNextPhase: false,
    isLoadingPhase: false,
    hasInitialized: false,
    isSuccessModalOpen: false,
    isIntroModalOpen: false,
    keyboardState: {},
    appliedModifiers: [],
    showRoulette: true,
    pendingPhaseIndex: 0,
    dictionaryMode: "standard",
    effectiveWordLength: WORD_LENGTH,
    effectiveMaxAttempts: PHASE_CONFIGS[0].maxAttempts,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  initializeGame: async () => {
    const { hasInitialized } = get();

    if (hasInitialized) {
      return;
    }

    const hasSeenIntro =
      window.sessionStorage.getItem(INTRO_SESSION_STORAGE_KEY) === "true";

    if (!hasSeenIntro) {
      set({
        hasInitialized: true,
        isIntroModalOpen: true,
        showRoulette: false,
        dictionaryMode: "standard",
      });
      return;
    }

    set({ hasInitialized: true });
    await get().resetGame();
  },

  setActiveIndex: (index) => {
    const {
      gameStatus,
      isAwaitingNextPhase,
      isLoadingPhase,
      isIntroModalOpen,
    } = get();

    if (
      gameStatus !== "playing" ||
      isAwaitingNextPhase ||
      isLoadingPhase ||
      isIntroModalOpen
    ) {
      return;
    }

    const length = get().effectiveWordLength ?? WORD_LENGTH;
    set({ activeIndex: clampIndex(index, length) });
  },

  moveActiveIndex: (direction) => {
    const { gameStatus, activeIndex, isAwaitingNextPhase, isLoadingPhase } =
      get();

    if (
      gameStatus !== "playing" ||
      isAwaitingNextPhase ||
      isLoadingPhase ||
      get().isIntroModalOpen
    ) {
      return;
    }

    const length = get().effectiveWordLength ?? WORD_LENGTH;
    set({ activeIndex: clampIndex(activeIndex + direction, length) });
  },

  appendLetter: (letter) => {
    const value = normalizeWord(letter);

    if (!/^[A-Z]$/.test(value)) {
      return;
    }

    const {
      gameStatus,
      currentGuess,
      activeIndex,
      isAwaitingNextPhase,
      isIntroModalOpen,
    } = get();

    if (gameStatus !== "playing" || isAwaitingNextPhase || isIntroModalOpen) {
      return;
    }

    const nextGuess = [...currentGuess];
    nextGuess[activeIndex] = value;

    const length = get().effectiveWordLength ?? WORD_LENGTH;
    let nextActiveIndex = activeIndex;
    for (let index = activeIndex + 1; index < length; index += 1) {
      if (!nextGuess[index]) {
        nextActiveIndex = index;
        break;
      }
    }

    set({ currentGuess: nextGuess, activeIndex: nextActiveIndex });
  },

  removeLetter: () => {
    const { gameStatus, currentGuess, activeIndex, isAwaitingNextPhase } =
      get();

    if (
      gameStatus !== "playing" ||
      isAwaitingNextPhase ||
      get().isIntroModalOpen
    ) {
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

  submitGuess: async () => {
    const {
      phaseGrids,
      currentGuess,
      keyboardState,
      gameStatus,
      attemptsUsed,
      currentPhaseIndex,
      isAwaitingNextPhase,
      isLoadingPhase,
      isIntroModalOpen,
      dictionaryMode,
    } = get();
    const currentWordLength = currentGuess.length;
    const phaseConfig = getPhaseConfig(currentPhaseIndex);

    if (gameStatus !== "playing" || isIntroModalOpen) {
      return {
        ok: false,
        reason: "A partida terminou. Reinicie para jogar novamente.",
      };
    }

    if (isLoadingPhase) {
      return { ok: false, reason: "Carregando palavras da fase atual." };
    }

    if (isAwaitingNextPhase) {
      return {
        ok: false,
        reason: "Fase concluida. Clique em avancar para continuar.",
      };
    }

    if (currentGuess.some((letter) => !letter)) {
      return {
        ok: false,
        reason: `A palavra precisa ter ${currentWordLength} letras.`,
      };
    }

    const normalizedGuess = normalizeWord(currentGuess.join(""));

    try {
      const appliedKeysForValidation = get().appliedModifiers.map((m) => m.modifier);
      const extraForValidation: Record<string, string> = appliedKeysForValidation.includes(
        "OSREVNI",
      )
        ? { reverse: "true" }
        : {};

      const searchParams = buildWordRequestParams(
        currentWordLength,
        dictionaryMode,
        {
          word: normalizedGuess,
          ...extraForValidation,
        },
      );

      const response = await fetch(`/api/words?${searchParams.toString()}`);

      if (!response.ok) {
        return {
          ok: false,
          reason: "Nao foi possivel validar a palavra no momento.",
        };
      }

      const data: { exists?: boolean } = await response.json();

      if (!data.exists) {
        return { ok: false, reason: "Palavra fora do dicionario atual." };
      }
    } catch {
      return {
        ok: false,
        reason: "Nao foi possivel validar a palavra no momento.",
      };
    }

    const nextKeyboardState = { ...keyboardState };

    const nextPhaseGrids = phaseGrids.map((grid) => {
      if (grid.solved) {
        return grid;
      }

      const evaluation = evaluateGuess(normalizedGuess, grid.answer);
      evaluation.forEach(({ letter, state }) => {
        nextKeyboardState[letter] = mergeLetterState(
          nextKeyboardState[letter],
          state,
        );
      });

      const didSolveGrid = normalizeWord(grid.answer) === normalizedGuess;

      return {
        ...grid,
        guesses: [...grid.guesses, { word: currentGuess.join(""), evaluation }],
        solved: didSolveGrid,
      };
    });

    const nextAttemptsUsed = attemptsUsed + 1;
    const allWordsSolved = nextPhaseGrids.every((grid) => grid.solved);
    const isLastPhase = currentPhaseIndex === TOTAL_PHASES - 1;
    const effectiveMaxAttempts =
      get().effectiveMaxAttempts ?? phaseConfig.maxAttempts;
    const didLose = !allWordsSolved && nextAttemptsUsed >= effectiveMaxAttempts;
    const didWinGame = allWordsSolved && isLastPhase;
    const waitingNextPhase = allWordsSolved && !isLastPhase;

    set({
      phaseGrids: nextPhaseGrids,
      currentGuess: createEmptyGuess(get().effectiveWordLength ?? WORD_LENGTH),
      activeIndex: 0,
      attemptsUsed: nextAttemptsUsed,
      keyboardState: nextKeyboardState,
      gameStatus: didWinGame ? "won" : didLose ? "lost" : "playing",
      isAwaitingNextPhase: waitingNextPhase,
      isSuccessModalOpen: didWinGame,
    });

    if (didLose) {
      const missingWords = nextPhaseGrids
        .filter((grid) => !grid.solved)
        .map((grid) => grid.answer)
        .join(", ");

      return {
        ok: true,
        reason: `Fim de jogo. Palavras restantes: ${missingWords}.`,
      };
    }

    if (waitingNextPhase) {
      return {
        ok: true,
        reason: `Fase ${currentPhaseIndex + 1} concluida. Clique em avancar fase.`,
      };
    }

    if (didWinGame) {
      return { ok: true, reason: "Voce concluiu todas as fases." };
    }

    return { ok: true };
  },

  advancePhase: async () => {
    const {
      gameStatus,
      isAwaitingNextPhase,
      currentPhaseIndex,
      isIntroModalOpen,
    } = get();

    if (gameStatus !== "playing" || isIntroModalOpen) {
      return { ok: false, reason: "A partida terminou. Reinicie para jogar." };
    }

    if (!isAwaitingNextPhase) {
      return {
        ok: false,
        reason: "A fase atual ainda nao foi concluida.",
      };
    }

    const nextPhaseIndex = currentPhaseIndex + 1;

    if (nextPhaseIndex >= TOTAL_PHASES) {
      return { ok: false, reason: "Nao existem mais fases para avancar." };
    }

    // Instead of loading words immediately, start the roulette
    set({
      isLoadingPhase: false,
      pendingPhaseIndex: nextPhaseIndex,
      showRoulette: true,
    });

    return { ok: true };
  },

  closeSuccessModal: () => {
    set({ isSuccessModalOpen: false });
  },

  closeIntroModal: async () => {
    try {
      window.sessionStorage.setItem(INTRO_SESSION_STORAGE_KEY, "true");
    } catch {
      // Ignore storage failures and continue the game flow.
    }

    set({ isIntroModalOpen: false });
    await get().resetGame();
  },

  setModifier: async (modifier: Modifier) => {
    const pending = get().pendingPhaseIndex ?? get().currentPhaseIndex;
    const applied = [...get().appliedModifiers, modifier];
    const appliedKeys = applied.map((m) => m.modifier);
    const nextDictionaryMode: DictionaryMode =
      modifier.modifier === "top100Words"
        ? "top100"
        : modifier.modifier === "top300Words"
          ? "top300"
          : get().dictionaryMode;

    // compute effective values
    const effectiveWordLength = applyLengthModifier(WORD_LENGTH, appliedKeys);
    const phaseCfg = getPhaseConfig(pending);
    let effectiveMaxAttempts = applyGuessModifier(
      phaseCfg.maxAttempts,
      appliedKeys,
    );

    if (appliedKeys.includes("accumulateAttempts")) {
      const prevEffective = get().effectiveMaxAttempts ?? phaseCfg.maxAttempts;
      const leftover = Math.max(0, prevEffective - get().attemptsUsed);
      effectiveMaxAttempts += leftover;
    }

    set({
      appliedModifiers: applied,
      showRoulette: false,
      isLoadingPhase: true,
      dictionaryMode: nextDictionaryMode,
      effectiveWordLength,
      effectiveMaxAttempts,
    });

    try {
      const extra: Record<string, string> = appliedKeys.includes("OSREVNI")
        ? { reverse: "true" }
        : {};
      const answers = await fetchPhaseAnswers(
        pending,
        effectiveWordLength,
        nextDictionaryMode,
        extra,
      );

      set({
        currentPhaseIndex: pending,
        phaseGrids: createPhaseGrids(answers),
        boardRevision: get().boardRevision + 1,
        currentGuess: createEmptyGuess(effectiveWordLength),
        activeIndex: 0,
        attemptsUsed: 0,
        gameStatus: "playing",
        isAwaitingNextPhase: false,
        isLoadingPhase: false,
        isSuccessModalOpen: false,
        dictionaryMode: nextDictionaryMode,
        keyboardState: {},
        pendingPhaseIndex: null,
      });

      return { ok: true };
    } catch {
      const fallbackAnswers = createFallbackAnswers(
        pending,
        effectiveWordLength,
      );

      set({
        currentPhaseIndex: pending,
        phaseGrids: createPhaseGrids(fallbackAnswers),
        boardRevision: get().boardRevision + 1,
        currentGuess: createEmptyGuess(effectiveWordLength),
        activeIndex: 0,
        attemptsUsed: 0,
        gameStatus: "playing",
        isAwaitingNextPhase: false,
        isLoadingPhase: false,
        isSuccessModalOpen: false,
        dictionaryMode: nextDictionaryMode,
        keyboardState: {},
        pendingPhaseIndex: null,
      });

      return {
        ok: false,
        reason: "Fase carregada com palavras locais por falha no servidor.",
      };
    }
  },

  startPhaseRoulette: (phaseIndex: number) => {
    set({
      pendingPhaseIndex: phaseIndex,
      showRoulette: true,
      isLoadingPhase: false,
    });
  },

  resetGame: async () => {
    // Start with a fresh set of modifiers and show the roulette for phase 0
    set({
      currentPhaseIndex: 0,
      phaseGrids: [],
      boardRevision: get().boardRevision + 1,
      currentGuess: createEmptyGuess(),
      activeIndex: 0,
      attemptsUsed: 0,
      gameStatus: "playing",
      isAwaitingNextPhase: false,
      isLoadingPhase: false,
      isSuccessModalOpen: false,
      isIntroModalOpen: false,
      keyboardState: {},
      hasInitialized: true,
      appliedModifiers: [],
      showRoulette: true,
      pendingPhaseIndex: 0,
      dictionaryMode: "standard",
      effectiveWordLength: WORD_LENGTH,
      effectiveMaxAttempts: PHASE_CONFIGS[0].maxAttempts,
    });

    return { ok: true };
  },
}));
