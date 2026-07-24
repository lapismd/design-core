<script lang="ts">
  import type { Snippet } from "svelte";
  import FileText from "@lucide/svelte/icons/file-text";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import Landmark from "@lucide/svelte/icons/landmark";
  import StudioWorkspaceShell from "../layout/StudioWorkspaceShell.svelte";
  import LedgerWorkspaceNavigation from "../navigation/LedgerWorkspaceNavigation.svelte";
  import type { WorkspaceTreeNavigationItem } from "../navigation/WorkspaceTreeNavigation.svelte";

  /**
   * Fixed 1280×900 frame matching Fava screen capture viewport for Visual Delta.
   */
  let {
    pageTitle,
    headerActions,
    children,
  }: {
    pageTitle: string;
    /** Optional controlled route actions rendered in the shared shell header. */
    headerActions?: Snippet;
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
    {headerActions}
  >
    {#snippet sidebarTabContent(tabId)}
      {#if tabId === "workspace"}
        <LedgerWorkspaceNavigation
          {ledgerItems}
          ledgerCount={5}
          {activeLedgerId}
          ledgerExpandedIds={["account-ledger"]}
          queryPicker={{
            label: "Query",
            value: "",
            placeholder: "Select query",
            options: [{ value: "", label: "Select query" }],
          }}
          accountPicker={{
            label: "Account",
            value: "",
            placeholder: "Select account",
            options: [{ value: "", label: "Select account" }],
          }}
          onLedgerSelect={() => {}}
          onLedgerExpandedIdsChange={() => {}}
          onViewChange={() => {}}
          onQueryChange={() => {}}
          onAccountChange={() => {}}
        />
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
    border: 1px solid var(--ui-beancount-border);
    background: var(--ui-beancount-surface);
  }
</style>
