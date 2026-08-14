import { describe, expect, it } from "vitest";
import { resolveDiffLanguage } from "./language.js";

describe("resolveDiffLanguage", () => {
  it("prefers an explicit language over the path extension", () => {
    expect(resolveDiffLanguage("src/index.ts", "python")).toBe("python");
  });

  it("maps common extensions to CodeBlock language ids", () => {
    expect(resolveDiffLanguage("src/index.ts")).toBe("typescript");
    expect(resolveDiffLanguage("notes.md")).toBe("markdown");
    expect(resolveDiffLanguage("Dockerfile")).toBe("bash");
    expect(resolveDiffLanguage("LICENSE")).toBeNull();
  });
});
