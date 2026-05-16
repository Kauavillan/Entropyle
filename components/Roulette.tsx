"use client";

import { useMemo, useState } from "react";
import { Wheel } from "react-custom-roulette";
import { Modifier, useGameStore } from "@/stores/use-game-store";

// type ModifierKey = "minusGuess" | "plusGuess" | "minusLength" | "plusLength";

const COLORS_ARRAY = [
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#06b6d4", // teal
];

interface RouletteItem extends Modifier {
  color: string;
}

const GUESSES_MODIFIERS: Modifier[] = [
  { modifier: "minusGuess", description: "-1 tentativa" },
  { modifier: "plusGuess", description: "+1 tentativa" },
  { modifier: "minusLength", description: "-1 letra na palavra" },
  { modifier: "plusLength", description: "+1 letra na palavra" },
  {
    modifier: "top100Words",
    description: "top 100 fáceis",
  },
  {
    modifier: "top300Words",
    description: "top 300 difíceis",
  },
  { modifier: "accumulateAttempts", description: "Acumular tentativas" },
  { modifier: "OSREVNI", description: "OSREVNI — inverter palavra" },
];

const ITEMS: RouletteItem[] = GUESSES_MODIFIERS.map((modifier, index) => ({
  ...modifier,
  color: COLORS_ARRAY[index % COLORS_ARRAY.length],
}));

/**
 * Not in seconds, but a coeficient for the duration. It's the
 */
const spinDuration = 0.5;

export function Roulette() {
  const show = useGameStore((s) => s.showRoulette);
  const pendingPhase = useGameStore((s) => s.pendingPhaseIndex);
  const setModifier = useGameStore((s) => s.setModifier);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const data = useMemo(
    () => ITEMS.map((it) => ({ option: it.description })),
    [],
  );
  const backgroundColors = useMemo(() => ITEMS.map((it) => it.color), []);

  if (!show) return null;

  function handleStartSpin() {
    if (mustSpin) return;
    const index = Math.floor(Math.random() * ITEMS.length);
    setPrizeNumber(index);

    setMustSpin(true);
  }

  async function handleStop() {
    setMustSpin(false);
    const picked = ITEMS[prizeNumber];
    await setModifier({
      modifier: picked.modifier,
      description: picked.description,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[1rem] border border-white/10 bg-zinc-950/95 p-6 shadow-lg sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm uppercase tracking-wide text-zinc-400">
              Roleta do modificador
            </h3>
            <p className="mt-1 text-sm text-zinc-200">
              Fase {pendingPhase ?? "-"}
            </p>
          </div>
          <div className="text-xs text-zinc-400">Selecione pelo topo</div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            backgroundColors={backgroundColors}
            textColors={["#ffffff"]}
            outerBorderColor="#ffffff22"
            outerBorderWidth={4}
            innerBorderColor="#ffffff10"
            innerBorderWidth={8}
            fontSize={16}
            radiusLineWidth={2}
            radiusLineColor="#ffffff11"
            spinDuration={spinDuration}
            onStopSpinning={handleStop}
          />

          <div className="flex w-full flex-col items-center gap-3 text-center">
            <button
              type="button"
              onClick={handleStartSpin}
              disabled={mustSpin}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-950 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mustSpin ? "Girando..." : "Sortear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
