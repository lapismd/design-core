import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { diagnostic, relativePath } from "./lib/spec-model.mjs";

export const name = "public-surfaces";
const MAP_PATH = "spec/public-surfaces.json";

function sourceFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(absolutePath);
      return entry.isFile() &&
        /(?:\.stories\.(?:svelte|[cm]?[jt]sx?)|\.mdx)$/.test(entry.name)
        ? [absolutePath]
        : [];
    })
    .sort();
}

export function discoverCatalogTitles(repoRoot) {
  const titles = [];
  for (const absolutePath of sourceFiles(path.join(repoRoot, "src"))) {
    if (relativePath(repoRoot, absolutePath).startsWith("src/spec/")) continue;
    const source = readFileSync(absolutePath, "utf8");
    const match =
      /defineMeta(?:<[^>]+>)?\s*\(\s*\{[\s\S]*?\btitle\s*:\s*["'`]([^"'`]+)["'`]/.exec(
        source,
      ) ?? /<Meta\s+[^>]*title=["']([^"']+)["']/.exec(source);
    if (match) titles.push(match[1]);
  }
  return [...new Set(titles)].sort();
}

function readMap(context) {
  const absolutePath = path.join(context.model.repoRoot, MAP_PATH);
  if (!existsSync(absolutePath)) return null;
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

function duplicates(values) {
  return [
    ...new Set(
      values.filter((value, index) => values.indexOf(value) !== index),
    ),
  ];
}

function validateMapping(kind, actual, mappings, context) {
  const findings = [];
  const keys = mappings.map((entry) => entry.name);
  for (const duplicate of duplicates(keys))
    findings.push(
      diagnostic({
        code: "SPEC-SURFACE-DUPLICATE",
        rule: "DC-GOV-003",
        file: MAP_PATH,
        subject: duplicate,
        message: `${kind} surface is mapped more than once; retain one requirement mapping`,
      }),
    );
  for (const name of actual) {
    const matches = mappings.filter((entry) => entry.name === name);
    if (matches.length !== 1)
      findings.push(
        diagnostic({
          code: "SPEC-SURFACE-UNMAPPED",
          rule: "DC-GOV-003",
          file: MAP_PATH,
          subject: name,
          message: `current ${kind} surface has ${matches.length} mappings; add exactly one`,
        }),
      );
  }
  for (const mapping of mappings) {
    if (!actual.includes(mapping.name))
      findings.push(
        diagnostic({
          code: "SPEC-SURFACE-STALE",
          rule: "DC-GOV-003",
          file: MAP_PATH,
          subject: mapping.name,
          message: `mapped ${kind} surface no longer exists; remove or update it`,
        }),
      );
    if (!context.model.definitionsById.has(mapping.requirement))
      findings.push(
        diagnostic({
          code: "SPEC-SURFACE-REQUIREMENT",
          rule: "DC-GOV-003",
          file: MAP_PATH,
          subject: mapping.requirement,
          message: `${kind} mapping references an unknown requirement`,
        }),
      );
    const coverage = context.model.coverageById.get(mapping.requirement) ?? [];
    if (coverage.length !== 1)
      findings.push(
        diagnostic({
          code: "SPEC-SURFACE-COVERAGE",
          rule: "DC-GOV-003",
          file: MAP_PATH,
          subject: mapping.requirement,
          message: `mapped requirement appears in ${coverage.length} public coverage rows; expected exactly one`,
        }),
      );
  }
  return findings;
}

export function validate(context) {
  const map = readMap(context);
  if (!map)
    return [
      diagnostic({
        code: "SPEC-SURFACE-MAP-MISSING",
        rule: "DC-GOV-003",
        file: MAP_PATH,
        message: "public export and catalog mapping is missing",
      }),
    ];
  const packageJson = JSON.parse(
    readFileSync(path.join(context.model.repoRoot, "package.json"), "utf8"),
  );
  const exports = Object.keys(packageJson.exports ?? {}).sort();
  const catalog = discoverCatalogTitles(context.model.repoRoot);
  return [
    ...validateMapping("export", exports, map.exports ?? [], context),
    ...validateMapping("catalog", catalog, map.catalog ?? [], context),
  ];
}
