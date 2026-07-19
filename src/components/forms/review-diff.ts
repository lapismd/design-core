/** A small, dependency-free diff model used by AI proposal review surfaces. */
export type UnifiedDiffSegmentType = "equal" | "removed" | "added";

export type UnifiedDiffSegment = {
  type: UnifiedDiffSegmentType;
  text: string;
};

export type UnifiedDiffLine = {
  type: UnifiedDiffSegmentType;
  text: string;
  segments: UnifiedDiffSegment[];
};

export type UnifiedDiffPart = {
  type: "equal" | "changed";
  lines: UnifiedDiffLine[];
};

type DiffInput = string | readonly string[];
type SequencePart = {
  type: UnifiedDiffSegmentType;
  values: string[];
};

const MAX_DIFF_MATRIX_CELLS = 250_000;

function asLines(value: DiffInput) {
  if (typeof value !== "string") return [...value];
  return value ? value.split("\n") : [];
}

function pushSequencePart(
  parts: SequencePart[],
  type: UnifiedDiffSegmentType,
  value: string,
) {
  const last = parts.at(-1);
  if (last?.type === type) {
    last.values.push(value);
    return;
  }
  parts.push({ type, values: [value] });
}

function diffSequence(before: readonly string[], after: readonly string[]) {
  if (before.length * after.length > MAX_DIFF_MATRIX_CELLS) {
    const parts: SequencePart[] = [];
    for (const value of before) pushSequencePart(parts, "removed", value);
    for (const value of after) pushSequencePart(parts, "added", value);
    return parts;
  }

  const table = Array.from({ length: before.length + 1 }, () =>
    Array(after.length + 1).fill(0),
  ) as number[][];
  for (
    let beforeIndex = before.length - 1;
    beforeIndex >= 0;
    beforeIndex -= 1
  ) {
    for (let afterIndex = after.length - 1; afterIndex >= 0; afterIndex -= 1) {
      table[beforeIndex][afterIndex] =
        before[beforeIndex] === after[afterIndex]
          ? table[beforeIndex + 1][afterIndex + 1] + 1
          : Math.max(
              table[beforeIndex + 1][afterIndex],
              table[beforeIndex][afterIndex + 1],
            );
    }
  }

  const parts: SequencePart[] = [];
  let beforeIndex = 0;
  let afterIndex = 0;
  while (beforeIndex < before.length && afterIndex < after.length) {
    if (before[beforeIndex] === after[afterIndex]) {
      pushSequencePart(parts, "equal", after[afterIndex]);
      beforeIndex += 1;
      afterIndex += 1;
    } else if (
      table[beforeIndex + 1][afterIndex] >= table[beforeIndex][afterIndex + 1]
    ) {
      pushSequencePart(parts, "removed", before[beforeIndex]);
      beforeIndex += 1;
    } else {
      pushSequencePart(parts, "added", after[afterIndex]);
      afterIndex += 1;
    }
  }
  while (beforeIndex < before.length) {
    pushSequencePart(parts, "removed", before[beforeIndex]);
    beforeIndex += 1;
  }
  while (afterIndex < after.length) {
    pushSequencePart(parts, "added", after[afterIndex]);
    afterIndex += 1;
  }
  return parts;
}

function wordSegments(before: string, after: string) {
  const beforeWords = before.match(/\s+|[^\s]+/g) ?? [];
  const afterWords = after.match(/\s+|[^\s]+/g) ?? [];
  return diffSequence(beforeWords, afterWords).map((part) => ({
    type: part.type,
    text: part.values.join(""),
  }));
}

function lineFromSegments(
  type: UnifiedDiffSegmentType,
  text: string,
  segments: UnifiedDiffSegment[],
): UnifiedDiffLine {
  return { type, text, segments };
}

function enrichChangedLines(parts: SequencePart[]) {
  const removed = parts
    .filter((part) => part.type === "removed")
    .flatMap((part) => part.values);
  const added = parts
    .filter((part) => part.type === "added")
    .flatMap((part) => part.values);
  const lines: UnifiedDiffLine[] = [];
  const pairedLength = Math.min(removed.length, added.length);

  for (let index = 0; index < pairedLength; index += 1) {
    const before = removed[index];
    const after = added[index];
    const segments = wordSegments(before, after);
    lines.push(
      lineFromSegments(
        "removed",
        before,
        segments
          .filter((segment) => segment.type !== "added")
          .map((segment) => ({
            type: segment.type === "equal" ? "equal" : "removed",
            text: segment.text,
          })),
      ),
      lineFromSegments(
        "added",
        after,
        segments
          .filter((segment) => segment.type !== "removed")
          .map((segment) => ({
            type: segment.type === "equal" ? "equal" : "added",
            text: segment.text,
          })),
      ),
    );
  }
  for (const text of removed.slice(pairedLength)) {
    lines.push(lineFromSegments("removed", text, [{ type: "removed", text }]));
  }
  for (const text of added.slice(pairedLength)) {
    lines.push(lineFromSegments("added", text, [{ type: "added", text }]));
  }
  return lines;
}

/**
 * Produces a unified, line-aware diff. Adjacent changed lines are paired and
 * tokenised so replacement words remain visibly distinct from their context.
 */
export function unifiedDiff(
  before: DiffInput,
  after: DiffInput,
): UnifiedDiffPart[] {
  const parts = diffSequence(asLines(before), asLines(after));
  const result: UnifiedDiffPart[] = [];
  let partIndex = 0;

  while (partIndex < parts.length) {
    const part = parts[partIndex];
    if (part.type === "equal") {
      result.push({
        type: "equal",
        lines: part.values.map((text) =>
          lineFromSegments("equal", text, [{ type: "equal", text }]),
        ),
      });
      partIndex += 1;
      continue;
    }

    const changedParts: SequencePart[] = [];
    while (partIndex < parts.length && parts[partIndex].type !== "equal") {
      changedParts.push(parts[partIndex]);
      partIndex += 1;
    }
    const lines = enrichChangedLines(changedParts);
    result.push({ type: "changed", lines });
  }
  return result;
}
