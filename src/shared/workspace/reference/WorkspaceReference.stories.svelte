<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ReusableFrameworkDemo from "../demo/ReusableFrameworkDemo.svelte";
  import { createFrameworkDemo } from "../demo/framework-demo.js";

  const reference = createFrameworkDemo({
    includeFloating: true,
    mobileMode: "never",
  });

  const { Story } = defineMeta({
    title: "Workspace/Reference/Canonical Lapis",
    component: ReusableFrameworkDemo,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Visual Delta bridge between the public-API Workspace demo and immutable Lapis shell captures. Candidate and canonical images retain their independent viewport and device-scale metadata.",
        },
      },
    },
  });
</script>

<Story
  name="Shell"
  exportName="Shell"
  tags={["visual-pending", "lapis-reference-visual"]}
  parameters={{
    docs: {
      description: {
        story:
          "Compare the target candidate with the immutable Lapis shell. The Dark visual mode captures the same story using the global colour-mode toolbar contract.",
      },
    },
    visualDelta: {
      images: [
        {
          src: "/visual-baselines/workspace/reference/shell-chromium-darwin.png",
          viewport: { width: 1280, height: 900 },
          deviceScaleFactor: 3,
          align: "viewport",
          placement: "center",
        },
        {
          src: "/lapis-reference/workspace-shell-light.png",
          viewport: { width: 1440, height: 960 },
          deviceScaleFactor: 1,
          align: "viewport",
          placement: "center",
        },
        {
          src: "/lapis-reference/workspace-shell-dark.png",
          viewport: { width: 1440, height: 960 },
          deviceScaleFactor: 1,
          align: "viewport",
          placement: "center",
          mode: "Dark",
        },
      ],
      modes: {
        Dark: {
          globals: { colorMode: "dark" },
        },
      },
      opacity: 0.5,
      cropToViewport: true,
    },
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={reference.app} />
  {/snippet}
</Story>
