import { defineDocsMcpConfig } from "storybook-addon-docs-mcp";
import { createUiDocsProvider } from "../scripts/ui-generator/mcp/ui-provider.js";

export default defineDocsMcpConfig({
  provider: createUiDocsProvider(),
  mcpPath: "/docs-mcp",
  manifestsPrefix: "/ui-docs/manifests",
  cacheDir: ".cache/ui-docs",
  clientName: "stevejuma-ui-docs",
  search: {
    synonyms: {
      picker: ["select", "dropdown", "combobox"],
      dialog: ["modal"],
      toggle: ["switch"],
      review: ["approval", "accept", "reject"],
      filter: ["facet", "refine"],
    },
  },
  retrieval: {
    maxChars: 12_000,
  },
});
