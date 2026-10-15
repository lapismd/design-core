/**
 * Fail if Tailwind utility classes appear in markup or CSS selectors.
 *
 * Default roots: shared UI layers (forms, filter, AI, Diff, shell, shadcn, workspace).
 * Storybook story wrappers still use host Tailwind for layout demos and are
 * excluded (`*.stories.svelte`, `*.variations.stories.svelte`, `examples/`).
 *
 * Usage:
 *   pnpm check:no-tailwind
 *   pnpm check:no-tailwind src/shared/forms
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { utilitySelectors } from "./lib/style-utilities.mjs";
import { findTailwindUtilitiesInSource } from "./lib/no-tailwind-utilities.js";

const DEFAULT_ROOTS = [
  "src/shared/ai",
  "src/shared/chat",
  "src/shared/diff",
  "src/shared/filter",
  "src/shared/forms",
  "src/shared/shadcn",
  "src/shared/shell",
  "src/shared/workspace",
] as const;

const requested = process.argv.slice(2);
const roots = (requested.length ? requested : [...DEFAULT_ROOTS]).map((r) =>
  resolve(r),
);

function isExcludedSvelte(fileName: string): boolean {
  return (
    fileName.endsWith(".stories.svelte") ||
    fileName.endsWith(".variations.stories.svelte")
  );
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "examples") return [];
      return sourceFiles(path);
    }
    if (!entry.isFile() || !/[.](?:svelte|css)$/.test(entry.name)) return [];
    if (isExcludedSvelte(entry.name)) return [];
    return [path];
  });
}

const findings = [];
for (const root of roots) {
  if (!statSync(root).isDirectory()) {
    throw new Error(`Expected directory: ${root}`);
  }
  for (const file of sourceFiles(root)) {
    const source = readFileSync(file, "utf8");
    const relativeFile = relative(process.cwd(), file);
    const styles = file.endsWith(".css")
      ? [{ css: source, offset: 0 }]
      : [...source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)].map(
          (match) => ({
            css: match[1]!,
            offset: match.index! + match[0].indexOf(match[1]!),
          }),
        );
    for (const { css, offset } of styles) {
      findings.push(
        ...utilitySelectors(css, relativeFile).map((finding) => ({
          ...finding,
          line: finding.line + source.slice(0, offset).split("\n").length - 1,
        })),
      );
    }
    findings.push(
      ...findTailwindUtilitiesInSource(source, relative(process.cwd(), file)),
    );
  }
}

if (findings.length) {
  console.error("Tailwind utilities remain in native-CSS surfaces:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.token}`);
  }
  console.error(
    `\n${findings.length} finding(s). Prefer --ui-* tokens / scoped CSS.`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `No Tailwind utilities found in ${roots
      .map((r) => relative(process.cwd(), r) || ".")
      .join(", ")} (stories/examples excluded).`,
  );
}
