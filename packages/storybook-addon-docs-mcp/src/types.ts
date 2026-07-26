import type { ReactDocgenShape } from "./svelte/svelte-props.js";

export type DocsMcpStory = {
  id: string;
  name: string;
  snippet?: string;
};

export type DocsMcpSection = {
  /** Stable slug derived from the authored Markdown heading. */
  id: string;
  title: string;
  /** Complete authored Markdown for this section, including its heading. */
  markdown: string;
};

export type DocsMcpEntryMetadata = {
  /** Authored retrieval terms. These rank above inferred prose matches. */
  keywords?: string[];
  /** Stable Markdown sections. Providers may author these or let the service parse them. */
  sections?: DocsMcpSection[];
  /** Exact IDs that are useful follow-up reading. */
  relatedIds?: string[];
  /** Optional provider-authored compact representation. */
  denseMarkdown?: string;
};

export type DocsMcpComponent = DocsMcpEntryMetadata & {
  /** Stable MCP manifest id. */
  id: string;
  /** URL grouping used by `/llms/<group>/<slug>`. */
  group: string;
  slug: string;
  name: string;
  summary: string;
  path: string;
  importPath?: string;
  markdown: string;
  stories?: DocsMcpStory[];
  reactDocgen?: ReactDocgenShape;
  sourceFiles: string[];
};

export type DocsMcpDocument = DocsMcpEntryMetadata & {
  id: string;
  group: string;
  slug: string;
  name: string;
  title?: string;
  summary: string;
  path: string;
  markdown: string;
  sourceFiles: string[];
};

export type DocsMcpArtifact = DocsMcpEntryMetadata & {
  id: string;
  kind: "template" | "block";
  group: string;
  slug: string;
  name: string;
  summary: string;
  path: string;
  /** Human-readable provenance, for example a story or maintained recipe. */
  source: string;
  componentIds: string[];
  documentation: string;
  sourceFiles: string[];
};

export type DocsMcpProjectGuidance = {
  setup?: string[];
  readingOrder?: string[];
  rules?: string[];
};

export type DocsMcpCatalog = {
  project: {
    title: string;
    description?: string;
    guidance?: DocsMcpProjectGuidance;
  };
  components: DocsMcpComponent[];
  documents: DocsMcpDocument[];
  artifacts?: DocsMcpArtifact[];
  warnings?: string[];
};

export type DocsMcpProviderContext = {
  root: string;
};

export type DocsMcpProvider = {
  name: string;
  /** Provider or catalog adapter version recorded in managed agent guidance. */
  version?: string;
  /** Stable cache discriminator for provider options that are not source files. */
  cacheKey?: string;
  /** Files whose content invalidates the normalized catalog cache. */
  sourceFiles(context: DocsMcpProviderContext): string[];
  load(context: DocsMcpProviderContext): DocsMcpCatalog;
};

export type DocsMcpConfig = {
  root?: string;
  provider: DocsMcpProvider;
  mcpPath?: string;
  manifestsPrefix?: string;
  cacheDir?: string;
  clientName?: string;
  search?: {
    /** Groups of interchangeable terms, or a canonical term mapped to aliases. */
    synonyms?: string[][] | Record<string, string[]>;
    defaultLimit?: number;
    maxLimit?: number;
  };
  retrieval?: {
    /** Character budget for the default bounded `get` response. */
    maxChars?: number;
  };
};

export function defineDocsMcpConfig(config: DocsMcpConfig): DocsMcpConfig {
  return config;
}
