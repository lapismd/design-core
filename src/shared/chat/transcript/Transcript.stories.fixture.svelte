<script lang="ts">
  import { untrack } from "svelte";
  import TranscriptContent from "./ChatContent.svelte";
  import { ScrollArea } from "../../shadcn/scroll-area/index.js";
  import Transcript from "./Transcript.svelte";
  import { TranscriptController } from "./comments.svelte.js";
  import { commentAnchor } from "./anchors.js";
  import MarkdownComposer from "../markdown-composer/MarkdownComposer.svelte";
  import TranscriptAvatar from "./TranscriptAvatar.svelte";
  import { Button } from "../../shadcn/button/index.js";
  import type { TranscriptItem, TranscriptSubmissionResult } from "./model.js";
  let { scenario = "document" }: { scenario?: string } = $props();
  const author = { id: "you", name: "Alex Morgan", initials: "AM" };
  const agent = {
    id: "assistant",
    name: "Assistant",
    initials: "AI",
    shape: "rounded" as const,
  };
  const turn = {
    id: "turn-1",
    author: author.name,
    prompt: "Add configurable screen lock overlay",
    summary:
      "Added a configurable screen lock, keeping existing settings and shortcuts.",
    agentName: "Assistant",
    modelLabel: "Host-supplied model",
    createdAt: 1792152000000,
  };
  const prose = {
    id: "reply/body",
    revision: "v1",
    kind: "markdown" as const,
    label: "Implementation summary",
    text: "# Screen lock overlay\n\nThe lock follows your **workspace settings** and retains the existing keyboard shortcut.\n\n- Keep the captured source immutable.\n- Review the patch before applying it.\n\nA café 👩🏽‍💻 stays in the exact captured text.",
  };
  const code = {
    id: "read/settings",
    revision: "v1",
    kind: "code" as const,
    label: "src/settings.ts",
    path: "settings.ts",
    lineNumbered: true,
    text: "  9\texport const lock = {\n 10\t  enabled: true,\n 90\t  shortcut: 'Mod+L',\n 91\t};",
  };
  const patch = {
    id: "patch/settings",
    revision: "v1",
    kind: "patch" as const,
    label: "Settings patch",
    path: "settings.ts",
    text: "@@ -1,2 +1,3 @@\n export const lock = {\n-  enabled: false,\n+  enabled: true,\n+  shortcut: 'Mod+L',\n };",
  };
  let items = $state<TranscriptItem[]>([
    {
      id: "prompt",
      kind: "message",
      role: "user",
      label: "Request",
      author,
      turn,
      blocks: [
        {
          id: "prompt/body",
          revision: "v1",
          kind: "markdown",
          label: "Request",
          text: turn.prompt,
        },
      ],
    },
    {
      id: "context",
      kind: "context",
      label: "Captured context",
      turn,
      blocks: [
        {
          id: "context/body",
          revision: "v1",
          kind: "context",
          label: "Workspace context",
          text: "Workspace context is supplied by the host. No tools execute in this story.",
        },
      ],
    },
    {
      id: "tools",
      kind: "tools",
      label: "Read a file and updated settings",
      turn,
      defaultExpanded: true,
      blocks: [],
      tools: [
        {
          id: "read",
          revision: "v1",
          title: "Read src/settings.ts",
          status: "complete",
          blocks: [code],
          raw: '{"path":"src/settings.ts","captured":true}',
        },
        {
          id: "edit",
          revision: "v1",
          title: "Updated settings",
          status: "complete",
          blocks: [patch],
          raw: '{"path":"src/settings.ts","status":"captured"}',
        },
        {
          id: "shell",
          revision: "v1",
          title: "Checked the package",
          status: "complete",
          blocks: [
            {
              id: "shell/output",
              revision: "v1",
              kind: "code",
              label: "Command and output",
              path: "command.sh",
              text: "$ pnpm check\nType check passed.\nNo files were changed.",
            },
          ],
          raw: '{"command":"pnpm check","output":"Type check passed."}',
        },
      ],
    },
    {
      id: "reply",
      kind: "message",
      role: "assistant",
      label: "Implementation summary",
      author: agent,
      turn,
      blocks: [prose],
    },
  ]);
  untrack(() => {
    if (scenario === "large")
      items = [
        ...items,
        {
          id: "large",
          kind: "message",
          label: "Large capture",
          author: agent,
          blocks: [
            {
              ...code,
              id: "large/source",
              lineNumbered: false,
              text: Array.from(
                { length: 80 },
                (_, i) => `const line${i + 1} = "café 👩🏽‍💻";`,
              ).join("\n"),
            },
          ],
        },
      ];
    if (scenario === "empty") items = [];
    if (["custom", "inspector"].includes(scenario))
      items = items.map((item) =>
        item.id === "reply"
          ? { ...item, blocks: [{ ...prose, kind: "custom" }] }
          : item,
      );
  });
  let result = $state("");
  let loads = $state(0);
  let shown = $state(true);
  let inspectorShown = $state(false);
  const controller = new TranscriptController(() => ({
    items,
    author,
    canComment: true,
    onSend: async (snapshot): Promise<TranscriptSubmissionResult> => {
      if (scenario === "unknown")
        return { publication: "unknown", error: "Awaiting host confirmation." };
      if (scenario === "rejected")
        return {
          publication: "refused",
          error: "Host refused this submission. Drafts retained.",
        };
      result = snapshot.comments.length
        ? `${snapshot.comments.length} comments submitted`
        : "Message submitted";
      return {
        publication: scenario === "queued" ? "queued" : "published",
        batchId: snapshot.id,
      };
    },
  }));
  untrack(() => {
    if (["comments", "stale", "queued", "replies"].includes(scenario)) {
      controller.threads = [
        {
          id: "thread",
          label: prose.label,
          sourceKind: "markdown",
          anchor: commentAnchor(prose, {
            from: prose.text.indexOf("workspace"),
            to: prose.text.indexOf("workspace") + 18,
          }),
          comments: [
            {
              id: "comment",
              author,
              text: "Keep this text exactly as captured.",
              status: "draft",
            },
          ],
        },
      ];
      if (scenario === "replies") {
        const comment = controller.threads[0]!.comments[0]!;
        comment.status = "sent";
        comment.batchId = "sent-batch";
        controller.recordReply(
          "thread",
          comment.id,
          {
            id: "agent-reply",
            author: agent,
            text: "Confirmed; the captured source stays unchanged.",
            status: "sent",
          },
          "comment-reply",
        );
        items = [
          ...items,
          {
            id: "comment-reply",
            kind: "message",
            role: "assistant",
            label: "Reply to review",
            author: agent,
            replyContext: { threadId: "thread", commentIds: [comment.id] },
            blocks: [
              {
                id: "comment-reply/body",
                revision: "v1",
                kind: "markdown",
                label: "Reply to review",
                text: "Confirmed; the captured source stays unchanged.",
              },
            ],
          },
        ];
      }
      if (scenario === "stale")
        items = items.map((item) =>
          item.id === "reply"
            ? { ...item, blocks: [{ ...prose, revision: "v2" }] }
            : item,
        );
    }
  });
  function stream() {
    items = items.map((item) =>
      item.id === "reply"
        ? {
            ...item,
            blocks: item.blocks.map((block) => ({
              ...block,
              text:
                block.text + "\n\nA streamed update retains the same reader.",
            })),
          }
        : item,
    );
  }
  function prepend() {
    loads++;
    items = [
      {
        id: `history-${loads}`,
        kind: "message",
        label: "Earlier message",
        author,
        blocks: [
          {
            id: `history-${loads}/body`,
            revision: "v1",
            kind: "markdown",
            label: "Earlier message",
            text: "Retained history loaded by the host.\n\n".repeat(5),
          },
        ],
      },
      ...items,
    ];
  }
