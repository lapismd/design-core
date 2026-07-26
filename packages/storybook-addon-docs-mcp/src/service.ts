import path from "node:path";
import { createDocsCache, type DocsCache } from "./cache.js";
import { markdownToHtmlDocument } from "./markdown-html.js";
import type {
  DocsMcpCatalog,
  DocsMcpComponent,
  DocsMcpConfig,
} from "./types.js";

export type DocsServiceOptions = {
  root: string;
  config: DocsMcpConfig;
  baseUrl?: string | (() => string);
  mcpPath?: string;
  cache?: DocsCache;
  noCache?: boolean;
};

function normalizedPath(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

export function createDocsService(options: DocsServiceOptions) {
  const root = path.resolve(options.config.root ?? options.root);
  const mcpPath = normalizedPath(
    options.mcpPath ?? options.config.mcpPath ?? "/docs-mcp",
  );
  const cache =
    options.cache ??
    createDocsCache({
      disabled: options.noCache,
      diskRoot: options.noCache
        ? undefined
        : path.resolve(root, options.config.cacheDir ?? ".cache/docs-mcp"),
    });

  function getBaseUrl(): string {
    const value =
      typeof options.baseUrl === "function"
        ? options.baseUrl()
        : (options.baseUrl ?? "http://localhost:9009");
    return value.replace(/\/$/, "");
  }

  function getCatalog(): DocsMcpCatalog {
    const context = { root };
    const files = options.config.provider.sourceFiles(context);
    return cache.get(`catalog:${options.config.provider.name}`, files, () =>
      options.config.provider.load(context),
    ).value;
  }

  function buildComponentsManifest() {
    const components: Record<string, unknown> = {};
    for (const component of getCatalog().components) {
      components[component.id] = {
        id: component.id,
        name: component.name,
        description: component.summary,
        summary: component.summary,
        path: component.path,
        ...(component.importPath
          ? { import: `import from "${component.importPath}";` }
          : {}),
        stories: component.stories ?? [],
        ...(component.reactDocgen
          ? { reactDocgen: component.reactDocgen }
          : {}),
      };
    }
    return { v: 0 as const, components };
  }

  function buildDocsManifest() {
    const docs: Record<string, unknown> = {};
    for (const document of getCatalog().documents) {
      docs[document.id] = {
        id: document.id,
        name: document.name,
        title: document.title ?? `${document.group}/${document.name}`,
        path: document.path,
        summary: document.summary,
        content: document.markdown,
      };
    }
    return { v: 0 as const, docs };
  }

  function buildLlmsIndex(): string {
    const catalog = getCatalog();
    const origin = getBaseUrl();
    const lines = [
      `# ${catalog.project.title}`,
      "",
      catalog.project.description
        ? `> ${catalog.project.description}`
        : "> Local LLM-friendly documentation generated from project sources.",
      "",
      `MCP: ${origin}${mcpPath}`,
      "",
    ];
    const groups = new Map<string, DocsMcpComponent[]>();
    for (const component of catalog.components) {
      const list = groups.get(component.group) ?? [];
      list.push(component);
      groups.set(component.group, list);
    }
    for (const [group, components] of groups) {
      lines.push(`## ${group}`, "");
      for (const component of components) {
        const base = `${origin}/llms/${component.group}/${component.slug}`;
        lines.push(
          `- [${component.name}](${base}.md) ([txt](${base}.txt)): ${component.summary}`,
        );
      }
      lines.push("");
    }
    const documentGroups = new Map<string, typeof catalog.documents>();
    for (const document of catalog.documents) {
      const list = documentGroups.get(document.group) ?? [];
      list.push(document);
      documentGroups.set(document.group, list);
    }
    for (const [group, documents] of documentGroups) {
      lines.push(`## ${group}`, "");
      for (const document of documents) {
        const base = `${origin}/llms/${document.group}/${document.slug}`;
        lines.push(
          `- [${document.name}](${base}.md) ([txt](${base}.txt)): ${document.summary}`,
        );
      }
      lines.push("");
    }
    return lines.join("\n");
  }

  function response(
    markdown: string,
    ext: "md" | "txt",
    title?: string,
    status = 200,
  ) {
    return ext === "md"
      ? {
          status,
          body: markdownToHtmlDocument(markdown, { title }),
          contentType: "text/html; charset=utf-8",
        }
      : {
          status,
          body: markdown,
          contentType: "text/plain; charset=utf-8",
        };
  }

  function resolveLlmsPath(pathname: string) {
    if (
      pathname === "/llms" ||
      pathname === "/llms.txt" ||
      pathname === "/llms.md"
    ) {
      const ext = pathname.endsWith(".md") ? "md" : "txt";
      return response(buildLlmsIndex(), ext, getCatalog().project.title);
    }
    const qualified = /^\/llms\/([a-z0-9-]+)\/([a-z0-9-]+)\.(md|txt)$/.exec(
      pathname,
    );
    if (qualified) {
      const [, group, slug, rawExt] = qualified;
      const ext = rawExt as "md" | "txt";
      const catalog = getCatalog();
      const component = catalog.components.find(
        (entry) => entry.group === group && entry.slug === slug,
      );
      if (component) {
        return response(component.markdown, ext, component.name);
      }
      const document = catalog.documents.find(
        (entry) => entry.group === group && entry.slug === slug,
      );
      if (document) {
        return response(document.markdown, ext, document.name);
      }
      return response(
        `Unknown documentation ${group}/${slug}\n`,
        ext,
        undefined,
        404,
      );
    }
    const bare = /^\/llms\/([a-z0-9-]+)\.(md|txt)$/.exec(pathname);
    if (bare) {
      const [, slug, rawExt] = bare;
      const ext = rawExt as "md" | "txt";
      const matches = getCatalog().components.filter(
        (entry) => entry.slug === slug,
      );
      if (matches.length === 1) {
        return response(matches[0]!.markdown, ext, matches[0]!.name);
      }
      if (matches.length > 1) {
        const targets = matches
          .map((entry) => `- /llms/${entry.group}/${entry.slug}.${ext}`)
          .join("\n");
        return response(
          `# Ambiguous id\n\nUse one of:\n\n${targets}\n`,
          ext,
          `Ambiguous: ${slug}`,
          409,
        );
      }
      return response(`Unknown component ${slug}\n`, ext, undefined, 404);
    }
    return {
      status: 404,
      body: "Not found",
      contentType: "text/plain; charset=utf-8",
    };
  }

  async function manifestProvider(
    _request: Request | undefined,
    manifestPath: string,
  ): Promise<string> {
    if (manifestPath.includes("components.json")) {
      return JSON.stringify(buildComponentsManifest());
    }
    if (manifestPath.includes("docs.json")) {
      return JSON.stringify(buildDocsManifest());
    }
    throw new Error(`Unknown manifest path: ${manifestPath}`);
  }

  return {
    root,
    mcpPath,
    cache,
    getBaseUrl,
    getCatalog,
    buildComponentsManifest,
    buildDocsManifest,
    buildLlmsIndex,
    resolveLlmsPath,
    manifestProvider,
  };
}

export type DocsService = ReturnType<typeof createDocsService>;
