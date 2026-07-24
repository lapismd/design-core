<script lang="ts">
  import ChevronsDownUp from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import SaveIcon from "@lucide/svelte/icons/save";
  import { Button } from "@stevejuma/ui/shadcn/button";

  let {
    headersCollapsedAll = false,
    saveDisabled = false,
    saveBusy = false,
    onToggleHeadings = () => {},
    onSave = () => {},
  }: {
    /** Whether the host has collapsed every heading in the current ledger. */
    headersCollapsedAll?: boolean;
    /** Whether the host currently permits saving its editor content. */
    saveDisabled?: boolean;
    /** Controlled host-owned save request state. */
    saveBusy?: boolean;
    /** Requests that the host toggles every editor heading. */
    onToggleHeadings?: () => void;
    /** Requests that the host saves the editor's ledger content. */
    onSave?: () => void;
  } = $props();
</script>

<div class="bc-editor-toolbar" aria-label="Ledger editor actions">
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="bc-editor-toolbar__action"
    aria-label={headersCollapsedAll
      ? "Expand all headings"
      : "Collapse all headings"}
    onclick={onToggleHeadings}
  >
    {#if headersCollapsedAll}
      <ChevronsUpDown aria-hidden="true" />
    {:else}
      <ChevronsDownUp aria-hidden="true" />
    {/if}
  </Button>
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="bc-editor-toolbar__action"
    aria-label={saveBusy ? "Saving ledger" : "Save ledger"}
    disabled={saveDisabled || saveBusy}
    onclick={onSave}
  >
    <SaveIcon
      class="bc-editor-toolbar__save-icon"
      data-busy={saveBusy}
      aria-hidden="true"
    />
  </Button>
</div>

<style>
  .bc-editor-toolbar {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-1);
  }

  :global(.bc-editor-toolbar__action) {
    flex: none;
  }

  :global(.bc-editor-toolbar__save-icon[data-busy="true"]) {
    animation: bc-editor-toolbar-pulse 900ms ease-in-out infinite;
  }

  @keyframes bc-editor-toolbar-pulse {
    50% {
      opacity: 0.4;
      transform: scale(0.9);
    }
  }
</style>
