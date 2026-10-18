<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within, waitFor } from "storybook/test";
  import AuthorCard from "./AuthorCard.svelte";
  import Fixture from "./AuthorCard.stories.fixture.svelte";
  import { Basic } from "./AuthorCard.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Data/Author Card",
    component: AuthorCard,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Author details and actions"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "About Alex Morgan, AM",
    });
    await userEvent.click(trigger);
    const card = await within(document.body).findByRole("dialog", {
      name: "About Alex Morgan",
    });
    await expect(
      card.querySelector(
        '.ui-author-card__identity [data-ui-component="avatar"]',
      ),
    ).toHaveStyle({ width: "48px" });
    await expect(
      within(card).getByRole("button", { name: "Activity" }),
    ).toBeDisabled();
    await userEvent.click(
      within(card).getByRole("button", { name: /^Message$/ }),
    );
    await expect(canvas.getByTestId("author-action")).toHaveTextContent(
      "Message Alex Morgan",
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Mention hover card"
  play={async ({ canvas }) => {
    await userEvent.hover(
      canvas.getByRole("button", { name: "About Alex Morgan, AM" }),
    );
    await within(document.body).findByRole("group", {
      name: "About Alex Morgan",
    });
  }}
  >{#snippet template()}<Fixture interaction="hover" mention />{/snippet}</Story
>
