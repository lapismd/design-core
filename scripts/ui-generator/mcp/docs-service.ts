import {
  createDocsService as createCoreDocsService,
  type DocsService as CoreDocsService,
} from "../../../packages/storybook-addon-docs-mcp/src/service.js";
import type { DocsCache } from "./cache.js";
import { createUiDocsProvider } from "./ui-provider.js";

export type DocsServiceOptions = {
  packageRoot: string;
  baseUrl?: string | (() => string);
  mcpPath?: string;
  cache?: DocsCache;
  noCache?: boolean;
};

/** Compatibility adapter for the existing `pnpm ui` commands and tests. */
export function createDocsService(options: DocsServiceOptions) {
  return createCoreDocsService({
    root: options.packageRoot,
    config: {
      root: options.packageRoot,
      provider: createUiDocsProvider(),
      mcpPath: options.mcpPath,
      cacheDir: ".cache/ui-docs",
    },
    baseUrl: options.baseUrl,
    mcpPath: options.mcpPath,
    cache: options.cache,
    noCache: options.noCache,
  });
}

export type DocsService = CoreDocsService;
