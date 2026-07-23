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
  class="bc-dashboard-section"
  data-dashboard-section
>
  <button
    type="button"
    class="bc-dashboard-section__trigger"
    aria-controls={id}
    aria-expanded={open}
    onclick={toggle}
  >
    <span>
      {#if eyebrow}
        <span
          class="bc-dashboard-section__eyebrow"
        >
          {eyebrow}
        </span>
      {/if}
      <span class="bc-dashboard-section__title">{title}</span>
    </span>
    <ChevronDown
      class={open
        ? "bc-dashboard-section__icon"
        : "bc-dashboard-section__icon bc-dashboard-section__icon--closed"}
      aria-hidden="true"
    />
  </button>
  {#if open}
    <div {id} class="bc-dashboard-section__body">
      {@render children?.()}
    </div>
  {/if}
</section>

<style>
  .bc-dashboard-section { overflow:hidden; border:1px solid color-mix(in srgb, var(--ui-beancount-border) 80%, transparent); border-radius:var(--ui-beancount-radius-panel); background:var(--ui-beancount-surface); box-shadow:var(--ui-beancount-shadow-panel); }
  .bc-dashboard-section__trigger { display:flex; width:100%; align-items:center; justify-content:space-between; gap:var(--ui-beancount-space-4); padding:var(--ui-beancount-space-4) var(--ui-beancount-space-5); outline:none; text-align:left; transition:background-color 150ms ease; }
  .bc-dashboard-section__trigger:hover { background:color-mix(in srgb,var(--ui-beancount-surface-muted) 45%,transparent); }
  .bc-dashboard-section__trigger:focus-visible { outline:2px solid var(--ui-beancount-focus-ring); outline-offset:-2px; }
  .bc-dashboard-section__eyebrow { display:block; margin-block-end:var(--ui-beancount-space-1); color:var(--ui-beancount-muted-foreground); font-size:.75rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; }
  .bc-dashboard-section__title { color:var(--ui-beancount-foreground); font-size:1rem; font-weight:600; }
  :global(.bc-dashboard-section__icon) { width:var(--ui-beancount-space-4); height:var(--ui-beancount-space-4); color:var(--ui-beancount-muted-foreground); transition:transform 150ms ease; }
  :global(.bc-dashboard-section__icon--closed) { transform:rotate(180deg); }
  .bc-dashboard-section__body { border-block-start:1px solid color-mix(in srgb,var(--ui-beancount-border) 80%,transparent); }
</style>
