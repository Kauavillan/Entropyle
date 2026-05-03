import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const sizes = [3, 4, 5, 6, 7];

function getWordFromWordListLine(line: string) {
  return line.trim();
}

function getWordFromIcfLine(line: string) {
  const commaIndex = line.indexOf(",");
  return commaIndex === -1 ? line.trim() : line.slice(0, commaIndex).trim();
}

async function generateSplitFiles(
  sourceDir: string,
  extractor: (line: string) => string,
) {
  const sourcePath = path.join(rootDir, sourceDir, "full.txt");
  const sourceContent = await readFile(sourcePath, "utf8");
  const lines = sourceContent
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  for (const size of sizes) {
    const filteredLines = lines.filter(
      (line) => Array.from(extractor(line)).length === size,
    );
    const outputPath = path.join(rootDir, sourceDir, `${size}Letters.txt`);
    await writeFile(
      outputPath,
      filteredLines.join("\n") + (filteredLines.length > 0 ? "\n" : ""),
      "utf8",
    );
  }
}

async function main() {
  await mkdir(path.join(rootDir, "lib/data/words"), { recursive: true });
  await mkdir(path.join(rootDir, "lib/data/icf"), { recursive: true });

  await generateSplitFiles("lib/data/words", getWordFromWordListLine);
  await generateSplitFiles("lib/data/icf", getWordFromIcfLine);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
