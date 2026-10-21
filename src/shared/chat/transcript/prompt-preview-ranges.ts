import { parser } from "@lezer/markdown";
import {
  maskPromptTags,
  matchPromptElements,
  outsideRanges,
  promptTags,
  type SourceRange,
} from "../prompt-context/prompt-element-ranges.js";

/** Reuse the inert prompt parser; code, malformed and inline examples stay source. */
export function promptPreviewRanges(text: string) {
  const tags = promptTags(text);
  if (!tags.length) return [];
  const ignored: SourceRange[] = [];
  parser.parse(maskPromptTags(text, tags)).iterate({
    enter(node) {
      if (
        [
          "InlineCode",
          "FencedCode",
          "CodeBlock",
          "CommentBlock",
          "ProcessingInstruction",
        ].includes(node.name) ||
        (node.name === "HTMLBlock" && /^<(?:!|\?)/.test(text.slice(node.from)))
      ) {
        ignored.push({ start: node.from, end: node.to });
        return false;
      }
    },
  });
  return matchPromptElements(outsideRanges(tags, ignored)).flatMap(
    (element) => {
      const from = text.lastIndexOf("\n", element.open.start - 1) + 1;
      const close = element.close?.end ?? element.open.end;
      const newline = text.indexOf("\n", close);
      const to = newline < 0 ? text.length : newline;
      return text.slice(from, element.open.start).trim() ||
        text.slice(close, to).trim()
        ? []
        : [{ from, to }];
    },
  );
}
