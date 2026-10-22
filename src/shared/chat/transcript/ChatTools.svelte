<script lang="ts">
  import * as Tooltip from "../../shadcn/tooltip/index.js";
  import * as Collapsible from "../../shadcn/collapsible/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import ChatDisclosureIcon from "./ChatDisclosureIcon.svelte";
  import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
  import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
  import WrenchIcon from "@lucide/svelte/icons/wrench";
  import { FileTypeIcon } from "../../shadcn/file-type-icon/index.js";
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
  <Tooltip.Provider delayDuration={200}>
    <Tooltip.Root disabled={!tool.path}>
      <div class="ui-transcript-tool-item">
        <span class="sr-only" id={statusId(tool)}>{statusLabel(tool)}</span>
        {#if tool.detailPlacement === "sidebar" && onInspectTool}
          <Collapsible.Root
            open={expanded(tool.id)}
            onOpenChange={(open) => (state.disclosures[tool.id] = open)}
          >
            <div class="ui-transcript-tool-heading">
              <Tooltip.Trigger>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    data-truncate={!!tool.path}
                    variant="ghost"
                    class="ui-transcript-tool-trigger"
                    aria-label={`Show details for ${tool.title}`}
                    aria-describedby={`${props["aria-describedby"] ?? ""} ${statusId(tool)}`}
                    onclick={(event) =>
                      onInspectTool?.(tool, event.currentTarget)}
                  >
                    {#if tool.status === "error"}<CircleAlertIcon
                        size={14}
                      />{:else if tool.status === "running"}<LoaderCircleIcon
                        size={14}
                      />{:else if tool.path && !tool.icon}<FileTypeIcon
                        path={tool.path}
                        size="s"
                      />{:else}<Icon />{/if}<span>{tool.title}</span
                    >{#if !tool.inlineBlocks?.length}<ChatDisclosureIcon />{/if}
                  </Button>
                {/snippet}
              </Tooltip.Trigger>
              {#if tool.inlineBlocks?.length}
                <Collapsible.Trigger
                  class="ui-transcript-tool-inline-trigger"
                  aria-label={`${expanded(tool.id) ? "Hide" : "Show"} contents for ${tool.title}`}
                  ><ChatDisclosureIcon /></Collapsible.Trigger
                >
              {/if}
              {@render rawToggle(tool)}
            </div>
            {#if tool.inlineBlocks?.length}
              <Collapsible.Content
                class="ui-transcript-tool-detail"
                role="group"
                aria-label={`Captured contents for ${tool.title}`}
              >
                {#if expanded(tool.id)}<ChatToolBlocks
                    blocks={tool.inlineBlocks}
                    {state}
                    {customBlock}
                  />{/if}
              </Collapsible.Content>
            {/if}
          </Collapsible.Root>
          {#if !tool.inlineBlocks?.length || !expanded(tool.id)}
            <ChatCollapsedComments
              {state}
              blocks={[...tool.blocks, rawToolBlock(tool)]}
            />
          {:else}<ChatCollapsedComments
              {state}
              blocks={[rawToolBlock(tool)]}
            />{/if}
        {:else}
          <Collapsible.Root
            open={expanded(tool.id, item.defaultExpanded && calls.length === 1)}
            onOpenChange={(open) => (state.disclosures[tool.id] = open)}
          >
            <div class="ui-transcript-tool-heading">
              <Tooltip.Trigger>
                {#snippet child({ props })}
                  <Collapsible.Trigger
                    {...props}
                    data-truncate={!!tool.path}
                    class="ui-transcript-tool-trigger"
                    aria-label={`${expanded(tool.id, item.defaultExpanded && calls.length === 1) ? "Hide" : "Show"} details for ${tool.title}`}
                    aria-describedby={`${props["aria-describedby"] ?? ""} ${statusId(tool)}`}
                  >
                    {#if tool.status === "error"}<CircleAlertIcon size={14} />
                    {:else if tool.status === "running"}<LoaderCircleIcon
                        size={14}
                      />
                    {:else if tool.path && !tool.icon}<FileTypeIcon
                        path={tool.path}
                        size="s"
                      />{:else}<Icon />{/if}
                    <span>{tool.title}</span>
                    <ChatDisclosureIcon />
                  </Collapsible.Trigger>
                {/snippet}
              </Tooltip.Trigger>
              {@render rawToggle(tool)}
            </div>
            <Collapsible.Content
              class="ui-transcript-tool-detail"
              role="group"
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
              blocks={state.rawTools[tool.id]
                ? tool.blocks
                : [rawToolBlock(tool)]}
            />
          {/if}
        {/if}
      </div>
      {#if tool.path}<Tooltip.Content
          role="tooltip"
          class="ui-transcript-tool-path-tooltip">{tool.path}</Tooltip.Content
        >{/if}
    </Tooltip.Root>
  </Tooltip.Provider>
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
  :global(.ui-transcript-tool-inline-trigger) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    min-width: var(--ui-transcript-tool-row-height, 1.5rem);
    min-height: var(--ui-transcript-tool-row-height, 1.5rem);
    padding: 0;
    border: 0;
    border-radius: var(--radius);
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }
  :global(.ui-transcript-tool-inline-trigger:hover) {
    background: var(--muted);
    color: var(--foreground);
  }
  :global(.ui-transcript-tool-inline-trigger:focus-visible) {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
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
    white-space: normal;
    font-family: var(--font-sans, system-ui);
    font-size: var(--ui-transcript-tool-font-size, 0.8125rem);
    line-height: 1.5;
    cursor: pointer;
  }
  :global(.ui-transcript-tool-trigger[data-truncate="true"]) {
    flex: 1 1 0%;
    width: 0;
  }
  :global(.ui-transcript-tool-trigger[data-truncate="true"] > span) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :global(.ui-transcript-tool-path-tooltip) {
    overflow-wrap: anywhere;
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
    min-width: 0;
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
