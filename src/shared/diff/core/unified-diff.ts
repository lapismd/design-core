import { DEFAULT_OPTIONS } from "./merge/options.js";
import { diffSequences } from "./merge/diff.js";

export const CONTEXT_RADIUS = 3;
export const MIN_COLLAPSE_LINES = 8;
export const INCREMENTAL_EXPAND_STEP = 20;
export const INCREMENTAL_EXPAND_THRESHOLD = 40;

export interface InlineDiffSegment {
  key: string;
  text: string;
  tone: "added" | "removed" | "context";
}

export interface UnifiedDiffRow {
  key: string;
  lineNumber: number | null;
  variant: "context" | "added" | "removed";
  text: string;
  segments?: InlineDiffSegment[];
}

export interface CollapsedContextBlock {
  id: string;
  count: number;
  rows: UnifiedDiffRow[];
  expanded: boolean;
}

export type ExpandedBlockState = Record<
  string,
  boolean | { top: number; bottom: number }
>;

export type DiffDisplayItem =
  | { type: "row"; row: UnifiedDiffRow }
  | { type: "collapsed"; block: CollapsedContextBlock };

export interface SplitDiffRowPair {
  key: string;
  left: UnifiedDiffRow | null;
  right: UnifiedDiffRow | null;
}

function toLines(text: string): string[] {
  const rawLines = text.split("\n");
  return text.endsWith("\n") ? rawLines.slice(0, -1) : rawLines;
}

function tokenizeWords(text: string): string[] {
  return text.match(/\w+|\s+|[^\w\s]+/g) ?? [];
}

function buildModifiedSegments(
  oldText: string,
  newText: string,
): {
  oldSegments: InlineDiffSegment[];
  newSegments: InlineDiffSegment[];
} {
  const oldSegments: InlineDiffSegment[] = [];
  const newSegments: InlineDiffSegment[] = [];
  const ops = diffSequences(
    tokenizeWords(oldText),
    tokenizeWords(newText),
    DEFAULT_OPTIONS,
  );

  for (const [index, op] of ops.entries()) {
    if (op.kind === "left") {
      oldSegments.push({
        key: `o-${index}`,
        text: op.value,
        tone: "removed",
      });
      continue;
    }
    if (op.kind === "right") {
      newSegments.push({
        key: `n-${index}`,
        text: op.value,
        tone: "added",
      });
      continue;
    }
    oldSegments.push({
      key: `oc-${index}`,
      text: op.left,
      tone: "context",
    });
    newSegments.push({
      key: `nc-${index}`,
      text: op.right,
      tone: "context",
    });
  }
  return { oldSegments, newSegments };
}

export function buildUnifiedDiffRows(
  oldText: string | null | undefined,
  newText: string,
): UnifiedDiffRow[] {
  const rows: UnifiedDiffRow[] = [];
  let oldLine = 1;
  let newLine = 1;
  const ops = diffSequences(
    toLines(oldText ?? ""),
    toLines(newText),
    DEFAULT_OPTIONS,
  );

  let index = 0;
  while (index < ops.length) {
    const op = ops[index];
    const nextOp = ops[index + 1];
    if (!op) {
      index += 1;
      continue;
    }

    if (op.kind === "left" && nextOp?.kind === "right") {
      const removedLines: string[] = [];
      const addedLines: string[] = [];
      while (index < ops.length && ops[index]?.kind === "left") {
        removedLines.push(ops[index]!.value);
        index += 1;
      }
      while (index < ops.length && ops[index]?.kind === "right") {
        addedLines.push(ops[index]!.value);
        index += 1;
      }

      const pairCount = Math.max(removedLines.length, addedLines.length);
      const removedRows: UnifiedDiffRow[] = [];
      const addedRows: UnifiedDiffRow[] = [];
      let localOldLine = oldLine;
      let localNewLine = newLine;

      for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
        const removedLine = removedLines[pairIndex];
        const addedLine = addedLines[pairIndex];

        if (removedLine != null && addedLine != null) {
          const { oldSegments, newSegments } = buildModifiedSegments(
            removedLine,
            addedLine,
          );
          removedRows.push({
            key: `m-old-${localOldLine}-${localNewLine}`,
            lineNumber: localOldLine,
            variant: "removed",
            text: removedLine,
            segments: oldSegments,
          });
          addedRows.push({
            key: `m-new-${localOldLine}-${localNewLine}`,
            lineNumber: localNewLine,
            variant: "added",
            text: addedLine,
            segments: newSegments,
          });
          localOldLine += 1;
          localNewLine += 1;
        } else if (removedLine != null) {
          removedRows.push({
            key: `o-${localOldLine}`,
            lineNumber: localOldLine,
            variant: "removed",
            text: removedLine,
          });
          localOldLine += 1;
        } else if (addedLine != null) {
          addedRows.push({
            key: `n-${localNewLine}`,
            lineNumber: localNewLine,
            variant: "added",
            text: addedLine,
          });
          localNewLine += 1;
        }
      }

      rows.push(...removedRows, ...addedRows);
      oldLine = localOldLine;
      newLine = localNewLine;
      continue;
    }

    if (op.kind === "right") {
      rows.push({
        key: `n-${newLine}`,
        lineNumber: newLine,
        variant: "added",
        text: op.value,
      });
      newLine += 1;
    } else if (op.kind === "left") {
      rows.push({
        key: `o-${oldLine}`,
        lineNumber: oldLine,
        variant: "removed",
        text: op.value,
      });
      oldLine += 1;
    } else {
      rows.push({
        key: `c-${oldLine}-${newLine}`,
        lineNumber: newLine,
        variant: "context",
        text: op.right,
      });
      oldLine += 1;
      newLine += 1;
    }
    index += 1;
  }
  return rows;
}

