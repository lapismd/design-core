<script lang="ts">
  import * as Collapsible from "../../shadcn/collapsible/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import ChatDisclosureIcon from "./ChatDisclosureIcon.svelte";
  import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
  import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
  import WrenchIcon from "@lucide/svelte/icons/wrench";
  import ChatRawToggle from "./ChatRawToggle.svelte";
  import ChatCollapsedComments from "./ChatCollapsedComments.svelte";
  import ChatToolBlocks from "./ChatToolBlocks.svelte";
  import type {
    TranscriptItem,
    TranscriptTool,
    TranscriptProps,
  } from "./model.js";
  import { rawToolBlock } from "./tool-blocks.js";
  import type { TranscriptController } from "./comments.svelte.js";
  let {
    item,
    state,
    customBlock,
    onInspectTool,
  }: {
    item: TranscriptItem;
    state: TranscriptController;
    customBlock?: TranscriptProps["customBlock"];
    onInspectTool?: TranscriptProps["onInspectTool"];
  } = $props();
  const calls = $derived(item.tools ?? []);
  const componentId = $props.id();
  const statusId = (tool: TranscriptTool) =>
    `${componentId}-status-${encodeURIComponent(tool.id)}`;
  function expanded(id: string, fallback = false) {
    return state.disclosures[id] ?? fallback;
  }
  const statusLabel = (tool: TranscriptTool) =>
    ({
      complete: "Complete",
      error: "Error",
      running: "Running",
      unknown: "Status unavailable",
    })[tool.status];
  function toggleRaw(tool: TranscriptTool, opener: HTMLElement) {
    state.rawTools[tool.id] = !state.rawTools[tool.id];
    if (tool.detailPlacement === "sidebar" && onInspectTool)
      onInspectTool(tool, opener);
    else state.disclosures[tool.id] = true;
  }
</script>

