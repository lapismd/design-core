<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import FileText from "@lucide/svelte/icons/file-text";
  import Folder from "@lucide/svelte/icons/folder";
  import LedgerWorkspaceNavigation from "./LedgerWorkspaceNavigation.svelte";
  import type { WorkspaceTreeNavigationItem } from "./WorkspaceTreeNavigation.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Navigation/Ledger Workspace Navigation",
    component: LedgerWorkspaceNavigation,
    parameters: {
      docs: {
        description: {
          component:
            "The controlled workspace navigation composition for a multi-ledger application. It owns the visual ledger, folder, and tag modes, search, disclosure controls, tag chips, and optional picker/tool layout. Applications map display-ready trees and picker options, then retain routing, data filtering, persistence, and resource actions. See [Layout guidance](?path=/docs/apps-beancount-layout-guidance--docs) for shell and sidebar composition.",
        },
      },
    },
  });

  const ledgerItems = [
    {
      id: "personal",
      label: "personal-2026.beancount",
      icon: FileText,
      children: [
        { id: "personal-overview", label: "Overview" },
        { id: "personal-journal", label: "Journal", badge: "3" },
        { id: "personal-accounts", label: "Accounts" },
      ],
    },
    {
      id: "shared",
      label: "shared-2026.beancount",
      icon: FileText,
      children: [
        { id: "shared-overview", label: "Overview" },
        { id: "shared-journal", label: "Journal" },
      ],
    },
  ] satisfies WorkspaceTreeNavigationItem[];

  const folderItems = [
    {
      id: "folder-ledgers",
      label: "ledgers",
      icon: Folder,
      badge: "2",
      children: ledgerItems,
    },
    {
      id: "folder-archive",
      label: "archive",
      icon: Folder,
      badge: "1",
      children: [
        {
          id: "archive-2025",
          label: "personal-2025.beancount",
          icon: FileText,
        },
      ],
    },
  ] satisfies WorkspaceTreeNavigationItem[];

  const tagItems = [
    {
      id: "home",
      label: "home",
      badge: "4",
      children: [
        { id: "home-groceries", label: "groceries", badge: "2" },
        { id: "home-utilities", label: "utilities", badge: "2" },
      ],
    },
    { id: "travel", label: "travel", badge: "3" },
  ] satisfies WorkspaceTreeNavigationItem[];

  const queryPicker = {
    label: "Query",
    value: "all",
    ariaLabel: "Select query",
    placeholder: "Filter queries...",
    options: [
      { value: "all", label: "Select query" },
      {
        value: "recent",
        label: "Recent expenses",
        description: "Last 30 days",
      },
      { value: "uncleared", label: "Uncleared entries" },
    ],
  };

  const accountPicker = {
    label: "Account",
    value: "all",
    ariaLabel: "Select account",
    placeholder: "Filter accounts...",
    options: [
      { value: "all", label: "Select account" },
      {
        value: "Assets:Cash",
        label: "Assets:Cash",
        accent: "oklch(56% 0.14 160)",
      },
      {
        value: "Expenses:Groceries",
        label: "Expenses:Groceries",
        accent: "oklch(70% 0.14 75)",
      },
    ],
  };
</script>

<script lang="ts">
  let view = $state<"ledgers" | "folders" | "tags">("ledgers");
  let tagsPresentation = $state<"tree" | "flat">("tree");
  let activeLedgerId = $state("personal-journal");
  let ledgerExpandedIds = $state(["personal"]);
  let folderExpandedIds = $state(["folder-ledgers", "personal"]);
  let tagExpandedIds = $state(["home"]);
  let selectedTagIds = $state<string[]>([]);
  let selectedQuery = $state("all");
  let selectedAccount = $state("all");
  let openedResource = $state("");
  let flatSelectedTagIds = $state(["home"]);
  let flatTagsPresentation = $state<"tree" | "flat">("flat");
</script>

