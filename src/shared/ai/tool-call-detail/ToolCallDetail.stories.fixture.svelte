<script lang="ts">
  import { ToolCalls } from "@lapismd/design-core/chat";
  import RichToolCallDetail from "./RichToolCallDetail.svelte";
  import { examples, type ToolExample } from "./ToolCallDetail.stories.data.js";
  import type { ToolDetailTarget } from "./rich-tool-call-detail.types.js";

  let {
    scenario = "gallery",
  }: { scenario?: ToolExample | "gallery" | "grouped" } = $props();
  let lastOpen = $state("");
  const gallery = ["shell", "read", "edit", "search"] as const;
  const titles: Record<ToolExample, string> = {
    shell: "Shell command and output",
    failed: "Failed command",
    read: "Read a file",
    edit: "Edits and patches",
    search: "Search results",
    partial: "Incomplete capture",
    missingPath: "Missing file path",
    unavailable: "Unavailable output",
    generic: "Unrecognized tool",
  };

  function onOpen(target: ToolDetailTarget) {
    lastOpen = `${target.path}${target.line === undefined ? "" : `:${target.line}`}${target.column === undefined ? "" : `:${target.column}`}`;
  }
</script>

<div class="tool-review">
  {#if scenario === "grouped"}
    <ToolCalls
      defaultExpanded
      calls={gallery.map((key) => ({
        id: key,
        name: examples[key].toolName ?? key,
        status: "complete",
        presentation: {
          ...examples[key],
          onOpen,
        },
      }))}
    />
  {:else if scenario === "gallery"}
    <p class="tool-review__intro">
      Each tool uses the same Code / BookOpen view toggle. Maximize dense output
      to fill the page, then restore it inline. File actions stay with the host.
    </p>
    {#each gallery as key (key)}
      <section aria-label={`${titles[key]} example`}>
        <h2>{titles[key]}</h2>
        <RichToolCallDetail {...examples[key]} {onOpen} />
      </section>
    {/each}
  {:else}
    <RichToolCallDetail {...examples[scenario]} {onOpen} />
  {/if}
  <output aria-live="polite" class="tool-review__navigation"
    >{lastOpen ? `Host navigation requested: ${lastOpen}` : ""}</output
  >
</div>

<style>
  .tool-review {
    width: min(100%, 52rem);
    margin: 0 auto;
    padding: 1rem;
    display: grid;
    gap: 1.5rem;
  }
  .tool-review section {
    min-width: 0;
  }
  .tool-review h2 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    font-weight: 600;
  }
  .tool-review__intro,
  .tool-review__navigation {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }
</style>
