<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
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
  name="Markdown tables and centered avatars"
  play={async ({ canvas, canvasElement }) => {
    const table = await canvas.findByRole("table");
    await expect(within(table).getAllByRole("row")).toHaveLength(3);
    await expect(
      within(table).getByRole("columnheader", { name: "Area" }),
    ).toBeVisible();
    await expect(
      within(table).getByRole("cell", { name: "Research" }),
    ).toBeVisible();
    const preview = table.closest(".ui-transcript-markdown-preview")!;
    await expect(getComputedStyle(preview).whiteSpace).toBe("normal");
    await expect(
      preview.getBoundingClientRect().height -
        table.getBoundingClientRect().height,
    ).toBeLessThan(40);
    await expect(
      within(table)
        .getByRole("cell", { name: "Research" })
        .getBoundingClientRect().height,
    ).toBeLessThan(48);
    await expect(table.querySelector(".cm-gutters")).toBeNull();
    await waitFor(() => {
      expect(
        canvas.getByRole("textbox", { name: "typescript code" }),
      ).toBeVisible();
    });
    await expect(
      canvas.getByRole("textbox", { name: "typescript code" }),
    ).toHaveTextContent('const review = "weekly";');
    await expect(
      canvas
        .getByRole("textbox", { name: "typescript code" })
        .closest(".cm-editor")!
        .querySelector(".cm-gutters"),
    ).toBeNull();
    await expect(canvas.getByText("TypeScript", { exact: true })).toBeVisible();
    const content = canvasElement.querySelector<HTMLElement>(
      '[data-chat-item] [data-ui-component="avatar"] [data-ui-part="content"]',
    )!;
    await expect(getComputedStyle(content).display).toBe("grid");
    await expect(getComputedStyle(content).alignItems).toBe("center");
    const box = content.getBoundingClientRect();
    const initials = content.querySelector("span")!.getBoundingClientRect();
    await expect(
      Math.abs((box.left + box.right - initials.left - initials.right) / 2),
    ).toBeLessThan(1);
    await expect(
      Math.abs((box.top + box.bottom - initials.top - initials.bottom) / 2),
    ).toBeLessThan(1);
  }}>{#snippet template()}<Fixture scenario="table" />{/snippet}</Story
>

<Story
  name="Code and table text comments"
  play={async ({ canvas }) => {
    const code = await canvas.findByRole("textbox", {
      name: "typescript code",
    });
    await userEvent.click(code);
    await userEvent.keyboard(
      "{Home}{Shift>}{End}{/Shift}{Control>}{Alt>}m{/Alt}{/Control}",
    );
    const comment = await canvas.findByRole("textbox", {
      name: "Comment on Implementation summary",
    });
    await userEvent.click(comment);
    await userEvent.keyboard("Keep this code example.");
    const anchors = JSON.parse(
      canvas.getByTestId("transcript-result").getAttribute("data-anchors")!,
    );
    await expect(anchors[0].quote).toBe('const review = "weekly";');
    const cell = within(
      canvas.getByRole("cell", { name: "Read the note" }),
    ).getByRole("textbox");
    await userEvent.click(cell);
    await userEvent.keyboard(
      "{Home}{Shift>}{End}{/Shift}{Control>}{Alt>}m{/Alt}{/Control}",
    );
    await waitFor(() =>
      expect(
        canvas.getAllByRole("group", {
          name: "Inline comments on Implementation summary",
        }),
      ).toHaveLength(2),
    );
    const tableArea = cell.closest<HTMLElement>(".ui-transcript-rich-table")!;
    const area = within(tableArea).getByRole("group", {
      name: "Inline comments on Implementation summary",
    });
    await userEvent.click(
      within(area).getByRole("textbox", {
        name: "Comment on Implementation summary",
      }),
    );
    await userEvent.keyboard("Use this table cell as context.");
    const all = JSON.parse(
      canvas.getByTestId("transcript-result").getAttribute("data-anchors")!,
    );
    await expect(all[1].quote).toBe("Read the note");
    await expect(all[1].tableContext.markdown).toContain(
      "**Research** | Read the note",
    );
    const richTable = tableArea;
    await expect(richTable.querySelectorAll("table")).toHaveLength(2);
    await expect(
      richTable.querySelector(".ui-transcript-comment-highlight"),
    ).toHaveTextContent("Read the note");
    const parts = richTable.querySelector(".mira-table-reader")!.children;
    await expect(parts[0]).toHaveTextContent("Research");
    await expect(parts[1]).toHaveTextContent("Use this table cell as context.");
    await expect(parts[2]).toHaveTextContent("Writing");
    const queue = canvas.getByRole("group", { name: "Pending comments" });
    const context = within(queue).getByRole("table", {
      name: "Commented table row",
    });
    await expect(context).toHaveTextContent("Research");
    await expect(context).not.toHaveTextContent("Writing");
    await expect(
      context.querySelector(".ui-transcript-comment-highlight"),
    ).toHaveTextContent("Read the note");
    await expect(code).toHaveTextContent('const review = "weekly";');
    await expect(
      getComputedStyle(code.closest(".cm-editor")!).backgroundColor,
    ).toBe("rgba(0, 0, 0, 0)");
  }}>{#snippet template()}<Fixture scenario="table" />{/snippet}</Story
>

<Story
  name="Fenced code uses captured reader comments and folds"
  play={async ({ canvas }) => {
    const more = await canvas.findByRole("button", {
      name: "Show 40 more lines in typescript code",
    });
    await userEvent.click(more);
    await expect(
      canvas.getByRole("button", { name: "Show less in typescript code" }),
    ).toBeVisible();
    const code = canvas.getByRole("textbox", { name: "typescript code" });
    await userEvent.click(code);
    await userEvent.keyboard(
      "{ArrowUp}".repeat(65) +
        "{Home}{ArrowDown}{Home}{Shift>}{End}{/Shift}{Control>}{Alt>}m{/Alt}{/Control}",
    );
    const frame = code.closest<HTMLElement>(".ui-transcript-rich-code")!;
    const area = await within(frame).findByRole("group", {
      name: "Inline comments on Implementation summary",
    });
    await userEvent.click(
      within(area).getByRole("textbox", {
        name: "Comment on Implementation summary",
      }),
    );
    await userEvent.keyboard("Keep this setting in the same module.");
    const anchors = JSON.parse(
      canvas.getByTestId("transcript-result").getAttribute("data-anchors")!,
    );
    await expect(anchors[0].quote).toBe('export const setting2 = "value 2";');
    await expect(code).toHaveTextContent(
      'export const setting20 = "value 20";',
    );
    await userEvent.click(
      within(frame).getByRole("button", {
        name: "Show less in typescript code",
      }),
    );
    await expect(
      within(frame).getByRole("button", {
        name: "Show 40 more lines in typescript code",
      }),
    ).toBeVisible();
    await expect(area).toHaveTextContent(
      "Keep this setting in the same module.",
    );
  }}>{#snippet template()}<Fixture scenario="fenced-code" />{/snippet}</Story
>

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
    await expect(
      canvasElement.querySelector(".ui-transcript-tool-summary"),
    ).toHaveStyle({ fontSize: "13px", minHeight: "24px" });
    const replies = canvas.getByRole("button", {
      name: /^2 replies$/,
    });
    await expect(
      replies.parentElement!.querySelector(
        '[data-ui-component="avatar-group"]',
      ),
    ).toHaveAttribute("data-size", "xs");
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

<Story
  name="Inline footer formatting"
  play={async ({ canvas, canvasElement }) => {
    const footer = canvasElement.querySelector<HTMLElement>(
      ".ui-transcript-footer__body",
    )!;
    const region = canvasElement.querySelector<HTMLElement>(
      ".ui-transcript-body-reading-surface",
    )!;
    await expect(region.scrollHeight).toBeLessThanOrEqual(region.clientHeight);
    const scrollport = region.querySelector<HTMLElement>(
      ".ui-transcript-viewport > [data-ui-part='scroll-area-viewport']",
    )!;
    await expect(getComputedStyle(scrollport).overflowY).toMatch(/auto|scroll/);
    scrollport.scrollTo({ top: 200 });
    await waitFor(() => expect(scrollport.scrollTop).toBeGreaterThan(0));
    const before = footer.getBoundingClientRect().height;
    const toggle = canvas.getByRole("button", {
      name: /^Formatting\ options$/,
    });
    await userEvent.click(toggle);
    await expect(canvas.getByRole("button", { name: /^Bold$/ })).toBeVisible();
    await expect(region.scrollHeight).toBeLessThanOrEqual(region.clientHeight);
    await expect(footer.getBoundingClientRect().height).toBe(before);
    await expect(
      canvas.getByRole("button", { name: "Hide formatting" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Add emoji" }),
    ).not.toBeInTheDocument();
    const send = canvas.getByRole("button", {
      name: /^Stop\ agent$/,
    });
    await expect(
      Math.abs(
        toggle.getBoundingClientRect().y - send.getBoundingClientRect().y,
      ),
    ).toBeLessThan(1);
    await userEvent.click(
      canvas.getByRole("button", { name: "Hide formatting" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Add emoji" }),
    ).toBeVisible();
  }}>{#snippet template()}<Fixture scenario="full" />{/snippet}</Story
>
