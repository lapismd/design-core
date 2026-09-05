import { describe, expect, it } from "vitest";
import { shortenCopyableValue } from "./copyable-value.js";

describe("shortenCopyableValue", () => {
  it("keeps short values and abbreviates long values deterministically", () => {
    expect(shortenCopyableValue("revision-a")).toBe("revision-a");
    expect(shortenCopyableValue("abcdefghijklmnopqrstuvwxyz")).toBe(
      "abcdefgh…wxyz",
    );
  });

  it("bounds invalid segment sizes", () => {
    expect(shortenCopyableValue("abcdef", 0, -1)).toBe("a…");
  });
});
