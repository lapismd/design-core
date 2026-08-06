<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { Code } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Content/Code",
    component: Code,
    parameters: {
      docs: {
        description: {
          component:
            "Inline code element with monospace font and muted background. For fenced multi-line snippets with syntax highlighting, use Code Block. Differs from UI Forms Code Highlighter, which requires a Lezer parser for form previews. See ADD_CODE_BLOCK.md and [Shadcn guidance](?path=/docs/shadcn-guidance--docs).",
        },
      },
    },
  });
</script>

<Story
  name="Inline in prose"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const el = canvas.getByText("const x = 1");
    await expect(el).toBeVisible();
    await expect(el).toHaveAttribute("data-ui-component", "code");
    await expect(el).toHaveAttribute("data-color", "primary");
  }}
>
  {#snippet template()}
    <p>
      Use <Code>const x = 1</Code> to declare a variable.
    </p>
  {/snippet}
</Story>

<Story
  name="Color variants"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("primary")).toHaveAttribute(
      "data-color",
      "primary",
    );
    await expect(canvas.getByText("secondary")).toHaveAttribute(
      "data-color",
      "secondary",
    );
    await expect(canvas.getByText("inherit")).toHaveAttribute(
      "data-color",
      "inherit",
    );
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-2">
      <p>Primary <Code color="primary">primary</Code></p>
      <p>Secondary <Code color="secondary">secondary</Code></p>
      <p style="color: var(--foreground); font-size: 1.125rem">
        Inherit <Code color="inherit">inherit</Code>
      </p>
    </div>
  {/snippet}
</Story>

<Story
  name="Size inherit"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("matching")).toHaveAttribute(
      "data-size",
      "inherit",
    );
  }}
>
  {#snippet template()}
    <p style="font-size: 1.25rem">
      Larger text with <Code size="inherit">matching</Code> inline code.
    </p>
  {/snippet}
</Story>
