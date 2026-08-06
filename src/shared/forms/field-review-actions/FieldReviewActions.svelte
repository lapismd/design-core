<script lang="ts">
  import "./FieldReviewActions.css";
  import { Button } from "@lapismd/design-core/shadcn/button";

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

<div
  class="field-review-actions"
  data-ui-component="field-review-actions"
  data-ui-part="field-review-actions"
>
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
