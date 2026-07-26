import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadDocsMcpConfig } from "../config.js";
import { createDocsService } from "../service.js";
import { runDeterministicEval } from "./eval.js";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

describe("Docs MCP deterministic evaluation", () => {
  it("passes the maintained exact, synonym, typo, guide, block, and noise cases", async () => {
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
    const report = runDeterministicEval({
      service,
      casesPath:
        "packages/storybook-addon-docs-mcp/eval/ui-relevance-cases.json",
    });
    expect(report.ok).toBe(true);
    expect(report.metrics.hitAtK).toBe(1);
    expect(report.metrics.noResultCorrectness).toBe(1);
    expect(report.metrics.perKindCoverage.component.rate).toBe(1);
    expect(report.metrics.perKindCoverage.guide.rate).toBe(1);
    expect(report.metrics.perKindCoverage.block.rate).toBe(1);
    expect(report.metrics.perKindCoverage.template.cases).toBe(0);
  });
});
