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

function svelteFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return svelteFiles(path);
    return entry.isFile() && entry.name.endsWith(".svelte") ? [path] : [];
  });
}

function lineAt(source: string, offset: number): number {
  return source.slice(0, offset).split("\n").length;
}

function stringLiterals(
  source: string,
): Array<{ value: string; offset: number }> {
  const values: Array<{ value: string; offset: number }> = [];
  const literal = /(["'])(?:\\.|(?!\1)[^\\])*\1/g;
  for (const match of source.matchAll(literal)) {
    const value = match[0]!.slice(1, -1);
    values.push({ value, offset: match.index ?? 0 });
  }
  return values;
}

function classValues(source: string): Array<{ value: string; offset: number }> {
  const values: Array<{ value: string; offset: number }> = [];

  for (const match of source.matchAll(
    /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/g,
  )) {
    values.push({
      value: match[1] ?? match[2] ?? "",
      offset: match.index ?? 0,
    });
  }

  for (const match of source.matchAll(/\bclass\s*=\s*\{([\s\S]{0,1500}?)\}/g)) {
    const expression = match[1] ?? "";
    const expressionOffset = (match.index ?? 0) + match[0]!.indexOf(expression);
    for (const literal of stringLiterals(expression)) {
      values.push({
        value: literal.value,
        offset: expressionOffset + literal.offset,
      });
    }
  }

  for (const match of source.matchAll(
    /\bclass\s*:\s*cn\(([\s\S]{0,1500}?)\)/g,
  )) {
    const expression = match[1] ?? "";
    const expressionOffset = (match.index ?? 0) + match[0]!.indexOf(expression);
    for (const literal of stringLiterals(expression)) {
      values.push({
        value: literal.value,
        offset: expressionOffset + literal.offset,
      });
    }
  }

  for (const match of source.matchAll(/\bclass:([A-Za-z0-9_[\]:/-]+)/g)) {
    values.push({ value: match[1]!, offset: match.index ?? 0 });
  }

  return values;
}

function stripVariants(token: string): string {
  const lastVariant = token.lastIndexOf(":");
  return lastVariant >= 0 ? token.slice(lastVariant + 1) : token;
}

function isTailwindUtility(token: string): boolean {
  const candidate = stripVariants(token.replace(/^!/, ""));
  if (
    /^(?:flex|inline-flex|grid|block|inline-block|inline|hidden|contents|table|table-row|table-cell|group|peer|container|sr-only|not-sr-only)$/.test(
      candidate,
    )
  ) {
    return true;
  }

  return /^(?:flex|grid|col|row|order|grow|shrink|basis|items|justify|content|self|place|gap|space|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|w|h|min-w|max-w|min-h|max-h|size|bg|text|border|rounded|shadow|ring|outline|font|leading|tracking|whitespace|break|truncate|overflow|object|aspect|opacity|cursor|pointer-events|select|transition|duration|delay|ease|animate|absolute|relative|fixed|sticky|static|inset|top|right|bottom|left|z|visible|invisible|columns|divide|underline|decoration|uppercase|lowercase|capitalize|italic|not-italic|list|align|justify)-/.test(
    candidate,
  );
}

const findings: Finding[] = [];
for (const file of svelteFiles(searchRoot)) {
  const source = readFileSync(file, "utf8");
  const relativeFile = relative(process.cwd(), file);

  if (
    /from\s+["']tailwind-variants["']/.test(source) ||
    /\btv\s*\(/.test(source)
  ) {
    findings.push({ file: relativeFile, line: 1, token: "tailwind-variants" });
  }

  for (const classValue of classValues(source)) {
    for (const token of classValue.value.split(/\s+/).filter(Boolean)) {
      if (isTailwindUtility(token)) {
        findings.push({
          file: relativeFile,
          line: lineAt(source, classValue.offset),
          token,
        });
      }
    }
  }
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
