import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  FamilyExtraction,
  PartExtraction,
  StyleExtraction,
} from "../analysis/style-extractor.js";
import { publicTokenName } from "./token-names.js";

function constName(component: string, axis: string): string {
  const base = component.replace(/-/g, "_").toUpperCase();
  return `${base}_${axis.toUpperCase()}S`;
}

function typeName(component: string, axis: string): string {
  const c = component
    .split("-")
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join("");
  const a = axis[0]!.toUpperCase() + axis.slice(1);
  return `${c}${a}`;
}

function variantsStubName(component: string): string {
  const c = component
    .split("-")
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join("");
  return `${c[0]!.toLowerCase()}${c.slice(1)}Variants`;
}

function stripStringArgsFromCn(inner: string): string {
  // Remove string/template literal arguments; keep identifiers/expressions.
  const kept: string[] = [];
  let i = 0;
  while (i < inner.length) {
    while (i < inner.length && /[\s,]/.test(inner[i]!)) i++;
    if (i >= inner.length) break;
    // line comments
    if (inner.startsWith("//", i)) {
      const nl = inner.indexOf("\n", i);
      i = nl < 0 ? inner.length : nl + 1;
      continue;
    }
    if (inner.startsWith("/*", i)) {
      const end = inner.indexOf("*/", i + 2);
      i = end < 0 ? inner.length : end + 2;
      continue;
    }
    const ch = inner[i]!;
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      i++;
      while (i < inner.length) {
        if (inner[i] === "\\") {
          i += 2;
          continue;
        }
        if (inner[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      // skip trailing comma
      while (i < inner.length && /[\s,]/.test(inner[i]!)) i++;
      continue;
    }
    // non-string arg: read until top-level comma
    let depth = 0;
    let inStr: '"' | "'" | "`" | null = null;
    const start = i;
    for (; i < inner.length; i++) {
      const c = inner[i]!;
      if (inStr) {
        if (c === "\\" ) {
          i++;
          continue;
        }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        inStr = c;
        continue;
      }
      if (c === "(" || c === "{" || c === "[") depth++;
      if (c === ")" || c === "}" || c === "]") depth = Math.max(0, depth - 1);
      if (c === "," && depth === 0) break;
    }
    const arg = inner.slice(start, i).trim();
    if (arg) kept.push(arg);
    if (inner[i] === ",") i++;
  }
  return kept.join(", ");
}

function findCnClassExpressions(
  source: string,
): Array<{ start: number; end: number; inner: string }> {
  const results: Array<{ start: number; end: number; inner: string }> = [];
  const needle = "class={cn(";
  let from = 0;
  while (from < source.length) {
    const start = source.indexOf(needle, from);
    if (start < 0) break;
    const open = start + "class={".length; // points at cn(
    const paren = open + 2; // '(' of cn(
    let depth = 0;
    let inString: '"' | "'" | "`" | null = null;
    let escaped = false;
    let end = -1;
    for (let i = paren; i < source.length; i++) {
      const ch = source[i]!;
      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === inString) inString = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inString = ch;
        continue;
      }
      if (ch === "(") depth++;
      if (ch === ")") {
        depth--;
        if (depth === 0) {
          // expect closing }
          if (source[i + 1] === "}") {
            end = i + 2;
            results.push({
              start,
              end,
              inner: source.slice(paren + 1, i),
            });
          }
          break;
        }
      }
    }
    from = end > 0 ? end : start + needle.length;
  }
  return results;
}

function rewriteCnClassAttributes(source: string): string {
  const matches = findCnClassExpressions(source);
  if (!matches.length) return source;
  let out = source;
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i]!;
    const kept = stripStringArgsFromCn(m.inner);
    let replacement: string;
    if (!kept) {
      replacement = "class={undefined}";
    } else {
      const withoutVariants = (() => {
        // split on top-level commas
        const args: string[] = [];
        let depth = 0;
        let inString: '"' | "'" | "`" | null = null;
        let escaped = false;
        let start = 0;
        for (let j = 0; j <= kept.length; j++) {
          const ch = kept[j] ?? ",";
          if (j < kept.length) {
            if (inString) {
              if (escaped) {
                escaped = false;
                continue;
              }
              if (ch === "\\") {
                escaped = true;
                continue;
              }
              if (ch === inString) inString = null;
              continue;
            }
            if (ch === '"' || ch === "'" || ch === "`") {
              inString = ch;
              continue;
            }
            if (ch === "(" || ch === "{" || ch === "[") depth++;
            if (ch === ")" || ch === "}" || ch === "]")
              depth = Math.max(0, depth - 1);
            if (ch !== "," || depth !== 0) continue;
          }
          const arg = kept.slice(start, j).trim();
          if (arg) args.push(arg);
          start = j + 1;
        }
        return args.filter((a) => !/\w+Variants\s*\(/.test(a));
      })();
      if (!withoutVariants.length) replacement = "class={undefined}";
      else if (withoutVariants.length === 1)
        replacement = `class={${withoutVariants[0]}}`;
      else replacement = `class={cn(${withoutVariants.join(", ")})}`;
    }
    out = out.slice(0, m.start) + replacement + out.slice(m.end);
  }
  return out;
}

