<script lang="ts">
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import * as Collapsible from "@stevejuma/ui/shadcn/collapsible";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import "./chat.css";

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

  function setOpen(open: boolean): void {
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
  <Collapsible.Root open={!collapsed} onOpenChange={setOpen}>
    <Collapsible.Trigger
      data-ai-chat-part="drawer-trigger"
      aria-label={`${collapsed ? "Expand" : "Collapse"} ${label}`}
    >
      <span>{label}</span>
      {#if count != null}
        <Badge variant="secondary">{count}</Badge>
      {/if}
      <ChevronDownIcon aria-hidden="true" />
    </Collapsible.Trigger>
    <Collapsible.Content data-ai-chat-part="drawer-content">
      {@render children()}
    </Collapsible.Content>
  </Collapsible.Root>
</div>
