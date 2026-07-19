import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

export type CandidateOwnership = {
  candidate: string;
  selector: string;
};

function cssEscapeClass(candidate: string): string {
  // Approximate Tailwind's escaping for matching in selectors
  return candidate.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

function replaceClassInSelector(
  selector: string,
  candidate: string,
  replacement: string,
): string | null {
  let replaced = false;
  const escaped = cssEscapeClass(candidate);
  const processor = selectorParser((selectors) => {
    selectors.walkClasses((classNode) => {
      const value = classNode.value;
      // postcss-selector-parser gives unescaped value
      if (value === candidate || classNode.toString() === `.${escaped}`) {
        classNode.replaceWith(selectorParser.attribute({
          attribute: replacement.replace(/^\[/, "").replace(/\]$/, ""),
          quoteMark: '"',
          // For complex replacements like [data-ui-component="button"][data-variant="x"]
          // we inject as a raw selector fragment instead.
        } as never));
        replaced = true;
      }
    });
  });

  // Simpler string approach for reliability with complex replacements
  const patterns = [
    `.${escaped}`,
    `.${candidate.replace(/:/g, "\\:")}`,
  ];
  let next = selector;
  for (const pattern of patterns) {
    if (next.includes(pattern)) {
      next = next.split(pattern).join(replacement);
      replaced = true;
    }
  }
  // Also try matching unescaped in case minify differs
  if (!replaced && next.includes(candidate)) {
    // last resort: replace .candidate forms using regex
    const re = new RegExp(
      `\\.${candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      "g",
    );
    if (re.test(next)) {
      next = next.replace(re, replacement);
      replaced = true;
    }
  }

  void processor;
  return replaced ? next : null;
}

/**
 * Remap compiled Tailwind CSS so each utility class becomes a semantic selector.
 */
export function remapCompiledCss(
  compiledCss: string,
  ownership: CandidateOwnership[],
): string {
  const root = postcss.parse(compiledCss);
  const byCandidate = new Map(
    ownership.map((item) => [item.candidate, item.selector]),
  );

  root.walkRules((rule) => {
    const selectors = rule.selectors.flatMap((selector) => {
      const replacements: string[] = [];
      for (const [candidate, semantic] of byCandidate) {
        const next = replaceClassInSelector(selector, candidate, semantic);
        if (next) replacements.push(next);
      }
      return replacements.length ? replacements : [];
    });

    if (!selectors.length) {
      rule.remove();
      return;
    }
    rule.selectors = [...new Set(selectors)];
  });

  // Drop empty at-rules
  root.walkAtRules((atRule) => {
    if (!atRule.nodes || atRule.nodes.length === 0) atRule.remove();
  });

  return root.toString();
}

export function buildButtonOwnership(
  component: string,
  baseClasses: string[],
  classMaps: Record<string, Record<string, string>>,
): CandidateOwnership[] {
  const ownership: CandidateOwnership[] = [];
  const root = `[data-ui-component="${component}"]`;

  for (const candidate of baseClasses) {
    ownership.push({ candidate, selector: root });
  }

  for (const [prop, map] of Object.entries(classMaps)) {
    for (const [value, classString] of Object.entries(map)) {
      const semantic = `${root}[data-${prop}="${value}"]`;
      for (const candidate of classString.split(/\s+/).filter(Boolean)) {
        ownership.push({ candidate, selector: semantic });
      }
    }
  }

  return ownership;
}
