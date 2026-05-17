import { WORD_BANK } from "@/lib/game/constants";

export function normalizeWord(value: string) {
  return value.trim().normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();
}

export function randomWord() {
  const index = Math.floor(Math.random() * WORD_BANK.length);
  return WORD_BANK[index];
}

export function isValidDictionaryWord(value: string) {
  return WORD_BANK.includes(normalizeWord(value));
}
