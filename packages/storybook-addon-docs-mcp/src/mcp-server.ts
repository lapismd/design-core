import {
  STORYBOOK_MCP_INSTRUCTIONS,
  addGetDocumentationTool,
  addGetStoryDocumentationTool,
  addListAllDocumentationTool,
  type StorybookContext,
} from "@storybook/mcp";
import { ValibotJsonSchemaAdapter } from "@tmcp/adapter-valibot";
import { McpServer } from "tmcp";
import * as v from "valibot";
import type { DocsMcpEntryKind, DocsMcpGetFormat } from "./discovery.js";
import type { DocsService } from "./service.js";

export const DOCS_MCP_INSTRUCTIONS = `${STORYBOOK_MCP_INSTRUCTIONS}

For intent-based discovery, call search first, then call get with an exact result ID. Keep search results small and retrieve only the entry or section needed. Use list-all-documentation only for exhaustive browsing or Storybook story-ID discovery. Never invent component, guide, block, template, prop, or import IDs.`;

const kindSchema = v.picklist([
  "component",
  "guide",
  "template",
  "block",
] satisfies DocsMcpEntryKind[]);
const formatSchema = v.picklist([
  "bounded",
  "full",
  "dense",
] satisfies DocsMcpGetFormat[]);

const searchResultSchema = v.object({
  id: v.string(),
  kind: kindSchema,
  name: v.string(),
  summary: v.string(),
  score: v.number(),
  reason: v.string(),
  path: v.string(),
  importPath: v.optional(v.string()),
});
const searchOutputSchema = v.object({
  query: v.string(),
  normalizedQuery: v.string(),
  results: v.array(searchResultSchema),
  limit: v.number(),
});
const candidateSchema = v.object({
  id: v.string(),
  kind: kindSchema,
  name: v.string(),
});
const sectionSchema = v.object({ id: v.string(), title: v.string() });
const getOutputSchema = v.object({
  status: v.picklist(["ok", "not_found", "ambiguous"]),
  requestedId: v.string(),
  id: v.optional(v.string()),
  kind: v.optional(kindSchema),
  name: v.optional(v.string()),
  summary: v.optional(v.string()),
  path: v.optional(v.string()),
  importPath: v.optional(v.string()),
  format: v.optional(formatSchema),
  section: v.optional(v.string()),
  markdown: v.optional(v.string()),
  truncated: v.optional(v.boolean()),
  sections: v.optional(v.array(sectionSchema)),
  relatedIds: v.optional(v.array(v.string())),
  candidates: v.optional(v.array(candidateSchema)),
  hint: v.optional(v.string()),
});

function searchText(result: ReturnType<DocsService["search"]>): string {
  if (result.results.length === 0) {
    return `No confident documentation matches for "${result.query}".`;
  }
  return [
    `Found ${result.results.length} documentation matches for "${result.query}":`,
    ...result.results.map(
      (entry) =>
        `- ${entry.id} [${entry.kind}] (${entry.score}, ${entry.reason})${entry.importPath ? ` — ${entry.importPath}` : ""}: ${entry.summary}`,
    ),
    "",
    "Call get with one exact ID.",
  ].join("\n");
}

function getText(result: ReturnType<DocsService["get"]>): string {
  if (result.status === "ok") return result.markdown ?? "";
  const candidates = result.candidates?.length
    ? `\n${result.candidates.map((entry) => `- ${entry.id} [${entry.kind}] — ${entry.name}`).join("\n")}`
    : "";
  return `${result.status === "ambiguous" ? "Ambiguous documentation ID" : "Documentation not found"}: ${result.requestedId}.${candidates}${result.hint ? `\n${result.hint}` : ""}`;
}

export async function createDocsMcpServer(service: DocsService) {
  const server = new McpServer(
    {
      name: "storybook-addon-docs-mcp",
      version: "0.1.0",
      description: "Documentation generated from Storybook project sources.",
    },
    {
      adapter: new ValibotJsonSchemaAdapter(),
      instructions: DOCS_MCP_INSTRUCTIONS,
      capabilities: { tools: { listChanged: true } },
    },
  ).withContext<StorybookContext>();
  await addListAllDocumentationTool(server);
  await addGetStoryDocumentationTool(server);
  await addGetDocumentationTool(server);
  server.tool(
    {
      name: "search",
      title: "Search documentation",
      description:
        "Rank components, guides, curated blocks, and templates for a natural-language intent. Follow with get using an exact returned ID.",
      schema: v.object({
        query: v.pipe(v.string(), v.minLength(1)),
        kinds: v.optional(v.array(kindSchema)),
        limit: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
      }),
      outputSchema: searchOutputSchema,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ query, kinds, limit }) => {
      const result = service.search({ query, kinds, limit });
      return {
        content: [{ type: "text", text: searchText(result) }],
        structuredContent: result,
      };
    },
  );
  server.tool(
    {
      name: "get",
      title: "Get documentation",
      description:
        "Retrieve one exact documentation ID, optionally selecting a stable section or full/dense output. Defaults to a bounded response.",
      schema: v.object({
        id: v.pipe(v.string(), v.minLength(1)),
        section: v.optional(v.string()),
        format: v.optional(formatSchema),
      }),
      outputSchema: getOutputSchema,
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    ({ id, section, format }) => {
      const result = service.get({ id, section, format });
      return {
        content: [{ type: "text", text: getText(result) }],
        structuredContent: result,
      };
    },
  );
  return server;
}
