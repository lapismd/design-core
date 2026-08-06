<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Textarea } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Textarea",
    component: Textarea,
    parameters: {
      docs: {
        description: {
          component: "UI-owned multiline text control for longer form values.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let summary = $state("Initial notes");
</script>

<Story
  name="Edits multiline text"
  play={async ({ canvas }) => {
    const area = canvas.getByLabelText("Summary");
    await userEvent.clear(area);
    await userEvent.type(area, "Updated notes");
    await expect(canvas.getByRole("status")).toHaveTextContent("Updated notes");
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/textarea/edits-multiline-text-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="flex max-w-md flex-col gap-2">
      <label class="text-sm font-medium" for="catalog-summary">Summary</label>
      <Textarea id="catalog-summary" bind:value={summary} rows={4} />
      <output class="text-muted-foreground text-sm">{summary}</output>
    </div>
  {/snippet}
</Story>
