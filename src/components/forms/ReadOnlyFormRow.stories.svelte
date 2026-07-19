<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import ReadOnlyFormRow from "./ReadOnlyFormRow.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Read Only Form Row",
    component: ReadOnlyFormRow,
    parameters: {
      docs: {
        description: {
          component: "Readonly label/value row for preview surfaces.",
        },
      },
    },
  });
</script>

<Story
  name="Displays a value"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Title")).toBeVisible();
    await expect(canvas.getByText("Northstar")).toBeVisible();
  }}
>
  {#snippet template()}
    <ReadOnlyFormRow label="Title" value="Northstar" />
  {/snippet}
</Story>
