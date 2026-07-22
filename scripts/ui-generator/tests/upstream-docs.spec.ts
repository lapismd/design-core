import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  emitDocsArtifacts,
  expandSectionExampleSources,
  extractThemeCustomProperties,
  normalizeDocsFenceLanguages,
  shouldReplaceFenceWithFullExample,
  stripSponsorAndHero,
} from "../docs/emit-docs-artifacts.js";
import {
  collectComponentPreviews,
  loadVendoredDocs,
  stripDocsSiteComponents,
} from "../docs/load-vendored-docs.js";
import {
  parseUpstreamDocs,
  pickExampleCode,
  stripSponsorCopy,
} from "../docs/parse-upstream-docs.js";
import {
  isEmptyElementShell,
  isRewrittenExample,
  rewriteExample,
  rewritePackageImports,
  rewriteSpacingArbitraryProps,
} from "../docs/rewrite-example.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "../../..");
const fixturePath = path.join(here, "../fixtures/upstream-docs/input-group.md");
const vendoredFixtureRoot = path.join(here, "../fixtures/vendored-docs");

describe("pickExampleCode", () => {
  it("prefers the full script SFC when a truncated fence comes first", () => {
    const stub = `<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}>
    Actions
  </DropdownMenu.Trigger>
</DropdownMenu.Root>`;
    const full = `<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  let open = $state(false);
</script>
${stub}
`;
    expect(pickExampleCode([stub, full])).toBe(full);
    expect(pickExampleCode([full, stub])).toBe(full);
  });
});

describe("parseUpstreamDocs", () => {
  const markdown = readFileSync(fixturePath, "utf8");
  const docs = parseUpstreamDocs("input-group", markdown);

  it("reads title and description", () => {
    expect(docs.title).toBe("Input Group");
    expect(docs.description).toMatch(/additional information/i);
  });

  it("parses usage fences", () => {
    expect(docs.usage.script).toContain("InputGroup");
    expect(docs.usage.markup).toContain("<InputGroup.Root>");
  });

  it("parses all example headings", () => {
    // Hero preview (if present) is prepended; fixture may or may not include one.
    const names = docs.examples.map((e) => e.name);
    expect(names.filter((n) => n !== "Preview")).toEqual([
      "Icon",
      "Text",
      "Button",
      "Tooltip",
      "Textarea",
      "Spinner",
      "Label",
      "Dropdown",
      "Button Group",
      "Custom Input",
    ]);
  });

  it("strips Epicenter sponsor copy from example prose", () => {
    const prose = `Displays a card with header, content, and footer.

### [Epicenter](https://github.com/EpicenterHQ/epicenter)

[Local-first, open source apps](https://github.com/EpicenterHQ/epicenter)

[Special Sponsor](https://github.com/EpicenterHQ/epicenter)
`;
    expect(stripSponsorCopy(prose)).toBe(
      "Displays a card with header, content, and footer.",
    );

    const heroMd = `# Card

Displays a card with header, content, and footer.

### [Epicenter](https://github.com/EpicenterHQ/epicenter)

[Local-first, open source apps](https://github.com/EpicenterHQ/epicenter)

[Special Sponsor](https://github.com/EpicenterHQ/epicenter)

\`\`\`svelte
<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
</script>
<Card.Root>Hi</Card.Root>
\`\`\`

## [Installation](#installation)

\`\`\`bash
pnpm add card
\`\`\`

## [Usage](#usage)

\`\`\`svelte
<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
</script>
\`\`\`
`;
    const card = parseUpstreamDocs("card", heroMd);
    const preview = card.examples.find((e) => e.slug === "preview");
    expect(preview?.description).toBe(
      "Displays a card with header, content, and footer.",
    );
    expect(preview?.description).not.toMatch(/Epicenter/i);
  });

  it("parses hero and usage-linked demos when Examples is empty", () => {
    const badgeMd = `# Badge

Displays a badge.

### [Epicenter](https://example.com)

\`\`\`svelte
<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
</script>
<Badge>Badge</Badge>
\`\`\`

## [Installation](#installation)

\`\`\`bash
pnpm dlx shadcn-svelte@latest add badge
\`\`\`

## [Usage](#usage)

\`\`\`svelte
<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
</script>
\`\`\`

\`\`\`svelte
<Badge variant="outline">Badge</Badge>
\`\`\`

### [Link](#link)

Use variants for links.

\`\`\`svelte
<script lang="ts">
  import { badgeVariants } from "$lib/components/ui/badge/index.js";
</script>
<a href="/dashboard" class={badgeVariants({ variant: "outline" })}>Badge</a>
\`\`\`
`;
    const badge = parseUpstreamDocs("badge", badgeMd);
    expect(badge.examples.map((e) => e.slug)).toEqual(["preview", "link"]);

    const skeletonMd = `# Skeleton

Placeholder.

\`\`\`svelte
<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>
<Skeleton class="size-12" />
\`\`\`

## [Installation](#installation)

\`\`\`bash
pnpm add skeleton
\`\`\`

## [Usage](#usage)

\`\`\`svelte
<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>
\`\`\`

## [Examples](#examples)

## [Card](#card)

\`\`\`svelte
<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>
<Skeleton class="h-4 w-full" />
\`\`\`
`;
    const skeleton = parseUpstreamDocs("skeleton", skeletonMd);
    expect(skeleton.examples.map((e) => e.slug)).toEqual(["preview", "card"]);
  });

  it("captures example prose and code", () => {
    const text = docs.examples.find((e) => e.name === "Text");
    expect(text?.description).toMatch(/additional text/i);
    expect(text?.code).toContain("<InputGroup.Text>");
    expect(text?.slug).toBe("text");
  });

  it("picks the complete Dialog demo when upstream ships a stub fence first", () => {
    const dialogMd = `# Dropdown Menu

## Examples

### Dialog

This example shows how to open a dialog from a dropdown menu.

\`\`\`svelte
<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}>
    Actions
  </DropdownMenu.Trigger>
</DropdownMenu.Root>
\`\`\`

\`\`\`svelte
<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  let showNewDialog = $state(false);
</script>
<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}>
    Actions
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={() => (showNewDialog = true)}>
      New File...
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
<Dialog.Root bind:open={showNewDialog}>
  <Dialog.Content>Hi</Dialog.Content>
</Dialog.Root>
\`\`\`
`;
    const parsed = parseUpstreamDocs("dropdown-menu", dialogMd);
    const dialog = parsed.examples.find((e) => e.slug === "dialog");
    expect(dialog?.code).toContain('<script lang="ts">');
    expect(dialog?.code).toContain("showNewDialog");
    expect(dialog?.code).toContain("<Dialog.Root");
  });
});

