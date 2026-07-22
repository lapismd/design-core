<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ListEditor from "./ListEditor.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/List Editor",
    component: ListEditor,
    parameters: {
      docs: {
        description: {
          component:
            "Ordered string list with drag reorder. Inline variant matches structured-form Tags/Roles chrome; supports per-item review.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let roles = $state<string[]>(["Backend", "Staff Engineer"]);
</script>

<Story
  name="Edits a list item"
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Roles 1");
    await userEvent.clear(input);
    await userEvent.type(input, "Platform");
    await expect(canvas.getByLabelText("Roles 1")).toHaveValue("Platform");
  }}
>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <ListEditor
        label="Roles"
        items={roles}
        addLabel="role"
        multiline={false}
        onChange={(next) => {
          roles = next;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <ListEditor
        label="Roles"
        items={[]}
        addLabel="role"
        multiline={false}
        error="Enter at least one value."
        onChange={() => {}}
      />
    </div>
  {/snippet}
</Story>
