<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import ThreadPanel from "./ThreadPanel.svelte";
  import Fixture from "./ThreadPanel.stories.fixture.svelte";
  import { Basic } from "./ThreadPanel.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Thread Panel",
    component: ThreadPanel,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Nested discussion"
  play={async ({ canvas }) => {
    await expect(canvas.getAllByRole("article")).toHaveLength(4);
    const reply = canvas.getAllByRole("button", {
      name: "Reply to Lee Taylor",
    })[0]!;
    reply.focus();
    await expect(reply).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const input = canvas.getByRole("textbox", { name: /^Reply$/ });
    await expect(input).toHaveFocus();
    await userEvent.keyboard(
      "Keep this exact reply.{Control>}{Enter}{/Control}",
    );
    await waitFor(() =>
      expect(canvas.getByTestId("thread-result")).toHaveTextContent(
        "reply-1: Keep this exact reply.",
      ),
    );
    await expect(
      canvas.getByText("Keep this exact reply.", { exact: true }),
    ).toBeVisible();
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Rejected submission retains draft"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: /^Reply$/ });
    await userEvent.click(input);
    await userEvent.keyboard("Retain this draft{Control>}{Enter}{/Control}");
    await waitFor(() =>
      expect(
        canvas.getByText("Host rejected the reply; draft retained."),
      ).toBeVisible(),
    );
    await expect(input).toHaveTextContent("Retain this draft");
  }}>{#snippet template()}<Fixture reject />{/snippet}</Story
>
<Story name="Narrow discussion"
  >{#snippet template()}<Fixture narrow />{/snippet}</Story
>
<Story name="Read only"
  >{#snippet template()}<Fixture readOnly />{/snippet}</Story
>
