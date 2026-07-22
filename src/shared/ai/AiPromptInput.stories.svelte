<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AiPromptInput from "./AiPromptInput.svelte";

  const { Story } = defineMeta({
    title: "AI/AI Prompt Input",
    component: AiPromptInput,
    parameters: {
      docs: {
        description: {
          component:
            "Composer built on shadcn Textarea + Button. Calls `onSend` with the trimmed text; no fetch.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let lastSent = $state("");
  let draft = $state("");
</script>

<Story
  name="Sends a message"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const box = canvas.getByPlaceholderText("Ask the assistant…");
    await userEvent.type(box, "Shorten the summary");
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Shorten the summary",
    );
  }}
>
  {#snippet template()}
    <div data-ui-component="ai-story-host" data-ui-part="prompt">
      <AiPromptInput
        bind:value={draft}
        onSend={(text) => {
          lastSent = text;
        }}
      />
      <output>{lastSent || "Nothing sent"}</output>
    </div>
  {/snippet}
</Story>

<Story name="Disabled" tags={["skip-visual"]}>
  {#snippet template()}
    <div data-ui-component="ai-story-host" data-ui-part="prompt">
      <AiPromptInput disabled value="Streaming…" />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="ai-story-host"][data-ui-part="prompt"]) {
    display: flex;
    max-width: 24rem;
    flex-direction: column;
    gap: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--background);
    padding: 0.5rem;
  }

  :global([data-ui-component="ai-story-host"][data-ui-part="prompt"] output) {
    padding-inline: 0.5rem;
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
</style>
