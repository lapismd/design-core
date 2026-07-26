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

  :global([data-story="scroll-button-frame"] output) {
    align-self: end;
    padding: 0.75rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
</style>
