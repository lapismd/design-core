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
  part: string,
  extraction: StyleExtraction,
): string {
  if (extraction.kind !== "tv") return source;

  const nameMatch = source.match(
    /\bexport\s+const\s+(\w+)\s*=\s*tv\s*\(/,
  ) ?? source.match(/\bconst\s+(\w+)\s*=\s*tv\s*\(/);
  if (!nameMatch) return source;
  const variantsName = nameMatch[1]!;
  const start = nameMatch.index!;

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
  while (end < source.length && /[\s;]/.test(source[end]!)) {
    if (source[end] === ";") {
      end++;
      break;
    }
    end++;
  }

  // Capture and remove all following VariantProps type aliases (single or multiline).
  const axisTypeNames = new Map<string, string>();
  let compositeTypeName: string | null = null;
  let after = end;
  while (after < source.length) {
    const slice = source.slice(after);
    if (!/^\s*export\s+type\s+\w+\s*=\s*VariantProps</.test(slice)) break;
    const typeMatch =
      /^\s*export\s+type\s+(\w+)\s*=\s*VariantProps<\s*typeof\s+\w+\s*>(\s*\[\s*["'](\w+)["']\s*\])?\s*;?\s*/s.exec(
        slice,
      );
    if (!typeMatch) break;
    if (typeMatch[3]) {
      axisTypeNames.set(typeMatch[3], typeMatch[1]!);
    } else {
      compositeTypeName = typeMatch[1]!;
    }
    after += typeMatch[0].length;
  }

  const namingBase = part.includes("-") ? part : component;
  for (const axis of extraction.axes) {
    if (!axisTypeNames.has(axis.prop)) {
      axisTypeNames.set(axis.prop, typeName(namingBase, axis.prop));
    }
  }

  const axisBlocksFixed = extraction.axes
    .map((axis) => {
      const t = axisTypeNames.get(axis.prop)!;
      let constId: string;
      if (t.endsWith("Variant")) {
        constId = `${t
          .slice(0, -"Variant".length)
          .replace(/([a-z])([A-Z])/g, "$1_$2")
          .toUpperCase()}_VARIANTS`;
      } else if (t.endsWith("Size")) {
        constId = `${t
          .slice(0, -"Size".length)
          .replace(/([a-z])([A-Z])/g, "$1_$2")
          .toUpperCase()}_SIZES`;
      } else {
        constId = constName(namingBase, axis.prop);
      }
      return `  export const ${constId} = [
${axis.values.map((v) => `    "${v}",`).join("\n")}
  ] as const;
  export type ${t} = (typeof ${constId})[number];`;
    })
    .join("\n\n");

  const propTypes = extraction.axes
    .map((a) => `    ${a.prop}?: ${axisTypeNames.get(a.prop)!};`)
    .join("\n");

  const composite =
    compositeTypeName != null
      ? `\n  export type ${compositeTypeName} = {\n${extraction.axes
          .map((a) => `    ${a.prop}?: ${axisTypeNames.get(a.prop)!};`)
          .join("\n")}\n  };\n`
      : "";

  const replacement = `${axisBlocksFixed}
${composite}
  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function ${variantsName}(_opts?: {
${propTypes}
    class?: string;
  }): string {
    return "";
  }
`;

  return source.slice(0, start) + replacement + source.slice(after);
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
    // Don't duplicate attrs already present on the markup (e.g. data-variant={variant}).
    if (new RegExp(`data-${axis.prop}\\s*=`).test(source)) continue;
    attrs.push(`data-${axis.prop}={${axis.prop}}`);
  }
  const joined = attrs.join("\n  ");

  // Only match real HTML attributes (line-leading), never inside class="...data-slot=..." utilities.
  const attrDataSlot =
    /(^|\n)([ \t]*)data-slot=(?:\{[^}]+\}|"[^"]*"|'[^']*'|[^\s>]+)/g;
  if (attrDataSlot.test(source)) {
    attrDataSlot.lastIndex = 0;
    return source.replace(attrDataSlot, (m, lead, indent) => {
      const prefix = attrs.map((a) => `${indent}${a}`).join("\n");
      return `${lead}${prefix}\n${indent}${m.slice(lead.length)}`;
    });
  }

  // Attach before line-leading class={...} (not class="static" utilities on icons).
  if (/\n\s*class=\{/.test(source)) {
    return source.replace(/(\n\s*)class=\{/g, (_m, ws) => {
      return `${ws}${attrs.join(ws)}${ws}class={`;
    });
  }

  return source;
}

/** Rewrite VariantProps<typeof xVariants> imports from sibling converted modules. */
function rewriteCrossModuleVariantProps(source: string): string {
  let out = source;
  // import type { VariantProps } from "tailwind-variants";
  out = out.replace(
    /import\s+type\s*\{\s*VariantProps\s*\}\s*from\s*["']tailwind-variants["'];?\n?/g,
    "",
  );

  // type ToggleVariants = VariantProps<typeof toggleVariants>;
  // + import { toggleVariants } from "../toggle/index.js";
  const alias =
    /type\s+(\w+)\s*=\s*VariantProps<\s*typeof\s+(\w+)\s*>\s*;?\n?/.exec(out);
  if (alias) {
    const typeNameAlias = alias[1]!;
    const variantsIdent = alias[2]!; // toggleVariants
    out = out.replace(alias[0], "");
    // Ensure we import the type from the same module that exports the stub.
    const importRe = new RegExp(
      `import\\s*\\{([^}]*)\\}\\s*from\\s*(["'][^"']*${variantsIdent.replace(
        /Variants$/,
        "",
      )}[^"']*["'])`,
    );
    // Prefer ../toggle/index.js style imports already present
    const existing = /import\s*\{([^}]*)\}\s*from\s*(["'][^"']*toggle[^"']*["'])/.exec(
      out,
    );
    if (existing) {
      const inner = existing[1]!;
      if (!inner.includes(typeNameAlias)) {
        out = out.replace(
          existing[0],
          `import { ${inner.trim().replace(/,?$/, "")}, type ${typeNameAlias} } from ${existing[2]}`,
        );
      }
    } else {
      // Derive path from variants name: toggleVariants → ../toggle/index.js
      const family = variantsIdent.replace(/Variants$/, "");
      const kebab = family
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase();
      out =
        `import type { ${typeNameAlias} } from "../${kebab}/index.js";\n` + out;
    }
    void importRe;
  }

  return out;
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
    .replaceAll(".dark ", ":global(.dark) ")
    // Satisfy svelte-check --fail-on-warnings for -webkit-line-clamp without standard twin.
    .replace(
      /-webkit-line-clamp:([^;]+);(?!line-clamp:)/g,
      "-webkit-line-clamp:$1;line-clamp:$1;",
    );

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
  source = replaceTvModuleBlock(
    source,
    component,
    part.part,
    part.extraction,
  );
  source = rewriteCrossModuleVariantProps(source);
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
