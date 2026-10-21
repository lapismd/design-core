// Adapted from jj-store 2a479c74; Apache-2.0, LapisMD contributors.
import { defineMiraExtension } from "@lapismd/mira/extensions";
import PromptElement from "./PromptElement.svelte";
import "./prompt-context.css";
import {
  PROMPT_ELEMENT_MARKER,
  remarkPromptElements,
} from "./remark-prompt-elements.js";
type Node = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

// The marker uses safe div/title through Mira sanitization. Only afterwards
// does the application select its compiled component; source attributes stay text.
function rehypePromptElements() {
  return (tree: Node) => {
    function visit(node: Node) {
      const title = node.properties?.title;
      if (
        node.tagName === "div" &&
        typeof title === "string" &&
        title.startsWith(PROMPT_ELEMENT_MARKER)
      ) {
        try {
          const presentation = JSON.parse(
            title.slice(PROMPT_ELEMENT_MARKER.length),
          );
          if (
            typeof presentation.label !== "string" ||
            typeof presentation.compact !== "boolean" ||
            (presentation.closing !== undefined &&
              typeof presentation.closing !== "string")
          )
            return;
          node.tagName = "sharedpromptelement";
          node.properties = {
            label: presentation.label,
            closing: presentation.closing,
            compact: presentation.compact,
          };
        } catch {
          /* Malformed internal metadata stays ordinary safe markup. */
        }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
    // Give only root prose the tag-label inset. Nested Markdown already lives
    // inside PromptElement's indented body and must not receive another inset.
    if (tree.children)
      tree.children = tree.children.map((node) =>
        node.type === "element" && node.tagName !== "sharedpromptelement"
          ? {
              type: "element",
              tagName: "div",
              properties: { className: ["ui-prompt-context-root-text"] },
              children: [node],
            }
          : node,
      );
  };
}

export const promptElementsExtension = defineMiraExtension({
  name: "agent-prompt-elements",
  remarkPlugins: [remarkPromptElements],
  rehypePlugins: [rehypePromptElements],
  components: { sharedpromptelement: PromptElement },
});
