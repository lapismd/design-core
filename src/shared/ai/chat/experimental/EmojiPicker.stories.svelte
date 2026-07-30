<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import EmojiPicker from "./EmojiPicker.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Experimental/Emoji Picker",
    component: EmojiPicker,
    parameters: {
      docs: {
        description: {
          component:
            "Experimental searchable emoji popover with eight-column keyboard navigation.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let selected = $state("No emoji selected");
</script>

<Story
  name="Searches and selects an emoji"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add reaction" }));
    const popover = within(document.body);
    const search = await popover.findByRole("textbox", {
      name: "Search emoji",
    });
    await userEvent.type(search, "fire");
    const fire = await popover.findByRole("button", {
      name: "React with fire",
    });
    fire.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("Selected 🔥"),
    );
    await expect(
      canvas.queryByRole("textbox", { name: "Search emoji" }),
    ).not.toBeInTheDocument();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/experimental/emoji-picker/searches-and-selects-an-emoji-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="emoji-frame">
      <EmojiPicker
        triggerLabel="Add reaction"
        onSelect={(emoji) => {
          selected = `Selected ${emoji}`;
        }}
      />
      <output>{selected}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Navigates the emoji grid"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Pick an emoji" }),
    );
    const popover = within(document.body);
    const first = await popover.findByRole("button", {
      name: "React with thumbs up",
    });
    const second = popover.getByRole("button", { name: "React with heart" });
    await waitFor(() =>
      expect(
        popover.getByRole("textbox", { name: "Search emoji" }),
      ).toHaveFocus(),
    );
    await userEvent.tab();
    await expect(first).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(second).toHaveFocus();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/experimental/emoji-picker/navigates-the-emoji-grid-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <EmojiPicker onSelect={() => {}} />
  {/snippet}
</Story>

<style>
  :global([data-story="emoji-frame"]) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  :global([data-story="emoji-frame"] output) {
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
</style>
