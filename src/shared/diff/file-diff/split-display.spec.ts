import { expect, test } from "vitest";
import {
  buildDisplayItems,
  buildUnifiedDiffRows,
} from "../core/unified-diff.js";
import { buildSplitDisplayItems } from "./split-display.js";

test("split pairing retains changes on either side of a folded context block", () => {
  const context = Array.from(
    { length: 64 },
    (_, i) => `retained ${i + 1}`,
  ).join("\n");
  const rows = buildUnifiedDiffRows(
    `old\n${context}\nlast\n`,
    `new\nextra\n${context}\nend\n`,
  );
  const items = buildSplitDisplayItems(buildDisplayItems(rows, {}));
  const block = items.find((item) => item.type === "collapsed")!;
  expect(block.type === "collapsed" && block.block.count).toBe(58);
  const pairs = items.flatMap((item) =>
    item.type === "pair" ? [item.pair] : [],
  );
  expect(pairs[0]).toMatchObject({
    left: { text: "old" },
    right: { text: "new" },
  });
  expect(pairs[1]).toMatchObject({ left: null, right: { text: "extra" } });
  expect(pairs.at(-1)).toMatchObject({
    left: { text: "last" },
    right: { text: "end" },
  });
  expect(pairs.some((pair) => pair.left?.text === "retained 32")).toBe(false);
  if (block.type !== "collapsed") throw Error("Missing context block");
  const partial = buildSplitDisplayItems(
    buildDisplayItems(rows, { [block.block.id]: { top: 20, bottom: 0 } }),
  );
  expect(
    partial.flatMap((item) =>
      item.type === "collapsed" ? [item.block.count] : [],
    ),
  ).toEqual([38]);
  expect(
    partial.some(
      (item) => item.type === "pair" && item.pair.right?.text === "retained 5",
    ),
  ).toBe(true);
});
