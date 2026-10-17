<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import LinkPreview from "./LinkPreview.svelte";
  import { Basic } from "./LinkPreview.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Content/Link Preview",
    component: LinkPreview,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Inline compact and rich"
  play={async ({ canvas }) => {
    await expect(canvas.getAllByRole("link")).toHaveLength(3);
  }}
  >{#snippet template()}<div
      style="display:flex;flex-direction:column;gap:1rem;max-width:28rem"
    >
      {#each ["inline", "compact", "rich"] as layout}<LinkPreview
          href="https://example.com/project"
          title="Project overview"
          description="A locally composed preview with no metadata requests."
          layout={layout as "inline" | "compact" | "rich"}
        />{/each}
    </div>{/snippet}</Story
>
<Story
  name="Unsafe destination stays readable"
  args={{ href: "javascript:alert(1)", title: "Unavailable destination" }}
  play={async ({ canvas }) => {
    await expect(canvas.queryByRole("link")).toBeNull();
    await expect(canvas.getByText("Unavailable destination")).toBeVisible();
  }}
/>
<Story name="Narrow rich card"
  >{#snippet template()}<div style="width:220px">
      <LinkPreview
        href="https://example.com/very/long/path/to/project"
        title="A longer project name that should wrap"
        layout="rich"
      />
    </div>{/snippet}</Story
>
