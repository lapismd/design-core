<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AiChatPanelSettings from "./AiChatPanelSettings.svelte";
  import type { AiChatPlacement, AiChatVisibility } from "./types.js";

  const { Story } = defineMeta({
    title: "AI/AI Chat Panel Settings",
    component: AiChatPanelSettings,
    parameters: {
      docs: {
        description: {
          component:
            "Placement / collapse controls using shadcn Button. Bind `placement` and `visibility`.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let placement = $state<AiChatPlacement>("right");
  let visibility = $state<AiChatVisibility>("expanded");
</script>

<Story
  name="Toggles placement"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Float AI chat" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("floating");
  }}
>
  {#snippet template()}
    <div data-ui-component="ai-story-host" data-ui-part="settings">
      <AiChatPanelSettings
        bind:placement
        bind:visibility
        onCollapse={() => {
          visibility = "collapsed";
        }}
      />
      <output>{placement} · {visibility}</output>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="ai-story-host"][data-ui-part="settings"]) {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }

  :global([data-ui-component="ai-story-host"][data-ui-part="settings"] output) {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
</style>
