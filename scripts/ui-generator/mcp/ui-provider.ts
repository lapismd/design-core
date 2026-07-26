import path from "node:path";
import type {
  DocsMcpCatalog,
  DocsMcpProvider,
} from "../../../packages/storybook-addon-docs-mcp/src/types.js";
import {
  extractPropsFromSvelteFile,
  findPrimarySvelteFile,
  formatPropsMarkdown,
} from "../../../packages/storybook-addon-docs-mcp/src/svelte/svelte-props.js";
import {
  catalogEntryKey,
  catalogEntrySourceFiles,
  collectCatalog,
  getComponent,
  type CatalogEntry,
} from "../pipeline/components.js";
import { getGuideTopic, listGuideTopics } from "../pipeline/guide.js";

function manifestId(entry: CatalogEntry): string {
  return `${entry.layer}-${entry.id}`.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function resolveSvelte(entry: CatalogEntry, title: string) {
  return (
    findPrimarySvelteFile(entry.dir, entry.id) ??
    findPrimarySvelteFile(entry.dir, title.replace(/\s+/g, ""))
  );
}

export function createUiDocsProvider(): DocsMcpProvider {
  return {
    name: "stevejuma-ui",
    sourceFiles: ({ root }) => {
      const componentFiles = collectCatalog(root).flatMap((entry) => {
        const doc = getComponent(root, catalogEntryKey(entry));
        const svelte = resolveSvelte(entry, doc.title);
        return [
          ...catalogEntrySourceFiles(entry),
          ...(svelte ? [path.resolve(svelte)] : []),
        ];
      });
      const guideFiles = listGuideTopics(root).map(
        (topic) => getGuideTopic(root, topic.id).path,
      );
      return [...componentFiles, ...guideFiles];
    },
    load: ({ root }): DocsMcpCatalog => {
      const components = collectCatalog(root).map((entry) => {
        const key = catalogEntryKey(entry);
        const doc = getComponent(root, key);
        const sveltePath = resolveSvelte(entry, doc.title);
        const reactDocgen = sveltePath
          ? extractPropsFromSvelteFile(sveltePath, doc.title)
          : undefined;
        const parts = [
          `# ${doc.title}`,
          "",
          doc.summary,
          "",
          `ID: \`${manifestId(entry)}\``,
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
        const props = formatPropsMarkdown(reactDocgen);
        if (props) parts.push(props);
        parts.push(doc.body.trim(), "");
        return {
          id: manifestId(entry),
          group: entry.layer,
          slug: entry.id,
          name: doc.title,
          summary: doc.summary,
          path: sveltePath
            ? path.relative(root, sveltePath).replaceAll("\\", "/")
            : doc.docsPath,
          importPath: doc.import,
          markdown: `${parts.join("\n").trimEnd()}\n`,
          stories: doc.examples.map((example) => ({
            id: `${manifestId(entry)}--${example.id}`,
            name: example.title,
            snippet: example.source,
          })),
          reactDocgen,
          sourceFiles: [
            ...catalogEntrySourceFiles(entry),
            ...(sveltePath ? [path.resolve(sveltePath)] : []),
          ],
        };
      });
      const documents = listGuideTopics(root).map((topic) => {
        const guide = getGuideTopic(root, topic.id);
        return {
          id: `guide-${topic.id}`,
          group: "guide",
          slug: topic.id,
          name: topic.title,
          title: `Guide/${topic.title}`,
          summary: topic.summary,
          path: path.relative(root, guide.path).replaceAll("\\", "/"),
          markdown: `# ${topic.title}\n\n${topic.summary}\n\n${guide.body}\n`,
          sourceFiles: [guide.path],
        };
      });
      return {
        project: {
          title: "@stevejuma/ui",
          description:
            "Local UI package documentation for shadcn, forms, filter, and AI.",
        },
        components,
        documents,
      };
    },
  };
}
