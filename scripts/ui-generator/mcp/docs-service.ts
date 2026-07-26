import path from "node:path";
import {
  catalogEntryKey,
  catalogEntrySourceFiles,
  collectCatalog,
  getComponent,
  type CatalogEntry,
  type ComponentDoc,
  type ComponentLayer,
} from "../pipeline/components.js";
import { getGuideTopic, listGuideTopics } from "../pipeline/guide.js";
import {
  extractPropsFromSvelteFile,
  findPrimarySvelteFile,
  formatPropsMarkdown,
  type ReactDocgenShape,
} from "./svelte-props.js";
import { createDocsCache, type DocsCache } from "./cache.js";
import { markdownToHtmlDocument } from "./markdown-html.js";

export type DocsServiceOptions = {
  packageRoot: string;
  /** Absolute origin used in llms index links (string or per-request getter). */
  baseUrl?: string | (() => string);
  /** MCP endpoint path advertised in the llms index (default `/docs-mcp`). */
  mcpPath?: string;
  cache?: DocsCache;
  noCache?: boolean;
};

export type ComponentPage = {
  key: string;
  manifestId: string;
  layer: ComponentLayer;
  id: string;
  title: string;
  summary: string;
  importPath: string;
  markdown: string;
  doc: ComponentDoc;
  reactDocgen?: ReactDocgenShape;
  sourceFiles: string[];
  sveltePath?: string;
};

