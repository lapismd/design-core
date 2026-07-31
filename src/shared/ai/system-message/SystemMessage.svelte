<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { Separator } from "@stevejuma/ui/shadcn/separator";
  import "../chat.css";

  let {
    ref = $bindable(null),
    variant = "default",
    icon,
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    variant?: "default" | "divider";
    icon?: Snippet;
    children: Snippet;
  } = $props();
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-system-message"
  data-ui-part="root"
  data-variant={variant}
  role="status"
>
  {#if variant === "divider"}
    <Separator />
  {/if}
  {#if icon}
    <span data-ui-part="icon">
      {@render icon()}
    </span>
  {/if}
  <span data-ui-part="content">
    {@render children()}
  </span>
  {#if variant === "divider"}
    <Separator />
  {/if}
</div>
