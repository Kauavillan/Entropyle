import { GameGrid } from "./GameGrid";
import { useGameStore } from "@/stores/use-game-store";

export default function GridsContainer() {
  const phaseGrids = useGameStore((state) => state.phaseGrids);
  const boardRevision = useGameStore((state) => state.boardRevision);
  const gridsAmount = phaseGrids.length;

  return (
    <main
      key={boardRevision}
      className="w-full flex flex-wrap items-center justify-center gap-8"
    >
      {Array.from({ length: gridsAmount }).map((_, index) => (
        <GameGrid key={index} gridIndex={index} />
      ))}
    </main>
  );
}
