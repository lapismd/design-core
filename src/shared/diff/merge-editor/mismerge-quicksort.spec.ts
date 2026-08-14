import assert from "node:assert/strict";
import { test } from "vitest";

import {
  assembleThreeWayMerge,
  createMergeRenderModel,
} from "../core/merge/index.js";
import { mismergeQuicksortFixture } from "./mismerge-quicksort-fixture.js";

test("assembles the official MisMerge quicksort fixture as peer documents", () => {
  const model = assembleThreeWayMerge(
    mismergeQuicksortFixture.left,
    mismergeQuicksortFixture.base,
    mismergeQuicksortFixture.right,
    { workingCopyCenter: true },
  );
  const changed = model.blocks
    .filter((block) => block.kind !== "unchanged")
    .map((block) => block.kind);
  assert.deepEqual(changed, ["modified", "added", "conflict", "removed"]);

  const renderModel = createMergeRenderModel(model);
  const modified = model.blocks.find((block) => block.kind === "modified");
  assert.ok(modified);
  const left = renderModel.sides.left.find(
    (component) => component.blockId === modified.id,
  );
  const right = renderModel.sides.right.find(
    (component) => component.blockId === modified.id,
  );
  assert.equal(left?.visualKind, "unchanged");
  assert.equal(left?.action, undefined);
  assert.equal(right?.action?.kind, "merge");
});
