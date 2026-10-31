import { describe, expect, it } from "vitest";
import {
  EditorViewRegistry,
  compareEditorAssociationPatternSpecificity,
  matchesEditorAssociationGlob,
  validateEditorAssociationGlob,
} from "./editor-view-registry.js";

describe("EditorViewRegistry", () => {
  it("normalizes registrations and disposes the exact contribution", () => {
    const registry = new EditorViewRegistry();
    const changes: string[] = [];
    registry.on("changed", ({ id, action }) => changes.push(`${action}:${id}`));
    const dispose = registry.register({
      id: " markdown ",
      label: " Markdown ",
      filenamePatterns: ["*.md", "*.md", "  "],
    });

    expect(registry.get("markdown")).toMatchObject({
      id: "markdown",
      viewType: "markdown",
      label: "Markdown",
      filenamePatterns: ["*.md"],
      priority: "option",
    });
    dispose();
    expect(registry.get("markdown")).toBeUndefined();
    expect(changes).toEqual(["registered:markdown", "unregistered:markdown"]);
  });

  it("uses Lapis-compatible glob matching and specificity", () => {
    expect(matchesEditorAssociationGlob("*.md", "Notes/Daily.md")).toBe(true);
    expect(
      matchesEditorAssociationGlob("Notes/**/*.md", "Notes/Journal/Daily.md"),
    ).toBe(true);
    expect(
      compareEditorAssociationPatternSpecificity("*.md", "*.notebook.md"),
    ).toBeLessThan(0);
    expect(validateEditorAssociationGlob("")).toMatchObject({
      valid: false,
    });
  });

  it("keeps basename, path, brace and literal matching with bounded validation", () => {
    for (const [pattern, path, expected] of [
      ["*.notebook.md", "Notes/Example.notebook.md", true],
      ["*.notebook.md", "Notes/Example.md", false],
      ["Notes/**/*.{md,csv}", "Notes/.hidden/data.csv", true],
      ["Notes/**/*.md", "Other/Example.md", false],
      ["*.md", "Notes\\\\Example.md", true],
      ["!draft.md", "!draft.md", true],
      ["!draft.md", "published.md", false],
    ] as const) {
      expect(matchesEditorAssociationGlob(pattern, path)).toBe(expected);
    }
    expect(validateEditorAssociationGlob("Notes/**/*.{md,csv}")).toEqual({
      valid: true,
    });
    expect(validateEditorAssociationGlob("a".repeat(65_537))).toEqual({
      valid: false,
      message: "Glob pattern is invalid.",
    });
  });
});
