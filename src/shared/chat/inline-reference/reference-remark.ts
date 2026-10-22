import { chatReferenceRanges } from "./reference-ranges.js";
import { referenceLinkPrefix } from "./reference-preview.js";
import type { ChatReferenceOptions } from "./inline-reference.types.js";
type Node = {
  type: string;
  value?: string;
  name?: string;
  url?: string;
  attributes?: Record<string, unknown>;
  children?: Node[];
  data?: Record<string, unknown>;
};
const marker = (source: string) =>
  `${referenceLinkPrefix}${encodeURIComponent(source)}`;
/** Preserve registered tokens even when Markdown directive parsing split a colon-prefixed identity. */
export function protectChatReferences(
  tree: Node,
  options: ChatReferenceOptions,
): void {
  const visit = (node: Node): void => {
    if (["code", "inlineCode", "image", "html"].includes(node.type)) return;
    if (node.type === "link" && node.url && options.resolve(node.url))
      node.data = {
        ...node.data,
        hName: "a",
        hProperties: { href: marker(node.url) },
      };
    if (!node.children) return;
    const result: Node[] = [];
    for (let index = 0; index < node.children.length; ) {
      const segments: { node: Node; text: string; from: number; to: number }[] =
        [];
      let text = "";
      while (index < node.children.length) {
        const child = node.children[index]!;
        const value =
          child.type === "text"
            ? child.value
            : child.type === "textDirective" &&
                child.name &&
                !child.children?.length &&
                !Object.keys(child.attributes ?? {}).length
              ? `:${child.name}`
              : undefined;
        if (value === undefined) break;
        segments.push({
          node: child,
          text: value,
          from: text.length,
          to: text.length + value.length,
        });
        text += value;
        index++;
      }
      if (segments.length) {
        const matches = chatReferenceRanges(text, {
          ...options,
          resolve: () => undefined,
        });
        const retain = (from: number, to: number) => {
          for (const segment of segments) {
            if (segment.to <= from || segment.from >= to) continue;
            result.push(
              from <= segment.from && to >= segment.to
                ? segment.node
                : {
                    type: "text",
                    value: segment.text.slice(
                      Math.max(0, from - segment.from),
                      Math.min(segment.text.length, to - segment.from),
                    ),
                  },
            );
          }
        };
        let end = 0;
        for (const match of matches) {
          retain(end, match.from);
          const href = marker(text.slice(match.from, match.to));
          result.push({
            type: "link",
            url: href,
            data: { hName: "a", hProperties: { href } },
            children: [{ type: "text", value: match.reference.label }],
          });
          end = match.to;
        }
        retain(end, text.length);
      }
      if (index < node.children.length) {
        const child = node.children[index++]!;
        visit(child);
        result.push(child);
      }
    }
    node.children = result;
  };
  visit(tree);
}
