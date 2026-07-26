import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  composeComponentMarkdown,
  getComponent,
  listComponents,
  mdxToAgentMarkdown,
  parseExampleSources,
  runComponents,
} from "../pipeline/components.js";
import { createColors } from "../cli/color.js";
import { renderComponentShow, renderComponentsIndex } from "../cli/render.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("ui components", () => {
  it("lists components across layers with qualified keys", () => {
    const list = listComponents(packageRoot);
    const layers = new Set(list.map((c) => c.layer));
    expect(layers.has("shadcn")).toBe(true);
    expect(layers.has("forms")).toBe(true);
    expect(layers.has("filter")).toBe(true);
    expect(layers.has("ai")).toBe(true);
    expect(layers).toEqual(new Set(["shadcn", "forms", "filter", "ai"]));

    const searchFilter = list.find((c) => c.key === "filter/search-filter-bar");
    expect(searchFilter).toBeDefined();
    expect(searchFilter!.import).toBe("@stevejuma/ui/filter");

    const button = list.find((c) => c.key === "shadcn/button");
    expect(button).toBeDefined();
    expect(button!.hasDocs).toBe(true);
    expect(button!.import).toBe("@stevejuma/ui/shadcn/button");
    expect(button!.exampleCount).toBeGreaterThan(0);

    const formField = list.find((c) => c.key === "forms/form-field");
    expect(formField).toBeDefined();
    expect(formField!.hasDocs).toBe(true);
    expect(formField!.import).toBe("@stevejuma/ui/forms");
  });

  it("filters by --layer", () => {
    const forms = listComponents(packageRoot, { layer: "forms" });
    expect(forms.length).toBeGreaterThan(0);
    expect(forms.every((c) => c.layer === "forms")).toBe(true);
  });

  it("parses example-sources exports", () => {
    const map = parseExampleSources(
      `export const Default = "<script>\\n  import { Button } from \\"@stevejuma/ui/shadcn/button\\";\\n</script>\\n<Button>Button</Button>";\n`,
    );
    expect(map.get("Default")).toContain("@stevejuma/ui/shadcn/button");
    expect(map.get("Default")).toContain("<Button>Button</Button>");
  });

  it("injects svelte fences under matching example headings", () => {
    const docs = `# Button

## Examples

### [Default](#default)

### [Outline](#outline)
`;
    const sources = new Map([
      [
        "Default",
        '<script lang="ts">\n  import { Button } from "@stevejuma/ui/shadcn/button";\n</script>\n<Button>Button</Button>',
      ],
      ["Outline", '<Button variant="outline">Outline</Button>'],
    ]);
    const { body, examples } = composeComponentMarkdown(docs, sources);
    expect(body).toMatch(
      /### \[Default\]\(#default\)\n\n```svelte\n[\s\S]*?<Button>Button<\/Button>\n```/,
    );
    expect(body).toContain('variant="outline"');
    expect(examples.map((e) => e.id)).toEqual(["default", "outline"]);
  });

  it("converts forms MDX Source blocks to fences", () => {
    const { body, examples } = mdxToAgentMarkdown(`# FormField

Hello

## Usage

<Source language="html" code={"<script lang=\\"ts\\">\\n  import { FormField } from \\"@stevejuma/ui/forms\\";\\n</script>"} />

<Primary />
`);
    expect(body).toContain("```svelte");
    expect(body).toContain("@stevejuma/ui/forms");
    expect(body).not.toContain("<Primary");
    expect(examples[0]?.source).toContain("FormField");
  });

  it("shows shadcn button docs with usage and example fences", () => {
    const doc = getComponent(packageRoot, "button");
    expect(doc.key).toBe("shadcn/button");
    expect(doc.layer).toBe("shadcn");
    expect(doc.title).toBe("Button");
    expect(doc.body).toMatch(/## (?:\[Usage\]|Usage)/);
    expect(doc.body).toContain("```svelte");
    expect(doc.examples.length).toBeGreaterThan(0);

    const text = renderComponentShow(doc, createColors(false));
    expect(text).toContain("shadcn/button");
    expect(text).toContain(doc.import);
  });

  it("shows forms form-field from MDX", () => {
    const doc = getComponent(packageRoot, "forms/form-field");
    expect(doc.layer).toBe("forms");
    expect(doc.body).toMatch(/FormField/);
    expect(doc.body).toContain("@stevejuma/ui/forms");
    expect(doc.sources.some((s) => s.endsWith("FormField.mdx"))).toBe(true);
  });

  it("shows AI components from stories", () => {
    const ai = getComponent(packageRoot, "ai/ai-chat-panel");
    expect(ai.layer).toBe("ai");
    expect(ai.import).toBe("@stevejuma/ui/ai");
    expect(ai.body).toContain("Import");
  });

  it("runComponents switches between index and show", () => {
    const index = runComponents(packageRoot);
    expect(index.kind).toBe("index");
    if (index.kind === "index") {
      const text = renderComponentsIndex(index.index, createColors(false));
      expect(text).toContain("shadcn/button");
      expect(text).toContain("forms/");
    }
    const show = runComponents(packageRoot, "button");
    expect(show.kind).toBe("component");
  });

  it("rejects unknown and ambiguous names clearly", () => {
    expect(() => getComponent(packageRoot, "nope")).toThrow(
      /Unknown component/,
    );
  });
});