function enrichRowsWithInlineSegments(
  rows: UnifiedDiffRow[],
): UnifiedDiffRow[] {
  const result: UnifiedDiffRow[] = [];
  let index = 0;

  while (index < rows.length) {
    const row = rows[index]!;
    if (row.variant !== "removed") {
      result.push(row);
      index += 1;
      continue;
    }

    const removedStart = index;
    while (index < rows.length && rows[index]!.variant === "removed") {
      index += 1;
    }
    const removedBlock = rows.slice(removedStart, index);

    const addedStart = index;
    while (index < rows.length && rows[index]!.variant === "added") {
      index += 1;
    }
    const addedBlock = rows.slice(addedStart, index);

    if (addedBlock.length === 0) {
      result.push(...removedBlock);
      continue;
    }

    const pairCount = Math.min(removedBlock.length, addedBlock.length);
    for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
      const removedRow = removedBlock[pairIndex]!;
      const addedRow = addedBlock[pairIndex]!;
      if (!removedRow.segments && !addedRow.segments) {
        const { oldSegments, newSegments } = buildModifiedSegments(
          removedRow.text,
          addedRow.text,
        );
        removedBlock[pairIndex] = { ...removedRow, segments: oldSegments };
        addedBlock[pairIndex] = { ...addedRow, segments: newSegments };
      }
    }

    result.push(...removedBlock, ...addedBlock);
  }

  return result;
}

export function parsePatchToRows(patch: string): UnifiedDiffRow[] {
  if (!patch) {
    return [];
  }
  const rawLines = patch.split("\n");
  if (rawLines.length > 0 && rawLines[rawLines.length - 1] === "") {
    rawLines.pop();
  }
  const rows: UnifiedDiffRow[] = [];
  let oldLine = 0;
  let newLine = 0;
  let inHunk = false;

  for (const raw of rawLines) {
    if (raw.startsWith("@@")) {
      inHunk = true;
      const match = raw.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLine = Number.parseInt(match[1] ?? "0", 10);
        newLine = Number.parseInt(match[2] ?? "0", 10);
      }
      continue;
    }
    if (!inHunk) {
      continue;
    }
    if (raw.startsWith("+")) {
      rows.push({
        key: `n-${newLine}`,
        lineNumber: newLine,
        variant: "added",
        text: raw.slice(1),
      });
      newLine += 1;
    } else if (raw.startsWith("-")) {
      rows.push({
        key: `o-${oldLine}`,
        lineNumber: oldLine,
        variant: "removed",
        text: raw.slice(1),
      });
      oldLine += 1;
    } else if (raw.startsWith(" ")) {
      rows.push({
        key: `c-${oldLine}-${newLine}`,
        lineNumber: newLine,
        variant: "context",
        text: raw.slice(1),
      });
      oldLine += 1;
      newLine += 1;
    }
  }
  return enrichRowsWithInlineSegments(rows);
}

