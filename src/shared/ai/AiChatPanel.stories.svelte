<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AiChatPanel from "./AiChatPanel.svelte";
  import { sampleAiMessages } from "./fixtures.js";
  import type { AiChatMessage, AiChatPlacement, AiChatVisibility } from "./types.js";

  const { Story } = defineMeta({
    title: "AI/AI Chat Panel",
    component: AiChatPanel,
    parameters: {
      docs: {
        description: {
          component:
            "Presentational AI chat panel: composes Dock + Transcript + Prompt + Settings on shadcn Button, Textarea, and ScrollArea. Prop-driven — no `/api/ai` or Studio store.",
        },
      },
      layout: "fullscreen",
    },
  });
</script>

<script lang="ts">
  let messages = $state<AiChatMessage[]>([...sampleAiMessages]);
  let visibility = $state<AiChatVisibility>("expanded");
  let placement = $state<AiChatPlacement>("right");

  function handleSend(text: string) {
    messages = [
      ...messages,
      { id: `u-${Date.now()}`, role: "user", text },
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: "Stub reply — wire networking in the consuming app.",
      },
    ];
  }
</script>

<Story
  name="Interactive panel"
  exportName="InteractivePanel"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const box = canvas.getByPlaceholderText("Ask the assistant…");
    await userEvent.type(box, "Reorder experience");
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(canvas.getByText("Reorder experience")).toBeVisible();
  }}
>
  {#snippet template()}
    <div data-slot="sidebar-provider" data-ui-component="ai-story-host" data-ui-part="panel-host">
      <div data-ui-part="main-stub">Main workspace</div>
      <AiChatPanel
        {messages}
        bind:visibility
        bind:placement
        label="AI chat"
        onSend={handleSend}
      />
    </div>
  {/snippet}
</Story>

<Story name="Collapsed" exportName="Collapsed" tags={["skip-visual"]}>
  {#snippet template()}
    <div data-slot="sidebar-provider" data-ui-component="ai-story-host" data-ui-part="panel-host">
      <div data-ui-part="main-stub">Main workspace</div>
      <AiChatPanel
        messages={sampleAiMessages}
        visibility="collapsed"
        placement="right"
        label="AI chat"
      />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="ai-story-host"][data-ui-part="panel-host"]) {
    --ui-workspace-ai-width-expanded: 20rem;
    --ui-workspace-ai-width-collapsed: 3rem;
    --ai-sidebar-inline-size: 20rem;
    position: relative;
    display: flex;
    height: 100vh;
    min-height: 28rem;
    overflow: hidden;
    background: var(--sidebar);
    padding-right: var(--ai-sidebar-inline-size);
  }

  :global([data-ui-component="ai-story-host"][data-ui-part="panel-host"] [data-ui-part="main-stub"]) {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    margin: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--background);
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
</style>
