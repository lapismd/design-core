<script lang="ts">
  import { Badge } from "../badge/index.js";
  import { Button } from "../button/index.js";
  import * as Tooltip from "../tooltip/index.js";
  import type { TagListItem } from "./tag-list.types.js";

  let {
    tag,
    mode = "inline",
    minimum = false,
    width,
    onActivate,
  }: {
    tag: TagListItem;
    mode?: "inline" | "popup" | "measure";
    minimum?: boolean;
    width?: number;
    onActivate?: (tag: TagListItem, event: MouseEvent) => void;
  } = $props();
  let text = $state<HTMLSpanElement | null>(null);
  let truncated = $state(false);
  const showTooltip = $derived(
    mode === "inline" && (!!tag.tooltip || truncated),
  );

  $effect(() => {
    const element = text;
    tag.label;
    if (!element || mode !== "inline") return;
    const measure = () => {
      truncated = element.scrollWidth > element.clientWidth + 0.5;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  });

  function activate(event: MouseEvent, props: Record<string, unknown>): void {
    if (typeof props.onclick === "function") props.onclick(event);
    if (tag.disabled) {
      event.preventDefault();
      return;
    }
    onActivate?.(tag, event);
  }
</script>

{#snippet content()}
  {#if tag.icon}<tag.icon aria-hidden="true" data-icon="inline-start" />{/if}
  <span bind:this={text} data-ui-part="tag-label"
    >{minimum ? "…" : tag.label}</span
  >
{/snippet}

{#snippet chip(props: Record<string, unknown> = {})}
  {#if tag.onClick}
    <Button
      {...props}
      type="button"
      variant={tag.variant ?? "outline"}
      size="sm"
      class="ui-tag-list__tag"
      data-ui-part="tag"
      data-tag-id={mode === "measure" ? undefined : tag.id}
      data-tone={tag.tone ?? "neutral"}
      data-active={tag.active || undefined}
      aria-pressed={tag.active}
      aria-disabled={tag.disabled || undefined}
      disabled={mode === "measure"}
      onclick={(event) => activate(event, props)}>{@render content()}</Button
    >
  {:else}
    <Badge
      {...props}
      variant={tag.variant ?? "outline"}
      class="ui-tag-list__tag"
      data-ui-part="tag"
      data-tag-id={mode === "measure" ? undefined : tag.id}
      data-tone={tag.tone ?? "neutral"}
      data-active={tag.active || undefined}
      aria-disabled={tag.disabled || undefined}
      tabindex={showTooltip ? 0 : undefined}>{@render content()}</Badge
    >
  {/if}
{/snippet}

<span
  class="ui-tag-list__chip"
  data-ui-part="tag-shell"
  data-tag-measure={mode === "measure" ? tag.id : undefined}
  data-presentation={mode}
  style:inline-size={width === undefined ? undefined : `${width}px`}
>
  {#if mode === "inline"}
    <!-- Keep the trigger stable when resizing changes truncation. -->
    <Tooltip.Root disabled={!showTooltip}>
      <Tooltip.Trigger>
        {#snippet child({ props })}{@render chip(props)}{/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content role="tooltip">
        <span>{tag.label}</span>
        {#if tag.tooltip}<span class="ui-tag-list__description"
            >{tag.tooltip}</span
          >{/if}
      </Tooltip.Content>
    </Tooltip.Root>
  {:else}{@render chip()}{/if}
</span>
