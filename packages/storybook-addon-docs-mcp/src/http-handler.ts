import type { IncomingMessage, ServerResponse } from "node:http";
import type { StorybookContext } from "@storybook/mcp";
import { HttpTransport } from "@tmcp/transport-http";
import { createDocsMcpServer } from "./mcp-server.js";
import {
  createDocsService,
  type DocsService,
  type DocsServiceOptions,
} from "./service.js";

export type DocsHttpHandlerOptions = DocsServiceOptions & {
  alsoAcceptLegacyMcpPath?: boolean;
  manifestsPrefix?: string;
};

export type DocsHttpHandler = {
  service: DocsService;
  mcpPath: string;
  handle(req: IncomingMessage, res: ServerResponse): Promise<boolean>;
};

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
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

export async function createDocsHttpHandler(
  options: DocsHttpHandlerOptions,
): Promise<DocsHttpHandler> {
  const fallbackBase =
    typeof options.baseUrl === "string"
      ? options.baseUrl
      : "http://localhost:9009";
  let lastOrigin = fallbackBase;
  const service = createDocsService({
    ...options,
    baseUrl: options.baseUrl ?? (() => lastOrigin),
  });
  const mcpServer = await createDocsMcpServer(service);
  const mcpTransport = new HttpTransport<StorybookContext>(mcpServer, {
    path: null,
  });
  const manifestsPrefix =
    options.manifestsPrefix ??
    options.config.manifestsPrefix ??
    "/ui-docs/manifests";

  return {
    service,
    mcpPath: service.mcpPath,
    async handle(req, res) {
      try {
        const origin = requestOrigin(req, fallbackBase);
        lastOrigin = origin;
        const url = new URL(req.url ?? "/", origin);
        const pathname = url.pathname;
        const isMcp =
          pathname === service.mcpPath ||
          pathname.startsWith(`${service.mcpPath}/`) ||
          (options.alsoAcceptLegacyMcpPath === true &&
            (pathname === "/mcp" || pathname.startsWith("/mcp/")));
        if (isMcp) {
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (Array.isArray(value)) {
              for (const item of value) headers.append(key, item);
            } else {
              headers.set(key, value);
            }
          }
          const body = await readBody(req);
          const request = new Request(url, {
            method: req.method ?? "GET",
            headers,
            body:
              body && body.length > 0
                ? (body as unknown as BodyInit)
                : undefined,
            // @ts-expect-error Node fetch requires duplex for request bodies.
            duplex: body && body.length > 0 ? "half" : undefined,
          });
          const response = await mcpTransport.respond(request, {
            manifestProvider: service.manifestProvider,
            request,
          });
          if (response) {
            await writeFetchResponse(res, response);
          } else {
            res.writeHead(202);
            res.end();
          }
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
        if (pathname === `${manifestsPrefix}/artifacts.json`) {
          res.writeHead(200, {
            "content-type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(service.buildArtifactsManifest(), null, 2));
          return true;
        }
        if (
          options.alsoAcceptLegacyMcpPath &&
          (pathname === "/manifests/components.json" ||
            pathname === "/manifests/docs.json")
        ) {
          const manifest = pathname.includes("components")
            ? service.buildComponentsManifest()
            : service.buildDocsManifest();
          res.writeHead(200, {
            "content-type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(manifest, null, 2));
          return true;
        }
        if (pathname === "/ui-docs" || pathname === "/ui-docs/") {
          const catalog = service.getCatalog();
          res.writeHead(200, {
            "content-type": "text/plain; charset=utf-8",
          });
          res.end(
            [
              `${catalog.project.title} docs`,
              `MCP: ${origin}${service.mcpPath}`,
              `llms: ${origin}/llms.txt`,
              `manifests: ${origin}${manifestsPrefix}/components.json`,
              `artifacts: ${origin}${manifestsPrefix}/artifacts.json`,
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
          const page = service.resolveLlmsPath(pathname);
          res.writeHead(page.status, { "content-type": page.contentType });
          res.end(page.body);
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
