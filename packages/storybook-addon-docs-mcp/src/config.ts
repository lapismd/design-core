import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createJiti } from "jiti";
import type { DocsMcpConfig } from "./types.js";

export const DEFAULT_CONFIG_PATH = ".storybook/docs-mcp.config.ts";

export function resolveConfigPath(root: string, configPath?: string): string {
  const candidate =
    configPath ??
    process.env.DOCS_MCP_CONFIG ??
    process.env.UI_DOCS_CONFIG ??
    DEFAULT_CONFIG_PATH;
  return path.resolve(root, candidate);
}

export async function loadDocsMcpConfig(
  root: string,
  configPath?: string,
): Promise<{ config: DocsMcpConfig; configPath: string; root: string }> {
  const resolvedRoot = path.resolve(
    process.env.DOCS_MCP_ROOT ?? process.env.UI_DOCS_ROOT ?? root,
  );
  const resolvedConfigPath = resolveConfigPath(resolvedRoot, configPath);
  if (!existsSync(resolvedConfigPath)) {
    throw new Error(
      `Docs MCP config not found at ${resolvedConfigPath}. Run "docs-mcp init".`,
    );
  }
  const jiti = createJiti(pathToFileURL(resolvedConfigPath).href);
  const config = await jiti.import<DocsMcpConfig>(resolvedConfigPath, {
    default: true,
  });
  if (!config || typeof config !== "object" || !config.provider) {
    throw new Error(
      `Docs MCP config at ${resolvedConfigPath} must default-export a config with a provider.`,
    );
  }
  const configRoot = path.resolve(resolvedRoot, config.root ?? ".");
  return {
    config: { ...config, root: configRoot },
    configPath: resolvedConfigPath,
    root: configRoot,
  };
}
