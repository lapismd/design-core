<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
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
    const bold = canvas.getByRole("button", { name: /^Bold$/ });
    expect(
      Math.abs(
        bold.querySelector("svg")!.getBoundingClientRect().left -
          editor.getBoundingClientRect().left,
      ),
    ).toBeLessThanOrEqual(1);
    await userEvent.click(bold);
    await expect(canvas.getByTestId("comment-draft")).toHaveTextContent(
      "**show me contents of this file**",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Add emoji to comment" }),
    );
    await userEvent.click(
      within(document.body).getByRole("button", {
        name: "React with celebration",
      }),
    );
    await expect(canvas.getByTestId("comment-draft")).toHaveTextContent("🎉");
    const retainedEmojiDraft = canvas.getByTestId("comment-draft").textContent!;
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(
      canvas.queryByRole("group", { name: "Comment formatting" }),
    ).not.toBeInTheDocument();
    await expect(editor).toHaveTextContent(retainedEmojiDraft);
  }}>{#snippet template()}<Fixture scenario="inline" />{/snippet}</Story
>

<Story
  name="Empty draft removal keyboard boundary"
  parameters={{
    docs: {
      source: { code: sources.EmptyDraft, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvasElement }) => {
    const editable = within(
      canvasElement.querySelector('[data-case="editable"]') as HTMLElement,
    );
    const editor = editable.getByRole("textbox", { name: "Comment" });
    await userEvent.click(editor);
    for (const init of [
      { isComposing: true },
      { keyCode: 229 },
      { repeat: true },
      { ctrlKey: true },
      { metaKey: true },
      { altKey: true },
      { shiftKey: true },
    ])
      editor.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Backspace",
          bubbles: true,
          ...init,
        }),
      );
    await expect(editable.getByTestId("comment-result")).toHaveTextContent(
      "No action requested",
    );
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{Backspace}");
    await expect(editable.getByTestId("comment-result")).toHaveTextContent(
      "No action requested",
    );
    for (const name of ["disabled", "pending", "readonly"]) {
      const blocked = within(
        canvasElement.querySelector(`[data-case="${name}"]`) as HTMLElement,
      );
      blocked
        .getByRole("textbox")
        .dispatchEvent(
          new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }),
        );
      await expect(blocked.getByTestId("comment-result")).toHaveTextContent(
        "No action requested",
      );
    }
    await userEvent.click(editor);
    await userEvent.keyboard("{Backspace}");
    await expect(editable.getByTestId("comment-result")).toHaveTextContent(
      "Removal requested",
    );
  }}
  >{#snippet template()}
    <div data-case="editable">
      <Fixture scenario="inline" initialValue="" />
    </div>
    <div data-case="disabled">
      <Fixture scenario="disabled" initialValue="" />
    </div>
    <div data-case="pending">
      <Fixture scenario="pending" initialValue="" />
    </div>
    <div data-case="readonly">
      <Fixture scenario="readonly" initialValue="" />
    </div>
  {/snippet}</Story
>
