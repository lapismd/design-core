<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Transcript from "./Transcript.svelte";
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending", "!autodocs"],
  });
  const items = [
    {
      id: "task-list-review",
      kind: "message" as const,
      role: "assistant" as const,
      label: "Captured task list",
      blocks: [
        {
          id: "task-list-review/body",
          revision: "tasks-v1",
          kind: "markdown" as const,
          label: "Project checklist",
          text: `## Project checklist

- [x] Capture the current context
- [ ] Review the open questions
  - [ ] A longer task that wraps onto another line in a narrow transcript must keep its checkbox aligned with the start of the task text.
  - [X] Link the source notes
  - [ ] Record the next action

1. [x] Keep the first decision
2. [ ] Review the second decision

An inline \`[ ]\` stays literal.

\`\`\`markdown
- [x] This example is code, not a task control.
\`\`\``,
        },
      ],
    },
  ];
</script>

<script lang="ts">
  let inspected = $state(false);
</script>

<Story name="Captured Markdown task lists">
  {#snippet template()}<Transcript
      {items}
      canComment={false}
      reactionsDisabled
    />{/snippet}
</Story>

<Story name="Inspectable read with inline source">
  {#snippet template()}
    <Transcript
      items={[
        {
          id: "read-review",
          kind: "tools",
          label: "Read note",
          blocks: [],
          tools: [
            {
              id: "read-review/tool",
              revision: "v1",
              title: "Read project checklist",
              status: "complete",
              raw: "Captured request and response",
              detailPlacement: "sidebar",
              blocks: items[0]!.blocks,
              inlineBlocks: items[0]!.blocks.map((block) => ({
                ...block,
                kind: "code",
                path: "checklist.md",
              })),
            },
          ],
        },
      ]}
      canComment={false}
      reactionsDisabled
      onInspectTool={() => {
        inspected = true;
      }}
    />
    {#if inspected}<p>Host inspector requested by the title.</p>{/if}
  {/snippet}
</Story>