</script>

<div class="transcript-fixture" data-narrow={scenario === "narrow"}>
  <div class="transcript-fixture-actions">
    <Button variant="outline" onclick={stream}>Stream update</Button><Button
      variant="outline"
      onclick={prepend}>Prepend history</Button
    ><Button
      variant="outline"
      onclick={() => {
        void controller.send();
      }}
      disabled={!controller.canSend}>Send message and comments</Button
    ><Button
      variant="outline"
      onclick={() => {
        shown = !shown;
      }}>Toggle transcript</Button
    >{#if scenario === "inspector"}<Button
        onclick={() => (inspectorShown = !inspectorShown)}
        >{inspectorShown
          ? "Close source inspector"
          : "Open source inspector"}</Button
      >{/if}<output data-testid="transcript-result"
      >{controller.error || result}</output
    >
  </div>
  <div class="transcript-fixture-reader">
    {#if shown}<Transcript
        {items}
        commentState={controller}
        view={scenario === "classic" ? "classic" : "document"}
        loading={scenario === "loading"}
        history={scenario === "retry" ? "retry" : undefined}
        onLoadHistory={prepend}
      >
        {#snippet composer()}<MarkdownComposer
            bind:value={controller.message}
            presentation="document"
            onSubmit={() => {
              void controller.send();
            }}
          >
            {#snippet avatar()}<TranscriptAvatar member={author} />{/snippet}
          </MarkdownComposer>{/snippet}
      </Transcript>{/if}
  </div>
  {#if inspectorShown}<aside
      aria-label="Source inspector"
      style="height: 12rem"
    >
      <ScrollArea style="height:100%"
        ><TranscriptContent
          blocks={[{ ...prose, kind: "custom" }]}
          state={controller}
        /></ScrollArea
      >
    </aside>{/if}
</div>

<style>
  .transcript-fixture {
    height: min(48rem, calc(100vh - 2rem));
    min-height: 28rem;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    max-width: 100%;
    color: var(--foreground);
    background: var(--background);
  }
  .transcript-fixture[data-narrow="true"] {
    width: 340px;
  }
  .transcript-fixture-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--border);
  }
  .transcript-fixture-reader {
    min-height: 0;
  }
  output {
    font-size: 0.875rem;
    align-self: center;
  }
</style>
