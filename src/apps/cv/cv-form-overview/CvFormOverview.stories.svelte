<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import CvFormOverview from "./CvFormOverview.svelte";
  import CvWorkspaceForm from "../cv-workspace-form/CvWorkspaceForm.svelte";

  const { Story } = defineMeta({
    title: "Apps/CV/CV Form",
    component: CvFormOverview,
    parameters: {
      docs: {
        description: {
          component:
            "Prop-driven recreation of Studio’s CV workspace form (tabs + sections + YAML). See UI Forms/Guidance.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let collapseAll = $state(false);
</script>

<Story
  name="Edits profile name"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const name = canvas.getAllByLabelText("Name")[0];
    await userEvent.clear(name);
    await userEvent.type(name, "Ada Lovelace");
    await expect(canvas.getAllByLabelText("Name")[0]).toHaveValue(
      "Ada Lovelace",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Experience" }),
    );
    await expect(canvas.queryByLabelText("Company")).toBeNull();
  }}
>
  {#snippet template()}
    <CvFormOverview />
  {/snippet}
</Story>

<Story
  name="Toggles YAML mode"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByLabelText("YAML mode"));
    await expect(canvas.getByRole("textbox")).toBeVisible();
  }}
>
  {#snippet template()}
    <CvFormOverview />
  {/snippet}
</Story>

<Story name="CV tab"
  tags={["visual-failed"]}
>
  {#snippet template()}
    <div class="bg-background min-h-[720px]">
      <CvWorkspaceForm />
    </div>
  {/snippet}
</Story>

<Story name="Evidence tab" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="bg-background min-h-[720px]">
      <CvWorkspaceForm tab="evidence" />
    </div>
  {/snippet}
</Story>

<Story
  name="Design locale settings"
  tags={["skip-visual"]}
  parameters={{ a11y: { test: "todo" } }}
>
  {#snippet template()}
    <div class="bg-background flex min-h-[720px] flex-col gap-8">
      <CvWorkspaceForm tab="design" />
      <CvWorkspaceForm tab="locale" />
      <CvWorkspaceForm tab="settings" />
    </div>
  {/snippet}
</Story>

<Story name="Collapse all" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="bg-background min-h-[720px]">
      <label class="mb-3 flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={collapseAll} />
        Collapse all sections
      </label>
      <CvWorkspaceForm {collapseAll} />
    </div>
  {/snippet}
</Story>
