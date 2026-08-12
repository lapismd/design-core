import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

import { diagnostic, relativePath } from "./lib/spec-model.mjs";

export const name = "storybook-catalog";

const STORY_FILE_PATTERN = /\.stories\.(?:svelte|[cm]?[jt]sx?)$/;
const EXAMPLE_SOURCE_FILE_PATTERN = /\.example-sources\.[cm]?[jt]sx?$/;
const STORY_ONLY_NAME_PATTERN =
  /(?:Demo|Harness|Fixture|Story(?:View|Surface|Frame|Control)?)$/;
const STORY_ONLY_MODULE_PATTERN =
  /(?:demo|harness|fixture|\.story)(?:\.[^/]+)?$/i;
const FORBIDDEN_SOURCE_PATTERN =
  /\b(?:[A-Z][A-Za-z0-9]*(?:Demo|Harness|Fixture|Story(?:View|Surface|Frame|Control)?))\b|\bargs\s*\./;

function publiclyImported(code, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const namedImport = new RegExp(
    `import\\s*\\{[^}]*\\b${escapedName}\\b[^}]*\\}\\s*from\\s*["']@lapismd/design-core(?:/[^"']*)?["']`,
    "s",
  );
  const defaultImport = new RegExp(
    `import\\s+${escapedName}\\s+from\\s*["']@lapismd/design-core(?:/[^"']*)?["']`,
  );
  return namedImport.test(code) || defaultImport.test(code);
}

function exposesStoryBoundary(code) {
  if (/\bargs\s*\./.test(code)) return true;
  const names = code.match(
    /\b[A-Z][A-Za-z0-9]*(?:Demo|Harness|Fixture|Story(?:View|Surface|Frame|Control)?)\b/g,
  );
  return names?.some((name) => !publiclyImported(code, name)) ?? false;
}

function files(directory, pattern) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return files(absolutePath, pattern);
      return entry.isFile() && pattern.test(entry.name) ? [absolutePath] : [];
    })
    .sort((left, right) => left.localeCompare(right));
}

function lineOf(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function objectEnd(source, start) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }
  return source.length;
}

function propertyObjects(source, propertyName, offset = 0) {
  const objects = [];
  const pattern = new RegExp(`\\b${propertyName}\\s*:\\s*\\{`, "g");
  for (const match of source.matchAll(pattern)) {
    const brace = match.index + match[0].lastIndexOf("{");
    const end = objectEnd(source, brace);
    objects.push({
      start: offset + brace,
      source: source.slice(brace, end),
    });
  }
  return objects;
}

function docsSourceObjects(source) {
  return propertyObjects(source, "docs").flatMap((docs) =>
    propertyObjects(docs.source, "source", docs.start),
  );
}

function localDefaultImports(source) {
  const imports = [];
  const pattern =
    /\bimport\s+(?!type\b)([A-Za-z_$][\w$]*)[^;\n]*?\s+from\s+["'](\.[^"']+)["']/g;
  for (const match of source.matchAll(pattern)) {
    imports.push({
      name: match[1],
      moduleName: match[2],
      index: match.index,
    });
  }
  return imports;
}

function isStoryOnlyBoundary(imported) {
  const moduleBase = path.basename(imported.moduleName);
  return (
    STORY_ONLY_NAME_PATTERN.test(imported.name) ||
    STORY_ONLY_MODULE_PATTERN.test(moduleBase)
  );
}

function sourceFields(sourceObject) {
  const source = sourceObject.source;
  return {
    code: /\bcode\s*:/.test(source),
    language: /\blanguage\s*:/.test(source),
    type: /\btype\s*:\s*["']code["']/.test(source),
  };
}

function validateSourceObjects(objects, source, file, findings) {
  for (const sourceObject of objects) {
    const fields = sourceFields(sourceObject);
    if (!fields.code || !fields.language || !fields.type) {
      findings.push(
        diagnostic({
          code: "SPEC-STORY-SOURCE-FIELDS",
          rule: "DC-CAT-007",
          file,
          line: lineOf(source, sourceObject.start),
          message: 'docs.source must define code, language, and type: "code"',
        }),
      );
    }
  }
}

function moduleCandidates(importer, moduleName) {
  const base = path.resolve(path.dirname(importer), moduleName);
  return [
    base,
    `${base}.svelte`,
    `${base}.ts`,
    `${base}.js`,
    `${base}.mjs`,
    path.join(base, "index.ts"),
    path.join(base, "index.js"),
    path.join(base, "index.mjs"),
  ];
}

function resolveLocalModule(importer, moduleName) {
  if (!moduleName.startsWith(".")) return null;
  return moduleCandidates(importer, moduleName).find(existsSync) ?? null;
}

function validateExampleSources(sourceRoot, repoRoot) {
  const findings = [];
  for (const absolutePath of files(sourceRoot, EXAMPLE_SOURCE_FILE_PATTERN)) {
    const source = readFileSync(absolutePath, "utf8");
    const sourceFile = ts.createSourceFile(
      absolutePath,
      source,
      ts.ScriptTarget.Latest,
      true,
    );
    const relative = relativePath(repoRoot, absolutePath);

    function report(node, code) {
      if (!FORBIDDEN_SOURCE_PATTERN.test(code) || !exposesStoryBoundary(code)) {
        return;
      }
      findings.push(
        diagnostic({
          code: "SPEC-STORY-SOURCE-BOUNDARY",
          rule: "DC-CAT-006",
          file: relative,
          line:
            sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
              .line + 1,
          message:
            "Show Code must not expose a story-only demo, harness, fixture, story surface, or args expression",
        }),
      );
    }

    function visit(node) {
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text.endsWith("?raw")
      ) {
        const rawModule = node.moduleSpecifier.text.slice(0, -4);
        const target = resolveLocalModule(absolutePath, rawModule);
        if (target) report(node.moduleSpecifier, readFileSync(target, "utf8"));
        return;
      }
      if (
        (ts.isStringLiteral(node) ||
          ts.isNoSubstitutionTemplateLiteral(node) ||
          ts.isTemplateHead(node) ||
          ts.isTemplateMiddle(node) ||
          ts.isTemplateTail(node)) &&
        !ts.isImportDeclaration(node.parent)
      ) {
        report(node, node.text);
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }
  return findings;
}

export function validate(context) {
  const findings = [];
  const sourceRoot = path.join(context.model.repoRoot, "src");

  findings.push(...validateExampleSources(sourceRoot, context.model.repoRoot));

  for (const absolutePath of files(sourceRoot, STORY_FILE_PATTERN)) {
    const source = readFileSync(absolutePath, "utf8");
    const relative = relativePath(context.model.repoRoot, absolutePath);
    const sourceObjects = docsSourceObjects(source);

    if (source.includes('"!autodocs"') || source.includes("'!autodocs'")) {
      continue;
    }
    const storyOnly = localDefaultImports(source).filter(isStoryOnlyBoundary);
    if (!storyOnly.length) continue;
    validateSourceObjects(sourceObjects, source, relative, findings);
    if (sourceObjects.length) continue;

    findings.push(
      diagnostic({
        code: "SPEC-STORY-SOURCE-MISSING",
        rule: "DC-GOV-009",
        file: relative,
        line: lineOf(source, storyOnly[0].index),
        message:
          "Autodocs story uses a local story-only render boundary without explicit consumer source",
      }),
    );
  }
  return findings;
}
