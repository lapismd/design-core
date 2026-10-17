<script lang="ts">
  import MarkdownComposer from "./MarkdownComposer.svelte";
  import type { MarkdownComposerTrigger } from "./composer-suggestions.js";
  let { slow = false }: { slow?: boolean } = $props();
  let shown = $state(true),
    requests = $state(0),
    aborts = $state(0);
  let value = $state(""),
    sent = $state("");
  const triggers: MarkdownComposerTrigger[] = [
    {
      character: "@",
      menuLabel: "People",
      searchSource: async (query, signal) => {
        requests++;
        signal.addEventListener("abort", () => aborts++, { once: true });
        if (slow)
          await new Promise((resolve) =>
            setTimeout(resolve, query === "a" ? 200 : 10),
          );
        if (signal.aborted) return [];
        return [
          {
            id: "alex",
            label: "Alex Morgan",
            description: "Designer",
            avatar: { id: "alex", name: "Alex Morgan" },
          },
          {
            id: "lee",
            label: "Lee Taylor",
            description: "Engineer",
            avatar: {
              id: "lee",
              name: "Lee Taylor",
              shape: "rounded" as const,
            },
          },
        ].filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
      },
      onSelect: (item) => `@${item.label} `,
    },
    {
      character: "/",
      menuLabel: "Commands",
      searchSource: (query) =>
        [
          {
            id: "summary",
            label: "Summarize",
            description: "Insert a request",
          },
        ].filter((i) => i.label.toLowerCase().includes(query.toLowerCase())),
      onSelect: () => "Please summarize this discussion. ",
    },
  ];
</script>

<button type="button" onclick={() => (shown = !shown)}>Toggle composer</button>
<p data-testid="suggestion-requests">{requests}</p>
<p data-testid="suggestion-aborts">{aborts}</p>
<div style="max-width:34rem">
  {#if shown}
    <MarkdownComposer
      bind:value
      {triggers}
      onSubmit={(text) => (sent = text)}
    />
  {/if}
</div>
<p data-testid="suggestion-value">{value}</p>
<p data-testid="suggestion-sent">{sent}</p>
