<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CvWorkspaceDemo from "./CvWorkspaceDemo.svelte";

  const { Story } = defineMeta({
    title: "Apps/CV/CV Workspace",
    component: CvWorkspaceDemo,
    parameters: {
      docs: {
        description: {
          component:
            "Full CV workspace shell: Studio sidebar chrome, CV file list, form body, and presentational AI panel. Fixtures only — no Studio store or live /api/ai.",
        },
      },
      layout: "fullscreen",
    },
  });
</script>

<Story name="Full workspace" tags={["skip-visual"]}>
  {#snippet template()}
    <CvWorkspaceDemo />
  {/snippet}
</Story>

<Story name="With preview pane" tags={["skip-visual"]}>
  {#snippet template()}
    <CvWorkspaceDemo showPreview />
  {/snippet}
</Story>