<Story
  name="Filters trees and changes workspace destinations"
  play={async ({ canvas, canvasElement }) => {
    const ledgerSearch = canvas.getByRole("textbox", {
      name: "Search ledgers",
    });
    await userEvent.type(ledgerSearch, "shared");
    await expect(
      canvas.queryByRole("button", { name: /personal-2026/ }),
    ).not.toBeInTheDocument();
    await userEvent.clear(ledgerSearch);

    await userEvent.click(
      canvas.getByRole("button", { name: "Expand shared-2026.beancount" }),
    );
    const sharedJournal = canvas.getByRole("button", { name: "Journal" });
    await userEvent.click(sharedJournal);
    await expect(sharedJournal).toHaveAttribute("aria-current", "page");

    await userEvent.click(canvas.getByRole("button", { name: "Folders" }));
    await expect(
      canvas.getByRole("navigation", { name: "Ledger folders" }),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Tags" }));
    await userEvent.click(canvas.getByRole("button", { name: /^home/ }));
    await expect(canvas.getByRole("status")).toHaveTextContent("home");

    await userEvent.click(canvas.getByRole("button", { name: "Ledgers" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "Select account" }),
    );
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      page.getByRole("option", { name: /Expenses:Groceries/ }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Expenses:Groceries",
    );
  }}
>
  {#snippet template()}
    <div
      class="border-sidebar-border bg-sidebar text-sidebar-foreground flex h-[42rem] w-80 flex-col overflow-hidden rounded-xl border p-3 shadow-sm"
    >
      <LedgerWorkspaceNavigation
        {ledgerItems}
        {folderItems}
        {tagItems}
        {view}
        {tagsPresentation}
        {activeLedgerId}
        {ledgerExpandedIds}
        {folderExpandedIds}
        {tagExpandedIds}
        {selectedTagIds}
        queryPicker={{ ...queryPicker, value: selectedQuery }}
        accountPicker={{ ...accountPicker, value: selectedAccount }}
        resources={[
          {
            id: "receipt",
            label: "receipts/groceries.pdf",
          },
        ]}
        onViewChange={(nextView) => {
          view = nextView;
        }}
        onLedgerSelect={(id) => {
          activeLedgerId = id;
        }}
        onLedgerExpandedIdsChange={(ids) => {
          ledgerExpandedIds = ids;
        }}
        onFolderSelect={() => {}}
        onFolderExpandedIdsChange={(ids) => {
          folderExpandedIds = ids;
        }}
        onTagSelect={() => {}}
        onTagExpandedIdsChange={(ids) => {
          tagExpandedIds = ids;
        }}
        onSelectedTagIdsChange={(ids) => {
          selectedTagIds = ids;
        }}
        onTagsPresentationChange={(presentation) => {
          tagsPresentation = presentation;
        }}
        onQueryChange={(value) => {
          selectedQuery = value;
        }}
        onAccountChange={(value) => {
          selectedAccount = value;
        }}
        onResourceSelect={(id) => {
          openedResource = id;
        }}
      />
    </div>
    <output class="sr-only" aria-live="polite">
      Active destination: {activeLedgerId}. Tags: {selectedTagIds.join(", ") ||
        "none"}. Account: {selectedAccount}. Resource: {openedResource ||
        "none"}.
    </output>
  {/snippet}
</Story>

<Story
  name="Displays a flat selected tag filter"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /travel/ }));
    await expect(canvas.getByRole("status")).toHaveTextContent("home, travel");
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Showing flat tags. Switch to tag hierarchy.",
      }),
    );
    await expect(
      canvas.getByRole("navigation", { name: "Ledger tags" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      class="border-sidebar-border bg-sidebar text-sidebar-foreground flex h-[32rem] w-80 flex-col overflow-hidden rounded-xl border p-3 shadow-sm"
    >
      <LedgerWorkspaceNavigation
        {ledgerItems}
        {folderItems}
        {tagItems}
        view="tags"
        tagsPresentation={flatTagsPresentation}
        selectedTagIds={flatSelectedTagIds}
        onViewChange={() => {}}
        onTagSelect={() => {}}
        onTagExpandedIdsChange={() => {}}
        onSelectedTagIdsChange={(ids) => {
          flatSelectedTagIds = ids;
        }}
        onTagsPresentationChange={(presentation) => {
          flatTagsPresentation = presentation;
        }}
      />
    </div>
    <output class="sr-only" aria-live="polite"
      >{flatSelectedTagIds.join(", ") || "none"}</output
    >
  {/snippet}
</Story>
