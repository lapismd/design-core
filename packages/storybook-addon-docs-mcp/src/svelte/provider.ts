import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import type {
  DocsMcpCatalog,
  DocsMcpComponent,
  DocsMcpProvider,
  DocsMcpStory,
} from "../types.js";
import {
  extractPropsFromSvelteFile,
  formatPropsMarkdown,
} from "./svelte-props.js";

export type SvelteDocsProviderOptions = {
  title?: string;
  description?: string;
  stories?: string[];
  docs?: string[];
};

type StoryFile = {
  path: string;
  title: string;
  componentPath?: string;
  componentName: string;
  summary: string;
  stories: DocsMcpStory[];
};

function kebab(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function firstParagraph(markdown: string): string {
  return (
    markdown
      .replace(/^---[\s\S]*?---\s*/m, "")
      .split(/\n\s*\n/)
      .map((part) => part.replace(/^#+\s+/, "").trim())
      .find(
        (part) => part && !part.startsWith("<") && !part.startsWith("```"),
      ) ?? "Storybook documentation."
  );
}

function parseStoryFile(root: string, storyPath: string): StoryFile {
  const source = readFileSync(storyPath, "utf8");
  const title =
    /<Meta\b[^>]*\btitle=["']([^"']+)["']/m.exec(source)?.[1] ??
    /title\s*:\s*["']([^"']+)["']/m.exec(source)?.[1] ??
    path.basename(storyPath).replace(/\.stories\.svelte$/, "");
  const metaComponent = /<Meta\b[^>]*\bcomponent=\{([A-Za-z_$][\w$]*)\}/m.exec(
    source,
  )?.[1];
  const imports = [
    ...source.matchAll(
      /import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+\.svelte)["']/g,
    ),
  ];
  const selected =
    imports.find((match) => match[1] === metaComponent) ??
    (imports.length === 1 ? imports[0] : undefined);
  const componentPath = selected
    ? path.resolve(path.dirname(storyPath), selected[2]!)
    : undefined;
  const componentName =
    selected?.[1] ?? title.split("/").pop() ?? path.basename(storyPath);
  const summary =
    /component\s*:\s*["'`]([^"'`]+)["'`]/m.exec(source)?.[1] ??
    `Stories for ${componentName}.`;
  const stories: DocsMcpStory[] = [];
  for (const match of source.matchAll(/<Story\b([^>]*?)(?:\/>|>)/g)) {
    const attrs = match[1] ?? "";
    const name =
      /\bname=["']([^"']+)["']/.exec(attrs)?.[1] ??
      /\bname=\{["']([^"']+)["']\}/.exec(attrs)?.[1];
    if (!name) continue;
    stories.push({
      id: `${kebab(title)}--${kebab(name)}`,
      name,
      snippet: match[0],
    });
  }
  return {
    path: storyPath,
    title,
    componentPath:
      componentPath && existsSync(componentPath) ? componentPath : undefined,
    componentName,
    summary,
    stories,
  };
}

function findFallbackComponent(storyPath: string): string | undefined {
  const dir = path.dirname(storyPath);
  const candidates = readdirSync(dir)
    .filter(
      (name) => name.endsWith(".svelte") && !name.includes(".stories.svelte"),
    )
    .map((name) => path.join(dir, name));
  return candidates.length === 1 ? candidates[0] : undefined;
}

function componentMarkdown(
  component: Omit<DocsMcpComponent, "markdown">,
): string {
  const props = formatPropsMarkdown(component.reactDocgen);
  const lines = [
    `# ${component.name}`,
    "",
    component.summary,
    "",
    `ID: \`${component.id}\``,
    "",
  ];
  if (component.importPath) {
    lines.push(
      "## Import",
      "",
      "```ts",
      `import ${component.name} from "${component.importPath}";`,
      "```",
      "",
    );
  }
  if (props) lines.push(props);
  if (component.stories?.length) {
    lines.push("## Stories", "");
    for (const story of component.stories) {
      lines.push(`### ${story.name}`, "", story.snippet ?? "", "");
    }
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

/**
 * Generic Svelte CSF provider. Explicit `.svelte` imports referenced by
 * `<Meta component={...}>` win; a single colocated component is the safe
 * fallback. Ambiguous and unresolved stories are reported as warnings.
 */
export function createSvelteDocsProvider(
  options: SvelteDocsProviderOptions = {},
): DocsMcpProvider {
  const storyGlobs = options.stories ?? ["src/**/*.stories.svelte"];
  const docGlobs = options.docs ?? ["src/**/*.mdx", "docs/**/*.md"];

  function sourceFiles(root: string): string[] {
    return fg.sync([...storyGlobs, ...docGlobs, "src/**/*.svelte"], {
      cwd: root,
      absolute: true,
      onlyFiles: true,
      unique: true,
    });
  }

  return {
    name: "svelte-stories",
    sourceFiles: ({ root }) => sourceFiles(root),
    load: ({ root }): DocsMcpCatalog => {
      const warnings: string[] = [];
      const storyPaths = fg.sync(storyGlobs, {
        cwd: root,
        absolute: true,
        onlyFiles: true,
      });
      const parsed = storyPaths.map((storyPath) =>
        parseStoryFile(root, storyPath),
      );
      const byComponent = new Map<string, StoryFile[]>();
      for (const story of parsed) {
        const componentPath =
          story.componentPath ?? findFallbackComponent(story.path);
        if (!componentPath) {
          warnings.push(
            `Could not resolve a unique component for ${path.relative(root, story.path)}`,
          );
          continue;
        }
        const list = byComponent.get(componentPath) ?? [];
        list.push(story);
        byComponent.set(componentPath, list);
      }

      const components: DocsMcpComponent[] = [];
      for (const [componentPath, storyFiles] of byComponent) {
        const primary = storyFiles[0]!;
        const relative = path
          .relative(root, componentPath)
          .replaceAll("\\", "/");
        const group =
          primary.title.split("/").slice(0, -1).join("/") || "components";
        const slug = kebab(primary.componentName);
        const base = {
          id: kebab(`${group}-${slug}`),
          group: kebab(group),
          slug,
          name: primary.componentName,
          summary: primary.summary,
          path: relative,
          importPath: `./${relative}`,
          stories: storyFiles.flatMap((story) => story.stories),
          reactDocgen: extractPropsFromSvelteFile(
            componentPath,
            primary.componentName,
          ),
          sourceFiles: [
            componentPath,
            ...storyFiles.map((story) => story.path),
          ],
        };
        components.push({ ...base, markdown: componentMarkdown(base) });
      }

      const documents = fg
        .sync(docGlobs, { cwd: root, absolute: true, onlyFiles: true })
        .filter((filePath) => statSync(filePath).isFile())
        .map((filePath) => {
          const relative = path.relative(root, filePath).replaceAll("\\", "/");
          const raw = readFileSync(filePath, "utf8");
          const title =
            /^#\s+(.+)$/m.exec(raw)?.[1]?.trim() ??
            path.basename(filePath, path.extname(filePath));
          const group = relative.startsWith("docs/") ? "guide" : "docs";
          const slug = kebab(title);
          return {
            id: `${group}-${slug}`,
            group,
            slug,
            name: title,
            title: `${group}/${title}`,
            summary: firstParagraph(raw),
            path: relative,
            markdown: raw,
            sourceFiles: [filePath],
          };
        });

      return {
        project: {
          title: options.title ?? path.basename(root),
          description: options.description,
        },
        components: components.sort((a, b) => a.id.localeCompare(b.id)),
        documents,
        warnings,
      };
    },
  };
}
