#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";
import { startDocsMcpHttpServer } from "../../../packages/storybook-addon-docs-mcp/src/node/server.js";
import { createUiDocsProvider } from "./ui-provider.js";

export type McpServerOptions = {
  packageRoot: string;
  host?: string;
  port?: number;
  baseUrl?: string;
  noCache?: boolean;
};

/** Compatibility wrapper for `pnpm ui mcp`. */
export function startDocsMcpServer(options: McpServerOptions) {
  return startDocsMcpHttpServer({
    root: options.packageRoot,
    config: {
      root: options.packageRoot,
      provider: createUiDocsProvider(),
      mcpPath: "/docs-mcp",
      manifestsPrefix: "/ui-docs/manifests",
      cacheDir: ".cache/ui-docs",
    },
    host: options.host,
    port: options.port,
    baseUrl: options.baseUrl,
    noCache: options.noCache,
  });
}

function env(primary: string, legacy: string): string | undefined {
  return process.env[primary] ?? process.env[legacy];
}

async function main() {
  const args = process.argv.slice(2);
  const value = (name: string) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const packageRoot = path.resolve(value("--root") ?? process.cwd());
  const host =
    value("--host") ?? env("DOCS_MCP_HOST", "UI_DOCS_HOST") ?? "127.0.0.1";
  const port = Number(
    value("--port") ?? env("DOCS_MCP_PORT", "UI_DOCS_PORT") ?? 9011,
  );
  const baseUrl =
    value("--base-url") ?? env("DOCS_MCP_BASE_URL", "UI_DOCS_BASE_URL");
  const noCache =
    args.includes("--no-cache") ||
    ["0", "false"].includes(env("DOCS_MCP_CACHE", "UI_DOCS_CACHE") ?? "");
  const started = await startDocsMcpServer({
    packageRoot,
    host,
    port,
    baseUrl,
    noCache,
  });
  console.log(`UI docs MCP listening on ${started.baseUrl}`);
  console.log(`  MCP:       ${started.baseUrl}/docs-mcp`);
  console.log(`  llms.txt:  ${started.baseUrl}/llms.txt`);
}

const isDirect =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirect) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