function manifestIdFor(layer: ComponentLayer, id: string): string {
  return `${layer}-${id}`.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function resolveSvelte(
  entry: CatalogEntry,
  doc: ComponentDoc,
): string | undefined {
  const fromDir = findPrimarySvelteFile(entry.dir, entry.id);
  if (fromDir) return fromDir;
  const pascal = doc.title.replace(/\s+/g, "");
  return findPrimarySvelteFile(entry.dir, pascal);
}

export function buildComponentPage(
  packageRoot: string,
  entry: CatalogEntry,
): ComponentPage {
  const key = catalogEntryKey(entry);
  const doc = getComponent(packageRoot, key);
  const sveltePath = resolveSvelte(entry, doc);
  const sourceFiles = [
    ...catalogEntrySourceFiles(entry),
    ...(sveltePath ? [path.resolve(sveltePath)] : []),
  ];
  const reactDocgen = sveltePath
    ? extractPropsFromSvelteFile(sveltePath, doc.title)
    : undefined;

  const propsMd = formatPropsMarkdown(reactDocgen);
  const parts = [
    `# ${doc.title}`,
    "",
    doc.summary,
    "",
    `ID: \`${manifestIdFor(entry.layer, entry.id)}\``,
    "",
    `Layer: \`${entry.layer}\``,
    "",
    "## Import",
    "",
    "```ts",
    `import … from "${doc.import}";`,
    "```",
    "",
  ];
  if (propsMd) parts.push(propsMd);
  parts.push(doc.body.trim(), "");

  return {
    key,
    manifestId: manifestIdFor(entry.layer, entry.id),
    layer: entry.layer,
    id: entry.id,
    title: doc.title,
    summary: doc.summary,
    importPath: doc.import,
    markdown: `${parts.join("\n").trimEnd()}\n`,
    doc,
    reactDocgen,
    sourceFiles,
    sveltePath,
  };
}

function entryFingerprintFiles(
  packageRoot: string,
  entry: CatalogEntry,
): string[] {
  const svelte =
    findPrimarySvelteFile(entry.dir, entry.id) ??
    findPrimarySvelteFile(
      entry.dir,
      entry.id
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(""),
    );
  return [
    ...catalogEntrySourceFiles(entry),
    ...(svelte ? [path.resolve(svelte)] : []),
  ];
}

export function createDocsService(options: DocsServiceOptions) {
  const packageRoot = options.packageRoot;
  function getBaseUrl(): string {
    const raw =
      typeof options.baseUrl === "function"
        ? options.baseUrl()
        : (options.baseUrl ?? "http://localhost:9009");
    return raw.replace(/\/$/, "");
  }
  const mcpPath = options.mcpPath ?? "/docs-mcp";
  const cache =
    options.cache ??
    createDocsCache({
      disabled: options.noCache,
      diskRoot: options.noCache
        ? undefined
        : path.join(packageRoot, ".cache", "ui-docs"),
    });

  function getPageCached(entry: CatalogEntry): ComponentPage {
    const key = `page:${catalogEntryKey(entry)}`;
    const files = entryFingerprintFiles(packageRoot, entry);
    const { value } = cache.get(key, files, () =>
      buildComponentPage(packageRoot, entry),
    );
    return value;
  }

  function buildComponentsManifest(): {
    v: 0;
    components: Record<string, unknown>;
  } {
    const catalog = collectCatalog(packageRoot);
    const allFiles = catalog.flatMap((e) =>
      entryFingerprintFiles(packageRoot, e),
    );
    const { value } = cache.get("manifest:components", allFiles, () => {
      const components: Record<string, unknown> = {};
      for (const entry of catalog) {
        const page = getPageCached(entry);
        components[page.manifestId] = {
          id: page.manifestId,
          name: page.title,
          description: page.summary,
          summary: page.summary,
          path: page.sveltePath
            ? path.relative(packageRoot, page.sveltePath)
            : page.doc.docsPath,
          import: `import from "${page.importPath}";`,
          stories: page.doc.examples.map((ex) => ({
            id: `${page.manifestId}--${ex.id}`,
            name: ex.title,
            snippet: ex.source,
          })),
          ...(page.reactDocgen ? { reactDocgen: page.reactDocgen } : {}),
        };
      }
      return { v: 0 as const, components };
    });
    return value;
  }

  function buildDocsManifest(): { v: 0; docs: Record<string, unknown> } {
    const topics = listGuideTopics(packageRoot);
    const topicFiles = topics.map((t) =>
      path.join(packageRoot, "docs", "agent", `${t.id}.md`),
    );
    const { value } = cache.get("manifest:docs", topicFiles, () => {
      const docs: Record<string, unknown> = {};
      for (const topic of topics) {
        const full = getGuideTopic(packageRoot, topic.id);
        docs[`guide-${topic.id}`] = {
          id: `guide-${topic.id}`,
          name: topic.title,
          title: `Guide/${topic.title}`,
          path: path.relative(packageRoot, full.path),
          summary: topic.summary,
          content: full.body,
        };
      }
      return { v: 0 as const, docs };
    });
    return value;
  }

  function buildLlmsIndex(): string {
    const catalog = collectCatalog(packageRoot);
    const topicFiles = listGuideTopics(packageRoot).map((t) =>
      path.join(packageRoot, "docs", "agent", `${t.id}.md`),
    );
    const allFiles = [
      ...catalog.flatMap((e) => entryFingerprintFiles(packageRoot, e)),
      ...topicFiles,
    ];
    const origin = getBaseUrl();
    const { value } = cache.get(
      `llms:index:${origin}:${mcpPath}`,
      allFiles,
      () => {
        const lines: string[] = [
          "# @stevejuma/ui",
          "",
          "> Local LLM-friendly documentation for the UI package (shadcn, forms, filter, and AI). Generated from package sources — not upstream Storybook React manifests.",
          "",
          `MCP: ${origin}${mcpPath}`,
          "",
        ];

        const byLayer = new Map<ComponentLayer, CatalogEntry[]>();
        for (const entry of catalog) {
          const list = byLayer.get(entry.layer) ?? [];
          list.push(entry);
          byLayer.set(entry.layer, list);
        }

        for (const [layer, entries] of byLayer) {
          lines.push(`## ${layer}`, "");
          for (const entry of entries) {
            const page = getPageCached(entry);
            const mdUrl = `${origin}/llms/${entry.layer}/${entry.id}.md`;
            const txtUrl = `${origin}/llms/${entry.layer}/${entry.id}.txt`;
            lines.push(
              `- [${page.title}](${mdUrl}) ([txt](${txtUrl})): ${page.summary}`,
            );
          }
          lines.push("");
        }

        lines.push("## guide", "");
        for (const topic of listGuideTopics(packageRoot)) {
          const mdUrl = `${origin}/llms/guide/${topic.id}.md`;
          const txtUrl = `${origin}/llms/guide/${topic.id}.txt`;
          lines.push(
            `- [${topic.title}](${mdUrl}) ([txt](${txtUrl})): ${topic.summary}`,
          );
        }
        lines.push("");
        return lines.join("\n");
      },
    );
    return value;
  }

  function contentTypeForExt(ext: "md" | "txt"): string {
    return ext === "md"
      ? "text/html; charset=utf-8"
      : "text/plain; charset=utf-8";
  }

  function respondMarkdown(
    markdown: string,
    ext: "md" | "txt",
    title?: string,
  ): { status: number; body: string; contentType: string } {
    if (ext === "md") {
      return {
        status: 200,
        body: markdownToHtmlDocument(markdown, { title }),
        contentType: contentTypeForExt("md"),
      };
    }
    return {
      status: 200,
      body: markdown,
      contentType: contentTypeForExt("txt"),
    };
  }

  function resolveLlmsPath(pathname: string): {
    status: number;
    body: string;
    contentType: string;
  } {
    if (
      pathname === "/llms.txt" ||
      pathname === "/llms.md" ||
      pathname === "/llms"
    ) {
      const ext = pathname.endsWith(".md") ? "md" : "txt";
      return respondMarkdown(buildLlmsIndex(), ext, "@stevejuma/ui");
    }

    const guideMatch = /^\/llms\/guide\/([a-z0-9-]+)\.(md|txt)$/.exec(pathname);
    if (guideMatch) {
      const ext = guideMatch[2] as "md" | "txt";
      try {
        const topic = getGuideTopic(packageRoot, guideMatch[1]!);
        const body = `# ${topic.title}\n\n${topic.summary}\n\n${topic.body}\n`;
        return respondMarkdown(body, ext, topic.title);
      } catch (error) {
        return {
          status: 404,
          body: error instanceof Error ? error.message : String(error),
          contentType: contentTypeForExt(ext),
        };
      }
    }

    const qualified = /^\/llms\/([a-z0-9-]+)\/([a-z0-9-]+)\.(md|txt)$/.exec(
      pathname,
    );
    if (qualified) {
      const layer = qualified[1] as ComponentLayer;
      const id = qualified[2]!;
      const ext = qualified[3] as "md" | "txt";
      const entry = collectCatalog(packageRoot).find(
        (e) => e.layer === layer && e.id === id,
      );
      if (!entry) {
        return {
          status: 404,
          body: `Unknown component ${layer}/${id}`,
          contentType: contentTypeForExt(ext),
        };
      }
      const page = getPageCached(entry);
      return respondMarkdown(page.markdown, ext, page.title);
    }

    const bare = /^\/llms\/([a-z0-9-]+)\.(md|txt)$/.exec(pathname);
    if (bare) {
      const id = bare[1]!;
      const ext = bare[2] as "md" | "txt";
      const matches = collectCatalog(packageRoot).filter((e) => e.id === id);
      if (matches.length === 0) {
        return {
          status: 404,
          body: `Unknown component ${id}`,
          contentType: contentTypeForExt(ext),
        };
      }
      if (matches.length > 1) {
        const origin = getBaseUrl();
        const list = matches
          .map(
            (m) =>
              `- ${origin}/llms/${catalogEntryKey(m)}.md ([txt](${origin}/llms/${catalogEntryKey(m)}.txt))`,
          )
          .join("\n");
        const markdown = `# Ambiguous id\n\nAmbiguous id \`${id}\`. Use one of:\n\n${list}\n`;
        if (ext === "md") {
          return {
            status: 409,
            body: markdownToHtmlDocument(markdown, {
              title: `Ambiguous: ${id}`,
            }),
            contentType: contentTypeForExt("md"),
          };
        }
        return {
          status: 409,
          body: `Ambiguous id "${id}". Use one of:\n${list}\n`,
          contentType: contentTypeForExt("txt"),
        };
      }
      const page = getPageCached(matches[0]!);
      return respondMarkdown(page.markdown, ext, page.title);
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
    packageRoot,
    getBaseUrl,
    mcpPath,
    cache,
    getPageCached,
    buildComponentsManifest,
    buildDocsManifest,
    buildLlmsIndex,
    resolveLlmsPath,
    manifestProvider,
    collectCatalog: () => collectCatalog(packageRoot),
  };
}

export type DocsService = ReturnType<typeof createDocsService>;
