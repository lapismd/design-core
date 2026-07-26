import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { EXIT, GeneratorError } from "../errors.js";
import { toPascalCase } from "../docs/emit-docs-artifacts.js";
import {
  BATCH_A,
  BATCH_B,
  BATCH_C,
  BATCH_D,
  getRecipe,
} from "../recipes/index.js";

export type ComponentLayer = "shadcn" | "forms" | "filter" | "ai";

export type ComponentExample = {
  id: string;
  title: string;
  source: string;
};

export type ComponentListItem = {
  /** Stable key: `layer/id` (e.g. `shadcn/button`, `forms/form-field`). */
  key: string;
  id: string;
  layer: ComponentLayer;
  title: string;
  summary: string;
  import: string;
  hasDocs: boolean;
  exampleCount: number;
  batch?: string;
};

export type ComponentDoc = {
  key: string;
  id: string;
  layer: ComponentLayer;
  title: string;
  summary: string;
  import: string;
  sources: string[];
  body: string;
  examples: ComponentExample[];
  batch?: string;
  docsPath: string;
};

export type ComponentsIndex = {
  title: string;
  summary: string;
  components: ComponentListItem[];
  related: string[];
};

export type ComponentsResult =
  | { kind: "index"; index: ComponentsIndex }
  | { kind: "component"; component: ComponentDoc };

export type ComponentsOptions = {
  layer?: ComponentLayer;
};

const LAYERS: ComponentLayer[] = ["shadcn", "forms", "filter", "ai"];

const FORMS_SKIP_DIRS = new Set(["core"]);
const FILTER_SKIP_DIRS = new Set(["filter-query"]);

export type CatalogEntry = {
  layer: ComponentLayer;
  id: string;
  dir: string;
  importPath: string;
  docsCandidates: string[];
  exampleSourcesPath?: string;
  storyPaths: string[];
};

function rel(packageRoot: string, abs: string): string {
  return path.relative(packageRoot, abs);
}

function recipeBatch(id: string): string | undefined {
  if ((BATCH_A as readonly string[]).includes(id)) return "a";
  if ((BATCH_B as readonly string[]).includes(id)) return "b";
  if ((BATCH_C as readonly string[]).includes(id)) return "c";
  if ((BATCH_D as readonly string[]).includes(id)) return "d";
  if (id === "button") return "button";
  return undefined;
}

function stripHtmlComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->\n?/g, "").trimStart();
}

function parseTitleAndSummary(markdown: string): {
  title: string;
  summary: string;
} {
  const lines = stripHtmlComments(markdown).split("\n");
  let title = "";
  let summary = "";
  let i = 0;
  while (i < lines.length && !lines[i]!.trim()) i++;
  if (lines[i]?.startsWith("# ")) {
    title = lines[i]!.slice(2).trim();
    i++;
    while (i < lines.length && !lines[i]!.trim()) i++;
    const parts: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() &&
      !lines[i]!.startsWith("#") &&
      !lines[i]!.startsWith("```") &&
      !lines[i]!.trim().startsWith("<")
    ) {
      parts.push(lines[i]!.trim());
      i++;
    }
    summary = parts.join(" ");
  }
  return { title, summary };
}

/** Prefer markdown anchor (`### [Link](#link-1)` → `link-1`). */
function parseHeadingSlug(
  line: string,
): { title: string; slug: string } | null {
  const linked = /^#{2,3}\s+\[([^\]]+)\]\(#([^)]+)\)\s*$/.exec(line.trim());
  if (linked) {
    return { title: linked[1]!.trim(), slug: linked[2]!.trim() };
  }
  const plain = /^#{2,3}\s+(.+?)\s*$/.exec(line.trim());
  if (!plain) return null;
  const title = plain[1]!.trim();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return { title, slug };
}

function isHeading(line: string): boolean {
  return /^#{1,3}\s+/.test(line.trim());
}