{#snippet rawToggle(tool: TranscriptTool)}
  <ChatRawToggle
    raw={state.rawTools[tool.id] ?? false}
    label={`Show ${state.rawTools[tool.id] ? "rich" : "raw"} output for ${tool.title}`}
    onToggle={(opener) => toggleRaw(tool, opener)}
  />
{/snippet}

{#snippet call(tool: TranscriptTool)}
  {@const Icon = tool.icon ?? WrenchIcon}
  <div class="ui-transcript-tool-item">
    <span class="sr-only" id={statusId(tool)}>{statusLabel(tool)}</span>
    {#if tool.detailPlacement === "sidebar" && onInspectTool}
      <div class="ui-transcript-tool-heading">
        <Button
          variant="ghost"
          class="ui-transcript-tool-trigger"
          aria-label={`Show details for ${tool.title}`}
          aria-describedby={statusId(tool)}
          onclick={(event) => onInspectTool?.(tool, event.currentTarget)}
        >
          {#if tool.status === "error"}<CircleAlertIcon
              size={14}
            />{:else if tool.status === "running"}<LoaderCircleIcon
              size={14}
            />{:else}<Icon />{/if}<span>{tool.title}</span><ChatDisclosureIcon
          />
        </Button>
        {@render rawToggle(tool)}
      </div>
      <ChatCollapsedComments
        {state}
        blocks={[...tool.blocks, rawToolBlock(tool)]}
      />
    {:else}
      <Collapsible.Root
        open={expanded(tool.id, item.defaultExpanded && calls.length === 1)}
        onOpenChange={(open) => (state.disclosures[tool.id] = open)}
      >
        <div class="ui-transcript-tool-heading">
          <Collapsible.Trigger
            class="ui-transcript-tool-trigger"
            aria-label={`${expanded(tool.id, item.defaultExpanded && calls.length === 1) ? "Hide" : "Show"} details for ${tool.title}`}
            aria-describedby={statusId(tool)}
          >
            {#if tool.status === "error"}<CircleAlertIcon size={14} />
            {:else if tool.status === "running"}<LoaderCircleIcon size={14} />
            {:else}<Icon />{/if}
            <span>{tool.title}</span>
            <ChatDisclosureIcon />
          </Collapsible.Trigger>
          {@render rawToggle(tool)}
        </div>
        <Collapsible.Content
          class="ui-transcript-tool-detail"
          aria-label={tool.title}
        >
          {#if expanded(tool.id, item.defaultExpanded && calls.length === 1)}<ChatToolBlocks
              blocks={state.rawTools[tool.id]
                ? [rawToolBlock(tool)]
                : tool.blocks}
              {state}
              {customBlock}
            />
          {/if}
        </Collapsible.Content>
      </Collapsible.Root>
      {#if !expanded(tool.id, item.defaultExpanded && calls.length === 1)}
        <ChatCollapsedComments
          {state}
          blocks={[...tool.blocks, rawToolBlock(tool)]}
        />
      {:else}
        <ChatCollapsedComments
          {state}
          blocks={state.rawTools[tool.id] ? tool.blocks : [rawToolBlock(tool)]}
        />
      {/if}
    {/if}
  </div>
{/snippet}

{#if calls.length > 1}
  <Collapsible.Root
    open={expanded(item.id, item.defaultExpanded)}
    onOpenChange={(open) => (state.disclosures[item.id] = open)}
  >
    <Collapsible.Trigger
      class="ui-transcript-tool-trigger ui-transcript-tool-summary"
      aria-label={`${expanded(item.id, item.defaultExpanded) ? "Collapse" : "Expand"} ${item.label}`}
    >
      {@const Icon = item.icon ?? WrenchIcon}<Icon /><span>{item.label}</span
      ><ChatDisclosureIcon />
    </Collapsible.Trigger>
    <Collapsible.Content class="ui-transcript-tool-group-content"
      >{#if expanded(item.id, item.defaultExpanded)}{#each calls as tool (tool.id)}{@render call(
            tool,
          )}{/each}{/if}</Collapsible.Content
    >
  </Collapsible.Root>
  {#if !expanded(item.id, item.defaultExpanded)}<ChatCollapsedComments
      {state}
      blocks={calls.flatMap((t) => [...t.blocks, rawToolBlock(t)])}
    />{/if}
{:else if calls[0]}{@render call(calls[0])}{/if}

<style>
  .ui-transcript-tool-item {
    padding: 0;
  }
  :global(.ui-transcript-tool-summary) {
    margin: 0;
  }
  .ui-transcript-tool-heading {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  :global(.ui-transcript-tool-trigger) {
    display: flex;
    width: fit-content;
    max-width: 100%;
    flex: 0 1 auto;
    min-width: 0;
    height: auto;
    justify-content: flex-start;
    font-weight: 400;
    gap: 0.5rem;
    align-items: center;
    padding: 0;
    min-height: var(--ui-transcript-tool-row-height, 1.5rem);
    border: 0;
    border-radius: var(--radius);
    background: transparent;
    color: var(--muted-foreground);
    text-align: start;
    font-family: var(--font-sans, system-ui);
    font-size: var(--ui-transcript-tool-font-size, 0.8125rem);
    line-height: 1.5;
    cursor: pointer;
  }
  :global(.ui-transcript-tool-trigger:hover) {
    background: transparent;
    color: var(--foreground);
  }
  :global(.ui-transcript-tool-trigger:focus-visible) {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  :global(.ui-transcript-tool-trigger span:not(.sr-only)) {
    overflow-wrap: anywhere;
  }
  :global(.ui-transcript-tool-trigger svg) {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }
  :global(.ui-transcript-tool-detail) {
    padding-block-start: var(--ui-transcript-tool-row-gap, 0.25rem);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  :global(.ui-transcript-tool-group-content:not([hidden])) {
    display: grid;
    gap: var(--ui-transcript-tool-row-gap, 0.25rem);
    padding-block-start: var(--ui-transcript-tool-row-gap, 0.25rem);
  }
</style>
