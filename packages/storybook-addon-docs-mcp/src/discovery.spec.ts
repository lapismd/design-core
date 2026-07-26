import { describe, expect, it } from "vitest";
import {
  getCatalogEntry,
  normalizeCatalog,
  parseMarkdownSections,
  searchCatalog,
} from "./discovery.js";
import type { DocsMcpCatalog, DocsMcpConfig } from "./types.js";

const longParagraph = "Complete authored paragraph. ".repeat(20).trim();

function fixtureCatalog(): DocsMcpCatalog {
  return {
    project: { title: "Fixture UI" },
    components: [
      {
        id: "forms-command-picker",
        group: "forms",
        slug: "command-picker",
        name: "Command Picker",
        summary: "A searchable choice control.",
        path: "src/CommandPicker.svelte",
        importPath: "@fixture/ui/forms",
        keywords: ["account picker", "searchable selection"],
        markdown: `# Command Picker

A searchable choice control.

## Usage

${longParagraph}

## Properties

\`value\`, \`options\`, and \`onChange\`.
`,
        sourceFiles: [],
      },
      {
        id: "navigation-command-picker",
        group: "navigation",
        slug: "command-picker",
        name: "Navigation Command Picker",
        summary: "A navigation launcher.",
        path: "src/NavigationPicker.svelte",
        markdown: "# Navigation Command Picker\n\nA navigation launcher.\n",
        sourceFiles: [],
      },
    ],
    documents: [
      {
        id: "guide-forms",
        group: "guide",
        slug: "forms",
        name: "Forms guidance",
        summary: "Choose structured forms or individual controls.",
        keywords: ["form control choice"],
        path: "docs/forms.md",
        markdown:
          "# Forms guidance\n\nChoose a layer.\n\n## Structured forms\n\nUse schema-driven fields.\n",
        sourceFiles: [],
      },
    ],
    artifacts: [
      {
        id: "block-reviewable-form",
        kind: "block",
        group: "blocks",
        slug: "reviewable-form",
        name: "Reviewable form",
        summary: "Keep or undo proposed field changes.",
        path: "stories/Review.stories.svelte",
        source: "Review story",
        componentIds: ["forms-command-picker"],
        keywords: ["accept reject changes", "AI review"],
        documentation:
          "# Reviewable form\n\nKeep or undo changes.\n\n## Workflow\n\nReview each field.\n",
        denseMarkdown: "# Reviewable form\n\n- Keep accepts\n- Undo restores\n",
        sourceFiles: [],
      },
    ],
  };
}

const config: DocsMcpConfig = {
  provider: {
    name: "fixture",
    sourceFiles: () => [],
    load: fixtureCatalog,
  },
  search: {
    synonyms: {
      picker: ["select", "dropdown", "combobox"],
      review: ["approval", "accept", "reject"],
    },
  },
  retrieval: { maxChars: 520 },
};

describe("Docs MCP discovery", () => {
  it("parses stable Markdown sections and ignores headings in code fences", () => {
    const sections = parseMarkdownSections(`# Title

## Usage

\`\`\`md
## Not a section
\`\`\`

## Usage

Again.
`);
    expect(sections.map(({ id, title }) => ({ id, title }))).toEqual([
      { id: "usage", title: "Usage" },
      { id: "usage-2", title: "Usage" },
    ]);
    expect(sections[0]!.markdown).toContain("## Not a section");
  });

  it("ranks exact names, authored synonyms, typos, and curated blocks deterministically", () => {
    const catalog = normalizeCatalog(fixtureCatalog());
    expect(
      searchCatalog(catalog, config, { query: "Command Picker" }).results[0],
    ).toMatchObject({ id: "forms-command-picker", score: 100 });
    expect(
      searchCatalog(catalog, config, { query: "account dropdown" }).results[0],
    ).toMatchObject({ id: "forms-command-picker" });
    expect(
      searchCatalog(catalog, config, { query: "comand picker" }).results[0],
    ).toMatchObject({ id: "forms-command-picker" });
    expect(
      searchCatalog(catalog, config, {
        query: "accept reject changes",
        kinds: ["block"],
      }).results[0],
    ).toMatchObject({ id: "block-reviewable-form", kind: "block" });
    expect(
      searchCatalog(catalog, config, { query: "qzxv plmokn" }).results,
    ).toEqual([]);
  });

  it("resolves exact IDs, reports ambiguous slugs, and supports sections and dense output", () => {
    const catalog = normalizeCatalog(fixtureCatalog());
    expect(
      getCatalogEntry(catalog, config, { id: "command-picker" }),
    ).toMatchObject({
      status: "ambiguous",
      candidates: [
        { id: "forms-command-picker" },
        { id: "navigation-command-picker" },
      ],
    });
    expect(
      getCatalogEntry(catalog, config, {
        id: "forms-command-picker",
        section: "properties",
      }),
    ).toMatchObject({
      status: "ok",
      section: "properties",
      markdown: expect.stringContaining("`value`"),
    });
    expect(
      getCatalogEntry(catalog, config, {
        id: "block-reviewable-form",
        format: "dense",
      }),
    ).toMatchObject({
      status: "ok",
      markdown: "# Reviewable form\n\n- Keep accepts\n- Undo restores\n",
    });
  });

  it("keeps bounded responses within budget and returns a follow-up section index", () => {
    const result = getCatalogEntry(normalizeCatalog(fixtureCatalog()), config, {
      id: "forms-command-picker",
    });
    expect(result).toMatchObject({
      status: "ok",
      truncated: true,
      hint: expect.stringContaining('section "<section-id>"'),
    });
    expect(result.markdown!.length).toBeLessThanOrEqual(520);
    expect(result.markdown).toContain("## Section index");
    expect(result.markdown).toContain("`properties`");
  });
});
