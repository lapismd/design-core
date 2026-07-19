import { EXIT, GeneratorError } from "../errors.js";
import {
  composedFamilyFromTag,
  extractStyleSites,
  mergeSitesToExtraction,
  type StyleSite,
} from "./style-sites.js";
import {
  extractTvConfig,
  splitCandidates,
  type TvExtraction,
  type VariantAxis,
} from "./variant-extractor.js";

export type StyleKind = "tv" | "cn" | "empty";

export type StyleExtraction = TvExtraction & {
  kind: StyleKind;
};

export type PartExtraction = {
  part: string;
  fileName: string;
  source: string;
  extraction: StyleExtraction;
  /** Per-element style sites (cn / static). Empty for tv-only parts. */
  sites: StyleSite[];
};

export type { StyleSite };

export type FamilyExtraction = {
  component: string;
  parts: PartExtraction[];
  allCandidates: string[];
  /** Axes from the primary tv() part, if any. */
  primaryAxes: VariantAxis[];
  primaryClassMaps: Record<string, Record<string, string>>;
  primaryBaseClasses: string[];
};

function joinStringLiterals(expression: string): string {
  const parts: string[] = [];
  const re = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(expression))) {
    parts.push(
      match[2]!.replace(/\\n/g, " ").replace(/\\"/g, '"').replace(/\\'/g, "'"),
    );
  }
  return parts.join(" ");
}

