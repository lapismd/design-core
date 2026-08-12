import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

import { diagnostic, relativePath, toPosix } from "./lib/spec-model.mjs";

export const name = "storybook-mirrors";

function summaryEntries(context) {
  const summary = context.model.files.find(
    (file) => file.chapterPath === "SUMMARY.md",
  );
  if (!summary) return [];
  return summary.source.split(/\r?\n/).flatMap((line, index) => {
    const match = /^\s*-\s+\[([^\]]+)]\(([^)#]+\.md)(?:#[^)]+)?\)\s*$/.exec(
      line,
    );
    if (!match) return [];
    return [
      {
        label: match[1].replaceAll(" / ", "/"),
        chapterPath: toPosix(path.normalize(match[2])),
        line: index + 1,
      },
    ];
  });
}

function collectMdx(directory) {
  if (!existsSync(directory)) return [];
  const entries = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) entries.push(...collectMdx(absolutePath));
    else if (entry.isFile() && entry.name.endsWith(".mdx"))
      entries.push(absolutePath);
  }
  return entries.sort();
}

function expectedMirrorPath(repoRoot, chapterPath) {
  return path.join(
    repoRoot,
    "src",
    "spec",
    chapterPath.replace(/\.md$/, ".mdx"),
  );
}

function propertyName(node) {
  if (!node?.name) return null;
  if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
    return node.name.text;
  }
  return null;
}

function objectProperty(object, name) {
  return object.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) && propertyName(property) === name,
  );
}

function flattenOrder(array, prefix = []) {
  const titles = [];
  for (let index = 0; index < array.elements.length; index += 1) {
    const element = array.elements[index];
    if (!ts.isStringLiteral(element)) continue;
    const label = element.text;
    const children = array.elements[index + 1];
    if (children && ts.isArrayLiteralExpression(children)) {
      titles.push(...flattenOrder(children, [...prefix, label]));
      index += 1;
    } else if (label !== "*") {
      titles.push([...prefix, label].join("/"));
    }
  }
  return titles;
}

function parseInlineStoryOrder(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  let result = null;
  function visit(node) {
    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node) === "storySort" &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      const order = objectProperty(node.initializer, "order");
      if (order && ts.isArrayLiteralExpression(order.initializer)) {
        result = flattenOrder(order.initializer);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return result;
}

export function validate(context) {
  const findings = [];
  const entries = summaryEntries(context);
  const expected = new Map(
    entries.map((entry) => [
      path.resolve(
        expectedMirrorPath(context.model.repoRoot, entry.chapterPath),
      ),
      entry,
    ]),
  );
  const root = path.join(context.model.repoRoot, "src", "spec");
  const actual = collectMdx(root);

  for (const [absolutePath, entry] of expected) {
    const relative = relativePath(context.model.repoRoot, absolutePath);
    if (!existsSync(absolutePath)) {
      findings.push(
        diagnostic({
          code: "SPEC-MIRROR-MISSING",
          rule: "DC-CAT-005",
          file: relative,
          subject: entry.chapterPath,
          message:
            "add the metadata-only Storybook mirror for this SUMMARY chapter",
        }),
      );
      continue;
    }
    const source = readFileSync(absolutePath, "utf8");
    const rawImport = /import\s+content\s+from\s+["']([^"']+)\?raw["'];?/.exec(
      source,
    );
    const title = /<Meta\s+title=["']([^"']+)["']\s*\/>/.exec(source);
    const expectedTitle = `Specification/${entry.label}`;
    if (!rawImport)
      findings.push(
        diagnostic({
          code: "SPEC-MIRROR-IMPORT",
          rule: "DC-CAT-005",
          file: relative,
          message: "mirror must import its canonical Markdown as raw content",
        }),
      );
    else {
      const target = path.resolve(path.dirname(absolutePath), rawImport[1]);
      const expectedTarget = path.resolve(
        context.model.sourceDirectory,
        entry.chapterPath,
      );
      if (target !== expectedTarget)
        findings.push(
          diagnostic({
            code: "SPEC-MIRROR-TARGET",
            rule: "DC-CAT-005",
            file: relative,
            subject: entry.chapterPath,
            message:
              "raw import does not resolve to the matching canonical chapter",
          }),
        );
    }
    if (title?.[1] !== expectedTitle)
      findings.push(
        diagnostic({
          code: "SPEC-MIRROR-TITLE",
          rule: "DC-CAT-005",
          file: relative,
          subject: expectedTitle,
          message: "Storybook title must match SUMMARY hierarchy and label",
        }),
      );
    const body = source
      .replace(
        /^import\s+\{\s*Markdown,\s*Meta\s*\}\s+from\s+["']@storybook\/addon-docs\/blocks["'];?\s*$/m,
        "",
      )
      .replace(/^import\s+content\s+from\s+["'][^"']+\?raw["'];?\s*$/m, "")
      .trim();
    const expectedBody = `<Meta title="${expectedTitle}" />\n\n<Markdown>{content}</Markdown>`;
    if (body !== expectedBody)
      findings.push(
        diagnostic({
          code: "SPEC-MIRROR-CONTENT",
          rule: "DC-CAT-005",
          file: relative,
          message:
            "mirror may contain only metadata, the raw canonical import, and the Markdown renderer",
        }),
      );
  }

  for (const absolutePath of actual) {
    if (expected.has(path.resolve(absolutePath))) continue;
    findings.push(
      diagnostic({
        code: "SPEC-MIRROR-STALE",
        rule: "DC-CAT-005",
        file: relativePath(context.model.repoRoot, absolutePath),
        message: "Storybook specification mirror has no SUMMARY chapter",
      }),
    );
  }

  const previewPath = path.join(
    context.model.repoRoot,
    ".storybook",
    "preview.ts",
  );
  const preview = existsSync(previewPath)
    ? readFileSync(previewPath, "utf8")
    : "";
  const order = parseInlineStoryOrder(preview, previewPath);
  const expectedOrder = entries.map((entry) => `Specification/${entry.label}`);
  if (!order)
    findings.push(
      diagnostic({
        code: "SPEC-MIRROR-SORT",
        rule: "DC-CAT-005",
        file: ".storybook/preview.ts",
        message: "configure an inline specification-first storySort order",
      }),
    );
  else {
    const specificationOrder = order.filter((title) =>
      title.startsWith("Specification/"),
    );
    if (
      order[0] !== expectedOrder[0] ||
      JSON.stringify(specificationOrder) !== JSON.stringify(expectedOrder)
    )
      findings.push(
        diagnostic({
          code: "SPEC-MIRROR-ORDER",
          rule: "DC-CAT-005",
          file: ".storybook/preview.ts",
          message:
            "inline Storybook specification order must be first and match SUMMARY.md",
        }),
      );
  }
  return findings;
}
