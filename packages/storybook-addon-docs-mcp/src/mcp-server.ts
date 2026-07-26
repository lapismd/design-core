import {
  STORYBOOK_MCP_INSTRUCTIONS,
  addGetDocumentationTool,
  addGetStoryDocumentationTool,
  addListAllDocumentationTool,
  type StorybookContext,
} from "@storybook/mcp";
import { ValibotJsonSchemaAdapter } from "@tmcp/adapter-valibot";
import { McpServer } from "tmcp";
import type { DocsService } from "./service.js";

export async function createDocsMcpServer(service: DocsService) {
  const server = new McpServer(
    {
      name: "storybook-addon-docs-mcp",
      version: "0.1.0",
      description: "Documentation generated from Storybook project sources.",
    },
    {
      adapter: new ValibotJsonSchemaAdapter(),
      instructions: STORYBOOK_MCP_INSTRUCTIONS,
      capabilities: { tools: { listChanged: true } },
    },
  ).withContext<StorybookContext>();
  await addListAllDocumentationTool(server);
  await addGetStoryDocumentationTool(server);
  await addGetDocumentationTool(server);
  return server;
}
