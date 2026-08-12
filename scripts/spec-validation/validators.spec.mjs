import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { runSpecificationValidation } from "./index.mjs";
import { createFixture, minimalBook } from "./test-helpers.mjs";

function validate(files = minimalBook()) {
  const repoRoot = createFixture(files);
  return {
    repoRoot,
    result: runSpecificationValidation({
      repoRoot,
      trackedFiles: Object.keys(files),
    }),
  };
}

test("accepts a complete one-to-one canonical fixture", () => {
  const { result } = validate();
  assert.equal(result.ok, true);
  assert.equal(result.stats.requirements, 1);
  assert.equal(result.stats.surfaces, 1);
});

test("allows documentation groups after the canonical specification order", () => {
  const files = minimalBook();
  files[".storybook/preview.ts"] =
    'export default { parameters: { options: { storySort: { order: ["Specification", ["Chapter", "Verification"], "Documentation", ["Welcome"], "*"] } } } };\n';
  const { result } = validate(files);
  assert.equal(result.ok, true);
});

test("reports duplicate IDs, malformed details, and missing verification", () => {
  const files = minimalBook({
    details: ["Two sentences. This is not atomic."],
  });
  files["spec/src/second.md"] = files["spec/src/chapter.md"];
  files["spec/src/SUMMARY.md"] =
    "# Summary\n\n- [Chapter](chapter.md)\n- [Second](second.md)\n- [Verification](verification.md)\n";
  files["spec/src/verification.md"] =
    "# Verification\n\n| Requirement | Status | Evidence |\n| --- | --- | --- |\n";
  const { result } = validate(files);
  const codes = new Set(result.findings.map((finding) => finding.code));
  assert(codes.has("SPEC-REQ-DUPLICATE"));
  assert(codes.has("SPEC-DETAILS-COUNT"));
  assert(codes.has("SPEC-DETAILS-ATOMIC"));
  assert(codes.has("SPEC-VERIFY-UNMAPPED"));
});

test("reports summary, link, book, and public surface drift with stable rules", () => {
  const files = minimalBook();
  files["spec/src/chapter.md"] += "\n[Missing](missing.md)\n";
  files["spec/src/SUMMARY.md"] =
    "# Summary\n\n- [Verification](verification.md)\n";
  files[".gitignore"] = "";
  files["spec/public-surfaces.json"] = JSON.stringify({
    exports: [{ name: "./stale", requirement: "DC-NOPE-999" }],
    catalog: [],
  });
  const { result } = validate(files);
  for (const expected of [
    "SPEC-SUMMARY-ENTRY",
    "SPEC-LINK-BROKEN",
    "SPEC-BOOK-IGNORE",
    "SPEC-SURFACE-UNMAPPED",
    "SPEC-SURFACE-STALE",
    "SPEC-SURFACE-REQUIREMENT",
  ])
    assert(
      result.findings.some((finding) => finding.code === expected),
      expected,
    );
  assert(result.findings.every((finding) => finding.rule.startsWith("DC-")));
});

test("rejects unsupported verification states and tracked generated output", () => {
  const files = minimalBook({ status: "Done" });
  const repoRoot = createFixture(files);
  const result = runSpecificationValidation({
    repoRoot,
    trackedFiles: [...Object.keys(files), "spec/book/index.html"],
  });
  assert(
    result.findings.some((finding) => finding.code === "SPEC-VERIFY-STATUS"),
  );
  assert(
    result.findings.some((finding) => finding.code === "SPEC-BOOK-TRACKED"),
  );
});

test("reports malformed JSON as a fail-closed internal validation error", () => {
  const files = minimalBook();
  const repoRoot = createFixture(files);
  writeFileSync(path.join(repoRoot, "spec/public-surfaces.json"), "{");
  assert.throws(
    () =>
      runSpecificationValidation({
        repoRoot,
        trackedFiles: Object.keys(files),
      }),
    /JSON/,
  );
  assert.equal(
    readFileSync(path.join(repoRoot, "spec/public-surfaces.json"), "utf8"),
    "{",
  );
});

test("enforces complete metadata-only Storybook mirrors in SUMMARY order", () => {
  const files = minimalBook();
  files["src/spec/chapter.mdx"] += "\nCopied normative prose.\n";
  files[".storybook/preview.ts"] =
    'export default { parameters: { options: { storySort: { order: ["Specification", ["Verification"], "*"] } } } };\n';
  delete files["src/spec/verification.mdx"];
  const { result } = validate(files);
  const codes = new Set(result.findings.map((finding) => finding.code));
  assert(codes.has("SPEC-MIRROR-CONTENT"));
  assert(codes.has("SPEC-MIRROR-MISSING"));
  assert(codes.has("SPEC-MIRROR-ORDER"));
});
