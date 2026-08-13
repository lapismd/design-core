import assert from "node:assert/strict";
import test from "node:test";

import {
  changesFromVcs,
  chaptersForPath,
  classifySpecFirstChanges,
  parseArgs,
  parseUnifiedDiff,
} from "./check-spec-first.mjs";

test("maps every production layer and tooling area to its canonical chapter", () => {
  const cases = new Map([
    [
      "src/shared/shadcn/button/Button.svelte",
      ["spec/src/shadcn/actions-and-content.md"],
    ],
    [
      "src/shared/forms/color-picker/ColorPicker.svelte",
      ["spec/src/forms/inputs.md"],
    ],
    [
      "src/shared/forms/core/autosize-textarea.ts",
      ["spec/src/forms/core-and-orchestrators.md"],
    ],
    ["src/shared/filter/filter-query/index.ts", ["spec/src/filter.md"]],
    ["src/shared/ai/message/Message.svelte", ["spec/src/ai.md"]],
    ["src/shared/shell/app-shell/AppShellRoot.svelte", ["spec/src/shell.md"]],
    [
      "src/shared/workspace/problems/index.ts",
      ["spec/src/workspace/panels.md"],
    ],
    [
      "src/shared/workspace/plugins/f-mode/index.ts",
      ["spec/src/workspace/plugins.md"],
    ],
    [".storybook/preview.ts", ["spec/src/storybook-catalog.md"]],
    ["scripts/spec-validation/index.mjs", ["spec/src/spec-governance.md"]],
    ["spec/public-surfaces.json", ["spec/src/spec-governance.md"]],
    ["scripts/ui-generator/cli.ts", ["spec/src/tooling.md"]],
    ["package.json", ["spec/src/architecture.md", "spec/src/packages.md"]],
  ]);
  for (const [file, chapters] of cases)
    assert.deepEqual(chaptersForPath(file), chapters, file);
});

test("accepts owning chapters and rejects an unrelated chapter", () => {
  const missing = classifySpecFirstChanges([
    "src/shared/forms/color-picker/ColorPicker.svelte",
    "spec/src/architecture.md",
  ]);
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.missingChapters, ["spec/src/forms/inputs.md"]);

  const present = classifySpecFirstChanges([
    "src/shared/forms/color-picker/ColorPicker.svelte",
    "spec/src/forms/inputs.md",
  ]);
  assert.equal(present.ok, true);
});

test("ignores tests, ordinary stories, generated output, README, and migration trackers", () => {
  const result = classifySpecFirstChanges([
    "src/shared/forms/color-picker/ColorPicker.spec.ts",
    "src/shared/forms/color-picker/ColorPicker.stories.svelte",
    "src/shared/forms/color-picker/ColorPicker.mdx",
    "spec/book/index.html",
    "README.md",
    "SPEC_MIGRATION.md",
  ]);
  assert.equal(result.requiresSpec, false);
  assert.equal(result.ok, true);
});

test("fails closed for unmapped production source", () => {
  const result = classifySpecFirstChanges([
    "src/shared/forms/future-kind/FutureKind.svelte",
  ]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.unmappedProductionFiles, [
    "src/shared/forms/future-kind/FutureKind.svelte",
  ]);
});

test("parses quoted renames and changed lines from unified diffs", () => {
  const changes = parseUnifiedDiff(
    [
      'diff --git "a/src/shared/forms/old name.ts" "b/src/shared/forms/new name.ts"',
      "--- a/src/shared/forms/old name.ts",
      "+++ b/src/shared/forms/new name.ts",
      "-old",
      "+next",
    ].join("\n"),
  );
  assert.deepEqual(
    changes.map((change) => change.path),
    ["src/shared/forms/old name.ts", "src/shared/forms/new name.ts"],
  );
  assert.deepEqual(changes[0].changedLines, ["old", "next"]);
  assert.throws(
    () => parseUnifiedDiff("not a unified diff"),
    /no unified diff headers/,
  );
});

test("supports explicit CI revisions and fails without trustworthy VCS state", () => {
  assert.deepEqual(parseArgs(["--base", "origin/main", "--head", "HEAD"]), {
    files: [],
    base: "origin/main",
    head: "HEAD",
  });
  const calls = [];
  changesFromVcs(
    { files: [], base: "base", head: "head" },
    "/repo",
    (command, args) => {
      calls.push({ command, args });
      return "";
    },
  );
  assert.equal(calls[0].command, "git");
  assert.deepEqual(calls[0].args.slice(0, 4), [
    "diff",
    "--no-ext-diff",
    "--unified=0",
    "base",
  ]);
  assert.throws(
    () =>
      changesFromVcs(
        { files: [], base: undefined, head: undefined },
        "/definitely/missing",
      ),
    /neither \.jj nor \.git/,
  );
});
