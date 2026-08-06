import path from "node:path";
import { fileURLToPath } from "node:url";
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

const REVIEW_BLOCK_SOURCE =
  "src/shared/forms/form-review/ComposedReview.stories.svelte";
const FILTER_BLOCK_SOURCE =
  "src/shared/filter/search-filter-bar/SearchFilterBar.stories.svelte";

const ENTRY_METADATA: Record<
  string,
  { keywords: string[]; relatedIds?: string[] }
> = {
  "forms/form-review": {
    keywords: [
      "review AI changes",
      "accept reject",
      "keep undo",
      "reviewable form",
    ],
    relatedIds: [
      "block-reviewable-form-workflow",
      "forms-form-field",
      "forms-list-editor",
    ],
  },
  "forms/filter-command-picker": {
    keywords: [
      "searchable select",
      "combobox",
      "account picker",
      "filter choice",
    ],
    relatedIds: ["block-filterable-list-toolbar", "filter-search-filter-bar"],
  },
  "filter/search-filter-bar": {
    keywords: [
      "filter toolbar",
      "list search",
      "query autocomplete",
      "filter chips",
    ],
    relatedIds: [
      "block-filterable-list-toolbar",
      "forms-filter-command-picker",
      "guide-forms",
    ],
  },
};

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
    version: "0.1.0",
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
      return [
        fileURLToPath(import.meta.url),
        ...componentFiles,
        ...guideFiles,
        path.resolve(root, REVIEW_BLOCK_SOURCE),
        path.resolve(root, FILTER_BLOCK_SOURCE),
      ];
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
        const metadata = ENTRY_METADATA[key];
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
          ...(metadata ?? {}),
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
          keywords:
            topic.id === "forms"
              ? ["form control choice", "structured forms", "form guidance"]
              : topic.id === "testing"
                ? ["storybook tests", "visual baselines", "test UI"]
                : undefined,
          path: path.relative(root, guide.path).replaceAll("\\", "/"),
          markdown: `# ${topic.title}\n\n${topic.summary}\n\n${guide.body}\n`,
          sourceFiles: [guide.path],
        };
      });
      return {
        project: {
          title: "@lapismd/design-core",
          description:
            "Local UI package documentation for shadcn, forms, filter, and AI.",
          guidance: {
            setup: [
              "Run `pnpm ui guide` before inventing a component workflow.",
              "Use the Storybook MCP for live story instructions, previews, and story tests.",
            ],
            readingOrder: [
              "`pnpm ui guide layers`",
              "`pnpm ui guide shadcn` or `pnpm ui guide forms`",
              "`pnpm ui guide testing`",
              "`pnpm ui guide vcs`",
            ],
            rules: [
              "Use native CSS and shared tokens; do not add Tailwind to component sources.",
              "Add or update a colocated story with every visual component change.",
              "Never update visual baselines without explicit human approval.",
              "Prefer Jujutsu when `.jj` exists and commit each verified slice.",
            ],
          },
        },
        components,
        documents,
        artifacts: [
          {
            id: "block-reviewable-form-workflow",
            kind: "block",
            group: "blocks",
            slug: "reviewable-form-workflow",
            name: "Reviewable form workflow",
            summary:
              "Compose FormField or ListEditor with Keep/Undo review state for human-approved AI changes.",
            path: REVIEW_BLOCK_SOURCE,
            source: "UI Forms/Review/Composed Review",
            componentIds: [
              "forms-form-review",
              "forms-form-field",
              "forms-list-editor",
            ],
            keywords: [
              "review AI changes",
              "accept reject form",
              "keep undo workflow",
              "reviewable field",
            ],
            relatedIds: ["guide-forms", "forms-patchable-form"],
            documentation: `# Reviewable form workflow

Compose the shared review primitives with the ordinary form input. Keep the
pending review state in the consuming application so accepting or undoing a
change remains explicit and auditable.

## Text field

\`\`\`svelte
<FormField
  label="Name"
  value={name}
  review={{
    removedValue: originalName,
    onKeep: () => clearReview(),
    onUndo: () => {
      name = originalName;
      clearReview();
    },
  }}
>
  <input bind:value={name} aria-label="Name" />
</FormField>
\`\`\`

## List item

Use \`ListEditor.reviewItems\` for the same Keep/Undo workflow on individual
items. The composed story is the maintained executable reference.
`,
            denseMarkdown: `# Reviewable form workflow

- ID: \`block-reviewable-form-workflow\`
- Import: \`@lapismd/design-core/forms\`
- Components: \`forms-form-review\`, \`forms-form-field\`, \`forms-list-editor\`
- State owner: consuming application
- Actions: Keep clears review state; Undo restores \`removedValue\` then clears review state
- Reference: \`${REVIEW_BLOCK_SOURCE}\`
`,
            sourceFiles: [path.resolve(root, REVIEW_BLOCK_SOURCE)],
          },
          {
            id: "block-filterable-list-toolbar",
            kind: "block",
            group: "blocks",
            slug: "filterable-list-toolbar",
            name: "Filterable-list toolbar",
            summary:
              "Combine SearchFilterBar with host-owned filter pickers for searchable, structured list filtering.",
            path: FILTER_BLOCK_SOURCE,
            source: "Filter/Search Filter Bar — Ledger search demo",
            componentIds: [
              "filter-search-filter-bar",
              "forms-filter-command-picker",
            ],
            keywords: [
              "filter list toolbar",
              "search and filters",
              "faceted search",
              "query toolbar",
            ],
            relatedIds: ["guide-forms"],
            documentation: `# Filterable-list toolbar

Use \`SearchFilterBar\` as the search and query surface. Supply filter controls
through its \`filters\` snippet and keep query/filter state in the host.

## Composition

\`\`\`svelte
<SearchFilterBar
  value={query}
  inputMode="filter-query"
  filterSyntax={syntax}
  showFilterToggle
  bind:filtersExpanded
  onValueChange={(next) => (query = next)}
>
  {#snippet filters()}
    <FilterCommandPicker
      label="Type"
      options={typeOptions}
      value={type}
      onChange={(next) => (type = next)}
    />
  {/snippet}
</SearchFilterBar>
\`\`\`

## Ownership

The addon supplies presentation and query editing. The consuming application
owns filter options, selected values, query parsing, and list results.
`,
            denseMarkdown: `# Filterable-list toolbar

- ID: \`block-filterable-list-toolbar\`
- Imports: \`SearchFilterBar\` from \`@lapismd/design-core/filter\`; \`FilterCommandPicker\` from \`@lapismd/design-core/forms\`
- Components: \`filter-search-filter-bar\`, \`forms-filter-command-picker\`
- Host state: query, expanded state, filter options, selections, and results
- Reference: \`${FILTER_BLOCK_SOURCE}\`
`,
            sourceFiles: [path.resolve(root, FILTER_BLOCK_SOURCE)],
          },
        ],
      };
    },
  };
}
