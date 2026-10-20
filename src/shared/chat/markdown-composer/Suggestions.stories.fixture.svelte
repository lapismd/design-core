<script lang="ts">
  import MarkdownComposer from "./MarkdownComposer.svelte";
  import type { MarkdownComposerTrigger } from "./composer-suggestions.js";
  let {
    slow = false,
    narrow = false,
    clipped = false,
  }: { slow?: boolean; narrow?: boolean; clipped?: boolean } = $props();
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
          {
            id: "help",
            label: "/help",
            description:
              "App · Show available commands grouped by App, Actions, Skills, and Current Agent.",
          },
        ].filter((i) => i.label.toLowerCase().includes(query.toLowerCase())),
      onSelect: (item) =>
        item.id === "help" ? "/help " : "Please summarize this discussion. ",
    },
  ];
</script>

<button type="button" onclick={() => (shown = !shown)}>Toggle composer</button>
<p data-testid="suggestion-requests">{requests}</p>
<p data-testid="suggestion-aborts">{aborts}</p>
<div class:clipped style:max-width={narrow ? "16rem" : "34rem"}>
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

<style>
  .clipped {
    margin-block-start: 12rem;
    height: 5rem;
    overflow: clip;
    transform: translateZ(0);
  }
</style>
