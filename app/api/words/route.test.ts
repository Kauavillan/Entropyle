import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import { promises as fs } from "fs";

import { GET } from "./route";

describe("GET /api/words", () => {
  beforeEach(() => {
    jest.spyOn(fs, "access").mockResolvedValue(undefined as never);
    jest.spyOn(fs, "readFile").mockResolvedValue("abc\nxyz\n" as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("validates reversed words when OSREVNI is enabled", async () => {
    jest.spyOn(fs, "readFile").mockResolvedValueOnce("abc\nxyz\n" as never);

    const response = await GET(
      new Request("http://localhost/api/words?length=3&word=cba&osrevni=true"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ exists: true });
    expect(fs.access).toHaveBeenCalledWith(
      expect.stringContaining("/lib/data/words/3Letters.txt"),
    );
  });

  it("reads from the icf dictionary when icf is enabled", async () => {
    jest.spyOn(fs, "readFile").mockResolvedValueOnce("abc\n" as never);

    const response = await GET(
      new Request("http://localhost/api/words?length=3&word=abc&icf=1"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ exists: true });
    expect(fs.access).toHaveBeenCalledWith(
      expect.stringContaining("/lib/data/icf/3Letters.txt"),
    );
  });

  it("applies the top100 pool when validating a word", async () => {
    const words = Array.from(
      { length: 101 },
      (_, index) => `w${String(index + 1).padStart(4, "0")}`,
    );
    jest.spyOn(fs, "readFile").mockResolvedValueOnce(words.join("\n") as never);

    const response = await GET(
      new Request("http://localhost/api/words?length=5&word=w0101&pool=top100"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ exists: false });
  });

  it("applies the top300 pool when validating a word", async () => {
    const words = Array.from(
      { length: 400 },
      (_, index) => `w${String(index + 1).padStart(4, "0")}`,
    );
    jest.spyOn(fs, "readFile").mockResolvedValueOnce(words.join("\n") as never);

    const response = await GET(
      new Request("http://localhost/api/words?length=5&word=w0001&pool=top300"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ exists: false });
  });

  it("normalizes icf dictionary entries before sampling top100 words", async () => {
    jest
      .spyOn(fs, "readFile")
      .mockResolvedValueOnce("muito,6.14450397\nsobre,6.29898955\n" as never);
    jest.spyOn(Math, "random").mockReturnValue(0);

    const response = await GET(
      new Request(
        "http://localhost/api/words?length=5&count=1&icf=1&pool=top100",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ words: ["sobre"] });
  });

  it("normalizes icf dictionary entries before validating top300 words", async () => {
    jest
      .spyOn(fs, "readFile")
      .mockResolvedValueOnce("muito,6.14450397\nsobre,6.29898955\n" as never);

    const response = await GET(
      new Request(
        "http://localhost/api/words?length=5&word=muito&icf=1&pool=top300",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ exists: true });
  });

  it("returns generated words with the requested count", async () => {
    jest
      .spyOn(fs, "readFile")
      .mockResolvedValueOnce("abca\nbcdb\ncdce\n" as never);
    jest.spyOn(Math, "random").mockReturnValue(0);

    const response = await GET(
      new Request("http://localhost/api/words?length=4&count=2"),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as { words: string[] };
    expect(data.words).toHaveLength(2);
    expect(data.words.every((word) => word.length === 4)).toBe(true);
  });
});
