import { EXIT, GeneratorError } from "../errors.js";

export type VariantAxis = {
  prop: string;
  values: string[];
  defaultValue?: string;
};

export type TvExtraction = {
  baseClasses: string[];
  axes: VariantAxis[];
  classMaps: Record<string, Record<string, string>>;
  allCandidates: string[];
  sourceSnippet: string;
};

/** Split a class string on whitespace while preserving [...] arbitrary groups. */
export function splitCandidates(classString: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < classString.length; i++) {
    const ch = classString[i]!;
    if (quote) {
      current += ch;
      if (ch === quote && classString[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "[") {
      depth++;
      current += ch;
      continue;
    }
    if (ch === "]") {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }
    if (/\s/.test(ch) && depth === 0) {
      if (current) parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current) parts.push(current);
  return parts;
}

function extractBalancedObject(
  source: string,
  startIndex: number,
): { text: string; end: number } {
  let depth = 0;
  let inString: '"' | "'" | "`" | null = null;
  let escaped = false;
  for (let i = startIndex; i < source.length; i++) {
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
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return { text: source.slice(startIndex, i + 1), end: i + 1 };
      }
    }
  }
  throw new GeneratorError(
    "Unbalanced object while extracting tv() config",
    EXIT.unsupported,
  );
}

function joinStringLiterals(expression: string): string {
  return [...expression.matchAll(/["'`]((?:\\.|[^"'`\\])*)["'`]/g)]
    .map((m) => m[1]!.replace(/\\n/g, " ").replace(/\\"/g, '"'))
    .join(" ");
}

function extractStringProperties(objectText: string): Record<string, string> {
  const result: Record<string, string> = {};
  const body = objectText.trim().replace(/^\{/, "").replace(/\}$/, "");
  const re =
    /(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+))\s*:\s*((?:"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|(?:'(?:\\.|[^'\\])*'))(?:\s*\+\s*(?:"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|(?:'(?:\\.|[^'\\])*')))*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body))) {
    const key = match[1] || match[2] || match[3]!;
    result[key] = joinStringLiterals(match[4]!);
  }
  return result;
}

export function extractTvConfig(source: string): TvExtraction {
  if (/class=\{`[^`]*\$\{/.test(source) || /class:\s*`[^`]*\$\{/.test(source)) {
    throw new GeneratorError(
      "Unsupported dynamic class expression",
      EXIT.unsupported,
      "Tailwind candidates assembled from runtime values cannot be compiled safely.",
    );
  }

  const tvIndex = source.search(/\btv\s*\(/);
  if (tvIndex < 0) {
    throw new GeneratorError(
      "No tv() call found in component source",
      EXIT.unsupported,
    );
  }
  const openBrace = source.indexOf("{", tvIndex);
  if (openBrace < 0) {
    throw new GeneratorError("tv() config object not found", EXIT.unsupported);
  }
  const { text: configText } = extractBalancedObject(source, openBrace);

  const baseMatch = /base\s*:\s*((?:"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)+)/.exec(
    configText,
  );
  if (!baseMatch) {
    throw new GeneratorError("tv().base string not found", EXIT.unsupported);
  }
  const baseClasses = splitCandidates(joinStringLiterals(baseMatch[1]!));

  const variantsIndex = configText.search(/variants\s*:\s*\{/);
  if (variantsIndex < 0) {
    throw new GeneratorError("tv().variants not found", EXIT.unsupported);
  }
  const variantsOpen = configText.indexOf("{", variantsIndex);
  const { text: variantsText } = extractBalancedObject(
    configText,
    variantsOpen,
  );

  const classMaps: Record<string, Record<string, string>> = {};
  const axes: VariantAxis[] = [];
  const inner = variantsText.slice(1, -1);
  const axisBlockRe = /([A-Za-z0-9_]+)\s*:\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = axisBlockRe.exec(inner))) {
    const prop = m[1]!;
    const axisOpen = inner.indexOf("{", m.index);
    const { text: axisText, end } = extractBalancedObject(inner, axisOpen);
    const map = extractStringProperties(axisText);
    if (!Object.keys(map).length) {
      throw new GeneratorError(
        `No static variant values for axis "${prop}"`,
        EXIT.unsupported,
      );
    }
    classMaps[prop] = map;
    axes.push({ prop, values: Object.keys(map) });
    axisBlockRe.lastIndex = end;
  }

  const defaultsMatch = /defaultVariants\s*:\s*\{([^}]*)\}/.exec(configText);
  if (defaultsMatch) {
    const defRe = /([A-Za-z0-9_]+)\s*:\s*["']([^"']+)["']/g;
    let d: RegExpExecArray | null;
    while ((d = defRe.exec(defaultsMatch[1]!))) {
      const axis = axes.find((item) => item.prop === d![1]);
      if (axis) axis.defaultValue = d[2];
    }
  }

  const allCandidates = new Set<string>(baseClasses);
  for (const map of Object.values(classMaps)) {
    for (const classString of Object.values(map)) {
      for (const candidate of splitCandidates(classString)) {
        allCandidates.add(candidate);
      }
    }
  }

  return {
    baseClasses,
    axes,
    classMaps,
    allCandidates: [...allCandidates].sort(),
    sourceSnippet: configText,
  };
}
