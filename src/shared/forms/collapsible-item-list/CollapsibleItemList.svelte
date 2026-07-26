<script lang="ts">
  import "./CollapsibleItemList.css";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import type { Snippet } from "svelte";

  let {
    title,
    addLabel,
    count = 0,
    open = true,
    onToggle = () => {},
    onAdd = () => {},
    children,
  }: {
    title: string;
    addLabel: string;
    count?: number;
    open?: boolean;
    onToggle?: () => void;
    onAdd?: () => void;
    children?: Snippet;
  } = $props();
</script>

<section
  class="cv-form-item-list"
  data-ui-component="collapsible-item-list"
  data-ui-part="collapsible-item-list"
>
  <header>
    <button
      type="button"
      class="cv-form-item-list-toggle"
      aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
      aria-expanded={open}
      onclick={onToggle}
    >
      <ChevronDownIcon />
      <span>{title}</span>
    </button>
    <small>{count}</small>
  </header>

  {#if open}
    <div class="cv-form-item-list-body">
      <div class="cv-form-item-list-content">
        {@render children?.()}
      </div>
      <button type="button" class="cv-form-item-list-add" onclick={onAdd}>
        <PlusIcon />
        Add {addLabel}
      </button>
    </div>
  {/if}
</section>
