import { parser, Table } from "@lezer/markdown";
import type { TranscriptCommentAnchor } from "./model.js";

export function tableSources(text: string) {
  const tables: {
    from: number;
    to: number;
    rows: { from: number; to: number; cells: { from: number; to: number }[] }[];
  }[] = [];
  parser
    .configure([Table])
    .parse(text)
    .iterate({
      enter(node) {
        if (node.name !== "Table") return;
        const rows = [];
        for (let row = node.node.firstChild; row; row = row.nextSibling) {
          if (row.name !== "TableHeader" && row.name !== "TableRow") continue;
          rows.push({
            from: row.from,
            to: row.to,
            cells: row
              .getChildren("TableCell")
              .map((cell) => ({ from: cell.from, to: cell.to })),
          });
        }
        tables.push({ from: node.from, to: node.to, rows });
        return false;
      },
    });
  return tables;
}

/** Snapshot a complete source row; selected UTF-16 offsets remain separate. */
export function tableRowContext(
  text: string,
  from: number,
  to: number,
): TranscriptCommentAnchor["tableContext"] {
  for (const table of tableSources(text)) {
    const row = table.rows.find((row) => from >= row.from && to <= row.to);
    const header = table.rows[0];
    if (!row || !header) continue;
    const delimiterStart = text.indexOf("\n", header.to) + 1;
    const delimiterEnd = text.indexOf("\n", delimiterStart);
    const prefix = text.slice(
      header.from,
      delimiterEnd < 0 ? table.to : delimiterEnd,
    );
    const markdown =
      row === header ? prefix : prefix + "\n" + text.slice(row.from, row.to);
    const offset = row === header ? -row.from : prefix.length + 1 - row.from;
    return { markdown, from: from + offset, to: to + offset };
  }
}
