import path from "node:path";
import type { Plugin } from "vite";
import { createDocsHttpHandler } from "../scripts/ui-generator/mcp/http-handler.js";

/**
 * Mounts the Svelte docs MCP + llms.txt surface on the Storybook Vite server:
 * - POST/GET `/docs-mcp` — Storybook docs tools (custom Svelte manifests)
 * - `/llms.txt`, `/llms.md`, `/llms/**` — LLM / HTML docs pages
 * - `/ui-docs/manifests/*.json` — debug manifests
 *
 * Leaves `@storybook/addon-mcp` at `/mcp` for preview / test tools.
 */
export function uiDocsMiddlewarePlugin(): Plugin {
  return {
    name: "ui-docs-middleware",
    async configureServer(server) {
      const packageRoot = path.resolve(server.config.root);
      const handler = await createDocsHttpHandler({
        packageRoot,
        mcpPath: "/docs-mcp",
        noCache: process.env.UI_DOCS_CACHE === "0",
      });

      server.middlewares.use(async (req, res, next) => {
        const handled = await handler.handle(req, res);
        if (!handled) next();
      });

      const port = server.config.server.port ?? 9009;
      const host = server.config.server.host || "localhost";
      const displayHost = host === true ? "localhost" : String(host);
      console.log(
        `[ui-docs] Docs MCP at http://${displayHost}:${port}/docs-mcp (llms: /llms.txt)`,
      );
    },
  };
}
