<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import ActionFixture from "./Transcript.actions.stories.fixture.svelte";
  import type { TranscriptItem } from "./model.js";
  const items: TranscriptItem[] = [
    {
      id: "answer",
      kind: "message",
      role: "assistant",
      label: "Answer",
      blocks: [
        {
          id: "answer/body",
          revision: "1",
          kind: "markdown",
          label: "Answer",
          text: "Review the captured changes.",
        },
      ],
    },
  ];
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending", "!autodocs"],
  });
</script>

<Story
  name="Comment action is icon only"
  play={async ({ canvas }) => {
    const action = await canvas.findByRole("button", {
      name: "Comment on Answer",
    });
    expect(action).toHaveTextContent("");
  }}
>
  {#snippet template()}<div style="height:320px;padding:2rem">
      <Transcript {items} canComment />
    </div>{/snippet}
</Story>
<Story
  name="Unavailable hover actions are absent"
  play={async ({ canvas }) => {
    await canvas.findByText("Review the captured changes.");
    expect(
      canvas.queryByRole("group", { name: "Actions for Answer" }),
    ).not.toBeInTheDocument();
  }}
>
  {#snippet template()}<div style="height:320px;padding:2rem">
      <Transcript
        items={[
          {
            ...items[0]!,
            blocks: items[0]!.blocks.map((block) => ({
              ...block,
              commentable: false,
            })),
          },
        ]}
        canComment
        reactionsDisabled
      />
    </div>{/snippet}
</Story>

<Story
  name="Configured actions preserve tool controls"
  play={async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole("region", { name: "Tool preview" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle tool source" }),
    );
    await expect(canvas.getByText("Raw captured output")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "More actions for Tool result" }),
    );
    await userEvent.click(
      await within(document.body).findByRole("menuitem", {
        name: "Copy captured message",
      }),
    );
    await expect(canvas.getByTestId("hover-action")).toHaveTextContent("copy");
  }}>{#snippet template()}<ActionFixture />{/snippet}</Story
>
<Story
  name="Disabled action bar is absent"
  play={async ({ canvas }) => {
    await canvas.findByText("Captured tool output");
    await expect(
      canvas.queryByRole("group", { name: "Actions for Tool result" }),
    ).not.toBeInTheDocument();
  }}>{#snippet template()}<ActionFixture disabled />{/snippet}</Story
>
<Story
  name="Tooltips may be omitted"
  play={async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole("region", { name: "Tool preview" }));
    const comment = canvas.getByRole("button", {
      name: "Comment on Tool result",
    });
    comment.focus();
    await expect(comment).toHaveFocus();
    await userEvent.hover(comment);
    await expect(
      within(document.body).queryByRole("tooltip"),
    ).not.toBeInTheDocument();
  }}>{#snippet template()}<ActionFixture tooltips={false} />{/snippet}</Story
>
