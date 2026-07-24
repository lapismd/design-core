<script lang="ts">
  import Play from "@lucide/svelte/icons/play";
  import Plus from "@lucide/svelte/icons/plus";
  import { Button } from "@stevejuma/ui/shadcn/button";

  let {
    canApplyAll = false,
    applyBusy = false,
    onApplyAll = () => {},
    onAddRule = () => {},
  }: {
    /** Whether the host has at least one active rule it can apply. */
    canApplyAll?: boolean;
    /** Controlled host-owned busy state for applying rules. */
    applyBusy?: boolean;
    /** Requests host-owned execution of all active rules. */
    onApplyAll?: () => void;
    /** Requests that the host opens its new-rule workflow. */
    onAddRule?: () => void;
  } = $props();
</script>

<div class="bc-rules-toolbar" aria-label="Rule actions">
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="bc-rules-toolbar__action"
    aria-label={applyBusy ? "Applying all rules" : "Apply all"}
    disabled={!canApplyAll || applyBusy}
    onclick={onApplyAll}
  >
    <Play
      class="bc-rules-toolbar__apply-icon"
      data-busy={applyBusy}
      aria-hidden="true"
    />
  </Button>
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="bc-rules-toolbar__action"
    aria-label="Add rule"
    onclick={onAddRule}
  >
    <Plus aria-hidden="true" />
  </Button>
</div>

<style>
  .bc-rules-toolbar {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-1);
  }

  :global(.bc-rules-toolbar__action) {
    flex: none;
  }

  :global(.bc-rules-toolbar__apply-icon[data-busy="true"]) {
    animation: bc-rules-toolbar-pulse 900ms ease-in-out infinite;
  }

  @keyframes bc-rules-toolbar-pulse {
    50% {
      opacity: 0.4;
      transform: scale(0.9);
    }
  }
</style>
