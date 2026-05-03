import { GameGrid } from "./GameGrid";

export default function GridsContainer() {
  // terá a lógica melhorada
  const gridsAmount = 4;

  return (
    <main className="w-full flex flex-row items-center justify-center gap-8">
      {Array.from({ length: gridsAmount }).map((_, index) => (
        <GameGrid key={index} />
      ))}
    </main>
  );
}