function removeTailwindVariantsImport(source: string): string {
  return source
    .replace(
      /import\s*\{[^}]*\btv\b[^}]*\}\s*from\s*["']tailwind-variants["'];?\n?/g,
      "",
    )
    .replace(
      /import\s+type\s*\{[^}]*VariantProps[^}]*\}\s*from\s*["']tailwind-variants["'];?\n?/g,
      "",
    );
}

function replaceTvModuleBlock(
  source: string,
  component: string,
  extraction: StyleExtraction,
): string {
  if (extraction.kind !== "tv") return source;

  const tvIndex = source.search(/\bexport\s+const\s+\w+Variants\s*=\s*tv\s*\(/);
  const altIndex = source.search(/\bconst\s+\w+Variants\s*=\s*tv\s*\(/);
  const start = tvIndex >= 0 ? tvIndex : altIndex;
  if (start < 0) return source;

  // Find end of tv(...) call
  const open = source.indexOf("(", start);
  let depth = 0;
  let end = open;
  let inString: '"' | "'" | "`" | null = null;
  let escaped = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i]!;
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === "(") depth++;
    if (ch === ")") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  // Include trailing semicolon
  while (end < source.length && /[\s;]/.test(source[end]!)) {
    if (source[end] === ";") {
      end++;
      break;
    }
    end++;
  }

  // Also remove following `export type XxxVariant = VariantProps<...>` lines
  let after = end;
  const typeRe =
    /^\s*export\s+type\s+\w+\s*=\s*VariantProps<[^>]+>\[[^\]]+\];?\s*/;
  const rest = source.slice(after);
  const typeMatch = typeRe.exec(rest);
  if (typeMatch) after += typeMatch[0].length;

  const stub = variantsStubName(component);
  const axisBlocks = extraction.axes
    .map((axis) => {
      const c = constName(component, axis.prop);
      const t = typeName(component, axis.prop);
      return `  export const ${c} = [
${axis.values.map((v) => `    "${v}",`).join("\n")}
  ] as const;
  export type ${t} = (typeof ${c})[number];`;
    })
    .join("\n\n");

  const propTypes = extraction.axes
    .map((a) => `    ${a.prop}?: ${typeName(component, a.prop)};`)
    .join("\n");

  const replacement = `${axisBlocks}

  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function ${stub}(_opts?: {
${propTypes}
    class?: string;
  }): string {
    return "";
  }
`;

  // Find export const name for type aliases that referenced VariantProps
  let out = source.slice(0, start) + replacement + source.slice(after);

  // Replace VariantProps-based type aliases already removed; fix remaining refs
  out = out.replace(
    /:\s*VariantProps<typeof\s+\w+>\[[^\]]+\]/g,
    (m) => {
      // fallback — shouldn't remain
      return m;
    },
  );

  // Update prop types that used AlertVariant etc — if type was removed, inject local types
  for (const axis of extraction.axes) {
    const t = typeName(component, axis.prop);
    // Common pattern: variant?: AlertVariant
    const legacy = new RegExp(
      `(\\b${axis.prop}\\?:\\s*)[A-Z][A-Za-z0-9_]*`,
      "g",
    );
    // Only replace when the old type name ends with Variant/Size etc.
    out = out.replace(
      new RegExp(
        `(\\b${axis.prop}\\s*\\?:\\s*)([A-Z][A-Za-z0-9_]*(?:Variant|Size|Variants)?)\\b`,
        "g",
      ),
      `$1${t}`,
    );
    void legacy;
  }

  return out;
}

