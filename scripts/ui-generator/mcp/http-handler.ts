import {
  createDocsHttpHandler as createCoreDocsHttpHandler,
  type DocsHttpHandler,
} from "../../../packages/storybook-addon-docs-mcp/src/http-handler.js";
import { createUiDocsProvider } from "./ui-provider.js";

export type DocsHttpHandlerOptions = {
  packageRoot: string;
  baseUrl?: string | (() => string);
  mcpPath?: string;
  alsoAcceptLegacyMcpPath?: boolean;
  noCache?: boolean;
  manifestsPrefix?: string;
};

/** Compatibility adapter for the UI catalog's historical HTTP entry point. */
export function createDocsHttpHandler(
  options: DocsHttpHandlerOptions,
): Promise<DocsHttpHandler> {
  return createCoreDocsHttpHandler({
    root: options.packageRoot,
    config: {
      root: options.packageRoot,
      provider: createUiDocsProvider(),
      mcpPath: options.mcpPath,
      manifestsPrefix: options.manifestsPrefix,
      cacheDir: ".cache/ui-docs",
    },
    baseUrl: options.baseUrl,
    mcpPath: options.mcpPath,
    alsoAcceptLegacyMcpPath: options.alsoAcceptLegacyMcpPath,
    noCache: options.noCache,
    manifestsPrefix: options.manifestsPrefix,
  });
}

export type { DocsHttpHandler };
