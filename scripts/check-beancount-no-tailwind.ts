/**
 * Beancount-scoped alias for the shared no-Tailwind guard.
 * Prefer `pnpm check:no-tailwind` for apps + shadcn.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { findTailwindUtilitiesInSource } from "./lib/no-tailwind-utilities.js";

const appRoot = resolve("src/apps/beancount");
const requestedScope = process.argv[2];
const searchRoot = requestedScope ? resolve(appRoot, requestedScope) : appRoot;

if (!searchRoot.startsWith(appRoot) || !statSync(searchRoot).isDirectory()) {
  throw new Error(
    `Expected an optional directory below src/apps/beancount; received ${requestedScope ?? ""}`,
  );
}

function svelteFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return svelteFiles(path);
    return entry.isFile() && entry.name.endsWith(".svelte") ? [path] : [];
  });
}

const findings = [];
for (const file of svelteFiles(searchRoot)) {
  const source = readFileSync(file, "utf8");
  findings.push(
    ...findTailwindUtilitiesInSource(source, relative(process.cwd(), file)),
  );
}

if (findings.length) {
  console.error("Tailwind utilities remain in src/apps/beancount:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.token}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `No Tailwind utilities found in ${relative(appRoot, searchRoot) || "the Beancount app"}.`,
  );
}