function kebabFromPascal(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function entryKey(layer: ComponentLayer, id: string): string {
  return `${layer}/${id}`;
}

export function catalogEntryKey(entry: CatalogEntry): string {
  return entryKey(entry.layer, entry.id);
}

/** Absolute paths that feed docs/props for cache fingerprints. */
export function catalogEntrySourceFiles(entry: CatalogEntry): string[] {
  const files = [
    ...entry.docsCandidates,
    ...entry.storyPaths,
    ...(entry.exampleSourcesPath ? [entry.exampleSourcesPath] : []),
  ];
  return [...new Set(files.map((f) => path.resolve(f)))];
}

export function getCatalogEntry(
  packageRoot: string,
  name: string,
  options: ComponentsOptions = {},
): CatalogEntry {
  return findEntry(packageRoot, name, options);
}

/**
 * Parse `export const Name = "…";` from generated example-sources modules.
 */
export function parseExampleSources(raw: string): Map<string, string> {
  const out = new Map<string, string>();
  const re =
    /export const (\w+)\s*=\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*;?/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    const literal = match[2]!;
    try {
      if (literal.startsWith('"')) {
        out.set(match[1]!, JSON.parse(literal) as string);
        continue;
      }
      out.set(
        match[1]!,
        literal
          .slice(1, -1)
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .replace(/\\'/g, "'")
          .replace(/\\\\/g, "\\"),
      );
    } catch {
      out.set(
        match[1]!,
        literal
          .slice(1, -1)
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\\\/g, "\\"),
      );
    }
  }
  return out;
}

/**
 * Re-insert svelte example fences under matching `###` headings.
 */
export function composeComponentMarkdown(
  docsMarkdown: string,
  exampleSources: Map<string, string>,
): { body: string; examples: ComponentExample[] } {
  const used = new Set<string>();
  const examples: ComponentExample[] = [];
  const lines = docsMarkdown.split("\n");
  const out: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    const heading = /^###\s+/.test(line.trim()) ? parseHeadingSlug(line) : null;

    if (!heading) {
      out.push(line);
      i++;
      continue;
    }

    out.push(line);
    i++;

    const sectionLines: string[] = [];
    while (i < lines.length && !isHeading(lines[i]!)) {
      sectionLines.push(lines[i]!);
      i++;
    }

    const exportName = toPascalCase(heading.slug);
    const source = exampleSources.get(exportName);
    const sectionHasFence = sectionLines.some((l) =>
      l.trim().startsWith("```"),
    );

    out.push(...sectionLines);

    if (source && !sectionHasFence && !used.has(exportName)) {
      while (out.length > 0 && out[out.length - 1]!.trim() === "") {
        out.pop();
      }
      out.push("");
      out.push("```svelte");
      out.push(source.trimEnd());
      out.push("```");
      out.push("");
      used.add(exportName);
      examples.push({
        id: heading.slug,
        title: heading.title,
        source: source.trimEnd(),
      });
    }
  }

  const leftover = [...exampleSources.entries()].filter(
    ([name]) => !used.has(name),
  );
  if (leftover.length > 0) {
    out.push("");
    out.push("## Additional examples");
    out.push("");
    for (const [exportName, source] of leftover) {
      const title = exportName.replace(/([a-z])([A-Z])/g, "$1 $2");
      const id = kebabFromPascal(exportName);
      out.push(`### ${title}`);
      out.push("");
      out.push("```svelte");
      out.push(source.trimEnd());
      out.push("```");
      out.push("");
      examples.push({
        id,
        title,
        source: source.trimEnd(),
      });
    }
  }

  return { body: out.join("\n").trimEnd() + "\n", examples };
}

