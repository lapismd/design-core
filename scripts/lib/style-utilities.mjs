import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { isTailwindUtility } from "./tailwind-utility.mjs";

export function utilitySelectors(css, file = "stylesheet") {
  const findings = [];
  postcss.parse(css, { from: file }).walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkClasses((node) => {
        if (isTailwindUtility(node.value)) {
          findings.push({
            file,
            line: rule.source.start.line,
            token: node.value,
          });
        }
      });
    }).processSync(rule.selector);
  });
  return findings;
}

export function assertNoUtilitySelectors(css, file = "stylesheet") {
  const findings = utilitySelectors(css, file);
  if (findings.length) {
    const first = findings[0];
    throw new Error(
      `${first.file}:${first.line}: Tailwind utility selector .${first.token} (${findings.length} references)`,
    );
  }
}
