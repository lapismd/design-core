<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { EmojiPicker, DEFAULT_EMOJIS } from "./index.js";

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
    await waitFor(() =>
      expect(
        popover.queryByRole("textbox", { name: "Search emoji" }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Add reaction" }),
      ).toHaveFocus(),
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/experimental/emoji-picker/searches-and-selects-an-emoji-chromium.png",
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
    <div data-story="emoji-frame">
      <EmojiPicker
        emojis={DEFAULT_EMOJIS}
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
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(second).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(
        popover.queryByRole("textbox", { name: "Search emoji" }),
      ).toBeNull();
      expect(
        canvas.getByRole("button", { name: "Pick an emoji" }),
      ).toHaveFocus();
    });
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/experimental/emoji-picker/navigates-the-emoji-grid-chromium.png",
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
    <EmojiPicker emojis={DEFAULT_EMOJIS} onSelect={() => {}} />
  {/snippet}
</Story>

<Story
  name="Preserves grid focus after opening animation frames"
  tags={["!autodocs", "visual-pending"]}
  play={async ({ canvas }) => {
    const queuedFrames = new Map<number, FrameRequestCallback>();
    const requestFrame = window.requestAnimationFrame;
    const cancelFrame = window.cancelAnimationFrame;
    let nextFrame = 0;
    window.requestAnimationFrame = (callback) => {
      const frame = --nextFrame;
      queuedFrames.set(frame, callback);
      return frame;
    };
    window.cancelAnimationFrame = (frame) => {
      if (!queuedFrames.delete(frame)) cancelFrame(frame);
    };
    try {
      await userEvent.click(
        canvas.getByRole("button", { name: "Pick an emoji" }),
      );
      const popover = within(document.body);
      const search = await popover.findByRole("textbox", {
        name: "Search emoji",
      });
      const first = await popover.findByRole("button", {
        name: "React with thumbs up",
      });
      // A user can reach search before scheduled opening frames complete.
      await userEvent.click(search);
      await userEvent.keyboard("{ArrowDown}");
      await expect(first).toHaveFocus();
      const pending = [...queuedFrames.values()];
      queuedFrames.clear();
      for (const callback of pending) callback(performance.now());
      await expect(first).toHaveFocus();
    } finally {
      window.requestAnimationFrame = requestFrame;
      window.cancelAnimationFrame = cancelFrame;
      for (const callback of queuedFrames.values()) requestFrame(callback);
    }
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(
        within(document.body).queryByRole("textbox", { name: "Search emoji" }),
      ).toBeNull();
      expect(
        canvas.getByRole("button", { name: "Pick an emoji" }),
      ).toHaveFocus();
    });
  }}
>
  {#snippet template()}
    <EmojiPicker emojis={DEFAULT_EMOJIS} onSelect={() => {}} />
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
