<script lang="ts">
  import GripVerticalIcon from "@lucide/svelte/icons/grip-vertical";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";

  let {
    id,
    index,
    sortableGroup = null,
    dragging = false,
    compact = false,
    inset = "normal",
    removable = true,
    onDragStart,
    onRemove,
    children,
  }: {
    id: string;
    index: number;
    sortableGroup?: string | null;
    dragging?: boolean;
    compact?: boolean;
    /** `flush` keeps value text on the form control column (grip hangs in the gutter). */
    inset?: "normal" | "tight" | "flush";
    removable?: boolean;
    onDragStart?: (event: PointerEvent, index: number) => void;
    onRemove?: () => void;
    children?: Snippet;
  } = $props();
</script>

<div
  class={[
    "group/sortable relative grid grid-cols-[minmax(0,1fr)] border-b pr-6 transition-colors focus-within:bg-accent/40",
    compact ? "py-1" : "py-1.5",
    inset === "flush" ? "pl-0" : inset === "tight" ? "pl-3" : "pl-5",
    dragging ? "bg-accent opacity-70" : "",
  ]
    .filter(Boolean)
    .join(" ")}
  data-sortable-item
  data-sortable-index={index}
  data-sortable-id={id}
  data-sortable-group={sortableGroup}
>
  <button
    type="button"
    aria-label="Drag item"
    class={[
      "text-muted-foreground/70 hover:text-foreground focus-visible:ring-ring absolute top-1/2 grid size-4 shrink-0 -translate-y-1/2 cursor-grab place-items-center rounded-sm opacity-0 transition-opacity group-hover/sortable:opacity-100 group-focus-within/sortable:opacity-100 hover:bg-transparent focus-visible:opacity-100 focus-visible:ring-2 active:cursor-grabbing [&_svg]:size-3",
      inset === "flush" ? "-left-4" : "left-0",
    ]
      .filter(Boolean)
      .join(" ")}
    onpointerdown={(event) => onDragStart?.(event, index)}
  >
    <GripVerticalIcon class="size-3" />
  </button>

  <div class="min-w-0">
    {@render children?.()}
  </div>

  {#if removable}
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      class="text-muted-foreground/70 hover:text-foreground absolute top-1/2 right-0 size-5 -translate-y-1/2 rounded-sm opacity-0 transition-opacity group-hover/sortable:opacity-100 group-focus-within/sortable:opacity-100 hover:bg-transparent focus-visible:opacity-100 [&_svg]:size-3.5"
      aria-label="Remove item"
      onclick={onRemove}
    >
      <XIcon class="size-3.5" />
    </Button>
  {/if}
</div>
