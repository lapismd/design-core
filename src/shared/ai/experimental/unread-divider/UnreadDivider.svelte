<script lang="ts">
  import { Separator } from "@lapismd/design-core/shadcn/separator";
  import type { HTMLAttributes } from "svelte/elements";
  import "../../chat.css";

  let {
    ref = $bindable(null),
    label = "New",
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    label?: string;
  } = $props();
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-unread-divider"
  data-ui-part="root"
  role="separator"
  aria-label={`${label} messages below`}
>
  <Separator data-ai-chat-part="unread-line" />
  <span data-ui-part="unread-label">{label}</span>
</div>
