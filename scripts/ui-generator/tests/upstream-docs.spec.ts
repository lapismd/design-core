import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { emitDocsArtifacts } from "../docs/emit-docs-artifacts.js";
import {
  parseUpstreamDocs,
  stripSponsorCopy,
} from "../docs/parse-upstream-docs.js";
import {
  isRewrittenExample,
  rewriteExample,
  rewritePackageImports,
  rewriteSpacingArbitraryProps,
} from "../docs/rewrite-example.js";

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/upstream-docs/input-group.md",
);

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
    expect(rewritten).toContain(
      'from "@stevejuma/ui/shadcn/input-group"',
    );
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

    expect(written.some((p) => p.endsWith("InputGroup.variations.stories.svelte"))).toBe(
      true,
    );
    expect(existsSync(path.join(targetDir, "InputGroup.mdx"))).toBe(true);

    const mdx = readFileSync(path.join(targetDir, "InputGroup.mdx"), "utf8");
    expect(mdx).toContain("## Usage");
    expect(mdx).not.toMatch(/##\s+Installation/);
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
    expect(mdx).not.toContain("Button Group");

    const docsMd = readFileSync(path.join(targetDir, "input-group.docs.md"), "utf8");
    expect(docsMd).not.toMatch(/##\s+(\[)?Installation/);
    expect(docsMd).toContain("## [Usage](#usage)");
    expect(docsMd).toContain("@stevejuma/ui/shadcn/input-group");
    expect(docsMd).toContain("```svelte");
    // Example code fences are stripped; prose headings remain.
    expect(docsMd).toContain("### [Icon](#icon)");
    expect(docsMd).not.toContain("<CreditCardIcon />");

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
