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
    expect(getComputedStyle(hover).position).toBe("absolute");
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
