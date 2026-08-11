<script lang="ts">
  import type { RegisteredFormRendererProps } from "./form-renderer-registry";

  let {
    value,
    field,
    update,
    blur = () => {},
  }: RegisteredFormRendererProps<"currency"> = $props();
</script>

<div class="ui-currency-story-control" data-testid="currency-control">
  <span aria-hidden="true">{field.currency}</span>
  <input
    type="number"
    aria-label={field.ariaLabel ?? field.label}
    {value}
    oninput={(event) => update(event.currentTarget.valueAsNumber)}
    onblur={blur}
  />
</div>

<style>
  .ui-currency-story-control {
    display: grid;
    min-width: 0;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 0.375rem;
  }
</style>
