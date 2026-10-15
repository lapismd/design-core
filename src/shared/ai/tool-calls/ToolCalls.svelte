<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
  import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
  import WrenchIcon from "@lucide/svelte/icons/wrench";
  import * as Collapsible from "@lapismd/design-core/shadcn/collapsible";
  import { Badge } from "@lapismd/design-core/shadcn/badge";
  import { Spinner } from "@lapismd/design-core/shadcn/spinner";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ToolCallItem, ToolCallStatus } from "../types.js";
  import RichToolCallDetail from "../tool-call-detail/RichToolCallDetail.svelte";
  import "../chat.css";

  let {
    ref = $bindable(null),
    calls,
    label = "Tool calls",
    defaultExpanded = false,
    expanded = $bindable(defaultExpanded),
    onExpandedChange = () => {},
    callWrapper,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    calls: ToolCallItem[];
    /** Surround each call without replacing its presentation or disclosure. */
    callWrapper?: Snippet<[ToolCallItem, Snippet]>;
    label?: string;
    defaultExpanded?: boolean;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
  } = $props();

  let detailOpen = $state<Record<string, boolean>>({});
  const hasMultipleCalls = $derived(calls.length > 1);
  const latestCall = $derived(calls.at(-1));
  const resolvedLabel = $derived(
    label === "Tool calls" ? `${calls.length} tool calls` : label,
  );

  function callId(call: ToolCallItem, index: number): string {
    return call.id ?? `${call.name}-${index}`;
  }

  function statusLabel(status: ToolCallStatus = "pending"): string {
    return status === "unknown"
      ? "Status unavailable"
      : status === "pending"
        ? "Pending"
        : status === "running"
          ? "Running"
          : status === "complete"
            ? "Complete"
            : "Error";
  }

  function setExpanded(open: boolean): void {
    expanded = open;
    onExpandedChange(open);
  }
</script>

{#snippet callStatus(status: ToolCallStatus)}
  <span data-ui-part="call-status" data-status={status}>
    {#if status === "unknown"}
      <CircleHelpIcon aria-hidden="true" />
    {:else if status === "running" || status === "pending"}
      <Spinner />
    {:else if status === "complete"}
      <span data-ui-part="status-circle" aria-hidden="true"></span>
      <CheckIcon aria-hidden="true" />
    {:else}
      <span data-ui-part="status-circle" aria-hidden="true"></span>
      <CircleAlertIcon aria-hidden="true" />
    {/if}
    <span class="sr-only">{statusLabel(status)}</span>
  </span>
{/snippet}

{#snippet callRow(call: ToolCallItem, index: number)}
  {@const id = callId(call, index)}
  {@const status = call.status ?? "pending"}
  {@const hasDetail = !!(call.detail || call.presentation)}
  {#snippet presentation()}
    <Collapsible.Root
      open={detailOpen[id] ?? false}
      onOpenChange={(open) => {
        detailOpen[id] = open;
      }}
    >
      <Collapsible.Trigger
        data-ai-chat-part="call-trigger"
        disabled={!hasDetail}
        aria-label={hasDetail
          ? `${detailOpen[id] ? "Hide" : "Show"} details for ${call.name}`
          : undefined}
      >
        {@render callStatus(status)}
        <span data-ui-part="call-name">{call.name}</span>
        {#if call.node}
          <Badge variant="outline">{call.node}</Badge>
        {/if}
        {#if call.target}
          <span data-ui-part="call-target">{call.target}</span>
        {/if}
        {#if call.additions != null || call.deletions != null}
          <span data-ui-part="diff-stats">
            {#if call.additions != null}
              <span data-kind="addition">+{call.additions}</span>
            {/if}
            {#if call.deletions != null}
              <span data-kind="deletion">−{call.deletions}</span>
            {/if}
          </span>
        {/if}
        {#if call.stats}
          <span data-ui-part="call-stats">{@render call.stats(call)}</span>
        {/if}
        {#if call.duration && status === "complete"}
          <span data-ui-part="duration">{call.duration}</span>
        {/if}
        {#if hasDetail}
          <ChevronRightIcon
            data-ui-part="detail-chevron"
            data-direction={detailOpen[id] ? "down" : "right"}
            style={`rotate: ${detailOpen[id] ? "90deg" : "0deg"}`}
            aria-hidden="true"
          />
        {/if}
      </Collapsible.Trigger>
      {#if call.errorMessage}
        <p data-ui-part="error" role="alert">{call.errorMessage}</p>
      {/if}
      {#if hasDetail}
        <Collapsible.Content data-ai-chat-part="call-detail">
          {#if call.detail}
            {@render call.detail(call)}
          {:else if call.presentation}
            <RichToolCallDetail toolName={call.name} {...call.presentation} />
          {/if}
        </Collapsible.Content>
      {/if}
    </Collapsible.Root>
  {/snippet}
  <li data-ui-part="call" data-status={status}>
    {#if callWrapper}
      {@render callWrapper(call, presentation)}
    {:else}
      {@render presentation()}
    {/if}
  </li>
{/snippet}

{#if calls.length > 0}
  <div
    bind:this={ref}
    {...restProps}
    data-ui-component="ai-chat-tool-calls"
    data-ui-part="root"
    data-expanded={expanded}
  >
    {#if !hasMultipleCalls}
      <ul data-ui-part="call-list" data-single-call>
        {@render callRow(calls[0]!, 0)}
      </ul>
    {:else}
      <Collapsible.Root open={expanded} onOpenChange={setExpanded}>
        <Collapsible.Trigger
          data-ai-chat-part="group-trigger"
          aria-label={`${expanded ? "Collapse" : "Expand"} ${resolvedLabel}`}
        >
          {#if expanded}
            <span data-ui-part="group-icon">
              <WrenchIcon aria-hidden="true" />
            </span>
            <span data-ui-part="group-label">{resolvedLabel}</span>
          {:else if latestCall}
            {@render callStatus(latestCall.status ?? "pending")}
            <span data-ui-part="call-name">{latestCall.name}</span>
            {#if latestCall.target}
              <span data-ui-part="call-target">{latestCall.target}</span>
            {/if}
            <span data-ui-part="call-count">
              <WrenchIcon aria-hidden="true" />
              {calls.length}
            </span>
          {/if}
          <ChevronRightIcon
            data-ui-part="chevron"
            data-direction={expanded ? "down" : "right"}
            style={`rotate: ${expanded ? "90deg" : "0deg"}`}
            aria-hidden="true"
          />
        </Collapsible.Trigger>
        <Collapsible.Content data-ai-chat-part="group-content">
          <ul data-ui-part="call-list">
            {#each calls as call, index (callId(call, index))}
              {@render callRow(call, index)}
            {/each}
          </ul>
        </Collapsible.Content>
      </Collapsible.Root>
    {/if}
  </div>
{/if}
