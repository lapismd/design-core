<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { AvatarPicker } from "./index.js";
  import TransparentFixture from "./AvatarPicker.transparent.fixture.svelte";
  import StylesFixture from "./AvatarPicker.styles.fixture.svelte";
  import { emojiLibrary } from "../../shadcn/emoji-picker/emoji-picker.stories.helpers.js";
  import { avatarDataUrl } from "./avatar-image.js";
  import Fixture from "./AvatarPicker.stories.fixture.svelte";
  import * as sources from "./AvatarPicker.example-sources.js";
  const { Story } = defineMeta({
    title: "UI Forms/Avatar Picker",
    component: AvatarPicker,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: sources.Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Styles and sizes"
  parameters={{
    docs: { source: { code: sources.Styles, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}<StylesFixture />{/snippet}
</Story>
<Story
  name="Initials trigger label"
  parameters={{
    docs: {
      source: { code: sources.InitialsLabel, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: /^Edit agent avatar: /,
    });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveTextContent("SA");
    await expect(
      trigger.querySelector('[data-ui-component="avatar"]'),
    ).toHaveAttribute("role", "img");
    await expect(
      trigger.querySelector('[data-ui-component="avatar"]'),
    ).toHaveAttribute("aria-hidden", "true");
  }}
>
  {#snippet template()}
    <div style="padding:2rem">
      <AvatarPicker
        name="Saved Agent"
        label="Edit agent avatar"
        background="#6e56cf"
      />
    </div>
  {/snippet}
</Story>
<Story
  name="Inline editor"
  parameters={{
    docs: { source: { code: sources.Inline, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <div style="max-width:26rem;padding:1rem">
      <AvatarPicker
        presentation="inline"
        open
        value={avatarDataUrl("🤩", "#c65df5")}
        name="Alex Morgan"
        size="2xl"
        shape="rounded"
        background="#c65df5"
      />
    </div>
  {/snippet}
</Story>
<Story
  name="Popover editor"
  parameters={{
    docs: { source: { code: sources.Basic, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}
    <div style="padding:2rem;min-height:20rem">
      <AvatarPicker
        value={avatarDataUrl("🤩", "#c65df5")}
        name="Alex Morgan"
        size="2xl"
        shape="rounded"
        background="#c65df5"
        mode="emoji"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Choose image or emoji"
  exportName="ChooseImageEmojiOrInitials"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /^Choose avatar: / }),
    );
    const body = within(document.body);
    await userEvent.click(body.getByRole("tab", { name: /^Emoji$/ }));
    const library = await emojiLibrary();
    await userEvent.click(
      (
        await within(library).findAllByRole(
          "button",
          { name: /^😀$/ },
          { timeout: 5000 },
        )
      )[0]!,
    );
    await expect(canvas.getByTestId("avatar-value")).toHaveTextContent(
      "data:image/svg+xml",
    );
    await expect(
      canvas
        .getByRole("button", { name: /^Choose avatar: / })
        .querySelector('[data-ui-component="avatar"]'),
    ).toHaveAttribute("data-shape", "rounded");
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Host upload lifecycle"
  parameters={{
    docs: { source: { code: sources.Upload, language: "tsx", type: "code" } },
  }}>{#snippet template()}<Fixture upload="controlled" />{/snippet}</Story
>
<Story name="Disabled"
  >{#snippet template()}<Fixture disabled />{/snippet}</Story
>

<Story
  name="Transparent image backgrounds"
  parameters={{
    docs: {
      source: { code: sources.TransparentImage, language: "tsx", type: "code" },
    },
  }}
>
  {#snippet template()}<TransparentFixture />{/snippet}
</Story>
