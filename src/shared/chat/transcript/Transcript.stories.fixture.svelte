<script lang="ts">
  import { tick, untrack, type Snippet } from "svelte";
  import recordedSession from "./reference/capture.stories.fixture.json";
  import { deltaChatItems } from "./reference/adapter.stories.fixture.js";
  import { referenceDiscussions } from "./reference/discussions.stories.fixture.js";
  import TranscriptToolContent from "./ChatToolBlocks.svelte";
  import { promptElementsExtension } from "../prompt-context/prompt-elements-extension.js";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import FilePenIcon from "@lucide/svelte/icons/file-pen";
  import TerminalIcon from "@lucide/svelte/icons/terminal";
  import WrenchIcon from "@lucide/svelte/icons/wrench";
  import TranscriptFooter from "./TranscriptFooter.svelte";
  import MessageQueue from "./MessageQueue.svelte";
  import * as DropdownMenu from "../../shadcn/dropdown-menu/index.js";
  import BotIcon from "@lucide/svelte/icons/bot";
  import CpuIcon from "@lucide/svelte/icons/cpu";
  import LightbulbIcon from "@lucide/svelte/icons/lightbulb";
  import PaperclipIcon from "@lucide/svelte/icons/paperclip";
  import type { TranscriptQueuedMessage } from "./model.js";
  import type { CustomEmoji } from "../../shadcn/emoji-picker/index.js";
  import type { Reaction } from "../../ai/experimental/reaction-bar/reaction-bar.types.js";
  import TranscriptContent from "./ChatContent.svelte";
  import { ScrollArea } from "../../shadcn/scroll-area/index.js";
  import Transcript from "./Transcript.svelte";
  import { TranscriptController } from "./comments.svelte.js";
  import { commentAnchor } from "./anchors.js";
  import MarkdownComposer from "../markdown-composer/MarkdownComposer.svelte";
  import TranscriptAvatar from "./TranscriptAvatar.svelte";
  import { Button } from "../../shadcn/button/index.js";
  import SegmentedControl from "../../forms/segmented-control/SegmentedControl.svelte";
  import type { TranscriptItem, TranscriptSubmissionResult } from "./model.js";
  let { scenario = "document" }: { scenario?: string } = $props();
  let inputActions = $state<Snippet>();
  let view = $state<"document" | "classic">(
    untrack(() => (scenario === "classic" ? "classic" : "document")),
  );
  const author = untrack(() =>
    scenario === "full"
      ? { id: "reference-user", name: "You", initials: "YO" }
      : { id: "you", name: "Alex Morgan", initials: "AM" },
  );
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
          icon: FileTextIcon,
          status: "complete",
          blocks: [code],
          raw: '{"path":"src/settings.ts","captured":true}',
        },
        {
          id: "edit",
          revision: "v1",
          title: "Updated settings",
          icon: FilePenIcon,
          status: "complete",
          blocks: [patch],
          raw: '{"path":"src/settings.ts","status":"captured"}',
        },
        {
          id: "shell",
          revision: "v1",
          title: "Checked the package",
          icon: TerminalIcon,
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
  let busy = $state(false);
  let stopping = $state(false);
  let model = $state("Balanced model");
  let thinking = $state("Standard thinking");
  let agentLabel = $state("Assistant");
  let reactions = $state<Record<string, Reaction[]>>({});
  const customEmoji = {
    id: "spark",
    shortcode: "spark",
    label: "Project spark",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ctext y='26' font-size='26'%3E✨%3C/text%3E%3C/svg%3E",
  };
  function react(id: string, emoji: string, custom?: CustomEmoji) {
    const entries = reactions[id] ?? [];
    const current = entries.find((r) => r.emoji === emoji);
    reactions = {
      ...reactions,
      [id]: current
        ? entries.filter((r) => r !== current)
        : [
            ...entries,
            { emoji, count: 1, selected: true, ...(custom ? { custom } : {}) },
          ],
    };
    result = `Reaction ${emoji} updated`;
  }
  let queued = $state<TranscriptQueuedMessage[]>([]);
  let result = $state("");
  let loads = $state(0);
  let shown = $state(true);
  let inspectorShown = $state(false);
  let inspectedTool = $state<import("./model.js").TranscriptTool>();
  let inspectorOpener: HTMLElement | undefined;
  async function closeInspector() {
    inspectorShown = false;
    await tick();
    inspectorOpener?.focus();
  }
  const controller = new TranscriptController(() => ({
    items,
    author,
    canComment: true,
    canEditComment: () => true,
    unavailableStatus:
      scenario === "status-bottom"
        ? { type: "error", message: "Original content unavailable or changed." }
        : undefined,
    unavailableStatusPosition: scenario === "status-bottom" ? "bottom" : "top",
    onSend: async (snapshot): Promise<TranscriptSubmissionResult> => {
      if (scenario === "unknown")
        return { publication: "unknown", error: "Awaiting host confirmation." };
      if (scenario === "rejected")
        return {
          publication: "refused",
          error: "Host refused this submission. Drafts retained.",
        };
      const queueSubmission = busy || scenario === "queued";
      if (busy)
        queued = [
          ...queued,
          {
            id: snapshot.id,
            submission: snapshot,
            recipients: [
              { id: "assistant", label: agentLabel, state: "queued" },
            ],
          },
        ];
      result = snapshot.comments.length
        ? `${snapshot.comments.length} comments submitted`
        : "Message submitted";
      if (scenario === "full") busy = true;
      return {
        publication: queueSubmission ? "queued" : "published",
        batchId: snapshot.id,
        commentVersions: Object.fromEntries(
          snapshot.comments.map((c) => [c.commentId, `demo-${snapshot.id}`]),
        ),
      };
    },
  }));
  untrack(() => {
    if (
      [
        "comments",
        "stale",
        "status-bottom",
        "typography",
        "queued",
        "replies",
      ].includes(scenario)
    ) {
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
      if (scenario === "typography") {
        const thread = controller.threads[0]!;
        thread.anchor = commentAnchor(prose, {
          from: prose.text.indexOf("- Keep"),
          to: prose.text.indexOf("\n\nA café"),
        });
        thread.comments[0]!.status = "sent";
        thread.comments[0]!.batchId = "type-batch";
      }
      if (["replies", "typography"].includes(scenario)) {
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
      if (["stale", "status-bottom"].includes(scenario))
        items = items.map((item) =>
          item.id === "reply"
            ? { ...item, blocks: [{ ...prose, revision: "v2" }] }
            : item,
        );
    }
  });
  untrack(() => {
    if (
      ["busy-queue", "queue-attention", "queue-cancelling"].includes(scenario)
    ) {
      busy = true;
      items = [
        items[0]!,
        {
          ...items[3]!,
          blocks: [
            {
              ...prose,
              text: "I’m reviewing the settings. Follow-up messages wait in the host queue while I work.",
            },
          ],
        },
      ];
      queued = [
        {
          id: "waiting",
          submission: {
            id: "waiting",
            author,
            text: "After your current task, review the keyboard shortcuts.\nKeep the existing source unchanged.",
            comments: [],
          },
          recipients: [
            {
              id: "assistant",
              label: "Assistant",
              state: scenario === "queue-attention" ? "unknown" : "queued",
              ...(scenario === "queue-attention"
                ? { error: "The host has not confirmed delivery." }
                : {}),
              ...(scenario === "queue-cancelling" ? { cancelling: true } : {}),
            },
          ],
        },
      ];
      if (scenario === "busy-queue")
        controller.message = "Also check the reduced-motion setting.";
    }
  });
  untrack(() => {
    if (scenario !== "full") return;
    const projected = referenceDiscussions(deltaChatItems(recordedSession));
    // The capture proves prompt text, but does not include an outgoing context receipt.
    // This separately labelled overlay demonstrates presentation without claiming delivery.
    const demoContext =
      "Demonstration context; delivery is not captured in this recording.\n\n<agent_context>\n## Review workspace\n\nKeep captured text **immutable**.\n</agent_context>";
    items = projected.items.map((item, index) =>
      index === 0
        ? {
            ...item,
            sentContext: {
              content: demoContext,
              delivery: "unknown",
              rawContent: JSON.stringify(
                { delivery: "unknown", wireContext: demoContext },
                null,
                2,
              ),
            },
          }
        : item,
    );
    controller.threads = projected.threads.map((thread) => ({
      ...thread,
      comments: thread.comments.map((comment) => ({
        ...comment,
        version: "demo-v1",
      })),
    }));
    items = items.map((item, index) =>
      index === 0
        ? {
            ...item,
            timestamp: "12:00",
            createdAt: "2026-10-08T12:00:00Z",
            edited: true,
            replyCount: 2,
            replyParticipants: [author, agent],
          }
        : item,
    );
    busy = true;
    agentLabel = "Codex";
    queued = [
      {
        id: "next-review",
        submission: {
          id: "next-review",
          author,
          text: "Demo queued message: after your current task, review the documentation too.",
          comments: [],
        },
        recipients: [{ id: "assistant", label: "Codex", state: "queued" }],
      },
    ];
    reactions = {
      [items[0]!.id]: [{ emoji: "👍", count: 2, selected: false }],
    };
  });
  untrack(() => {
    if (scenario !== "edit") return;
    items = items.map((item) =>
      item.id === "prompt"
        ? {
            ...item,
            timestamp: "12:00",
            createdAt: "2026-10-08T12:00:00Z",
            edited: true,
            replyCount: 2,
            replyParticipants: [author, agent],
          }
        : item,
    );
    controller.threads = [
      {
        id: "editable-thread",
        label: prose.label,
        sourceKind: "markdown",
        anchor: commentAnchor(prose, { from: 0, to: 0 }),
        comments: [
          {
            id: "editable-comment",
            messageId: "saved-comment",
            version: "v1",
            author,
            text: "Review the schedule before changing defaults.",
            status: "sent",
          },
        ],
      },
    ];
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
    {#if scenario === "busy-queue" && busy}<Button
        variant="outline"
        onclick={() => {
          busy = false;
          stopping = false;
        }}>Mark agent idle</Button
      >{/if}
    {#if scenario === "full"}<small class="transcript-fixture-provenance"
        >Recorded Delta session: Add configurable screen lock overlay · 30
        captured tools. Metadata, review comments, replies and queue are
        demonstrations.</small
      >{/if}
    {#if scenario === "full"}<SegmentedControl
        value={view}
        options={["document", "classic"]}
        labels={{ document: "Document", classic: "Classic" }}
        ariaLabel="Conversation view"
        onChange={(next) => {
          if (next === "document" || next === "classic") view = next;
        }}
      />{/if}
    <Button variant="outline" onclick={stream}>Stream update</Button><Button
      variant="outline"
      onclick={prepend}>Prepend history</Button
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
        {reactions}
        markdown={{ extensions: [promptElementsExtension] }}
        onInspectTool={(tool, opener) => {
          inspectedTool = tool;
          inspectorOpener = opener;
          inspectorShown = true;
        }}
        onReact={react}
        customEmojis={[customEmoji]}
        reactionEmojis={scenario === "reactions"
          ? [
              { emoji: "👍", name: "thumbs up" },
              { emoji: ":spark:", name: "Project spark" },
            ]
          : undefined}
        authorPopover={{
          description: (member) =>
            member.id === "you" || member.name === "You"
              ? "Project maintainer · Available"
              : "Assistant · Host-supplied model",
          actions: (member) => [
            {
              id: "profile",
              label: "View profile",
              onSelect: () => {
                result = `Profile: ${member.name}`;
              },
            },
            {
              id: "message",
              label: "Message",
              onSelect: () => {
                result = `Message: ${member.name}`;
              },
            },
          ],
        }}
        {view}
        onOpenThread={(item) => {
          result = `Open replies for ${item.label}`;
        }}
        loading={scenario === "loading"}
        history={scenario === "retry" ? "retry" : undefined}
        onLoadHistory={prepend}
      >
        {#snippet queuedMessages()}<MessageQueue
            entries={queued}
            onCancel={(entry, recipient) => {
              queued = queued.map((item) =>
                item.id === entry.id
                  ? {
                      ...item,
                      recipients: item.recipients.map((r) =>
                        r.id === recipient.id ? { ...r, cancelling: true } : r,
                      ),
                    }
                  : item,
              );
              result = "Cancellation requested; awaiting host confirmation";
            }}
            onReview={() => {
              result = "Status review requested; delivery remains unknown";
            }}
          />{/snippet}
        {#snippet footer()}<TranscriptFooter
            state={controller}
            {busy}
            {stopping}
            onStop={() => {
              if (scenario === "full") {
                busy = false;
                stopping = false;
                result = "Agent stopped";
                return;
              }
              stopping = true;
              result = "Stop requested; awaiting host confirmation";
            }}
          >
            {#snippet actions()}{@render inputActions?.()}<Button
                variant="ghost"
                size="icon-sm"
                aria-label="Attach context"
                onclick={() => {
                  result = "Host context action requested";
                }}><PaperclipIcon /></Button
              >{/snippet}
            {#snippet controls()}
              {#each [{ id: "agent", label: agentLabel, icon: BotIcon, options: ["Assistant", "Reviewer"] }, { id: "thinking", label: thinking, icon: LightbulbIcon, options: ["Standard thinking", "Detailed thinking"] }, { id: "model", label: model, icon: CpuIcon, options: ["Balanced model", "Fast model"] }] as menu (menu.id)}
                <DropdownMenu.Root
                  ><DropdownMenu.Trigger
                    >{#snippet child({ props })}<Button
                        {...props}
                        variant="ghost"
                        size="sm"
                        aria-label={`Choose ${menu.id}`}
                        class="transcript-fixture-choice"
                        ><menu.icon /><span>{menu.label}</span></Button
                      >{/snippet}</DropdownMenu.Trigger
                  >
                  <DropdownMenu.Content
                    ><DropdownMenu.Group
                      >{#each menu.options as option}<DropdownMenu.Item
                          onSelect={() => {
                            if (menu.id === "agent") agentLabel = option;
                            else if (menu.id === "thinking") thinking = option;
                            else model = option;
                          }}>{option}</DropdownMenu.Item
                        >{/each}</DropdownMenu.Group
                    ></DropdownMenu.Content
                  >
                </DropdownMenu.Root>
              {/each}
            {/snippet}
          </TranscriptFooter>{/snippet}
        {#snippet composer(currentView)}<MarkdownComposer
            bind:value={controller.message}
            dockActions
            bind:documentActions={inputActions}
            submitOnEnter={false}
            presentation={currentView === "document" ? "document" : "framed"}
            showSendButton={false}
            disabled={controller.sending || !!controller.retainedSubmission}
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
      {#if inspectedTool}<Button variant="ghost" onclick={closeInspector}
          >Close source inspector</Button
        >{/if}
      <ScrollArea style="height:100%"
        >{#if inspectedTool}<TranscriptToolContent
            blocks={controller.rawTools[inspectedTool.id]
              ? [
                  {
                    id: `${inspectedTool.id}/raw`,
                    revision: inspectedTool.revision,
                    kind: "code",
                    label: `Raw captured data for ${inspectedTool.title}`,
                    text: inspectedTool.raw,
                    path: "tool.json",
                  },
                ]
              : inspectedTool.blocks}
            state={controller}
          />{:else}<TranscriptContent
            blocks={[{ ...prose, kind: "custom" }]}
            state={controller}
          />{/if}</ScrollArea
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
  .transcript-fixture-provenance {
    flex-basis: 100%;
    color: var(--muted-foreground);
    font-size: 0.75rem;
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
  @container transcript-footer (max-width: 24rem) {
    :global(.transcript-fixture-choice span) {
      display: none;
    }
  }
  output {
    font-size: 0.875rem;
    align-self: center;
  }
</style>