/** Turn Storybook MDX docs into agent-friendly markdown. */
export function mdxToAgentMarkdown(mdx: string): {
  body: string;
  examples: ComponentExample[];
} {
  const examples: ComponentExample[] = [];
  let text = mdx;

  // Drop import lines and Meta/Primary/Controls/Canvas blocks.
  text = text.replace(/^import\s.+;?\s*$/gm, "");
  text = text.replace(/<Meta\b[^>]*\/>/g, "");
  text = text.replace(/<Primary\s*\/>/g, "");
  text = text.replace(/<Controls\s*\/>/g, "");
  text = text.replace(/\{?\s*\/\*[\s\S]*?\*\/\s*\}?/g, "");

  // <Source … code={"…"} /> → fenced svelte
  text = text.replace(
    /<Source\b[^>]*\bcode=\{("(?:\\.|[^"\\])*")\}\s*\/>/g,
    (_full, jsonStr: string) => {
      let code = "";
      try {
        code = JSON.parse(jsonStr) as string;
      } catch {
        code = jsonStr.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
      }
      examples.push({
        id: `usage-${examples.length + 1}`,
        title: "Usage",
        source: code.trimEnd(),
      });
      return `\n\`\`\`svelte\n${code.trimEnd()}\n\`\`\`\n`;
    },
  );

  // Remove remaining Canvas tags (examples stay as prose headings).
  text = text.replace(/<Canvas\b[^>]*\/>/g, "");
  text = text.replace(/<Canvas\b[\s\S]*?<\/Canvas>/g, "");

  // Storybook doc links → plain text label
  text = text.replace(/\[([^\]]+)\]\(\?path=[^)]+\)/g, "$1");

  text = text
    .split("\n")
    .filter(
      (line, idx, arr) => !(line.trim() === "" && arr[idx - 1]?.trim() === ""),
    )
    .join("\n")
    .trim();

  return { body: `${text}\n`, examples };
}

type StoryMeta = {
  title?: string;
  componentDescription?: string;
  stories: {
    name: string;
    exportName?: string;
    description?: string;
    template?: string;
  }[];
};

export function parseStoriesFile(raw: string): StoryMeta {
  const meta: StoryMeta = { stories: [] };
  const titleMatch = /title:\s*["']([^"']+)["']/.exec(raw);
  if (titleMatch) meta.title = titleMatch[1];

  const descMatch =
    /description:\s*\{\s*component:\s*["'`]([\s\S]*?)["'`]\s*\}/.exec(raw) ||
    /component:\s*\n\s*["']([\s\S]*?)["']/.exec(
      /docs:\s*\{([\s\S]*?)\n\s*\}/.exec(raw)?.[1] ?? "",
    );
  // Prefer parameters.docs.description.component string
  const componentDesc =
    /description:\s*\{\s*component:\s*"((?:\\.|[^"\\])*)"/.exec(raw) ||
    /description:\s*\{\s*component:\s*'((?:\\.|[^'\\])*)'/.exec(raw) ||
    /description:\s*\{\s*component:\s*\n\s*"((?:\\.|[^"\\])*)"/.exec(raw);
  if (componentDesc) {
    try {
      meta.componentDescription = JSON.parse(`"${componentDesc[1]}"`) as string;
    } catch {
      meta.componentDescription = componentDesc[1];
    }
  } else {
    const multiline = /component:\s*\n\s*"((?:\\.|[^"\\])*)"/.exec(raw);
    if (multiline) {
      try {
        meta.componentDescription = JSON.parse(`"${multiline[1]}"`) as string;
      } catch {
        meta.componentDescription = multiline[1];
      }
    }
  }

  const storyRe = /<Story\b([^>]*)>([\s\S]*?)<\/Story>/g;
  let match: RegExpExecArray | null;
  while ((match = storyRe.exec(raw)) !== null) {
    const attrs = match[1]!;
    const body = match[2]!;
    const name =
      /\bname=\{?["']([^"']+)["']\}?/.exec(attrs)?.[1] ??
      /\bname=["']([^"']+)["']/.exec(attrs)?.[1];
    if (!name) continue;
    const exportName = /\bexportName=\{?["']([^"']+)["']\}?/.exec(attrs)?.[1];
    const storyDesc =
      /description:\s*\{\s*story:\s*"((?:\\.|[^"\\])*)"/.exec(body)?.[1] ||
      /description:\s*\{\s*story:\s*'((?:\\.|[^'\\])*)'/.exec(body)?.[1];
    let description: string | undefined;
    if (storyDesc) {
      try {
        description = JSON.parse(`"${storyDesc}"`) as string;
      } catch {
        description = storyDesc;
      }
    }
    const templateMatch =
      /\{#snippet\s+template\(\)\}([\s\S]*?)\{\/snippet\}/.exec(body);
    const template = templateMatch?.[1]?.trim();
    meta.stories.push({ name, exportName, description, template });
  }

  return meta;
}

