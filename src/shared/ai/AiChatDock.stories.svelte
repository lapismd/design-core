<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AiChatDock from "./AiChatDock.svelte";
  import type { AiChatPlacement, AiChatVisibility } from "./types.js";

  const { Story } = defineMeta({
    title: "AI/AI Chat Dock",
    component: AiChatDock,
    parameters: {
      docs: {
        description: {
          component:
            "Placement / visibility chrome for the AI rail. Uses shadcn Button for expand/pop-out controls. Sets `data-ai-sidebar` on the nearest sidebar provider when docked right.",
        },
      },
      layout: "fullscreen",
    },
  });
</script>

<script lang="ts">
  let visibility = $state<AiChatVisibility>("collapsed");
  let placement = $state<AiChatPlacement>("right");
</script>

<Story
  name="Collapsed right rail"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand AI sidebar" }),
    );
    await expect(canvas.getByText("Expanded panel")).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      data-slot="sidebar-provider"
      data-ui-component="ai-story-host"
      data-ui-part="dock-host"
    >
      <AiChatDock
        {placement}
        {visibility}
        label="AI chat"
        onExpand={() => {
          visibility = "expanded";
        }}
        onPopOut={() => {
          placement = "floating";
          visibility = "expanded";
        }}
      >
        <div data-ui-part="panel-stub">Expanded panel</div>
      </AiChatDock>
    </div>
  {/snippet}
</Story>

<Story name="Expanded right rail" tags={["skip-visual"]}>
  {#snippet template()}
    <div
      data-slot="sidebar-provider"
      data-ui-component="ai-story-host"
      data-ui-part="dock-host"
    >
      <AiChatDock
        placement="right"
        visibility="expanded"
        label="AI chat"
        onExpand={() => {}}
      >
        <div data-ui-part="panel-stub">Dock children render here</div>
      </AiChatDock>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="ai-story-host"][data-ui-part="dock-host"]) {
    position: relative;
    height: 100vh;
    min-height: 24rem;
    overflow: hidden;
    background: var(--sidebar);
  }

  :global([data-ui-component="ai-story-host"] [data-ui-part="panel-stub"]) {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    border-left: 1px solid var(--border);
    background: var(--background);
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
</style>
