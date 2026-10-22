<script lang="ts">
  import Transcript from "./Transcript.svelte";
  import type { TranscriptItem } from "./model.js";
  const items: TranscriptItem[] = [
    {
      id: "neutral",
      kind: "context",
      label: "Captured context",
      blocks: [
        {
          id: "context",
          revision: "1",
          kind: "markdown",
          label: "Context",
          text: "Retained host context.",
        },
      ],
    },
    {
      id: "denied",
      kind: "context",
      label: "Permission denied: Read notes",
      tone: "destructive",
      blocks: [
        {
          id: "request",
          revision: "1",
          kind: "markdown",
          label: "Request",
          text: "Captured permission outcome.",
        },
      ],
    },
  ];
</script>

<div style="height:28rem;padding:1rem"><Transcript {items} /></div>
