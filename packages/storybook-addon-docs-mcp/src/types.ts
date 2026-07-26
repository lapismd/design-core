import type { ReactDocgenShape } from "./svelte/svelte-props.js";

export type DocsMcpStory = {
  id: string;
  name: string;
  snippet?: string;
};

export type DocsMcpComponent = {
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

export type DocsMcpDocument = {
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

export type DocsMcpCatalog = {
  project: {
    title: string;
    description?: string;
  };
  components: DocsMcpComponent[];
  documents: DocsMcpDocument[];
  warnings?: string[];
};

export type DocsMcpProviderContext = {
  root: string;
};

export type DocsMcpProvider = {
  name: string;
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
};

export function defineDocsMcpConfig(config: DocsMcpConfig): DocsMcpConfig {
  return config;
}
