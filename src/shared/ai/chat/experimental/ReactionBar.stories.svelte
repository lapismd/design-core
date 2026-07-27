<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import ReactionBar, { type Reaction } from "./ReactionBar.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Experimental/Reaction Bar",
    component: ReactionBar,
    parameters: {
      docs: {
        description: {
          component:
            "Experimental independently pressed reaction pills with an optional emoji picker.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let reactions = $state<Reaction[]>([
    {
      emoji: "🎉",
      count: 4,
      selected: true,
      label: "You and three teammates reacted with tada",
    },
    { emoji: "👀", count: 2 },
  ]);
  let result = $state("No change");

  function toggle(emoji: string): void {
    reactions = reactions.map((reaction) =>
      reaction.emoji === emoji
        ? { ...reaction, selected: !reaction.selected }
        : reaction,
    );
    result = `Toggled ${emoji}`;
  }
</script>

<Story
  name="Toggles and adds reactions"
  play={async ({ canvas }) => {
    const eyes = canvas.getByRole("button", { name: "2 reactions with 👀" });
    await expect(eyes).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(eyes);
    await waitFor(() => expect(eyes).toHaveAttribute("aria-pressed", "true"));
    await userEvent.click(canvas.getByRole("button", { name: "Add reaction" }));
    const popover = within(document.body);
    await userEvent.click(
      await popover.findByRole("button", { name: "React with fire" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Added 🔥");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/experimental/reaction-bar/toggles-and-adds-reactions-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="reaction-frame">
      <ReactionBar
        {reactions}
        onToggle={toggle}
        onAdd={(emoji) => {
          result = `Added ${emoji}`;
        }}
      />
      <output>{result}</output>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="reaction-frame"]) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.625rem;
  }

  :global([data-story="reaction-frame"] output) {
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
</style>
