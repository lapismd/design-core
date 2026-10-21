<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Spoiler from "./Spoiler.svelte";
  import { Basic } from "./Spoiler.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Content/Spoiler",
    component: Spoiler,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Reveal and conceal"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Reveal spoiler" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveAttribute("aria-pressed", "true");
    await expect(trigger).toHaveAccessibleName("forty-two");
    await expect(canvas.getByText("forty-two")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    await userEvent.keyboard(" ");
    await expect(trigger).toHaveAttribute("aria-pressed", "false");
  }}
  >{#snippet template()}<p>
      The answer is <Spoiler label="the answer">forty-two</Spoiler>.
    </p>{/snippet}</Story
>
<Story name="Disabled concealment"
  >{#snippet template()}<Spoiler disabled>Hidden detail</Spoiler
    >{/snippet}</Story
>
