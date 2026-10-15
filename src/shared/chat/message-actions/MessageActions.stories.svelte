<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import MessageActions from "./MessageActions.svelte";
  import Fixture from "./MessageActions.stories.fixture.svelte";
  import * as sources from "./MessageActions.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Message Actions",
    component: MessageActions,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: sources.Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Message actions and menu"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Reply" }));
    await expect(canvas.getByTestId("message-action-result")).toHaveTextContent(
      "Reply requested",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "More message actions" }),
    );
    const body = within(document.body);
    await expect(
      body.getByRole("menuitem", { name: /Edit message/ }),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      body.getByText("Only the author can edit this message"),
    ).toBeVisible();
    await expect(body.queryByText("Hidden host action")).toBeNull();
    await userEvent.click(body.getByRole("menuitem", { name: "Copy message" }));
    await expect(canvas.getByTestId("message-action-result")).toHaveTextContent(
      "Copy requested",
    );
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story name="Hover and keyboard focus"
  >{#snippet template()}<Fixture scenario="hover" />{/snippet}</Story
>
<Story
  name="Restricted reactions"
  parameters={{
    docs: {
      source: { code: sources.Reactions, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add reaction" }));
    await userEvent.click(
      within(document.body).getByRole("button", { name: "React with fire" }),
    );
    await expect(canvas.getByTestId("message-action-result")).toHaveTextContent(
      "Reaction: 🔥",
    );
  }}>{#snippet template()}<Fixture scenario="restricted" />{/snippet}</Story
>
<Story
  name="Empty restricted choices"
  parameters={{
    docs: {
      source: { code: sources.Reactions, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add reaction" }));
    const body = within(document.body);
    await expect(body.getByText(/No emoji match/)).toBeVisible();
    await expect(body.queryByRole("button", { name: "Lapis gem" })).toBeNull();
  }}>{#snippet template()}<Fixture scenario="empty" />{/snippet}</Story
>
<Story
  name="Disabled actions"
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Reply" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reply" }));
    await expect(canvas.getByTestId("message-action-result")).toHaveTextContent(
      "No action yet",
    );
    await expect(
      canvas.getByRole("button", { name: "Add reaction" }),
    ).toBeDisabled();
  }}>{#snippet template()}<Fixture scenario="disabled" />{/snippet}</Story
>
