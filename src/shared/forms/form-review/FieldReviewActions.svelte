<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";

  let {
    stale = false,
    onUndo,
    onKeep,
  }: {
    /** When true, the proposal is already superseded and Keep is hidden. */
    stale?: boolean;
    onUndo?: () => void;
    onKeep?: () => void;
  } = $props();
</script>

<div class="field-review-actions" data-ui-part="field-review-actions">
  <Button
    type="button"
    variant="outline"
    size="xs"
    class="field-review-actions__undo"
    onclick={onUndo}
  >
    Undo
  </Button>
  {#if !stale}
    <Button
      type="button"
      variant="outline"
      size="xs"
      class="field-review-actions__keep"
      onclick={onKeep}
    >
      Keep
    </Button>
  {/if}
</div>

<style>
  .field-review-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.25rem;
    border-bottom: 1px solid
      color-mix(in oklab, #16a34a 30%, var(--ui-form-border));
    padding-block: 0.3rem;
  }

  .field-review-actions :global(.field-review-actions__undo) {
    border-color: color-mix(
      in oklab,
      var(--destructive, rgb(220 38 38)) 35%,
      transparent
    );
    color: var(--destructive, rgb(220 38 38));
  }

  .field-review-actions :global(.field-review-actions__undo:hover) {
    background: color-mix(
      in oklab,
      var(--destructive, rgb(220 38 38)) 12%,
      transparent
    );
    color: var(--destructive, rgb(220 38 38));
  }

  .field-review-actions :global(.field-review-actions__keep) {
    border-color: color-mix(in oklab, #16a34a 35%, transparent);
    color: color-mix(in oklab, #16a34a 78%, var(--ui-form-foreground));
  }

  .field-review-actions :global(.field-review-actions__keep:hover) {
    background: color-mix(in oklab, #16a34a 14%, transparent);
    color: color-mix(in oklab, #16a34a 78%, var(--ui-form-foreground));
  }
</style>
