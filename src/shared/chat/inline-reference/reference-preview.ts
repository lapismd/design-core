import type { ChatReferenceOptions } from "./inline-reference.types.js";
import { chatReferenceRanges } from "./reference-ranges.js";
export const referenceLinkPrefix = "#chat-reference:";
type Node = {
  type: string;
  tagName?: string;
  value?: string;
  children?: Node[];
  properties?: Record<string, unknown>;
};
/** Each preview fragment resolves its own text; table cells/quotes must never reuse document offsets. */
export function renderChatReferences(
  tree: Node,
  options: ChatReferenceOptions,
): void {
  const make = (source: string): Node => ({
    type: "element",
    tagName: "sharedchatreference",
    properties: { referenceSource: source },
    children: [],
  });
  const visit = (node: Node): void => {
    if (
      !node.children ||
      ["code", "pre", "script", "style", "a"].includes(node.tagName ?? "")
    )
      return;
    node.children = node.children.flatMap((child) => {
      const href = child.properties?.href;
      if (
        child.tagName === "a" &&
        typeof href === "string" &&
        href.startsWith(referenceLinkPrefix)
      ) {
        let destination: string | undefined;
        try {
          destination = decodeURIComponent(
            href.slice(referenceLinkPrefix.length),
          );
        } catch {
          /* Keep an unrecognized literal link unchanged. */
        }
        if (
          destination &&
          (options.resolve(destination) ||
            chatReferenceRanges(destination, options).some(
              (match) => match.from === 0 && match.to === destination.length,
            ))
        )
          return [make(destination)];
      }
      if (child.type !== "text" || !child.value) {
        visit(child);
        return [child];
      }
      const matches = chatReferenceRanges(child.value, {
        ...options,
        resolve: () => undefined,
      });
      if (!matches.length) return [child];
      const result: Node[] = [];
      let end = 0;
      for (const match of matches) {
        if (match.from > end)
          result.push({
            type: "text",
            value: child.value.slice(end, match.from),
          });
        result.push(make(child.value.slice(match.from, match.to)));
        end = match.to;
      }
      if (end < child.value.length)
        result.push({ type: "text", value: child.value.slice(end) });
      return result;
    });
  };
  visit(tree);
}
