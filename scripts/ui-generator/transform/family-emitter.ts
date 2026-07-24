import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  FamilyExtraction,
  PartExtraction,
  StyleExtraction,
} from "../analysis/style-extractor.js";
import {
  composedFamilyFromTag,
  extractStyleSites,
  isMarkerCandidate,
  type StyleSite,
} from "../analysis/style-sites.js";
import { emitLockedDataUiAttrOrder } from "./data-ui-host-gate.js";
import {
  FAMILY_TOKEN_SPECS,
  buildTokensCss,
  buildTokensTs,
  rewritePaintToTokens,
} from "./token-wiring.js";

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
        if (c === "\\") {
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

function splitTopLevelArgs(kept: string): string[] {
  const out: string[] = [];
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
    if (arg && !/\w+Variants\s*\(/.test(arg)) out.push(arg);
    start = j + 1;
  }
  return out;
}

function classReplacementForSite(source: string, site: StyleSite): string {
  if (site.kind === "cn") {
    const expr = source.slice(site.attrStart, site.classEnd);
    const innerMatch = /^class=\{cn\(([\s\S]*)\)\}$/.exec(expr);
    if (!innerMatch) return "class={undefined}";
    const kept = stripStringArgsFromCn(innerMatch[1]!);
    const keptArgs = kept ? splitTopLevelArgs(kept) : [];
    if (!keptArgs.length) return "class={undefined}";
    if (keptArgs.length === 1) return `class={${keptArgs[0]}}`;
    return `class={cn(${keptArgs.join(", ")})}`;
  }
  if (site.kind === "cnObject") {
    const expr = source.slice(site.attrStart, site.classEnd);
    const innerMatch = /^class:\s*cn\(([\s\S]*)\)$/.exec(expr);
    if (!innerMatch) return "class: undefined";
    const kept = stripStringArgsFromCn(innerMatch[1]!);
    const keptArgs = kept ? splitTopLevelArgs(kept) : [];
    if (!keptArgs.length) return "class: undefined";
    if (keptArgs.length === 1) return `class: ${keptArgs[0]}`;
    return `class: cn(${keptArgs.join(", ")})`;
  }
  // static / classLit — drop utilities (markers remapped in CSS)
  return "";
}

function ownershipPrefix(
  component: string,
  site: StyleSite,
  extraction: StyleExtraction,
  indent: string,
  source: string,
): string {
  const lines: string[] = [];
  // Composed hosts (e.g. <Input>) already own data-ui-component; overriding it
  // drops their base styles (outline-none, focus ring, padding).
  if (!site.composedFrom) {
    lines.push(`data-ui-component="${component}"`);
  }
  lines.push(`data-ui-part="${site.part}"`);
  // tv axes only on the primary site for this file
  if (extraction.kind === "tv") {
    for (const axis of extraction.axes) {
      if (new RegExp(`data-${axis.prop}\\s*=`).test(source)) continue;
      lines.push(`data-${axis.prop}={${axis.prop}}`);
    }
  }
  if (!site.dataSlot) {
    lines.push(`data-slot="${site.part}"`);
  }
  return lines.map((a) => `${indent}${a}`).join("\n") + "\n" + indent;
}

/**
 * Strip converted class attrs and inject per-site ownership attributes.
 * Applies from the end of the file so earlier offsets stay valid.
 */
function applyStyleSites(
  source: string,
  component: string,
  sites: StyleSite[],
  extraction: StyleExtraction,
): string {
  if (!sites.length) {
    return injectDataAttributes(source, component, component, extraction);
  }

  let out = source;
  const sorted = [...sites].sort((a, b) => b.attrStart - a.attrStart);

  for (const site of sorted) {
    const classReplacement = classReplacementForSite(source, site);
    const indent =
      out
        .slice(out.lastIndexOf("\n", site.attrStart) + 1, site.attrStart)
        .match(/([ \t]*)$/)?.[1] || "  ";
    const prefix = ownershipPrefix(component, site, extraction, indent, source);

    if (site.kind === "cnObject") {
      // Replace class: cn(...) in the object literal.
      out =
        out.slice(0, site.attrStart) +
        classReplacement +
        out.slice(site.classEnd);
      // Inject ownership keys next to data-slot in the same object when present.
      const searchFrom = Math.max(0, site.attrStart - 200);
      const searchTo = Math.min(out.length, site.attrStart + 500);
      const region = out.slice(searchFrom, searchTo);
      const slotKey = /["']data-slot["']\s*:/.exec(region);
      if (slotKey && !region.includes("data-ui-part")) {
        const abs = searchFrom + slotKey.index!;
        const ownLines: string[] = [];
        if (!site.composedFrom) {
          ownLines.push(`${indent}"data-ui-component": "${component}",`);
        }
        ownLines.push(`${indent}"data-ui-part": "${site.part}",`);
        out = out.slice(0, abs) + ownLines.join("\n") + "\n" + out.slice(abs);
      }
      // Also stamp the concrete host that spreads mergedProps (button/div/a).
      out = out.replace(
        /(<(?:button|div|a|span)\b)([^>]*?\{\.\.\.mergedProps\})/,
        (full, tag: string, rest: string) => {
          if (rest.includes("data-ui-part=")) return full;
          const inject = site.composedFrom
            ? ` data-ui-part="${site.part}"`
            : ` data-ui-component="${component}" data-ui-part="${site.part}"`;
          return `${tag}${inject}${rest}`;
        },
      );
      continue;
    }

    // Locate data-slot on the full opening tag (may be before or after class=).
    const tagStart = source.lastIndexOf("<", site.attrStart);
    let tagEnd = source.indexOf(">", site.attrStart);
    // Prefer scanning with quote awareness when possible
    for (
      let i = tagStart + 1, inStr: '"' | "'" | null = null;
      i < source.length;
      i++
    ) {
      const ch = source[i]!;
      if (inStr) {
        if (ch === inStr && source[i - 1] !== "\\") inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        inStr = ch;
        continue;
      }
      if (ch === ">") {
        tagEnd = i;
        break;
      }
    }
    const fullTag = source.slice(tagStart, tagEnd + 1);
    const slotInTag = /data-slot=(?:"[^"]*"|'[^']*')/.exec(fullTag);

    if (slotInTag) {
      // 1) strip/replace class attr
      out =
        out.slice(0, site.attrStart) +
        (classReplacement || "") +
        out.slice(site.classEnd);
      // 2) inject ownership before the surviving data-slot on this tag
      const outTagStart = out.lastIndexOf("<", site.attrStart);
      let outTagEnd = out.indexOf(">", site.attrStart);
      for (
        let i = outTagStart + 1, inStr: '"' | "'" | null = null;
        i < out.length;
        i++
      ) {
        const ch = out[i]!;
        if (inStr) {
          if (ch === inStr && out[i - 1] !== "\\") inStr = null;
          continue;
        }
        if (ch === '"' || ch === "'") {
          inStr = ch;
          continue;
        }
        if (ch === ">") {
          outTagEnd = i;
          break;
        }
      }
      const outTag = out.slice(outTagStart, outTagEnd + 1);
      const outSlot = /data-slot=(?:"[^"]*"|'[^']*')/.exec(outTag);
      if (outSlot) {
        const abs = outTagStart + outSlot.index;
        const before = out.slice(Math.max(0, abs - 100), abs);
        if (!before.includes(`data-ui-part="${site.part}"`)) {
          out = out.slice(0, abs) + prefix + out.slice(abs);
        }
      }
    } else {
      out =
        out.slice(0, site.attrStart) +
        prefix +
        (classReplacement || "") +
        out.slice(site.classEnd);
    }
  }

  // Stamp remaining data-slot nodes that were not style sites
  out = out.replace(
    /(^|\n)([ \t]*)data-slot=(?:"([^"]*)"|'([^']*)')/g,
    (m, lead: string, indent: string, a: string, b: string, offset: number) => {
      const slot = a ?? b;
      const preceding = out.slice(Math.max(0, offset - 200), offset);
      // Already owned (including composed hosts that only stamp data-ui-part)
      if (
        preceding.includes("data-ui-part=") ||
        /data-ui-component="[^"]*"\s*$/.test(preceding.trimEnd())
      ) {
        return m;
      }
      // Composed family hosts keep the child's data-ui-component
      if (composedFamilyFromTag(out, offset)) {
        return `${lead}${indent}data-ui-part="${slot}"\n${indent}data-slot="${slot}"`;
      }
      return `${lead}${indent}data-ui-component="${component}"\n${indent}data-ui-part="${slot}"\n${indent}data-slot="${slot}"`;
    },
  );

  // Collapse accidental duplicate ownership attrs on the same element
  out = out.replace(
    /(\s*data-ui-component="[^"]*"\s*\n(?:\s*data-ui-part="[^"]*"\s*\n)?){2,}/g,
    (block) => {
      const indent = block.match(/\n([ \t]*)data-ui-component/)?.[1] ?? "\t";
      const part =
        [...block.matchAll(/data-ui-part="([^"]*)"/g)].pop()?.[1] ?? component;
      return `\n${indent}data-ui-component="${component}"\n${indent}data-ui-part="${part}"\n`;
    },
  );

  // Prefer the semantic data-slot when a synthetic anon slot was also injected.
  out = out.replace(
    /data-slot="([^"]*-anon-\d+)"\s*\n(\s*)data-slot="([^"]+)"/g,
    (_m, _anon: string, indent: string, real: string) =>
      `data-slot="${real}"\n${indent}`,
  );
  out = out.replace(
    /data-slot="([^"]+)"\s*\n(\s*)data-slot="([^"]*-anon-\d+)"/g,
    (_m, real: string, indent: string) => `data-slot="${real}"\n${indent}`,
  );
  // If both remain on one line-ish block, drop anon when a non-anon sibling exists
  out = out.replace(
    /(data-ui-part=")([^"]*-anon-\d+)("[\s\S]{0,120}?data-slot=")([^"]+)(")/g,
    (full, p1, anonPart, mid, slot, end) => {
      if (slot.includes("-anon-")) return full;
      // Align part name with the real slot when we duplicated
      return `${p1}${slot}${mid}${slot}${end}`;
    },
  );

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
  markers: string[] = [],
): string {
  if (extraction.kind !== "tv") return source;

  const nameMatch =
    source.match(/\bexport\s+const\s+(\w+)\s*=\s*tv\s*\(/) ??
    source.match(/\bconst\s+(\w+)\s*=\s*tv\s*\(/);
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

  const uniqueMarkers = [...new Set(markers)];
  const markerReturn =
    uniqueMarkers.length > 0
      ? `    return ${JSON.stringify(uniqueMarkers.join(" "))};`
      : `    return "";`;

  const replacement = `${axisBlocksFixed}
${composite}
  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function ${variantsName}(_opts?: {
${propTypes}
    class?: string;
  }): string {
${markerReturn}
  }
`;

  return source.slice(0, start) + replacement + source.slice(after);
}

/** Stamp part (+ axes) without overriding a composed child's data-ui-component. */
function injectComposedPartAttributes(
  source: string,
  part: string,
  extraction: StyleExtraction,
): string {
  if (source.includes(`data-ui-part="${part}"`)) return source;
  const attrs: string[] = [`data-ui-part="${part}"`];
  for (const axis of extraction.axes) {
    if (new RegExp(`data-${axis.prop}\\s*=`).test(source)) continue;
    attrs.push(`data-${axis.prop}={${axis.prop}}`);
  }
  const attrDataSlot =
    /(^|\n)([ \t]*)data-slot=(?:\{[^}]+\}|"[^"]*"|'[^']*'|[^\s>]+)/g;
  if (attrDataSlot.test(source)) {
    attrDataSlot.lastIndex = 0;
    return source.replace(attrDataSlot, (match, lead, indent) => {
      const prefix = attrs.map((a) => `${indent}${a}`).join("\n");
      return `${lead}${prefix}\n${indent}${match.slice(lead.length)}`;
    });
  }
  const absClass = source.indexOf("class={");
  if (absClass < 0) return source;
  const lineStart = source.lastIndexOf("\n", absClass) + 1;
  const indent =
    source.slice(lineStart, absClass).match(/^[ \t]*/)?.[0] ?? "\t";
  const prefix = attrs.map((a) => `${indent}${a}`).join("\n") + "\n" + indent;
  return source.slice(0, absClass) + prefix + source.slice(absClass);
}

function ensureOmitDataUiIdentityImport(source: string): string {
  if (/omitDataUiIdentity/.test(source)) return source;
  if (
    !/\.\.\.(?:omitDataUiIdentity\()?restProps/.test(source) &&
    !/\.\.\.restProps/.test(source)
  ) {
    return source;
  }
  // Prefer colocating with an existing utils import when present.
  const utilsImport =
    /import\s*\{([^}]*)\}\s*from\s*(["'][^"']*lib\/utils\.js["'])\s*;?/.exec(
      source,
    );
  if (utilsImport) {
    const from = utilsImport[2]!.replace(/utils\.js/, "data-ui-host.js");
    const insert = `import { omitDataUiIdentity } from ${from};\n`;
    return source.replace(utilsImport[0], `${utilsImport[0]}\n${insert}`);
  }
  const script = source.indexOf("<script");
  if (script < 0) return source;
  const close = source.indexOf(">", script);
  if (close < 0) return source;
  return (
    source.slice(0, close + 1) +
    `\n\timport { omitDataUiIdentity } from "../../../lib/data-ui-host.js";` +
    source.slice(close + 1)
  );
}

/**
 * Object-literal hosts must keep ownership after rest spreads. Foreign asChild
 * parents (e.g. Collapsible.Trigger) otherwise overwrite data-ui-* and kill CSS.
 */
function lockObjectLiteralDataUiIdentity(source: string): string {
  if (!/["']data-ui-part["']\s*:/.test(source)) return source;
  if (!/\.\.\.restProps/.test(source)) return source;

  let out = source.replace(
    /\.\.\.(?:omitDataUiIdentity\()?restProps\)?\s*,/,
    "...omitDataUiIdentity(restProps),",
  );

  // Move ownership keys after the rest spread when rest still trails them.
  out = out.replace(
    /(\{[\s\S]*?)("data-ui-component"\s*:\s*"[^"]+"\s*,\s*"data-ui-part"\s*:\s*"[^"]+"\s*,)([\s\S]*?)(\.\.\.omitDataUiIdentity\(restProps\),)/g,
    (_m, before: string, ownership: string, mid: string, rest: string) => {
      // Only rewrite when ownership appears before rest in this object.
      return `${before}${rest}${ownership}${mid}`;
    },
  );

  out = ensureOmitDataUiIdentityImport(out);

  // Host markup: ownership must win over {...mergedProps}.
  out = out.replace(
    /(<(?:button|div|a|span)\b)([^>]*?\bdata-ui-(?:component|part)=["'][^"']+["'][^>]*?)(\{\.\.\.mergedProps\})([^>]*>)/g,
    (_m, tag: string, before: string, spread: string, after: string) => {
      const comp = before.match(/\bdata-ui-component=(["'][^"']+["'])/)?.[0];
      const part = before.match(/\bdata-ui-part=(["'][^"']+["'])/)?.[0];
      if (!comp || !part) return _m;
      const cleaned = before
        .replace(/\s*data-ui-component=(["'][^"']+["'])/, "")
        .replace(/\s*data-ui-part=(["'][^"']+["'])/, "");
      return `${tag}${cleaned}${spread} ${comp} ${part}${after}`;
    },
  );

  return out;
}

function injectDataAttributes(
  source: string,
  component: string,
  part: string,
  extraction: StyleExtraction,
): string {
  // Object-literal hosts (e.g. $derived buttonProps with class: cn(...))
  // spread onto <a> via child snippets — ownership must live on the object.
  if (
    /["']data-slot["']\s*:/.test(source) &&
    !/["']data-ui-part["']\s*:/.test(source)
  ) {
    const objDataSlot = /(^|\n)([ \t]*)["']data-slot["']\s*:/g;
    source = source.replace(objDataSlot, (m, lead, indent) => {
      const own: string[] = [
        `${indent}"data-ui-component": "${component}",`,
        `${indent}"data-ui-part": "${part}",`,
      ];
      for (const axis of extraction.axes) {
        const key = `"data-${axis.prop}"`;
        if (
          source.includes(key) ||
          new RegExp(`data-${axis.prop}\\s*=`).test(source)
        ) {
          continue;
        }
        own.push(`${indent}${key}: ${axis.prop},`);
      }
      return `${lead}${own.join("\n")}\n${m.slice(lead.length)}`;
    });
  }

  const attrs: string[] = [
    `data-ui-component="${component}"`,
    `data-ui-part="${part}"`,
  ];
  for (const axis of extraction.axes) {
    // Don't duplicate attrs already present on the markup (e.g. data-variant={variant}).
    if (new RegExp(`data-${axis.prop}\\s*=`).test(source)) continue;
    if (new RegExp(`["']data-${axis.prop}["']\\s*:`).test(source)) continue;
    attrs.push(`data-${axis.prop}={${axis.prop}}`);
  }

  // Only match real HTML attributes (line-leading), never inside class="...data-slot=..." utilities.
  const attrDataSlot =
    /(^|\n)([ \t]*)data-slot=(?:\{[^}]+\}|"[^"]*"|'[^']*'|[^\s>]+)/g;
  if (attrDataSlot.test(source)) {
    attrDataSlot.lastIndex = 0;
    if (!/data-ui-part=/.test(source)) {
      source = source.replace(attrDataSlot, (m, lead, indent) => {
        const prefix = attrs.map((a) => `${indent}${a}`).join("\n");
        return `${lead}${prefix}\n${indent}${m.slice(lead.length)}`;
      });
    }
  }

  // Attach before line-leading class={...} (not class="static" utilities on icons).
  if (/\n\s*class=\{/.test(source) && !/data-ui-part=/.test(source)) {
    source = source.replace(/(\n\s*)class=\{/g, (_m, ws) => {
      return `${ws}${attrs.join(ws)}${ws}class={`;
    });
  }

  // Stamp the concrete host that spreads mergedProps (button/div/a).
  // Ownership after the spread so it wins over asChild parent identity.
  source = source.replace(
    /(<(?:button|div|a|span)\b)([^>]*?\{\.\.\.mergedProps\})([^>]*>)/,
    (full, tag: string, rest: string, after: string) => {
      if (/\bdata-ui-part=/.test(after) || /\bdata-ui-part=/.test(rest)) {
        return full;
      }
      return `${tag}${rest} data-ui-component="${component}" data-ui-part="${part}"${after}`;
    },
  );

  source = lockObjectLiteralDataUiIdentity(source);

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
    const existing =
      /import\s*\{([^}]*)\}\s*from\s*(["'][^"']*toggle[^"']*["'])/.exec(out);
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
      const kebab = family.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
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
      if (
        parts.length ===
        inner
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean).length
      ) {
        return full;
      }
      if (!parts.length) return "";
      return `import { ${parts.join(", ")} } from ${from};\n`;
    },
  );
}

/**
 * Tailwind's compiler wraps utilities in `@layer utilities`. Layered rules lose to
 * any unlayered page/browser CSS (including Storybook chrome and embedded browsers).
 * Promote the remapped semantic selectors out of that layer so component styles win.
 */
function unwrapUtilitiesLayer(css: string): string {
  return css.replace(
    /@layer\s+utilities\s*\{([\s\S]*?)\}\s*(?=@layer|@property|$)/g,
    "$1",
  );
}

function injectStyleBlock(source: string, remappedCss: string): string {
  const scopedCss = unwrapUtilitiesLayer(remappedCss)
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
    part.sites?.flatMap((s) => s.markers) ?? [],
  );
  source = rewriteCrossModuleVariantProps(source);

  if ((part.sites?.length ?? 0) > 0 && part.extraction.kind !== "tv") {
    // Recompute sites on the cleaned source so offsets match.
    const sites = extractStyleSites(source, component, part.part);
    source = applyStyleSites(source, component, sites, part.extraction);
  } else if ((part.sites?.length ?? 0) > 0 && part.extraction.kind === "tv") {
    // tv on a composed host (e.g. InputGroup Button): strip classes, stamp
    // part/slot without overriding the child's data-ui-component.
    source = rewriteCnClassAttributes(source);
    const site = part.sites![0]!;
    const composedFrom =
      site.composedFrom ??
      composedFamilyFromTag(source, source.indexOf("class={"));
    if (composedFrom) {
      source = injectComposedPartAttributes(source, part.part, part.extraction);
    } else {
      source = injectDataAttributes(
        source,
        component,
        part.part,
        part.extraction,
      );
    }
  } else {
    source = rewriteCnClassAttributes(source);
    const composedProbe =
      source.indexOf("class={") >= 0
        ? source.indexOf("class={")
        : source.indexOf("data-slot=");
    const composedFrom =
      composedProbe >= 0 ? composedFamilyFromTag(source, composedProbe) : null;
    if (composedFrom) {
      source = injectComposedPartAttributes(source, part.part, part.extraction);
    } else {
      source = injectDataAttributes(
        source,
        component,
        part.part,
        part.extraction,
      );
    }
  }

  source = ensureCnImport(source);

  // Clean class={undefined} and leftover empty class attrs
  source = source.replace(/\s*class=\{undefined\}/g, "");
  source = source.replace(/\s*class=""/g, "");

  if (injectCss?.trim()) {
    source = injectStyleBlock(source, injectCss);
  }

  source = emitLockedDataUiAttrOrder(source);

  return source;
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
        sites: [],
      },
      component,
    });
    const full = path.join(targetDir, part.fileName);
    writeFileSync(full, next);
    written.push(full);
  }

  const spec = FAMILY_TOKEN_SPECS[component];
  const tokensPath = path.join(targetDir, `${component}.tokens.ts`);
  writeFileSync(tokensPath, buildTokensTs(component, spec));
  written.push(tokensPath);

  if (spec) {
    const tokensCssPath = path.join(targetDir, `${component}.tokens.css`);
    writeFileSync(tokensCssPath, buildTokensCss(component, spec));
    written.push(tokensCssPath);
  }

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

  const spec = FAMILY_TOKEN_SPECS[family.component];
  let css = remappedCss;
  if (spec) {
    css = rewritePaintToTokens(family.component, remappedCss, spec);
  }

  for (const part of family.parts) {
    const injectCss = part.fileName === rootPart.fileName ? css : undefined;
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
  writeFileSync(tokensPath, buildTokensTs(family.component, spec));
  written.push(tokensPath);

  if (spec) {
    const tokensCssPath = path.join(
      targetDir,
      `${family.component}.tokens.css`,
    );
    writeFileSync(tokensCssPath, buildTokensCss(family.component, spec));
    written.push(tokensCssPath);
  }

  const provenancePath = path.join(
    targetDir,
    `${family.component}.provenance.json`,
  );
  writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
  written.push(provenancePath);

  return written;
}
