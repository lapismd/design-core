<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TagEditor from "./TagEditor.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Tag Editor",
    component: TagEditor,
    parameters: {
      docs: {
        description: {
          component: "Chip list with autocomplete for tags.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let tags = $state<string[]>(["typescript"]);
</script>

<Story
  name="Adds a tag"
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Tags", { selector: "input" });
    await userEvent.type(input, "svelte{Enter}");
    await expect(canvas.getByText(/svelte/i)).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="max-w-md">
      <TagEditor
        value={tags}
        suggestions={["svelte", "typescript", "css"]}
        label="Tags"
        showLabel={true}
        onChange={(next) => {
          tags = next;
        }}
      />
    </div>
  {/snippet}
</Story>
