<script lang="ts">
  import Transcript from "./Transcript.svelte";
  import { TranscriptController } from "./comments.svelte.js";
  import type { TranscriptItem } from "./model.js";
  import { Button } from "../../shadcn/button/index.js";
  import { untrack } from "svelte";

  let view = $state<"document" | "classic">("document");
  let {
    dynamic = false,
    custom = false,
  }: { dynamic?: boolean; custom?: boolean } = $props();
  const captured: TranscriptItem[] = [
    {
      id: "tool-group",
      kind: "tools",
      label: "Tool activity",
      blocks: [],
      tools: [
        {
          id: "read",
          revision: "1",
          title: "Read source",
          status: "complete",
          raw: "A captured file read",
          blocks: [
            {
              id: "read/body",
              revision: "1",
              kind: untrack(() => (custom ? "custom" : "code")),
              label: "Read result",
              text: "A captured file read",
            },
          ],
        },
        {
          id: "edit",
          revision: "1",
          title: "Update note",
          status: "complete",
          raw: "A captured note update",
          blocks: [
            {
              id: "edit/body",
              revision: "1",
              kind: "code",
              label: "Edit result",
              text: "A captured note update",
            },
          ],
        },
      ],
    },
  ];
  let items = $state(
    untrack(() =>
      dynamic
        ? captured.map((item) => ({ ...item, tools: item.tools?.slice(0, 1) }))
        : captured,
    ),
  );
  const controller = new TranscriptController(() => ({ items }));
</script>

<div style="height: 36rem">
  <Button onclick={() => (view = "document")}>Document</Button>
  <Button onclick={() => (view = "classic")}>Classic</Button>
  {#if dynamic}<Button onclick={() => (items = structuredClone(captured))}
      >Append captured tool</Button
    >{/if}
  <Transcript {items} {view} commentState={controller} />
</div>
