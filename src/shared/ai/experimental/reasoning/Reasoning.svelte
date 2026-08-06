<script lang="ts">
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import CircleDashedIcon from "@lucide/svelte/icons/circle-dashed";
  import * as Collapsible from "@lapismd/design-core/shadcn/collapsible";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import "../../chat.css";

  let {
    ref = $bindable(null),
    children,
    preview,
    label = "Thinking",
    duration,
    streaming = false,
    defaultExpanded = false,
    expanded = $bindable(defaultExpanded),
    onExpandedChange = () => {},
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    children: Snippet;
    /** Plain-text summary shown on the collapsed row. */
    preview?: string;
    label?: string;
    duration?: string;
    streaming?: boolean;
    defaultExpanded?: boolean;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
  } = $props();

  function setExpanded(open: boolean): void {
    expanded = open;
    onExpandedChange(open);
  }
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-reasoning"
  data-ui-part="root"
  data-expanded={expanded}
  data-streaming={streaming}
  aria-busy={streaming}
>
  <Collapsible.Root open={expanded} onOpenChange={setExpanded}>
    <Collapsible.Trigger data-ai-chat-part="reasoning-trigger">
      <CircleDashedIcon data-ui-part="reasoning-icon" aria-hidden="true" />
      <span data-ui-part="reasoning-row">
        <span data-ui-part="reasoning-label">{label}</span>
        {#if duration && !streaming}
          <span data-ui-part="reasoning-separator" aria-hidden="true">·</span>
          <span data-ui-part="reasoning-duration">{duration}</span>
        {/if}
        {#if preview && !expanded && !streaming}
          <span data-ui-part="reasoning-separator" aria-hidden="true">—</span>
          <span data-ui-part="reasoning-preview">{preview}</span>
        {/if}
      </span>
      <ChevronDownIcon data-ui-part="reasoning-chevron" aria-hidden="true" />
    </Collapsible.Trigger>
    <Collapsible.Content data-ai-chat-part="reasoning-content">
      <div data-ui-part="reasoning-content-inner">
        {@render children()}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
