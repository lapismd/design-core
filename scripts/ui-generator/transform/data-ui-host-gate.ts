/**
 * Post-emit gate: refuse parent `data-ui-component` on composed foreign hosts.
 */

import { composedFamilyFromTag } from "../analysis/style-sites.js";

export type ComposedHostOverride = {
  tag: string;
  composedFrom: string;
  parentComponent: string;
  snippet: string;
};

/**
 * Find `<Input data-ui-component="input-group">`-style stamps where the tag is
 * imported from a foreign family.
 */
export function findComposedHostParentComponents(
  source: string,
  parentComponent: string,
): ComposedHostOverride[] {
  const out: ComposedHostOverride[] = [];
  const tagRe = /<([A-Z][A-Za-z0-9]*)(\s[^>]*?)>/g;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(source))) {
    const tag = match[1]!;
    const attrs = match[2] ?? "";
    const comp = attrs.match(/\bdata-ui-component=(["'])([^"']*)\1/)?.[2];
    if (!comp || comp !== parentComponent) continue;

    const probeIndex = match.index + match[0].length - 1;
    const composedFrom = composedFamilyFromTag(source, probeIndex);
    if (!composedFrom || composedFrom === parentComponent) continue;

    out.push({
      tag,
      composedFrom,
      parentComponent,
      snippet: match[0]!.slice(0, 120),
    });
  }
  return out;
}

/**
 * Move `{...restProps}` before locked `data-ui-component` on the same opening tag
 * so later-wins does not let consumers overwrite host identity.
 */
export function emitLockedDataUiAttrOrder(source: string): string {
  const openTagRe = /<([a-z][\w-]*)(\s[^>]*?)(\/?)>/g;
  return source.replace(
    openTagRe,
    (full, tag: string, attrs: string, selfClose: string) => {
      if (!/\bdata-ui-component=/.test(attrs)) return full;
      if (!/\{\.\.\.restProps\}/.test(attrs)) return full;

      // Already locked: rest spread appears before data-ui-component
      const restIdx = attrs.indexOf("{...restProps}");
      const compIdx = attrs.search(/\bdata-ui-component=/);
      if (restIdx >= 0 && restIdx < compIdx) return full;

      const withoutRest = attrs.replace(/\s*\{\.\.\.restProps\}/, "");
      const beforeComp = withoutRest.search(/\bdata-ui-component=/);
      if (beforeComp < 0) return full;
      const locked =
        withoutRest.slice(0, beforeComp) +
        "{...restProps}\n  " +
        withoutRest.slice(beforeComp).replace(/^\s*/, "");
      return `<${tag}${locked}${selfClose}>`;
    },
  );
}
