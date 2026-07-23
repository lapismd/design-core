<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import type { Snippet } from "svelte";

  let {
    id,
    title,
    eyebrow,
    open = $bindable(true),
    children,
    onOpenChange = () => {},
  }: {
    id: string;
    title: string;
    eyebrow?: string;
    /** Controlled disclosure state; the parent may persist dashboard preferences. */
    open?: boolean;
    children?: Snippet;
    onOpenChange?: (open: boolean) => void;
  } = $props();

  function toggle() {
    open = !open;
    onOpenChange(open);
  }
</script>

<section
  class="border-border/80 bg-card overflow-hidden rounded-xl border shadow-sm"
  data-dashboard-section
>
  <button
    type="button"
    class="hover:bg-muted/45 focus-visible:ring-ring flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
    aria-controls={id}
    aria-expanded={open}
    onclick={toggle}
  >
    <span>
      {#if eyebrow}
        <span
          class="text-muted-foreground mb-1 block text-xs font-semibold tracking-[0.14em] uppercase"
        >
          {eyebrow}
        </span>
      {/if}
      <span class="text-foreground text-base font-semibold">{title}</span>
    </span>
    <ChevronDown
      class={`text-muted-foreground size-4 transition-transform ${!open ? "rotate-180" : ""}`}
      aria-hidden="true"
    />
  </button>
  {#if open}
    <div {id} class="border-border/80 border-t">
      {@render children?.()}
    </div>
  {/if}
</section>
