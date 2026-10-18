<script module lang="ts">
  import SuggestionsFixture from "./Suggestions.stories.fixture.svelte";
  import { Basic as SuggestionsSource } from "./Suggestions.example-sources.js";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import MarkdownComposer from "./MarkdownComposer.svelte";
  import Fixture from "./MarkdownComposer.stories.fixture.svelte";
  import * as sources from "./MarkdownComposer.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Markdown Composer",
    component: MarkdownComposer,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: sources.Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Formatting and retained drafts"
  play={async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole("textbox", { name: "Message" })).toBeVisible(),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Select first word" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: /^Bold$/ }));
    await expect(canvas.getByTestId("draft-value")).toHaveTextContent(
      "**Draft** a **shared** message.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(canvas.getByTestId("submitted-value")).toHaveTextContent(
      "**Draft** a **shared** message.",
    );
    await expect(canvas.getByTestId("draft-value")).toHaveTextContent(
      "**Draft** a **shared** message.",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Simulate failed delivery" }),
    );
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Your draft is retained",
    );
    await expect(canvas.getByTestId("draft-value")).toHaveTextContent(
      "**Draft**",
    );
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Document reply"
  parameters={{
    docs: { source: { code: sources.Document, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const preview = canvas.getByRole("group", { name: "Replying to Sam" });
    await expect(preview).toHaveTextContent(
      "Please share the project update before Friday.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Cancel reply" }));
    await expect(preview).not.toBeInTheDocument();
    await expect(canvas.getByTestId("draft-value")).toHaveTextContent(
      "Draft a **shared** message.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reply to Sam" }));
    await expect(
      canvas.getByRole("group", { name: "Replying to Sam" }),
    ).toBeVisible();
  }}>{#snippet template()}<Fixture scenario="document" />{/snippet}</Story
>
<Story
  name="Custom emoji"
  parameters={{
    docs: { source: { code: sources.Custom, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add emoji" }));
    await userEvent.click(
      within(document.body).getByRole("button", { name: "Lapis gem" }),
    );
    await expect(canvas.getByTestId("draft-value")).toHaveTextContent(
      ":lapis:",
    );
  }}>{#snippet template()}<Fixture scenario="custom" />{/snippet}</Story
>
<Story name="Narrow composer"
  >{#snippet template()}<Fixture scenario="narrow" />{/snippet}</Story
>
<Story
  name="Disabled"
  play={async ({ canvas }) => {
    const editor = canvas.getByRole("textbox", { name: "Message" });
    await expect(
      getComputedStyle(
        editor.closest('[data-ui-component="ai-chat-composer"]')!,
      ).opacity,
    ).toBe("1");
    await expect(
      canvas.getByRole("button", { name: "Send message" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Add emoji" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Cancel reply" }),
    ).toBeDisabled();
  }}>{#snippet template()}<Fixture scenario="disabled" />{/snippet}</Story
>
<Story
  name="Busy and stoppable"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Stop response" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Response stopped",
    );
    await expect(
      canvas.getByRole("button", { name: "Send message" }),
    ).toBeEnabled();
  }}>{#snippet template()}<Fixture scenario="busy" />{/snippet}</Story
>
<Story
  name="Host form"
  parameters={{
    docs: { source: { code: sources.Form, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Submit host form" }),
    );
    await expect(canvas.getByTestId("form-value")).toHaveTextContent(
      "Draft a **shared** message.",
    );
  }}>{#snippet template()}<Fixture scenario="form" />{/snippet}</Story
>

<Story
  name="Mention and command suggestions"
  parameters={{
    docs: {
      source: { code: SuggestionsSource, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: /^Message$/ });
    await userEvent.click(input);
    await userEvent.keyboard("@al");
    await waitFor(() =>
      expect(document.querySelector('[role="option"]')).not.toBeNull(),
    );
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(canvas.getByTestId("suggestion-value")).toHaveTextContent(
        "@Alex Morgan",
      ),
    );
    await expect(canvas.getByTestId("suggestion-sent")).toHaveTextContent("");
  }}>{#snippet template()}<SuggestionsFixture />{/snippet}</Story
>
<Story
  name="Asynchronous suggestion replacement"
  parameters={{
    docs: {
      source: { code: SuggestionsSource, language: "tsx", type: "code" },
    },
  }}>{#snippet template()}<SuggestionsFixture slow />{/snippet}</Story
>
