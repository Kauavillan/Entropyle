"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MODIFIER_REGISTRY } from "@/lib/game/modifiers/registry";
import { useGameStore } from "@/stores/use-game-store";

const COLORS_ARRAY = [
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#06b6d4", // teal
];

type RouletteItem = (typeof MODIFIER_REGISTRY)[number] & {
  color: string;
};

const ITEMS: RouletteItem[] = MODIFIER_REGISTRY.map((modifier, index) => ({
  ...modifier,
  color: COLORS_ARRAY[index % COLORS_ARRAY.length],
}));

const Wheel = dynamic(
  () => import("react-custom-roulette").then((module) => module.Wheel),
  { ssr: false },
);

/**
 * Not in seconds, but a coeficient for the duration. It's the
 */
const spinDuration = 0.5;

export function Roulette() {
  const show = useGameStore((s) => s.showRoulette);
  const pendingPhase = useGameStore((s) => s.pendingPhaseIndex);

  const setModifier = useGameStore((s) => s.setModifier);
  const appliedModifiers = useGameStore((s) => s.appliedModifiers);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const appliedKeys = useMemo(
    () => new Set(appliedModifiers.map((m) => m.modifier)),
    [appliedModifiers],
  );

  const data = useMemo(
    () => ITEMS.map((it) => ({ option: it.description })),
    [],
  );

  const backgroundColors = useMemo(
    () =>
      ITEMS.map((it) => (appliedKeys.has(it.modifier) ? "#444444" : it.color)),
    [appliedKeys],
  );

  const allApplied = appliedKeys.size >= ITEMS.length;

  if (!show) return null;

  function handleStartSpin() {
    if (mustSpin) return;
    if (allApplied) return;

    // pick a random index that is not yet applied
    let index = Math.floor(Math.random() * ITEMS.length);
    let attempts = 0;
    while (appliedKeys.has(ITEMS[index].modifier) && attempts < 50) {
      index = Math.floor(Math.random() * ITEMS.length);
      attempts += 1;
    }

    // if somehow couldn't find an unapplied item, abort
    if (appliedKeys.has(ITEMS[index].modifier)) return;

    setPrizeNumber(index);
    setMustSpin(true);
  }

  async function handleStop() {
    setMustSpin(false);
    const picked = ITEMS[prizeNumber];
    if (appliedKeys.has(picked.modifier)) return;

    await setModifier(picked.modifier);
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
              Fase {pendingPhase !== null ? pendingPhase + 1 : "-"}
            </p>
          </div>
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
            fontSize={14}
            radiusLineWidth={2}
            radiusLineColor="#ffffff11"
            spinDuration={spinDuration}
            onStopSpinning={handleStop}
          />

          <div className="flex w-full flex-col items-center gap-3 text-center">
            <button
              type="button"
              onClick={handleStartSpin}
              disabled={mustSpin || allApplied}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-950 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {allApplied
                ? "Todos aplicados"
                : mustSpin
                  ? "Girando..."
                  : "Sortear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
