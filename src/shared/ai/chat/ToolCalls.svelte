<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import WrenchIcon from "@lucide/svelte/icons/wrench";
  import * as Collapsible from "@stevejuma/ui/shadcn/collapsible";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ToolCallItem, ToolCallStatus } from "./types.js";
  import "./chat.css";

  let {
    ref = $bindable(null),
    calls,
    label = "Tool calls",
    defaultExpanded = false,
    expanded = $bindable(defaultExpanded),
    onExpandedChange = () => {},
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    calls: ToolCallItem[];
    label?: string;
    defaultExpanded?: boolean;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
  } = $props();

  let detailOpen = $state<Record<string, boolean>>({});

  function callId(call: ToolCallItem, index: number): string {
    return call.id ?? `${call.name}-${index}`;
  }

  function statusLabel(status: ToolCallStatus = "pending"): string {
    return status === "pending"
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

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-tool-calls"
  data-ui-part="root"
  data-expanded={expanded}
>
  <Collapsible.Root open={expanded} onOpenChange={setExpanded}>
    <Collapsible.Trigger data-ai-chat-part="group-trigger">
      <span data-ui-part="group-icon">
        <WrenchIcon aria-hidden="true" />
      </span>
      <span>{label}</span>
      <Badge variant="secondary">{calls.length}</Badge>
      <ChevronDownIcon data-ui-part="chevron" aria-hidden="true" />
    </Collapsible.Trigger>
    <Collapsible.Content data-ai-chat-part="group-content">
      <ul data-ui-part="call-list">
        {#each calls as call, index (callId(call, index))}
          {@const id = callId(call, index)}
          {@const status = call.status ?? "pending"}
          <li data-ui-part="call" data-status={status}>
            <Collapsible.Root
              open={detailOpen[id] ?? false}
              onOpenChange={(open) => {
                detailOpen[id] = open;
              }}
            >
              <Collapsible.Trigger
                data-ai-chat-part="call-trigger"
                disabled={!call.detail}
                aria-label={call.detail
                  ? `${detailOpen[id] ? "Hide" : "Show"} details for ${call.name}`
                  : undefined}
              >
                <span
                  data-ui-part="call-status"
                  aria-label={statusLabel(status)}
                >
                  {#if status === "running"}
                    <Spinner />
                  {:else if status === "complete"}
                    <CheckIcon aria-hidden="true" />
                  {:else if status === "error"}
                    <CircleAlertIcon aria-hidden="true" />
                  {:else}
                    <ClockIcon aria-hidden="true" />
                  {/if}
                </span>
                <span data-ui-part="call-name">{call.name}</span>
                {#if call.target}
                  <span data-ui-part="call-target">{call.target}</span>
                {/if}
                {#if call.node}
                  <Badge variant="outline">{call.node}</Badge>
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
                  {@render call.stats(call)}
                {/if}
                {#if call.duration}
                  <span data-ui-part="duration">{call.duration}</span>
                {/if}
                {#if call.detail}
                  <ChevronDownIcon
                    data-ui-part="detail-chevron"
                    aria-hidden="true"
                  />
                {/if}
              </Collapsible.Trigger>
              {#if call.errorMessage}
                <p data-ui-part="error" role="alert">{call.errorMessage}</p>
              {/if}
              {#if call.detail}
                <Collapsible.Content data-ai-chat-part="call-detail">
                  {@render call.detail(call)}
                </Collapsible.Content>
              {/if}
            </Collapsible.Root>
          </li>
        {/each}
      </ul>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
