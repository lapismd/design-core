<script lang="ts">
  import * as Collapsible from "@lapismd/design-core/shadcn/collapsible";
  import { Badge } from "@lapismd/design-core/shadcn/badge";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import "../chat.css";

  let {
    ref = $bindable(null),
    collapsed = $bindable(false),
    count,
    label = "Attached context",
    onCollapsedChange = () => {},
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    collapsed?: boolean;
    count?: number;
    label?: string;
    onCollapsedChange?: (collapsed: boolean) => void;
    children: Snippet;
  } = $props();

  const canCollapse = $derived(count != null);

  function setOpen(open: boolean): void {
    if (!canCollapse) return;
    collapsed = !open;
    onCollapsedChange(collapsed);
  }
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-composer-drawer"
  data-ui-part="root"
  data-collapsed={collapsed}
>
  <Collapsible.Root open={!canCollapse || !collapsed} onOpenChange={setOpen}>
    {#if canCollapse}
      <Collapsible.Trigger
        data-ai-chat-part="drawer-trigger"
        aria-label={`${collapsed ? "Expand" : "Collapse"} ${label}`}
      >
        {#if collapsed}
          <span data-ui-part="drawer-summary">
            <Badge variant="secondary">{count}</Badge>
            <span>{label}</span>
          </span>
        {:else}
          <span data-ui-part="drawer-handle" aria-hidden="true"></span>
        {/if}
      </Collapsible.Trigger>
    {/if}
    <Collapsible.Content data-ai-chat-part="drawer-content">
      {@render children()}
    </Collapsible.Content>
  </Collapsible.Root>
</div>
