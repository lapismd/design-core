/**
 * Fail if Tailwind utility class strings appear in native-CSS surfaces.
 *
 * Default roots: Beancount + CV apps + shared forms + converted shadcn sources.
 * Storybook story wrappers still use host Tailwind for layout demos and are
 * excluded (`*.stories.svelte`, `*.variations.stories.svelte`, `examples/`).
 *
 * Usage:
 *   pnpm check:no-tailwind
 *   pnpm check:no-tailwind src/apps/cv
 *   pnpm beancount:tailwind:check
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { findTailwindUtilitiesInSource } from "./lib/no-tailwind-utilities.js";

const DEFAULT_ROOTS = [
  "src/apps/beancount",
  "src/apps/cv",
  "src/shared/forms",
  "src/shared/shadcn",
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

function svelteFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "examples") return [];
      return svelteFiles(path);
    }
    if (!entry.isFile() || !entry.name.endsWith(".svelte")) return [];
    if (isExcludedSvelte(entry.name)) return [];
    return [path];
  });
}

const findings = [];
for (const root of roots) {
  if (!statSync(root).isDirectory()) {
    throw new Error(`Expected directory: ${root}`);
  }
  for (const file of svelteFiles(root)) {
    const source = readFileSync(file, "utf8");
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