describe("rewriteExample", () => {
  const markdown = readFileSync(fixturePath, "utf8");
  const docs = parseUpstreamDocs("input-group", markdown);
  const available = new Set([
    "input-group",
    "tooltip",
    "dropdown-menu",
    "separator",
    "popover",
    "spinner",
    "label",
  ]);

  it("rewrites icon example imports", () => {
    const icon = docs.examples.find((e) => e.name === "Icon")!;
    const result = rewriteExample({
      component: "input-group",
      example: icon,
      availableFamilies: available,
    });
    expect(isRewrittenExample(result)).toBe(true);
    if (!isRewrittenExample(result)) return;
    expect(result.code).toContain('from "./index.js"');
    expect(result.code).not.toContain("$lib/components/ui");
  });

  it("rewrites Tailwind --spacing() arbitrary props to inline styles", () => {
    const source = `const spacingOptions = [
  { className: "[--card-spacing:--spacing(4)]", value: "4" },
];
<Card.Root class={selectedSpacing?.className}>`;
    const rewritten = rewriteSpacingArbitraryProps(source);
    expect(rewritten).toContain(
      'style: "--card-spacing: calc(var(--spacing) * 4)"',
    );
    expect(rewritten).toContain("style={selectedSpacing?.style}");
    expect(rewritten).not.toContain("className:");
  });

  it("rewrites package import paths for consumer docs", () => {
    const source = `import * as InputGroup from "$lib/components/ui/input-group/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";`;
    const rewritten = rewritePackageImports(source, "input-group");
    expect(rewritten).toContain('from "@stevejuma/ui/shadcn/input-group"');
    expect(rewritten).toContain('from "@stevejuma/ui/shadcn/tooltip"');
    expect(rewritten).not.toContain("$lib/components/ui");
    expect(rewritten).not.toContain("./index.js");
  });

  it("skips button-group when family is missing", () => {
    const group = docs.examples.find((e) => e.name === "Button Group")!;
    const result = rewriteExample({
      component: "input-group",
      example: group,
      availableFamilies: available,
    });
    expect(isRewrittenExample(result)).toBe(false);
    if (isRewrittenExample(result)) return;
    expect(result.reason).toBe("missing-family");
    expect(result.detail).toMatch(/button-group/);
  });

  it("skips clipboard hook examples", () => {
    const button = docs.examples.find((e) => e.name === "Button")!;
    const result = rewriteExample({
      component: "input-group",
      example: button,
      availableFamilies: available,
    });
    expect(isRewrittenExample(result)).toBe(false);
    if (isRewrittenExample(result)) return;
    expect(result.reason).toBe("unsupported-hook");
  });

  it("rewrites tabler icons to lucide", () => {
    const textarea = docs.examples.find((e) => e.name === "Textarea")!;
    const result = rewriteExample({
      component: "input-group",
      example: textarea,
      availableFamilies: available,
    });
    expect(isRewrittenExample(result)).toBe(true);
    if (!isRewrittenExample(result)) return;
    expect(result.code).toContain("@lucide/svelte/icons/");
    expect(result.code).not.toContain("@tabler/icons-svelte");
  });

  it("detects empty element shells", () => {
    expect(
      isEmptyElementShell(
        `<Tooltip.Provider delayDuration={0}>
</Tooltip.Provider>`,
      ),
    ).toBe(true);
    expect(
      isEmptyElementShell(`<Tooltip.Provider>
  <Tooltip.Root />
</Tooltip.Provider>`),
    ).toBe(false);
  });

  it("skips empty element shells", () => {
    const result = rewriteExample({
      component: "dialog",
      example: {
        name: "Empty",
        slug: "empty",
        description: "",
        code: `<Dialog.Root>
</Dialog.Root>`,
      },
      availableFamilies: new Set(["dialog"]),
    });
    expect(isRewrittenExample(result)).toBe(false);
    if (isRewrittenExample(result)) return;
    expect(result.reason).toBe("empty-code");
    expect(result.detail).toMatch(/empty element shell/i);
  });

  it("rewrites $lib/registry/ui imports from vendored examples", () => {
    const result = rewriteExample({
      component: "tooltip",
      example: {
        name: "Preview",
        slug: "preview",
        description: null,
        code: `<script lang="ts">
  import { buttonVariants } from "../ui/button/index.js";
  import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
</script>
<Tooltip.Provider><Tooltip.Root /></Tooltip.Provider>
`,
        previewName: "tooltip-demo",
      },
      availableFamilies: new Set(["tooltip", "button"]),
    });
    expect(isRewrittenExample(result)).toBe(true);
    if (!isRewrittenExample(result)) return;
    expect(result.code).toContain('from "./index.js"');
    expect(result.code).toContain('from "../button/index.js"');
    expect(result.code).not.toContain("$lib/registry");
  });
});

