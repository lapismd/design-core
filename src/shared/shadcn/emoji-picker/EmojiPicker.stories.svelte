<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { EmojiPicker, DEFAULT_EMOJIS } from "./index.js";
  import * as sources from "./EmojiPicker.example-sources.js";
  import { emojiLibrary } from "./emoji-picker.stories.helpers.js";
  import ControlledPicker from "./ControlledPicker.stories.fixture.svelte";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Emoji Picker",
    component: EmojiPicker,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: sources.Full, language: "tsx", type: "code" } },
    },
  });
  const customEmojis = [
    {
      id: "team:lapis",
      shortcode: "lapis",
      label: "Lapis gem",
      url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%235568e8' d='M8 4h16l6 10-14 16L2 14z'/%3E%3C/svg%3E",
    },
  ];
</script>

<script lang="ts">
  let selected = $state("No emoji selected");
</script>

<Story
  name="Full picker"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Browse emoji" }));
    const library = await emojiLibrary();
    await userEvent.click(
      (
        await within(library).findAllByRole(
          "button",
          { name: "😀" },
          { timeout: 5000 },
        )
      )[0]!,
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Selected 😀");
    await userEvent.click(canvas.getByRole("button", { name: "Browse emoji" }));
    await emojiLibrary();
  }}
>
  {#snippet template()}
    <EmojiPicker
      triggerLabel="Browse emoji"
      onSelect={(emoji) => (selected = `Selected ${emoji}`)}
    />
    <output>{selected}</output>
  {/snippet}
</Story>

<Story
  name="Controlled lifetime"
  parameters={{
    docs: {
      source: { code: sources.Controlled, language: "tsx", type: "code" },
    },
  }}
>
  {#snippet template()}
    <ControlledPicker />
  {/snippet}
</Story>

<Story
  name="Custom emoji and suggestions"
  parameters={{
    docs: { source: { code: sources.Custom, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add reaction" }));
    await userEvent.click(
      within(document.body).getByRole("button", { name: "Lapis gem" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "lapis (team:lapis)",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Add reaction" }));
    await emojiLibrary();
  }}
>
  {#snippet template()}
    <EmojiPicker
      triggerLabel="Add reaction"
      presets={["👍", "❤️", "🎉"]}
      {customEmojis}
      onSelect={(emoji, custom) =>
        (selected = `${emoji}${custom ? ` (${custom.id})` : ""}`)}
    />
    <output>{selected}</output>
  {/snippet}
</Story>

<Story
  name="Restricted reactions"
  parameters={{
    docs: {
      source: { code: sources.Restricted, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Pick an emoji" }),
    );
    const body = within(document.body);
    const search = body.getByRole("textbox", { name: "Search emoji" });
    await userEvent.type(search, "{ArrowDown}");
    await expect(
      body.getByRole("button", { name: "React with thumbs up" }),
    ).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent("❤️");
  }}
>
  {#snippet template()}
    <EmojiPicker
      emojis={DEFAULT_EMOJIS}
      onSelect={(emoji) => (selected = emoji)}
    />
    <output>{selected}</output>
  {/snippet}
</Story>

<Story
  name="Suggested reactions only"
  parameters={{
    docs: { source: { code: sources.Presets, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Pick an emoji" }),
    );
    await expect(document.querySelector("em-emoji-picker")).toBeNull();
    await userEvent.click(
      within(document.body).getByRole("button", { name: "React 👍" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("👍");
  }}
>
  {#snippet template()}
    <EmojiPicker
      presetsOnly
      presets={["👍", "👎"]}
      onSelect={(emoji) => (selected = emoji)}
    />
    <output>{selected}</output>
  {/snippet}
</Story>

<Story
  name="Dark picker"
  args={{ open: true, theme: "dark", onSelect: () => {} }}
  parameters={{
    docs: { source: { code: sources.Dark, language: "tsx", type: "code" } },
  }}
  play={async () => {
    await emojiLibrary();
  }}
/>

<Story
  name="Disabled"
  args={{ disabled: true, onSelect: () => {} }}
  parameters={{
    docs: { source: { code: sources.Disabled, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Pick an emoji" }),
    ).toBeDisabled();
  }}
/>

<Story
  name="Empty restricted list"
  args={{ emojis: [], open: true, onSelect: () => {} }}
  parameters={{
    docs: { source: { code: sources.Empty, language: "tsx", type: "code" } },
  }}
  play={async () => {
    await expect(within(document.body).getByRole("status")).toHaveTextContent(
      "No emoji match",
    );
    await expect(document.querySelector("em-emoji-picker")).toBeNull();
  }}
/>

<Story
  name="Inline panel"
  parameters={{
    docs: { source: { code: sources.Inline, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}<div style="max-width:26rem">
      <EmojiPicker
        presentation="inline"
        {customEmojis}
        onSelect={(emoji) => (selected = emoji)}
      /><output>{selected}</output>
    </div>{/snippet}
</Story>
