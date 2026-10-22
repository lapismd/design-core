<script lang="ts">
  import HeartIcon from "@lucide/svelte/icons/heart";
  import { Button } from "../../shadcn/button/index.js";
  import Transcript from "./Transcript.svelte";
  import { TranscriptController } from "./comments.svelte.js";
  import type { TranscriptItem, TranscriptTool } from "./model.js";
  let view = $state<"document" | "classic">("document");
  const tool = (
    id: string,
    status: TranscriptTool["status"],
    icon?: TranscriptTool["icon"],
  ): TranscriptItem => ({
    id,
    kind: "tools",
    label: id,
    defaultExpanded: true,
    blocks: [],
    tools: [
      {
        id,
        revision: "1",
        title: id,
        path: "src/main.ts",
        status,
        raw: "{}",
        icon,
        blocks:
          id === "Read source"
            ? [
                {
                  id: "code",
                  revision: "1",
                  kind: "code",
                  label: "src/main.ts",
                  path: "src/main.ts",
                  text: "const answer = 42;",
                },
                {
                  id: "config",
                  revision: "1",
                  kind: "code",
                  label: "config/package.json",
                  path: "config/package.json",
                  text: '{"name":"notes"}',
                },
              ]
            : [],
      },
    ],
  });
  const items: TranscriptItem[] = [
    {
      id: "attachment",
      kind: "message",
      label: "Captured note",
      role: "assistant",
      blocks: [
        {
          id: "note",
          revision: "1",
          kind: "code",
          label: "Notes/plan.md",
          path: "Notes/plan.md",
          text: "A captured note",
        },
      ],
    },
    tool("Read source", "complete"),
    tool("Explicit host icon", "complete", HeartIcon),
    tool("Failed read", "error"),
    tool("Running read", "running"),
  ];
  const controller = new TranscriptController(() => ({ items }));
</script>

<div style="padding:1rem">
  <Button onclick={() => (view = "document")}>Document</Button><Button
    onclick={() => (view = "classic")}>Classic</Button
  >
  <div style="height:36rem">
    <Transcript {items} {view} commentState={controller} />
  </div>
</div>
