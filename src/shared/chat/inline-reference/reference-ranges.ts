// Adapted from jj-store composer entity/reference decorations (Apache-2.0).
import { parser } from "@lezer/markdown";
import type {
  ChatReferenceMatch,
  ChatReferenceOptions,
} from "./inline-reference.types.js";
/** Find registered references without interpreting code, images, or link labels as tokens. */
export function chatReferenceRanges(
  text: string,
  options: ChatReferenceOptions,
): ChatReferenceMatch[] {
  const ranges: ChatReferenceMatch[] = [],
    excluded: { from: number; to: number }[] = [];
  parser.parse(text).iterate({
    enter(node) {
      if (
        ["FencedCode", "CodeBlock", "InlineCode", "Image"].includes(node.name)
      ) {
        excluded.push({ from: node.from, to: node.to });
        return false;
      }
      if (node.name !== "Link" && node.name !== "Autolink") return;
      excluded.push({ from: node.from, to: node.to });
      const url = node.node.getChild("URL");
      if (url) {
        const reference = options.resolve(text.slice(url.from, url.to));
        if (reference) ranges.push({ from: node.from, to: node.to, reference });
      }
      return false;
    },
  });
  for (const match of options.matches?.(text) ?? []) {
    if (
      !Number.isInteger(match.from) ||
      !Number.isInteger(match.to) ||
      match.from < 0 ||
      match.to <= match.from ||
      match.to > text.length
    )
      continue;
    if (
      [...excluded, ...ranges].some(
        (range) => match.from < range.to && match.to > range.from,
      )
    )
      continue;
    ranges.push(match);
  }
  return ranges.sort((a, b) => a.from - b.from);
}
/** Markdown remains the default wire format; labels/destinations are escaped. */
export function serializeChatReference(
  reference: import("./inline-reference.types.js").ChatReference,
  options: ChatReferenceOptions,
): string {
  if (options.serialize) return options.serialize(reference);
  if (!reference.href) return reference.label;
  const label = reference.label.replace(/[\\[\]]/g, "\\$&");
  const href = reference.href.replace(/[\\()\s<>]/g, (value) =>
    encodeURIComponent(value),
  );
  return `[${label}](${href})`;
}
