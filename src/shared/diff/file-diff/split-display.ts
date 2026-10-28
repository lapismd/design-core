import {
  pairRowsForSplit,
  type CollapsedContextBlock,
  type DiffDisplayItem,
  type SplitDiffRowPair,
  type UnifiedDiffRow,
} from "../core/unified-diff.js";

export type SplitDisplayItem =
  | { type: "pair"; pair: SplitDiffRowPair }
  | { type: "collapsed"; block: CollapsedContextBlock };

/** Pair visible change runs without discarding shared context-fold boundaries. */
export function buildSplitDisplayItems(
  items: DiffDisplayItem[],
): SplitDisplayItem[] {
  const result: SplitDisplayItem[] = [];
  let rows: UnifiedDiffRow[] = [];
  const flush = () => {
    for (const pair of pairRowsForSplit(rows))
      result.push({ type: "pair", pair });
    rows = [];
  };
  for (const item of items) {
    if (item.type === "row") rows.push(item.row);
    else {
      flush();
      result.push(item);
    }
  }
  flush();
  return result;
}
