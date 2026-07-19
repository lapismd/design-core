import { EXIT, GeneratorError } from "../errors.js";
import { splitCandidates } from "./variant-extractor.js";

export type StyleSiteKind = "cn" | "static" | "classLit";

export type StyleSite = {
  /** Ownership part name (data-slot value or synthetic). */
  part: string;
  dataSlot: string | null;
  kind: StyleSiteKind;
  baseClasses: string[];
  allCandidates: string[];
  markers: string[];
  /**
   * When the styled host is another converted family (e.g. `<Input>` from
   * `../input`), the imported family name. Ownership must not override that
   * family's `data-ui-component` or its base styles (outline-none, focus ring)
   * are lost.
   */
  composedFrom: string | null;
  /** Index of `class=` / `class={` in source. */
  classIndex: number;
  /** End index of the class attribute value expression/string. */
  classEnd: number;
  /** Full class attribute match start (includes `class=`). */
  attrStart: number;
};

const UTILITY_HINT =
  /\b(flex|inline-flex|grid|bg-|text-|border-|rounded-|h-\d|w-|px-|py-|gap-|shadow-|animate-|size-\d|shrink-0|items-|justify-|overflow-|ring-|outline-|font-|leading-|tracking-|whitespace-|min-w-|max-w-|opacity-|pointer-events-|cursor-|transition-|absolute|relative|fixed|sticky|inset-|top-|right-|bottom-|left-|z-|p-\d|m-\d|dark:|data-\[|aria-|focus-visible:|hover:|disabled:|placeholder:|file:|peer|group)/;

export function isMarkerCandidate(candidate: string): boolean {
  return (
    candidate === "group" ||
    candidate.startsWith("group/") ||
    candidate === "peer" ||
    candidate.startsWith("peer/") ||
    /^cn-[a-z0-9-]+$/i.test(candidate)
  );
}

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

function openingTagRange(
  source: string,
  classIndex: number,
): { start: number; end: number } | null {
  const tagStart = source.lastIndexOf("<", classIndex);
  if (tagStart < 0) return null;
  // Find end of opening tag (not inside quotes)
  let inString: '"' | "'" | null = null;
  for (let i = tagStart + 1; i < source.length; i++) {
    const ch = source[i]!;
    if (inString) {
      if (ch === inString && source[i - 1] !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === ">") return { start: tagStart, end: i + 1 };
  }
  return null;
}

/** data-slot anywhere on the same opening tag (before or after class=). */
function dataSlotOnSameTag(source: string, classIndex: number): string | null {
  const range = openingTagRange(source, classIndex);
  if (!range) return null;
  if (classIndex < range.start || classIndex >= range.end) return null;
  const tag = source.slice(range.start, range.end);
  const m = /data-slot=(?:"([^"]*)"|'([^']*)')/.exec(tag);
  return m?.[1] ?? m?.[2] ?? null;
}

function tagLeafName(source: string, classIndex: number): string | null {
  const tagStart = source.lastIndexOf("<", classIndex);
  if (tagStart < 0) return null;
  const m = /^<\/?([A-Za-z][\w.]*)/.exec(source.slice(tagStart));
  if (!m) return null;
  const raw = m[1]!;
  const leaf = raw.includes(".") ? raw.split(".").pop()! : raw;
  return leaf.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * If the opening tag is a local family import (`import { Input } from "../input"`),
 * return that family name. Bits primitives and HTML tags return null.
 */
export function composedFamilyFromTag(
  source: string,
  classIndex: number,
): string | null {
  const tagStart = source.lastIndexOf("<", classIndex);
  if (tagStart < 0) return null;
  // Only bare component tags: <Input>, not <SwitchPrimitive.Root> / <div>
  const m = /^<([A-Z][A-Za-z0-9]*)[\s/>]/.exec(source.slice(tagStart));
  if (!m) return null;
  const name = m[1]!;
  const importRe = new RegExp(
    `import\\s*\\{([^}]*)\\}\\s*from\\s*["']\\.\\./([a-z][a-z0-9-]*)(?:/index\\.js)?["']`,
    "g",
  );
  let match: RegExpExecArray | null;
  while ((match = importRe.exec(source))) {
    const names = match[1]!;
    const family = match[2]!;
    const imported = names.split(",").some((part) => {
      const bits = part.trim().split(/\s+as\s+/);
      const local = (bits[1] ?? bits[0] ?? "").trim();
      return local === name;
    });
    if (imported) return family;
  }
  return null;
}

function synthesizePart(
  component: string,
  filePart: string,
  source: string,
  classIndex: number,
  anonIndex: number,
): string {
  const leaf = tagLeafName(source, classIndex);
  if (leaf && leaf !== "div" && leaf !== "span" && leaf !== "button") {
    const candidate = `${component}-${leaf}`;
    if (candidate !== filePart) return candidate;
  }
  return `${filePart}-anon-${anonIndex}`;
}

function partitionCandidates(classes: string[]): {
  baseClasses: string[];
  markers: string[];
  allCandidates: string[];
} {
  const allCandidates = [...new Set(classes)];
  const markers = allCandidates.filter(isMarkerCandidate);
  const baseClasses = allCandidates.filter((c) => !isMarkerCandidate(c));
  return { baseClasses, markers, allCandidates };
}

/**
 * Locate each styled element in a Svelte source file and assign ownership parts.
 * Part names prefer same-tag `data-slot`; otherwise a synthetic name is used.
 */
export function extractStyleSites(
  source: string,
  component: string,
  filePart: string,
): StyleSite[] {
  const sites: StyleSite[] = [];
  const usedParts = new Set<string>();
  let anonIndex = 0;

  const pushSite = (
    partial: Omit<StyleSite, "part" | "composedFrom"> & {
      partHint: string | null;
    },
  ) => {
    const composedFrom = composedFamilyFromTag(source, partial.classIndex);
    // Shared role slots (e.g. input-group-control) are for :has() matching across
    // files — ownership parts stay file-specific so CSS can target each wrapper.
    let part = partial.partHint;
    if (
      composedFrom ||
      (part &&
        part !== filePart &&
        part.endsWith("-control") &&
        !part.startsWith(`${filePart}-`))
    ) {
      part = filePart;
    }
    if (!part || usedParts.has(part)) {
      // Prefer the file part for the primary host when the tag has no data-slot
      // (e.g. input-group-text is a bare <span>).
      if (!usedParts.has(filePart)) {
        part = filePart;
      } else {
        part = synthesizePart(
          component,
          filePart,
          source,
          partial.classIndex,
          anonIndex++,
        );
        while (usedParts.has(part)) {
          part = `${filePart}-anon-${anonIndex++}`;
        }
      }
    }
    usedParts.add(part);
    sites.push({
      part,
      dataSlot: partial.dataSlot,
      kind: partial.kind,
      baseClasses: partial.baseClasses,
      allCandidates: partial.allCandidates,
      markers: partial.markers,
      composedFrom,
      classIndex: partial.classIndex,
      classEnd: partial.classEnd,
      attrStart: partial.attrStart,
    });
  };

  // class={cn(...)}
  const needle = "class={cn(";
  let from = 0;
  while (from < source.length) {
    const start = source.indexOf(needle, from);
    if (start < 0) break;
    const paren = start + "class={cn".length; // '('
    const { end: callEnd } = extractBalancedCall(source, paren);
    if (source[callEnd] !== "}") {
      from = start + needle.length;
      continue;
    }
    const classEnd = callEnd + 1;
    const inner = source.slice(paren + 1, callEnd - 1);
    if (/\$\{/.test(inner) && /`/.test(inner)) {
      throw new GeneratorError(
        "Unsupported dynamic cn() argument",
        EXIT.unsupported,
      );
    }
    const joined = joinStringLiterals(inner);
    const classes = joined.trim() ? splitCandidates(joined) : [];
    if (!classes.length) {
      from = classEnd;
      continue;
    }
    const partitioned = partitionCandidates(classes);
    const slot = dataSlotOnSameTag(source, start);
    pushSite({
      partHint: slot,
      dataSlot: slot,
      kind: "cn",
      ...partitioned,
      classIndex: start,
      classEnd,
      attrStart: start,
    });
    from = classEnd;
  }

  // class={"..."} / class={'...'} / class={`...`} without cn
  const classLitRe = /class=\{(["'`])((?:\\.|(?!\1)[^\\])*)\1\}/g;
  let lit: RegExpExecArray | null;
  while ((lit = classLitRe.exec(source))) {
    const full = lit[0]!;
    // Skip if this is part of class={cn(...)} — those start with class={cn
    if (source.slice(lit.index, lit.index + 10).startsWith("class={cn")) continue;
    const classes = splitCandidates(lit[2]!);
    if (!classes.some((c) => UTILITY_HINT.test(c) || isMarkerCandidate(c))) {
      continue;
    }
    const partitioned = partitionCandidates(classes);
    const slot = dataSlotOnSameTag(source, lit.index);
    pushSite({
      partHint: slot,
      dataSlot: slot,
      kind: "classLit",
      ...partitioned,
      classIndex: lit.index,
      classEnd: lit.index + full.length,
      attrStart: lit.index,
    });
  }

  // Static class="..."
  const staticRe = /class="([^"]*)"/g;
  let st: RegExpExecArray | null;
  while ((st = staticRe.exec(source))) {
    const classes = splitCandidates(st[1]!);
    if (!classes.some((c) => UTILITY_HINT.test(c))) continue;
    // Ignore if already covered by a cn/classLit site at same index
    if (sites.some((s) => s.attrStart === st!.index)) continue;
    const partitioned = partitionCandidates(classes);
    if (!partitioned.baseClasses.length && !partitioned.markers.length) continue;
    const slot = dataSlotOnSameTag(source, st.index);
    pushSite({
      partHint: slot,
      dataSlot: slot,
      kind: "static",
      ...partitioned,
      classIndex: st.index,
      classEnd: st.index + st[0]!.length,
      attrStart: st.index,
    });
  }

  sites.sort((a, b) => a.attrStart - b.attrStart);
  return sites;
}

export function mergeSitesToExtraction(sites: StyleSite[]): {
  baseClasses: string[];
  allCandidates: string[];
  markers: string[];
} {
  const baseClasses = [...new Set(sites.flatMap((s) => s.baseClasses))];
  const markers = [...new Set(sites.flatMap((s) => s.markers))];
  const allCandidates = [...new Set([...baseClasses, ...markers])].sort();
  return { baseClasses, allCandidates, markers };
}
