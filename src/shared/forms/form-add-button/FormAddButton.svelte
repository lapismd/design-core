<script lang="ts">
  import PlusIcon from "@lucide/svelte/icons/plus";

  let {
    label,
    onclick = () => {},
  }: {
    /** Domain-specific add label, e.g. "Add source". */
    label: string;
    onclick?: () => void;
  } = $props();
</script>

<button
  type="button"
  class="ui-form-add-button"
  data-ui-component="form-add-button"
  data-ui-part="form-add-button"
  {onclick}
>
  <PlusIcon aria-hidden="true" />
  {label}
</button>

<style>
  .ui-form-add-button {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    width: fit-content;
    border: 0;
    background: transparent;
    color: var(--ui-form-muted);
    cursor: pointer;
    font: inherit;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0;
    margin-top: 0.15rem;
  }

  .ui-form-add-button :global(svg) {
    width: 0.8rem;
    height: 0.8rem;
  }

  .ui-form-add-button:hover,
  .ui-form-add-button:focus-visible {
    color: var(--ui-form-foreground);
    outline: 0;
  }
</style>
