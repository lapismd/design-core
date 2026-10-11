<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FixedDemo from "./column-canvas-fixed-demo.svelte";
  import { HoverPreviews } from "./ColumnCanvasPreview.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Layout/Column Canvas",
    component: FixedDemo,
    tags: ["visual-pending"],
    parameters: {
      a11y: { test: "error" },
      docs: { source: { code: HoverPreviews, language: "tsx", type: "code" } },
    },
  });
</script>

<Story name="Sticky rail hover previews" args={{ stickyOnly: true }} />
<Story
  name="Configurable hover previews"
  args={{ previewDelay: 80, previewDismissDelay: 80 }}
/>
<Story name="Hover previews disabled" args={{ previewOnHover: false }} />
<Story
  name="External sticky hover previews"
  args={{ external: true, stickyOnly: true }}
/>
