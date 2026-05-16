import { promises as fs } from "fs";
import path from "path";
import { normalizeWord } from "@/lib/game/helpers";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const length = Math.max(1, parseInt(params.get("length") || "5", 10));
    const icf = params.get("icf") === "true" || params.get("icf") === "1";
    const pool = parseWordPool(params.get("pool"));
    const word = params.get("word");
    const reverse =
      params.get("reverse") === "true" ||
      params.get("reverse") === "1" ||
      params.get("osrevni") === "true";

    if (word) {
      const exists = await wordExists(word, length, icf, pool, reverse);

      return new Response(JSON.stringify({ exists }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const count = Math.max(1, parseInt(params.get("count") || "1", 10));

    const words = await getRandomWords(count, length, icf, pool, reverse);

    return new Response(JSON.stringify({ words }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/words error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

type WordPool = "top100" | "top300" | null;

async function wordExists(
  word: string,
  length: number,
  icf: boolean,
  pool: WordPool,
  reverse = false,
) {
  const normalizedWord = normalizeWord(word);
  const dictionary = await readWordList(length, icf, pool);

  return dictionary.some((entry) => {
    const candidate = reverse
      ? normalizeWord(entry.split("").reverse().join(""))
      : normalizeWord(entry);
    return candidate === normalizedWord;
  });
}

async function getRandomWords(
  count: number,
  length: number,
  icf: boolean,
  pool: WordPool,
  reverse = false,
) {
  const lines = await readWordList(length, icf, pool);

  // Prefer words of exact requested length
  let candidates = lines.filter((w) => w.length === length);
  if (candidates.length === 0) {
    // If none match exactly, fall back to any available words
    candidates = lines;
  }

  // Shuffle (Fisher-Yates)
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  if (count <= candidates.length) {
    const slice = candidates.slice(0, count);
    return reverse ? slice.map((w) => w.split("").reverse().join("")) : slice;
  }

  // If more requested than available, fill remaining with random picks (with replacement)
  const result = candidates.slice();
  while (result.length < count && candidates.length > 0) {
    result.push(candidates[Math.floor(Math.random() * candidates.length)]);
  }
  return reverse ? result.map((w) => w.split("").reverse().join("")) : result;
}

async function readWordList(length: number, icf: boolean, pool: WordPool) {
  const baseDir = path.join(
    process.cwd(),
    "lib",
    "data",
    icf ? "icf" : "words",
  );
  const requestedFile = `${length}Letters.txt`;
  let filePath = path.join(baseDir, requestedFile);

  // Fallback to full.txt if the specific length file doesn't exist
  try {
    await fs.access(filePath);
  } catch {
    filePath = path.join(baseDir, "full.txt");
  }

  const content = await fs.readFile(filePath, "utf-8");
  const lines = content
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (pool === "top100") {
    return lines.slice(0, 100);
  }

  if (pool === "top300") {
    return lines.slice(Math.max(0, lines.length - 300));
  }

  return lines;
}

export default GET;

function parseWordPool(value: string | null): WordPool {
  if (value === "top100" || value === "top300") {
    return value;
  }

  return null;
}
