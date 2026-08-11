import { globSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const repoRoot = new URL("../../", import.meta.url);
const storybookConfig = readFileSync(
  new URL(".storybook/main.ts", repoRoot),
  "utf8",
);
const authoredMdxFiles = globSync("src/**/*.mdx", {
  cwd: repoRoot,
}).map((file) => new URL(file, repoRoot));

describe("Storybook MDX rendering", () => {
  it("enables GitHub Flavored Markdown for authored pipe tables", () => {
    const mdxWithPipeTables = authoredMdxFiles.filter((file) =>
      /^\|/m.test(readFileSync(file, "utf8")),
    );

    expect(mdxWithPipeTables.length).toBeGreaterThan(0);
    expect(storybookConfig).toContain('import remarkGfm from "remark-gfm"');
    expect(storybookConfig).toContain("remarkPlugins: [remarkGfm]");
  });

  it("uses Storybook-supported aliases for fenced code highlighting", () => {
    const unsupportedSvelteFences = authoredMdxFiles.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return /^```svelte$/m.test(source) ? [file] : [];
    });
    const unprotectedHtmlFences = authoredMdxFiles.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return [...source.matchAll(/^```html$/gm)].some(
        (match) =>
          !source.slice(0, match.index).endsWith("{/* prettier-ignore */}\n"),
      )
        ? [file]
        : [];
    });

    expect(unsupportedSvelteFences).toEqual([]);
    expect(unprotectedHtmlFences).toEqual([]);
  });
});
