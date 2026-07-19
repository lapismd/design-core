import postcss from "postcss";
import selectorParser, {
  type Attribute,
  type ClassName,
  type Node,
  type Selector,
} from "postcss-selector-parser";
import { splitCandidates } from "../analysis/variant-extractor.js";

export type CandidateOwnership = {
  candidate: string;
  selector: string;
};

/** Marker class (group/foo, peer) → semantic selector that owned it. */
export type MarkerOwnership = {
  marker: string;
  selector: string;
};

function parseSemanticNodes(semantic: string): Node[] {
  const nodes: Node[] = [];
  selectorParser((selectors) => {
    selectors.each((sel) => {
      sel.each((node) => {
        nodes.push(node.clone());
      });
    });
  }).processSync(semantic);
  return nodes;
}

function replaceClassesInSelector(
  selector: string,
  ownershipByCandidate: Map<string, string[]>,
): string[] {
  const results: string[] = [];

  selectorParser((selectors) => {
    selectors.each((sel: Selector) => {
      const classNodes: ClassName[] = [];
      sel.walkClasses((classNode) => {
        if (ownershipByCandidate.has(classNode.value)) {
          classNodes.push(classNode);
        }
      });
      if (!classNodes.length) return;

      for (const classNode of classNodes) {
        const semantics = ownershipByCandidate.get(classNode.value) ?? [];
        for (const semantic of semantics) {
          const clone = sel.clone() as Selector;
          clone.walkClasses((node) => {
            if (node.value !== classNode.value) return;
            const semanticNodes = parseSemanticNodes(semantic);
            if (!semanticNodes.length) return;
            let current: Node = node;
            const first = semanticNodes[0]!;
            node.replaceWith(first);
            current = first;
            for (const extra of semanticNodes.slice(1)) {
              current.parent?.insertAfter(current, extra);
              current = extra;
            }
          });
          results.push(clone.toString());
        }
      }
    });
  }).processSync(selector);

  return results;
}

/**
 * Remap compiled Tailwind CSS so each utility class becomes a semantic selector.
 * Ownership is applied per exact class token (no prefix matching).
 */
export function remapCompiledCss(
  compiledCss: string,
  ownership: CandidateOwnership[],
): string {
  const root = postcss.parse(compiledCss);
  const byCandidate = new Map<string, string[]>();
  for (const item of ownership) {
    const list = byCandidate.get(item.candidate) ?? [];
    if (!list.includes(item.selector)) list.push(item.selector);
    byCandidate.set(item.candidate, list);
  }

  root.walkRules((rule) => {
    const nextSelectors: string[] = [];
    for (const selector of rule.selectors) {
      nextSelectors.push(...replaceClassesInSelector(selector, byCandidate));
    }

    if (!nextSelectors.length) {
      rule.remove();
      return;
    }
    rule.selectors = [...new Set(nextSelectors)];
  });

  root.walkAtRules((atRule) => {
    if (!atRule.nodes || atRule.nodes.length === 0) atRule.remove();
  });

  return root.toString();
}

/**
 * Replace leftover `.group\/name` / `.peer` class selectors with the semantic
 * ownership selector for the element that declared the marker. Required because
 * marker classes emit no rules of their own but appear in compound selectors
 * (e.g. group-data-[size=default]/switch:size-4).
 */
export function remapMarkerSelectors(
  css: string,
  markers: MarkerOwnership[],
): string {
  if (!markers.length) return css;
  const byMarker = new Map<string, string>();
  for (const m of markers) {
    if (!byMarker.has(m.marker)) byMarker.set(m.marker, m.selector);
  }

  const root = postcss.parse(css);
  root.walkRules((rule) => {
    const out: string[] = [];
    for (const selector of rule.selectors) {
      let result = selector;
      selectorParser((selectors) => {
        selectors.each((sel: Selector) => {
          sel.walkClasses((classNode) => {
            const value = classNode.value.replace(/\\/g, "");
            const semantic = byMarker.get(value);
            if (!semantic) return;
            const semanticNodes = parseSemanticNodes(semantic);
            if (!semanticNodes.length) return;
            let current: Node = classNode;
            const first = semanticNodes[0]!;
            classNode.replaceWith(first);
            current = first;
            for (const extra of semanticNodes.slice(1)) {
              current.parent?.insertAfter(current, extra);
              current = extra;
            }
          });
          result = sel.toString();
        });
      }).processSync(selector);
      out.push(result);
    }
    rule.selectors = [...new Set(out)];
  });
  return root.toString();
}

export type PartOwnershipOptions = {
  /**
   * Composed hosts keep the child's `data-ui-component`. Selectors must beat the
   * child's base styles without requiring the parent family component attr.
   * Prefer `[data-ui-part][data-slot]` when a shared role slot is present.
   */
  composed?: boolean;
  dataSlot?: string | null;
};

/**
 * Map Tailwind candidates to semantic ownership selectors.
 * Root part may omit data-ui-part when part === component; variant axes become data-* attrs.
 */
export function buildPartOwnership(
  component: string,
  part: string,
  baseClasses: string[],
  classMaps: Record<string, Record<string, string>>,
  options: PartOwnershipOptions = {},
): CandidateOwnership[] {
  const ownership: CandidateOwnership[] = [];
  // Always include data-ui-part so root utilities (e.g. w-full) do not match child parts
  // that also carry data-ui-component.
  const root = options.composed
    ? options.dataSlot
      ? `[data-ui-part="${part}"][data-slot="${options.dataSlot}"]`
      : `[data-ui-part="${part}"]`
    : `[data-ui-component="${component}"][data-ui-part="${part}"]`;

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

/** @deprecated Prefer buildPartOwnership */
export function buildButtonOwnership(
  component: string,
  baseClasses: string[],
  classMaps: Record<string, Record<string, string>>,
): CandidateOwnership[] {
  return buildPartOwnership(component, component, baseClasses, classMaps);
}