function composeFromStories(
  entry: CatalogEntry,
  packageRoot: string,
): {
  title: string;
  summary: string;
  body: string;
  examples: ComponentExample[];
  sources: string[];
} {
  const sources: string[] = [];
  const examples: ComponentExample[] = [];
  const parts: string[] = [];
  let title = toPascalCase(entry.id);
  let summary = entry.importPath;

  for (const storyPath of entry.storyPaths) {
    if (!existsSync(storyPath)) continue;
    sources.push(rel(packageRoot, storyPath));
    const meta = parseStoriesFile(readFileSync(storyPath, "utf8"));
    if (meta.title) title = meta.title.split("/").pop()?.trim() || title;
    if (meta.componentDescription) summary = meta.componentDescription;

    parts.push(`# ${title}`, "");
    if (meta.componentDescription) {
      parts.push(meta.componentDescription, "");
    }
    parts.push(`## Import`, "", `\`${entry.importPath}\``, "");
    if (meta.stories.length > 0) {
      parts.push("## Stories", "");
      for (const story of meta.stories) {
        parts.push(`### ${story.name}`, "");
        if (story.description) parts.push(story.description, "");
        if (story.template) {
          parts.push("```svelte", story.template, "```", "");
          examples.push({
            id: kebabFromPascal(story.exportName ?? story.name),
            title: story.name,
            source: story.template,
          });
        }
      }
    }
  }

  if (parts.length === 0) {
    parts.push(
      `# ${title}`,
      "",
      summary,
      "",
      "## Import",
      "",
      `\`${entry.importPath}\``,
      "",
    );
  }

  return {
    title,
    summary,
    body: `${parts.join("\n").trimEnd()}\n`,
    examples,
    sources,
  };
}

function listDirs(abs: string): string[] {
  if (!existsSync(abs)) return [];
  return readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
}

function listFiles(abs: string, suffix: string): string[] {
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((name) => name.endsWith(suffix))
    .map((name) => path.join(abs, name))
    .sort();
}

function collectShadcn(packageRoot: string): CatalogEntry[] {
  const root = path.join(packageRoot, "src", "shared", "shadcn");
  return listDirs(root).map((id) => {
    const dir = path.join(root, id);
    const pascal = toPascalCase(id);
    const docsPath = path.join(dir, `${id}.docs.md`);
    const examplesPath = path.join(dir, `${pascal}.example-sources.ts`);
    return {
      layer: "shadcn" as const,
      id,
      dir,
      importPath: `@stevejuma/ui/shadcn/${id}`,
      docsCandidates: existsSync(docsPath) ? [docsPath] : [],
      exampleSourcesPath: existsSync(examplesPath) ? examplesPath : undefined,
      storyPaths: listFiles(dir, ".stories.svelte"),
    };
  });
}

function collectForms(packageRoot: string): CatalogEntry[] {
  const root = path.join(packageRoot, "src", "shared", "forms");
  return listDirs(root)
    .filter((id) => !FORMS_SKIP_DIRS.has(id))
    .filter((id) => {
      const dir = path.join(root, id);
      return (
        listFiles(dir, ".svelte").length > 0 ||
        listFiles(dir, ".mdx").length > 0
      );
    })
    .map((id) => {
      const dir = path.join(root, id);
      const mdx = listFiles(dir, ".mdx");
      return {
        layer: "forms" as const,
        id,
        dir,
        importPath: "@stevejuma/ui/forms",
        docsCandidates: mdx,
        storyPaths: [
          ...listFiles(dir, ".stories.svelte"),
          ...listFiles(dir, ".variations.stories.svelte"),
        ],
      };
    });
}

