<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Calendar from "@lucide/svelte/icons/calendar";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import Landmark from "@lucide/svelte/icons/landmark";
  import List from "@lucide/svelte/icons/list";
  import WorkspaceTreeNavigation, {
    type WorkspaceTreeNavigationItem,
  } from "./WorkspaceTreeNavigation.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Navigation/Workspace Tree Navigation",
    component: WorkspaceTreeNavigation,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled nested navigation for a workspace sidebar. Map application-owned folders, files, tags, or nested pages to display-ready items; retain search, routes, persistence, and domain filtering in the app adapter. Pair it with [App Shell](?path=/docs/apps-beancount-layout-app-shell--docs) and the sidebar resize rail rather than recreating tree-row styling locally.",
        },
      },
    },
  });

  const items = [
    {
      id: "household",
      label: "Northstar household",
      icon: Landmark,
      badge: "2026",
      children: [
        { id: "household-overview", label: "Overview", icon: FolderOpen },
        {
          id: "household-transactions",
          label: "Transactions",
          icon: List,
          badge: "3",
        },
        { id: "household-reports", label: "Reports", icon: Calendar },
      ],
    },
    {
      id: "archive",
      label: "Archived ledgers",
      icon: Landmark,
      badge: "2",
      children: [
        {
          id: "archive-2025",
          label: "Northstar 2025",
          icon: Landmark,
          children: [
            {
              id: "archive-2025-overview",
              label: "Overview",
              icon: FolderOpen,
            },
            { id: "archive-2025-reports", label: "Reports", icon: Calendar },
          ],
        },
      ],
    },
  ] satisfies WorkspaceTreeNavigationItem[];
</script>

<script lang="ts">
  let expandedIds = $state(["household"]);
  let activeId = $state("household-transactions");
  let expandAllIds = $state<string[]>([]);
</script>

<Story
  name="Selects a nested workspace view"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Northstar household" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Expand Northstar household" }),
    ).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Northstar household" }),
    );
    const reports = canvas.getByRole("button", { name: "Reports" });
    await userEvent.click(reports);
    await expect(reports).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("status")).toHaveTextContent("Reports");
  }}
>
  {#snippet template()}
    <div
      class="border-sidebar-border bg-sidebar text-sidebar-foreground w-72 rounded-lg border py-3"
    >
      <WorkspaceTreeNavigation
        {items}
        {expandedIds}
        {activeId}
        onExpandedIdsChange={(value) => {
          expandedIds = value;
        }}
        onSelect={(id) => {
          activeId = id;
        }}
      />
      <output class="sr-only" aria-live="polite">
        {items
          .flatMap((item) => [item, ...(item.children ?? [])])
          .find((item) => item.id === activeId)?.label}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Expands and collapses every branch"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand all navigation items" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Collapse Northstar 2025" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      canvas.getByRole("button", { name: "Collapse all navigation items" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      class="border-sidebar-border bg-sidebar text-sidebar-foreground w-72 rounded-lg border py-3"
    >
      <WorkspaceTreeNavigation
        {items}
        expandedIds={expandAllIds}
        activeId="household-overview"
        onExpandedIdsChange={(value) => {
          expandAllIds = value;
        }}
        onSelect={() => {}}
      />
    </div>
  {/snippet}
</Story>

<Story name="Explains an empty workspace">
  {#snippet template()}
    <div
      class="border-sidebar-border bg-sidebar text-sidebar-foreground w-72 rounded-lg border py-3"
    >
      <WorkspaceTreeNavigation
        items={[]}
        emptyLabel="No ledgers match the current filter."
        onSelect={() => {}}
      />
    </div>
  {/snippet}
</Story>
