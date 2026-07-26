import path from "node:path";
import { DEFAULT_CONFIG_PATH, loadDocsMcpConfig } from "./config.js";
import { createDocsHttpHandler } from "./http-handler.js";

type DevServerApp = {
  use(
    handler: (
      req: Parameters<
        Awaited<ReturnType<typeof createDocsHttpHandler>>["handle"]
      >[0],
      res: Parameters<
        Awaited<ReturnType<typeof createDocsHttpHandler>>["handle"]
      >[1],
      next: () => void,
    ) => void | Promise<void>,
  ): void;
};

type StorybookPresetOptions = {
  port?: number;
  configDir?: string;
  config?: string;
  root?: string;
  noCache?: boolean;
  options?: {
    config?: string;
    root?: string;
    noCache?: boolean;
  };
};

function hostOptions(options: StorybookPresetOptions) {
  return {
    config: options.options?.config ?? options.config,
    root: options.options?.root ?? options.root,
    noCache: options.options?.noCache ?? options.noCache,
  };
}

/**
 * Storybook 10 server hook. This sees Storybook's actual public port, unlike a
 * Vite `configureServer` hook whose internal port may still be Vite's 5173.
 */
export async function experimental_devServer(
  app: DevServerApp,
  options: StorybookPresetOptions,
): Promise<void> {
  const host = hostOptions(options);
  const configDir = path.resolve(options.configDir ?? ".storybook");
  const root = path.resolve(
    host.root ??
      process.env.DOCS_MCP_ROOT ??
      process.env.UI_DOCS_ROOT ??
      path.dirname(configDir),
  );
  const configPath =
    host.config ??
    process.env.DOCS_MCP_CONFIG ??
    process.env.UI_DOCS_CONFIG ??
    path.relative(root, path.join(configDir, "docs-mcp.config.ts")) ??
    DEFAULT_CONFIG_PATH;
  const loaded = await loadDocsMcpConfig(root, configPath);
  const port = options.port ?? 6006;
  const baseUrl = `http://localhost:${port}`;
  const handler = await createDocsHttpHandler({
    root: loaded.root,
    config: loaded.config,
    baseUrl,
    noCache: host.noCache,
  });
  app.use(async (req, res, next) => {
    if (!(await handler.handle(req, res))) next();
  });
  console.log(
    `[docs-mcp] Docs MCP at ${baseUrl}${handler.mcpPath} (llms: ${baseUrl}/llms.txt)`,
  );
}
