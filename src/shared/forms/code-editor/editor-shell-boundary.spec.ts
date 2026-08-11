import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("Mira-owned editor shell boundary", () => {
  it("keeps CodeEditor and YamlEditor out of the EditorView lifecycle", () => {
    for (const sourcePath of [
      "./CodeEditor.svelte",
      "../yaml-editor/YamlEditor.svelte",
    ]) {
      const source = read(sourcePath);
      expect(source, sourcePath).toContain("<MiraCodeEditor");
      expect(source, sourcePath).not.toMatch(/new\s+EditorView\s*\(/);
      expect(source, sourcePath).not.toMatch(/\bonMount\s*\(/);
      expect(source, sourcePath).not.toMatch(/from\s+["']codemirror["']/);
    }
  });

  it("leaves editor chrome and scroller styling in Mira", () => {
    for (const cssPath of [
      "./CodeEditor.css",
      "../yaml-editor/YamlEditor.css",
    ]) {
      expect(read(cssPath), cssPath).not.toMatch(
        /\.(?:cm-editor|cm-scroller|cm-gutters|cm-content)\b/,
      );
    }
  });

  it("bridges the Design Core accent and one editor surface into Mira", () => {
    for (const cssPath of [
      "./CodeEditor.css",
      "../yaml-editor/YamlEditor.css",
    ]) {
      const css = read(cssPath);
      expect(css, cssPath).toMatch(
        /--mira-code-editor-focus-ring:\s*var\(--ui-form-accent\)/,
      );
      expect(css, cssPath).toMatch(
        /--mira-code-editor-gutter-background:\s*var\(--mira-code-editor-background\)/,
      );
      expect(css, cssPath).toMatch(
        /--mira-code-editor-search-input-hover-border:\s*var\(--ui-form-accent\)/,
      );
      expect(css, cssPath).toMatch(
        /--mira-code-editor-search-button-hover-background:\s*var\(\s*--ui-form-active-line\s*\)/,
      );
      expect(css, cssPath).toMatch(
        /--mira-code-editor-search-focus-ring:\s*var\(--ui-form-accent\)/,
      );
    }
  });

  it("links the Mira package without the aggregate CodeMirror dependency", () => {
    const packageJson = JSON.parse(read("../../../../package.json")) as {
      dependencies: Record<string, string>;
    };

    expect(packageJson.dependencies["@lapismd/mira"]).toBe(
      "link:../mira-mde/packages/mira",
    );
    expect(packageJson.dependencies).not.toHaveProperty("codemirror");
  });
});
