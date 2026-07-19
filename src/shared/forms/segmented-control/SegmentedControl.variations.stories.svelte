<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SegmentedControl from "./SegmentedControl.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Segmented Control",
    component: SegmentedControl,
    parameters: {
      docs: {
        description: {
          component: "Visual variations for Docs.",
        },
      },
    },
  });
</script>


<Story
  name="Two options"
  exportName="TwoOptions"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Common edit/preview pair." },
    },
  }}
>
  {#snippet template()}
    <SegmentedControl
      value="edit"
      options={["edit", "preview"]}
      labels={{ edit: "Edit", preview: "Preview" }}
      ariaLabel="View mode"
    />
  {/snippet}
</Story>

<Story
  name="Three options"
  exportName="ThreeOptions"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Maximum recommended option count." },
    },
  }}
>
  {#snippet template()}
    <SegmentedControl
      value="auto"
      options={["auto", "manual", "off"]}
      labels={{ auto: "Auto", manual: "Manual", off: "Off" }}
      ariaLabel="Sync"
    />
  {/snippet}
</Story>