function collectFilter(packageRoot: string): CatalogEntry[] {
  const root = path.join(packageRoot, "src", "shared", "filter");
  if (!existsSync(root)) return [];
  const entries: CatalogEntry[] = listDirs(root)
    .filter((id) => !FILTER_SKIP_DIRS.has(id))
    .map((id) => {
      const dir = path.join(root, id);
      const mdx = listFiles(dir, ".mdx");
      return {
        layer: "filter" as const,
        id,
        dir,
        importPath: "@stevejuma/ui/filter",
        docsCandidates: mdx,
        storyPaths: [
          ...listFiles(dir, ".stories.svelte"),
          ...listFiles(dir, ".variations.stories.svelte"),
        ],
      };
    });

  const guidance = path.join(root, "Guidance.mdx");
  if (existsSync(guidance)) {
    entries.push({
      layer: "filter",
      id: "guidance",
      dir: root,
      importPath: "@stevejuma/ui/filter",
      docsCandidates: [guidance],
      storyPaths: [],
    });
  }

  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

function collectAi(packageRoot: string): CatalogEntry[] {
  const root = path.join(packageRoot, "src", "shared", "ai");
  if (!existsSync(root)) return [];
  const overview = path.join(root, "Ai.mdx");

  function collectDirectory(
    dir: string,
    importPath: string,
    idPrefix = "",
  ): CatalogEntry[] {
    if (!existsSync(dir)) return [];
    const components = readdirSync(dir)
      .filter((name) => name.endsWith(".svelte") && !name.includes(".stories."))
      .map((name) => name.replace(/\.svelte$/, ""));
    return components.map((pascal) => {
      const id = `${idPrefix}${kebabFromPascal(pascal)}`;
      const storyPath = path.join(dir, `${pascal}.stories.svelte`);
      return {
        layer: "ai" as const,
        id,
        dir,
        importPath,
        docsCandidates: existsSync(overview) ? [overview] : [],
        storyPaths: existsSync(storyPath) ? [storyPath] : [],
      };
    });
  }

  return [
    ...collectDirectory(root, "@stevejuma/ui/ai"),
    ...collectDirectory(
      path.join(root, "chat"),
      "@stevejuma/ui/ai/chat",
      "chat-",
    ),
    ...collectDirectory(
      path.join(root, "chat", "experimental"),
      "@stevejuma/ui/ai/chat/experimental",
      "chat-experimental-",
    ),
  ].sort((a, b) => a.id.localeCompare(b.id));
}

export function collectCatalog(packageRoot: string): CatalogEntry[] {
  return [
    ...collectShadcn(packageRoot),
    ...collectForms(packageRoot),
    ...collectFilter(packageRoot),
    ...collectAi(packageRoot),
  ];
}

function summarizeEntry(
  packageRoot: string,
  entry: CatalogEntry,
): ComponentListItem {
  const key = entryKey(entry.layer, entry.id);
  let title = toPascalCase(entry.id);
  let summary = `${entry.layer} · ${entry.importPath}`;
  let hasDocs = entry.docsCandidates.length > 0;
  let exampleCount = 0;

  if (entry.layer === "shadcn") {
    const docsPath = entry.docsCandidates[0];
    if (docsPath) {
      const parsed = parseTitleAndSummary(readFileSync(docsPath, "utf8"));
      if (parsed.title) title = parsed.title;
      if (parsed.summary) summary = parsed.summary;
    } else {
      summary = `No *.docs.md — run pnpm ui:docs --component ${entry.id}`;
      const recipe = getRecipe(entry.id);
      if (recipe?.storyTitle) summary = recipe.storyTitle;
    }
    if (entry.exampleSourcesPath) {
      exampleCount = parseExampleSources(
        readFileSync(entry.exampleSourcesPath, "utf8"),
      ).size;
    }
  } else if (entry.layer === "forms" || entry.layer === "filter") {
    const mdx = entry.docsCandidates[0];
    if (mdx) {
      const converted = mdxToAgentMarkdown(readFileSync(mdx, "utf8"));
      const parsed = parseTitleAndSummary(converted.body);
      if (parsed.title) title = parsed.title;
      if (parsed.summary) summary = parsed.summary;
      exampleCount = converted.examples.length;
    } else {
      hasDocs = false;
      summary = "No colocated MDX — story titles only";
      for (const storyPath of entry.storyPaths) {
        const meta = parseStoriesFile(readFileSync(storyPath, "utf8"));
        exampleCount += meta.stories.filter((s) => s.template).length;
        if (meta.componentDescription) summary = meta.componentDescription;
        if (meta.title) title = meta.title.split("/").pop()!.trim();
      }
    }
  } else {
    // Story-driven layers: prefer component description; overview MDX is secondary.
    hasDocs = entry.storyPaths.length > 0 || entry.docsCandidates.length > 0;
    for (const storyPath of entry.storyPaths) {
      const meta = parseStoriesFile(readFileSync(storyPath, "utf8"));
      exampleCount += meta.stories.filter((s) => s.template).length;
      if (meta.componentDescription) summary = meta.componentDescription;
      if (meta.title) title = meta.title.split("/").pop()!.trim();
    }
    if (
      entry.docsCandidates[0] &&
      summary === `${entry.layer} · ${entry.importPath}`
    ) {
      const parsed = parseTitleAndSummary(
        mdxToAgentMarkdown(readFileSync(entry.docsCandidates[0], "utf8")).body,
      );
      if (parsed.title && entry.layer === "ai") {
        // Keep component title from filename; use overview only as fallback summary.
      }
      if (parsed.summary && !entry.storyPaths.length) summary = parsed.summary;
    }
  }

  const item: ComponentListItem = {
    key,
    id: entry.id,
    layer: entry.layer,
    title,
    summary,
    import: entry.importPath,
    hasDocs,
    exampleCount,
  };
  if (entry.layer === "shadcn") {
    const batch = recipeBatch(entry.id);
    if (batch) item.batch = batch;
  }
  return item;
}

export function listComponents(
  packageRoot: string,
  options: ComponentsOptions = {},
): ComponentListItem[] {
  let catalog = collectCatalog(packageRoot);
  if (options.layer) {
    catalog = catalog.filter((e) => e.layer === options.layer);
  }
  return catalog.map((entry) => summarizeEntry(packageRoot, entry));
}

export function getComponentsIndex(
  packageRoot: string,
  options: ComponentsOptions = {},
): ComponentsIndex {
  const components = listComponents(packageRoot, options);
  const layerNote = options.layer
    ? `Filtered to layer \`${options.layer}\`.`
    : `Layers: ${LAYERS.join(", ")}.`;
  return {
    title: "@stevejuma/ui components",
    summary: `Local usage and examples across the package catalog. ${layerNote} Prefer \`layer/id\` keys when names collide; bare ids work when unique.`,
    components,
    related: [
      "pnpm ui guide — conventions (shadcn / forms / testing)",
      "pnpm ui components --layer forms — filter by layer",
      "pnpm ui:docs --component <name> — sync vendored shadcn docs sources",
      "Storybook MCP — interactive catalog when the server is up",
    ],
  };
}

function findEntry(
  packageRoot: string,
  name: string,
  options: ComponentsOptions = {},
): CatalogEntry {
  const catalog = collectCatalog(packageRoot);
  const trimmed = name.trim().replace(/^\/+/, "");

  if (trimmed.includes("/")) {
    const slash = trimmed.indexOf("/");
    const layer = trimmed.slice(0, slash) as ComponentLayer;
    const id = trimmed.slice(slash + 1);
    if (!LAYERS.includes(layer)) {
      throw new GeneratorError(
        `Unknown layer "${layer}". Expected one of: ${LAYERS.join(", ")}`,
        EXIT.invalidRequest,
      );
    }
    const entry = catalog.find((e) => e.layer === layer && e.id === id);
    if (!entry) {
      const available = catalog
        .filter((e) => e.layer === layer)
        .map((e) => e.id)
        .join(", ");
      throw new GeneratorError(
        `Unknown component "${trimmed}". Available in ${layer}: ${available || "(none)"}`,
        EXIT.invalidRequest,
      );
    }
    return entry;
  }

  const matches = catalog.filter((e) => {
    if (options.layer && e.layer !== options.layer) return false;
    return e.id === trimmed || e.id === kebabFromPascal(trimmed);
  });

  if (matches.length === 0) {
    const hint = listComponents(packageRoot, options)
      .slice(0, 12)
      .map((c) => c.key)
      .join(", ");
    throw new GeneratorError(
      `Unknown component "${trimmed}". Try a key like shadcn/button or forms/form-field. Examples: ${hint}…`,
      EXIT.invalidRequest,
    );
  }
  if (matches.length > 1) {
    throw new GeneratorError(
      `Ambiguous component "${trimmed}". Use one of: ${matches.map((m) => entryKey(m.layer, m.id)).join(", ")}`,
      EXIT.invalidRequest,
    );
  }
  return matches[0]!;
}

function showShadcn(packageRoot: string, entry: CatalogEntry): ComponentDoc {
  const docsPath = entry.docsCandidates[0];
  if (!docsPath) {
    throw new GeneratorError(
      `No docs for "${entryKey(entry.layer, entry.id)}". Run: pnpm ui:docs --component ${entry.id}`,
      EXIT.invalidRequest,
    );
  }
  const docsRaw = readFileSync(docsPath, "utf8");
  const map = entry.exampleSourcesPath
    ? parseExampleSources(readFileSync(entry.exampleSourcesPath, "utf8"))
    : new Map<string, string>();
  const { title, summary } = parseTitleAndSummary(docsRaw);
  const { body, examples } = composeComponentMarkdown(docsRaw, map);
  const sources = [rel(packageRoot, docsPath)];
  if (entry.exampleSourcesPath) {
    sources.push(rel(packageRoot, entry.exampleSourcesPath));
  }
  const batch = recipeBatch(entry.id);
  const doc: ComponentDoc = {
    key: entryKey(entry.layer, entry.id),
    id: entry.id,
    layer: entry.layer,
    title: title || toPascalCase(entry.id),
    summary: summary || entry.importPath,
    import: entry.importPath,
    sources,
    body,
    examples,
    docsPath: rel(packageRoot, docsPath),
  };
  if (batch) doc.batch = batch;
  return doc;
}

function showForms(packageRoot: string, entry: CatalogEntry): ComponentDoc {
  const sources: string[] = [];
  const examples: ComponentExample[] = [];
  const bodies: string[] = [];
  let title = toPascalCase(entry.id);
  let summary = entry.importPath;
  let docsPath = "";

  if (entry.docsCandidates.length === 0) {
    const fromStories = composeFromStories(entry, packageRoot);
    return {
      key: entryKey(entry.layer, entry.id),
      id: entry.id,
      layer: entry.layer,
      title: fromStories.title,
      summary: fromStories.summary,
      import: entry.importPath,
      sources: fromStories.sources,
      body: fromStories.body,
      examples: fromStories.examples,
      docsPath: fromStories.sources[0] ?? rel(packageRoot, entry.dir),
    };
  }

  for (const mdxPath of entry.docsCandidates) {
    sources.push(rel(packageRoot, mdxPath));
    if (!docsPath) docsPath = rel(packageRoot, mdxPath);
    const converted = mdxToAgentMarkdown(readFileSync(mdxPath, "utf8"));
    const parsed = parseTitleAndSummary(converted.body);
    if (parsed.title) title = parsed.title;
    if (parsed.summary) summary = parsed.summary;
    bodies.push(converted.body.trimEnd());
    examples.push(...converted.examples);
  }

  // Enrich example sections with variation story templates when present.
  const templateByExport = new Map<string, string>();
  const templateByName = new Map<string, string>();
  for (const storyPath of entry.storyPaths) {
    if (!storyPath.includes(".variations.stories.")) continue;
    sources.push(rel(packageRoot, storyPath));
    const meta = parseStoriesFile(readFileSync(storyPath, "utf8"));
    for (const story of meta.stories) {
      if (!story.template) continue;
      if (story.exportName)
        templateByExport.set(story.exportName, story.template);
      templateByName.set(story.name.toLowerCase(), story.template);
    }
  }

  let body = bodies.join("\n\n");
  if (templateByExport.size > 0 || templateByName.size > 0) {
    const lines = body.split("\n");
    const out: string[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i]!;
      const heading = /^###\s+/.test(line.trim())
        ? parseHeadingSlug(line)
        : null;
      if (!heading) {
        out.push(line);
        i++;
        continue;
      }
      out.push(line);
      i++;
      const section: string[] = [];
      while (i < lines.length && !isHeading(lines[i]!)) {
        section.push(lines[i]!);
        i++;
      }
      out.push(...section);
      const hasFence = section.some((l) => l.trim().startsWith("```"));
      const source =
        templateByExport.get(toPascalCase(heading.slug)) ||
        templateByName.get(heading.title.toLowerCase());
      if (source && !hasFence) {
        while (out.length > 0 && out[out.length - 1]!.trim() === "") out.pop();
        out.push("", "```svelte", source.trimEnd(), "```", "");
        examples.push({
          id: heading.slug,
          title: heading.title,
          source: source.trimEnd(),
        });
      }
    }
    body = out.join("\n");
  }

  return {
    key: entryKey(entry.layer, entry.id),
    id: entry.id,
    layer: entry.layer,
    title,
    summary,
    import: entry.importPath,
    sources: [...new Set(sources)],
    body: `${body.trimEnd()}\n`,
    examples,
    docsPath: docsPath || rel(packageRoot, entry.dir),
  };
}

