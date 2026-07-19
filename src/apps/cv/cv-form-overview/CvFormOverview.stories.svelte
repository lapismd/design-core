<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import CvFormOverview from "./CvFormOverview.svelte";

  const { Story } = defineMeta({
    title: "Apps/CV/CV Form",
    component: CvFormOverview,
    parameters: {
      docs: {
        description: {
          component:
            "Visual mirror of Studio’s CV tab using `@stevejuma/ui/forms` primitives. Not Studio runtime — see UI Forms/Guidance.",
        },
      },
    },
  });
</script>

<!-- Interaction first so vitest does not inherit a collapsed section from the visual story. -->
<Story
  name="Edits profile name"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const name = canvas.getByLabelText("Name");
    await userEvent.clear(name);
    await userEvent.type(name, "Ada Lovelace");
    await expect(canvas.getByLabelText("Name")).toHaveValue("Ada Lovelace");
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

<Story name="CV tab">
  {#snippet template()}
    <div class="bg-background min-h-[720px]">
      <CvFormOverview />
    </div>
  {/snippet}
</Story>
