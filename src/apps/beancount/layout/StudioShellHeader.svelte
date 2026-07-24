<script lang="ts">
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import Settings from "@lucide/svelte/icons/settings";
  import { Button } from "@stevejuma/ui/shadcn/button";

  let {
    projectName = "No project",
    settingsOpen = false,
    showCloseSidebar = true,
    onOpenLedgerSettings = () => {},
    onCloseSidebar = () => {},
  }: {
    projectName?: string;
    /** Controlled by the application route or workspace state. */
    settingsOpen?: boolean;
    showCloseSidebar?: boolean;
    onOpenLedgerSettings?: () => void;
    onCloseSidebar?: () => void;
  } = $props();
</script>

<div class="bc-studio-shell-header">
  <div class="bc-studio-shell-header__brand" aria-hidden="true">B</div>
  <div class="bc-studio-shell-header__identity">
    <p class="bc-studio-shell-header__title">Beancount Studio</p>
    <p class="bc-studio-shell-header__project">{projectName}</p>
  </div>
  <Button
    type="button"
    variant="ghost"
    size="icon"
    class="bc-studio-shell-header__settings"
    aria-label="Ledger settings"
    title="Ledger settings"
    aria-pressed={settingsOpen}
    onclick={onOpenLedgerSettings}
  >
    <Settings aria-hidden="true" />
  </Button>
  {#if showCloseSidebar}
    <Button
      type="button"
      variant="ghost"
      size="icon"
      class="bc-studio-shell-header__close"
      aria-label="Close sidebar"
      title="Close sidebar"
      onclick={onCloseSidebar}
    >
      <ChevronLeft aria-hidden="true" />
    </Button>
  {/if}
</div>

<style>
  .bc-studio-shell-header {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  .bc-studio-shell-header__brand {
    display: grid;
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    flex: none;
    border-radius: var(--radius-md);
    background: var(--ui-beancount-accent);
    color: var(--ui-beancount-accent-foreground);
    font-weight: var(--font-weight-semibold);
    place-items: center;
  }

  .bc-studio-shell-header__identity {
    min-width: 0;
    flex: 1;
  }

  .bc-studio-shell-header__title,
  .bc-studio-shell-header__project {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bc-studio-shell-header__title {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
    line-height: 1.25;
  }

  .bc-studio-shell-header__project {
    margin: 0;
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
  }

  :global(.bc-studio-shell-header__settings),
  :global(.bc-studio-shell-header__close) {
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
  }

  :global(.bc-studio-shell-header__settings) {
    flex: none;
  }

  :global(.bc-studio-shell-header) {
    display: flex;
  }

  :global([data-collapsible="icon"] .bc-studio-shell-header) {
    display: none;
  }

  @media (min-width: 48rem) {
    :global(.bc-studio-shell-header__close) {
      display: none;
    }
  }
</style>
