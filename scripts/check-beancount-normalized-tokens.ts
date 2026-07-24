import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const appRoot = resolve("src/apps/beancount");
const requestedScope = process.argv[2];
const searchRoot = requestedScope ? resolve(appRoot, requestedScope) : appRoot;

if (!searchRoot.startsWith(appRoot) || !statSync(searchRoot).isDirectory()) {
  throw new Error(
    `Expected an optional directory below src/apps/beancount; received ${requestedScope ?? ""}`,
  );
}

type Finding = {
  file: string;
  line: number;
  token: string;
};

const sourceExtensions = new Set([".css", ".svelte", ".ts"]);
const allowedTokens =
  /^(?:--ui-beancount-|--bc-|--font-|--text-|--leading-|--radius-|--chart-)/;
const findings: Finding[] = [];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (path === resolve(appRoot, "beancount.tokens.css")) return [];
    const extension = `.${entry.name.split(".").at(-1)}`;
    return entry.isFile() && sourceExtensions.has(extension) ? [path] : [];
  });
}

function lineAt(source: string, offset: number): number {
  return source.slice(0, offset).split("\n").length;
}

for (const file of sourceFiles(searchRoot)) {
  const source = readFileSync(file, "utf8");
  const relativeFile = relative(process.cwd(), file);

  for (const match of source.matchAll(/var\(\s*(--[\w-]+)/g)) {
    const token = match[1]!;
    if (allowedTokens.test(token)) continue;
    findings.push({
      file: relativeFile,
      line: lineAt(source, match.index ?? 0),
      token,
    });
  }
}

if (findings.length) {
  console.error(
    "Raw shared-theme variables remain in src/apps/beancount; use a --ui-beancount-* role or a documented exception:",
  );
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.token}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `All shared theme variables are normalized in ${relative(appRoot, searchRoot) || "the Beancount app"}.`,
  );
}
