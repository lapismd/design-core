<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import LayoutScrollButton from "./LayoutScrollButton.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Layout Scroll Button",
    component: LayoutScrollButton,
    parameters: {
      docs: {
        description: {
          component:
            "Recovery control shown when a conversation is scrolled away from the latest message.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let recovered = $state(false);
</script>

<Story name="States">
  {#snippet template()}
    <div data-story="scroll-button-stack">
      <div data-story="scroll-button-state">
        <span>Hidden (user is at bottom)</span>
        <LayoutScrollButton isVisible={false} onClick={() => {}} />
      </div>
      <div data-story="scroll-button-state">
        <span>Visible (user scrolled up)</span>
        <LayoutScrollButton isVisible onClick={() => {}} />
      </div>
      <div data-story="scroll-button-state">
        <span>Expanded with label (new messages arrived)</span>
        <LayoutScrollButton isVisible label="New messages" onClick={() => {}} />
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Labels">
  {#snippet template()}
    <div data-story="scroll-button-stack">
      <p>Labels expand the button to give context</p>
      <div data-story="scroll-button-state">
        <LayoutScrollButton isVisible onClick={() => {}} />
      </div>
      <div data-story="scroll-button-state">
        <LayoutScrollButton isVisible label="New messages" onClick={() => {}} />
      </div>
      <div data-story="scroll-button-state">
        <LayoutScrollButton
          isVisible
          label="3 unread replies"
          onClick={() => {}}
        />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Recovers new messages"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New messages" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Recovered");
  }}
>
  {#snippet template()}
    <div data-story="scroll-button-frame">
      <LayoutScrollButton
        isVisible
        hasNewMessages
        onClick={() => {
          recovered = true;
        }}
      />
      <output>{recovered ? "Recovered" : "Waiting"}</output>
    </div>
  {/snippet}
</Story>

<Story name="Hidden">
  {#snippet template()}
    <div data-story="scroll-button-frame">
      <LayoutScrollButton isVisible={false} onClick={() => {}} />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="scroll-button-frame"]) {
    position: relative;
    display: grid;
    width: 20rem;
    min-height: 8rem;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
  }

  :global([data-story="scroll-button-stack"]) {
    display: flex;
    width: min(24rem, 90vw);
    flex-direction: column;
    gap: 1rem;
  }

  :global([data-story="scroll-button-stack"] p),
  :global([data-story="scroll-button-state"] > span) {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  :global([data-story="scroll-button-state"]) {
    position: relative;
    display: flex;
    min-height: 3rem;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  :global(
      [data-story="scroll-button-state"]
        [data-ui-component="ai-chat-layout-scroll-button"]
    ) {
    position: relative;
    right: auto;
    bottom: auto;
    translate: 0;
  }

  :global([data-story="scroll-button-frame"] output) {
    align-self: end;
    padding: 0.75rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
</style>
