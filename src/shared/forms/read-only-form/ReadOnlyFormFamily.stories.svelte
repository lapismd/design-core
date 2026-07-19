<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import ReadOnlyFormGroup from "./ReadOnlyFormGroup.svelte";
  import ReadOnlyFormList from "./ReadOnlyFormList.svelte";
  import ReadOnlyFormRow from "./ReadOnlyFormRow.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Read Only Form",
    parameters: {
      docs: {
        description: {
          component:
            "Readonly group, list, and row primitives for preview surfaces.",
        },
      },
    },
  });
</script>

<Story
  name="Group with list and rows"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Profile" }),
    ).toBeVisible();
    await expect(canvas.getByText("Northstar")).toBeVisible();
    await expect(canvas.getByText("TypeScript")).toBeVisible();
    await expect(canvas.getByText("Svelte")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="max-w-md">
      <ReadOnlyFormGroup title="Profile" meta="Preview">
        <ReadOnlyFormRow label="Title" value="Northstar" />
        <ReadOnlyFormList
          label="Skills"
          items={["TypeScript", "Svelte"]}
          highlightedIndexes={[1]}
        />
      </ReadOnlyFormGroup>
    </div>
  {/snippet}
</Story>