function injectDataAttributes(
  source: string,
  component: string,
  part: string,
  extraction: StyleExtraction,
): string {
  const attrs: string[] = [
    `data-ui-component="${component}"`,
    `data-ui-part="${part}"`,
  ];
  for (const axis of extraction.axes) {
    attrs.push(`data-${axis.prop}={${axis.prop}}`);
  }
  const joined = attrs.join("\n  ");

  // Prefer attaching next to every data-slot attribute (covers multi-root files).
  if (/data-slot=/.test(source)) {
    return source.replace(/data-slot=\{?[^}\s]+\}?/g, (m) => `${joined}\n  ${m}`);
  }

  // Attach before every class={...}
  if (/class=\{/.test(source)) {
    return source.replace(/(\n\s*)class=\{/g, (_m, ws) => {
      return `${ws}${attrs.join(ws)}${ws}class={`;
    });
  }

  return source;
}

function ensureCnImport(source: string): string {
  if (/\bcn\s*\(/.test(source)) return source;
  return source.replace(
    /import\s*\{([^}]*)\}\s*from\s*(["'][^"']*utils\.js["']);?\n?/,
    (full, inner: string, from: string) => {
      const parts = inner
        .split(",")
        .map((p: string) => p.trim())
        .filter(Boolean)
        .filter((p: string) => p !== "cn");
      if (parts.length === inner.split(",").map((p) => p.trim()).filter(Boolean).length) {
        return full;
      }
      if (!parts.length) return "";
      return `import { ${parts.join(", ")} } from ${from};\n`;
    },
  );
}

function injectStyleBlock(source: string, remappedCss: string): string {
  const scopedCss = remappedCss
    .split("\n")
    .map((line) => line.replaceAll(".dark ", ":global(.dark) "))
    .join("\n");

  const style = `
<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
${scopedCss
  .split("\n")
  .map((line) => (line ? `    ${line}` : ""))
  .join("\n")}
  }
</style>
`;

  if (/<\/style>/.test(source)) {
    // Append rules inside existing :global or add another style block
    return source + style;
  }
  return source.trimEnd() + "\n" + style;
}

export function rewritePartSource(args: {
  part: PartExtraction;
  component: string;
  injectCss?: string;
}): string {
  const { part, component, injectCss } = args;
  let source = part.source;

  source = removeTailwindVariantsImport(source);
  source = replaceTvModuleBlock(source, component, part.extraction);
  source = rewriteCnClassAttributes(source);
  source = injectDataAttributes(
    source,
    component,
    part.part,
    part.extraction,
  );
  source = ensureCnImport(source);

  // Clean class={undefined}
  source = source.replace(/\s*class=\{undefined\}/g, "");

  if (injectCss?.trim()) {
    source = injectStyleBlock(source, injectCss);
  }

  return source;
}

function buildTokensTs(component: string): string {
  const tokenEntries = [
    ["background", "background"],
    ["foreground", "foreground"],
    ["borderColor", "border-color"],
    ["radius", "radius"],
    ["focusRingColor", "focus-ring-color"],
  ] as const;

  const typeBase = component
    .split("-")
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join("");

  return `export const ${component.replace(/-/g, "_")}TokenNames = {
${tokenEntries
  .map(
    ([key, slug]) => `  ${key}: "${publicTokenName("ui", component, [slug])}",`,
  )
  .join("\n")}
} as const;

export type ${typeBase}Token =
  (typeof ${component.replace(/-/g, "_")}TokenNames)[keyof typeof ${component.replace(/-/g, "_")}TokenNames];
`;
}

/** Stamp ownership attrs on styleless Bits pass-through families. */
export function emitPassthroughFamily(args: {
  targetDir: string;
  component: string;
  parts: Array<{ fileName: string; source: string }>;
  provenance: Record<string, unknown>;
}): string[] {
  const { targetDir, component, parts, provenance } = args;
  mkdirSync(targetDir, { recursive: true });
  const written: string[] = [];

  for (const part of parts) {
    const partName = part.fileName.replace(/\.svelte$/, "");
    const extraction = {
      kind: "empty" as const,
      baseClasses: [],
      axes: [],
      classMaps: {},
      allCandidates: [],
      sourceSnippet: "",
    };
    const next = rewritePartSource({
      part: {
        part: partName,
        fileName: part.fileName,
        source: part.source,
        extraction,
      },
      component,
    });
    const full = path.join(targetDir, part.fileName);
    writeFileSync(full, next);
    written.push(full);
  }

  const tokensPath = path.join(targetDir, `${component}.tokens.ts`);
  writeFileSync(tokensPath, buildTokensTs(component));
  written.push(tokensPath);

  const provenancePath = path.join(targetDir, `${component}.provenance.json`);
  writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
  written.push(provenancePath);

  return written;
}

export function emitFamily(args: {
  targetDir: string;
  family: FamilyExtraction;
  remappedCss: string;
  provenance: Record<string, unknown>;
}): string[] {
  const { targetDir, family, remappedCss, provenance } = args;
  mkdirSync(targetDir, { recursive: true });
  const written: string[] = [];

  const rootPart =
    family.parts.find((p) => p.part === family.component) ?? family.parts[0]!;

  for (const part of family.parts) {
    const injectCss =
      part.fileName === rootPart.fileName ? remappedCss : undefined;
    const next = rewritePartSource({
      part,
      component: family.component,
      injectCss,
    });
    const full = path.join(targetDir, part.fileName);
    writeFileSync(full, next);
    written.push(full);
  }

  const tokensPath = path.join(targetDir, `${family.component}.tokens.ts`);
  writeFileSync(tokensPath, buildTokensTs(family.component));
  written.push(tokensPath);

  const provenancePath = path.join(
    targetDir,
    `${family.component}.provenance.json`,
  );
  writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
  written.push(provenancePath);

  return written;
}
