<script lang="ts">
  import ThreadPanel from "./ThreadPanel.svelte";
  import type {
    ThreadMessage,
    ThreadSubmission,
  } from "./thread-panel.types.js";
  let {
    reject = false,
    readOnly = false,
    narrow = false,
  }: { reject?: boolean; readOnly?: boolean; narrow?: boolean } = $props();
  const alex = { id: "alex", name: "Alex Morgan", initials: "AM" };
  const lee = {
    id: "lee",
    name: "Lee Taylor",
    initials: "LT",
    shape: "rounded" as const,
  };
  let messages = $state<ThreadMessage[]>([
    {
      id: "root",
      author: alex,
      content:
        "## Release review\n\nKeep the existing behaviour and review the **keyboard flow**.",
      createdAt: "2026-10-17T12:00:00Z",
    },
    {
      id: "reply-1",
      parentId: "root",
      author: lee,
      content:
        "The sidebar toggle is ready. The tooltip remains available on keyboard focus.",
      timestamp: "12:01",
      reactions: [{ emoji: "👍", count: 2 }],
    },
    {
      id: "nested",
      parentId: "reply-1",
      author: alex,
      content: "Thanks. Please retain the draft when switching layouts.",
      timestamp: "12:02",
    },
    {
      id: "reply-2",
      parentId: "root",
      author: lee,
      content: "The second pass covers narrow layouts and scrolling.",
      timestamp: "12:03",
    },
  ]);
  let value = $state(""),
    result = $state(""),
    history = $state<"idle" | "loading" | "retry" | undefined>("idle");
  async function submit(snapshot: ThreadSubmission) {
    result = `${snapshot.parentId}: ${snapshot.text}`;
    if (reject) throw new Error("Host rejected the reply; draft retained.");
    messages = [
      ...messages,
      {
        id: snapshot.id,
        parentId: snapshot.parentId,
        author: alex,
        content: snapshot.text,
        timestamp: "Now",
      },
    ];
    if (value === snapshot.text) value = "";
  }
</script>

<div style={`height:36rem;width:${narrow ? "320px" : "100%"};max-width:44rem;`}>
  <ThreadPanel
    rootId="root"
    {messages}
    bind:value
    {readOnly}
    {history}
    onLoadOlder={() => {
      history = "loading";
      setTimeout(() => {
        history = undefined;
      }, 30);
    }}
    onSubmit={submit}
    onReact={(message, emoji) => {
      result = `Reaction ${emoji} on ${message.id}`;
    }}
    authorActions={(author) => [
      {
        id: "profile",
        label: "View profile",
        onSelect: () => {
          result = `Profile ${author.name}`;
        },
      },
    ]}
  />
</div>
<p data-testid="thread-result">{result}</p>
