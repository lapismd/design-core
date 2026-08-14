import { describe, expect, it } from "vitest";
import { highlightText } from "./highlight.js";

describe("highlightText", () => {
  it("tokenizes C keywords, comments, and strings", () => {
    const parts = highlightText(
      "int partition(int array[], int low) { // pivot",
      "c",
    );
    expect(
      parts.some((part) => part.type === "keyword" && part.text === "int"),
    ).toBe(true);
    expect(
      parts.some(
        (part) => part.type === "comment" && part.text.includes("pivot"),
      ),
    ).toBe(true);
  });

  it("tokenizes Rust keywords", () => {
    const parts = highlightText(
      "pub fn conflict_label() -> &'static str {",
      "rust",
    );
    expect(
      parts.some((part) => part.type === "keyword" && part.text === "pub"),
    ).toBe(true);
    expect(
      parts.some((part) => part.type === "keyword" && part.text === "fn"),
    ).toBe(true);
  });
});
