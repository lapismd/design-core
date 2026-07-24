<script lang="ts">
  import type { Snippet } from "svelte";
  import FileText from "@lucide/svelte/icons/file-text";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import Landmark from "@lucide/svelte/icons/landmark";
  import Sun from "@lucide/svelte/icons/sun";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import StudioWorkspaceShell from "../layout/StudioWorkspaceShell.svelte";
  import LedgerWorkspaceNavigation from "../navigation/LedgerWorkspaceNavigation.svelte";
  import type { WorkspaceTreeNavigationItem } from "../navigation/WorkspaceTreeNavigation.svelte";

  /**
   * Fixed 1280×900 frame matching Fava screen capture viewport for Visual Delta.
   */
  let {
    pageTitle,
    sidebarLedgerItems,
    sidebarLedgerCount,
    showLedgerTools = true,
    headerLeading,
    titleTrailing,
    headerActions,
    showThemeToggle = true,
    onThemeToggle = () => {},
    sidebarContent,
    children,
  }: {
    pageTitle: string;
    /** Optional reference-specific ledger fixture for the sidebar. */
    sidebarLedgerItems?: readonly WorkspaceTreeNavigationItem[];
    /** Optional display count paired with a reference-specific sidebar fixture. */
    sidebarLedgerCount?: number;
    /** Hides app-owned ledger tools for reference routes without a loaded ledger. */
    showLedgerTools?: boolean;
    /** Optional controlled route controls rendered beside the page title. */
    headerLeading?: Snippet;
    /** Optional controlled metadata rendered immediately after the page title. */
    titleTrailing?: Snippet;
    /** Optional controlled route actions rendered in the shared shell header. */
    headerActions?: Snippet;
    /** Whether this screen renders the host-owned Fava theme control. */
    showThemeToggle?: boolean;
    /** Requests that the host toggles its colour mode. */
    onThemeToggle?: () => void;
    /** Optional route-specific sidebar body, such as ledger settings navigation. */
    sidebarContent?: Snippet;
    children?: Snippet;
  } = $props();

  const projects = [
    { id: "studio", name: "beancount-js-studio", detail: "sample.beancount" },
  ];
  const sidebarTabs = [
    { id: "workspace", label: "Workspace", icon: FolderOpen },
  ];
  const ledgerItems = [
    { id: "test-ledger", label: "E2E Test Ledger", icon: FileText },
    { id: "account-ledger-top", label: "Account Ledger", icon: FileText },
    { id: "off-by-one", label: "off-by-one", icon: FileText },
    {
      id: "example-with-budgets",
      label: "Example with budgets",
      icon: FileText,
    },
    {
      id: "account-ledger",
      label: "Account Ledger",
      icon: FileText,
      children: [
        { id: "dashboard", label: "Dashboard", icon: FileText },
        { id: "editor", label: "Editor", icon: FileText },
        { id: "income-statement", label: "Income Statement", icon: Landmark },
        { id: "balance-sheet", label: "Balance Sheet", icon: Landmark },
        { id: "trial-balance", label: "Trial Balance", icon: Landmark },
        { id: "journal", label: "Journal", icon: FileText },
        { id: "holdings", label: "Holdings", icon: FileText },
        { id: "statistics", label: "Statistics", icon: FileText },
        { id: "query", label: "Query", icon: FileText },
      ],
    },
  ] satisfies WorkspaceTreeNavigationItem[];

  const activeLedgerId = $derived.by(() => {
    const pageIds: Record<string, string> = {
      Account: "account-ledger",
      Dashboard: "dashboard",
      Editor: "editor",
      // Fava's Errors route keeps its parent ledger selected; Query remains a
      // sibling workspace navigation item rather than the active route.
      Errors: "account-ledger",
      Holdings: "holdings",
      Journal: "journal",
      Query: "query",
      "Income Statement": "income-statement",
      "Balance Sheet": "balance-sheet",
      "Trial Balance": "trial-balance",
      Statistics: "statistics",
    };
    return pageIds[pageTitle] ?? "account-ledger";
  });
</script>

{#snippet screenHeaderActions()}
  {@render headerActions?.()}
  {#if showThemeToggle}
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      class="bc-screen-frame__theme-toggle"
      aria-label="Toggle theme"
      title="Toggle theme"
      onclick={onThemeToggle}
    >
      <Sun class="bc-screen-frame__theme-icon" aria-hidden="true" />
    </Button>
  {/if}
{/snippet}

<div
  class="bc-screen-frame"
  style="width: 1280px; height: 900px;"
  data-fava-screen-frame
>
  <StudioWorkspaceShell
    {pageTitle}
    height="container"
    projectName="beancount-js-studio"
    {projects}
    currentProjectId="studio"
    {sidebarTabs}
    activeSidebarTab="workspace"
    projectTabId="projects"
    {titleTrailing}
    {headerLeading}
    headerActions={screenHeaderActions}
  >
    {#snippet sidebarTabContent(tabId)}
      {#if tabId === "workspace"}
        {#if sidebarContent}
          {@render sidebarContent()}
        {:else}
          <LedgerWorkspaceNavigation
            ledgerItems={sidebarLedgerItems ?? ledgerItems}
            ledgerCount={sidebarLedgerCount ?? 5}
            {activeLedgerId}
            ledgerExpandedIds={["account-ledger"]}
            queryPicker={showLedgerTools
              ? {
                  label: "Query",
                  value: "",
                  placeholder: "Select query",
                  options: [{ value: "", label: "Select query" }],
                }
              : undefined}
            accountPicker={showLedgerTools
              ? {
                  label: "Account",
                  value: "",
                  placeholder: "Select account",
                  options: [{ value: "", label: "Select account" }],
                }
              : undefined}
            onLedgerSelect={() => {}}
            onLedgerExpandedIdsChange={() => {}}
            onViewChange={() => {}}
            onQueryChange={() => {}}
            onAccountChange={() => {}}
            onSearchOpenChange={() => {}}
          />
        {/if}
      {/if}
    {/snippet}
    {@render children?.()}
  </StudioWorkspaceShell>
</div>

<style>
  .bc-screen-frame {
    width: 1280px;
    height: 900px;
    overflow: hidden;
    background: var(--ui-beancount-surface);
  }

  :global(.bc-screen-frame__theme-toggle) {
    flex: none;
  }

  :global(.bc-screen-frame__theme-icon) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
  }
</style>
