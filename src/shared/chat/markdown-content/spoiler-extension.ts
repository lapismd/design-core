import { defineMiraExtension } from "@lapismd/mira/extensions";
import Spoiler from "../../shadcn/spoiler/Spoiler.svelte";
export type SpoilerNode = {
  type?: string;
  tagName?: string;
  value?: string;
  children?: SpoilerNode[];
  properties?: Record<string, unknown>;
};
/** Post-parse presentation only; source strings and captured offsets are unchanged. */
export function renderSpoilerNodes(tree: SpoilerNode): void {
  const visit = (node: SpoilerNode): void => {
    if (
      ["code", "pre", "script", "style", "button"].includes(node.tagName ?? "")
    )
      return;
    const children: SpoilerNode[] = [];
    for (const child of node.children ?? []) {
      if (child.type !== "text" || !child.value) {
        visit(child);
        children.push(child);
        continue;
      }
      let end = 0;
      for (const match of child.value.matchAll(/\|\|([^|\n]+)\|\|/gu)) {
        const index = match.index!;
        if (index > end)
          children.push({ type: "text", value: child.value.slice(end, index) });
        children.push({
          type: "element",
          tagName: "sharedspoiler",
          properties: { label: "Spoiler" },
          children: [{ type: "text", value: match[1]! }],
        });
        end = index + match[0].length;
      }
      if (end < child.value.length)
        children.push({ type: "text", value: child.value.slice(end) });
    }
    if (node.children) node.children = children;
  };
  visit(tree);
}
export const spoilerExtension = defineMiraExtension({
  name: "shared-spoilers",
  rehypePlugins: [() => renderSpoilerNodes],
  components: { sharedspoiler: Spoiler },
});
