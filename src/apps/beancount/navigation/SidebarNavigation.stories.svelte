<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Calendar from "@lucide/svelte/icons/calendar";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import List from "@lucide/svelte/icons/list";
  import SidebarNavigation from "./SidebarNavigation.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Navigation/Sidebar Navigation",
    component: SidebarNavigation,
    parameters: {
      docs: {
        description: {
          component:
            "Router-independent sidebar navigation for [App Shell](?path=/docs/apps-beancount-layout-app-shell--docs). Give it controlled `activeHref` state and handle navigation in the parent; this keeps the shared component usable with each application's router.",
        },
      },
    },
  });

  const items = [
    { label: "Overview", href: "/overview", icon: FolderOpen },
    {
      label: "Transactions",
      href: "/transactions",
      icon: List,
      badge: "3",
    },
    { label: "Accounts", href: "/accounts", icon: Calendar },
  ];
</script>

<script lang="ts">
  let activeHref = $state("/overview");
</script>

<Story
  name="Changes the selected workspace view"
  play={async ({ canvas }) => {
    const accounts = canvas.getByRole("link", { name: "Accounts" });
    await userEvent.click(accounts);
    await expect(accounts).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("status")).toHaveTextContent("Accounts");
  }}
>
  {#snippet template()}
    <div
      class="border-sidebar-border bg-sidebar text-sidebar-foreground w-64 rounded-lg border py-3"
    >
      <SidebarNavigation
        {items}
        {activeHref}
        onNavigate={(href) => {
          activeHref = href;
        }}
      />
      <output class="sr-only" aria-live="polite">
        {items.find((item) => item.href === activeHref)?.label}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Shows a disabled destination">
  {#snippet template()}
    <div
      class="border-sidebar-border bg-sidebar text-sidebar-foreground w-64 rounded-lg border py-3"
    >
      <SidebarNavigation
        activeHref="/overview"
        items={[
          ...items,
          {
            label: "Reports",
            href: "/reports",
            icon: Calendar,
            disabled: true,
          },
        ]}
        onNavigate={() => {}}
      />
    </div>
  {/snippet}
</Story>
