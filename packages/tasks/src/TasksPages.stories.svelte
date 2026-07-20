<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { InboxPage } from "./pages/inbox/index.js";

  const { Story } = defineMeta({
    title: "Tasks/Pages",
    component: InboxPage,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Legacy aggregate entry. Prefer colocated Tasks/Pages/<Page> stories.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { referenceVisualDelta } from "./lib/story-data.js";
</script>

<Story
  name="See colocated page stories"
  exportName="SeeColocatedPageStories"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Inbox")).toBeVisible();
  }}
>
  {#snippet template()}
    <InboxPage />
  {/snippet}
</Story>
