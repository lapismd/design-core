<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import Fixture from "./Transcript.comment-lifetime.stories.fixture.svelte";
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["!autodocs", "visual-pending"],
  });
</script>

<Story
  name="Switch with pending Markdown comment"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (let index = 0; index < 3; index++) {
      await expect(
        canvas.getByRole("group", { name: "Pending comments" }),
      ).toHaveTextContent("captured");
      await userEvent.click(
        canvas.getByRole("button", { name: "Switch conversation" }),
      );
      await expect(
        canvas.queryByRole("group", { name: "Pending comments" }),
      ).toBeNull();
      await userEvent.click(
        canvas.getByRole("button", { name: "Restore draft" }),
      );
    }
  }}
>
  {#snippet template()}<Fixture />{/snippet}
</Story>

<Story
  name="Queued Markdown quote inherits context background"
  play={async ({ canvasElement }) => {
    const quote = canvasElement.querySelector(".ui-transcript-comment-quote")!;
    for (const element of [
      quote,
      ...quote.querySelectorAll(".mira-markdown-preview, p, ul"),
    ]) {
      expect(getComputedStyle(element).backgroundColor).toBe(
        "rgba(0, 0, 0, 0)",
      );
    }
    expect(quote).toHaveTextContent("Preserve the original layout");
    expect(quote.querySelectorAll('input[type="checkbox"]')).toHaveLength(2);
  }}
  >{#snippet template()}<Fixture
      quote={"A **captured** quote.\n\n- [ ] Preserve the original layout\n- [x] Review the exported components"}
    />{/snippet}</Story
>

<Story
  name="Queued code quote inherits context background"
  play={async ({ canvasElement }) => {
    const quote = canvasElement.querySelector(
      ".ui-transcript-comment-quote > code",
    )!;
    expect(getComputedStyle(quote).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(quote).toHaveTextContent("const café = '🦀';");
  }}
  >{#snippet template()}<Fixture
      quote={"const café = '🦀';"}
      sourceKind="code"
    />{/snippet}</Story
>

<Story
  name="Empty Backspace removes the draft comment"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox");
    await userEvent.click(editor);
    await userEvent.keyboard("{Home}{Shift>}{End}{/Shift}{Backspace}");
    await expect(editor.querySelector(".cm-placeholder")).not.toBeNull();
    await expect(
      canvas.getByRole("group", { name: "Inline comments on Original note" }),
    ).toBeVisible();
    await userEvent.keyboard("{Backspace}");
    await expect(canvas.queryByRole("textbox")).toBeNull();
    await expect(
      canvas.queryByRole("group", { name: "Inline comments on Original note" }),
    ).toBeNull();
    await userEvent.click(
      canvas.getByRole("button", { name: "Restore draft" }),
    );
    await expect(canvas.getByRole("textbox")).toHaveTextContent(
      "Keep this draft",
    );
  }}>{#snippet template()}<Fixture inline />{/snippet}</Story
>

<Story
  name="Comment formatting controls align with content"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", {
      name: "Comment formatting options",
    });
    const card = toggle.closest(".ui-transcript-comment-card")!;
    expect(
      Math.abs(
        toggle.getBoundingClientRect().right -
          card.getBoundingClientRect().right,
      ),
    ).toBeLessThanOrEqual(1);
    const hover = card.querySelector(".ui-transcript-comment-links")!;
    expect(hover.closest(".ui-comment-composer__actions")).not.toBeNull();
    expect(getComputedStyle(hover.parentElement!).position).toBe("absolute");
    const input = card.querySelector(".ui-comment-composer__input")!;
    const row = card.querySelector(".ui-comment-composer__card")!;
    expect(
      Math.abs(
        toggle.getBoundingClientRect().left -
          input.getBoundingClientRect().right -
          parseFloat(getComputedStyle(row).columnGap),
      ),
    ).toBeLessThanOrEqual(1);
    await userEvent.click(within(card as HTMLElement).getByRole("textbox"));
    const actions = hover.getBoundingClientRect();
    const formatting = toggle.getBoundingClientRect();
    expect(Math.abs(actions.top - formatting.top)).toBeLessThanOrEqual(1);
    expect(actions.right).toBeLessThanOrEqual(formatting.left);
    await userEvent.click(
      canvas.getByRole("button", { name: "Switch conversation" }),
    );
    expect(
      canvas.queryByRole("button", { name: "Comment formatting options" }),
    ).toBeNull();
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
