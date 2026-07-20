import type { IncomingMessage, ServerResponse } from "node:http";
import { createDocsService, type DocsService } from "./docs-service.js";

export type DocsHttpHandlerOptions = {
  packageRoot: string;
  /** Origin for llms absolute links. Defaults to request Host / localhost:9009. */
  baseUrl?: string | (() => string);
  /** Path where the docs MCP tools are mounted. */
  mcpPath?: string;
  /** Also accept `/mcp` when true (standalone server convenience). */
  alsoAcceptLegacyMcpPath?: boolean;
  noCache?: boolean;
  /** Path prefix for JSON manifests (default `/ui-docs/manifests`). */
  manifestsPrefix?: string;
};

export type DocsHttpHandler = {
  service: DocsService;
  mcpPath: string;
  /**
   * Handle a Node HTTP request. Returns true when the request was handled
   * (caller should not call next()).
   */
  handle: (req: IncomingMessage, res: ServerResponse) => Promise<boolean>;
};

type McpHandler = (request: Request) => Promise<Response>;

function requestOrigin(req: IncomingMessage, fallback: string): string {
  const host = req.headers.host?.trim();
  if (!host) return fallback;
  const protoHeader = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(protoHeader)
    ? protoHeader[0]
    : protoHeader?.split(",")[0]?.trim();
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const method = req.method ?? "GET";
  if (method === "GET" || method === "HEAD") return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function writeFetchResponse(
  res: ServerResponse,
  response: Response,
): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
}

export async function createDocsHttpHandler(
  options: DocsHttpHandlerOptions,
): Promise<DocsHttpHandler> {
  const mcpPath = options.mcpPath ?? "/docs-mcp";
  const manifestsPrefix = options.manifestsPrefix ?? "/ui-docs/manifests";
  const fallbackBase = "http://localhost:9009";
  let lastOrigin = fallbackBase;

  const service = createDocsService({
    packageRoot: options.packageRoot,
    baseUrl:
      options.baseUrl ??
      (() => lastOrigin),
    mcpPath,
    noCache: options.noCache,
  });

  const { createStorybookMcpHandler } = await import("@storybook/mcp");
  const mcpHandler: McpHandler = await createStorybookMcpHandler({
    manifestProvider: service.manifestProvider,
  });

  async function handleMcp(
    req: IncomingMessage,
    res: ServerResponse,
    url: URL,
  ): Promise<void> {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) headers.append(key, item);
      } else {
        headers.set(key, value);
      }
    }
    const method = req.method ?? "GET";
    const body = await readBody(req);
    const request = new Request(url, {
      method,
      headers,
      body:
        body && body.length > 0 ? (body as unknown as BodyInit) : undefined,
      // @ts-expect-error undici duplex for streaming bodies in Node
      duplex: body && body.length > 0 ? "half" : undefined,
    });
    const response = await mcpHandler(request);
    await writeFetchResponse(res, response);
  }

  return {
    service,
    mcpPath,
    async handle(req, res) {
      try {
        const origin = requestOrigin(req, fallbackBase);
        lastOrigin = origin;
        const url = new URL(req.url ?? "/", origin);
        const { pathname } = url;

        const isMcp =
          pathname === mcpPath ||
          pathname.startsWith(`${mcpPath}/`) ||
          (options.alsoAcceptLegacyMcpPath === true &&
            (pathname === "/mcp" || pathname.startsWith("/mcp/")));

        if (isMcp) {
          await handleMcp(req, res, url);
          return true;
        }

        if (pathname === `${manifestsPrefix}/components.json`) {
          res.writeHead(200, {
            "content-type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(service.buildComponentsManifest(), null, 2));
          return true;
        }

        if (pathname === `${manifestsPrefix}/docs.json`) {
          res.writeHead(200, {
            "content-type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(service.buildDocsManifest(), null, 2));
          return true;
        }

        // Standalone convenience: also expose classic /manifests/* paths.
        if (
          options.alsoAcceptLegacyMcpPath &&
          (pathname === "/manifests/components.json" ||
            pathname === "/manifests/docs.json")
        ) {
          const body =
            pathname === "/manifests/components.json"
              ? service.buildComponentsManifest()
              : service.buildDocsManifest();
          res.writeHead(200, {
            "content-type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(body, null, 2));
          return true;
        }

        if (pathname === "/ui-docs" || pathname === "/ui-docs/") {
          res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
          res.end(
            [
              "@stevejuma/ui docs (Storybook-mounted)",
              `MCP: ${origin}${mcpPath}`,
              `llms: ${origin}/llms.txt`,
              `manifests: ${origin}${manifestsPrefix}/components.json`,
              "",
            ].join("\n"),
          );
          return true;
        }

        if (
          pathname === "/llms" ||
          pathname === "/llms.txt" ||
          pathname === "/llms.md" ||
          pathname.startsWith("/llms/")
        ) {
          const llms = service.resolveLlmsPath(pathname);
          res.writeHead(llms.status, { "content-type": llms.contentType });
          res.end(llms.body);
          return true;
        }

        return false;
      } catch (error) {
        res.statusCode = 500;
        res.setHeader("content-type", "text/plain; charset=utf-8");
        res.end(error instanceof Error ? error.message : String(error));
        return true;
      }
    },
  };
}