function assertNoDynamicClassTemplates(source: string) {
  if (/class=\{`[^`]*\$\{/.test(source) || /class:\s*`[^`]*\$\{/.test(source)) {
    throw new GeneratorError(
      "Unsupported dynamic class expression",
      EXIT.unsupported,
      "Tailwind candidates assembled from runtime values cannot be compiled safely.",
    );
  }
}

const UTILITY_RE =
  /\b(flex|inline-flex|grid|bg-|text-|border-|rounded-|h-\d|w-|px-|py-|gap-|shadow-|animate-|size-\d|shrink-0|items-|justify-|overflow-|ring-|outline-|font-|leading-|tracking-|whitespace-|min-w-|max-w-|opacity-|pointer-events-|cursor-|transition-|absolute|relative|fixed|sticky|inset-|top-|right-|bottom-|left-|z-|p-\d|m-\d|dark:|data-\[|aria-|focus-visible:|hover:|disabled:|placeholder:|file:)/;

/** True when source still looks like a Tailwind/tv style engine component. */
export function looksLikeTailwindSource(source: string): boolean {
  if (/\btv\s*\(/.test(source)) return true;
  if (/from\s+["']tailwind-variants["']/.test(source)) return true;
  if (/class=\{cn\(/.test(source) && UTILITY_RE.test(source)) return true;
  if (/class=\{["'`]/.test(source) && UTILITY_RE.test(source)) return true;
  // Static utility class attributes (e.g. Switch thumb) still need conversion.
  if (/class="[^"]*"/.test(source) && UTILITY_RE.test(source)) return true;
  return false;
}

/**
 * Extract static string class lists from cn(...) calls.
 * Fails closed on template literals with interpolation inside cn().
 */
export function extractCnClasses(source: string): StyleExtraction {
  assertNoDynamicClassTemplates(source);

  if (/cn\s*\(\s*`[^`]*\$\{/.test(source)) {
    throw new GeneratorError(
      "Unsupported dynamic cn() template",
      EXIT.unsupported,
      "cn() template literals with ${} cannot be compiled safely.",
    );
  }

  const classes: string[] = [];
  const cnRe = /\bcn\s*\(/g;
  let cnMatch: RegExpExecArray | null;
  while ((cnMatch = cnRe.exec(source))) {
    const start = cnMatch.index + cnMatch[0].length - 1;
    const { text } = extractBalancedCall(source, start);
    const inner = text.slice(1, -1);
    if (/\$\{/.test(inner) && /`/.test(inner)) {
      throw new GeneratorError(
        "Unsupported dynamic cn() argument",
        EXIT.unsupported,
      );
    }
    const joined = joinStringLiterals(inner);
    if (joined.trim()) {
      classes.push(...splitCandidates(joined));
    }
  }

  // Also pick up rare class={"static utilities"} forms
  const classLitRe = /class=\{(["'`])((?:\\.|(?!\1)[^\\])*)\1\}/g;
  let lit: RegExpExecArray | null;
  while ((lit = classLitRe.exec(source))) {
    classes.push(...splitCandidates(lit[2]!));
  }

  // Static class="..." utility lists (nested thumbs, indicators, etc.)
  const staticRe = /class="([^"]*)"/g;
  let st: RegExpExecArray | null;
  while ((st = staticRe.exec(source))) {
    const tokens = splitCandidates(st[1]!);
    if (tokens.some((t) => UTILITY_RE.test(t))) {
      classes.push(...tokens);
    }
  }

  const unique = [...new Set(classes)];
  if (!unique.length) {
    return {
      kind: "empty",
      baseClasses: [],
      axes: [],
      classMaps: {},
      allCandidates: [],
      sourceSnippet: "",
    };
  }

  return {
    kind: "cn",
    baseClasses: unique,
    axes: [],
    classMaps: {},
    allCandidates: [...unique].sort(),
    sourceSnippet: unique.join(" "),
  };
}

function extractBalancedCall(
  source: string,
  openParenIndex: number,
): { text: string; end: number } {
  if (source[openParenIndex] !== "(") {
    throw new GeneratorError("Expected '(' for cn() extraction", EXIT.unsupported);
  }
  let depth = 0;
  let inString: '"' | "'" | "`" | null = null;
  let escaped = false;
  for (let i = openParenIndex; i < source.length; i++) {
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
        return { text: source.slice(openParenIndex, i + 1), end: i + 1 };
      }
    }
  }
  throw new GeneratorError("Unbalanced cn() call", EXIT.unsupported);
}

export function extractStyleFromSource(source: string): StyleExtraction {
  assertNoDynamicClassTemplates(source);
  if (/\btv\s*\(/.test(source)) {
    return { ...extractTvConfig(source), kind: "tv" };
  }
  return extractCnClasses(source);
}

export function extractFamilyFromFiles(
  component: string,
  files: Array<{ fileName: string; source: string }>,
): FamilyExtraction {
  const parts: PartExtraction[] = [];
  const all = new Set<string>();

  for (const file of files) {
    const part = file.fileName.replace(/\.svelte$/, "");
    let extraction = extractStyleFromSource(file.source);
    let sites: StyleSite[] = [];

    if (extraction.kind !== "tv") {
      sites = extractStyleSites(file.source, component, part);
      if (sites.length) {
        const merged = mergeSitesToExtraction(sites);
        extraction = {
          kind: merged.baseClasses.length || merged.markers.length ? "cn" : "empty",
          baseClasses: merged.baseClasses,
          axes: [],
          classMaps: {},
          allCandidates: merged.allCandidates,
          sourceSnippet: merged.allCandidates.join(" "),
        };
      }
    } else {
      // tv files: single ownership site on the file part
      const classIdx = file.source.indexOf("class={");
      const composedFrom =
        classIdx >= 0
          ? composedFamilyFromTag(file.source, classIdx)
          : null;
      const slotMatch = /data-slot=(?:"([^"]*)"|'([^']*)')/.exec(
        file.source,
      );
      sites = [
        {
          part,
          dataSlot: slotMatch?.[1] ?? slotMatch?.[2] ?? null,
          kind: "cn",
          baseClasses: extraction.baseClasses,
          allCandidates: extraction.allCandidates,
          markers: [],
          composedFrom,
          classIndex: classIdx >= 0 ? classIdx : 0,
          classEnd: 0,
          attrStart: classIdx >= 0 ? classIdx : 0,
        },
      ];
    }

    parts.push({
      part,
      fileName: file.fileName,
      source: file.source,
      extraction,
      sites,
    });
    for (const c of extraction.allCandidates) all.add(c);
  }

  const primary =
    parts.find((p) => p.part === component) ??
    parts.find((p) => p.extraction.kind === "tv") ??
    parts[0];

  if (!primary) {
    throw new GeneratorError(
      `No convertible parts for ${component}`,
      EXIT.unsupported,
    );
  }

  return {
    component,
    parts,
    allCandidates: [...all].sort(),
    primaryAxes: primary.extraction.axes,
    primaryClassMaps: primary.extraction.classMaps,
    primaryBaseClasses: primary.extraction.baseClasses,
  };
}
