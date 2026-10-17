<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import Fixture from "./Transcript.stories.fixture.svelte";
  import {
    Basic,
    Inspector,
    QueuedMessages,
    ReactionsAndProfiles,
    RecordedConversation,
    EditableComments,
  } from "./Transcript.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Continuous document"
  play={async ({ canvas }) => {
    const send = canvas.getByRole("button", {
      name: /^Send message$/,
    });
    await expect(send.querySelector("svg")).toHaveClass(
      "lucide-send-horizontal",
    );
    await expect(
      canvas.getByRole("log", { name: "Conversation messages" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", {
        name: /^Show\ details\ for\ Read\ src\/settings\.ts$/,
      }),
    );
    await expect(
      canvas.getByRole("textbox", { name: /^src\/settings\.ts$/ }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: /^Stream\ update$/ }),
    );
    await waitFor(() =>
      expect(
        canvas.getByText("A streamed update retains the same reader."),
      ).toBeVisible(),
    );
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story name="Classic messages"
  >{#snippet template()}<Fixture scenario="classic" />{/snippet}</Story
>
<Story
  name="Inline comments and queue"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", { name: /^Pending\ comments$/ }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", {
        name: /^Send\ message$/,
      }),
    );
    await waitFor(() =>
      expect(canvas.getByTestId("transcript-result")).toHaveTextContent(
        "1 comments submitted",
      ),
    );
  }}>{#snippet template()}<Fixture scenario="comments" />{/snippet}</Story
>
<Story name="Changed source retains quote"
  >{#snippet template()}<Fixture scenario="stale" />{/snippet}</Story
>
<Story name="Large folded capture"
  >{#snippet template()}<Fixture scenario="large" />{/snippet}</Story
>
<Story name="Narrow document"
  >{#snippet template()}<Fixture scenario="narrow" />{/snippet}</Story
>
<Story name="Loading retained history"
  >{#snippet template()}<Fixture scenario="loading" />{/snippet}</Story
>
<Story
  name="Retry history"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", {
        name: /^Retry\ loading\ history$/,
      }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("textbox", { name: /^Earlier message$/ }),
      ).toBeVisible(),
    );
  }}>{#snippet template()}<Fixture scenario="retry" />{/snippet}</Story
>
<Story name="Empty history"
  >{#snippet template()}<Fixture scenario="empty" />{/snippet}</Story
>
<Story name="Rejected submission retains drafts"
  >{#snippet template()}<Fixture scenario="rejected" />{/snippet}</Story
>
<Story name="Unknown submission retains identity"
  >{#snippet template()}<Fixture scenario="unknown" />{/snippet}</Story
>

<Story
  name="Queued delivery"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Send message",
      }),
    );
    await waitFor(() =>
      expect(canvas.getAllByText("Queued")[0]!).toBeVisible(),
    );
  }}>{#snippet template()}<Fixture scenario="queued" />{/snippet}</Story
>
<Story name="Reply destinations"
  >{#snippet template()}<Fixture scenario="replies" />{/snippet}</Story
>
<Story name="Custom section comments"
  >{#snippet template()}<Fixture scenario="custom" />{/snippet}</Story
>

<Story
  name="Inspector reader lifecycle"
  parameters={{
    docs: { source: { code: Inspector, language: "tsx", type: "code" } },
  }}>{#snippet template()}<Fixture scenario="inspector" />{/snippet}</Story
>

<Story
  name="Busy agent and queued messages"
  parameters={{
    docs: { source: { code: QueuedMessages, language: "tsx", type: "code" } },
  }}>{#snippet template()}<Fixture scenario="busy-queue" />{/snippet}</Story
>
<Story
  name="Queue needs attention"
  parameters={{
    docs: { source: { code: QueuedMessages, language: "tsx", type: "code" } },
  }}
  >{#snippet template()}<Fixture scenario="queue-attention" />{/snippet}</Story
>
<Story
  name="Cancellation awaits confirmation"
  parameters={{
    docs: { source: { code: QueuedMessages, language: "tsx", type: "code" } },
  }}
  >{#snippet template()}<Fixture scenario="queue-cancelling" />{/snippet}</Story
>
<Story name="Quoted lists and typography"
  >{#snippet template()}<Fixture scenario="typography" />{/snippet}</Story
>
<Story name="Unavailable status below"
  >{#snippet template()}<Fixture scenario="status-bottom" />{/snippet}</Story
>
<Story
  name="Message reactions and author profiles"
  parameters={{
    docs: {
      source: { code: ReactionsAndProfiles, language: "tsx", type: "code" },
    },
  }}>{#snippet template()}<Fixture scenario="reactions" />{/snippet}</Story
>
<Story
  name="Full conversation with context tools and replies"
  parameters={{
    docs: {
      source: { code: RecordedConversation, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-ui-component="transcript"]',
    )!;
    const reader = canvas.getByRole("textbox", { name: "User message" });
    const ids = () =>
      Array.from(canvasElement.querySelectorAll("[data-chat-item]"), (node) =>
        node.getAttribute("data-chat-item"),
      );
    const capturedIds = ids();
    await userEvent.click(canvas.getByRole("button", { name: "Classic" }));
    await expect(root).toHaveAttribute("data-conversation-view", "classic");
    await expect(
      canvasElement.querySelector('[data-ui-component="markdown-composer"]'),
    ).toHaveAttribute("data-presentation", "framed");
    expect(canvas.getByRole("textbox", { name: "User message" })).toBe(reader);
    expect(ids()).toEqual(capturedIds);
    await userEvent.click(canvas.getByRole("button", { name: "Document" }));
    await expect(root).toHaveAttribute("data-conversation-view", "document");
    expect(canvas.getByRole("textbox", { name: "User message" })).toBe(reader);
    expect(ids()).toEqual(capturedIds);
  }}
>
  {#snippet template()}<Fixture scenario="full" />{/snippet}
</Story>

<Story
  name="Editable comments and metadata"
  parameters={{
    docs: { source: { code: EditableComments, language: "tsx", type: "code" } },
  }}
>
  {#snippet template()}<Fixture scenario="edit" />{/snippet}
</Story>
