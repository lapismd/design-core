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
      noCache: true,
    });
    try {
      expect(server.port).toBeGreaterThan(0);
      const health = await fetch(`${server.baseUrl}/health`);
      expect(await health.text()).toContain("@stevejuma/ui docs server");
      const llms = await fetch(`${server.baseUrl}/llms.txt`);
      expect(await llms.text()).toContain("# @stevejuma/ui");
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
    expect(
      (tools.result as { tools: Array<{ name: string }> }).tools.map(
        (tool) => tool.name,
      ),
    ).toEqual(
      expect.arrayContaining([
        "list-all-documentation",
        "get-documentation",
        "get-documentation-for-story",
      ]),
    );
    expect(first.lines.every((line) => JSON.parse(line))).toBe(true);
    expect(second.lines.every((line) => JSON.parse(line))).toBe(true);
  }, 30_000);
});
