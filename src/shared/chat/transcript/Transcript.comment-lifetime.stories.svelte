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
