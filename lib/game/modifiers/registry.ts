import type { Modifier } from "./types";

export const MODIFIER_REGISTRY: Modifier[] = [
  { modifier: "minusGuess", description: "-1 tentativa" },
  { modifier: "plusGuess", description: "+1 tentativa" },
  { modifier: "minusLength", description: "-1 letra na palavra" },
  { modifier: "plusLength", description: "+1 letra na palavra" },
  { modifier: "top100Words", description: "top 100 fáceis" },
  { modifier: "top300Words", description: "top 300 difíceis" },
  { modifier: "accumulateAttempts", description: "Acumular tentativas" },
  { modifier: "vowelCount", description: "Mostrar n° de vogais" },
  {
    modifier: "firstGuessReveal",
    description: "Revelar 1 letra",
  },
  { modifier: "OSREVNI", description: "osrevnI: letras invertidas" },
];

export function getModifierByKey(modifierKey: Modifier["modifier"]): Modifier {
  const modifier = MODIFIER_REGISTRY.find(
    (item) => item.modifier === modifierKey,
  );

  if (!modifier) {
    throw new Error(`Unknown modifier key: ${modifierKey}`);
  }

  return modifier;
}
