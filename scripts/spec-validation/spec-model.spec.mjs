import assert from "node:assert/strict";
import test from "node:test";

import {
  createSpecModel,
  formatDiagnostic,
  proseMetrics,
  splitMarkdownTableRow,
} from "./lib/spec-model.mjs";
import { createFixture, minimalBook } from "./test-helpers.mjs";

test("parses canonical headings, atomic details, coverage, and prose metrics", () => {
  const root = createFixture(minimalBook());
  const model = createSpecModel(root);
  assert.equal(model.definitions.length, 1);
  assert.deepEqual(
    {
      id: model.definitions[0].id,
      surface: model.definitions[0].surface,
      words: model.definitions[0].words,
    },
    { id: "DC-GOV-001", surface: "Fixture", words: 5 },
  );
  assert.equal(model.acceptanceSections[0].bullets.length, 2);
  assert.equal(model.coverage[0].id, "DC-GOV-001");
  assert.deepEqual(proseMetrics("A **small** [linked](chapter.md) rule."), {
    prose: "A small linked rule.",
    words: 4,
    sentences: 1,
  });
});

test("splits Markdown tables without splitting escaped or code pipes", () => {
  assert.deepEqual(splitMarkdownTableRow("| A | `x|y` | z\\|q |"), [
    "A",
    "`x|y`",
    "z\\|q",
  ]);
});

test("formats stable actionable diagnostics", () => {
  assert.equal(
    formatDiagnostic({
      code: "SPEC-TEST",
      rule: "DC-GOV-003",
      file: "spec/src/index.md",
      line: 7,
      subject: "DC-X-001",
      message: "fix the fixture",
    }),
    "SPEC-TEST DC-GOV-003 spec/src/index.md:7 [DC-X-001] — fix the fixture",
  );
});
