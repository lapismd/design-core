import type {
  CanvasTableCommand,
  CanvasTableRow,
} from "./canvas-table-types.js";

export function demoRows(count: number): CanvasTableRow[] {
  return [
    { id: "header", cells: ["Name", "Status", "Notes"] },
    ...Array.from({ length: count }, (_, index) => ({
      id: "row-" + (index + 1),
      cells: [
        "Record " + (index + 1),
        index % 2 === 0 ? "Open" : "Closed",
        index === 0
          ? "A longer note that wraps across several lines when the column is narrow."
          : "Notes " + (index + 1),
      ],
    })),
  ];
}

export function demoCommand(
  rows: readonly CanvasTableRow[],
  command: CanvasTableCommand,
): CanvasTableRow[] {
  const next = rows.map((row) => ({ ...row, cells: [...row.cells] }));
  const index = next.findIndex((row) => row.id === command.rowId);
  const col = command.column;
  if (index < 0) return next;
  if (command.target === "sheet") {
    if (command.id === "delete") return [];
    return next.map((row) => ({ ...row, cells: row.cells.map(() => "") }));
  }
  if (command.target === "cell") next[index]!.cells[col] = "";
  else if (command.id === "clear") {
    if (command.target === "row") next[index]!.cells.fill("");
    else
      next.forEach((row) => {
        row.cells[col] = "";
      });
  } else if (command.id === "delete") {
    if (command.target === "row") next.splice(index, 1);
    else next.forEach((row) => row.cells.splice(col, 1));
  } else if (command.target === "row") {
    const to = index + (command.id === "move-up" ? -1 : 1);
    if (to >= 0 && to < next.length)
      next.splice(to, 0, ...next.splice(index, 1));
  } else {
    const to = col + (command.id === "move-left" ? -1 : 1);
    next.forEach((row) => {
      if (to >= 0 && to < row.cells.length)
        row.cells.splice(to, 0, ...row.cells.splice(col, 1));
    });
  }
  return next;
}
