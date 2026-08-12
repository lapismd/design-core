import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  DEFAULT_LIMIT,
  looksLikeAbiMismatch,
  parseCliArgs,
  resolveQmdBinary,
  runSpecCommand,
} from "./spec-search.mjs";

function createHarness(results = []) {
  const calls = [];
  const output = { stdout: "", stderr: "" };
  const repoRoot = path.resolve("/repo/design-core");
  const binaryPath = resolveQmdBinary(repoRoot, "darwin");
  const existing = new Set([
    binaryPath,
    path.join(repoRoot, ".qmd", "index.yml"),
  ]);
  return {
    calls,
    output,
    dependencies: {
      repoRoot,
      binaryPath,
      platform: "darwin",
      environment: { TEST_ENV: "present", PWD: "/wrong" },
      exists: (filePath) => existing.has(filePath),
      run: (command, args, options) => {
        calls.push({ command, args, options });
        return results.shift() ?? { status: 0, stdout: "", stderr: "" };
      },
      stdout: { write: (value) => (output.stdout += value) },
      stderr: { write: (value) => (output.stderr += value) },
    },
  };
}

test("parses lexical, semantic, JSON, limit, and exact ID searches", () => {
  assert.deepEqual(parseCliArgs(["search", "DC-GOV-006"]), {
    command: "search",
    semantic: false,
    json: false,
    limit: DEFAULT_LIMIT,
    query: "DC-GOV-006",
  });
  assert.deepEqual(
    parseCliArgs([
      "search",
      "--semantic",
      "--json",
      "--limit",
      "18",
      "form",
      "validation",
    ]),
    {
      command: "search",
      semantic: true,
      json: true,
      limit: 18,
      query: "form validation",
    },
  );
  assert.throws(() => parseCliArgs(["search"]), /requires a query/);
  assert.throws(
    () => parseCliArgs(["search", "--limit", "0", "x"]),
    /positive integer/,
  );
  assert.throws(() => parseCliArgs(["index", "query"]), /only --semantic/);
});

test("refreshes lexical indexes and emits full paths with line numbers", () => {
  const harness = createHarness();
  assert.equal(
    runSpecCommand(
      parseCliArgs(["search", "workspace panels"]),
      harness.dependencies,
    ),
    0,
  );
  assert.deepEqual(
    harness.calls.map((call) => call.args),
    [
      ["update"],
      [
        "search",
        "workspace panels",
        "-c",
        "design-core-spec",
        "-n",
        "10",
        "--format",
        "md",
        "--full-path",
        "--line-numbers",
      ],
    ],
  );
  assert.equal(harness.calls[0].options.stdio[1], "pipe");
});

test("embeds only on request and returns JSON vector results", () => {
  const harness = createHarness();
  assert.equal(
    runSpecCommand(
      parseCliArgs(["search", "--semantic", "--json", "themes"]),
      harness.dependencies,
    ),
    0,
  );
  assert.deepEqual(
    harness.calls.map((call) => call.args),
    [
      ["update"],
      ["embed", "-c", "design-core-spec"],
      [
        "vsearch",
        "themes",
        "-c",
        "design-core-spec",
        "-n",
        "10",
        "--format",
        "json",
        "--full-path",
        "--line-numbers",
      ],
    ],
  );
});

test("reports configuration, binary, model, search, and ABI failures with rg fallback", () => {
  const options = parseCliArgs(["search", "forms"]);
  const missing = createHarness();
  missing.dependencies.exists = () => false;
  assert.equal(runSpecCommand(options, missing.dependencies), 2);
  assert.match(missing.output.stderr, /Fallback: rg/);

  const abi = createHarness([
    {
      status: 7,
      stdout: "",
      stderr: "NODE_MODULE_VERSION 137 but requires 147",
    },
  ]);
  assert.equal(runSpecCommand(options, abi.dependencies), 7);
  assert.match(abi.output.stderr, /active Node ABI/);
  assert.match(abi.output.stderr, /pnpm install --force/);
  assert.equal(looksLikeAbiMismatch({ stderr: "ERR_DLOPEN_FAILED" }), true);

  const model = createHarness([
    { status: 0, stdout: "", stderr: "" },
    { status: 9, stdout: "", stderr: "model download failed" },
  ]);
  assert.equal(
    runSpecCommand(
      parseCliArgs(["search", "--semantic", "forms"]),
      model.dependencies,
    ),
    9,
  );
  assert.match(model.output.stderr, /model initialization failed/);
  assert.match(model.output.stderr, /omit --semantic/);
});

test("explicit index refresh accepts only optional semantic embedding", () => {
  const lexical = createHarness();
  assert.equal(
    runSpecCommand(parseCliArgs(["index"]), lexical.dependencies),
    0,
  );
  assert.deepEqual(
    lexical.calls.map((call) => call.args),
    [["update"]],
  );
  const semantic = createHarness();
  assert.equal(
    runSpecCommand(
      parseCliArgs(["index", "--semantic"]),
      semantic.dependencies,
    ),
    0,
  );
  assert.deepEqual(
    semantic.calls.map((call) => call.args),
    [["update"], ["embed", "-c", "design-core-spec"]],
  );
});
