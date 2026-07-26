import { defineDocsMcpConfig } from "storybook-addon-docs-mcp";
import { createUiDocsProvider } from "../scripts/ui-generator/mcp/ui-provider.js";

export default defineDocsMcpConfig({
  provider: createUiDocsProvider(),
  mcpPath: "/docs-mcp",
  manifestsPrefix: "/ui-docs/manifests",
  cacheDir: ".cache/ui-docs",
  clientName: "stevejuma-ui-docs",
});
