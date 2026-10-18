import { parser, Table } from "@lezer/markdown";
import type { TranscriptBlock } from "./model.js";
import type { TranscriptController } from "./comments.svelte.js";

export const richSourceContext = Symbol("transcript-rich-source");
export type RichSourceContext = {
  block: TranscriptBlock;
  comments: TranscriptController;
};
export function richBlockRanges(text: string) {
  const ranges: { from: number; to: number }[] = [];
  parser
    .configure([Table])
    .parse(text)
    .iterate({
      enter(node) {
        if (
          node.name === "Table" ||
          (node.name === "FencedCode" &&
            node.node.getChildren("CodeMark").length === 2)
        ) {
          ranges.push({ from: node.from, to: node.to });
          return false;
        }
      },
    });
  return ranges;
}
type Node = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

/** Associate rendered cells/code with parser offsets, never by searching repeated text. */
export function richSourceExtension(text: string, offset: number) {
  const cells: { from: number; to: number }[] = [];
  let code: { from: number; to: number; language: string } | undefined;
  parser
    .configure([Table])
    .parse(text)
    .iterate({
      enter(node) {
        if (node.name === "TableCell")
          cells.push({ from: offset + node.from, to: offset + node.to });
        if (node.name === "FencedCode") {
          const body = node.node.getChild("CodeText");
          const info = node.node.getChild("CodeInfo");
          const start = body?.from ?? text.indexOf("\n", node.from) + 1;
          code = {
            from: offset + start,
            to: offset + (body?.to ?? start),
            language: info
              ? text.slice(info.from, info.to).trim().split(/\s/)[0]!
              : "text",
          };
          return false;
        }
      },
    });
  return {
    name: "transcript-source-ranges",
    rehypePlugins: [
      () => (tree: Node) => {
        const renderedCells: Node[] = [];
        const count = (node: Node) => {
          if (node.tagName === "td" || node.tagName === "th")
            renderedCells.push(node);
          node.children?.forEach(count);
        };
        count(tree);
        let index = 0;
        const visit = (node: Node) => {
          const range =
            node.tagName === "code"
              ? code
              : (node.tagName === "td" || node.tagName === "th") &&
                  renderedCells.length === cells.length
                ? cells[index++]
                : undefined;
          if (range)
            node.properties = {
              ...node.properties,
              "data-transcript-from": range.from,
              "data-transcript-to": range.to,
              ...(node.tagName === "code" && code
                ? { "data-transcript-language": code.language }
                : {}),
            };
          node.children?.forEach(visit);
        };
        visit(tree);
      },
    ],
  };
}