function showStoryDriven(
  packageRoot: string,
  entry: CatalogEntry,
): ComponentDoc {
  const fromStories = composeFromStories(entry, packageRoot);
  // For AI, prepend a short pointer to overview when showing a single component.
  let body = fromStories.body;
  if (entry.layer === "ai" && entry.docsCandidates[0]) {
    const overview = mdxToAgentMarkdown(
      readFileSync(entry.docsCandidates[0], "utf8"),
    ).body;
    const overviewSummary = parseTitleAndSummary(overview).summary;
    if (
      overviewSummary &&
      !fromStories.summary.includes(overviewSummary.slice(0, 40))
    ) {
      body = `${fromStories.body.trimEnd()}\n\n## Related\n\nSee Storybook **AI/Overview** and \`pnpm ui guide layers\`.\n`;
    }
  }
  return {
    key: entryKey(entry.layer, entry.id),
    id: entry.id,
    layer: entry.layer,
    title: fromStories.title,
    summary: fromStories.summary,
    import: entry.importPath,
    sources: fromStories.sources,
    body,
    examples: fromStories.examples,
    docsPath: fromStories.sources[0] ?? rel(packageRoot, entry.dir),
  };
}

export function getComponent(
  packageRoot: string,
  name: string,
  options: ComponentsOptions = {},
): ComponentDoc {
  const entry = findEntry(packageRoot, name, options);
  if (entry.layer === "shadcn") return showShadcn(packageRoot, entry);
  if (entry.layer === "forms" || entry.layer === "filter") {
    return showForms(packageRoot, entry);
  }
  return showStoryDriven(packageRoot, entry);
}

export function parseLayerFlag(value: unknown): ComponentLayer | undefined {
  if (typeof value !== "string" || !value) return undefined;
  if (!LAYERS.includes(value as ComponentLayer)) {
    throw new GeneratorError(
      `Invalid --layer "${value}". Expected one of: ${LAYERS.join(", ")}`,
      EXIT.invalidRequest,
    );
  }
  return value as ComponentLayer;
}

export function runComponents(
  packageRoot: string,
  componentId?: string,
  options: ComponentsOptions = {},
): ComponentsResult {
  if (!componentId) {
    return { kind: "index", index: getComponentsIndex(packageRoot, options) };
  }
  return {
    kind: "component",
    component: getComponent(packageRoot, componentId, options),
  };
}

export { LAYERS };
