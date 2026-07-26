import { createServer } from "node:http";
import { createDocsHttpHandler } from "../http-handler.js";
import type { DocsMcpConfig } from "../types.js";

export type DocsHttpServerOptions = {
  root: string;
  config: DocsMcpConfig;
  configPath?: string;
  host?: string;
  port?: number;
  baseUrl?: string;
  noCache?: boolean;
};

export async function startDocsMcpHttpServer(options: DocsHttpServerOptions) {
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 9011;
  const baseUrl = options.baseUrl ?? `http://${host}:${port}`;
  const handler = await createDocsHttpHandler({
    root: options.root,
    config: options.config,
    configPath: options.configPath,
    baseUrl,
    mcpPath: options.config.mcpPath ?? "/docs-mcp",
    alsoAcceptLegacyMcpPath: true,
    noCache: options.noCache,
  });
  const server = createServer(async (req, res) => {
    const pathname = new URL(req.url ?? "/", baseUrl).pathname;
    if (pathname === "/" || pathname === "/health") {
      const title = handler.service.getCatalog().project.title;
      res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      res.end(
        [
          `${title} docs server`,
          `MCP: ${baseUrl}${handler.mcpPath} (also /mcp)`,
          `llms: ${baseUrl}/llms.txt`,
          "",
        ].join("\n"),
      );
      return;
    }
    if (!(await handler.handle(req, res))) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  const address = server.address();
  const actualPort =
    typeof address === "object" && address ? address.port : port;
  const actualBaseUrl = options.baseUrl ?? `http://${host}:${actualPort}`;
  return {
    host,
    port: actualPort,
    baseUrl: actualBaseUrl,
    service: handler.service,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}
