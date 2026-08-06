import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { loadDocsMcpConfig } from "../config.js";
import { createDocsService } from "../service.js";
import { runAgentEval } from "./eval-agent.js";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("Docs MCP agent evaluation harness", () => {
  it("runs a fresh external process, logs CLI discovery, scores output, and typechecks the fixture", async () => {
    const temp = mkdtempSync(path.join(tmpdir(), "docs-mcp-agent-eval-"));
    roots.push(temp);
    const casesPath = path.join(temp, "cases.json");
    writeFileSync(
      casesPath,
      JSON.stringify({
        cases: [
          {
            id: "search-filter",
            query: "Build a searchable filter bar.",
            expectedIds: ["filter-search-filter-bar"],
            maxRank: 3,
          },
        ],
      }),
    );
    const runnerPath = path.join(temp, "runner.mjs");
    writeFileSync(
      runnerPath,
      `import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
const common = ["--root", ${JSON.stringify(workspaceRoot)}, "--config", ".storybook/docs-mcp.config.ts", "--no-cache"];
const search = spawnSync("docs-mcp", ["search", "SearchFilterBar", "--json", ...common], { encoding: "utf8", env: process.env });
if (search.status !== 0) process.exit(search.status ?? 1);
const found = JSON.parse(search.stdout).results[0];
const get = spawnSync("docs-mcp", ["get", found.id, "--format", "dense", ...common], { encoding: "utf8", env: process.env });
if (get.status !== 0) process.exit(get.status ?? 1);
mkdirSync("src", { recursive: true });
writeFileSync("src/Fixture.svelte", \`<script lang="ts">
  import { SearchFilterBar } from "@lapismd/design-core/filter";
  let query = $state("");
</script>
<SearchFilterBar value={query} onValueChange={(next) => (query = next)} />
\`);
writeFileSync(process.env.DOCS_MCP_EVAL_RESULT, JSON.stringify({
  selectedIds: [found.id],
  imports: [{ id: found.id, importPath: found.importPath }],
  propsUsed: [{ id: found.id, props: ["value", "onValueChange"] }],
  fixture: "src/Fixture.svelte"
}));
`,
    );

    const loaded = await loadDocsMcpConfig(
      workspaceRoot,
      ".storybook/docs-mcp.config.ts",
    );
    const service = createDocsService({
      root: loaded.root,
      config: loaded.config,
      configPath: loaded.configPath,
      noCache: true,
    });
    const report = runAgentEval({
      service,
      casesPath,
      runner: `node ${runnerPath} {cwd} {promptFile}`,
      repetitions: 1,
      conditions: ["bare"],
      outputDir: path.join(temp, "report"),
      timeoutMs: 120_000,
    });
    expect(report.ok).toBe(true);
    expect(report.trials).toEqual([
      expect.objectContaining({
        condition: "bare",
        resultFound: true,
        expectedIdRecall: 1,
        inventedIds: [],
        inventedProps: [],
        invalidImports: [],
        mcpDiscovered: false,
        searchGetCompleted: true,
        fixtureTypecheck: "passed",
      }),
    ]);
  }, 150_000);

  it("requires both isolation placeholders", async () => {
    const loaded = await loadDocsMcpConfig(
      workspaceRoot,
      ".storybook/docs-mcp.config.ts",
    );
    const service = createDocsService({
      root: loaded.root,
      config: loaded.config,
      noCache: true,
    });
    expect(() =>
      runAgentEval({
        service,
        casesPath:
          "packages/storybook-addon-docs-mcp/eval/ui-relevance-cases.json",
        runner: "agent --cwd {cwd}",
        repetitions: 1,
      }),
    ).toThrow(/{promptFile}/);
  });
});
