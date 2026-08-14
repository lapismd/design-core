import assert from "node:assert/strict";
import { test } from "vitest";

import { connectorPath } from "./connector.js";

test("connectorPath starts at the from edge and ends at the to edge", () => {
  const width = 40;
  const path = connectorPath(width, 10, 30, 14, 36);

  assert.match(path, /^M 0 10\b/);
  assert.match(path, new RegExp(`\\bL ${width} 36\\b`));
  assert.match(path, /\bC [\d.]+ 36, [\d.]+ 30, 0 30 Z$/);
});
