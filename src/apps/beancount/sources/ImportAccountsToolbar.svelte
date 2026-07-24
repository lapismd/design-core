<script lang="ts">
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { Button } from "@stevejuma/ui/shadcn/button";

  let {
    syncAllLabel = "Sync all",
    syncAllDisabled = false,
    syncAllBusy = false,
    onSyncAll = () => {},
  }: {
    /** Label for a host-owned batch synchronization request. */
    syncAllLabel?: string;
    syncAllDisabled?: boolean;
    syncAllBusy?: boolean;
    onSyncAll?: () => void;
  } = $props();
</script>

<Button
  type="button"
  variant="outline"
  size="sm"
  disabled={syncAllDisabled || syncAllBusy}
  aria-label={syncAllBusy ? "Syncing all connections" : "Sync all connections"}
  onclick={onSyncAll}
>
  <RefreshCw class="bc-import-accounts-toolbar__icon" data-busy={syncAllBusy} />
  {syncAllBusy ? "Syncing…" : syncAllLabel}
</Button>

<style>
  :global(.bc-import-accounts-toolbar__icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
  }

  :global(.bc-import-accounts-toolbar__icon[data-busy="true"]) {
    animation: bc-import-accounts-toolbar-spin 900ms linear infinite;
  }

  @keyframes bc-import-accounts-toolbar-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