describe("stripDocsSiteComponents", () => {
  it("unwraps Steps/Step/Callout so tutorial prose and fences survive", () => {
    const md = `## Your First Sidebar

Intro.

<Steps>

<Step>

Add a provider.

</Step>

\`\`\`svelte
<Sidebar.Provider />
\`\`\`

<Callout>

**Note:** Wrap inset content in \`SidebarInset\`.

</Callout>

</Steps>
`;
    const cleaned = stripDocsSiteComponents(md);
    expect(cleaned).toContain("Add a provider.");
    expect(cleaned).toContain("<Sidebar.Provider />");
    expect(cleaned).toContain("Wrap inset content in `SidebarInset`.");
    expect(cleaned).not.toMatch(/<\/?Steps\b/i);
    expect(cleaned).not.toMatch(/<\/?Step\b/i);
    expect(cleaned).not.toMatch(/<\/?Callout\b/i);
  });

  it("preserves {#snippet} inside code fences while unwrapping install snippets", () => {
    const md = `## Sidebar.Header

\`\`\`svelte
<DropdownMenu.Trigger>
  {#snippet child({ props })}
    <Sidebar.MenuButton {...props} />
  {/snippet}
</DropdownMenu.Trigger>
\`\`\`

{#snippet cli()}
outside
{/snippet}
`;
    const cleaned = stripDocsSiteComponents(md);
    expect(cleaned).toContain("{#snippet child({ props })}");
    expect(cleaned).toContain("{/snippet}");
    expect(cleaned).toContain("outside");
    expect(cleaned).not.toMatch(/\{#snippet cli/);
  });

  it("keeps Installation content and unwraps snippet/install chrome", () => {
    const md = `## Installation

<InstallTabs>
{#snippet cli()}

Run the following command to install the \`sidebar\` components:

<PMAddComp name="sidebar" />

Add the following colors to your CSS file

\`\`\`css
:root { --sidebar: oklch(0.985 0 0); }
\`\`\`

{/snippet}
{#snippet manual()}
Copy and paste source.
{#if viewerData}
<ComponentSource item={viewerData} />
{/if}
{/snippet}
</InstallTabs>

<DocsFigure caption="Demo">
hello
</DocsFigure>
`;
    const cleaned = stripDocsSiteComponents(md);
    expect(cleaned).toContain("## Installation");
    expect(cleaned).toContain("pnpm ui:add sidebar");
    expect(cleaned).toContain("--sidebar: oklch(0.985 0 0)");
    expect(cleaned).not.toContain("Copy and paste source");
    expect(cleaned).not.toMatch(
      /\{#snippet|InstallTabs|PMAddComp|DocsFigure|hello/i,
    );
  });
});

describe("expandSectionExampleSources", () => {
  it("replaces abbreviated section fences with the full example SFC", () => {
    const full = `<script lang="ts">
  import * as Sidebar from "@stevejuma/ui/shadcn/sidebar";
</script>

<Sidebar.Provider>
  <Sidebar.Root>
    <Sidebar.Header>Workspace</Sidebar.Header>
  </Sidebar.Root>
</Sidebar.Provider>`;
    const md = `## Sidebar.Header

Intro.

\`\`\`svelte
<Sidebar.Root>
  <Sidebar.Header />
</Sidebar.Root>
\`\`\`

## Next
`;
    const expanded = expandSectionExampleSources(
      md,
      [
        {
          example: {
            name: "Sidebar.Header",
            slug: "sidebar-header",
            description: null,
            code: full,
          },
          code: full,
          requiredFamilies: ["sidebar"],
        },
      ],
      "sidebar",
    );
    expect(expanded).toContain('from "@stevejuma/ui/shadcn/sidebar"');
    expect(expanded).toContain("<Sidebar.Header>Workspace</Sidebar.Header>");
    expect(expanded).not.toContain("<Sidebar.Header />");
  });

  it("leaves tiny API one-liners alone", () => {
    expect(
      shouldReplaceFenceWithFullExample(
        `<Sidebar.Root collapsible="offcanvas | icon | none" />`,
        "<script></script>\n<Sidebar.Provider><Sidebar.Root /></Sidebar.Provider>",
      ),
    ).toBe(false);
  });
});

describe("stripSponsorAndHero", () => {
  it("keeps hero prose before Installation and drops hero fences", () => {
    const md = `# Sidebar

Short blurb.

Sidebars are complex to build.

\`\`\`svelte
<script></script>
\`\`\`

### [Epicenter](https://example.com)

[Special Sponsor](https://example.com)

## Installation

install me

## Structure

A \`Sidebar\` has parts.
`;
    const cleaned = stripSponsorAndHero(md);
    expect(cleaned).toContain("Sidebars are complex to build.");
    expect(cleaned).toContain("## Structure");
    expect(cleaned).toContain("A `Sidebar` has parts.");
    expect(cleaned).toContain("## Installation");
    expect(cleaned).not.toContain("<script></script>");
    expect(cleaned).not.toMatch(/Epicenter|Special Sponsor/i);
  });
});

describe("loadVendoredDocs", () => {
  it("collects ComponentPreview names with heading context", () => {
    const md = readFileSync(
      path.join(vendoredFixtureRoot, "content/components/dropdown-menu.md"),
      "utf8",
    );
    const body = md
      .replace(/^---[\s\S]*?---\r?\n/, "")
      .replace(/^\s*<script\b[^>]*>[\s\S]*?<\/script>\s*/i, "");
    const previews = collectComponentPreviews(body);
    expect(previews.map((p) => p.name)).toEqual([
      "dropdown-menu-demo",
      "dropdown-menu-dialog",
    ]);
    expect(previews[0]!.headingName).toBeNull();
    expect(previews[1]!.headingName).toBe("Dialog");
  });

  it("loads tooltip demos from ComponentPreview SFCs only", () => {
    const { docs } = loadVendoredDocs({
      packageRoot: here,
      component: "tooltip",
      vendorRoot: vendoredFixtureRoot,
    });
    expect(docs.title).toBe("Tooltip");
    expect(docs.examples).toHaveLength(1);
    expect(docs.examples[0]!.name).toBe("Preview");
    expect(docs.examples[0]!.slug).toBe("preview");
    expect(docs.examples[0]!.previewName).toBe("tooltip-demo");
    expect(docs.examples[0]!.code).toContain("Add to library");
    expect(docs.examples.map((e) => e.name)).not.toContain("Nested Providers");
  });

  it("loads dropdown-menu dialog from the full example SFC", () => {
    const { docs } = loadVendoredDocs({
      packageRoot: here,
      component: "dropdown-menu",
      vendorRoot: vendoredFixtureRoot,
    });
    expect(docs.examples.map((e) => e.name)).toEqual(["Preview", "Dialog"]);
    const dialog = docs.examples.find((e) => e.slug === "dialog")!;
    expect(dialog.code).toContain("Dialog.Root");
    expect(dialog.code).toContain("bind:open");
    expect(dialog.code).toContain("<script");
  });

  it("does not span example descriptions across Installation", () => {
    const body = `
<ComponentPreview name="card-demo">
<div></div>
</ComponentPreview>

## Installation

{#snippet cli()}
install
{/snippet}

## Examples

<ComponentPreview name="card-demo">
<div></div>
</ComponentPreview>

### Spacing

Use extra padding.

<ComponentPreview name="card-spacing">
<div></div>
</ComponentPreview>
`;
    const previews = collectComponentPreviews(body);
    expect(previews).toHaveLength(3);
    expect(previews[0]!.description ?? "").not.toMatch(/Installation|snippet/i);
    expect(previews[1]!.description).toBeNull();
    expect(previews[2]!.description).toBe("Use extra padding.");
  });

  it("skips type=block only when reporting isBlock flag", () => {
    const body = `
<ComponentPreview type="block" name="sidebar-07">
<div></div>
</ComponentPreview>

## Examples

### Header

<ComponentPreview name="tooltip-demo">
<div></div>
</ComponentPreview>
`;
    const previews = collectComponentPreviews(body);
    expect(previews).toHaveLength(2);
    expect(previews[0]!.isBlock).toBe(true);
    expect(previews[1]!.isBlock).toBe(false);
  });

  it("loads single-file block demos for sidebar", () => {
    const vendorRoot = path.join(here, "../../..", "vendor/shadcn-svelte-docs");
    const { docs, skippedBlocks } = loadVendoredDocs({
      packageRoot: here,
      component: "sidebar",
      vendorRoot,
    });
    expect(skippedBlocks).toEqual(["sidebar-07"]);
    expect(docs.examples.length).toBe(12);
    expect(docs.examples.map((e) => e.previewName)).toContain("demo-sidebar");
    expect(docs.examples.map((e) => e.previewName)).toContain(
      "demo-sidebar-header",
    );
    expect(docs.examples.map((e) => e.previewName)).toContain(
      "demo-sidebar-group-action",
    );
    expect(docs.examples.map((e) => e.name)).toContain("Sidebar.Header");
    const first = docs.examples.find((e) => e.previewName === "demo-sidebar")!;
    expect(first.code).toContain("Sidebar.Provider");
    expect(first.code).toContain("$lib/registry/ui/sidebar");
  });

  it("fails when a ComponentPreview SFC is missing", () => {
    expect(() =>
      loadVendoredDocs({
        packageRoot: here,
        component: "missing-preview",
        vendorRoot: vendoredFixtureRoot,
      }),
    ).toThrow(/Vendored content missing/);
  });
});

describe("emitDocsArtifacts", () => {
  const markdown = readFileSync(fixturePath, "utf8");
  const docs = parseUpstreamDocs("input-group", markdown);
  const available = new Set([
    "input-group",
    "tooltip",
    "dropdown-menu",
    "separator",
    "popover",
    "spinner",
    "label",
  ]);
  const examples = docs.examples
    .map((example) =>
      rewriteExample({
        component: "input-group",
        example,
        availableFamilies: available,
      }),
    )
    .filter(isRewrittenExample);

  it("emits hybrid MDX with Usage prose, Controls, and Canvas per example", () => {
    const targetDir = mkdtempSync(path.join(tmpdir(), "ui-docs-"));
    const written = emitDocsArtifacts({
      targetDir,
      component: "input-group",
      storyTitle: "Shadcn/Forms/Input Group",
      docs,
      examples,
    });

    expect(
      written.some((p) => p.endsWith("InputGroup.variations.stories.svelte")),
    ).toBe(true);
    expect(existsSync(path.join(targetDir, "InputGroup.mdx"))).toBe(true);

    const mdx = readFileSync(path.join(targetDir, "InputGroup.mdx"), "utf8");
    expect(mdx).toContain("## Usage");
    expect(mdx).toContain(
      'import docsBody from "./input-group.docs-body.md?raw"',
    );
    expect(mdx).toContain("<Markdown>{docsBody}</Markdown>");
    expect(mdx).not.toContain("## Documentation");
    expect(existsSync(path.join(targetDir, "input-group.docs-body.md"))).toBe(
      true,
    );
    expect(
      readFileSync(path.join(targetDir, "input-group.docs-body.md"), "utf8"),
    ).toMatch(/##\s+(\[)?Installation/);
    expect(mdx).toContain("<Primary />");
    expect(mdx).toContain("<Controls />");
    expect(mdx).toContain('<Source language="html" code={');
    expect(mdx).toContain("@stevejuma/ui/shadcn/input-group");
    expect(mdx).not.toContain('from "./index.js"');
    expect(mdx).toContain(
      "<Canvas of={InputGroupVariations.Icon} meta={InputGroupVariations} />",
    );
    expect(mdx).toContain(
      "<Canvas of={InputGroupVariations.Text} meta={InputGroupVariations} />",
    );
    // Skipped examples must not get a Canvas (prose may still appear in Documentation).
    expect(mdx).not.toContain("InputGroupVariations.ButtonGroup");

    const docsMd = readFileSync(
      path.join(targetDir, "input-group.docs.md"),
      "utf8",
    );
    expect(docsMd).toMatch(/##\s+(\[)?Installation/);
    expect(docsMd).toContain("## [Usage](#usage)");
    expect(docsMd).toContain("@stevejuma/ui/shadcn/input-group");
    // Svelte fences are remapped to `html` for Storybook Prism highlighting.
    expect(docsMd).toContain("```html");
    // Example headings keep prose; abbreviated fences expand to full SFCs.
    expect(docsMd).toContain("### [Icon](#icon)");
    expect(docsMd).toContain("<CreditCardIcon />");

    const stories = readFileSync(
      path.join(targetDir, "InputGroup.variations.stories.svelte"),
      "utf8",
    );
    expect(stories).toContain('name="Icon"');
    expect(stories).toContain('exportName="Icon"');
    expect(stories).toContain('tags={["upstream-example"]}');
    expect(stories).not.toContain("skip-visual");
    expect(stories).toContain("IconExample");
    // Canvas "Show code" must surface the example SFC, not the Story wrapper.
    expect(stories).toContain("exampleSources.Icon");
    expect(stories).toContain('type: "code"');
    const sources = readFileSync(
      path.join(targetDir, "InputGroup.example-sources.ts"),
      "utf8",
    );
    expect(sources).toContain("@stevejuma/ui/shadcn/input-group");
    expect(sources).toContain("<InputGroup.Root>");

    const icon = readFileSync(
      path.join(targetDir, "examples/icon.svelte"),
      "utf8",
    );
    expect(icon.startsWith("<script")).toBe(true);
    expect(icon).toContain("// @generated by ui-generator");
  });
});

describe("normalizeDocsFenceLanguages", () => {
  it("strips fence meta and maps svelte/ts to Prism-supported langs", () => {
    const md = `\`\`\`svelte showLineNumbers title="app.svelte"
<script lang="ts">
  const x = 1;
</script>
\`\`\`

\`\`\`ts
export const n = 1;
\`\`\`
`;
    const out = normalizeDocsFenceLanguages(md);
    expect(out).toContain("```html\n");
    expect(out).toContain("```typescript\n");
    expect(out).not.toContain("showLineNumbers");
    expect(out).not.toContain("```svelte");
    expect(out).not.toContain("```ts\n");
  });
});

describe("extractThemeCustomProperties", () => {
  it("extracts :root and .dark sidebar vars from theme.css", () => {
    const theme = readFileSync(path.join(packageRoot, "src/theme.css"), "utf8");
    const snippet = extractThemeCustomProperties(theme, "--sidebar");
    expect(snippet).toContain(":root {");
    expect(snippet).toContain(".dark {");
    expect(snippet).toContain("--sidebar:");
    expect(snippet).toContain("--sidebar-ring:");
    expect(snippet).toMatch(/oklch\(98\.5%/);
  });
});
