import { describe, expect, it } from "vitest";
import { fileIconNameForPath } from "./file-icon.js";

describe("fileIconNameForPath", () => {
  it("maps common source extensions to lucide icon names", () => {
    expect(fileIconNameForPath("src/index.ts")).toBe("file-code-2");
    expect(fileIconNameForPath("package.json")).toBe("file-json");
    expect(fileIconNameForPath("README.md")).toBe("file-text");
    expect(fileIconNameForPath("styles.css")).toBe("file-code");
    expect(fileIconNameForPath("logo.svg")).toBe("image");
    expect(fileIconNameForPath("LICENSE")).toBe("file");
  });
});
