import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadDocsMcpConfig } from "../config.js";
import { createDocsService } from "../service.js";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const cliPath = path.join(
  workspaceRoot,
  "packages/storybook-addon-docs-mcp/src/node/cli.ts",
);

function runJson(args: string[]): Record<string, unknown> {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      cliPath,
      ...args,
      "--root",
      workspaceRoot,
      "--config",
      ".storybook/docs-mcp.config.ts",
      "--no-cache",
      "--json",
    ],
    { cwd: workspaceRoot, encoding: "utf8", timeout: 30_000 },
  );
  if (result.status !== 0) {
    throw new Error(`${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

describe("Docs MCP CLI parity", () => {
  it("returns the same structured search and get results as the shared service", async () => {
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
    const expectedSearch = service.search({
      query: "filter list toolbar",
      kinds: ["block"],
      limit: 2,
    });
    expect(
      runJson([
        "search",
        "filter list toolbar",
        "--kind",
        "block",
        "--limit",
        "2",
      ]),
    ).toEqual(expectedSearch);

    const expectedGet = service.get({
      id: "block-filterable-list-toolbar",
      section: "ownership",
    });
    expect(
      runJson([
        "get",
        "block-filterable-list-toolbar",
        "--section",
        "ownership",
      ]),
    ).toEqual(expectedGet);
  }, 60_000);
});
