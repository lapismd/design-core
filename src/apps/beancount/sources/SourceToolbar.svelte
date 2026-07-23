<script lang="ts">
  import FileText from "@lucide/svelte/icons/file-text";
  import Pencil from "@lucide/svelte/icons/pencil";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Switch } from "@stevejuma/ui/shadcn/switch";

  let {
    syncAllLabel = "Sync all",
    syncAllDisabled = false,
    yamlMode = false,
    onSyncAll = () => {},
    onYamlModeChange = () => {},
    onEditSources = () => {},
    onOpenSyncHistory = () => {},
  }: {
    /** Host-provided sync affordance label. */
    syncAllLabel?: string;
    /** The adapter decides whether at least one source is ready to sync. */
    syncAllDisabled?: boolean;
    /** Host-owned source configuration mode. */
    yamlMode?: boolean;
    /** Requests a host-owned sync of all configured sources. */
    onSyncAll?: () => void;
    /** Requests that the host changes source configuration mode. */
    onYamlModeChange?: (yamlMode: boolean) => void;
    /** Requests host-owned source configuration editing. */
    onEditSources?: () => void;
    /** Requests host-owned source sync history. */
    onOpenSyncHistory?: () => void;
  } = $props();
</script>

<div class="bc-source-toolbar" aria-label="Source actions">
  <Button
    variant="outline"
    size="sm"
    class="bc-source-toolbar__sync"
    disabled={syncAllDisabled}
    onclick={onSyncAll}
  >
    <RefreshCw data-icon="inline-start" aria-hidden="true" />
    {syncAllLabel}
  </Button>
  <label class="bc-source-toolbar__yaml">
    <Switch
      size="sm"
      checked={yamlMode}
      aria-label="Use YAML source configuration"
      onCheckedChange={onYamlModeChange}
    />
    <span>YAML</span>
  </label>
  <Button
    variant="ghost"
    size="icon-sm"
    aria-label="Edit sources"
    onclick={onEditSources}
  >
    <Pencil aria-hidden="true" />
  </Button>
  <Button
    variant="ghost"
    size="icon-sm"
    aria-label="Open source sync history"
    onclick={onOpenSyncHistory}
  >
    <FileText aria-hidden="true" />
  </Button>
</div>

<style>
  .bc-source-toolbar {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-source-toolbar__sync) {
    min-width: max-content;
  }

  .bc-source-toolbar__yaml {
    display: inline-flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    padding-inline: var(--ui-beancount-space-1);
    color: var(--ui-beancount-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .bc-source-toolbar {
      gap: var(--ui-beancount-space-1);
    }

    :global(.bc-source-toolbar__sync) {
      min-width: 0;
    }
  }
</style>
