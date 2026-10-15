<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import CommentComposer from "./CommentComposer.svelte";
  import Fixture from "./CommentComposer.stories.fixture.svelte";
  import * as sources from "./CommentComposer.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Comment Composer",
    component: CommentComposer,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: sources.Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Code selection reply"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Comment on .gitignore" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Go to source: .gitignore" }),
    );
    await expect(canvas.getByTestId("comment-result")).toHaveTextContent(
      "Source requested: .gitignore",
    );
    await expect(canvas.getByTestId("comment-draft")).toHaveTextContent(
      "show me contents of this file",
    );
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story name="Markdown selection"
  >{#snippet template()}<Fixture scenario="markdown" />{/snippet}</Story
>
<Story
  name="Inline comment"
  parameters={{
    docs: { source: { code: sources.Inline, language: "tsx", type: "code" } },
  }}>{#snippet template()}<Fixture scenario="inline" />{/snippet}</Story
>
<Story name="Narrow comment"
  >{#snippet template()}<Fixture scenario="narrow" />{/snippet}</Story
>
<Story
  name="Disabled"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Comment on .gitignore" }),
    ).toHaveAttribute("contenteditable", "false");
    await expect(
      canvas.getByRole("button", { name: "Remove comment" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Go to source: .gitignore" }),
    ).toBeDisabled();
  }}>{#snippet template()}<Fixture scenario="disabled" />{/snippet}</Story
>
<Story
  name="Pending submission"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", { name: "Comment composer" }),
    ).toHaveAttribute("aria-busy", "true");
    await expect(
      canvas.getByRole("textbox", { name: "Comment on .gitignore" }),
    ).toHaveAttribute("contenteditable", "false");
  }}>{#snippet template()}<Fixture scenario="pending" />{/snippet}</Story
>
<Story
  name="Unavailable source"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("Original content unavailable or changed."),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Go to source: .gitignore" }),
    ).toBeDisabled();
  }}>{#snippet template()}<Fixture scenario="unavailable" />{/snippet}</Story
>