export function buildDisplayItems(
  rows: UnifiedDiffRow[],
  expandedBlocks: ExpandedBlockState,
): DiffDisplayItem[] {
  const changedIndices: number[] = [];
  for (let index = 0; index < rows.length; index += 1) {
    if (rows[index]?.variant !== "context") {
      changedIndices.push(index);
    }
  }

  const nearbyContext = new Set<number>();
  for (const changedIndex of changedIndices) {
    const start = Math.max(0, changedIndex - CONTEXT_RADIUS);
    const end = Math.min(rows.length - 1, changedIndex + CONTEXT_RADIUS);
    for (let index = start; index <= end; index += 1) {
      nearbyContext.add(index);
    }
  }

  const shouldHideContextAt = (index: number): boolean => {
    const row = rows[index];
    if (!row || row.variant !== "context") {
      return false;
    }
    if (changedIndices.length === 0) {
      return rows.length >= MIN_COLLAPSE_LINES;
    }
    return !nearbyContext.has(index);
  };

  const items: DiffDisplayItem[] = [];
  let index = 0;
  while (index < rows.length) {
    if (!shouldHideContextAt(index)) {
      const row = rows[index];
      if (row) {
        items.push({ type: "row", row });
      }
      index += 1;
      continue;
    }

    const start = index;
    while (index < rows.length && shouldHideContextAt(index)) {
      index += 1;
    }
    const blockRows = rows.slice(start, index);
    if (blockRows.length < MIN_COLLAPSE_LINES) {
      for (const row of blockRows) {
        items.push({ type: "row", row });
      }
      continue;
    }

    const blockId = `ctx-${start}-${index - 1}`;
    const blockState = expandedBlocks[blockId];

    if (blockState === true) {
      items.push({
        type: "collapsed",
        block: {
          id: blockId,
          count: blockRows.length,
          rows: blockRows,
          expanded: true,
        },
      });
      continue;
    }

    if (typeof blockState === "object" && blockState !== null) {
      const topReveal = Math.min(blockState.top, blockRows.length);
      const bottomReveal = Math.min(
        blockState.bottom,
        blockRows.length - topReveal,
      );

      for (let rowIndex = 0; rowIndex < topReveal; rowIndex += 1) {
        const row = blockRows[rowIndex];
        if (row) {
          items.push({ type: "row", row });
        }
      }

      const remainingStart = topReveal;
      const remainingEnd = blockRows.length - bottomReveal;
      if (remainingEnd > remainingStart) {
        const remainingRows = blockRows.slice(remainingStart, remainingEnd);
        items.push({
          type: "collapsed",
          block: {
            id: blockId,
            count: remainingRows.length,
            rows: remainingRows,
            expanded: false,
          },
        });
      }

      for (
        let rowIndex = blockRows.length - bottomReveal;
        rowIndex < blockRows.length;
        rowIndex += 1
      ) {
        const row = blockRows[rowIndex];
        if (row) {
          items.push({ type: "row", row });
        }
      }
      continue;
    }

    items.push({
      type: "collapsed",
      block: {
        id: blockId,
        count: blockRows.length,
        rows: blockRows,
        expanded: false,
      },
    });
  }
  return items;
}

export function pairRowsForSplit(rows: UnifiedDiffRow[]): SplitDiffRowPair[] {
  const pairs: SplitDiffRowPair[] = [];
  let index = 0;
  while (index < rows.length) {
    const row = rows[index];
    if (!row) {
      index += 1;
      continue;
    }

    if (row.variant === "removed") {
      const removedStart = index;
      while (index < rows.length && rows[index]!.variant === "removed") {
        index += 1;
      }
      const removedBlock = rows.slice(removedStart, index);

      const addedStart = index;
      while (index < rows.length && rows[index]!.variant === "added") {
        index += 1;
      }
      const addedBlock = rows.slice(addedStart, index);

      const pairCount = Math.max(removedBlock.length, addedBlock.length);
      for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
        const left = removedBlock[pairIndex] ?? null;
        const right = addedBlock[pairIndex] ?? null;
        const key =
          left && right
            ? `pair-${left.key}-${right.key}`
            : left
              ? `pair-left-${left.key}`
              : `pair-right-${right!.key}`;
        pairs.push({ key, left, right });
      }
      continue;
    }

    if (row.variant === "added") {
      pairs.push({
        key: `pair-right-${row.key}`,
        left: null,
        right: row,
      });
      index += 1;
      continue;
    }

    pairs.push({
      key: `pair-context-${row.key}`,
      left: row,
      right: row,
    });
    index += 1;
  }

  return pairs;
}

export function truncatePathMiddle(path: string, maxLength = 64): string {
  if (path.length <= maxLength) {
    return path;
  }
  const separator = "...";
  const keep = Math.max(8, maxLength - separator.length);
  const head = Math.ceil(keep / 2);
  const tail = Math.floor(keep / 2);
  return `${path.slice(0, head)}${separator}${path.slice(path.length - tail)}`;
}

const BINARY_FILE_EXTENSIONS = new Set([
  "avif",
  "bmp",
  "gif",
  "gz",
  "ico",
  "jpeg",
  "jpg",
  "mov",
  "mp3",
  "mp4",
  "pdf",
  "png",
  "tar",
  "tgz",
  "webm",
  "webp",
  "zip",
]);

export function isBinaryFilePath(filePath: string): boolean {
  const normalizedPath = filePath.replaceAll("\\", "/");
  const basename = normalizedPath.slice(normalizedPath.lastIndexOf("/") + 1);
  const dotIndex = basename.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === basename.length - 1) {
    return false;
  }
  return BINARY_FILE_EXTENSIONS.has(basename.slice(dotIndex + 1).toLowerCase());
}
