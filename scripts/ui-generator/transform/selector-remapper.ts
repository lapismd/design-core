import postcss from "postcss";
import { splitCandidates } from "../analysis/variant-extractor.js";

export type CandidateOwnership = {
  candidate: string;
  selector: string;
};

function cssEscapeClass(candidate: string): string {
  return candidate.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

function replaceClassInSelector(
  selector: string,
  candidate: string,
  replacement: string,
): string | null {
  const escaped = cssEscapeClass(candidate);
  const patterns = [`.${escaped}`];

  let next = selector;
  let replaced = false;
  for (const pattern of patterns) {
    if (next.includes(pattern)) {
      next = next.split(pattern).join(replacement);
      replaced = true;
    }
  }

  if (!replaced) {
    const re = new RegExp(
      `\\.${candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      "g",
    );
    if (re.test(selector)) {
      next = selector.replace(re, replacement);
      replaced = true;
    }
  }

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
      for (const candidate of splitCandidates(classString)) {
        ownership.push({ candidate, selector: semantic });
      }
    }
  }

  return ownership;
}
