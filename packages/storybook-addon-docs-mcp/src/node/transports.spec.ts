import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { loadDocsMcpConfig } from "../config.js";
import { startDocsMcpHttpServer } from "./server.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const processes: ChildProcessWithoutNullStreams[] = [];

function spawnStdio(): {
  child: ChildProcessWithoutNullStreams;
  request(message: object): Promise<Record<string, unknown>>;
  lines: string[];
} {
  const child = spawn(
    process.execPath,
    [
      "--import",
      "tsx",
      "packages/storybook-addon-docs-mcp/src/node/cli.ts",
      "stdio",
      "--root",
      packageRoot,
      "--config",
      ".storybook/docs-mcp.config.ts",
      "--no-cache",
    ],
    { cwd: packageRoot, stdio: ["pipe", "pipe", "pipe"] },
  );
  processes.push(child);
  const pending: Array<(value: Record<string, unknown>) => void> = [];
  const lines: string[] = [];
  let buffer = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    buffer += chunk;
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      if (!line.trim()) continue;
      lines.push(line);
      const resolve = pending.shift();
      if (resolve) resolve(JSON.parse(line) as Record<string, unknown>);
    }
  });
  return {
    child,
    lines,
    request(message) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error(`Timed out waiting for stdio response`)),
          15_000,
        );
        pending.push((value) => {
          clearTimeout(timer);
          resolve(value);
        });
        child.stdin.write(`${JSON.stringify(message)}\n`);
      });
    },
  };
}

async function initialize(client: ReturnType<typeof spawnStdio>, id: number) {
  return client.request({
    jsonrpc: "2.0",
    id,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: `test-${id}`, version: "1.0.0" },
    },
  });
}

function parseHttpRpc(text: string): Record<string, unknown> {
  const data = text
    .split(/\r?\n/)
    .find((line) => line.startsWith("data: "))
    ?.slice(6);
  return JSON.parse(data ?? text) as Record<string, unknown>;
}

afterEach(async () => {
  await Promise.all(
    processes.splice(0).map(
      (child) =>
        new Promise<void>((resolve) => {
          if (child.exitCode !== null) {
            resolve();
            return;
          }
          child.once("exit", () => resolve());
          child.kill("SIGTERM");
        }),
    ),
  );
});

describe("Docs MCP transports", () => {
  it("serves HTTP on the actual bound port", async () => {
    const loaded = await loadDocsMcpConfig(
      packageRoot,
      ".storybook/docs-mcp.config.ts",
    );
    const server = await startDocsMcpHttpServer({
      root: loaded.root,
      config: loaded.config,
      port: 0,
    });
    try {
      expect(server.port).toBeGreaterThan(0);
      const health = await fetch(`${server.baseUrl}/health`);
      expect(await health.text()).toContain("@stevejuma/ui docs server");
      const llms = await fetch(`${server.baseUrl}/llms.txt`);
      const llmsText = await llms.text();
      expect(llmsText).toContain("# @stevejuma/ui");
      expect(llmsText).toContain("## Blocks");
      const artifacts = await fetch(
        `${server.baseUrl}/ui-docs/manifests/artifacts.json`,
      );
      expect(await artifacts.json()).toMatchObject({
        artifacts: {
          "block-filterable-list-toolbar": {
            kind: "block",
          },
        },
      });

      const initialized = await fetch(`${server.baseUrl}/docs-mcp`, {
        method: "POST",
        headers: {
          accept: "application/json, text/event-stream",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 10,
          method: "initialize",
          params: {
            protocolVersion: "2025-06-18",
            capabilities: {},
            clientInfo: { name: "http-test", version: "1.0.0" },
          },
        }),
      });
      expect(initialized.status).toBe(200);
      expect(parseHttpRpc(await initialized.text()).result).toBeDefined();
      const session = initialized.headers.get("mcp-session-id");
      expect(session).toBeTruthy();
      const searched = await fetch(`${server.baseUrl}/docs-mcp`, {
        method: "POST",
        headers: {
          accept: "application/json, text/event-stream",
          "content-type": "application/json",
          "mcp-session-id": session!,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 11,
          method: "tools/call",
          params: {
            name: "search",
            arguments: { query: "filter list toolbar", limit: 2 },
          },
        }),
      });
      expect(parseHttpRpc(await searched.text())).toMatchObject({
        result: {
          structuredContent: {
            results: [
              { id: "block-filterable-list-toolbar", kind: "block" },
              { id: "filter-search-filter-bar", kind: "component" },
            ],
          },
        },
      });
    } finally {
      await server.close();
    }
  });

  it("runs two independent stdio servers without ports or stdout noise", async () => {
    const first = spawnStdio();
    const second = spawnStdio();
    const [a, b] = await Promise.all([
      initialize(first, 1),
      initialize(second, 2),
    ]);
    expect(a.result).toBeDefined();
    expect(b.result).toBeDefined();
    const tools = await first.request({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/list",
      params: {},
    });
    const listedTools = (
      tools.result as {
        tools: Array<{ name: string; outputSchema?: Record<string, unknown> }>;
      }
    ).tools;
    expect(listedTools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        "list-all-documentation",
        "get-documentation",
        "get-documentation-for-story",
        "search",
        "get",
      ]),
    );
    expect(
      listedTools.find((tool) => tool.name === "search")?.outputSchema,
    ).toMatchObject({ type: "object" });
    expect(
      listedTools.find((tool) => tool.name === "get")?.outputSchema,
    ).toMatchObject({ type: "object" });
    const search = await first.request({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "search",
        arguments: { query: "accept reject changes", kinds: ["block"] },
      },
    });
    expect(search).toMatchObject({
      result: {
        structuredContent: {
          results: [
            {
              id: "block-reviewable-form-workflow",
              kind: "block",
            },
          ],
        },
      },
    });
    const get = await first.request({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "get",
        arguments: {
          id: "block-reviewable-form-workflow",
          format: "dense",
        },
      },
    });
    expect(get).toMatchObject({
      result: {
        structuredContent: {
          status: "ok",
          id: "block-reviewable-form-workflow",
          kind: "block",
          format: "dense",
        },
      },
    });
    expect(first.lines.every((line) => JSON.parse(line))).toBe(true);
    expect(second.lines.every((line) => JSON.parse(line))).toBe(true);
  }, 30_000);
});
