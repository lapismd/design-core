<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { ReactionBar } from "../index.js";
  import Fixture from "./Reactions.stories.fixture.svelte";
  import { Basic } from "./Reactions.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Reactions",
    component: ReactionBar,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Unicode and registered custom emoji"
  play={async ({ canvas }) => {
    const gem = canvas.getByRole("button", {
      name: "2 reactions with Lapis gem",
    });
    await userEvent.click(gem);
    await expect(gem).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent("Toggled lapis");
    await userEvent.click(canvas.getByRole("button", { name: "Add reaction" }));
    await userEvent.click(
      within(document.body).getByRole("button", { name: "Lapis gem" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Added lapis");
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story name="Restricted choices"
  >{#snippet template()}<Fixture restricted />{/snippet}</Story
>
<Story name="No permitted choices"
  >{#snippet template()}<Fixture empty />{/snippet}</Story
>
<Story
  name="Disabled"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "2 reactions with Lapis gem" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Add reaction" }),
    ).toBeDisabled();
  }}>{#snippet template()}<Fixture disabled />{/snippet}</Story
>
