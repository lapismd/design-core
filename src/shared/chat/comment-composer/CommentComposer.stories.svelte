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

<script lang="ts">
  let bareValue = $state("Review this capture.");
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

<Story
  name="Inside an existing card"
  parameters={{
    docs: { source: { code: sources.Bare, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Comment" }),
    ).toHaveTextContent("Review this capture.");
    const card = canvasElement.querySelector(".ui-comment-composer__card")!;
    await expect(getComputedStyle(card).padding).toBe("0px");
    await expect(getComputedStyle(card).borderWidth).toBe("0px");
  }}
  >{#snippet template()}<div
      style="padding: .5rem; border: 1px solid var(--border); border-radius: var(--radius)"
    >
      <CommentComposer presentation="bare" bind:value={bareValue} />
    </div>{/snippet}</Story
>

<Story
  name="Inline formatting toggle"
  play={async ({ canvas }) => {
    const editor = canvas.getByRole("textbox", { name: "Comment" });
    const toggle = canvas.getByRole("button", {
      name: "Comment formatting options",
    });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(editor);
    await userEvent.keyboard("{Home}{Shift>}{End}{/Shift}");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    const toolbar = canvas.getByRole("group", { name: "Comment formatting" });
    await expect(toolbar.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      editor.getBoundingClientRect().bottom,
    );
    await userEvent.click(canvas.getByRole("button", { name: /^Bold$/ }));
    await expect(canvas.getByTestId("comment-draft")).toHaveTextContent(
      "**show me contents of this file**",
    );
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(
      canvas.queryByRole("group", { name: "Comment formatting" }),
    ).not.toBeInTheDocument();
    await expect(editor).toHaveTextContent("**show me contents of this file**");
  }}>{#snippet template()}<Fixture scenario="inline" />{/snippet}</Story
>
