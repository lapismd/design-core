<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fn, userEvent, waitFor, within } from "storybook/test";
  import ReactionBar, { type Reaction } from "./ReactionBar.svelte";
  import { DEFAULT_EMOJIS } from "../emoji-picker/index.js";
  import {
    CustomLabel,
    TextualFallback,
  } from "./ReactionBar.example-sources.js";

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
        "/visual-baselines/ai/experimental/reaction-bar/toggles-and-adds-reactions-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div data-story="reaction-frame">
      <ReactionBar
        emojis={DEFAULT_EMOJIS}
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

<Story
  name="Custom labels keep visible text reactions and counts"
  args={{
    reactions: [
      { emoji: "lapis", count: 1, label: "1 reaction with lapis: Maya Chen" },
    ],
    onToggle: fn(),
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: CustomLabel,
        language: "tsx",
        type: "code",
      },
    },
  }}
  play={async ({ canvas, args }) => {
    const reaction = canvas.getByRole("button", {
      name: /^1 reaction with lapis: Maya Chen:/,
    });
    await expect(reaction).toHaveTextContent(/lapis\s*1/);
    await expect(reaction).toHaveAccessibleName(
      "1 reaction with lapis: Maya Chen: lapis 1",
    );
    await expect(reaction).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(reaction);
    await expect(args.onToggle).toHaveBeenCalledWith("lapis");
  }}
/>

<Story
  name="Default labels keep visible text reactions and counts"
  args={{
    reactions: [
      { emoji: "ship_it", count: 2 },
      { emoji: "👀", count: 3 },
    ],
    onToggle: fn(),
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: TextualFallback,
        language: "tsx",
        type: "code",
      },
    },
  }}
  play={async ({ canvas, args }) => {
    const fallback = canvas.getByRole("button", {
      name: /^2 reactions with ship_it/,
    });
    await expect(fallback).toHaveAccessibleName(
      "2 reactions with ship_it: ship_it 2",
    );
    await expect(
      canvas.getByRole("button", { name: "3 reactions with 👀" }),
    ).toBeVisible();
    await userEvent.click(fallback);
    await expect(args.onToggle).toHaveBeenCalledWith("ship_it");
  }}
/>

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
