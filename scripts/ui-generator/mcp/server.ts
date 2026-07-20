#!/usr/bin/env node
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createDocsHttpHandler } from "./http-handler.js";

export type McpServerOptions = {
  packageRoot: string;
  host?: string;
  port?: number;
  baseUrl?: string;
  noCache?: boolean;
};

function parseServerArgs(argv: string[]) {
  let host = "127.0.0.1";
  let port = 9010;
  let noCache = false;
  let baseUrl: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]!;
    if (token === "--host" && argv[i + 1]) {
      host = argv[++i]!;
    } else if (token === "--port" && argv[i + 1]) {
      port = Number(argv[++i]);
    } else if (token === "--base-url" && argv[i + 1]) {
      baseUrl = argv[++i]!;
    } else if (token === "--no-cache") {
      noCache = true;
    }
  }
  if (process.env.UI_DOCS_HOST) host = process.env.UI_DOCS_HOST;
  if (process.env.UI_DOCS_PORT) port = Number(process.env.UI_DOCS_PORT);
  if (process.env.UI_DOCS_BASE_URL) baseUrl = process.env.UI_DOCS_BASE_URL;
  if (process.env.UI_DOCS_CACHE === "0" || process.env.UI_DOCS_CACHE === "false") {
    noCache = true;
  }
  return { host, port, noCache, baseUrl };
}

/** Standalone docs server (fallback when Storybook is not running). */
export async function startDocsMcpServer(options: McpServerOptions) {
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 9010;
  const baseUrl = options.baseUrl ?? `http://${host}:${port}`;
  const handler = await createDocsHttpHandler({
    packageRoot: options.packageRoot,
    baseUrl,
    mcpPath: "/docs-mcp",
    alsoAcceptLegacyMcpPath: true,
    noCache: options.noCache,
  });

  const server = createServer(async (req, res) => {
    const pathname = new URL(req.url ?? "/", baseUrl).pathname;
    if (pathname === "/" || pathname === "/health") {
      res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      res.end(
        [
          "@stevejuma/ui docs server (standalone)",
          `MCP: ${baseUrl}/docs-mcp (also /mcp)`,
          `llms: ${baseUrl}/llms.txt`,
          `manifests: ${baseUrl}/ui-docs/manifests/components.json`,
          "",
          "Prefer mounting via Storybook: http://localhost:9009/docs-mcp",
          "",
        ].join("\n"),
      );
      return;
    }

    const handled = await handler.handle(req, res);
    if (!handled) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve());
  });

  return {
    host,
    port,
    baseUrl,
    service: handler.service,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

async function main() {
  const args = parseServerArgs(process.argv.slice(2));
  const packageRoot = process.cwd();
  const started = await startDocsMcpServer({
    packageRoot,
    host: args.host,
    port: args.port,
    baseUrl: args.baseUrl,
    noCache: args.noCache,
  });
  console.log(`UI docs MCP listening on ${started.baseUrl}`);
  console.log(`  MCP:       ${started.baseUrl}/docs-mcp`);
  console.log(`  llms.txt:  ${started.baseUrl}/llms.txt`);
  console.log(
    `  manifests: ${started.baseUrl}/ui-docs/manifests/components.json`,
  );
  console.log(
    "(Prefer Storybook mount at http://localhost:9009/docs-mcp when the catalog is running.)",
  );
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
