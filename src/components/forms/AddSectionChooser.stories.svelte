<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AddSectionChooser from "./AddSectionChooser.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Add Section Chooser",
    component: AddSectionChooser,
    parameters: {
      docs: {
        description: {
          component:
            "Chooser for adding a section type from a prop-driven list.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let open = $state(false);
  let title = $state("");
  let chosen = $state("none");
</script>

<Story
  name="Chooses a section"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Add New Section" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Projects" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("projects");
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-2">
      <AddSectionChooser
        {open}
        {title}
        options={[
          { value: "experience", label: "Experience" },
          { value: "projects", label: "Projects" },
        ]}
        onOpen={() => {
          open = true;
        }}
        onCancel={() => {
          open = false;
        }}
        onTitleChange={(next) => {
          title = next;
        }}
        onChoose={(value) => {
          chosen = value;
          open = false;
        }}
      />
      <output class="text-muted-foreground text-sm">{chosen}</output>
    </div>
  {/snippet}
</Story>
